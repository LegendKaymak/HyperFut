'use strict';
/* ======================= GİRİŞ ======================= */
const down=new Set();const edge={p1:{kick:false,ab:false},p2:{kick:false,ab:false}};
let capture=null;
const IS_TOUCH=!!(window.matchMedia&&matchMedia('(pointer:coarse)').matches);
const TOUCH={on:IS_TOUCH,mx:0,my:0,kick:false,ek:false,ea:false,id:null,ox:0,oy:0};
function buzz(pt){if(!S.vibe||!TOUCH.on||!G||G.demo||!navigator.vibrate)return;try{navigator.vibrate(pt)}catch(e){}}
let WL=null;async function wake(on){try{if(on&&!WL&&navigator.wakeLock&&document.visibilityState==='visible'){WL=await navigator.wakeLock.request('screen');WL.addEventListener('release',()=>{WL=null})}else if(!on&&WL){const w=WL;WL=null;w.release()}}catch(e){}}
addEventListener('pointerdown',e=>{if(e.pointerType==='touch'&&!TOUCH.on)TOUCH.on=true},true);
document.addEventListener('visibilitychange',()=>{const vis=document.visibilityState==='visible';
 if(vis){if(SCREEN==='match')wake(true);if(sfx.ctx&&sfx.ctx.state==='suspended')sfx.ctx.resume().catch(()=>{})}
 else{if(sfx.ctx&&sfx.ctx.state==='running')sfx.ctx.suspend().catch(()=>{});if(SCREEN==='match'&&G&&!G.demo&&!G.paused&&G.phase!=='over')togglePause()}});
const STANDALONE=!!((window.matchMedia&&(matchMedia('(display-mode: standalone)').matches||matchMedia('(display-mode: fullscreen)').matches))||navigator.standalone);
const IS_IOS=/iPad|iPhone|iPod/.test(navigator.userAgent||'')||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
let DEFER=null;
function isGameKey(c){for(const k of['p1','p2'])for(const a in S.keys[k])if(S.keys[k][a]===c)return true;return c==='Space'||c.startsWith('Arrow')}

/* ======================= DURUM ======================= */
let G=null;            // aktif maç (gösteri maçı dahil)
let SCREEN='home';     // ui ekranı adı ya da 'match'
let TOUR=null;         // turnuva
const DEMO_SCREENS=new Set(['home','players','options','select','vs','tsetup','bracket','champion','guess','stats','settings','controls']);

function mkP(team,ctrl,role,ci){
 const ch=role==='keeper'?KEEPER:CHARS[ci];const ps=role==='keeper'?{}:(PASSIVES[ch.passive]||{});
 const r0=(role==='keeper'?KR:PR)*(ps.rad||1);
 return{team,ctrl,role,ch,ci,ps,baseR:r0,r:r0,baseM:2*(role==='keeper'?1.25:(ps.mass||1)),m:2,x:0,y:0,vx:0,vy:0,dir:team?-1:1,side:team?1:-1,
  kickBuf:0,kickHeld:false,kickLock:false,cd:0,cdMax:1,power:0,powerMul:1,curve:0,curveMag:0,homing:false,lava:false,magnet:0,magnetF:.38,ghost:0,frozen:0,boost:0,turbo:0,turboMul:1,confuse:0,slow:0,slowMul:1,grow:0,growMul:1,kickBoost:0,noCd:0,
  mx:0,my:0,ai:{err:0,side:1,passT:0,passTo:null},st:{g:0,a:0,sh:0,on:0,sv:0,hy:0,tk:0},kErr:0,diveCd:0,dive:0,kq:1,aiSpd:1,diff:1,meter:0,touchCd:0,hyperShow:0,abUses:0}
}
function touchBall(p){const o=G.lastTouch;if(o!==p){G.prevTouch=o;if(o&&o.team===p.team&&o.role==='field'&&p.role==='field'&&G.phase==='play')G.stats.passes[p.team]++}G.lastTouch=p;G.touchTeam=p.team}
function callout(x,y,name,label,lc){if(G.demo||G.frame-G.calloutF<40)return;G.calloutF=G.frame;G.pops.push({x,y,name,label,lc,t:0})}
function plist(){return G.phase==='pens'&&G.pens?G.pens.list:G.players}
function foesOf(p){return plist().filter(o=>o.team!==p.team)}

function setTeamLooks(c0,c1){
 for(const[t,ci]of[[0,c0],[1,c1]]){const c=ci==null?null:CHARS[ci];Object.assign(TEAM[t],c?{name:c.name,color:c.color,dark:c.dark,light:c.light,ui:c.ui}:DEFTEAMS[t])}
 if(cdist(TEAM[0].color,TEAM[1].color)<90){const c=TEAM[1];Object.assign(c,{color:c.light,dark:c.color,light:'#ffffff',ui:c.light})}
 document.documentElement.style.setProperty('--p0',TEAM[0].ui);document.documentElement.style.setProperty('--p1',TEAM[1].ui);
}

/* cfg: {mode:'match'|'tour'|'pens'|'train'|'watch'|'demo', format, ctrl:[c0,c1], chars:[ci,ci], diffT:[d,d], dur, et, pens, kq:[q,q], arena, names:[n,n]} */
function startMatch(cfg){
 const demo=cfg.mode==='demo';
 G={demo,cfg,score:[0,0],t:0,period:1,phase:'countdown',kickTeam:0,players:[],ball:newBall(),parts:[],uparts:[],rings:[],decoys:[],msg:null,goalTxt:null,seri:null,pops:[],
  stats:{shots:[0,0],onT:[0,0],poss:[0,0],abil:[0,0],fast:0},bh:[],frame:0,pens:null,penScore:null,lastTouch:null,touchTeam:-1,timer:0,paused:false,koT:0,after:null,
  shield:[0,0],wall:[0,0],streakTeam:-1,streak:0,rec:[],replay:null,cd:0,realT:0,train:{goals:0,shots:0,idle:0},ts:1,hs:null,cam:{trauma:0,zoom:1,fx:CX,fy:CY},
  flash:0,tint:0,tintCol:'#fff',fireworks:0,endShown:false,goals:[],prevTouch:null,calloutF:-999};
 G.stats.saves=[0,0];G.stats.passes=[0,0];
 setTeamLooks(cfg.chars[0],cfg.mode==='train'?null:cfg.chars[1]);
 if(cfg.mode==='train'){
  const m=mkP(0,cfg.ctrl[0],'field',cfg.chars[0]);m.main=true;m.diff=cfg.diffT[0];G.players.push(m);
  const k=mkP(1,'ai','keeper',0);k.kq=cfg.kq[1];G.players.push(k);
 }else{
  [0,1].forEach(team=>{const ci=cfg.chars[team],ctrl=cfg.ctrl[team];
   const m=mkP(team,ctrl,'field',ci);m.main=true;m.diff=cfg.diffT[team];G.players.push(m);
   if(cfg.format==='squad'){let bc;do{bc=rnd()*CHARS.length|0}while(cfg.chars.includes(bc));const b=mkP(team,'ai','field',bc);b.mate=true;b.diff=ctrl==='ai'?cfg.diffT[team]:Math.max(1,S.diff);G.players.push(b)}
   if(cfg.format!=='duel'){const k=mkP(team,'ai','keeper',0);k.kq=cfg.kq[team];G.players.push(k)}});
 }
 G.tps=5400/(cfg.dur*3600);
 resetPositions(0);
 if(cfg.mode==='pens'){G.phase='countdown';G.after=startPens}
 G.cd=0;
}
function newBall(){return{x:CX,y:CY,vx:0,vy:0,r:BR,m:1,spin:0,fire:0,lava:0,curveFx:0,rot:0,trail:[],slowT:0,windT:0,windDir:1,wellT:0,wellX:0,wellY:0,homingT:0,homingDir:1}}
function resetPositions(team){
 G.kickTeam=team;G.koT=0;const b=G.ball;Object.assign(b,{x:CX,y:CY,vx:0,vy:0,spin:0,fire:0,lava:0,curveFx:0,slowT:0,windT:0,wellT:0,homingT:0});b.trail=[];G.bh=[];G.decoys=[];
 if(G.cfg.mode==='train'){b.x=W*.62;b.y=CY+rr(-120,120)}
 for(const p of G.players){let x,y;
  if(p.role==='keeper'){x=24;y=CY}else if(p.mate){x=W*.2;y=H*.28}else{x=G.cfg.mode==='train'?W*.42:p.team===team?CX-36:W*.3;y=CY}
  if(p.team===1){x=W-x;if(p.mate)y=H-y}
  Object.assign(p,{x,y,vx:0,vy:0,frozen:0,ghost:0,boost:0,magnet:0,kickBuf:0,mx:0,my:0,confuse:0,slow:0,turbo:0,grow:0,power:0,curve:0,homing:false,lava:false,kickBoost:0,noCd:0})}
 G.shield=[0,0];G.wall=[0,0];G.prevTouch=null;
}

