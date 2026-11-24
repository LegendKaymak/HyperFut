'use strict';
/* ======================= SES ======================= */
class Sfx{
 constructor(){this.ctx=null;this.lastOoh=0;this.ambL=0}
 unlock(){try{if(!this.ctx){const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;const c=this.ctx=new AC();
  const comp=c.createDynamicsCompressor();comp.threshold.value=-14;comp.knee.value=8;comp.ratio.value=3.5;comp.attack.value=.003;comp.release.value=.25;
  this.master=c.createGain();this.master.gain.value=S.muted?0:.9;this.master.connect(comp).connect(c.destination);
  this.sfxBus=c.createGain();this.crowdBus=c.createGain();this.sfxBus.connect(this.master);this.crowdBus.connect(this.master);
  const len=c.sampleRate*4;this.nb=c.createBuffer(1,len,c.sampleRate);const d=this.nb.getChannelData(0);for(let i=0;i<len;i++)d[i]=rnd()*2-1;
  // pembe gürültü: kalabalık için daha doğal
  this.pb=c.createBuffer(1,len,c.sampleRate);const pd=this.pb.getChannelData(0);let b0=0,b1=0,b2=0,b3=0,b4=0,b5=0,b6=0;for(let i=0;i<len;i++){const w=rnd()*2-1;b0=.99886*b0+w*.0555179;b1=.99332*b1+w*.0750759;b2=.969*b2+w*.153852;b3=.8665*b3+w*.3104856;b4=.55*b4+w*.5329522;b5=-.7616*b5-w*.016898;pd[i]=(b0+b1+b2+b3+b4+b5+b6+w*.5362)*.11;b6=w*.115926}
  // stadyum yankısı
  const ir=c.createBuffer(2,Math.floor(c.sampleRate*1.7),c.sampleRate);for(let ch=0;ch<2;ch++){const x=ir.getChannelData(ch),n=x.length;for(let i=0;i<n;i++){const t=i/n;x[i]=(rnd()*2-1)*Math.pow(1-t,3.4)*(i<c.sampleRate*.012?0:1)}}
  this.verb=c.createConvolver();this.verb.buffer=ir;this.verbSend=c.createGain();this.verbSend.gain.value=.26;this.sfxBus.connect(this.verbSend).connect(this.verb).connect(this.master);
  this.applyVol();this.buildCrowd()}
  if(this.ctx.state==='suspended')this.ctx.resume()}catch(e){this.ctx=null}}
 applyVol(){if(!this.ctx)return;const t=this.ctx.currentTime;this.sfxBus.gain.setTargetAtTime(S.sfxVol,t,.03);this.crowdBus.gain.setTargetAtTime(S.ambVol,t,.05);this.master.gain.setTargetAtTime(S.muted?0:.9,t,.03)}
 get ok(){return !!this.ctx&&!S.muted&&!(G&&G.demo&&!this.menuOk)}
 src(buf){const s=this.ctx.createBufferSource();s.buffer=buf||this.nb;s.loop=true;return s}
 tone({type='sine',f0=440,f1=null,dur=.15,vol=.3,attack=.004,delay=0,bus=null}){if(!this.ok)return;const c=this.ctx,t=c.currentTime+delay,o=c.createOscillator(),g=c.createGain();o.type=type;o.frequency.setValueAtTime(f0,t);if(f1!==null)o.frequency.exponentialRampToValueAtTime(Math.max(1,f1),t+dur);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(vol,t+attack);g.gain.exponentialRampToValueAtTime(.0001,t+dur);o.connect(g).connect(bus||this.sfxBus);o.start(t);o.stop(t+dur+.05)}
 noise({dur=.2,vol=.3,type='lowpass',f0=1000,f1=null,q=1,attack=.004,delay=0,release=null,bus=null,pink=false}){if(!this.ok)return null;const c=this.ctx,t=c.currentTime+delay,s=this.src(pink?this.pb:this.nb);const f=c.createBiquadFilter();f.type=type;f.Q.value=q;f.frequency.setValueAtTime(f0,t);if(f1!==null)f.frequency.exponentialRampToValueAtTime(Math.max(20,f1),t+dur);const g=c.createGain(),end=release??dur;g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(vol,t+attack);g.gain.exponentialRampToValueAtTime(.0001,t+end);s.connect(f).connect(g).connect(bus||this.sfxBus);s.start(t,rnd()*3);s.stop(t+Math.max(dur,end)+.05);return{src:s,f,g}}
 /* ---- tribün: sürekli uğultu, heyecana göre yükselir ---- */
 buildCrowd(){const c=this.ctx;this.crowd={g:c.createGain(),bands:[]};this.crowd.g.gain.value=0;this.crowd.g.connect(this.crowdBus);
  for(const[f,q,v,pan]of[[180,.7,.9,0],[430,1,1,-.4],[900,1.3,.7,.4],[1900,1.6,.35,-.2],[3200,2,.15,.2]]){const s=this.src(this.pb),bp=c.createBiquadFilter();bp.type='bandpass';bp.frequency.value=f;bp.Q.value=q;const g=c.createGain();g.gain.value=v;
   const l=c.createOscillator(),lg=c.createGain();l.frequency.value=.07+rnd()*.25;lg.gain.value=v*.35;l.connect(lg).connect(g.gain);l.start();
   let out=g;if(c.createStereoPanner){const p=c.createStereoPanner();p.pan.value=pan;g.connect(p);out=p}
   s.connect(bp).connect(g);out.connect(this.crowd.g);s.start(0,rnd()*3);this.crowd.bands.push({bp,f})}}
 amb(level){if(!this.ctx||!this.crowd)return;try{const t=this.ctx.currentTime;this.crowd.g.gain.setTargetAtTime(level*1.6,t,level>this.ambL?.35:.9);for(const b of this.crowd.bands)b.bp.frequency.setTargetAtTime(b.f*(1+level*1.4),t,.6);this.ambL=level}catch(e){}}
 roar(big=1){if(!this.ok)return;const v=Math.min(1.3,big);
  this.noise({pink:true,dur:3.6,vol:.42*v,type:'bandpass',f0:600,f1:900,q:.6,attack:.28,release:3.6,bus:this.crowdBus});
  this.noise({pink:true,dur:3.2,vol:.22*v,type:'bandpass',f0:1500,f1:1900,q:.9,attack:.3,release:3.2,bus:this.crowdBus});
  this.noise({dur:3.8,vol:.07*v,type:'highpass',f0:2600,q:.5,attack:.5,release:3.8,bus:this.crowdBus})}
 cheer(){if(!this.ok)return;this.noise({pink:true,dur:1.3,vol:.16,type:'bandpass',f0:700,f1:950,q:.8,attack:.15,release:1.3,bus:this.crowdBus});this.noise({dur:1.4,vol:.04,type:'highpass',f0:2500,attack:.3,release:1.4,bus:this.crowdBus})}
 ooh(force){if(!this.ok)return;const n=this.ctx.currentTime;if(!force&&(n-this.lastOoh<2.5||rnd()<.3))return;this.lastOoh=n;
  // "oooh": iki formant, hafif aşağı kayar
  this.noise({pink:true,dur:1.4,vol:.2,type:'bandpass',f0:420,f1:330,q:4,attack:.22,release:1.4,bus:this.crowdBus});
  this.noise({pink:true,dur:1.3,vol:.12,type:'bandpass',f0:820,f1:640,q:5,attack:.24,release:1.3,bus:this.crowdBus});
  this.noise({pink:true,dur:1.2,vol:.05,type:'bandpass',f0:2400,f1:2000,q:6,attack:.25,release:1.2,bus:this.crowdBus})}
 /* ---- hakem düdüğü (bezelyeli düdük: titreşimli ~2.9 kHz) ---- */
 blast(t,d,vol=.15){const c=this.ctx,f=2780+rnd()*120,o=c.createOscillator(),o2=c.createOscillator(),am=c.createGain(),g=c.createGain(),lp=c.createBiquadFilter(),lfo=c.createOscillator(),lg=c.createGain(),fg=c.createGain(),fg2=c.createGain(),h2=c.createGain();
  o.type='triangle';o2.type='sine';o.frequency.setValueAtTime(f*.9,t);o.frequency.exponentialRampToValueAtTime(f,t+.035);o2.frequency.setValueAtTime(f*1.8,t);o2.frequency.exponentialRampToValueAtTime(f*2,t+.035);
  lfo.type='sine';lfo.frequency.setValueAtTime(26+rnd()*10,t);lfo.connect(lg);lg.gain.value=.42;lg.connect(am.gain);am.gain.value=.58;lfo.connect(fg);fg.gain.value=55;fg.connect(o.frequency);lfo.connect(fg2);fg2.gain.value=110;fg2.connect(o2.frequency);
  h2.gain.value=.16;o.connect(am);o2.connect(h2).connect(am);lp.type='lowpass';lp.frequency.value=7000;am.connect(lp).connect(g);
  g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(vol,t+.018);g.gain.setValueAtTime(vol,t+Math.max(.03,d-.06));g.gain.exponentialRampToValueAtTime(.0001,t+d);g.connect(this.sfxBus);
  o.start(t);o2.start(t);lfo.start(t);o.stop(t+d+.05);o2.stop(t+d+.05);lfo.stop(t+d+.05);
  const nz=this.src(),bp=c.createBiquadFilter(),ng=c.createGain();bp.type='bandpass';bp.frequency.value=f;bp.Q.value=1.2;ng.gain.setValueAtTime(.0001,t);ng.gain.exponentialRampToValueAtTime(vol*.22,t+.015);ng.gain.setValueAtTime(vol*.22,t+Math.max(.03,d-.06));ng.gain.exponentialRampToValueAtTime(.0001,t+d);nz.connect(bp).connect(ng).connect(this.sfxBus);nz.start(t,rnd()*3);nz.stop(t+d+.05)}
 whistle(long){if(!this.ok)return;const c=this.ctx;let t=c.currentTime+.01;const seq=long===true?[[.2,.13],[.2,.13],[.95,0]]:long==='goal'?[[.55,0]]:[[.42,0]];for(const[d,gap]of seq){this.blast(t,d);t+=d+gap}}
 /* ---- top sesleri ---- */
 kick(speed=6){const k=clamp(speed/7,.35,1.6),p=rr(.93,1.07);
  this.tone({f0:135*p,f1:52*p,dur:.13,vol:.5*Math.pow(k,.7),attack:.002});
  this.noise({dur:.06,vol:.22*k,type:'bandpass',f0:1500*p,f1:700*p,q:1.3,attack:.0012});
  this.noise({dur:.014,vol:.07*k,type:'highpass',f0:3800,attack:.0006});
  if(k>1.05)this.noise({dur:.12,vol:.05*k,type:'bandpass',f0:600,f1:250,q:.8,attack:.002})}
 touch(){const p=rr(.9,1.1);this.tone({f0:150*p,f1:85*p,dur:.05,vol:.13,attack:.002});this.noise({dur:.035,vol:.04,type:'bandpass',f0:900*p,q:1.2,attack:.001})}
 power(){this.kick(11);this.noise({dur:.45,vol:.16,type:'bandpass',f0:2600,f1:400,q:.9,attack:.01});this.tone({f0:90,f1:38,dur:.35,vol:.3})}
 post(){const p=rr(.97,1.03);this.tone({f0:220,f1:95,dur:.07,vol:.3,attack:.001});for(const[f,a,d]of[[612,1,1.1],[1482,.55,.8],[2563,.42,.6],[3911,.25,.45],[5307,.14,.3]])this.tone({f0:f*p,dur:d,vol:.075*a,attack:.001});this.ooh(true)}
 net(){this.noise({dur:.4,vol:.24,type:'bandpass',f0:2800,f1:900,q:.9,attack:.004});this.noise({dur:.6,vol:.07,type:'highpass',f0:4500,attack:.01,release:.6});this.tone({f0:110,f1:60,dur:.12,vol:.18})}
 wall(){this.tone({f0:120,f1:70,dur:.08,vol:.13});this.noise({dur:.05,vol:.05,type:'lowpass',f0:800})}
 /* ---- yetenekler: daha az "bip", daha çok fiziksel ---- */
 ability(cat){switch(cat){case'shot':this.noise({dur:.4,vol:.12,type:'bandpass',f0:300,f1:2200,q:1.2,attack:.2,release:.4});break;
  case'move':this.noise({dur:.25,vol:.18,type:'bandpass',f0:600,f1:2800,q:1});break;
  case'debuff':this.noise({dur:.3,vol:.1,type:'bandpass',f0:1800,f1:600,q:3});this.tone({type:'triangle',f0:520,f1:260,dur:.25,vol:.05});break;
  case'aoe':this.tone({f0:70,f1:36,dur:.6,vol:.34});this.noise({dur:.5,vol:.2,type:'lowpass',f0:700,f1:90});break;
  case'save':this.noise({dur:.4,vol:.1,type:'bandpass',f0:900,f1:2600,q:2});this.tone({f0:620,f1:820,dur:.3,vol:.05});break;
  case'ball':this.tone({f0:160,f1:220,dur:.55,vol:.1});this.noise({dur:.5,vol:.06,type:'bandpass',f0:500,f1:1200,q:3});break;
  default:this.tone({f0:260,f1:60,dur:.7,vol:.15});this.noise({dur:.6,vol:.1,type:'lowpass',f0:1200,f1:120,q:2})}}
 freeze(){this.noise({dur:.35,vol:.14,type:'highpass',f0:5000,f1:2500,attack:.003});this.tone({f0:1600,f1:700,dur:.25,vol:.05})}
 hyper(){this.noise({dur:.55,vol:.22,type:'bandpass',f0:250,f1:3200,q:.9,attack:.05});this.tone({f0:75,f1:36,dur:.6,vol:.35});this.cheer()}
 shield(){this.noise({dur:.35,vol:.16,type:'bandpass',f0:500,f1:2200,q:1.4});this.tone({f0:150,f1:70,dur:.16,vol:.3});this.tone({f0:880,dur:.45,vol:.05})}
 countdown(n){this.noise({dur:.05,vol:.11,type:'bandpass',f0:n>0?850:1100,q:7,attack:.001});this.tone({f0:n>0?560:740,dur:.06,vol:.035})}
 spawn(){this.tone({f0:1320,dur:.22,vol:.04});this.tone({f0:1980,dur:.18,vol:.02,delay:.04})}
 streak(){this.cheer();[660,880].forEach((f,i)=>this.tone({type:'triangle',f0:f,dur:.16,vol:.04,delay:i*.08}))}
 confetti(){for(let i=0;i<2;i++)this.noise({dur:.12,vol:.08,type:'highpass',f0:2200,delay:i*.06})}
 miss(){this.ooh(true);this.noise({pink:true,dur:1,vol:.08,type:'lowpass',f0:500,f1:250,attack:.3,release:1,delay:.5,bus:this.crowdBus})}
 firework(){this.noise({dur:.6,vol:.07,type:'lowpass',f0:1400,f1:180});this.tone({f0:110,f1:45,dur:.35,vol:.1})}
 explosion(big=1){if(!this.ok)return;const v=Math.min(1.3,big);this.net();this.tone({f0:120,f1:34,dur:.9,vol:.5*v});this.noise({dur:.8,vol:.3*v,type:'lowpass',f0:3500,f1:150,q:.7});
  const c=this.ctx,t=c.currentTime+.18;this.blast(t,.5,.11);this.roar(big)}
 ui(){this.menuOk=true;this.noise({dur:.018,vol:.05,type:'highpass',f0:2500});this.tone({f0:880,f1:1100,dur:.05,vol:.045});this.menuOk=false}
 uiMove(){this.menuOk=true;this.noise({dur:.012,vol:.03,type:'highpass',f0:3200});this.menuOk=false}
 selectMove(){this.menuOk=true;this.tone({type:'triangle',f0:660,dur:.05,vol:.045});this.menuOk=false}
 selectConfirm(){this.menuOk=true;this.kick(8);this.cheer();this.menuOk=false}
 vs(){this.menuOk=true;this.tone({f0:100,f1:38,dur:.9,vol:.5});this.noise({dur:.6,vol:.2,type:'bandpass',f0:300,f1:3000,q:1.4,attack:.3,release:.65});this.noise({dur:.5,vol:.26,type:'lowpass',f0:4000,f1:200,delay:.45});this.roar(.6);this.menuOk=false}
 win(){this.menuOk=true;this.roar(1.1);[523,659,784,1046].forEach((f,i)=>this.tone({type:'triangle',f0:f,dur:.3,vol:.05,delay:.2+i*.12}));this.menuOk=false}
}
const sfx=new Sfx();

