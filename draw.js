'use strict';
/* ======================= ÇİZİM ======================= */
const cv=$('cv'),ctx=cv.getContext('2d');
const QUAL={yuksek:{res:2,parts:1,cap:900},orta:{res:1.25,parts:.6,cap:500},dusuk:{res:1,parts:.35,cap:300}};
let autoQ='yuksek';const qName=()=>S.quality==='auto'?autoQ:S.quality;
const VIEW={s:1,k:1};
const crowd=[];{for(let i=0;i<1400;i++){let x,y;do{x=rnd()*VW;y=rnd()*VH}while(x>FX-MARGIN-10&&x<FX+W+MARGIN+10&&y>FY-MARGIN-10&&y<FY+H+MARGIN+10);crowd.push({x,y,c:rnd()<.5?0:1,a:.15+rnd()*.35,p:rnd()*6})}}
const snow=[];for(let i=0;i<120;i++)snow.push({x:rnd()*VW,y:rnd()*VH,v:rr(.4,1.2),s:rr(1,2.6)});
const rain=[];for(let i=0;i<220;i++)rain.push({x:rnd()*(VW+200),y:rnd()*VH,v:rr(9,15)});
let LAY='';function layout(){
 const w=innerWidth,h=innerHeight,s=Math.min(w/VW,h/VH);const key=w+'x'+h+qName()+(devicePixelRatio||1);if(key===LAY)return;LAY=key;$('game').style.transform=`translate(-50%,-50%) scale(${s})`;VIEW.s=s;
 const dpr=Math.min(QUAL[qName()].res,devicePixelRatio||1);const cw=Math.max(320,Math.round(VW*s*dpr)),ch=Math.max(180,Math.round(VH*s*dpr));
 if(cv.width!==cw||cv.height!==ch){cv.width=cw;cv.height=ch}VIEW.k=cw/VW;
}
addEventListener('resize',layout);
function jersey(c,num,x,y,r,col,dark){
 const t=String(num);c.save();c.textAlign='center';c.textBaseline='middle';c.font=`italic 800 ${Math.round(r*(t.length>1?1.12:1.3))}px "Barlow Condensed","Arial Narrow",sans-serif`;
 c.lineJoin='round';c.lineWidth=Math.max(1.5,r*.16);c.strokeStyle=dark;c.strokeText(t,x,y+r*.06);c.fillStyle=col;c.fillText(t,x,y+r*.06);c.restore();
}
function drawDisc(c,x,y,r,ch,col,opts={}){
 const T=col||ch;c.save();
 c.fillStyle='rgba(0,0,0,.35)';c.beginPath();c.ellipse(x+r*.2,y+r*.33,r,r*.85,0,0,6.283);c.fill();
 const g=c.createRadialGradient(x-r*.4,y-r*.45,r*.1,x,y,r);g.addColorStop(0,T.light);g.addColorStop(.55,T.color);g.addColorStop(1,T.dark);
 c.fillStyle=g;c.beginPath();c.arc(x,y,r,0,6.283);c.fill();
 c.lineWidth=opts.kick?r*.2:r*.13;c.strokeStyle=opts.kick?'#ffffff':'rgba(0,0,0,.5)';c.stroke();
 if(opts.ring){c.strokeStyle=opts.ring;c.lineWidth=r*.12;c.beginPath();c.arc(x,y,r*.8,0,6.283);c.stroke()}
 const lt=lum(T.color)>.62;jersey(c,ch.num??'',x,y,r,lt?'#151a24':'#ffffff',lt?'rgba(255,255,255,.55)':'rgba(0,0,0,.45)');
 c.restore();
}
function rrect(c,x,y,w,h,r){c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath()}
function arena(){return ARENAS.find(a=>a.id===(G?G.cfg.arena:S.arena))||ARENAS[0]}
function drawBackground(){
 const A=arena();const g=ctx.createRadialGradient(VW/2,VH/2,100,VW/2,VH/2,VW*.75);g.addColorStop(0,A.bg[0]);g.addColorStop(1,A.bg[1]);ctx.fillStyle=g;ctx.fillRect(0,0,VW,VH);
 if(A.crowd){const hype=G&&G.phase==='goal'?1:0;for(const c of crowd){ctx.fillStyle=TEAM[c.c].color;ctx.globalAlpha=c.a*(hype?.7+.6*Math.abs(Math.sin(G.frame*.2+c.p)):1);ctx.fillRect(c.x,c.y+(hype?Math.sin(G.frame*.35+c.p)*2:0),4,4)}ctx.globalAlpha=1}
}
function drawPitch(){
 const A=arena(),x0=-MARGIN,y0=-MARGIN,w=W+MARGIN*2,h=H+MARGIN*2;
 ctx.save();rrect(ctx,x0,y0,w,h,22);ctx.fillStyle=A.grass[1];ctx.fill();ctx.clip();
 if(A.wood){for(let i=0;i<26;i++){ctx.fillStyle=i%2?'#d29d63':'#dca86f';ctx.fillRect(x0,y0+i*h/26,w,h/26+.5)}}
 else for(let i=0;i<12;i++){ctx.fillStyle=i%2?A.grass[0]:A.grass[1];ctx.fillRect(i*W/12,-MARGIN,W/12+.5,h)}
 const lg=ctx.createRadialGradient(CX,CY,60,CX,CY,640);lg.addColorStop(0,A.light);lg.addColorStop(1,'rgba(0,0,0,.3)');ctx.fillStyle=lg;ctx.fillRect(x0,y0,w,h);
 ctx.restore();
 ctx.strokeStyle=A.line;ctx.lineWidth=2.5;ctx.strokeRect(0,0,W,H);
 ctx.beginPath();ctx.moveTo(CX,0);ctx.lineTo(CX,H);ctx.stroke();
 const ko=G&&G.phase==='kickoff'&&G.cfg.mode!=='train';
 ctx.beginPath();ctx.arc(CX,CY,CIRC,0,6.283);if(ko){ctx.fillStyle=TEAM[G.kickTeam].color+'26';ctx.fill()}ctx.stroke();
 ctx.fillStyle=A.line;ctx.beginPath();ctx.arc(CX,CY,3.5,0,6.283);ctx.fill();
 for(const s of[0,1]){const x=s?W:0,o=s?-1:1;ctx.strokeRect(Math.min(x,x+o*PBOX),CY-150,PBOX,300);ctx.strokeRect(Math.min(x,x+o*58),CY-100,58,200);
  ctx.beginPath();ctx.arc(x+o*PSPOT,CY,3,0,6.283);ctx.fill();ctx.beginPath();ctx.arc(x+o*PSPOT,CY,62,s?Math.PI-.75:-.75,s?Math.PI+.75:.75);ctx.stroke()}
 for(const s of[0,1]){const tm=G&&G.phase==='pens'?(s?1-G.pens.turn:G.pens.turn):s;const T=TEAM[tm],x=s?W:-GD;
  ctx.fillStyle=T.color+'2e';ctx.fillRect(x,GY1,GD,GW);ctx.save();ctx.beginPath();ctx.rect(x,GY1,GD,GW);ctx.clip();ctx.strokeStyle='rgba(255,255,255,.2)';ctx.lineWidth=1;
  for(let i=-GW;i<GW+GD;i+=9){ctx.beginPath();ctx.moveTo(x+i,GY1);ctx.lineTo(x+i+GW,GY2);ctx.moveTo(x+i+GW,GY1);ctx.lineTo(x+i,GY2);ctx.stroke()}ctx.restore();
  ctx.strokeStyle='rgba(255,255,255,.85)';ctx.lineWidth=2.5;ctx.beginPath();const bx=s?W+GD:-GD;ctx.moveTo(s?W:0,GY1);ctx.lineTo(bx,GY1);const nh=G&&G.netHit&&G.netHit.s===s?G.netHit:null,nt=nh?(performance.now()-nh.t)/1000:9;if(nt<1.3){const k=22*Math.exp(-3*nt)*Math.cos(nt*15);ctx.quadraticCurveTo(bx+(s?1:-1)*k,nh.y,bx,GY2)}else ctx.lineTo(bx,GY2);ctx.lineTo(s?W:0,GY2);ctx.stroke();
  if(G&&G.phase!=='pens'&&(G.wall[s]>0||G.shield[s]>0)){const k=G.wall[s]>0;ctx.save();ctx.globalAlpha=.5+.3*Math.sin(G.frame*.25);ctx.strokeStyle=k?'#ffd23f':TEAM[s].light;ctx.lineWidth=k?7:5;ctx.shadowColor=ctx.strokeStyle;ctx.shadowBlur=16;ctx.beginPath();ctx.moveTo(s?W:0,GY1);ctx.lineTo(s?W:0,GY2);ctx.stroke();ctx.restore()}}
 for(const k of POSTS){const tm=k.x?1:0;ctx.shadowColor=TEAM[tm].color;ctx.shadowBlur=12;ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(k.x,k.y,POST,0,6.283);ctx.fill();ctx.shadowBlur=0}
}
function drawPlayer(p,pos){
 const T=TEAM[p.team];const x=pos?pos[0]:p.x,y=pos?pos[1]:p.y,r=pos?pos[2]:p.r;
 ctx.save();if((pos?pos[3]:p.ghost>0)||p.done)ctx.globalAlpha=p.done?.35:.45;
 if(!pos){
  if(p.magnet>0){ctx.strokeStyle=p.ch.ui;ctx.globalAlpha*=.6;ctx.setLineDash([6,8]);ctx.lineDashOffset=-G.frame;ctx.lineWidth=2;ctx.beginPath();ctx.arc(x,y,170,0,6.283);ctx.stroke();ctx.setLineDash([]);ctx.globalAlpha/=.6}
  if(p.boost>0||p.dive>0||p.turbo>0){ctx.fillStyle=(p.role==='keeper'?'#ffffff':p.ch.ui)+'55';for(let k=1;k<=3;k++){ctx.beginPath();ctx.arc(x-p.vx*2.2*k,y-p.vy*2.2*k,r*(1-k*.18),0,6.283);ctx.fill()}}
 }
 drawDisc(ctx,x,y,r,p.ch,p.role==='keeper'?{color:T.color,dark:T.dark,light:T.light}:T,{kick:!pos&&p.kickHeld,ring:p.role==='keeper'?'#ffe66d':null});
 if(!pos){
  if(p.frozen>0){ctx.fillStyle='rgba(170,235,255,.55)';ctx.beginPath();ctx.arc(x,y,r+3,0,6.283);ctx.fill();ctx.strokeStyle='#e8fbff';ctx.lineWidth=2;ctx.stroke()}
  if(p.confuse>0){ctx.fillStyle='#c39ad8';for(let k=0;k<3;k++){const a=G.frame*.15+k*2.09;ctx.beginPath();ctx.arc(x+Math.cos(a)*(r+6),y-r-4+Math.sin(a)*4,2.6,0,6.283);ctx.fill()}}
  if(p.slow>0){ctx.strokeStyle='#b7d99a';ctx.lineWidth=2;ctx.setLineDash([3,4]);ctx.beginPath();ctx.arc(x,y,r+4,0,6.283);ctx.stroke();ctx.setLineDash([])}
  if(p.power>0){ctx.strokeStyle=p.lava?'#ff3d1f':'#ff8a2a';ctx.lineWidth=3;ctx.shadowColor='#ff6a00';ctx.shadowBlur=14;ctx.beginPath();ctx.arc(x,y,r+4+Math.sin(G.frame*.3)*1.5,0,6.283);ctx.stroke();ctx.shadowBlur=0;if(G.frame%3===0)emit({x:x+rr(-r,r),y:y+rr(-r,r),vx:0,vy:-.6,life:20,col:'#ff9a3d',s:3,shape:'dot',add:true})}
  if(p.curve>0){ctx.strokeStyle='#46ffa0';ctx.lineWidth=2.5;const a=G.frame*.15;ctx.beginPath();ctx.arc(x,y,r+5,a,a+2);ctx.stroke();ctx.beginPath();ctx.arc(x,y,r+5,a+3.14,a+5.14);ctx.stroke()}
  if(p.homing){ctx.strokeStyle='#ffd23f';ctx.lineWidth=2;ctx.beginPath();ctx.arc(x,y,r+6+Math.sin(G.frame*.2)*2,0,6.283);ctx.stroke()}
  if(p.role==='field'&&p.ch.active&&p.cdMax<1e8){const k=p.cd>0&&p.noCd<=0?1-p.cd/p.cdMax:1;ctx.strokeStyle=p.meter>=1?'#ffd23f':p.ch.ui;ctx.globalAlpha*=p.cd>0&&p.noCd<=0?.45:.6+.4*Math.sin(G.frame*.12);ctx.lineWidth=2.5;ctx.beginPath();ctx.arc(x,y,r+8,-1.571,-1.571+6.283*k);ctx.stroke();ctx.globalAlpha=p.ghost>0?.45:1}
  if(p.callT&&G.frame-p.callT<45){ctx.font='800 13px "Barlow Condensed",sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';const by=y-r-38;rrect(ctx,x-19,by-9,38,18,9);ctx.fillStyle='#ffd23f';ctx.fill();ctx.fillStyle='#0f2433';ctx.fillText('PAS!',x,by+1)}
  if(p.ctrl!=='ai'){const t=p.ctrl==='p2'?'P2':'P1';ctx.font='700 13px "Barlow Condensed",sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';const ty=y-r-18;rrect(ctx,x-15,ty-9,30,18,9);ctx.fillStyle='rgba(6,10,18,.8)';ctx.fill();ctx.fillStyle=T.light;ctx.fillText(t,x,ty+1)}
 }
 ctx.restore();
}
function drawBallAt(x,y,rot,fire,alpha=1,trail){
 const b=G.ball;ctx.save();ctx.globalAlpha=alpha;
 if(trail){const t=b.trail;for(let i=0;i<t.length;i+=2){const a=i/t.length;ctx.fillStyle=b.fire>0?`rgba(255,${b.lava>0?80:140},40,${a*.5})`:b.curveFx>0?`rgba(70,255,160,${a*.4})`:b.homingT>0?`rgba(255,210,63,${a*.4})`:`rgba(255,255,255,${a*.18})`;ctx.beginPath();ctx.arc(t[i],t[i+1],b.r*a,0,6.283);ctx.fill()}}
 ctx.fillStyle='rgba(0,0,0,.35)';ctx.beginPath();ctx.ellipse(x+3,y+4,BR,BR*.8,0,0,6.283);ctx.fill();
 if(fire){ctx.shadowColor='#ff7a1a';ctx.shadowBlur=20}else{ctx.shadowColor='rgba(255,255,255,.6)';ctx.shadowBlur=8}
 const g=ctx.createRadialGradient(x-3,y-3,1,x,y,BR);g.addColorStop(0,'#ffffff');g.addColorStop(1,'#c9d2e3');ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,BR,0,6.283);ctx.fill();ctx.shadowBlur=0;
 ctx.strokeStyle='#1a2233';ctx.lineWidth=1.6;ctx.beginPath();ctx.arc(x,y,BR,0,6.283);ctx.stroke();
 ctx.fillStyle='#1a2233';for(let i=0;i<3;i++){const a=rot+i*2.094;ctx.beginPath();ctx.arc(x+Math.cos(a)*BR*.5,y+Math.sin(a)*BR*.5,2.1,0,6.283);ctx.fill()}
 ctx.restore();
}
function drawParts(arr){
 for(const q of arr){const t=1-q.life/q.max;let a=q.a0??1;a=a+((q.a1??0)-a)*t;if(q.life<12&&q.a1===1)a*=q.life/12;ctx.globalAlpha=Math.max(0,Math.min(1,a));
  if(q.add)ctx.globalCompositeOperation='lighter';ctx.fillStyle=q.col;ctx.strokeStyle=q.col;
  const s=q.s1!=null?q.s+(q.s1-q.s)*t:q.s*(1-t*.6);
  switch(q.shape){
   case'spark':{ctx.lineWidth=s;const sp=Math.hypot(q.vx,q.vy);ctx.beginPath();ctx.moveTo(q.x,q.y);ctx.lineTo(q.x-q.vx*(1+sp*.4),q.y-q.vy*(1+sp*.4));ctx.stroke();break}
   case'dot':ctx.beginPath();ctx.arc(q.x,q.y,s/2,0,6.283);ctx.fill();break;
   case'smoke':ctx.beginPath();ctx.arc(q.x,q.y,s,0,6.283);ctx.fill();break;
   case'tri':ctx.save();ctx.translate(q.x,q.y);ctx.rotate(q.rot);ctx.beginPath();ctx.moveTo(0,-s);ctx.lineTo(s*.9,s*.7);ctx.lineTo(-s*.9,s*.7);ctx.closePath();ctx.fill();ctx.restore();break;
   case'conf':ctx.save();ctx.translate(q.x,q.y);ctx.rotate(q.rot);ctx.scale(Math.cos(q.life*q.flutter),1);ctx.fillRect(-s/2,-s*.3,s,s*.6);ctx.restore();break;
   default:ctx.save();ctx.translate(q.x,q.y);ctx.rotate(q.rot);ctx.fillRect(-s/2,-s/2,s,s);ctx.restore();
  }
  ctx.globalCompositeOperation='source-over'}
 ctx.globalAlpha=1;
}
const ease={oc:t=>1-Math.pow(1-t,3),iq:t=>t*t,ob:t=>{const c1=1.70158,c3=c1+1;return 1+c3*Math.pow(t-1,3)+c1*Math.pow(t-1,2)},oe:t=>t===0?0:t===1?1:Math.pow(2,-10*t)*Math.sin((t*10-.75)*(2*Math.PI)/3)+1,ioq:t=>t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2};
const F=(w,s)=>`${w} ${s}px "Barlow Condensed","Arial Narrow",sans-serif`;
function fitText(s,maxW){if(ctx.measureText(s).width<=maxW)return s;while(s.length>1&&ctx.measureText(s+'…').width>maxW)s=s.slice(0,-1);return s+'…'}
function drawHUD(){
 // HyperVolley ölçüsünde (800x450) çizilir
 ctx.save();ctx.scale(K16,K16);ctx.textBaseline='middle';
 const SURF='#0f2433',train=G.cfg.mode==='train';
 // skor tabelası
 ctx.save();ctx.translate(400,32);
 let pop=1;if(G.scorePop&&G.scorePop.t>0&&G.scorePop.t<.35)pop=1.08-.08*ease.ob(G.scorePop.t/.35);ctx.scale(pop,pop);
 rrect(ctx,-116,-24,232,48,8);ctx.fillStyle=SURF;ctx.fill();
 ctx.fillStyle=TEAM[0].ui;ctx.fillRect(-116,20,92,4);ctx.fillStyle=train?'#2a4e63':TEAM[1].ui;ctx.fillRect(24,20,92,4);
 for(const s of[0,1]){let sy=1,sc=1;const sp=G.scorePop;if(sp&&sp.team===s&&sp.t>0){if(sp.t<.12)sy=1-sp.t/.12;else if(sp.t<.42)sy=ease.ob((sp.t-.12)/.3);if(sp.t<.5)sc=1.4-.4*ease.oe(sp.t/.5);
   if(sp.t<.8){ctx.globalAlpha=.7*(1-sp.t/.8);const g=ctx.createRadialGradient(s?72:-72,-2,2,s?72:-72,-2,40);g.addColorStop(0,TEAM[s].color);g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.fillRect(s?32:-112,-24,80,48);ctx.globalAlpha=1}}
  const shown=sp&&sp.team===s&&sp.t<.12?G.score[s]-1:G.score[s];
  ctx.save();ctx.translate(s?72:-72,-2);ctx.scale(sc,sc*Math.max(.02,sy));ctx.fillStyle='#f4f1e8';ctx.font=F(700,36);ctx.textAlign='center';ctx.fillText(train&&s===1?'–':String(shown),0,1);ctx.restore()}
 ctx.textAlign='center';
 if(train){ctx.fillStyle='#9fb0b9';ctx.font=F(600,11);ctx.fillText('ANTRENMAN',0,-11);ctx.fillStyle='#d9c49a';ctx.font=F(700,17);ctx.fillText(`Şut ${G.train.shots}`,0,6)}
 else if(G.phase==='pens'||G.penScore){ctx.fillStyle='#9fb0b9';ctx.font=F(600,11);ctx.fillText('PENALTILAR',0,-11);ctx.fillStyle='#ffd23f';ctx.font=F(700,17);ctx.fillText(G.penScore?`${G.penScore[0]} – ${G.penScore[1]}`:'0 – 0',0,6)}
 else{ctx.fillStyle='#9fb0b9';ctx.font=F(600,11);ctx.fillText(['1. YARI','2. YARI','UZATMA 1','UZATMA 2'][G.period-1],0,-11);ctx.fillStyle='#d9c49a';ctx.font=F(700,17);const m=Math.min(Math.floor(G.t/60),LIMITS[G.period-1]/60);ctx.fillText(m+"'",0,6)}
 ctx.restore();
 if(G.pens){for(const s of[0,1]){const r=G.pens.res[s],n=Math.max(5,r.length+(G.pens.turn===s&&G.pens.state!=='result'?1:0));for(let i=0;i<n;i++){const x=s?446+i*12:354-i*12;ctx.beginPath();ctx.arc(x,64,4.2,0,6.283);ctx.fillStyle=i<r.length?(r[i]?'#46ffa0':'#ff5449'):'rgba(15,36,51,.85)';ctx.fill()}}}
 // oyuncu kartları
 for(const p of G.players.filter(q=>q.main))drawCard(p);
 ctx.restore();
}
function drawCard(p){
 const s=p.team,T=TEAM[s],right=s===1,Wc=246,Hc=48,X=x=>right?Wc-x:x,acc=T.ui;
 const rx=right?800-12-Wc:12,ry=8;
 // top ya da oyuncu kartın altındaysa saydamlaş
 const b=G.ball,bx=(FX+b.x)/K16,by=(FY+b.y)/K16;let hide=by<ry+80&&bx>rx-20&&bx<rx+Wc+20;for(const q of plist()){const qx=(FX+q.x)/K16,qy=(FY+q.y)/K16;if(qy<ry+82&&qx>rx-20&&qx<rx+Wc+20)hide=true}
 p.cardA=(p.cardA??1)+((hide?.35:1)-(p.cardA??1))*.15;
 ctx.save();ctx.globalAlpha=p.cardA;ctx.translate(rx,ry);
 const hasH=!!p.ch.hyper;
 // pasif etiketi
 if(p.ch.passive){ctx.font=F(700,10);const lw=ctx.measureText('PASİF').width;ctx.font=F(600,12);const pn=PASSIVES[p.ch.passive].n,tw=ctx.measureText(pn).width;const w=14+lw+6+tw+12,x=right?Wc-10-w:10;
  rrect(ctx,x,Hc-10,w,28,7);ctx.fillStyle='rgba(23,56,76,.95)';ctx.fill();ctx.textAlign='left';ctx.fillStyle='#9fb0b9';ctx.font=F(700,10);ctx.fillText('PASİF',x+14,Hc+9);ctx.fillStyle='#f4f1e8';ctx.font=F(600,12);ctx.fillText(pn,x+14+lw+6,Hc+9)}
 rrect(ctx,0,0,Wc,Hc,8);ctx.fillStyle=hasH?'#08161f':acc;ctx.fill();
 if(hasH){ctx.globalAlpha*=.3;ctx.fillStyle=acc;ctx.fill();ctx.globalAlpha=p.cardA}
 rrect(ctx,0,0,Wc,Hc-4,8);ctx.fillStyle='#0f2433';ctx.fill();ctx.fillRect(0,Hc-12,Wc,8);
 // hyper barı
 const ready=p.meter>=1,pulse=.5+.5*Math.sin(performance.now()*.012);
 if(hasH){const w=Wc-6,fw=w*p.meter;if(fw>.5){ctx.fillStyle=ready?'#ffd23f':acc;ctx.globalAlpha=p.cardA*(ready?.55+.45*pulse:1);ctx.fillRect(right?3+w-fw:3,Hc-4,fw,4);ctx.globalAlpha=p.cardA}
  if(ready){ctx.strokeStyle='#ffd23f';ctx.lineWidth=2;ctx.globalAlpha=p.cardA*(.3+.5*pulse);rrect(ctx,0,0,Wc,Hc,8);ctx.stroke();ctx.globalAlpha=p.cardA}}
 // yetenek karesi
 const x0=X(right?42:6),y0=4,S2=36,cx=X(24),cy=22;
 const cd=p.noCd>0?0:p.cd,rd=cd<=0;
 if(rd){rrect(ctx,x0,y0,S2,S2,7);ctx.fillStyle=acc;ctx.fill();const kc=lum(acc)>.42?'#14100a':'#ffffff';ctx.fillStyle=kc;
  if(p.ctrl==='ai'){ctx.beginPath();ctx.moveTo(cx+2,cy-11);ctx.lineTo(cx-6,cy+2);ctx.lineTo(cx-1,cy+2);ctx.lineTo(cx-3,cy+11);ctx.lineTo(cx+6,cy-2);ctx.lineTo(cx+1,cy-2);ctx.closePath();ctx.fill()}
  else{const kl=TOUCH.on&&p.ctrl!=='p2'?'YET':keyLabel(S.keys[p.ctrl==='p2'?'p2':'p1'].ab);ctx.font=F(700,kl.length>2?12:20);ctx.textAlign='center';ctx.fillText(kl.length>6?kl.replace(' Shift','⇧'):kl,cx,cy+1)}
  if(ready){ctx.strokeStyle='#ffd23f';ctx.lineWidth=2.5;ctx.globalAlpha=p.cardA*(.45+.55*pulse);rrect(ctx,x0-2.5,1.5,41,41,9);ctx.stroke();ctx.globalAlpha=p.cardA}}
 else{rrect(ctx,x0,y0,S2,S2,7);ctx.fillStyle='#08161f';ctx.fill();const f=1-cd/p.cdMax;ctx.fillStyle=acc;ctx.globalAlpha=p.cardA*.4;ctx.beginPath();ctx.moveTo(cx,cy);ctx.arc(cx,cy,15,-Math.PI/2,-Math.PI/2+f*6.283);ctx.closePath();ctx.fill();ctx.globalAlpha=p.cardA*.5;ctx.strokeStyle=acc;ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(cx,cy,15,0,6.283);ctx.stroke();ctx.globalAlpha=p.cardA;ctx.fillStyle='#f4f1e8';ctx.font=F(700,17);ctx.textAlign='center';ctx.fillText(String(Math.ceil(cd/60)),cx,cy+1)}
 // yazılar
 ctx.textAlign=right?'right':'left';const nm=G.cfg.names&&G.cfg.names[s]?G.cfg.names[s]:p.ch.name;
 ctx.fillStyle='#f4f1e8';ctx.font=F(700,19);ctx.fillText(fitText(nm,Wc-52-62),X(52),15);
 const tag=p.ctrl==='ai'?'BOT':p.ctrl==='p2'?'P2':'P1';ctx.font=F(700,12);ctx.fillStyle='#9fb0b9';ctx.textAlign=right?'left':'right';ctx.fillText(G.cfg.names&&G.cfg.names[s]?p.ch.name+' · '+tag:tag,X(Wc-10),15);
 ctx.textAlign=right?'right':'left';
 const hyRun=p.hyperShow>0;ctx.font=F(700,14);ctx.fillStyle=ready||hyRun?'#ffd23f':acc;
 ctx.fillText(ready?'HYPER HAZIR':ACTIVES[p.ch.active].n,X(52),33);
 ctx.restore();
}
function drawOverlays(dtR){
 ctx.save();ctx.scale(K16,K16);ctx.textAlign='center';ctx.textBaseline='middle';
 const cy=FY/K16+H/K16/2;
 // GOL! yazısı
 const gt=G.goalTxt;if(gt&&gt.t>0){const T=TEAM[gt.team],t=gt.t;let x=400,sc=1,al=1;if(t<.38)x=-520+920*ease.ob(t/.38);const hold=1.2;if(t>.38+hold){const e=Math.min(1,(t-.38-hold)/.32);sc=1+.7*e;al=1-e}
  if(al>0){ctx.save();ctx.globalAlpha=al;ctx.translate(x,205);ctx.scale(sc,sc);ctx.font=`italic 800 132px "Barlow Condensed",sans-serif`;ctx.lineJoin='round';ctx.lineWidth=12;ctx.strokeStyle=T.color;ctx.strokeText('GOL!',0,0);ctx.fillStyle='#ffffff';ctx.fillText('GOL!',0,0);ctx.restore();
   const st=t-.12;if(st>0){ctx.save();ctx.globalAlpha=Math.min(1,st/.3)*al;ctx.font=F(700,22);ctx.fillStyle='#ffffff';ctx.shadowColor='rgba(0,0,0,.6)';ctx.shadowBlur=6;ctx.fillText(gt.sub,400,300-16*Math.min(1,st/.3));ctx.restore()}}}
 const se=G.seri;if(se&&se.t>0&&se.t<1.6){ctx.save();ctx.globalAlpha=se.t>1.3?1-(se.t-1.3)/.3:1;ctx.translate(400,112);ctx.rotate(-.08);const e=Math.min(1,se.t/.6);ctx.scale(ease.oe(e),ease.oe(e));ctx.font=`italic 800 46px "Barlow Condensed",sans-serif`;ctx.lineWidth=6;ctx.strokeStyle='#081620';ctx.strokeText(`SERİ ×${se.n}`,0,0);ctx.fillStyle=TEAM[se.team].ui;ctx.fillText(`SERİ ×${se.n}`,0,0);ctx.restore()}
 // geri sayım
 if(G.phase==='countdown'&&!G.demo){const st=.42,i=Math.floor(G.cd/st);if(i<3){const e=(G.cd-i*st)/st;ctx.save();ctx.globalAlpha=e<.7?1:1-(e-.7)/.3;ctx.translate(400,200);const s=1.8-.8*ease.ob(Math.min(1,e*1.6));ctx.scale(s,s);ctx.font=`italic 800 110px "Barlow Condensed",sans-serif`;ctx.lineWidth=8;ctx.strokeStyle='#081620';ctx.strokeText(String(3-i),0,0);ctx.fillStyle='#f4f1e8';ctx.fillText(String(3-i),0,0);ctx.restore()}}
 // hyper yazıları (oyuncu üstünde)
 for(const h of G.pops){const t=h.t/1.4;if(t>=1)continue;const x=(FX+h.x)/K16,y=(FY+h.y)/K16-18;let a=1,sc=1,dy=0;if(t<.15){a=t/.15;sc=.7+.38*(t/.15)}else if(t<.25)sc=1.08-.08*((t-.15)/.1);if(t>.8){a=1-(t-.8)/.2;dy=-26*(t-.8)/.2}
  ctx.save();ctx.globalAlpha=a;ctx.translate(x,y+dy);ctx.scale(sc,sc);ctx.font=F(800,9);ctx.fillStyle=h.lc||'#ffd23f';ctx.fillText(h.label??'H Y P E R',0,-12);ctx.font=`italic 800 18px "Barlow Condensed",sans-serif`;ctx.lineWidth=4;ctx.strokeStyle='rgba(0,0,0,.6)';ctx.strokeText(h.name,0,2);ctx.fillStyle='#fff';ctx.fillText(h.name,0,2);ctx.restore()}
 // ilk maçlarda kontrol ipucu
 if(G.cfg.mode!=='pens'&&(G.phase==='countdown'||G.phase==='kickoff')&&G.period===1&&G.score[0]+G.score[1]===0&&G.t<1&&CAREER.matches<3){
  const hs=[...new Set(G.cfg.ctrl.filter(c=>c!=='ai').map(c=>c==='p2'?'p2':'p1'))],k=S.keys,lines=hs.map(s=>`${hs.length>1?(s==='p1'?'P1   ':'P2   '):''}${s==='p2'&&k.p2.up==='ArrowUp'?'Oklar':keyLabel(k[s].up)+keyLabel(k[s].left)+keyLabel(k[s].down)+keyLabel(k[s].right)} hareket   ·   ${keyLabel(k[s].kick)} basılı tut: şut   ·   ${keyLabel(k[s].ab)} yetenek`);
  if(TOUCH.on){lines.length=0;lines.push('Sol taraf: parmağınla sürükle, hareket et   ·   ŞUT basılı tut   ·   YETENEK')}
  const hh=26+lines.length*20;ctx.save();rrect(ctx,170,428-hh,460,hh,10);ctx.fillStyle='rgba(8,22,32,.86)';ctx.fill();ctx.font=F(600,15);ctx.fillStyle='#f4f1e8';lines.forEach((l,i)=>ctx.fillText(l,400,428-hh+20+i*20));ctx.font=F(500,11);ctx.fillStyle='#9fb0b9';ctx.fillText('Topa yakınken koşarak sür · Hyper barı dolunca yetenek Hyper olur · Kol da takabilirsin',400,428-9);ctx.restore()}
 // mesajlar
 const m=G.msg;if(m&&!G.demo){
  if(m.type==='break'){ctx.fillStyle='rgba(5,8,15,.82)';ctx.fillRect(0,cy-62,800,124);ctx.font=`italic 800 46px "Barlow Condensed",sans-serif`;ctx.fillStyle='#fff';ctx.fillText(m.text,400,cy-18);ctx.font=F(600,16);ctx.fillStyle='#ffd23f';ctx.fillText(`${G.score[0]} - ${G.score[1]}${m.sub?'   ·   '+m.sub:''}`,400,cy+16);if(G.timer<3.4){ctx.fillStyle='#9fb0b9';ctx.font=F(600,12);ctx.fillText('Devam için şut tuşuna bas',400,cy+40)}}
  else if(m.life){const a=m.t<10?m.t/10:m.t>m.life-20?(m.life-m.t)/20:1;ctx.save();ctx.globalAlpha=Math.max(0,a);ctx.font=`italic 800 40px "Barlow Condensed",sans-serif`;ctx.lineWidth=6;ctx.strokeStyle='rgba(5,8,15,.7)';const col=m.text==='KAÇTI!'?'#ff5449':'#fff';ctx.strokeText(m.text,400,118);ctx.fillStyle=col;ctx.fillText(m.text,400,118);if(m.sub){ctx.font=F(600,15);ctx.fillStyle='#ffd23f';ctx.strokeText(m.sub,400,146);ctx.fillText(m.sub,400,146)}ctx.restore()}}
 // tekrar katmanı
 if(G.phase==='replay'){ctx.fillStyle='#000';ctx.fillRect(0,0,800,34);ctx.fillRect(0,416,800,34);rrect(ctx,16,6,110,22,5);ctx.fillStyle='rgba(255,255,255,.12)';ctx.fill();ctx.fillStyle=Math.sin(performance.now()*.006)>0?'#ff5449':'rgba(255,84,73,.25)';ctx.beginPath();ctx.arc(30,17,5,0,6.283);ctx.fill();ctx.fillStyle='#fff';ctx.font=F(700,15);ctx.textAlign='left';ctx.fillText('Tekrar 0.5x',42,17);ctx.textAlign='center';ctx.fillStyle='#d9c49a';ctx.font=F(500,14);ctx.fillText(`Atlamak için ${keyLabel(S.keys.p1.kick)} tuşuna bas`,400,433);if(G.replay.kmh){ctx.textAlign='right';ctx.fillStyle='#ffd23f';ctx.font=F(700,17);ctx.fillText(`Şut ${G.replay.kmh} km/sa`,784,17)}}
 ctx.restore();
}
function render(dtR){
 layout();ctx.setTransform(VIEW.k,0,0,VIEW.k,0,0);
 drawBackground();if(!G)return;
 const c=G.cam,amp=c.trauma*c.trauma*22*K16*(S.lowFx?.45:1),t=performance.now()/1000;
 const sx=amp*(Math.sin(t*47.3)*.6+Math.sin(t*91.7+1.3)*.4),sy=amp*(Math.sin(t*53.1+2.1)*.6+Math.sin(t*79.9+.7)*.4);
 ctx.save();ctx.translate(FX+sx,FY+sy);
 if(c.zoom!==1){ctx.translate(c.fx,c.fy);ctx.scale(c.zoom,c.zoom);ctx.translate(-c.fx,-c.fy)}
 drawPitch();
 for(const r of G.rings){if(r.t<0)continue;const k=Math.min(1,r.t/r.dur);ctx.strokeStyle=r.col;ctx.globalAlpha=1-k;ctx.lineWidth=r.w*(1-k)+.5;ctx.beginPath();ctx.arc(r.x,r.y,r.r*(.2+.8*ease.oc(k)),0,6.283);ctx.stroke()}ctx.globalAlpha=1;
 if(G.phase==='replay'&&G.replay){const fr=G.rec[Math.min(G.rec.length-1,Math.floor(G.replay.i))];if(fr){const ps=plist();ps.forEach((p,i)=>{if(fr.p[i]&&p.role==='keeper')drawPlayer(p,fr.p[i])});drawBallAt(fr.b[0],fr.b[1],G.replay.i*.3,fr.b[2]);ps.forEach((p,i)=>{if(fr.p[i]&&p.role!=='keeper')drawPlayer(p,fr.p[i])})}}
 else{const ps=plist();for(const p of ps)if(p.role==='keeper')drawPlayer(p);for(const d of G.decoys)drawBallAt(d.x,d.y,G.frame*.2,false,.85);drawBallAt(G.ball.x,G.ball.y,G.ball.rot,G.ball.fire>0,1,true);for(const p of ps)if(p.role!=='keeper')drawPlayer(p)}
 drawParts(G.parts);
 ctx.restore();
 if(arena().snow){ctx.fillStyle='rgba(255,255,255,.8)';for(const f of snow){f.y+=f.v;f.x+=Math.sin(f.y*.02)*.3;if(f.y>VH){f.y=-4;f.x=rnd()*VW}ctx.fillRect(f.x,f.y,f.s,f.s)}}
 if(arena().rain){const n=S.lowFx?90:rain.length;ctx.strokeStyle='rgba(185,205,235,.32)';ctx.lineWidth=1.3;ctx.beginPath();for(let i=0;i<n;i++){const f=rain[i];f.y+=f.v;f.x-=f.v*.22;if(f.y>VH+10){f.y=-20;f.x=rnd()*(VW+200)}ctx.moveTo(f.x,f.y);ctx.lineTo(f.x+3.5,f.y-16)}ctx.stroke()}
 if(G.tint>0){ctx.globalAlpha=G.tint;ctx.fillStyle=G.tintCol;ctx.globalCompositeOperation='overlay';ctx.fillRect(0,0,VW,VH);ctx.globalCompositeOperation='source-over';ctx.globalAlpha=1}
 if(G.flash>0){ctx.globalAlpha=G.flash;ctx.fillStyle='#fff';ctx.fillRect(0,0,VW,VH);ctx.globalAlpha=1}
 drawParts(G.uparts);
 if(!G.demo&&SCREEN==='match'||(!G.demo&&(SCREEN==='pause'||SCREEN==='end'||SCREEN==='tresult'))){drawHUD();drawOverlays(dtR)}
}