/* ======================= PERİYOT / GOL ======================= */
function toBreak(title,sub,fn){G.phase='break';G.timer=4.3;G.after=fn;G.msg={type:'break',text:title,sub,t:0}}
function endPeriod(){
 const p=G.period,c=G.cfg;G.t=LIMITS[p-1];sfx.whistle(true);const tie=G.score[0]===G.score[1];
 if(G.demo){if(p===1)toBreak('DEVRE ARASI','',()=>{G.period=2;resetPositions(1);G.phase='countdown';G.cd=0});else endMatch();return}
 const next=(per,team)=>()=>{G.period=per;resetPositions(team);G.phase='countdown';G.cd=0};
 if(p===1)toBreak('DEVRE ARASI','2. yarı başlıyor',next(2,1));
 else if(p===2){if(tie&&c.et)toBreak('UZATMALAR','Berabere! 2×15 dakika uzatma',next(3,0));else if(tie&&c.pens)toBreak('PENALTILAR','Kazananı penaltılar belirleyecek',startPens);else endMatch()}
 else if(p===3)toBreak('UZATMA ARASI','Son 15 dakika',next(4,1));
 else{if(tie&&c.pens)toBreak('PENALTILAR','Kazananı penaltılar belirleyecek',startPens);else endMatch()}
}
function onGoal(team){
 const train=G.cfg.mode==='train';
 G.score[team]++;G.phase='goal';G.realT=0;
 if(G.streakTeam===team)G.streak++;else{G.streakTeam=team;G.streak=1}
 G.netHit={s:team===0?1:0,y:clamp(G.ball.y,GY1,GY2),t:performance.now()};buzz([50,40,90]);
 let lt=G.lastTouch,pv=G.prevTouch,own=!!(lt&&lt.team!==team);const min=Math.min(120,Math.ceil(G.t/60))||1;
 // savunmacı ya da kaleci sadece sektirdiyse gol şutu çekene yazılır
 if(own&&pv&&pv.team===team){lt=pv;pv=null;own=false}
 const ast=!own&&pv&&pv!==lt&&pv.team===team&&pv.role==='field'?pv:null;
 const who=lt?(lt.role==='keeper'?'Kaleci':lt.ch.name):'';
 if(lt&&!own)lt.st.g++;if(ast)ast.st.a++;
 if(!train)G.goals.push({team,min,name:who||'?',own,ast:ast?ast.ch.name:null});
 if(!G.demo&&G.cfg.mode!=='train'&&G.cfg.ctrl[team]!=='ai'&&!own&&lt){unlock('ilkgol');if(lt.st.g>=3)unlock('hat');if(G.streak>=3)unlock('seri');if(G.players.some(q=>q.role==='keeper'&&q.team!==team&&q.kq>=4))unlock('duvar');if(ast&&ast.ctrl!=='ai')unlock('asist')}
 const isStreak=G.streak>=3;const big=(isStreak?1.35:1);
 const sub=train?`Gol ${G.score[0]}`:(own?'Kendi kalesine':who+(ast?` (${ast.ch.name})`:''))+' · '+min+"'";
 goalExplosion(team===0?W+6:-6,clamp(G.ball.y,GY1,GY2),team,big,sub,isStreak?G.streak:0);
 if(train){G.train.goals++}
}

/* ======================= PENALTILAR ======================= */
function startPens(){G.phase='pens';G.pens={turn:0,res:[[],[]],state:'aim',timer:0,list:[],wait:0};penSetup()}
function penSetup(){
 const P=G.pens,st=P.turn,dt=1-st;
 const ms=G.players.find(p=>p.main&&p.team===st),md=G.players.find(p=>p.main&&p.team===dt);
 const sh=mkP(st,ms.ctrl,'field',ms.ci);sh.dir=1;sh.x=W-PSPOT-70;sh.y=CY;sh.cd=1e9;sh.cdMax=1e9;sh.diff=ms.diff;
 const kp=mkP(dt,md.ctrl,'keeper',0);kp.side=1;kp.x=W-16;kp.y=CY;
 kp.kq=md.ctrl==='ai'?Math.max(1,G.cfg.kq[dt]):2;
 sh.ai={err:0,side:1,aimY:null,wait:40+rnd()*50};
 P.list=[sh,kp];P.sh=sh;P.kp=kp;P.state='aim';P.timer=0;
 Object.assign(G.ball,{x:W-PSPOT,y:CY,vx:0,vy:0,spin:0,fire:0,curveFx:0,slowT:0,windT:0,wellT:0,homingT:0});G.ball.trail=[];G.bh=[];G.lastTouch=null;
 if(!G.demo)setTimeout(()=>{if(G&&G.pens&&G.pens.state==='aim')sfx.whistle()},900);
 G.msg={type:'info',text:'PENALTI',sub:TEAM[st].name+' atıyor · '+TEAM[dt].name+' kalede',t:0,life:110};
}
function penLogic(){
 const P=G.pens,b=G.ball,sp=Math.hypot(b.vx,b.vy);P.timer++;
 if(P.state==='aim'){if(sp>1.2){P.state='shot';P.timer=0;P.sh.done=true}else if(P.timer>420)penResult(false)}
 else if(P.state==='shot'){if(b.x>W+b.r)penResult(true);else if(P.timer>200||(sp<.15&&P.timer>30)||b.x<W-PSPOT-140)penResult(false)}
 else if(P.state==='result'){if(--P.wait<=0){if(P.done)endMatch();else{P.turn=1-P.turn;penSetup()}}}
}
function penResult(goal){
 const P=G.pens;P.res[P.turn].push(goal);P.state='result';P.wait=120;
 if(goal){sfx.explosion(.8);G.cam.trauma=Math.max(G.cam.trauma,.6);burstGoal(W+6,clamp(G.ball.y,GY1,GY2),P.turn,.7);confetti(P.turn,.6)}else sfx.miss();
 G.msg={type:goal?'goal':'info',team:P.turn,text:goal?'GOL!':'KAÇTI!',sub:'',t:0,life:110};
 const a=P.res[0],c=P.res[1],sa=a.filter(Boolean).length,sc=c.filter(Boolean).length;
 if(a.length<=5&&c.length<=5){if(sa>sc+(5-c.length)||sc>sa+(5-a.length))P.done=true}
 if(a.length>=5&&a.length===c.length&&sa!==sc)P.done=true;
 G.penScore=[sa,sc];
}

