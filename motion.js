(() => {
  history.scrollRestoration='manual';
  if(location.hash)history.replaceState(null,'',location.pathname+location.search);
  window.scrollTo(0,0);
  addEventListener('pageshow',()=>{
    window.scrollTo(0,0);
    requestAnimationFrame(()=>window.scrollTo(0,0));
  },{once:true});
  const intro = document.querySelector('.intro');
  if (!window.gsap || !window.ScrollTrigger) {
    intro.classList.add('is-complete');
    return;
  }
  gsap.registerPlugin(ScrollTrigger);
  if(window.ScrollToPlugin) gsap.registerPlugin(ScrollToPlugin);
  const media = gsap.matchMedia();
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const logo = document.querySelector('.logo-stage');
  const pool = document.querySelector('.pool-level');
  const band = document.querySelector('.slice-band');
  const sliceShadow=document.querySelector('.slice-shadow');
  const seek = new URLSearchParams(location.search).get('t');
  let paused = false;
  let snapHeaderTheme=null,snapFooterTheme=null,snapDirection=1,snapTargetTheme=0;
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
    const cut=range(t,3.0625,3.6625);
    const extend=quart(range(t,4.1625,4.4625));
    const expand=quart(range(t,4.4625,6.0625));
    const end=mix(mix(-2000,180,cut),2000,extend);
    band.setAttribute('height',Math.max(0,end+2000));
    // Size from the viewport so the small mobile logo still wipes every corner.
    const unitScale=logo.getBoundingClientRect().width/1000;
    const fullWidth=Math.hypot(innerWidth,innerHeight)*2/unitScale;
    const slicePosition=`translate(560 ${331-1/unitScale}) rotate(-38.65)`;
    document.querySelector('.nk-slice').setAttribute('transform',slicePosition);
    document.querySelector('.header-slice-position').setAttribute('transform',slicePosition);
    const sliceScale=mix(1,fullWidth/26,expand);
    band.setAttribute('transform',`scale(${sliceScale} 1)`);
    // The fingertip follows the leading end of the cut; its wake stays
    // inside that same beige track and fades toward the older end.
    const trailLength=130;
    sliceShadow.setAttribute('y',end-trailLength);
    sliceShadow.setAttribute('height',trailLength);
    sliceShadow.style.opacity=range(end,-175,-130)*(1-range(end,100,240));
    band.style.fill='var(--page)';
    // Broad swells and an alternating surface tilt mimic a carried jar.
    // The liquid stays inside NK and settles before the slice arrives.
    const progress=range(t,.9,2.9);
    const water=gsap.parseEase('sine.inOut')(progress);
    const level=mix(447,140,water);
    const envelope=Math.sin(Math.PI*progress)**.7;
    const amplitude=29.925*envelope;
    const phase=(t-.9)*7;
    const tilt=23.94*envelope*Math.sin(phase*.85);
    const surface=x=>level+tilt*(x-550)/240
      +amplitude*Math.sin((x-310)/92+phase)
      +amplitude*.28*Math.sin((x-310)/43-phase*.65);
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
  window.scrollTo(0,0);
  const clock={time:0};
  const typingCharacters=gsap.utils.toArray('.typing-character');
  gsap.set(typingCharacters,{autoAlpha:0,y:4});
  gsap.set(['.greeting-subtitle','.site-header','.social-frame','footer'],{autoAlpha:0});
  const typingStart=5.7125;
  const typingStep=.09;
  const characterDuration=.08;
  const typingEnd=typingStart+(typingCharacters.length-1)*typingStep+characterDuration;
  const frameStart=typingEnd+.15;
  const cursor=document.querySelector('.typing-cursor');
  function updateCursor() {
    const time=master.time();
    const count=Math.max(0,Math.min(typingCharacters.length,Math.floor((time-typingStart)/typingStep)+1));
    const last=typingCharacters[count-1];
    cursor.style.left=(last?last.offsetLeft+last.offsetWidth+3:typingCharacters[0].offsetLeft)+'px';
    const active=time>=typingStart-.15&&time<typingEnd+.35&&!reduced.matches;
    const blinking=time<typingStart||Math.floor((time-typingStart)/.4)%2===0;
    cursor.style.visibility=active?'visible':'hidden';
    cursor.style.opacity=active&&blinking?String(1-range(time,typingEnd+.1,typingEnd+.35)):'0';
  }
  const master=gsap.timeline({paused:true,onComplete:unlock,onUpdate:updateCursor});
  master.to(clock,{time:6.4625,duration:6.4625,ease:'none',onUpdate:()=>drawIntro(clock.time)},0)
    // Exact contour arcs: top-left N → bottom-right K, and K → N.
    .fromTo('.nk-outline',{strokeDashoffset:1},
      {strokeDashoffset:0,autoRound:false,duration:1.8,ease:letteringEase},0)
    .to(intro,{autoAlpha:0,duration:1,ease:'power2.inOut'},5.0625)
    .fromTo('.greeting-subtitle',{autoAlpha:0,scale:.9,y:8},
      {autoAlpha:1,scale:1,y:0,duration:.4,ease:'back.out(1.5)'},frameStart)
    .fromTo('.transition-underline span',{scaleX:0},
      {scaleX:1,duration:.4,ease:'power2.out'},frameStart)
    .fromTo('.greeting-scroll span',{autoAlpha:0},
      {autoAlpha:1,duration:.4,ease:'power2.out'},frameStart)
    .call(()=>document.body.classList.remove('intro-playing'),null,frameStart)
    .fromTo(['.site-header','.social-frame','footer'],{autoAlpha:0,y:6},
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
      gsap.timeline({onUpdate:()=>updateFrame(),scrollTrigger:{trigger:'.greeting-hero',start:'top top',end:'+=100%',pin:stage,scrub:.55,invalidateOnRefresh:true}})
        .to('.greeting-copy',{y:-30,autoAlpha:0,ease:'none',duration:.22},0)
        .to('.greeting-scroll',{autoAlpha:0,duration:.15,ease:'none'},0)
        .to(underline,{y:()=>innerHeight*.5,rotation:180,scaleX:3,scaleY:25,duration:.3,ease:'power1.in'},.05)
        .to(underline,{rotation:540,scaleX:()=>Math.hypot(innerWidth,innerHeight)*2/120,scaleY:()=>Math.hypot(innerWidth,innerHeight),duration:.65,ease:'power2.inOut'},.35);
      // Recalculate section stops after pin spacing, fonts, or viewport changes.
      const pages=gsap.utils.toArray('main > section:not(.greeting-hero)');
      let pageStops=[];
      const refreshStops=()=>{
        const headerHeight=document.querySelector('.site-header').getBoundingClientRect().height;
        document.documentElement.style.setProperty('--frame-height',headerHeight+'px');
        const contacts=document.querySelector('.social-frame');
        const footerSpace=getComputedStyle(contacts).display==='none'?25:innerHeight-contacts.getBoundingClientRect().top;
        document.documentElement.style.setProperty('--footer-space',footerSpace+'px');
        const max=ScrollTrigger.maxScroll(window);
        pageStops=[0,...pages.map(page=>
          Math.max(0,Math.min(max,page.getBoundingClientRect().top+window.scrollY-headerHeight)))];
        pageStops=[...new Set(pageStops)];
      };
      ScrollTrigger.create({
        id:'section-page-snap',
        start:0,end:()=>ScrollTrigger.maxScroll(window),
        onRefresh:refreshStops
      });
      let pageTween=null,lastGesture=-Infinity,touchY=null;
      const movePage=direction=>{
        const now=performance.now(),continuing=now-lastGesture<220;
        lastGesture=now;
        if(pageTween||continuing||document.body.classList.contains('intro-playing'))return;
        const max=ScrollTrigger.maxScroll(window);
        const stops=pageStops;
        let destination=direction>0?stops.find(stop=>stop>scrollY+2):[...stops].reverse().find(stop=>stop<scrollY-2);
        // On short screens, keep long page content readable before advancing.
        const currentPage=[...pages].reverse().find(page=>{const top=page.getBoundingClientRect().top+scrollY;
          return scrollY>=top-parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--frame-height'))-2&&scrollY<top+page.offsetHeight-2;});
        if(currentPage){
          const headerHeight=document.querySelector('.site-header').getBoundingClientRect().height;
          const footerSpace=parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--footer-space'))||25;
          const top=currentPage.getBoundingClientRect().top+scrollY-headerHeight;
          const last=Math.max(top,top+currentPage.offsetHeight-(innerHeight-headerHeight-footerSpace));
          if(direction>0&&scrollY<last-2)destination=Math.min(last,scrollY+innerHeight-headerHeight-footerSpace);
          if(direction<0&&scrollY>top+2)destination=Math.max(top,scrollY-innerHeight+headerHeight+footerSpace);
        }
        if(destination===undefined)return;
        const destinationPage=[...pages].reverse().find(page=>
          page.getBoundingClientRect().top+scrollY-document.querySelector('.site-header').getBoundingClientRect().height<=destination+2);
        const fromTheme=darkHeader.style.clipPath==='inset(0px)'||darkHeader.style.clipPath==='inset(0)'?1:0;
        const toTheme=darkSections.includes(destinationPage)?1:0;
        const fromFooterTheme=footerSurface.classList.contains('frame-dark')?1:0;
        const syncHeader=scrollY>=pageStops[1]-2&&destination>=pageStops[1]-2;
        snapDirection=direction;snapTargetTheme=toTheme;
        const startY=scrollY;
        const travel={progress:0};
        pageTween=gsap.to(travel,{progress:1,duration:.85,ease:'power2.inOut',onUpdate:()=>{
          const headerHeight=document.querySelector('.site-header').getBoundingClientRect().height;
          const footerSpace=parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--footer-space'))||25;
          const pageHeight=innerHeight-headerHeight-footerSpace;
          // One moving boundary: footer → page → header (reversed going up).
          const boundary=direction>0?innerHeight*(1-travel.progress):innerHeight*travel.progress;
          const pageProgress=direction>0?clamp((innerHeight-footerSpace-boundary)/(innerHeight-footerSpace)):
            clamp((boundary-headerHeight)/(innerHeight-headerHeight));
          window.scrollTo(0,startY+(destination-startY)*(syncHeader?pageProgress:travel.progress));
          const headerProgress=direction>0?clamp((pageProgress-.96)/.04):clamp(boundary/headerHeight);
          const footerProgress=direction>0?clamp((innerHeight-boundary)/footerSpace):
            clamp((boundary-(innerHeight-footerSpace))/footerSpace);
          snapHeaderTheme=syncHeader?fromTheme+(toTheme-fromTheme)*headerProgress:null;
          snapFooterTheme=syncHeader?fromFooterTheme+(toTheme-fromFooterTheme)*footerProgress:null;
          updateFrame();
        },onComplete:()=>{pageTween=null;snapHeaderTheme=null;snapFooterTheme=null;updateFrame();},
          onInterrupt:()=>{pageTween=null;snapHeaderTheme=null;snapFooterTheme=null;updateFrame();}});

      };
      const wheel=event=>{
        if(event.ctrlKey||Math.abs(event.deltaX)>Math.abs(event.deltaY)||!event.deltaY)return;
        event.preventDefault();movePage(Math.sign(event.deltaY));
      };
      const touchStart=event=>{touchY=event.touches.length===1?event.touches[0].clientY:null;};
      const touchMove=event=>{
        if(touchY===null||event.touches.length!==1)return;
        const delta=touchY-event.touches[0].clientY;
        if(Math.abs(delta)<8)return;
        event.preventDefault();movePage(Math.sign(delta));
      };
      const keyDown=event=>{
        if(event.target.closest('input,textarea,select,[contenteditable="true"]'))return;
        const direction=['ArrowDown','PageDown',' '].includes(event.key)?(event.shiftKey?-1:1):
          ['ArrowUp','PageUp'].includes(event.key)?-1:0;
        if(!direction)return;
        event.preventDefault();movePage(direction);
      };
      addEventListener('wheel',wheel,{passive:false});
      addEventListener('touchstart',touchStart,{passive:true});
      addEventListener('touchmove',touchMove,{passive:false});
      addEventListener('keydown',keyDown);
      gsap.utils.toArray('.reveal').forEach(element=>{
        gsap.fromTo(element,{y:30,opacity:.3},{y:0,opacity:1,ease:'none',scrollTrigger:{trigger:element,start:'top 92%',end:'top 65%',scrub:.35}});
      });
      return ()=>{
        pageTween?.kill();
        removeEventListener('wheel',wheel);removeEventListener('touchstart',touchStart);
        removeEventListener('touchmove',touchMove);removeEventListener('keydown',keyDown);
      };
    });
  }
  // Persistent frame follows the section behind its actual top/bottom positions.
  const darkSections=[...document.querySelectorAll('.story-about,.globe-section,.story-signoff')];
  const navLinks=[...document.querySelectorAll('[data-section]')];
  const navSections=['about','globe','writing'].map(id=>document.getElementById(id));
  const headerSurface=document.querySelector('.site-header');
  const darkHeader=document.createElement('div');
  darkHeader.className='header-dark-surface';darkHeader.setAttribute('aria-hidden','true');darkHeader.inert=true;
  [...headerSurface.children].forEach(child=>{const copy=child.cloneNode(true);copy.querySelectorAll('[id]').forEach(node=>node.removeAttribute('id'));darkHeader.append(copy);});
  headerSurface.append(darkHeader);
  const footerSurface=document.createElement('div');footerSurface.className='frame-footer-surface';footerSurface.setAttribute('aria-hidden','true');document.body.append(footerSurface);
  const darkFooter=document.createElement('div');darkFooter.className='frame-footer-dark';darkFooter.setAttribute('aria-hidden','true');darkFooter.inert=true;
  const darkContacts=document.querySelector('.social-frame').cloneNode(true);darkContacts.classList.add('footer-dark-contacts');darkFooter.append(darkContacts);document.body.append(darkFooter);
  const applyWipe=(surface,fraction)=>{
    surface.style.clipPath='inset(0)';
    if(fraction<=0||fraction>=1){surface.style.opacity=fraction<=0?'0':'1';surface.style.maskImage='none';return;}
    surface.style.opacity='1';
    const height=surface.getBoundingClientRect().height,feather=20;
    const darkAtBottom=snapTargetTheme?snapDirection>0:snapDirection<0;
    const edge=darkAtBottom?(height+feather)-fraction*(height+2*feather):-feather+fraction*(height+2*feather);
    surface.style.maskImage=darkAtBottom?`linear-gradient(to bottom, transparent ${edge-feather}px, black ${edge+feather}px)`:`linear-gradient(to bottom, black ${edge-feather}px, transparent ${edge+feather}px)`;
  };
  let updateQueued=false;
  function updateFrame(){
    updateQueued=false;
    const underline=document.querySelector('.transition-underline');
    const ribbon=underline.getBoundingClientRect();
    const rotation=Number(gsap.getProperty(underline,'rotation'))*Math.PI/180;
    const scaleX=Number(gsap.getProperty(underline,'scaleX'));
    const scaleY=Number(gsap.getProperty(underline,'scaleY'));
    const inkAt=(x,y)=>{
      if(darkSections.some(s=>{const r=s.getBoundingClientRect();return r.top<=y&&r.bottom>y;}))return true;
      const stage=document.querySelector('.greeting-stage').getBoundingClientRect();
      if(scrollY<=1||y<stage.top||y>stage.bottom||scaleY<=1)return false;
      const dx=x-(ribbon.left+ribbon.width/2),dy=y-(ribbon.top+ribbon.height/2);
      const localX=dx*Math.cos(rotation)+dy*Math.sin(rotation);
      const localY=-dx*Math.sin(rotation)+dy*Math.cos(rotation);
      return Math.abs(localX)<=60*scaleX&&Math.abs(localY)<=scaleY;
    };
    const header=document.querySelector('.site-header'),headerRect=header.getBoundingClientRect(),height=headerRect.height;
    const footerSpace=parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--footer-space'))||25;
    const main=document.querySelector('main'),mainTop=main.getBoundingClientRect().top+scrollY;
    const clipTop=Math.max(0,scrollY+height-mainTop),clipBottom=Math.max(0,main.offsetHeight-(scrollY+innerHeight-footerSpace-mainTop));
    main.style.clipPath=`inset(${clipTop}px 0 ${clipBottom}px 0)`;
    footerSurface.classList.toggle('frame-dark',inkAt(innerWidth/2,innerHeight-footerSpace-1));
    if(snapFooterTheme!==null)applyWipe(darkFooter,snapFooterTheme);
    else{darkFooter.style.maskImage='none';darkFooter.style.opacity='1';darkFooter.style.clipPath=footerSurface.classList.contains('frame-dark')?'inset(0)':'inset(100% 0 0 0)';}
    if(snapHeaderTheme!==null)applyWipe(darkHeader,snapHeaderTheme);
    else{darkHeader.style.maskImage='none';darkHeader.style.opacity='1';darkHeader.style.clipPath=inkAt(innerWidth/2,height+1)?'inset(0)':'inset(100% 0 0 0)';}
    header.classList.remove('frame-dark');
    document.querySelectorAll('.wordmark,.header-name,.site-header nav a,.site-header nav span,.social-frame').forEach(element=>element.classList.remove('frame-dark'));
    let active=0;
    navSections.forEach((s,i)=>{if(s.getBoundingClientRect().top<innerHeight*.5)active=i;});
    document.querySelectorAll('[data-section]').forEach(link=>link.dataset.section===navLinks[active].dataset.section?link.setAttribute('aria-current','location'):link.removeAttribute('aria-current'));
  }
  const requestFrame=()=>{if(!updateQueued){updateQueued=true;requestAnimationFrame(updateFrame);}};
  addEventListener('scroll',updateFrame,{passive:true});
  addEventListener('resize',requestFrame,{passive:true});
  document.querySelectorAll('a[href^="#"]').forEach(link=>{
    link.addEventListener('click',event=>{
      const target=document.querySelector(link.getAttribute('href'));
      if(!target||!window.ScrollToPlugin)return;
      event.preventDefault();
      gsap.to(window,{scrollTo:{y:target,offsetY:target.matches('main > section')?document.querySelector('.site-header').getBoundingClientRect().height:0,autoKill:true},duration:reduced.matches||paused?0:1.1,ease:'power3.inOut',overwrite:'auto',onComplete:()=>{
        target.setAttribute('tabindex','-1');target.focus({preventScroll:true});
        history.replaceState(null,'',link.getAttribute('href'));
      }});
    });
  });
  const finishForReduced=()=>{if(reduced.matches){master.progress(1);unlock();}};
  reduced.addEventListener('change',finishForReduced);
  setup();drawIntro(0);
  if(reduced.matches){master.progress(1);unlock();}
  else if(seek!==null){master.seek(Math.max(0,Number(seek)||0),false);drawIntro(Math.min(master.time(),6.4625));if(master.time()>=6.4625)unlock();}
  else master.play();
  document.fonts.ready.then(()=>ScrollTrigger.refresh());
  updateFrame();updateCursor();
  window.__introTimeline=master;
  window.__introDuration=master.duration();
  window.__drawIntro=t=>master.pause().seek(t,false);
  window.__ready=true;
})();
