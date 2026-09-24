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
const canvas=document.querySelector('#scene'),hero=canvas.parentElement;
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
const low=new THREE.Color(0x627c80),high=new THREE.Color(0xa2ad90);
for(let row=0;row<rows;row++){
  const positions=new Float32Array(bins*3),colors=new Float32Array(bins*3);
  const geometry=new THREE.BufferGeometry();
  geometry.setAttribute('position',new THREE.BufferAttribute(positions,3).setUsage(THREE.DynamicDrawUsage));
  geometry.setAttribute('color',new THREE.BufferAttribute(colors,3).setUsage(THREE.DynamicDrawUsage));
  const material=new THREE.LineBasicMaterial({vertexColors:true,transparent:true,opacity:.16+.23*(row/(rows-1)),depthWrite:false});
  group.add(new THREE.Line(geometry,material));spectra.push({geometry,positions,colors});
}
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

}
updateSpectrum(0);
// Keep dynamic geometry bounds stable as the peaks move.
for(const {geometry} of spectra)geometry.boundingSphere=new THREE.Sphere(new THREE.Vector3(0,1,0),7);
let visible=true,tx=0,ty=0,frame,elapsed=0;
// Decorative annotations are projected from the actual moving wave vertices.
const labels=document.createElement('div');
labels.className='wave-labels';labels.setAttribute('aria-hidden','true');hero.append(labels);
const words=['impact','result','insight','predict','discover','signal'];
const annotations=words.map((word,i)=>{
  const el=document.createElement('span');el.className='wave-label';
  const number=document.createElement('span'),meaning=document.createElement('span');
  meaning.textContent=word;el.append(number,meaning);labels.append(el);
  return {el,number,meaning,row:12+i*6,bin:18+i*15,word};
});
const point=new THREE.Vector3();
const smooth=(a,b,t)=>{const x=THREE.MathUtils.clamp((t-a)/(b-a),0,1);return x*x*(3-2*x)};
const draw=()=>{
  renderer.render(scene,camera);
  const width=canvas.clientWidth,height=canvas.clientHeight;
  annotations.forEach(({el,number,meaning,row,bin},i)=>{
    const cycle=(elapsed+i*1.4)%10;
    const opacity=smooth(0,1.4,cycle)*(1-smooth(7.5,9.5,cycle));
    const morph=smooth(3,4.8,cycle);
    point.fromArray(spectra[row].positions,bin*3);group.localToWorld(point);point.project(camera);
    const x=(point.x*.5+.5)*width,y=(-point.y*.5+.5)*height;
    el.style.transform=`translate(${x}px,${y-14}px) translate(-50%,-100%)`;
    const edge=smooth(10,65,x)*(1-smooth(width-65,width-10,x))*smooth(20,70,y)*(1-smooth(height-50,height,y));
    el.style.opacity=opacity*edge*.30;
    number.textContent=(.1+((i*137+Math.floor(elapsed/10)*71)%890)/1000).toFixed(3);
    number.style.opacity=1-morph;meaning.style.opacity=morph;
  });
};
const resize=()=>{
  const r=canvas.getBoundingClientRect();renderer.setSize(r.width,r.height,false);
  camera.aspect=r.width/r.height;camera.updateProjectionMatrix();
  // Crop into the surface instead of fitting a complete object into the hero.
  const mobile=r.width<=700;
  group.position.set(mobile?2.5:camera.aspect*.55,mobile?-.25:-.35,0);
  group.scale.set(mobile?1.55:1.8,mobile?1.15:1.3,1.65);
  draw();
};new ResizeObserver(resize).observe(hero);
let last=0;
function animate(t){
  frame=undefined;if(!visible||document.hidden)return;
  const delta=Math.min((t-last)/1000,.05);last=t;elapsed+=delta;
  updateSpectrum(elapsed);
  group.rotation.y+=(-.32+tx*.12-group.rotation.y)*.035;
  group.rotation.x+=(ty*.055-group.rotation.x)*.035;
  draw();frame=requestAnimationFrame(animate);
}
function start(){if(!frame&&visible&&!document.hidden){last=performance.now();frame=requestAnimationFrame(animate)}}
hero.addEventListener('pointermove',e=>{const r=hero.getBoundingClientRect();tx=(e.clientX-r.left)/r.width-.5;ty=(e.clientY-r.top)/r.height-.5});
hero.addEventListener('pointerleave',()=>{tx=ty=0});
new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;start()}).observe(canvas);
document.addEventListener('visibilitychange',start);
resize();start();
}catch(e){canvas.remove();hero.querySelector('.wave-labels')?.remove();console.warn('Wave visualization unavailable:',e);}