/* ======================= YETENEKLER ======================= */
function nearestFoe(p,maxD){let t=null,bd=maxD;for(const o of foesOf(p)){const d=Math.hypot(o.x-p.x,o.y-p.y);if(d<bd){bd=d;t=o}}return t}
function dashDir(p){let dx=p.mx,dy=p.my;if(Math.abs(dx)+Math.abs(dy)<.05){dx=p.vx;dy=p.vy}if(Math.hypot(dx,dy)<.05){dx=G.ball.x-p.x;dy=G.ball.y-p.y}const l=Math.hypot(dx,dy)||1;return[dx/l,dy/l]}
function shock(p,R,fP,fB){const b=G.ball;for(const o of foesOf(p)){const dx=o.x-p.x,dy=o.y-p.y,d=Math.hypot(dx,dy);if(d<R&&d>0){const f=(fP*(1-d/R)+1.5)*(2/o.m);o.vx+=dx/d*f;o.vy+=dy/d*f}}
 const dx=b.x-p.x,dy=b.y-p.y,d=Math.hypot(dx,dy);if(d<R&&d>0){const f=fB*(1-d/R)+2;b.vx+=dx/d*f;b.vy+=dy/d*f;touchBall(p)}
 ring(p.x,p.y,R,p.ch.color,.45);ring(p.x,p.y,R*.7,'#ffffff',.35);G.cam.trauma=Math.max(G.cam.trauma,.45)}
function teleport(p,dist){const[dx,dy]=dashDir(p);burst(p.x,p.y,p.ch.ui,14,3,true);p.x=clamp(p.x+dx*dist,-MARGIN+p.r,W+MARGIN-p.r);p.y=clamp(p.y+dy*dist,-MARGIN+p.r,H+MARGIN-p.r);burst(p.x,p.y,'#ffffff',14,3,true)}
function abilityFx(p,id){
 const b=G.ball;
 switch(id){
 case'gucSutu':p.power=240;p.powerMul=1.6;break;
 case'yavasZaman':b.slowT=90;ring(b.x,b.y,70,'#9cc9ff',.5);break;
 case'atilma':{const[dx,dy]=dashDir(p);p.vx+=dx*5.8;p.vy+=dy*5.8;p.boost=26;burst(p.x,p.y,p.ch.ui,14,3,true);break}
 case'falso':p.curve=240;p.curveMag=.085;break;
 case'kalkan':G.shield[p.team]=300;break;
 case'miknatis':p.magnet=50;p.magnetF=.26;break;
 case'sokDalgasi':shock(p,150,6.5,8);break;
 case'isinlanma':teleport(p,120);break;
 case'dondur':{const t=nearestFoe(p,320);if(!t)return false;t.frozen=66;ring(t.x,t.y,40,'#7fe3ff',.4);burst(t.x,t.y,'#bff4ff',16,2.5,true);sfx.freeze();break}
 case'sasirt':{const t=nearestFoe(p,340);if(!t)return false;t.confuse=78;ring(t.x,t.y,40,'#c39ad8',.4);break}
 case'ruzgar':b.windT=72;b.windDir=p.dir;break;
 case'sisme':p.grow=240;p.growMul=1.35;break;
 case'turbo':p.turbo=180;p.turboMul=1.4;break;
 case'hayalet':p.ghost=120;break;
 case'karaDelik':b.wellT=54;b.wellX=p.dir===1?W-70:70;b.wellY=CY;ring(b.wellX,b.wellY,60,'#ff8f6b',.6);break;
 case'kokSal':{const t=nearestFoe(p,340);if(!t)return false;t.slow=120;t.slowMul=.3;ring(t.x,t.y,40,'#b7d99a',.4);break}
 case'solo':p.magnet=60;p.magnetF=.3;p.turbo=90;p.turboMul=1.25;break;
 case'roketSut':p.power=240;p.powerMul=1.75;break;
 case'nisanci':p.homing=true;p.power=240;p.powerMul=1.15;break;
 case'frikik':p.curve=240;p.curveMag=.095;p.power=240;p.powerMul=1.25;break;
 case'boslukBul':teleport(p,90);p.turbo=90;p.turboMul=1.3;break;
 case'kafaVurusu':p.power=150;p.powerMul=1.08;p.curve=150;p.curveMag=.05;break;
 case'mudahale':{shock(p,110,7,5);const t=nearestFoe(p,200);if(t){t.slow=90;t.slowMul=.5}break}
 }
 return true;
}
function hyperFx(p,id){
 const fo=foesOf(p),b=G.ball;
 switch(id){
 case'lav':p.power=300;p.powerMul=2.1;p.lava=true;break;
 case'zamanDurdur':fo.forEach(o=>{o.frozen=120});sfx.freeze();break;
 case'pike':p.turbo=360;p.turboMul=1.5;p.noCd=360;break;
 case'buyuluKivrim':p.curve=300;p.curveMag=.14;p.power=300;p.powerMul=1.35;break;
 case'kaleDuvari':G.wall[p.team]=420;break;
 case'superMiknatis':p.magnet=240;p.magnetF=.62;break;
 case'goktasi':shock(p,230,9,11);fo.forEach(o=>{if(Math.hypot(o.x-p.x,o.y-p.y)<230)o.frozen=72});break;
 case'golgeAdimi':{const ex=p.dir===1?W:0;const dx=b.x-ex,dy=b.y-CY,l=Math.hypot(dx,dy)||1;burst(p.x,p.y,p.ch.ui,14,3,true);p.x=clamp(b.x+dx/l*(p.r+BR+6),-20,W+20);p.y=clamp(b.y+dy/l*(p.r+BR+6),0,H);p.vx=p.vy=0;p.turbo=180;p.turboMul=1.35;break}
 case'buzDevri':fo.forEach(o=>{o.slow=210;o.slowMul=.5});sfx.freeze();break;
 case'kabus':fo.forEach(o=>{o.confuse=150});break;
 case'kasirga':b.windT=180;b.windDir=p.dir;break;
 case'devTunc':p.grow=480;p.growMul=1.6;p.kickBoost=480;break;
 case'isikHizi':p.turbo=420;p.turboMul=1.65;break;
 case'aynalar':p.ghost=240;for(let i=0;i<3;i++){const a=rr(-1,1)+(p.dir===1?0:Math.PI);G.decoys.push({x:b.x,y:b.y,vx:Math.cos(a)*rr(4,7),vy:Math.sin(a)*rr(4,7),life:150})}break;
 case'supernova':p.power=300;p.powerMul=1.5;p.homing=true;break;
 case'derinKok':fo.forEach(o=>{o.slow=150;o.slowMul=.1});break;
 case'kecimodu':p.magnet=180;p.magnetF=.55;p.homing=true;p.power=300;p.powerMul=1.3;break;
 case'siuuu':p.power=300;p.powerMul=2.2;p.homing=true;ring(p.x,p.y,90,'#f5d000',.5);break;
 case'kaptan':p.homing=true;p.power=300;p.powerMul=1.5;plist().filter(m=>m.team===p.team&&m.role==='field').forEach(m=>{m.turbo=240;m.turboMul=1.3});break;
 case'kontraAtak':b.windT=120;b.windDir=p.dir;plist().filter(m=>m.team===p.team&&m.role==='field').forEach(m=>{m.turbo=240;m.turboMul=1.35});break;
 case'uzakSut':p.curve=300;p.curveMag=.11;p.power=300;p.powerMul=1.9;break;
 case'yildizKayar':p.turbo=300;p.turboMul=1.45;p.ghost=180;break;
 case'tikitaka':fo.forEach(o=>{o.confuse=100});p.magnet=150;p.magnetF=.45;break;
 case'kaya':p.grow=420;p.growMul=1.5;G.shield[p.team]=420;break;
 case'tokezleme':p.slow=90;p.slowMul=.15;p.vx*=.2;p.vy*=.2;p.power=300;p.powerMul=1.2;break;
 }
 G.pops.push({x:p.x,y:p.y,name:HYPERS[id].n,t:0,col:p.ch.ui});p.st.hy++;
 G.cam.trauma=Math.max(G.cam.trauma,.35);sfx.hyper();
}
function useAbility(p){
 if(p.role!=='field'||!p.ch.active||p.frozen>0||G.phase==='pens'||G.phase==='break'||G.phase==='over'||G.phase==='countdown'||G.phase==='replay'||G.phase==='goal')return;
 if(p.cd>0&&p.noCd<=0)return;
 if(G.phase==='kickoff'&&p.team!==G.kickTeam&&G.cfg.mode!=='train')return;
 const A=ACTIVES[p.ch.active];
 if(!abilityFx(p,p.ch.active))return;
 sfx.ability(A.cat);p.abUses++;G.stats.abil[p.team]++;
 if(p.meter>=1&&p.ch.hyper){p.meter=0;hyperFx(p,p.ch.hyper)}
 p.cd=p.cdMax=A.cd*60*(p.ch.cdMul||1);
}
function addMeter(p,v){if(p.role!=='field'||!p.ch.hyper||G.demo&&false)return;const was=p.meter>=1;p.meter=Math.min(1,p.meter+v);if(!was&&p.meter>=1&&(p.ctrl!=='ai'))sfx.spawn()}

