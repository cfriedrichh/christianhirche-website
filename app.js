const papers=[
['2025','Promoting product returns? The impact of at-purchase and post-purchase discounts on customers’ return behavior','Maarten J. Gijsenberg, Tammo H. A. Bijmolt & Christian F. Hirche','Journal of Retailing · 101(3), 473–492','https://doi.org/10.1016/j.jretai.2025.05.003'],
['2023','Parsing User Queries using Context Free Grammars','Kees van Noortwijk & Christian Hirche','Legal Information Retrieval workshop · ECIR 2023','https://pure.eur.nl/en/publications/parsing-user-queries-using-context-free-grammars/'],
['2022','When Offline Stores Reduce Online Returns','Christian F. Hirche, Tammo H. A. Bijmolt & Maarten J. Gijsenberg','Sustainability · 14(13), 7829','https://doi.org/10.3390/su14137829'],
['2022','Product returns in omni-channel retailing','Christian Hirche','Doctoral thesis · University of Groningen','https://doi.org/10.33612/diss.202796563'],
['2021','Challenges at the marketing–operations interface in omni-channel retail environments','Tammo H. A. Bijmolt, Manda Broekhuis, Sander de Leeuw, Christian F. Hirche, Robert P. Rooderkerk, Rui Sousa & Stuart X. Zhu','Journal of Business Research','https://www.sciencedirect.com/science/article/pii/S014829631930699X'],
['2021','Asking Less, Getting More? The Influence of Fixed-Fee and Threshold-Based Free Shipping on Online Orders and Returns','Christian F. Hirche, Maarten J. Gijsenberg & Tammo H. A. Bijmolt','SOM Research Reports · Working paper','https://research.rug.nl/en/publications/asking-less-getting-more-the-influence-of-fixed-fee-and-threshold/']
];
document.querySelector('#publications').innerHTML=papers.map(([year,title,authors,journal,url])=>`<article class="publication"><span class="pub-year">${year}</span><div><h3><a href="${url}">${title}</a></h3><p>${authors}</p><p class="journal">${journal}</p></div><span class="arrow" aria-hidden="true">↗</span></article>`).join('');
document.querySelector('#year').textContent=new Date().getFullYear();
const canvas=document.querySelector('#scene'),button=document.querySelector('#motion'),hero=canvas.parentElement;
try{
const THREE=await import('./assets/three.module.js');
const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.75));
// An illustrative harmonic spectrum: frequency across x, history along z.
// Synthesized locally for the artwork; no microphone or audio permissions.
const scene=new THREE.Scene();
const camera=new THREE.PerspectiveCamera(38,1,.1,100);
camera.position.set(0,4.5,11);camera.lookAt(0,.5,0);
const group=new THREE.Group();scene.add(group);group.rotation.y=-.32;
const rows=46,bins=144,spectra=[];
const low=new THREE.Color(0x518f9e),high=new THREE.Color(0xdbe9a3);
for(let row=0;row<rows;row++){
  const positions=new Float32Array(bins*3),colors=new Float32Array(bins*3);
  const geometry=new THREE.BufferGeometry();
  geometry.setAttribute('position',new THREE.BufferAttribute(positions,3).setUsage(THREE.DynamicDrawUsage));
  geometry.setAttribute('color',new THREE.BufferAttribute(colors,3).setUsage(THREE.DynamicDrawUsage));
  const material=new THREE.LineBasicMaterial({vertexColors:true,transparent:true,opacity:.28+.36*(row/(rows-1)),depthWrite:false});
  group.add(new THREE.Line(geometry,material));spectra.push({geometry,positions,colors});
}
const waveformGeometry=new THREE.BufferGeometry();
const waveformPositions=new Float32Array(bins*3);
waveformGeometry.setAttribute('position',new THREE.BufferAttribute(waveformPositions,3).setUsage(THREE.DynamicDrawUsage));
group.add(new THREE.Line(waveformGeometry,new THREE.LineBasicMaterial({color:0xdbe9a3,transparent:true,opacity:.7,depthWrite:false})));
const tint=new THREE.Color();
function updateSpectrum(time){
  for(let row=0;row<rows;row++){
    const {geometry,positions,colors}=spectra[row];
    const history=time-(rows-1-row)*.105;
    const fundamental=.105+.014*Math.sin(history*.55);
    for(let bin=0;bin<bins;bin++){
      const f=bin/(bins-1);let amplitude=0;
      for(let harmonic=1;harmonic<=7;harmonic++){
        const centre=fundamental*harmonic+.012*Math.sin(history*.8+harmonic);
        const width=.017+harmonic*.002;
        const envelope=.62+.24*Math.sin(history*1.05+harmonic*.9)+.12*Math.sin(history*2.1);
        amplitude+=Math.exp(-.5*((f-centre)/width)**2)*envelope/(harmonic**.65);
      }
      amplitude*=3.5;
      const idx=bin*3;
      positions[idx]=(f-.5)*8;
      positions[idx+1]=amplitude-.6;
      positions[idx+2]=(row/(rows-1)-.5)*5;
      tint.copy(low).lerp(high,Math.min(amplitude/2.4,1));
      colors[idx]=tint.r;colors[idx+1]=tint.g;colors[idx+2]=tint.b;
    }
    geometry.attributes.position.needsUpdate=true;geometry.attributes.color.needsUpdate=true;
  }
  for(let bin=0;bin<bins;bin++){
    const f=bin/(bins-1),phase=f*Math.PI*16-time*1.6;
    const envelope=Math.sin(Math.PI*f)**1.4;
    waveformPositions[bin*3]=(f-.5)*8;
    waveformPositions[bin*3+1]=-.72+envelope*(Math.sin(phase)*.19+Math.sin(phase*2+.5)*.08+Math.sin(phase*3)*.035);
    waveformPositions[bin*3+2]=3.1;
  }
  waveformGeometry.attributes.position.needsUpdate=true;
}
updateSpectrum(0);
// Keep dynamic geometry bounds stable as the peaks move.
for(const {geometry} of spectra)geometry.boundingSphere=new THREE.Sphere(new THREE.Vector3(0,1,0),7);
waveformGeometry.computeBoundingSphere();
const media=matchMedia('(prefers-reduced-motion: reduce)');let paused=media.matches,visible=true,tx=0,ty=0,frame,elapsed=0;
const sync=()=>{button.textContent=paused?'Play motion':'Pause motion';button.setAttribute('aria-pressed',String(paused))};sync();
const draw=()=>renderer.render(scene,camera);
const resize=()=>{
  const r=hero.getBoundingClientRect();renderer.setSize(r.width,r.height,false);
  camera.aspect=r.width/r.height;camera.updateProjectionMatrix();
  group.position.x=r.width>700?camera.aspect*1.35:.8;
  group.scale.setScalar(r.width>700?1.05:.85);draw();
};new ResizeObserver(resize).observe(hero);
let last=0;
function animate(t){
  frame=undefined;if(paused||!visible||document.hidden)return;
  const delta=Math.min((t-last)/1000,.05);last=t;elapsed+=delta;
  updateSpectrum(elapsed);
  group.rotation.y+=(-.32+tx*.12-group.rotation.y)*.035;
  group.rotation.x+=(ty*.055-group.rotation.x)*.035;
  draw();frame=requestAnimationFrame(animate);
}
function start(){if(!frame&&!paused&&visible&&!document.hidden){last=performance.now();frame=requestAnimationFrame(animate)}}
button.addEventListener('click',()=>{paused=!paused;sync();start()});
hero.addEventListener('pointermove',e=>{if(paused)return;const r=hero.getBoundingClientRect();tx=(e.clientX-r.left)/r.width-.5;ty=(e.clientY-r.top)/r.height-.5});
hero.addEventListener('pointerleave',()=>{tx=ty=0});
new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;start()}).observe(canvas);
document.addEventListener('visibilitychange',start);
media.addEventListener('change',e=>{paused=e.matches;sync();start()});resize();start();
}catch(e){canvas.remove();button.hidden=true;}
