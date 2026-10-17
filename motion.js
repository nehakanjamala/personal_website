(() => {
  history.scrollRestoration='manual';
  if(location.hash)history.replaceState(null,'',location.pathname+location.search);
  window.scrollTo(0,0);
  addEventListener('pageshow',()=>{
    window.scrollTo(0,0);
    requestAnimationFrame(()=>{
      window.scrollTo(0,0);
      if (!window.gsap || !window.ScrollTrigger) return;
      ScrollTrigger.update();
      const spiral=ScrollTrigger.getById('home-spiral');
      spiral?.animation.progress(0);
      spiral?.getTween()?.progress(1);
      updateFrame();
    });
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
    // Layout is already measured at setup, font load, and resize.
    // Do not refresh pins while the last glyph is settling.
  }
  document.body.classList.add('intro-playing');
  window.scrollTo(0,0);
  const clock={time:0};
  const typingCharacters=gsap.utils.toArray('.typing-character');
  const tagline=document.querySelector('.greeting-subtitle');
  const taglineText=tagline.textContent;
  tagline.setAttribute('aria-label',taglineText);
  tagline.replaceChildren(...Array.from(taglineText,letter=>{
    const character=document.createElement('span');
    character.textContent=letter;
    character.setAttribute('aria-hidden','true');
    return character;
  }));
  const taglineCharacters=[...tagline.children];
  const taglineCursor=document.createElement('span');
  taglineCursor.className='tagline-cursor';
  taglineCursor.setAttribute('aria-hidden','true');
  tagline.append(taglineCursor);
  gsap.set(taglineCharacters,{autoAlpha:0});
  gsap.set(typingCharacters,{autoAlpha:0,y:0});
  gsap.set(['.greeting-subtitle','.hero-portrait','.site-header','.social-frame','footer'],{autoAlpha:0});
  const typingStart=5.7125;
  const typingStep=.09;
  const characterDuration=.08;
  const typingEnd=4.4625+4; // Four-second native Manim write-on.
  const frameStart=typingEnd+.1; // Finish the greeting before revealing the page.
  const cursor=document.querySelector('.typing-cursor');
  function updateCursor() {
    const time=master.time();
    window.__greetingManim?.setProgress(range(time,4.4625,typingEnd));
    const count=Math.max(0,Math.min(typingCharacters.length,Math.floor((time-typingStart)/typingStep)+1));
    const last=typingCharacters[count-1];
    const taglineStart=frameStart;
    const taglineEnd=taglineStart+(taglineCharacters.length-1)*.028+.01;
    const taglineCount=Math.max(0,Math.min(taglineCharacters.length,Math.floor((time-taglineStart)/.028)+1));
    const taglineLast=taglineCharacters[taglineCount-1];
    taglineCursor.style.left=(taglineLast?taglineLast.offsetLeft+taglineLast.offsetWidth+2:0)+'px';
    taglineCursor.style.top=(taglineLast?taglineLast.offsetTop:0)+'px';
    const taglineActive=false;
    taglineCursor.style.visibility=taglineActive?'visible':'hidden';
    taglineCursor.style.opacity=taglineActive&&(time<taglineEnd||Math.floor((time-taglineEnd)/.3)%2===0)?'1':'0';
    cursor.style.left=(last?last.offsetLeft+last.offsetWidth+3:typingCharacters[0].offsetLeft)+'px';
    const active=false;
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
    .fromTo('.transition-underline span',{autoAlpha:0},{autoAlpha:1,duration:.65,ease:'sine.inOut'},frameStart)
    .fromTo('.hero-portrait',{autoAlpha:0,y:10},{autoAlpha:1,y:0,duration:.65,ease:'sine.inOut'},frameStart)
    .fromTo('.greeting-scroll span',{autoAlpha:0},
      {autoAlpha:1,duration:.65,ease:'sine.inOut'},frameStart)
    .call(()=>document.body.classList.remove('intro-playing'),null,frameStart)
    .fromTo(['.site-header','.social-frame','footer'],{autoAlpha:0,y:6},
      {autoAlpha:1,y:0,duration:.65,ease:'sine.inOut'},frameStart);
  master.to(typingCharacters,{autoAlpha:1,y:0,duration:.4,ease:'power2.out'},4.4625);
  master.set(tagline,{autoAlpha:1},frameStart)
    .to(taglineCharacters,{autoAlpha:1,duration:.65,ease:'sine.inOut'},frameStart)
    // Keep updates running until the final glyph reaches its fully filled state.
    .to({}, {duration:.1},typingEnd);
  function setup() {
    media.add('(prefers-reduced-motion: no-preference)',()=>{
      if(paused)return;
      const underline=document.querySelector('.transition-underline');
      const stage=document.querySelector('.greeting-stage');
      const period=document.querySelector('.period-character');
      const periodCanvas=document.createElement('canvas').getContext('2d');
      const periodPosition=()=>{
        const r=period.getBoundingClientRect(),s=stage.getBoundingClientRect();
        const style=getComputedStyle(period);
        periodCanvas.font=`${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
        const metrics=periodCanvas.measureText('.');
        const ascent=metrics.fontBoundingBoxAscent,descent=metrics.fontBoundingBoxDescent;
        const baseline=(r.height-ascent-descent)/2+ascent;
        const copyY=Number(gsap.getProperty('.greeting-copy','y'))||0;
        const periodY=Number(gsap.getProperty(period,'y'))||0;
        return {
          x:r.left-s.left+(metrics.actualBoundingBoxRight-metrics.actualBoundingBoxLeft)/2,
          y:r.top-s.top+baseline+(metrics.actualBoundingBoxDescent-metrics.actualBoundingBoxAscent)/2-copyY-periodY,
          width:metrics.actualBoundingBoxLeft+metrics.actualBoundingBoxRight,
          height:metrics.actualBoundingBoxAscent+metrics.actualBoundingBoxDescent
        };
      };
      const resetPeriod=()=>{
        if((ScrollTrigger.getById('home-spiral')?.progress||0)<.001)
          gsap.set(underline,{x:periodPosition().x,y:periodPosition().y,width:periodPosition().width,height:periodPosition().height});
      };
      ScrollTrigger.addEventListener('refresh',resetPeriod);
      gsap.set(underline,{width:()=>periodPosition().width,height:()=>periodPosition().height,x:()=>periodPosition().x,y:()=>periodPosition().y,xPercent:-50,yPercent:-50,rotation:0,scaleX:1,scaleY:1});
      gsap.timeline({onUpdate:()=>updateFrame(),scrollTrigger:{trigger:'.greeting-hero',id:'home-spiral',start:'top top',end:'+=100%',pin:stage,scrub:.35,invalidateOnRefresh:true}})
        .to('.greeting-copy',{y:-30,autoAlpha:0,ease:'none',duration:.22},0)
        .to('.greeting-scroll',{autoAlpha:0,duration:.15,ease:'none'},0)
        .fromTo(underline,{x:()=>periodPosition().x,y:()=>periodPosition().y,rotation:0,scaleX:1,scaleY:1},{x:()=>innerWidth*.5,y:()=>innerHeight*.5,rotation:180,scaleX:3,scaleY:25,duration:.3,ease:'power1.in'},.05)
        .to(underline,{rotation:540,scaleX:()=>Math.hypot(innerWidth,innerHeight)*2/underline.offsetWidth,scaleY:()=>Math.hypot(innerWidth,innerHeight)*2/underline.offsetHeight,duration:.65,ease:'power2.inOut'},.35);
      // Recalculate section stops after pin spacing, fonts, or viewport changes.
      const pages=gsap.utils.toArray('main > section:not(.greeting-hero):not(.experience-section), .experience-pair');
      let pageStops=[],pageTween=null,pendingDirection=0,pageDirection=0;
      const refreshStops=()=>{
        pendingDirection=0;
        pageTween?.kill();
        const settledIndex=pageStops.findIndex(stop=>Math.abs(stop-scrollY)<=2);
        const headerHeight=document.querySelector('.site-header').getBoundingClientRect().height;
        document.documentElement.style.setProperty('--frame-height',headerHeight+'px');
        const contacts=document.querySelector('.social-frame');
        const footerSpace=getComputedStyle(contacts).display==='none'?25:innerHeight-contacts.offsetTop;
        document.documentElement.style.setProperty('--footer-space',footerSpace+'px');
        const max=ScrollTrigger.maxScroll(window);
        pageStops=[0,...pages.map(page=>
          Math.max(0,Math.min(max,page.getBoundingClientRect().top+window.scrollY-headerHeight)))];
        pageStops=[...new Set(pageStops)];
        if(settledIndex>=0&&pageStops[settledIndex]!==undefined){
          window.scrollTo(0,pageStops[settledIndex]);
          requestAnimationFrame(updateFrame);
        }
      };
      ScrollTrigger.create({
        id:'section-page-snap',
        start:0,end:()=>ScrollTrigger.maxScroll(window),
        onRefresh:refreshStops
      });
      let touchY=null,touchConsumed=false;
      let lastWheel=-Infinity,wheelConsumed=false,wheelDistance=0,lastDirection=0;
      let lastMagnitude=0,gesturePeak=0,tailSeen=false,lastAccepted=-Infinity;
      const movePage=direction=>{
        if(document.body.classList.contains('intro-playing'))return;
        if(pageTween){
          if(direction===pageDirection){pendingDirection=direction;return;}
          // Direction changes interrupt immediately instead of being discarded.
          pendingDirection=0;pageTween.kill();
        }
        pageDirection=direction;
        const max=ScrollTrigger.maxScroll(window);
        const stops=pageStops;
        let destination=direction>0?stops.find(stop=>stop>scrollY+2):[...stops].reverse().find(stop=>stop<scrollY-2);
        // One gesture advances to one complete section/story stop.
        // Never insert an intermediate stop for content or frame padding.
        if(destination===undefined)return;
        const startY=scrollY;
        const travel={progress:0};
        pageTween=gsap.to(travel,{progress:1,duration:.7,ease:'power2.inOut',onUpdate:()=>{
          window.scrollTo(0,startY+(destination-startY)*travel.progress);
          ScrollTrigger.update();
          updateFrame();
        },onComplete:()=>{pageTween=null;updateFrame();const next=pendingDirection;pendingDirection=0;if(next)movePage(next);},onInterrupt:()=>{pageTween=null;updateFrame();}});

      };
      const wheel=event=>{
        if(event.ctrlKey||Math.abs(event.deltaX)>Math.abs(event.deltaY)||!event.deltaY)return;
        event.preventDefault();
        if(document.body.classList.contains('intro-playing'))return;
        const now=performance.now(),direction=Math.sign(event.deltaY);
        const magnitude=Math.abs(event.deltaY)*(event.deltaMode===1?16:event.deltaMode===2?innerHeight:1);
        // Re-arm on a short pause, reversal, or a new push after momentum decays.
        const newPush=tailSeen&&magnitude>=8&&magnitude>lastMagnitude*1.8&&now-lastAccepted>180;
        if(now-lastWheel>90||direction!==lastDirection||newPush){
          wheelConsumed=false;wheelDistance=0;gesturePeak=0;tailSeen=false;
        }
        gesturePeak=Math.max(gesturePeak,magnitude);
        if(magnitude<gesturePeak*.35)tailSeen=true;
        lastWheel=now;lastDirection=direction;lastMagnitude=magnitude;
        if(wheelConsumed)return;
        wheelDistance+=magnitude;
        if(wheelDistance<6)return;
        wheelConsumed=true;lastAccepted=now;
        // A fresh gesture during a snap is queued once, never silently dropped.
        movePage(direction);
      };
      const touchStart=event=>{touchY=event.touches.length===1?event.touches[0].clientY:null;touchConsumed=false;};
      const touchMove=event=>{
        if(touchY===null||event.touches.length!==1)return;
        const delta=touchY-event.touches[0].clientY;
        if(Math.abs(delta)<8)return;
        event.preventDefault();
        if(touchConsumed)return;
        touchConsumed=true;
        movePage(Math.sign(delta));
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
        ScrollTrigger.removeEventListener('refresh',resetPeriod);
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
      return (localX/(underline.offsetWidth/2*scaleX))**2+(localY/(underline.offsetHeight/2*scaleY))**2<=1;
    };
    const header=document.querySelector('.site-header'),headerRect=header.getBoundingClientRect(),height=headerRect.height;
    const experience=document.querySelector('.experience-section');
    const firstExperience=experience.querySelector('.experience-pair').getBoundingClientRect();
    const experienceBottom=experience.getBoundingClientRect().bottom;
    experience.classList.toggle('experience-active',firstExperience.top<innerHeight&&experienceBottom>height+2);
    const experienceGrid=experience.querySelector('.experience-grid');
    const titleBottom=experience.querySelector('.experience-title').getBoundingClientRect().bottom;
    const gridTop=experienceGrid.getBoundingClientRect().top;
    const contentEdge=Math.max(0,titleBottom-gridTop);
    experienceGrid.style.clipPath=experience.classList.contains('experience-active')?`inset(${contentEdge}px 0 0 0)`:'none';
    experienceGrid.style.maskImage=experience.classList.contains('experience-active')?`linear-gradient(to bottom,transparent ${contentEdge}px,black ${contentEdge+16}px)`:'none';
    const footerSpace=parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--footer-space'))||25;
    const main=document.querySelector('main');
    const aboutStart=document.querySelector('#about').getBoundingClientRect().top+scrollY-height;
    const originalHome=document.body.classList.contains('intro-playing')||scrollY<=aboutStart+2;
    document.body.classList.toggle('original-home-frame',originalHome);
    if(originalHome){
      // Preserve the original intro and spiral, without the later frame layers.
      main.style.removeProperty('clip-path');
      const headerDark=inkAt(innerWidth/2,headerRect.bottom+1);
      header.classList.toggle('frame-dark',headerDark);
      document.querySelectorAll('.wordmark,.header-name,.site-header nav a,.site-header nav span,.social-frame').forEach(element=>{
        const r=element.getBoundingClientRect();
        const touched=element.closest('.site-header')?headerDark:
          [[r.left,r.top],[r.right,r.top],[r.left,r.bottom],[r.right,r.bottom],[(r.left+r.right)/2,(r.top+r.bottom)/2]].some(([x,y])=>inkAt(x,y));
        element.classList.toggle('frame-dark',touched);
      });
    }else{
    main.style.removeProperty('clip-path');
    // Frame coverage follows actual section edges, not a second animation clock.
    const cover=(surface,top,bottom,offset=0)=>{
      const segments=darkSections.map(section=>section.getBoundingClientRect())
        .map(r=>[Math.max(top,r.top-offset),Math.min(bottom,r.bottom-offset)])
        .filter(([a,b])=>b>a);
      const stops=['transparent 0%'];
      segments.forEach(([a,b])=>{
        const start=a-top<1?0:(a-top)/(bottom-top)*100;
        const end=bottom-b<1?100:(b-top)/(bottom-top)*100;
        stops.push(`transparent ${start}%`,`black ${start}%`,`black ${end}%`,`transparent ${end}%`);
      });
      stops.push('transparent 100%');
      surface.style.clipPath='inset(0)';
      surface.style.opacity=segments.length?'1':'0';
      surface.style.maskImage=`linear-gradient(to bottom,${stops.join(',')})`;
    };
    cover(darkHeader,0,height,height);
    cover(darkFooter,innerHeight-footerSpace-2,innerHeight);
    footerSurface.classList.remove('frame-dark');
    header.classList.remove('frame-dark');
    document.querySelectorAll('.wordmark,.header-name,.site-header nav a,.site-header nav span,.social-frame').forEach(element=>element.classList.remove('frame-dark'));
    }
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