function doKick(p){
 const b=G.ball;let dx=b.x-p.x,dy=b.y-p.y;const d=Math.hypot(dx,dy)||1;dx/=d;dy/=d;
 let s=KICK*(p.ps.kick||1)*(p.ch.kick||1)*(p.kickBoost>0?1.2:1)*(G.phase==='pens'?1.25:1),big=false;
 if(p.power>0){s*=p.powerMul;p.power=0;b.fire=80;big=true;G.cam.trauma=Math.max(G.cam.trauma,.35);if(p.lava){b.lava=120;p.lava=false}}
 b.vx+=dx*s;b.vy+=dy*s;
 if(p.curve>0){let side=dx*p.my-dy*p.mx;if(Math.abs(side)<.2){const gx=p.dir===1?W:0,cx=gx-b.x,cy=CY-b.y;side=dx*cy-dy*cx>0?1:-1}b.spin=Math.sign(side)*p.curveMag*clamp(Math.abs((p.dir===1?W:0)-b.x)/600,.35,1);p.curve=0;b.curveFx=70}
 if(p.homing){b.homingT=80;b.homingDir=p.dir;p.homing=false}
 p.kickBuf=0;p.kickLock=true;touchBall(p);addMeter(p,.05);
 const sp=Math.hypot(b.vx,b.vy);
 if(p.role==='field'&&G.phase!=='pens'){const gx=p.dir===1?W:0;if(b.vx*p.dir>1&&Math.abs(gx-b.x)<650){G.stats.shots[p.team]++;p.st.sh++;if(G.cfg.mode==='train')G.train.shots++;const t=(gx-b.x)/b.vx,y=b.y+b.vy*t;if(y>GY1+4&&y<GY2-4){G.stats.onT[p.team]++;p.st.on++;addMeter(p,.05)}G.stats.fast=Math.max(G.stats.fast,sp)}}
 big?sfx.power():sfx.kick(sp);if(p.ctrl!=='ai')buzz(big?30:12);ring(b.x,b.y,big?50:26,big?'#ffb347':'#ffffff',.25);
 if(big)burst(b.x,b.y,'#ffb347',18,4,true);
}