/* ======================= DÖNGÜ ======================= */
let last=performance.now(),acc=0,fpsN=0,fpsT=0,perfAcc=0,perfN=0,perfSlow=0,ambT=0;
function updateReal(dt){
 if(!G)return;
 // hit-stop → ağır çekim → dönüş
 if(G.hs){const h=G.hs;h.t+=dt;if(h.t<h.freeze)G.ts=0;else if(h.t<h.freeze+h.slow)G.ts=h.scale;else if(h.t<h.freeze+h.slow+h.rec)G.ts=h.scale+(1-h.scale)*ease.ioq((h.t-h.freeze-h.slow)/h.rec);else{G.ts=1;G.hs=null}}else G.ts=1;
 const c=G.cam;c.trauma=Math.max(0,c.trauma-1.5*dt);
 if(c.zmax){c.zt+=dt;const zi=.25,zh=.4,zo=.65;if(c.zt<zi)c.zoom=1+(c.zmax-1)*ease.oc(c.zt/zi);else if(c.zt<zi+zh)c.zoom=c.zmax;else if(c.zt<zi+zh+zo)c.zoom=c.zmax-(c.zmax-1)*ease.ioq((c.zt-zi-zh)/zo);else{c.zoom=1;c.zmax=0}}
 G.flash=Math.max(0,G.flash-dt/.26*.85);G.tint=Math.max(0,G.tint-dt*.35);
 for(const r of G.rings)r.t+=dt;G.rings=G.rings.filter(r=>r.t<r.dur);
 for(const h of G.pops)h.t+=dt;G.pops=G.pops.filter(h=>h.t<1.4);
 if(G.goalTxt){G.goalTxt.t+=dt;if(G.goalTxt.t>2.3)G.goalTxt=null}
 if(G.seri){G.seri.t+=dt;if(G.seri.t>1.7)G.seri=null}
 if(G.scorePop){G.scorePop.t+=dt;if(G.scorePop.t>1)G.scorePop=null}
 updateUiFx();
 if(G.fireworks>0){G.fireworks-=dt;G.fwT=(G.fwT||0)-dt;if(G.fwT<=0){G.fwT=rr(.25,.55);const x=rr(150,1130),y=rr(110,370),col=pick([TEAM[G.winner??0].color,'#ffd23f','#ffffff']);for(let i=0,n=pn(48);i<n;i++){const a=i/n*6.283,sp=rr(2.6,5);emit({ui:true,x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,life:rr(55,90),g:.045,drag:.022,col:rnd()<.25?'#fff':col,s:2,shape:'spark',add:true})}sfx.firework()}}
 // gerçek zamanlı aşamalar
 if(G.phase==='countdown'){const st=.42,i0=Math.floor(G.cd/st);G.cd+=dt;const i1=Math.floor(G.cd/st);if(G.cd-dt<=0||i1!==i0){if(i1<3&&!G.demo)sfx.countdown(i1<2?1:0)}
  if(G.cd>=st*3||G.demo&&G.cd>.5){if(G.after){const f=G.after;G.after=null;f()}else{G.phase='kickoff';G.koT=0;if(!G.demo)sfx.whistle()}}}
 else if(G.phase==='goal'){G.realT+=dt;if(G.realT>(G.demo?1.2:1.6)){const tm=G.goalTxt?G.goalTxt.team:G.streakTeam;
  if(!G.demo&&S.replay&&G.cfg.mode!=='train'&&G.rec.length>30){G.phase='replay';G.replay={i:Math.max(0,G.rec.length-150),team:tm,kmh:Math.round(G.stats.fast*60*.105*3.6*.55)}}
  else afterGoal(tm)}}
 else if(G.phase==='replay'){G.replay.i+=dt*60*.5;if(G.replay.i>=G.rec.length-1)afterGoal(G.replay.team)}
 else if(G.phase==='break'){G.timer-=dt;if(G.timer<=0){G.msg=null;const f=G.after;G.after=null;f&&f()}}
}
function crowdLevel(){
 if(!G||G.demo||G.paused||SCREEN!=='match')return 0;const A=arena(),k=A.crowd?1:.45;
 if(G.phase==='goal'||G.phase==='replay')return .22*k;if(G.phase==='break'||G.phase==='over')return .05*k;
 const b=G.ball,dg=Math.min(Math.hypot(b.x,b.y-CY),Math.hypot(W-b.x,b.y-CY)),danger=clamp(1-dg/380,0,1);
 return (.045+.13*danger*danger+(G.phase==='pens'?.03:0))*k;
}
function afterGoal(team){G.rec=[];G.replay=null;if(G.cfg.golden&&G.period>2&&!G.demo){G.phase='over';G.msg={type:'info',text:'ALTIN GOL!',sub:'',t:0,life:200};endMatch();return}if(G.cfg.mode==='train'){resetPositions(0);G.phase='kickoff';sfx.spawn();return}resetPositions(1-team);G.phase='countdown';G.cd=0;G.goalTxt=null}
function loop(now){
 let dt=Math.min(.1,(now-last)/1000);last=now;
 if(S.showFps){fpsN++;fpsT+=dt;if(fpsT>=.5){$('fps').textContent=Math.round(fpsN/fpsT)+' FPS';fpsN=0;fpsT=0}}
 ambT+=dt;if(ambT>.12){ambT=0;sfx.amb(crowdLevel())}
 pollPads();updTouchVis();
 if(S.quality==='auto'&&dt<.25){perfAcc+=dt;perfN++;if(perfAcc>2){const avg=perfAcc/perfN;perfAcc=0;perfN=0;perfSlow=avg>.022?perfSlow+1:0;if(perfSlow>=2&&autoQ!=='dusuk'){perfSlow=0;autoQ=autoQ==='yuksek'?'orta':'dusuk'}}}
 if(G&&!G.paused){
  updateReal(dt);
  acc+=dt*G.ts;let n=0;while(acc>=1/60&&n<6){step();updateFx();acc-=1/60;n++}if(n>=6)acc=0;
 }
 render(dt);requestAnimationFrame(loop);
}

