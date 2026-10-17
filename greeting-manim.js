import { NativeTextPlayer } from '@mihirsarya/manim-scroll-runtime';
// Keep the original heading in the layout and as the accessible text.
const heading=document.querySelector('#hero-title');
const letters=[...heading.querySelectorAll('.typing-character:not(.period-character)')];
const layer=document.createElement('span');
layer.className='manim-greeting';
layer.setAttribute('aria-hidden','true');
heading.append(layer);
const player=new NativeTextPlayer({container:layer,text:"hi, i'm neha",fontSize:100,color:getComputedStyle(heading).color,fontUrl:'assets/instrument-serif-regular.ttf',strokeWidth:1.2,progress:0});
let ready=false;
let glyphGroups=[];
const clamp=value=>Math.max(0,Math.min(1,value));
function prepareNativeFills(){
  // Preserve Manim's glyph paths; coordinate each letter as one animation.
  let group;
  for(const path of layer.querySelectorAll('svg > path')){
    if(path.getAttribute('stroke')==='none'){
      group={fill:path,strokes:[],totalLength:0};glyphGroups.push(group);
    }else if(group){
      const length=path.getTotalLength();
      group.strokes.push({path,length,offset:group.totalLength});
      group.totalLength+=length;
    }
  }
}
function renderNativeLetters(progress){
  // Equal letter windows prevent complex glyphs from holding up the phrase.
  // Adjacent windows overlap; stroke travel is weighted by actual path length.
  const overlap=.55;
  const span=1+(glyphGroups.length-1)*(1-overlap);
  glyphGroups.forEach((group,index)=>{
    const local=clamp(progress*span-index*(1-overlap));
    const draw=clamp(local/.62);
    const fill=clamp((local-.48)/.52);
    group.fill.style.opacity=String(fill);
    group.strokes.forEach(({path,length,offset})=>{
      const visible=clamp((draw*group.totalLength-offset)/length);
      path.style.strokeDasharray=String(length);
      path.style.strokeDashoffset=String(length*(1-visible));
      // Drawing and filling share this letter's single continuous playhead.
      path.style.strokeOpacity=String(1-fill);
    });
  });
}
const canvas=document.createElement('canvas').getContext('2d');
function fit(){
  const svg=layer.querySelector('svg');
  if(!svg)return;
  const style=getComputedStyle(heading),size=parseFloat(style.fontSize);
  canvas.font=`${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
  const metrics=canvas.measureText('hi');
  const first=letters[0],last=letters.at(-1);
  const baseline=(first.offsetHeight-metrics.fontBoundingBoxAscent-metrics.fontBoundingBoxDescent)/2+metrics.fontBoundingBoxAscent;
  const box=svg.viewBox.baseVal;
  layer.style.left=first.offsetLeft+'px';
  layer.style.top=(first.offsetTop+baseline-(100-box.y)*size/100)+'px';
  svg.style.width=(last.offsetLeft+last.offsetWidth-first.offsetLeft)+'px';
  svg.style.height=(box.height*size/100)+'px';
  svg.setAttribute('preserveAspectRatio','none');
}
window.__greetingManim={setProgress(progress){
  if(!ready)return;
  renderNativeLetters(progress);
  // Keep the same SVG and geometry at progress 1; never swap renderers.
  heading.classList.add('manim-active');
  layer.style.visibility='visible';
}};
player.init().then(()=>{
  prepareNativeFills();ready=true;fit();
  const time=window.__introTimeline?.time()??0;
  window.__greetingManim.setProgress(Math.max(0,Math.min(1,(time-4.4625)/4)));
}).catch(error=>{layer.remove();console.error('Greeting animation could not load:',error);});
document.fonts.ready.then(fit);
addEventListener('resize',fit,{passive:true});