/* ======================= FİZİK ======================= */
function collide(a,b,e){
 const dx=b.x-a.x,dy=b.y-a.y,R=a.r+b.r,d2=dx*dx+dy*dy;if(d2>=R*R||d2===0)return false;
 const d=Math.sqrt(d2),nx=dx/d,ny=dy/d,ia=a.fixed?0:1/a.m,ib=b.fixed?0:1/b.m,ov=R-d,sum=ia+ib;if(!sum)return false;
 a.x-=nx*ov*ia/sum;a.y-=ny*ov*ia/sum;b.x+=nx*ov*ib/sum;b.y+=ny*ov*ib/sum;
 const vn=(b.vx-a.vx)*nx+(b.vy-a.vy)*ny;if(vn<0){const j=-(1+e)*vn/sum;a.vx-=j*ia*nx;a.vy-=j*ia*ny;b.vx+=j*ib*nx;b.vy+=j*ib*ny}return true;
}
const POSTS=[[0,GY1],[0,GY2],[W,GY1],[W,GY2]].map(([x,y])=>({x,y,r:POST,fixed:true,vx:0,vy:0,m:1}));
function blockGoal(b,team){
 // Kalkan ya da Kale Duvarı: topu kaleden geri çıkar
 const s=team===0?1:-1;b.x=team===0?b.r+2:W-b.r-2;b.vx=s*(Math.abs(b.vx)*.9+3);b.spin=0;b.homingT=0;
 ring(team===0?0:W,clamp(b.y,GY1,GY2),70,'#ffd23f',.5);ring(team===0?0:W,clamp(b.y,GY1,GY2),110,TEAM[team].color,.6);sfx.shield();G.cam.trauma=Math.max(G.cam.trauma,.3);
 if(G.wall[team]<=0)G.shield[team]=0;
}
function ballWalls(b){
 const e=.55;let hit=false;
 if(b.y<b.r){b.y=b.r;b.vy=Math.abs(b.vy)*e;hit=true}if(b.y>H-b.r){b.y=H-b.r;b.vy=-Math.abs(b.vy)*e;hit=true}
 for(const s of[-1,1]){const lx=s<0?0:W;const inside=s<0?b.x<b.r:b.x>W-b.r;if(!inside)continue;
  if(b.y>GY1&&b.y<GY2){const deep=s<0?b.x<0:b.x>W;
   if(deep&&G.phase!=='pens'){const team=s<0?0:1;if(G.wall[team]>0||G.shield[team]>0){blockGoal(b,team);continue}}
   if(deep){if(b.y<GY1+b.r){b.y=GY1+b.r;b.vy=Math.abs(b.vy)*e}if(b.y>GY2-b.r){b.y=GY2-b.r;b.vy=-Math.abs(b.vy)*e}}
   const back=lx+s*(GD-b.r);if(s<0?b.x<back:b.x>back){b.x=back;b.vx=-b.vx*.25;b.vy*=.6}}
  else{b.x=lx-s*b.r;b.vx=-s*Math.abs(b.vx)*e;hit=true}}
 if(hit&&Math.hypot(b.vx,b.vy)>1.4)sfx.wall();
}
function restrictKO(p){
 if(G.phase!=='kickoff'||p.role==='keeper'||G.cfg.mode==='train')return;
 const own=p.team===0?p.x<=CX-p.r:p.x>=CX+p.r,edgeX=p.team===0?CX-p.r:CX+p.r;
 if(p.team===G.kickTeam){if(!own&&Math.hypot(p.x-CX,p.y-CY)>CIRC){p.x=edgeX;p.vx=0}}
 else{if(!own){p.x=edgeX;p.vx=0}const d=Math.hypot(p.x-CX,p.y-CY),R=CIRC+p.r;if(d<R){const k=R/(d||1);p.x=CX+(p.x-CX)*k;p.y=CY+(p.y-CY)*k}}
}
function keeperZone(p){
 const gl=p.side<0?0:W,o=-p.side;let x0=gl-o*8,x1=gl+o*175;
 if(G.phase==='pens'&&G.pens.state==='aim')x1=gl+o*30;
 const lo=Math.min(x0,x1),hi=Math.max(x0,x1);if(p.x<lo){p.x=lo;p.vx=0}if(p.x>hi){p.x=hi;p.vx=0}
 const yl=CY-175,yh=CY+175;if(p.y<yl){p.y=yl;p.vy=0}if(p.y>yh){p.y=yh;p.vy=0}
}
function physics(){
 const ps=plist(),b=G.ball,AR=arena(),BD=AR.bdamp||BDAMP;
 for(const p of ps){
  p.r=p.baseR*(p.grow>0?p.growMul:1);p.m=p.baseM*(p.grow>0?p.growMul*p.growMul:1);
  if(p.frozen>0){p.frozen--;p.vx*=.8;p.vy*=.8;p.mx=p.my=0;p.kickBuf=0}
  if(p.confuse>0){p.confuse--;p.mx=-p.mx;p.my=-p.my}
  let a=(p.kickHeld?KACC:ACC)*(p.ch.spd||1)*(p.ps.spd||1)*(p.ps.acc||1)*(p.ctrl==='ai'?p.aiSpd:1);
  if(p.boost>0){p.boost--;a*=1.55}if(p.ghost>0){p.ghost--;a*=1.15}if(p.turbo>0){p.turbo--;a*=p.turboMul}if(p.slow>0){p.slow--;a*=p.slowMul}
  const damp=(AR.pdamp||DAMP)-(p.ps.acc?.006:0);
  if(p.done){p.mx*=.3;p.my*=.3}
  p.vx=(p.vx+p.mx*a)*damp;p.vy=(p.vy+p.my*a)*damp;p.x+=p.vx;p.y+=p.vy;
  if(p.cd>0)p.cd--;if(p.noCd>0)p.noCd--;if(p.power>0)p.power--;if(p.curve>0)p.curve--;if(p.diveCd>0)p.diveCd--;if(p.dive>0)p.dive--;if(p.kickBuf>0)p.kickBuf--;if(p.grow>0)p.grow--;if(p.kickBoost>0)p.kickBoost--;if(p.touchCd>0)p.touchCd--;if(p.hyperShow>0)p.hyperShow--;
  if(p.magnet>0){p.magnet--;const gx=(p.dir===1?W:0)-p.x,gy=CY-p.y,gl=Math.hypot(gx,gy)||1,tx=p.x+gx/gl*(p.r+BR+3),ty=p.y+gy/gl*(p.r+BR+3);const dx=tx-b.x,dy=ty-b.y,d=Math.hypot(dx,dy),dp=Math.hypot(p.x-b.x,p.y-b.y);if(dp<170&&d>1){const f=Math.min(d*.08,p.magnetF*(1.2-dp/170));b.vx+=dx/d*f;b.vy+=dy/d*f;b.vx=b.vx*.9+p.vx*.1;b.vy=b.vy*.9+p.vy*.1}}
 }
 // top
 if(b.spin){const sp=Math.hypot(b.vx,b.vy);if(sp>.6){b.vx+=-b.vy/sp*b.spin;b.vy+=b.vx/sp*b.spin}b.spin*=.972;if(Math.abs(b.spin)<.002)b.spin=0}
 if(b.windT>0){b.windT--;b.vx+=b.windDir*.1}
 if(b.wellT>0){b.wellT--;const dx=b.wellX-b.x,dy=b.wellY-b.y,d=Math.hypot(dx,dy)||1;b.vx+=dx/d*.16;b.vy+=dy/d*.16;b.vx*=.99;b.vy*=.99}
 if(b.homingT>0){b.homingT--;const gx=b.homingDir===1?W+10:-10,sp=Math.hypot(b.vx,b.vy);if(sp>1.5&&b.vx*b.homingDir>0){const want=Math.atan2(CY-b.y,gx-b.x),cur=Math.atan2(b.vy,b.vx);let da=want-cur;while(da>Math.PI)da-=Math.PI*2;while(da<-Math.PI)da+=Math.PI*2;const na=cur+clamp(da,-.045,.045);b.vx=Math.cos(na)*sp;b.vy=Math.sin(na)*sp}}
 const tk=b.slowT>0?.55:1;if(b.slowT>0)b.slowT--;
 b.vx*=BD;b.vy*=BD;b.x+=b.vx*tk;b.y+=b.vy*tk;b.rot+=Math.hypot(b.vx,b.vy)*tk*.08;
 for(let i=0;i<ps.length;i++)for(let j=i+1;j<ps.length;j++){const p=ps[i],q=ps[j];if(p.ghost>0||q.ghost>0||p.done||q.done)continue;collide(p,q,.4)}
 const bsp=Math.hypot(b.vx,b.vy);
 for(const p of ps){if(p.done)continue;let onT=false;if(p.role==='keeper'&&bsp>3){const gl=p.side<0?0:W;if((gl-b.x)*b.vx>0){const t=(gl-b.x)/b.vx;const yy=b.y+b.vy*t;onT=t<70&&yy>GY1-3&&yy<GY2+3}}
  if(collide(p,b,p.kickHeld?.5:.25)){if(onT){const o=-p.side;if(b.vx*o<1.5&&rnd()<PARRY[clamp(p.kq,0,4)]*(G.phase==='pens'?.6:1)){b.vx=o*(1.6+Math.abs(b.vx)*.35);b.vy=b.vy*.8+(b.y<p.y?-1:1)*1.2}}
   if(onT&&G.phase==='play'){G.stats.saves[p.team]++;p.st.sv++;callout(p.x,p.y,'KURTARIŞ!','KALECİ','#9fd8ff');sfx.cheer()}touchBall(p);if(p.touchCd<=0){addMeter(p,.03);p.touchCd=20;if(!p.kickBuf)sfx.touch()}}}
 // Haxball sürme: topun önündeyken hareket eden oyuncu topu kontrol eder
 for(const p of ps){
  if(p.done||p.frozen>0||p.role!=='field'||p.kickHeld||G.phase==='pens')continue;
  const dx=b.x-p.x,dy=b.y-p.y,d=Math.hypot(dx,dy);if(d>p.r+b.r+7||d===0)continue;
  const sp=Math.hypot(p.vx,p.vy);if(sp<.5)continue;
  const al=(dx*p.vx+dy*p.vy)/(d*sp);if(al<(p.ctrl==='ai'?.85:.5))continue;
  const k=.1*(p.ps.drib||1)*al;
  b.vx+=(p.vx*1.06-b.vx)*k;b.vy+=(p.vy*1.06-b.vy)*k;
  // topu oyuncunun önündeki çizgiye hafifçe hizala
  const nx=p.vx/sp,ny=p.vy/sp,lat=dx*(-ny)+dy*nx;b.vx-=(-ny)*lat*.012*(p.ps.drib||1);b.vy-=nx*lat*.012*(p.ps.drib||1);
 }
 for(const k of POSTS){const ps0=Math.hypot(b.vx,b.vy);if(collide(k,b,.5)&&ps0>1.5){sfx.post();buzz(20);if(ps0>3.2&&G.phase==='play')callout(k.x,k.y+(k.y<CY?-14:14),'DİREK!','','')}for(const p of ps)collide(k,p,.3)}
 ballWalls(b);
 for(const p of ps){const m=MARGIN-p.r;p.x=clamp(p.x,-m,W+m);p.y=clamp(p.y,-m,H+m);if(p.role==='keeper')keeperZone(p);restrictKO(p)}
 for(const p of ps){if(p.kickBuf>0&&!p.done&&p.frozen<=0&&Math.hypot(b.x-p.x,b.y-p.y)<=p.r+b.r+5)doKick(p)}
 if(b.fire>0){b.fire--;if(G.frame%2===0)emit({x:b.x,y:b.y,vx:rr(-.4,.4),vy:rr(-.4,.4),life:26,col:rnd()<.5?'#ffb347':'#ff5a1f',s:b.lava>0?7:5,shape:'dot',add:true})}
 if(b.lava>0){b.lava--;b.fire=Math.max(b.fire,2)}
 if(b.curveFx>0)b.curveFx--;
 b.trail.push(b.x,b.y);if(b.trail.length>24)b.trail.splice(0,2);
 for(const d of G.decoys){d.x+=d.vx;d.y+=d.vy;d.vx*=.985;d.vy*=.985;d.life--;if(d.y<BR||d.y>H-BR)d.vy=-d.vy;if(d.x<BR||d.x>W-BR)d.vx=-d.vx}
 G.decoys=G.decoys.filter(d=>d.life>0);
 for(const t of[0,1]){if(G.shield[t]>0)G.shield[t]--;if(G.wall[t]>0)G.wall[t]--}
}