/* ======================= MAÇ SONU ======================= */
function endMatch(){
 G.phase='over';const s=G.score,ps=G.penScore,c=G.cfg;
 if(G.demo){startDemo();return}
 let w=s[0]>s[1]?0:s[1]>s[0]?1:ps?(ps[0]>ps[1]?0:1):-1;G.winner=w<0?0:w;
 sfx.whistle(true);
 // kariyer (insan oynadıysa)
 const humans=[0,1].filter(t=>c.ctrl[t]!=='ai');
 if(humans.length&&c.mode!=='train'){CAREER.matches++;CAREER.seconds+=Math.round(c.dur*60*(G.period>2?1.33:1));for(const t of humans){CAREER.goals+=s[t];CAREER.shots+=G.stats.shots[t]}
  for(const t of humans){if(w===t&&s[1-t]===0&&c.mode!=='pens')unlock('clean');if(w===t&&ps&&(c.mode==='pens'||G.period>1))unlock('pen');if(G.players.filter(q=>q.team===t&&q.ctrl!=='ai').some(q=>q.st.hy>=3))unlock('hyper3')}
  if(CAREER.matches>=10)unlock('maraton');
  if(humans.length===1){const h=humans[0],ai=1-h,d=c.diffT[ai];if(w===h&&d===2)unlock('zor');if(w===h){CAREER.wins++;CAREER.streak++;CAREER.best=Math.max(CAREER.best,CAREER.streak);CAREER.ai[d].w++}else{CAREER.streak=0;if(w>=0)CAREER.ai[d].l++}}saveC()}
 setTimeout(()=>{if(!G||G.demo)return;G.fireworks=w>=0?6:0;if(w>=0)sfx.win();
  if(c.mode==='tour')showTourResult(w);else showEnd(w)},2200);
}

