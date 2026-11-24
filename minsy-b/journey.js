/* One continuous sequence: hinge, lift, then a strand drawn from the dispenser. */
(() => {
  const scene = document.querySelector('.scroll-scene');
  const main = document.querySelector('main');
  const hero = document.querySelector('.hero');
  const pair = document.getElementById('hero-pair');
  const lid = document.getElementById('hero-box-lid');
  const dispenser = document.getElementById('hero-dispenser');
  if (!main || !scene || !hero || !pair || !lid || !dispenser) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const clamp = n => Math.max(0, Math.min(1,n));
  const smooth = n => { n=clamp(n); if(n<1e-6)return 0; if(n>1-1e-6)return 1; return n*n*n*(n*(n*6-15)+10); };
  const segment = (p,a,b) => smooth((p-a)/(b-a));
  let current=0, frame=0, last=0, sticky=false, travel=700;
  function scrollProgress() {
    if(reduced.matches) return .80;
    if(sticky) return clamp(((parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-height')) || 80)-scene.getBoundingClientRect().top)/travel);
    const rect=pair.getBoundingClientRect();
    return clamp((innerHeight*.85-rect.top)/Math.max(240,innerHeight*.45));
  }
  function paint() {
    const opened=segment(current,.05,.32);
    const lift=segment(current,.36,.78);
    const thread=segment(current,.84,1);
    pair.style.setProperty('--lift',lift.toFixed(4));
    // Project a rigid lid around the original rear edge; do not stretch the bitmap.
    const angle=opened*Math.PI*45/180;
    const ex=721, ey=118, fx=-182, fy=70;
    const dx=fx*Math.cos(angle), dy=fy*Math.cos(angle)-400*Math.sin(angle);
    const determinant=ex*fy-ey*fx;
    const a=(ex*fy-dx*ey)/determinant;
    const b=(ey*fy-dy*ey)/determinant;
    const c=(dx*ex-ex*fx)/determinant;
    const d=(dy*ex-ey*fx)/determinant;
    const hx=930, hy=301;
    lid.setAttribute('transform',`matrix(${a} ${b} ${c} ${d} ${hx-a*hx-c*hy} ${hy-b*hx-d*hy})`);
    dispenser.setAttribute('y',String(430-lift*335));
    document.getElementById('hero-lid-inside')?.setAttribute('opacity',dy<0?'1':'0');

  }
  function tick(time) {
    frame=0;
    const target=scrollProgress();
    const dt=last?Math.min(50,time-last):16;last=time;
    current=reduced.matches?target:current+(target-current)*(1-Math.exp(-dt/150));
    if(Math.abs(current-target)<.0005)current=target;
    paint();
    if(current!==target&&!document.hidden) frame=requestAnimationFrame(tick);
  }
  function request(){ if(!frame&&!document.hidden){last=0;frame=requestAnimationFrame(tick);} }
  function measure(){
    sticky=!reduced.matches&&innerWidth>1020&&innerHeight>=760;
    travel=Math.max(760,innerHeight*1.1);
    document.body.classList.toggle('flowing-hero',sticky);
    scene.style.setProperty('--flow-travel',`${travel}px`);
    request();
  }
  document.getElementById('hero-explore')?.addEventListener('click',()=>{
    if(sticky){window.scrollTo({top:scrollY+scene.getBoundingClientRect().top-80+travel,behavior:reduced.matches?'instant':'smooth'});}
    else document.getElementById('why')?.scrollIntoView({behavior:reduced.matches?'instant':'smooth'});
  });
  addEventListener('scroll',request,{passive:true});addEventListener('resize',measure);
  addEventListener('load',measure);reduced.addEventListener('change',measure);
  document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;}else request();});
  window.addEventListener('minsy:formula-change',request);
  const geometryObserver = new ResizeObserver(request);
  geometryObserver.observe(hero);
  geometryObserver.observe(main);
  lid.addEventListener('load',request);
  document.getElementById('hero-lid-art')?.addEventListener('load',request);
  document.fonts?.ready.then(measure);
  measure();
})();