/* ======================= YAPAY ZEKA ======================= */
function steer(p,tx,ty){
 const dx=tx-p.x,dy=ty-p.y,l=Math.hypot(dx,dy),ms=2.7*(p.ps.spd||1)*(p.ch.spd||1)*p.aiSpd*(p.turbo>0?p.turboMul:1),s=Math.min(ms,l*.09);
 const vx=l?dx/l*s:0,vy=l?dy/l*s:0,ix=vx-p.vx,iy=vy-p.vy,m=Math.hypot(ix,iy);
 if(m<.04){p.mx=p.my=0;return}const k=Math.min(1,m/.12);p.mx=ix/m*k;p.my=iy/m*k;
}
function staleBall(lag){const h=G.bh;return h.length?h[Math.max(0,h.length-1-lag)]:G.ball}
function attackBall(p,b,gx,gy,canShoot){
 let dx=gx-b.x,dy=gy-b.y;const dl=Math.hypot(dx,dy)||1;dx/=dl;dy/=dl;
 const rx=b.x-p.x,ry=b.y-p.y,rl=Math.hypot(rx,ry)||1,align=(rx*dx+ry*dy)/rl,touch=p.r+BR;
 const px=-dy,py=dx,lat=(p.x-b.x)*px+(p.y-b.y)*py,ahead=(p.x-b.x)*dx+(p.y-b.y)*dy;
 let tx,ty,kick=false;
 if(align>.88&&rl<touch+50){tx=b.x+dx*24-px*lat*1.6;ty=b.y+dy*24-py*lat*1.6;if(rl<=touch+7&&align>.9&&canShoot)kick=true}
 else if(ahead>-touch*.35){
  // topun yanında ya da önündeyse: topa çarpmadan geniş bir yayla arkasına dolan
  const sd=Math.sign(lat)||1,R=touch+20;tx=b.x-dx*touch*.7+px*sd*R;ty=b.y-dy*touch*.7+py*sd*R;
  if(rl<touch+6){tx=p.x-rx/rl*14+px*sd*14;ty=p.y-ry/rl*14+py*sd*14}}
 else{const st=align>.7?touch+4:touch+16;tx=b.x-dx*st;ty=b.y-dy*st}
 return{tx,ty,kick,align,rl};
}
function aiAbility(p,ctx){
 if(!p.ch.active||p.cd>0)return;const q=DIFF[p.diff]||DIFF[1];if(rnd()>q.ab*3)return;
 const A=ACTIVES[p.ch.active],{gd,align,rl,oppD,myD,opp,danger,chaser}=ctx;
 const b=G.ball,toOwn=(p.dir===1?b.vx<-3:b.vx>3)&&(p.dir===1?b.x<W*.4:b.x>W*.6);
 let go=false;
 switch(A.cat){
  case'shot':go=chaser&&gd<480&&align>.85&&rl<50;break;
  case'move':go=chaser&&rl>150;break;
  case'ball':go=chaser&&rl<140&&gd<620;break;
  case'aoe':go=opp&&Math.hypot(opp.x-p.x,opp.y-p.y)<80&&myD<110&&(b.x-p.x)*p.dir>4;break;
  case'debuff':go=opp&&oppD<45&&Math.hypot(opp.x-p.x,opp.y-p.y)<280;break;
  case'save':go=toOwn&&Math.hypot(b.vx,b.vy)>4;break;
  case'attack':go=gd<360&&Math.hypot(b.vx,b.vy)>2&&b.vx*p.dir>0;break;
  case'def':go=danger&&myD<120;break;
 }
 if(go)useAbility(p);
}
function segDist(o,a,c){const vx=c.x-a.x,vy=c.y-a.y,l2=vx*vx+vy*vy||1;const t=clamp(((o.x-a.x)*vx+(o.y-a.y)*vy)/l2,0,1);return Math.hypot(a.x+vx*t-o.x,a.y+vy*t-o.y)}
function pickPass(p,b,mates,foes,gd,q){
 if(G.phase!=='play'||mates.length<2)return null;
 if(G.frame<p.ai.passT){const m=p.ai.passTo;return m&&mates.includes(m)?m:null}
 p.ai.passT=G.frame+18;p.ai.passTo=null;
 const caller=mates.find(m=>m!==p&&m.ctrl!=='ai'&&m.callT&&G.frame-m.callT<45&&m.frozen<=0);
 if(caller){let open=1e9;for(const o of foes)open=Math.min(open,segDist(o,b,caller));const d=Math.hypot(caller.x-b.x,caller.y-b.y);if(open>20&&d<520&&d>40){p.ai.passTo=caller;p.ai.passT=G.frame+40;p.ai.called=true;caller.callT=0;return caller}}
 p.ai.called=false;
 if(gd<q.range*.8)return null;
 let best=null,bs=0;
 for(const m of mates){if(m===p||m.frozen>0)continue;const adv=(m.x-b.x)*p.dir,d=Math.hypot(m.x-b.x,m.y-b.y);if(adv<70||d>430||d<90)continue;
  let open=1e9;for(const o of foes)open=Math.min(open,segDist(o,b,m));if(open<30)continue;
  let mark=1e9;for(const o of foes)mark=Math.min(mark,Math.hypot(o.x-m.x,o.y-m.y));if(mark<45)continue;
  const sc=adv+Math.min(open,120)+(m.ctrl!=='ai'?120:0)-d*.2;if(sc>bs){bs=sc;best=m}}
 if(best&&(best.ctrl!=='ai'||rnd()<.6+.15*p.diff)){p.ai.passTo=best;return best}
 return null}
