(() => {
  const intro = document.querySelector('.intro');
  if (!window.gsap || !window.ScrollTrigger) {
    intro.classList.add('is-complete');
    return;
  }
  gsap.registerPlugin(ScrollTrigger);
  if(window.ScrollToPlugin) gsap.registerPlugin(ScrollToPlugin);
  const media = gsap.matchMedia();
  const button = document.querySelector('.motion-toggle');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const logo = document.querySelector('.logo-stage');
  const pool = document.querySelector('.pool-level');
  const band = document.querySelector('.slice-band');
  const sliceShadow=document.querySelector('.slice-shadow');
  const seek = new URLSearchParams(location.search).get('t');
  let paused = false;
  const clamp = v => Math.max(0, Math.min(1,v));
  const range = (t,a,b) => clamp((t-a)/(b-a));
  const mix = (a,b,p) => a+(b-a)*p;
  const cubic = p => 1-Math.pow(1-p,3);
  const quart = p => p<.5?8*p**4:1-(-2*p+2)**4/2;
  // Ownitt's CSS cubic-bezier(.77, 0, .175, 1), shared by draw and fill.
  const letteringEase = progress => {
    let low=0, high=1;
    for(let i=0;i<18;i++) {
      const t=(low+high)/2;
      const x=3*(1-t)**2*t*.77+3*(1-t)*t*t*.175+t**3;
      if(x<progress) low=t; else high=t;
    }
    const t=(low+high)/2;
    return 3*(1-t)*t*t+t**3;
  };
  // The NK fills upward before its beige diagonal expands.
  function drawIntro(t) {
    logo.style.opacity=1;
    logo.style.transform='none';
    const cut=range(t,2.4,3);
    const extend=quart(range(t,3,3.3));
    const expand=quart(range(t,3.3,4.9));
    const end=mix(mix(-2000,180,cut),2000,extend);
    band.setAttribute('height',Math.max(0,end+2000));
    // Size from the viewport so the small mobile logo still wipes every corner.
    const unitScale=logo.getBoundingClientRect().width/1000;
    const fullWidth=Math.hypot(innerWidth,innerHeight)*2/unitScale;
    const sliceScale=mix(1,fullWidth/26,expand);
    band.setAttribute('transform',`scale(${sliceScale} 1)`);
    // The fingertip follows the leading end of the cut; its wake stays
    // inside that same beige track and fades toward the older end.
    const trailLength=130;
    sliceShadow.setAttribute('y',end-trailLength);
    sliceShadow.setAttribute('height',trailLength);
    sliceShadow.style.opacity=range(end,-175,-130)*(1-range(end,100,240));
    band.style.fill='var(--page)';
    // A traveling wave forms the liquid surface, clipped inside the NK.
    // Slow, continuous rise keeps the flow visible; ripples settle at the top.
    const progress=range(t,1.1,2.2);
    const water=gsap.parseEase('sine.inOut')(progress);
    const level=mix(470,140,water);
    const amplitude=18*Math.sin(Math.PI*progress);
    const phase=(t-1.1)*7;
    const surface=x=>level+amplitude*Math.sin((x-310)/105+phase)
      +amplitude*.3*Math.sin((x-310)/57-phase*.7);
    let liquid=`M310 ${surface(310)}`;
    // Short quadratic segments keep the wave smooth and inexpensive.
    for(let x=310;x<790;x+=30) {
      const midpoint=x+15, end=x+30;
      const control=2*surface(midpoint)-(surface(x)+surface(end))/2;
      liquid+=` Q${midpoint} ${control} ${end} ${surface(end)}`;
    }
    pool.setAttribute('d',liquid+' L790 480 L310 480 Z');
  }
  function unlock() {
    intro.classList.add('is-complete');
    document.body.classList.remove('intro-playing');
    ScrollTrigger.refresh();
  }
  document.body.classList.add('intro-playing');
  if (!location.hash) window.scrollTo(0,0);
  const clock={time:0};
  const typingCharacters=gsap.utils.toArray('.typing-character');
  gsap.set(typingCharacters,{autoAlpha:0,y:4});
  const typingStart=4.55;
  const typingStep=.09;
  const characterDuration=.08;
  const typingEnd=typingStart+(typingCharacters.length-1)*typingStep+characterDuration;
  const frameStart=typingEnd+.15;
  const master=gsap.timeline({paused:true,onComplete:unlock});
  master.to(clock,{time:5.3,duration:5.3,ease:'none',onUpdate:()=>drawIntro(clock.time)},0)
    .fromTo('.logo-mark',{strokeDashoffset:1,fillOpacity:0},
      {strokeDashoffset:0,autoRound:false,duration:1.8,ease:letteringEase},0)
    .to(intro,{autoAlpha:0,duration:1,ease:'power2.inOut'},3.9)
    .fromTo('.greeting-subtitle',{autoAlpha:0,scale:.9,y:8},
      {autoAlpha:1,scale:1,y:0,duration:.4,ease:'back.out(1.5)'},frameStart)
    .fromTo('.transition-underline span',{scaleX:0},
      {scaleX:1,duration:.4,ease:'power2.out'},frameStart)
    .fromTo('.greeting-scroll span',{autoAlpha:0},
      {autoAlpha:1,duration:.4,ease:'power2.out'},frameStart)
    .call(()=>document.body.classList.remove('intro-playing'),null,frameStart)
    .fromTo(['.site-header','.social-frame','.motion-toggle','footer'],{autoAlpha:0,y:6},
      {autoAlpha:1,y:0,duration:.4,ease:'power2.out'},frameStart);
  typingCharacters.forEach((character,index)=>{
    master.to(character,{autoAlpha:1,y:0,duration:characterDuration,ease:'power2.out'},typingStart+index*typingStep);
  });
  function setup() {
    media.add('(prefers-reduced-motion: no-preference)',()=>{
      if(paused)return;
      const underline=document.querySelector('.transition-underline');
      const stage=document.querySelector('.greeting-stage');
      const subtitle=document.querySelector('.greeting-subtitle');
      const underlineY=()=>subtitle.offsetTop+subtitle.offsetHeight+12+document.querySelector('.greeting-copy').offsetTop;
      gsap.set(underline,{y:underlineY,rotation:0,scaleX:1,scaleY:1});
      gsap.timeline({scrollTrigger:{trigger:'.greeting-hero',start:'top top',end:'+=100%',pin:stage,scrub:.55,invalidateOnRefresh:true}})
        .to('.greeting-copy',{y:-30,autoAlpha:0,ease:'none',duration:.22},0)
        .to('.greeting-scroll',{autoAlpha:0,duration:.15,ease:'none'},0)
        .to(underline,{y:()=>innerHeight*.5,rotation:180,scaleX:3,scaleY:25,duration:.3,ease:'power1.in'},.05)
        .to(underline,{rotation:540,scaleX:()=>Math.hypot(innerWidth,innerHeight)*2/120,scaleY:()=>Math.hypot(innerWidth,innerHeight),duration:.65,ease:'power2.inOut'},.35);
      gsap.utils.toArray('.reveal').forEach(element=>{
        gsap.fromTo(element,{y:30,opacity:.3},{y:0,opacity:1,ease:'none',scrollTrigger:{trigger:element,start:'top 92%',end:'top 65%',scrub:.35}});
      });
    });
  }
  // Persistent frame follows the section behind its actual top/bottom positions.
  const darkSections=[...document.querySelectorAll('.story-about,.story-signoff')];
  const navLinks=[...document.querySelectorAll('[data-section]')];
  const navSections=['about','globe','writing'].map(id=>document.getElementById(id));
  let updateQueued=false;
  function updateFrame(){
    updateQueued=false;
    const darkAt=y=>darkSections.some(s=>{const r=s.getBoundingClientRect();return r.top<=y&&r.bottom>y;});
    document.querySelector('.site-header').classList.toggle('frame-dark',darkAt(35));
    document.querySelector('.social-frame').classList.toggle('frame-dark',darkAt(innerHeight-30));
    button.classList.toggle('frame-dark',darkAt(innerHeight-30));
    let active=0;
    navSections.forEach((s,i)=>{if(s.getBoundingClientRect().top<innerHeight*.5)active=i;});
    navLinks.forEach((link,i)=>i===active?link.setAttribute('aria-current','location'):link.removeAttribute('aria-current'));
  }
  const requestFrame=()=>{if(!updateQueued){updateQueued=true;requestAnimationFrame(updateFrame);}};
  addEventListener('scroll',requestFrame,{passive:true});
  addEventListener('resize',requestFrame,{passive:true});
  button.addEventListener('click',()=>{
    paused=!paused;media.revert();
    if(paused){master.progress(1);unlock();}else setup();
    button.setAttribute('aria-pressed',String(paused));
    button.setAttribute('aria-label',paused?'Resume motion':'Pause motion');
    button.textContent=paused?'▷':'Ⅱ';
    ScrollTrigger.refresh();requestFrame();
  });
  document.querySelectorAll('a[href^="#"]').forEach(link=>{
    link.addEventListener('click',event=>{
      const target=document.querySelector(link.getAttribute('href'));
      if(!target||!window.ScrollToPlugin)return;
      event.preventDefault();
      gsap.to(window,{scrollTo:{y:target,autoKill:true},duration:reduced.matches||paused?0:1.1,ease:'power3.inOut',overwrite:'auto',onComplete:()=>{
        target.setAttribute('tabindex','-1');target.focus({preventScroll:true});
        history.replaceState(null,'',link.getAttribute('href'));
      }});
    });
  });
  const finishForReduced=()=>{if(reduced.matches){master.progress(1);unlock();}};
  reduced.addEventListener('change',finishForReduced);
  setup();drawIntro(0);
  if(reduced.matches||location.hash){master.progress(1);unlock();}
  else if(seek!==null){master.seek(Math.max(0,Number(seek)||0),false);drawIntro(Math.min(master.time(),5.3));if(master.time()>=5.3)unlock();}
  else master.play();
  document.fonts.ready.then(()=>ScrollTrigger.refresh());
  updateFrame();
  window.__introTimeline=master;
  window.__introDuration=master.duration();
  window.__drawIntro=t=>master.pause().seek(t,false);
  window.__ready=true;
})();