function aiField(p){
 const q=DIFF[p.diff]||DIFF[1];p.aiSpd=q.spd;
 if(G.frame%90===0){p.ai.err=rnd()*2-1;if(rnd()<.3)p.ai.side=-p.ai.side}
 const sb=staleBall(q.re),d0=Math.hypot(sb.x-p.x,sb.y-p.y),t=Math.min(35,d0/3.2),f=(1-Math.pow(BDAMP,t))/(1-BDAMP);
 const b={x:clamp(sb.x+sb.vx*f,-20,W+20),y:clamp(sb.y+sb.vy*f,BR,H-BR)};
 const own=p.dir===1?0:W,enemy=W-own,ps=plist();
 if((G.phase==='kickoff'&&p.team===G.kickTeam&&G.koT<45)||G.phase==='countdown'){steer(p,p.x,p.y);return}
 const mates=ps.filter(m=>m.team===p.team&&m.role==='field'),foes=ps.filter(m=>m.team!==p.team);
 const dist=a=>Math.hypot(a.x-b.x,a.y-b.y);
 let chaser=p,best=1e9;for(const m of mates){let d=dist(m);if(m!==p&&m.ctrl!=='ai')d-=25;if(m.frozen>0)d+=200;if(d<best){best=d;chaser=m}}
 const myD=dist(p);let oppD=1e9,opp=null;for(const o of foes){const d=dist(o);if(d<oppD){oppD=d;opp=o}}
 let tx,ty,kick=false;const gd=Math.abs(enemy-b.x);let ctx={gd,align:0,rl:myD,oppD,myD,opp,danger:false,chaser:chaser===p};
 if(chaser===p){
  const ek=foes.find(o=>o.role==='keeper');
  let aimY=ek?CY+(ek.y<CY?1:-1)*GW*.36:CY+p.ai.side*GW*.2;aimY+=p.ai.err*q.err*gd;
  const ownHalf=p.dir===1?b.x<W*.6:b.x>W*.4;
  if(oppD+22<myD&&ownHalf){ctx.danger=true;const dx=own-b.x,dy=CY-b.y,l=Math.hypot(dx,dy)||1;tx=b.x+dx/l*(p.r+BR+14);ty=b.y+dy/l*(p.r+BR+14);if(myD<p.r+BR+9)kick=true}
  else{
   // pas: daha ileride ve boşta olan takım arkadaşı (insana öncelik)
   const mate=pickPass(p,b,mates,foes,gd,q);
   if(mate){const lx=mate.x+mate.vx*12+p.dir*18,ly=mate.y+mate.vy*12;const r=attackBall(p,b,lx,ly,true);tx=r.tx;ty=r.ty;ctx.align=r.align;ctx.rl=r.rl;
    const rb=G.ball,rx=rb.x-p.x,ry=rb.y-p.y,rd=Math.hypot(rx,ry)||1,ax=lx-rb.x,ay=ly-rb.y,ad=Math.hypot(ax,ay)||1,al=(rx*ax+ry*ay)/(rd*ad);
    kick=rd<=p.r+BR+6&&al>Math.cos(Math.atan((p.ai.called?60:40)/Math.max(60,ad)))}
   else{const canShoot=gd<q.range||oppD<60||(p.dir===1?b.x<W*.3:b.x>W*.7);const r=attackBall(p,b,enemy+p.dir*10,aimY,canShoot);tx=r.tx;ty=r.ty;ctx.align=r.align;ctx.rl=r.rl;
   const rb=G.ball,rx=rb.x-p.x,ry=rb.y-p.y,rd=Math.hypot(rx,ry)||1,ax=enemy+p.dir*10-rb.x,ay=aimY-rb.y,ad=Math.hypot(ax,ay)||1;const al=(rx*ax+ry*ay)/(rd*ad),need=Math.cos(Math.atan(46/Math.max(60,ad)));
   kick=rd<=p.r+BR+6&&((canShoot&&al>need)||(oppD<45&&al>.75)||(al>.8&&(p.dir===1?rb.x<W*.3:rb.x>W*.7)));}}
 }else{
  const poss=mates.some(m=>dist(m)<oppD);
  if(poss){tx=clamp(b.x+p.dir*170,60,W-60);ty=CY+(CY-b.y)*.6}else{tx=own+(b.x-own)*.45;tx=p.dir===1?Math.max(tx,110):Math.min(tx,W-110);ty=CY+(b.y-CY)*.7;ctx.danger=true}
  const cd=Math.hypot(chaser.x-tx,chaser.y-ty);if(cd<70)ty+=ty<CY?60:-60;
 }
 steer(p,tx,ty);if(kick)p.kickBuf=6;
 if(G.phase==='play')aiAbility(p,ctx);
}
function aiKeeper(p){
 const k=KQ[clamp(p.kq,0,4)];p.aiSpd=k.spd;const sb=staleBall(k.re),gl=p.side<0?0:W,o=-p.side,pens=G.phase==='pens';
 if(G.frame%k.re===0)p.kErr=(rnd()-.5)*2*k.err*(pens?.5:1);
 const bxd=Math.abs(sb.x-gl),line=gl+o*20,sp=Math.hypot(sb.vx,sb.vy);
 let py=null;const toward=sb.vx*o<-.6;
 if(toward&&sp>2.2){const t=(line-sb.x)/sb.vx;if(t>0&&t<160){py=sb.y+sb.vy*t;if(py<0)py=-py;if(py>H)py=2*H-py;if(py<GY1-40||py>GY2+40)py=null}}
 // açıyı daralt: kale ortası ile top arasındaki çizgide dur
 const depth=pens&&G.pens.state==='aim'?16:clamp(18+(bxd<460?(460-bxd)*.05:0),18,40);
 let tx=gl+o*depth,ty;
 if(py!==null){ty=py;tx=line}
 else ty=CY+(sb.y-CY)*depth/Math.max(depth+20,bxd);
 ty=clamp(ty+p.kErr,GY1+p.r*.4-6,GY2-p.r*.4+6);
 // topla gelen rakibe çık
 const db=Math.hypot(sb.x-p.x,sb.y-p.y),inZone=bxd<165&&Math.abs(sb.y-CY)<170;
 let near=1e9;for(const q of foesOf(p))near=Math.min(near,Math.hypot(q.x-sb.x,q.y-sb.y));
 if(inZone&&!(pens&&G.pens.state==='aim')){if(db<k.rush||(sp<2.5&&near<40&&bxd<130&&db<k.rush*1.5)){tx=sb.x-o*6;ty=sb.y}}
 if(py!==null&&Math.abs(sb.vx)>3.5&&p.diveCd<=0&&Math.abs(ty-p.y)>16&&rnd()<k.dive){p.vy+=Math.sign(ty-p.y)*4.4;p.diveCd=70;p.dive=20}
 if(G.phase==='countdown'){tx=p.x;ty=p.y}
 steer(p,tx,ty);
 const b=G.ball;if(Math.hypot(b.x-p.x,b.y-p.y)<=p.r+b.r+5&&(b.x-p.x)*o>-4)p.kickBuf=4;
}
function aiPenShooter(p){
 const q=DIFF[p.diff]||DIFF[1];p.aiSpd=q.spd;const b=G.ball;
 if(p.ai.aimY===null){p.ai.aimY=CY+(rnd()<.5?-1:1)*(rnd()<.15?18+rnd()*18:44+rnd()*14)+(rnd()-.5)*q.err*300;p.ai.ready=false}
 let dx=W+6-b.x,dy=p.ai.aimY-b.y;const l=Math.hypot(dx,dy);dx/=l;dy/=l;const touch=p.r+BR;
 if(!p.ai.ready){const ax=b.x-dx*(touch+38),ay=b.y-dy*(touch+38);steer(p,ax,ay);if(Math.hypot(p.x-ax,p.y-ay)<3&&Math.hypot(p.vx,p.vy)<.3){if(--p.ai.wait<=0)p.ai.ready=true}return}
 const lat=(p.x-b.x)*(-dy)+(p.y-b.y)*dx;p.mx=dx+dy*lat*.25;p.my=dy-dx*lat*.25;const m=Math.hypot(p.mx,p.my);p.mx/=m;p.my/=m;
 if(Math.hypot(b.x-p.x,b.y-p.y)<touch+12)p.kickBuf=6;
}

/* ======================= ADIM ======================= */
function readInput(p){
 const sets=p.ctrl==='p1x'?['p1','p2']:[p.ctrl];let mx=0,my=0,held=false,ek=false,ea=false;
 for(const s of sets){const k=S.keys[s];mx+=(down.has(k.right)?1:0)-(down.has(k.left)?1:0);my+=(down.has(k.down)?1:0)-(down.has(k.up)?1:0);held=held||down.has(k.kick);ek=ek||edge[s].kick;ea=ea||edge[s].ab}
 if(TOUCH.on&&(p.ctrl==='p1x'||p.ctrl==='p1')){mx+=TOUCH.mx;my+=TOUCH.my;held=held||TOUCH.kick;ek=ek||TOUCH.ek;ea=ea||TOUCH.ea}
 mx=clamp(mx,-1,1);my=clamp(my,-1,1);const l=Math.hypot(mx,my);if(l>1){mx/=l;my/=l}p.mx=mx;p.my=my;
 if(!held)p.kickLock=false;
 p.kickHeld=held&&!p.kickLock;
 if(ek){p.kickBuf=8;p.kickLock=false;if(p.role==='field'&&G.phase==='play'&&Math.hypot(G.ball.x-p.x,G.ball.y-p.y)>p.r+BR+40&&G.players.some(m=>m.team===p.team&&m!==p&&m.role==='field')){p.callT=G.frame;}}else if(p.kickHeld)p.kickBuf=Math.max(p.kickBuf,1);
 if(ea)useAbility(p);
}
function clearEdges(){for(const k of['p1','p2']){edge[k].kick=false;edge[k].ab=false}TOUCH.ek=false;TOUCH.ea=false}
function step(){
 G.frame++;const b=G.ball;
 if(G.msg&&G.msg.life){G.msg.t++;if(G.msg.t>G.msg.life)G.msg=null}
 if(['break','over','countdown','replay'].includes(G.phase)){clearEdges();return}
 G.bh.push({x:b.x,y:b.y,vx:b.vx,vy:b.vy});if(G.bh.length>40)G.bh.shift();
 const ps=plist();
 for(const p of ps){if(p.ctrl==='p1'||p.ctrl==='p2'||p.ctrl==='p1x'){if(G.phase==='goal'){p.mx=p.my=0;p.kickHeld=false}else readInput(p)}else{p.kickHeld=false;if(G.phase==='pens'&&p===G.pens.sh)aiPenShooter(p);else if(p.role==='keeper')aiKeeper(p);else aiField(p)}}
 clearEdges();
 if(G.phase==='pens'&&G.pens.state==='result')for(const p of ps)p.mx=p.my=0;
 physics();
 if(G.phase!=='pens'&&G.phase!=='goal'){G.rec.push(snap());if(G.rec.length>150)G.rec.shift()}else if(G.phase==='goal'&&G.realT<.45){G.rec.push(snap());if(G.rec.length>150)G.rec.shift()}
 if(G.phase==='pens'){penLogic();return}
 if(G.phase==='kickoff'){G.koT++;if(Math.hypot(b.vx,b.vy)>.05)G.phase='play'}
 if(G.phase==='play'){
  if(G.cfg.mode!=='train'){G.t+=G.tps;if(G.touchTeam>=0)G.stats.poss[G.touchTeam]++}
  if(b.x<-b.r)onGoal(1);else if(b.x>W+b.r)onGoal(0);
  else if(G.cfg.mode!=='train'&&G.t>=LIMITS[G.period-1])endPeriod();
  if(G.cfg.mode==='train'&&G.phase==='play'){if(Math.hypot(b.vx,b.vy)<.08&&(b.x<CX-60))G.train.idle++;else G.train.idle=0;if(G.train.idle>90){resetPositions(0);G.phase='kickoff';sfx.spawn()}}
 }
}
function snap(){const b=G.ball;return{b:[b.x,b.y,b.fire>0?1:0],p:plist().map(p=>[p.x,p.y,p.r,p.ghost>0?1:0])}}

/* ======================= EFEKTLER ======================= */
function emit(o){const arr=o.ui?G.uparts:G.parts;if(arr.length>(S.lowFx?260:QUAL[qName()].cap))return;o.max=o.life;o.vr=o.vr||0;o.rot=o.rot||rnd()*6;arr.push(o)}
function pn(n){return Math.max(1,Math.round(n*(S.lowFx?.35:QUAL[qName()].parts)))}
function burst(x,y,col,n,sp,add){for(let i=0,c=pn(n);i<c;i++){const a=rnd()*6.283,v=rnd()*sp+.5;emit({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,life:30+rnd()*20,col,s:3+rnd()*3,shape:'sq',add})}}
function ring(x,y,r,col,dur,delay=0,w=3){G.rings.push({x,y,r,col,t:-delay,dur,w})}
function burstGoal(x,y,team,big){
 const T=TEAM[team],sb=Math.sqrt(big),cols=['#ffffff','#fff1a8','#ffd23f',T.color,T.color,T.light];
 for(let i=0,n=pn(160*big);i<n;i++){const a=(team===0?Math.PI:0)+(rnd()-.5)*Math.PI*1.7,sp=rr(3.6,16)*sb;emit({x:x+rr(-6,6),y:y+rr(-GW/2,GW/2)*.6,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,life:rr(30,90),g:.12,drag:.02,col:pick(cols),s:rr(1.5,3),shape:'spark',add:true})}
 for(let i=0,n=pn(30*big);i<n;i++){const a=rnd()*6.283,sp=rr(1,6)*sb;emit({x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,life:rr(24,54),drag:.035,col:pick(['#ffffff',T.color,'#ffe48a']),s:rr(3,6),shape:'dot',add:true})}
 for(let i=0,n=pn(26*big);i<n;i++)emit({x:x+rr(-30,30)*sb,y:y+rr(-50,50),vx:(team===0?-1:1)*rr(.4,2.4)*sb,vy:rr(-1.5,1.5),life:rr(80,150),drag:.015,col:pick(['#cfe8d0','#ffffff',T.light]),s:rr(8,14),s1:rr(26,46)*sb,a0:.35,shape:'smoke'});
 for(let i=0,n=pn(22*big);i<n;i++){const a=(team===0?Math.PI:0)+(rnd()-.5)*2.2,sp=rr(3,9)*sb;emit({x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,life:rr(70,120),drag:.03,col:pick([T.dark,T.color,'#ffffff']),s:rr(4,8),shape:rnd()<.5?'tri':'sq',vr:rr(-.25,.25),a0:1,a1:1})}
 const waves=S.lowFx?[[0,190,14,.52]]:[[0,190,14,.52],[.09,270,9,.64],[.18,350,5,.76]];for(const[d,r,w,dur]of waves)ring(x,y,r*sb,T.color,dur,d,w*Math.min(1.5,big));
}
function confetti(team,big){
 const T=TEAM[team],cols=[T.color,T.light,'#ffffff','#ffd23f','#ff4d8d','#4dffb8'];const x0=team===0?FX+W/2:FX,x1=team===0?FX+W:FX+W/2;
 for(let i=0,n=pn(70*big);i<n;i++)emit({ui:true,x:rr(x0,x1),y:rr(-80,-10),vx:rr(-.7,.7),vy:rr(.7,2.5),life:rr(130,200),g:.033,drag:.01,col:pick(cols),s:rr(6,10),shape:'conf',flutter:rr(.1,.22),vr:rr(-.07,.07),a0:1,a1:1});
 for(const side of[0,1]){const sx=side?VW:0;for(let i=0,n=pn(40*big);i<n;i++){const a=side===0?-Math.PI/2+rr(.2,.8):-Math.PI/2-rr(.2,.8),sp=rr(11,21);emit({ui:true,x:sx,y:VH-20,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,life:rr(110,170),g:.24,drag:.022,col:pick(cols),s:rr(6,10),shape:'conf',flutter:rr(.12,.24),vr:rr(-.14,.14),a0:1,a1:1})}}
 sfx.confetti();
}
function goalExplosion(x,y,team,big,sub,streak){
 const demo=G.demo;
 G.hs={t:0,freeze:demo?0:.08,slow:demo?.3:.7,scale:.25,rec:.35};
 burstGoal(x,y,team,demo?.6:big);
 G.cam.trauma=Math.max(G.cam.trauma,(demo?.35:.85)*Math.min(1.25,big));
 if(!S.lowFx&&!demo){G.cam.fx=x;G.cam.fy=y;G.cam.zt=0;G.cam.zmax=1+.12*Math.min(big,1.5)}
 G.flash=demo?.2:.85;G.tint=.35*Math.min(1.3,big);G.tintCol=TEAM[team].color;
 sfx.explosion(big);
 if(!demo){G.goalTxt={t:-.3,team,sub:sub||`${TEAM[team].name} +1`};setTimeout(()=>{if(G&&!G.demo)confetti(team,big)},300);G.scorePop={team,t:-.5};if(streak)G.seri={t:-.68,n:streak,team}}
}
function updateFx(dt){
 const step=a=>{for(const q of a){q.life--;q.vy+=q.g||0;if(q.drag){q.vx*=1-q.drag;q.vy*=1-q.drag}q.x+=q.vx;q.y+=q.vy;q.rot+=q.vr}};
 // dt: simülasyon karesi sayısı (1); burada kare başına çağrılır
 step(G.parts);G.parts=G.parts.filter(q=>q.life>0);
}
function updateUiFx(){for(const q of G.uparts){q.life--;q.vy+=q.g||0;if(q.drag){q.vx*=1-q.drag;q.vy*=1-q.drag}q.x+=q.vx;q.y+=q.vy;q.rot+=q.vr}G.uparts=G.uparts.filter(q=>q.life>0)}

