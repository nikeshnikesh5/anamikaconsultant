/* eslint-disable */
// @ts-nocheck
/**
 * Original Anamika page script (GSAP + PixiJS), ported 1:1.
 * The only changes: it receives `gsap` and `PIXI` as arguments instead of
 * CDN globals, and it returns a cleanup function so React can unmount safely.
 */
export function startCosmos(gsap, PIXI) {
  var app_ = null;
  function registerApp(a) { app_ = a; }

  // ---- track side effects so they can be undone on unmount ----
  var listeners = [], intervals = [], contexts = [];
  var origW = window.addEventListener, origD = document.addEventListener;
  var origSI = window.setInterval, origAC = window.AudioContext;
  window.addEventListener = function (t, f, o) { listeners.push([window, t, f, o]); return origW.call(window, t, f, o); };
  document.addEventListener = function (t, f, o) { listeners.push([document, t, f, o]); return origD.call(document, t, f, o); };
  window.setInterval = function () { var id = origSI.apply(window, arguments); intervals.push(id); return id; };
  if (origAC) {
    var AC = function (a) { var c = new origAC(a); contexts.push(c); return c; };
    AC.prototype = origAC.prototype;
    window.AudioContext = AC;
  }

(function(){
  var W=innerWidth,H=innerHeight;
  var app=new PIXI.Application({resizeTo:window,backgroundAlpha:0,antialias:true,resolution:Math.min(devicePixelRatio||1,2),autoDensity:true});
  document.getElementById('pixi').appendChild(app.view);registerApp(app);
  var stage=app.stage;

  // ---- Real-galaxy backdrop: procedural Milky Way (nebula clouds, dust lanes, dense star band) ----
  var GW=1400,GH=800,gc=document.createElement('canvas');gc.width=GW*2;gc.height=GH*2;var g2=gc.getContext('2d');g2.scale(2,2);
  function rnd(a,b){return a+Math.random()*(b-a)}
  function gauss(){return(Math.random()+Math.random()+Math.random()+Math.random()-2)/2}
  var gAng=-.42,gCa=Math.cos(gAng),gSa=Math.sin(gAng);
  function bandPt(spread,along){var u=gauss()*along,v=gauss()*spread;return[GW/2+u*gCa-v*gSa,GH/2+u*gSa+v*gCa]}
  function blob(x,y,r,col,a){var g=g2.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,'rgba('+col+','+a+')');g.addColorStop(1,'rgba('+col+',0)');g2.fillStyle=g;g2.fillRect(x-r,y-r,r*2,r*2)}
  var gCols=['120,70,220','200,70,170','60,120,230','40,170,200','255,150,90'],gp;
  g2.globalCompositeOperation='lighter';
  for(var q1=0;q1<90;q1++){gp=bandPt(90,330);blob(gp[0],gp[1],rnd(90,260),gCols[q1%5],rnd(.03,.09))}
  for(var q2=0;q2<60;q2++){gp=bandPt(45,260);blob(gp[0],gp[1],rnd(60,160),'255,225,190',rnd(.04,.09))}
  blob(GW/2,GH/2,320,'255,235,210',.18);
  g2.globalCompositeOperation='source-over';
  for(var q3=0;q3<45;q3++){gp=bandPt(14,300);blob(gp[0],gp[1],rnd(30,90),'4,3,18',rnd(.25,.5))}
  g2.globalCompositeOperation='lighter';
  for(var q4=0;q4<4200;q4++){gp=bandPt(120,380);var big=Math.random()>.97;g2.fillStyle='rgba(255,'+Math.floor(rnd(215,255))+','+Math.floor(rnd(190,255))+','+rnd(.25,.9)+')';g2.fillRect(gp[0],gp[1],big?1.4:.7,big?1.4:.7)}
  for(var q5=0;q5<900;q5++){g2.fillStyle='rgba(255,255,255,'+rnd(.2,.7)+')';g2.fillRect(Math.random()*GW,Math.random()*GH,.7,.7)}
  // ---- Realistic Milky Way: fractal-noise gas, dust filaments, galactic bulge, colored stars with diffraction spikes ----
  g2.globalCompositeOperation='source-over';g2.clearRect(0,0,GW,GH);
  var SEED=Math.random()*100;
  function hs(x,y){var h=Math.sin(x*127.1+y*311.7)*43758.5453;return h-Math.floor(h)}
  function vn(x,y){var xi=Math.floor(x),yi=Math.floor(y),xf=x-xi,yf=y-yi,u=xf*xf*(3-2*xf),v=yf*yf*(3-2*yf),a=hs(xi,yi),b=hs(xi+1,yi),c=hs(xi,yi+1),d=hs(xi+1,yi+1);return a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v}
  function fb(x,y,o){var s=0,a=.5,f=1;for(var i=0;i<o;i++){s+=a*vn(x*f,y*f);f*=2.03;a*=.5}return s}
  var NW=8,NH=4,nc=document.createElement('canvas');nc.width=NW;nc.height=NH;var nx2=nc.getContext('2d'),im=nx2.createImageData(NW,NH);
  for(var ny=0;ny<NH;ny++)for(var nxx=0;nxx<NW;nxx++){
    var px=nxx/NW*GW,py=ny/NH*GH,dx=px-GW/2,dy=py-GH/2,u=dx*gCa+dy*gSa,v=-dx*gSa+dy*gCa;
    var wv=v+110*(fb(px*.004+SEED,py*.004,3)-.5),sig=95+40*fb(u*.003+SEED,2,2);
    var wx=px+70*(fb(px*.006+SEED,py*.006,3)-.5),wy=py+70*(fb(px*.006,py*.006+SEED,3)-.5),band=Math.exp(-(wv*wv)/(2*sig*sig)),cloud=fb(wx*.012+SEED,wy*.012+SEED*.5,5);
    var bulge=Math.exp(-(u*u)/(2*190*190)-(wv*wv)/(2*70*70)),glow=band*(.25+.9*cloud)+bulge*.9;
    var rid=1-Math.abs(2*fb(wx*.02+SEED*2,wy*.02,5)-1),sd=sig*.55;
    var dust=Math.pow(rid,3)*Math.exp(-(wv*wv)/(2*sd*sd))*(.4+cloud),I=Math.max(0,glow*(1-1.1*dust));
    var wr=Math.min(1,bulge*1.4),em=Math.max(0,fb(wx*.008+SEED*3,wy*.008,4)-.5)*2*band,hue=fb(px*.005+SEED*5,py*.005,3)-.5;I*=.7+.6*vn(px*.18+SEED,py*.18)*(.4+band);
    var o4=(ny*NW+nxx)*4;
    im.data[o4]=Math.max(0,Math.min(255,140+110*wr+em*130+hue*70));im.data[o4+1]=Math.max(0,Math.min(255,170+55*wr-em*80+hue*10));im.data[o4+2]=Math.max(0,Math.min(255,255-80*wr-em*30-hue*80));
    im.data[o4+3]=Math.min(255,Math.pow(Math.min(1,I*.7),1.5)*255);
  }
  nx2.putImageData(im,0,0);g2.imageSmoothingQuality='high';g2.drawImage(nc,0,0,GW,GH);
  g2.globalCompositeOperation='lighter';
  var STC=[[170,200,255],[235,240,255],[255,255,255],[255,232,190],[255,196,150]];
  function star(x,y,mag){
    var c=STC[Math.floor(Math.pow(Math.random(),1.4)*STC.length)],a=.12+mag*.88,sz=.4+mag*mag*1.6;
    g2.fillStyle='rgba('+c+','+a+')';g2.fillRect(x-sz/2,y-sz/2,sz,sz);
    if(mag>.93){blob(x,y,6+mag*10,c.join(','),.35*mag);g2.strokeStyle='rgba('+c+','+(.25*mag)+')';g2.lineWidth=.5;g2.beginPath();g2.moveTo(x-9*mag,y);g2.lineTo(x+9*mag,y);g2.moveTo(x,y-9*mag);g2.lineTo(x,y+9*mag);g2.stroke()}
  }
  for(var s1=0;s1<7000;s1++){var sp=bandPt(110,420);star(sp[0],sp[1],Math.pow(Math.random(),4))}
  for(var s2=0;s2<1800;s2++)star(Math.random()*GW,Math.random()*GH,Math.pow(Math.random(),5)*.9);
  for(var s3=0;s3<60;s3++)star(Math.random()*GW,Math.random()*GH,.94+Math.random()*.06);
  for(var s4=0;s4<4000;s4++){var sc0=bandPt(60,200);star(sc0[0],sc0[1],Math.pow(Math.random(),5))}
  // ---- New model: tilted spiral galaxy (two arms, bright bulge, dust lanes, pink star-forming regions, companions) ----
  g2.globalCompositeOperation='source-over';g2.clearRect(0,0,GW,GH);
  var CX=GW*.55,CY=GH*.42,ROT=-.5,cR=Math.cos(ROT),sR=Math.sin(ROT),INC=.5,RMAX=500;
  function armA(r0,t0,off){return Math.pow(.5+.5*Math.cos(2*(t0-2.4*Math.log(r0/28+1))+off),2.2)}
  function spiralPt(r0,t0){var x1=r0*Math.cos(t0),yr=r0*Math.sin(t0)*INC;return[CX+x1*cR-yr*sR,CY+x1*sR+yr*cR]}
  var NW2=(W<700?500:900),NH2=(W<700?282:506),nc2=document.createElement('canvas');nc2.width=NW2;nc2.height=NH2;var nx3=nc2.getContext('2d'),im2=nx3.createImageData(NW2,NH2);
  for(var qy=0;qy<NH2;qy++)for(var qx=0;qx<NW2;qx++){
    var px2=qx/NW2*GW,py2=qy/NH2*GH,ddx=px2-CX,ddy=py2-CY,x1=ddx*cR+ddy*sR,y1=(-ddx*sR+ddy*cR)/INC,rr0=Math.sqrt(x1*x1+y1*y1)+.001,th0=Math.atan2(y1,x1);
    th0+=(fb(px2*.01+SEED,py2*.01,4)-.5)*1.1*Math.min(1,rr0/150);
    var A=armA(rr0,th0,0),cl=fb(px2*.02+SEED*2,py2*.02,5),edge=Math.max(0,1-Math.pow(rr0/RMAX,2.2)),disk=Math.exp(-rr0/170)*edge,bulge=Math.exp(-rr0/48)*1.4;
    var dst=armA(rr0,th0,1.1)*Math.pow(1-Math.abs(2*fb(px2*.025+SEED*3,py2*.025,4)-1),2)*Math.min(1,Math.max(0,(rr0-35)/90))*edge;
    var II=(bulge+disk*(.25+1.1*A)*(.45+cl))*(1-.8*dst);II*=.8+.4*vn(px2*.2+SEED,py2*.2);
    var wr2=Math.exp(-rr0/75),hii=Math.max(0,fb(px2*.03+SEED*4,py2*.03,3)-.55)*3*A*edge,o5=(qy*NW2+qx)*4;
    im2.data[o5]=Math.max(0,Math.min(255,150+105*wr2+hii*150));im2.data[o5+1]=Math.max(0,Math.min(255,175+40*wr2-hii*110));im2.data[o5+2]=Math.max(0,Math.min(255,255-130*wr2-hii*30));
    im2.data[o5+3]=Math.min(255,Math.pow(Math.min(1,II*.75),1.4)*255);
  }
  nx3.putImageData(im2,0,0);g2.imageSmoothingQuality='high';g2.drawImage(nc2,0,0,GW,GH);
  g2.globalCompositeOperation='lighter';
  [[.12,.2,70,.4,'255,220,190'],[.86,.8,50,-.6,'190,210,255'],[.2,.84,40,.9,'255,200,170'],[.92,.14,34,.2,'210,220,255']].forEach(function(d){g2.save();g2.translate(d[0]*GW,d[1]*GH);g2.rotate(d[3]);g2.scale(1,.38);blob(0,0,d[2],d[4],.5);blob(0,0,d[2]*.35,'255,245,230',.8);g2.restore()});
  var ns=0,sp2;while(ns<9000){var rs=-170*Math.log(1-Math.random()*.97),ts=Math.random()*6.283;if(rs>RMAX||Math.random()>.2+.8*armA(rs,ts,0))continue;sp2=spiralPt(rs,ts);star(sp2[0],sp2[1],Math.pow(Math.random(),4));ns++}
  for(var sb=0;sb<3000;sb++){sp2=spiralPt(Math.abs(gauss())*70,Math.random()*6.283);star(sp2[0],sp2[1],Math.pow(Math.random(),5))}
  for(var sf=0;sf<2500;sf++)star(Math.random()*GW,Math.random()*GH,Math.pow(Math.random(),5)*.9);
  for(var sg=0;sg<60;sg++)star(Math.random()*GW,Math.random()*GH,.94+Math.random()*.06);
  var galaxy=new PIXI.Sprite(PIXI.Texture.from(gc));galaxy.anchor.set(.5);stage.addChild(galaxy);
  var SS=new PIXI.Container();stage.addChild(SS);
  function shootingStar(){
    var s=spr(glowTex,120,0xdfeaff,0);s.height=5;var x0=rnd(.2,.9)*app.screen.width,y0=rnd(.02,.3)*app.screen.height,a=rnd(.35,.6),d0=rnd(300,520);
    s.x=x0;s.y=y0;s.rotation=a;SS.addChild(s);
    gsap.to(s,{x:x0+Math.cos(a)*d0,y:y0+Math.sin(a)*d0,duration:rnd(.7,1.1),ease:'power1.in',onComplete:function(){s.destroy()}});
    gsap.fromTo(s,{alpha:0},{alpha:.9,duration:.2,yoyo:true,repeat:1});
    gsap.delayedCall(rnd(2.5,5.5),shootingStar);
  }
  gsap.delayedCall(3,shootingStar);

  // ---- Planetary system backdrop: ringed gas giant, Earth-like world with moon, red desert planet ----
  function mix3(a,b,t){t=Math.max(0,Math.min(1,t));return[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t]}
  function mkPlanet(S0,lx,pix){
    var c=document.createElement('canvas');c.width=c.height=S0;var x=c.getContext('2d'),im=x.createImageData(S0,S0),R=S0/2,ln=Math.sqrt(lx*lx+.2025+.49),Lx=lx/ln,Ly=-.45/ln,Lz=.7/ln;
    for(var j=0;j<S0;j++)for(var i=0;i<S0;i++){
      var nx=(i+.5-R)/R,ny=(j+.5-R)/R,d2=nx*nx+ny*ny;if(d2>1)continue;
      var nz=Math.sqrt(1-d2),col=pix(Math.atan2(nx,nz),Math.asin(ny)),df=Math.max(0,nx*Lx+ny*Ly+nz*Lz),k=(.06+.94*Math.pow(df,.8))*(.55+.45*nz),o=(j*S0+i)*4;
      im.data[o]=col[0]*k;im.data[o+1]=col[1]*k;im.data[o+2]=col[2]*k;im.data[o+3]=255*Math.min(1,(1-Math.sqrt(d2))*R*.8);
    }
    x.putImageData(im,0,0);return PIXI.Texture.from(c);
  }
  function atmo(D,rgb,al){var s=new PIXI.Sprite(gradTex(256,[[0,'rgba('+rgb+',0)'],[.44,'rgba('+rgb+',0)'],[.5,'rgba('+rgb+',.7)'],[.58,'rgba('+rgb+',.2)'],[1,'rgba('+rgb+',0)']]));s.anchor.set(.5);s.width=s.height=D*2;s.alpha=al;return s}
  var PL=new PIXI.Container();stage.addChild(PL);var PLS=[];
  function addP(c,fx,fy,s,par){PL.addChild(c);PLS.push({c:c,fx:fx,fy:fy,s:s,par:par})}
  (function(){
    var D=190,c=new PIXI.Container();
    var tex=mkPlanet(384,.9,function(lon,lat){
      var n=fb(lon*2+SEED,lat*5+SEED,4),b=Math.sin(lat*16+3*n)*.5+.5,m=fb(lon*3,lat*18,3),col=mix3([240,222,185],[168,108,64],b*.7+m*.3);
      var sd=Math.pow((lon-.6)/.35,2)+Math.pow((lat-.25)/.12,2);if(sd<1)col=mix3(col,[200,80,50],(1-sd)*.8);return col;
    });
    var rc=document.createElement('canvas');rc.width=700;rc.height=200;var rx=rc.getContext('2d');rx.translate(350,100);
    for(var q=.64;q<1;q+=.004){var a=(.25+.6*fb(q*30+SEED,3,3))*((q>.8&&q<.84)?.1:1)*(1-Math.abs(q-.82)*.9);rx.strokeStyle='rgba(222,200,160,'+Math.max(0,Math.min(.9,a))+')';rx.lineWidth=1.6;rx.beginPath();rx.ellipse(0,0,q*340,q*340*.28,0,0,Math.PI*2);rx.stroke()}
    var rt=PIXI.Texture.from(rc);
    function ringSp(){var s=new PIXI.Sprite(rt);s.anchor.set(.5);s.width=443;s.height=443*200/700;return s}
    var back=new PIXI.Container();back.rotation=-.38;back.addChild(ringSp());
    var pl=new PIXI.Sprite(tex);pl.anchor.set(.5);pl.width=pl.height=D;
    var front=new PIXI.Container();front.rotation=-.38;var fs=ringSp(),mk=new PIXI.Graphics();mk.beginFill(0xffffff).drawRect(-300,0,600,200).endFill();front.addChild(fs,mk);fs.mask=mk;
    c.addChild(back,pl,front,atmo(D,'255,220,160',.6));addP(c,.14,.22,1,16);
  })();
  (function(){
    var D=96,c=new PIXI.Container();
    var pl=new PIXI.Sprite(mkPlanet(256,-.9,function(lon,lat){
      var h=fb(lon*1.6+SEED*2+5,lat*1.6+SEED,5),col;
      if(Math.abs(lat)>1.18+(fb(lon*3,lat*3,2)-.5)*.2)col=[236,242,250];else if(h>.5)col=mix3([70,120,60],[150,125,85],(h-.5)*4);else col=mix3([10,35,90],[30,90,160],h*2);
      var cl=fb(lon*3.2+SEED*3,lat*3.2,5);if(cl>.52)col=mix3(col,[255,255,255],Math.min(1,(cl-.52)*5)*.85);return col;
    }));pl.anchor.set(.5);pl.width=pl.height=D;
    var moon=new PIXI.Sprite(mkPlanet(96,-.9,function(lon,lat){return mix3([150,150,155],[80,80,88],fb(lon*4+SEED,lat*4,4))}));moon.anchor.set(.5);moon.width=moon.height=22;moon._s=moon.scale.x;
    c.addChild(pl,atmo(D,'110,170,255',.8),moon);c.moon=moon;addP(c,.9,.58,1,26);
  })();
  (function(){
    var D=44,c=new PIXI.Container();
    var pl=new PIXI.Sprite(mkPlanet(160,.7,function(lon,lat){
      var col=mix3([190,95,60],[110,55,40],fb(lon*3+SEED,lat*3,5));if(fb(lon*9,lat*9,3)>.62)col=mix3(col,[70,35,28],.4);if(Math.abs(lat)>1.3)col=mix3(col,[240,230,225],.8);return col;
    }));pl.anchor.set(.5);pl.width=pl.height=D;c.addChild(pl,atmo(D,'230,140,100',.5));addP(c,.3,.45,1,34);
  })();
  function placePlanets(){
    var sc=Math.min(1,Math.max(.55,app.screen.width/1280));
    PLS.forEach(function(p){p.c.x=app.screen.width*p.fx-S.mx*p.par;p.c.y=app.screen.height*p.fy-S.my*p.par*.6;p.c.scale.set(sc*p.s);if(p.c.moon){var m=p.c.moon;m.x=Math.cos(t*.4)*68;m.y=Math.sin(t*.4)*20;m.scale.set(m._s*(1+.25*Math.sin(t*.4)))}});
    PL.alpha=.95-.2*S.rise;
  }

  // Stars
  var starLayer=new PIXI.Container();stage.addChild(starLayer);starLayer.pivot.set(innerWidth/2,innerHeight/2);starLayer.position.set(innerWidth/2,innerHeight/2);
  // ---- Twinkling star field: 420 colored stars, 36 with cross-shaped sparkle flares ----
  var tsTex=gradTex(64,[[0,'rgba(255,255,255,1)'],[.18,'rgba(255,255,255,.85)'],[.5,'rgba(255,255,255,.18)'],[1,'rgba(255,255,255,0)']]);
  var flareTex=(function(){var c=document.createElement('canvas');c.width=c.height=64;var x=c.getContext('2d'),g=x.createRadialGradient(32,32,0,32,32,6);g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.fillRect(0,0,64,64);
    var h=x.createLinearGradient(2,0,62,0);h.addColorStop(0,'rgba(255,255,255,0)');h.addColorStop(.5,'rgba(255,255,255,.95)');h.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=h;x.fillRect(2,31.2,60,1.6);
    var v=x.createLinearGradient(0,2,0,62);v.addColorStop(0,'rgba(255,255,255,0)');v.addColorStop(.5,'rgba(255,255,255,.95)');v.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=v;x.fillRect(31.2,2,1.6,60);return PIXI.Texture.from(c)})();
  var twk=[],TC=[0xffffff,0xcfe0ff,0xfff1d0,0xffd6b0,0xbcd4ff];
  for(var ti=0;ti<420;ti++){var tbig=ti<36,ts=new PIXI.Sprite(tbig?flareTex:tsTex);ts.anchor.set(.5);ts.blendMode=PIXI.BLEND_MODES.ADD;ts.tint=TC[Math.floor(Math.random()*5)];
    ts._sz=tbig?(14+Math.random()*18):(2+Math.random()*5);ts.x=Math.random()*innerWidth;ts.y=Math.random()*innerHeight*.9;ts._p=Math.random()*6.28;ts._f=tbig?(.6+Math.random()*1.2):(1+Math.random()*3.5);ts._b=tbig?1:.25+Math.random()*.6;ts._big=tbig;starLayer.addChild(ts);twk.push(ts)}
  function twinkleTick(){for(var q=0;q<twk.length;q++){var s=twk[q],v=.5+.5*Math.sin(t*s._f*1.5+s._p),v2=v*v;s.alpha=s._b*(.12+.88*v2);s.scale.set(s._sz/64*(.7+.6*v2));if(s._big)s.rotation=Math.sin(t*.3+s._p)*.2}}
  var stars=[];
  for(var i=0;i<160;i++){
    var g=new PIXI.Graphics();g.beginFill(0xffffff).drawCircle(0,0,Math.random()*1.6+.4).endFill();
    g.x=Math.random()*W;g.y=Math.random()*H*.85;g.alpha=Math.random();
    g._s=Math.random()*2+.5;g._p=Math.random()*6;starLayer.addChild(g);stars.push(g);
  }

  // Sun system
  var sun=new PIXI.Container();stage.addChild(sun);
  var cx=function(){return app.screen.width*.5}, horizon=function(){return app.screen.height*.78};
  // ---- Cinematic sun: gradient textures + additive blending ----
  function gradTex(size,stops){var c=document.createElement('canvas');c.width=c.height=size;var x=c.getContext('2d'),h=size/2,g=x.createRadialGradient(h,h,0,h,h,h);stops.forEach(function(s){g.addColorStop(s[0],s[1])});x.fillStyle=g;x.fillRect(0,0,size,size);return PIXI.Texture.from(c)}
  function spr(tex,sz,tint,al){var s=new PIXI.Sprite(tex);s.anchor.set(.5);s.width=s.height=sz;s.tint=tint;s.alpha=al;s.blendMode=PIXI.BLEND_MODES.ADD;return s}
  var glowTex=gradTex(256,[[0,'rgba(255,255,255,1)'],[.15,'rgba(255,220,150,.7)'],[.4,'rgba(255,150,60,.25)'],[1,'rgba(255,100,30,0)']]);
  var coreTex=gradTex(256,[[0,'#ffffff'],[.55,'#fff4cf'],[.8,'#ffd26a'],[.94,'#ff9a2e'],[1,'rgba(255,140,40,0)']]);
  var bc=document.createElement('canvas');bc.width=512;bc.height=64;var bx=bc.getContext('2d'),bg=bx.createLinearGradient(0,0,512,0);
  bg.addColorStop(0,'rgba(255,235,180,.9)');bg.addColorStop(1,'rgba(255,150,60,0)');bx.fillStyle=bg;bx.beginPath();bx.moveTo(0,28);bx.lineTo(512,0);bx.lineTo(512,64);bx.lineTo(0,36);bx.fill();
  var beamTex=PIXI.Texture.from(bc);
  var hg=spr(glowTex,1,0xff7a3d,.2);hg.width=2400;hg.height=460;stage.addChild(hg);
  var haze=spr(glowTex,1800,0xff8a3d,.4);sun.addChild(haze);
  var rays=new PIXI.Container();sun.addChild(rays);
  for(var r=0;r<20;r++){var b=new PIXI.Sprite(beamTex);b.anchor.set(0,.5);b.width=500+Math.random()*700;b.height=40+Math.random()*140;b.rotation=r/20*Math.PI*2+Math.random()*.3;b.tint=r%3?0xffd9a0:0xffb070;b._a=.08+Math.random()*.16;b._p=Math.random()*6;b.alpha=b._a;b.blendMode=PIXI.BLEND_MODES.ADD;rays.addChild(b)}
  var halo=spr(glowTex,820,0xffffff,.9);halo._s=halo.scale.x;sun.addChild(halo);
  var streak=spr(glowTex,400,0xaad4ff,.2);streak.width=1700;streak.height=16;sun.addChild(streak);
  var embers=new PIXI.Container();sun.addChild(embers);
  for(var em=0;em<45;em++){var m=spr(glowTex,6+Math.random()*10,0xffc46b,0);m._l=Math.random();m._sp=.2+Math.random()*.6;m._dx=(Math.random()-.5)*.5;m.x=(Math.random()-.5)*200;m.y=(Math.random()-.5)*160;embers.addChild(m)}
  var core=spr(coreTex,170,0xffffff,1);core._s=core.scale.x;sun.addChild(core);
  var corona=spr(glowTex,300,0xfff0c0,.8);sun.addChild(corona);
  // sun polish: wide bloom, animated surface granulation (masked to the disc), thin corona ring
  var sunBloom=spr(glowTex,1100,0xffcf9a,.28);sun.addChildAt(sunBloom,0);
  var gc2=document.createElement('canvas');gc2.width=gc2.height=300;var s2=gc2.getContext('2d');
  for(var gi2=0;gi2<420;gi2++){var ga=Math.random()*6.28,gr=Math.sqrt(Math.random())*140,gx3=150+Math.cos(ga)*gr,gy3=150+Math.sin(ga)*gr,rr2=rnd(4,14),gw=Math.random()>.5,gg=s2.createRadialGradient(gx3,gy3,0,gx3,gy3,rr2);gg.addColorStop(0,gw?'rgba(255,255,230,.55)':'rgba(255,120,30,.45)');gg.addColorStop(1,'rgba(255,200,100,0)');s2.fillStyle=gg;s2.fillRect(gx3-rr2,gy3-rr2,rr2*2,rr2*2)}
  var surfTex=PIXI.Texture.from(gc2),surfC=new PIXI.Container(),surf1=new PIXI.Sprite(surfTex),surf2=new PIXI.Sprite(surfTex);
  [surf1,surf2].forEach(function(s,k){s.anchor.set(.5);s.width=s.height=k?176:160;s.alpha=k?.3:.5;s.blendMode=PIXI.BLEND_MODES.ADD;surfC.addChild(s)});
  var surfM=new PIXI.Graphics();surfM.beginFill(0xffffff).drawCircle(0,0,74).endFill();surfC.mask=surfM;sun.addChild(surfC,surfM);
  var ringTex=gradTex(256,[[0,'rgba(255,220,150,0)'],[.5,'rgba(255,220,150,0)'],[.58,'rgba(255,236,190,.55)'],[.64,'rgba(255,190,110,.18)'],[1,'rgba(255,150,60,0)']]);
  var ringS=spr(ringTex,330,0xffffff,.6);sun.addChild(ringS);

  // Orbits + planets
  var orbit=new PIXI.Container();sun.addChild(orbit);
  var planets=[];
  [[200,9,0xff7a59,.9],[290,13,0x9ad1ff,.6],[390,8,0xc084fc,.4]].forEach(function(o,idx){
    var ring=new PIXI.Graphics();ring.lineStyle(1,0xffffff,.18).drawEllipse(0,0,o[0],o[0]*.32);orbit.addChild(ring);
    var p=new PIXI.Graphics();p.beginFill(o[2]).drawCircle(0,0,o[1]).endFill();p.beginFill(0xffffff,.25).drawCircle(-o[1]*.3,-o[1]*.3,o[1]*.4).endFill();
    p._r=o[0];p._sp=o[3];p._a=idx*2;orbit.addChild(p);planets.push(p);
  });

  // ---- Galaxy + zodiac wheel around the sun ----
  var cosmic=new PIXI.Container();sun.addChildAt(cosmic,0);
  var gTilt=new PIXI.Container();gTilt.scale.y=.4;cosmic.addChild(gTilt);
  var gSpin=new PIXI.Container();gTilt.addChild(gSpin);
  for(var nb=0;nb<6;nb++){var nbs=spr(glowTex,420+Math.random()*280,nb%2?0x7a4bd1:0xff6b9a,.09);var na=Math.random()*6.28,nr=Math.random()*320;nbs.x=Math.cos(na)*nr;nbs.y=Math.sin(na)*nr;gSpin.addChild(nbs)}
  for(var gi=0;gi<420;gi++){var tt=Math.pow(Math.random(),.8),arm=gi%3,rr=30+tt*560,th=tt*4.2+arm*2.094+(Math.random()-.5)*.55*(1-tt*.4);var gs=spr(glowTex,3+Math.random()*(10-tt*4),tt<.35?0xffe2b0:(Math.random()<.5?0x9ad1ff:0xc9a0ff),.18+Math.random()*.5);gs.x=Math.cos(th)*rr;gs.y=Math.sin(th)*rr;gSpin.addChild(gs)}
  var ZR=440,zRot=0.4;
  var zr=new PIXI.Graphics();zr.lineStyle(1,0xffd9a0,.28).drawEllipse(0,0,ZR+36,(ZR+36)*.38);zr.lineStyle(1,0xffd9a0,.16).drawEllipse(0,0,ZR-36,(ZR-36)*.38);
  for(var q=0;q<72;q++){var qa=q/72*Math.PI*2,c1=Math.cos(qa),s1=Math.sin(qa),r1=ZR+36,r2=r1+(q%6===0?12:6);zr.lineStyle(1,0xffd9a0,.3).moveTo(c1*r1,s1*r1*.38).lineTo(c1*r2,s1*r2*.38)}
  cosmic.addChild(zr);
  var leoG=spr(glowTex,150,0xffb84d,.7);cosmic.addChild(leoG);
  var ZN=['\u2648','\u2649','\u264A','\u264B','\u264C','\u264D','\u264E','\u264F','\u2650','\u2651','\u2652','\u2653'];
  var Z=ZN.map(function(g,k){var tx=new PIXI.Text(g+'\uFE0E',{fontFamily:'Segoe UI Symbol, Noto Sans Symbols, Arial Unicode MS, serif',fontSize:k===4?44:30,fill:k===4?0xffb84d:0xffe1a8});tx.anchor.set(.5);cosmic.addChild(tx);return tx});
  var leoL=new PIXI.Text('LEO',{fontFamily:'Cinzel, serif',fontSize:13,fill:0xffd27a,letterSpacing:5,fontWeight:'800'});leoL.anchor.set(.5);cosmic.addChild(leoL);
  // Leo constellation
  var con=new PIXI.Container();con.x=250;con.y=-130;cosmic.addChild(con);
  var LP=[[0,1],[.1,.72],[.17,.5],[.12,.25],[.2,.05],[.34,0],[.62,.38],[.6,.62],[1,.5]],LS=[[0,1],[1,2],[2,3],[3,4],[4,5],[2,7],[7,6],[6,8],[7,8],[2,6]];
  var cl=new PIXI.Graphics();cl.lineStyle(1,0xffe1a8,.5);LS.forEach(function(l){cl.moveTo(LP[l[0]][0]*200,LP[l[0]][1]*140).lineTo(LP[l[1]][0]*200,LP[l[1]][1]*140)});con.addChild(cl);
  var cStars=LP.map(function(p,k){var s=spr(glowTex,k===0?30:18,0xfff1c2,1);s.x=p[0]*200;s.y=p[1]*140;s._p=Math.random()*6;con.addChild(s);return s});
  var cLab=new PIXI.Text('LEO \u00b7 THE LION',{fontFamily:'Cinzel, serif',fontSize:11,fill:0xffd27a,letterSpacing:3});cLab.x=40;cLab.y=160;con.addChild(cLab);

  // Hills silhouette
  var hills=new PIXI.Graphics();stage.addChild(hills);
  function drawHills(){
    var w=app.screen.width,h=app.screen.height,y=horizon();hills.clear();
    hills.beginFill(0x0a0820);hills.moveTo(0,h);hills.lineTo(0,y+30);
    for(var x=0;x<=w;x+=20){hills.lineTo(x,y+30+Math.sin(x*.004)*30+Math.sin(x*.013)*12)}
    hills.lineTo(w,h);hills.endFill();
  }
  drawHills();

  var S={rise:0,mx:0,my:0,dock:0,zoom:1};
  // ---- Seeker: a tiny astronomer searching for the truth ----
  var SK=new PIXI.Container();SK.alpha=0;stage.addChild(SK);
  var P=new PIXI.Container();SK.addChild(P);
  function gfx(f){var g=new PIXI.Graphics();f(g);return g}
  var K={x:W*.06,dir:1,ph:0,walking:false,look:0,joy:0,jump:0,vis:0,sk:1};
  function gy(x){return horizon()+30+Math.sin(x*.004)*30+Math.sin(x*.013)*12}
  var gl=spr(glowTex,170,0xffb347,.22);gl.y=-12;P.addChild(gl);
  var legR=gfx(function(g){g.beginFill(0x0c0926).drawRoundedRect(-1.8,0,3.6,16,1.5).endFill()});legR.y=-16;legR.x=1;P.addChild(legR);
  var lant=gfx(function(g){g.lineStyle(1.2,0x2a1f7a).moveTo(0,0).lineTo(-6,6);g.lineStyle(0).beginFill(0xffc46b).drawRoundedRect(-10,6,6,8,1.5).endFill()});lant.x=-4;lant.y=-26;P.addChild(lant);
  var lg=spr(glowTex,56,0xffc46b,.85);lg.x=-7;lg.y=10;lant.addChild(lg);
  var body=gfx(function(g){g.lineStyle(.8,0xffb84d,.6).beginFill(0x2a1f7a).moveTo(-6,-14).lineTo(6,-14).lineTo(4,-31).lineTo(-4,-31).closePath().endFill();g.lineStyle(1.2,0xffb84d,.9).moveTo(-5.4,-21).lineTo(5.4,-21)});P.addChild(body);
  var legL=gfx(function(g){g.beginFill(0x120d33).drawRoundedRect(-1.8,0,3.6,16,1.5).endFill()});legL.y=-16;legL.x=-1;P.addChild(legL);
  var head=gfx(function(g){g.beginFill(0xf2c9a0).drawCircle(0,-36,5).endFill();g.beginFill(0x1a1025).drawCircle(2.2,-36.5,.9).endFill();g.beginFill(0x3b2a8f).moveTo(-7,-39).lineTo(7,-39).lineTo(2,-55).closePath().endFill();g.beginFill(0xffd27a).drawCircle(1,-48,1.5).endFill()});P.addChild(head);
  var arm=gfx(function(g){g.beginFill(0x2a1f7a).drawRoundedRect(0,-1.6,10,3.2,1.5).endFill();g.beginFill(0xd8a64a).drawRoundedRect(8,-2.6,16,5.2,1.5).endFill();g.beginFill(0x8a5a1a).drawRect(20,-3.2,4,6.4).endFill()});arm.y=-28;P.addChild(arm);
  var B=new PIXI.Container();SK.addChild(B);B.alpha=0;
  var bBg=new PIXI.Graphics();B.addChild(bBg);
  var bTx=new PIXI.Text('',{fontFamily:'Outfit, Segoe UI, sans-serif',fontSize:13,fill:0x1a1025,fontWeight:'600'});bTx.anchor.set(.5);bTx.y=-22;B.addChild(bTx);
  function say(t){
    if(!t){gsap.to(B,{alpha:0,duration:.3});return}
    bTx.text=t;var w=bTx.width+22;bBg.clear().beginFill(0xffffff,.95).drawRoundedRect(-w/2,-37,w,30,14).moveTo(-5,-8).lineTo(5,-8).lineTo(0,0).endFill();
    B.alpha=1;gsap.fromTo(B.scale,{x:.6,y:.6},{x:1,y:1,duration:.35,ease:'back.out(2)'});
  }
  function spark(x,y){var s=spr(glowTex,10+Math.random()*10,0xffd27a,1);s.x=x;s.y=y;SK.addChild(s);var a=Math.random()*6.28,r=40+Math.random()*70;gsap.to(s,{x:x+Math.cos(a)*r,y:y+Math.sin(a)*r,alpha:0,duration:1.1,ease:'power2.out',onComplete:function(){s.destroy()}})}
  function shoot(){
    var sk=K.sk,px=P.x+K.dir*11*sk,py=P.y-49*sk,sx=px+320,sy=-40;
    var TS=new PIXI.Container();TS.x=sx;TS.y=sy;TS.rotation=Math.atan2(py-sy,px-sx);SK.addChild(TS);
    var st=spr(glowTex,160,0xffe1a8,.8);st.width=170;st.height=9;st.x=-85;TS.addChild(st);
    TS.addChild(spr(glowTex,70,0xffd27a,1));
    var star=new PIXI.Graphics();star.beginFill(0xffffff).moveTo(0,-9).lineTo(2,-2).lineTo(9,0).lineTo(2,2).lineTo(0,9).lineTo(-2,2).lineTo(-9,0).lineTo(-2,-2).closePath().endFill();TS.addChild(star);
    gsap.to(TS,{x:px,y:py,duration:1.3,ease:'power2.in',onComplete:function(){
      TS.destroy({children:true});for(var i=0;i<18;i++)spark(px,py);
      gsap.to(K,{joy:1,duration:.4});gsap.to(K,{jump:14,duration:.22,yoyo:true,repeat:5,ease:'power2.out'});
      gsap.to(core,{_s:core._s*1.3,duration:.4,yoyo:true,repeat:1});
      say('Found the TRUTH!');
      var lb=new PIXI.Text('TRUTH',{fontFamily:'Cinzel, serif',fontSize:18,fill:0xffd27a,letterSpacing:6,fontWeight:'800'});lb.anchor.set(.5);lb.x=P.x;lb.y=P.y-105*sk;SK.addChild(lb);
      gsap.fromTo(lb.scale,{x:0,y:0},{x:1,y:1,duration:.6,ease:'back.out(2.5)'});
      gsap.to(lb,{alpha:0,y:lb.y-30,duration:.8,delay:3.2,onComplete:function(){lb.destroy()}});
    }});
  }
  function seekerTickOld(d){
    var sk=K.sk=Math.max(.8,Math.min(1.3,app.screen.width/1000));
    if(K.walking)K.ph+=.18*d;
    var sw=K.walking?Math.sin(K.ph)*.7:0;legL.rotation=sw;legR.rotation=-sw;
    var base=.9+(-1.1-.9)*K.look;arm.rotation=base+(-2.6-base)*K.joy+(K.walking?Math.sin(K.ph)*.15:0);
    lant.rotation=(K.walking?Math.sin(K.ph+1)*.25:0)+Math.sin(t*2)*.05;lg.alpha=.7+.2*Math.sin(t*6);
    P.scale.set(sk*K.dir,sk);P.x=K.x;P.y=gy(K.x)+4-(K.walking?Math.abs(Math.sin(K.ph))*2:0)-K.jump;
    B.x=Math.max(90,Math.min(app.screen.width-90,P.x));B.y=P.y-62*sk;
    SK.alpha=K.vis*S.rise;
  }
  function startSeekerOld(){
    gsap.to(K,{vis:1,duration:1.2});K.x=W*.06;
    var L=gsap.timeline({repeat:-1,delay:1.2}),pause=function(s){return L.to({},{duration:s})};
    L.add(function(){K.x=W*.06;K.dir=1;K.walking=true;say('Where is the truth?')})
     .to(K,{x:W*.32,duration:4.5,ease:'none'})
     .add(function(){K.walking=false;say('Searching the sky\u2026')})
     .to(K,{look:1,duration:.8,ease:'power2.out'});pause(2.2);
    L.add(function(){say('Hmm\u2026 nothing yet')}).to(K,{look:0,duration:.7});pause(.6);
    L.add(function(){K.walking=true;say('Maybe over there\u2026')})
     .to(K,{x:W*.6,duration:4.5,ease:'none'})
     .add(function(){K.walking=false;say('Wait\u2026 what is that?')})
     .to(K,{look:1,duration:.8,ease:'power2.out'});pause(1.2);
    L.add(shoot);pause(5.5);
    L.add(function(){gsap.to(K,{joy:0,look:0,duration:.6});K.dir=-1;K.walking=true;say('On to the next mystery\u2026')})
     .to(K,{x:W*.06,duration:6,ease:'none'})
     .add(function(){K.dir=1;K.walking=false;say('')});pause(2);
  }
  // ---- Pathfinder: clears the blocked path, then transforms ----
  var SK2=new PIXI.Container();SK2.alpha=0;stage.addChild(SK2);
  var CH=new PIXI.Container(),FX=new PIXI.Container(),XO=W*.74,lk={u:0};
  var KK={x:W*.06,px:W*.06,dir:1,ph:0,walk:0,step:0,lean:0,uF:-.2,fF:-.3,uB:.05,fB:-.1,stf:0,stance:0,crouch:0,head:0,flt:0,wing:0,flap:0,pitch:0,smile:0,fall:0,sc:1,vis:0,sk:1};
  var IDLE={lean:0,uF:-.2,fF:-.3,uB:.05,fB:-.1,stf:0,stance:0,crouch:0,head:0,flap:0,pitch:0,smile:0,fall:0};
  function wg(f){var g=new PIXI.Graphics();f(g);return g}
  function lerpC(a,b,u){var r=(a>>16&255)+((b>>16&255)-(a>>16&255))*u,g=(a>>8&255)+((b>>8&255)-(a>>8&255))*u,l=(a&255)+((b&255)-(a&255))*u;return(Math.round(r)<<16)|(Math.round(g)<<8)|Math.round(l)}
  // obstacles
  var shad=wg(function(g){g.beginFill(0x000000,.4).drawEllipse(0,0,16,3.5).endFill()});
  var fogs=[0,1,2].map(function(i){var f=new PIXI.Sprite(glowTex);f.anchor.set(.5);f.width=240;f.height=90;f.tint=0x8e9ad0;f._b=.22;f._x=XO-130+(i-1)*130;f.y=gy(XO)-20;return f});
  function mkBr(){return wg(function(g){g.lineStyle(2.2,0x3a8a58,1);for(var s=0;s<3;s++){var ox=(s-1)*6;g.moveTo(ox,0);for(var j=1;j<=6;j++){var nx=ox+Math.sin(j*1.6+s*2)*7,ny=-j*7;g.lineTo(nx,ny);g.lineTo(nx+(j%2?5:-5),ny-3);g.moveTo(nx,ny)}}g.lineStyle(0).beginFill(0xff5577).drawCircle(-6,-26,2.2).drawCircle(7,-38,2.2).drawCircle(1,-15,2)})}
  var ISS=[{l:'Relationship Issue',c:0xff6b8a},{l:'Career Issue',c:0x6aa8ff},{l:'Health Issue',c:0x5eead4},{l:'Business Issue',c:0xffb84d}];
  function mkIssue(i){
    var o=new PIXI.Container(),I=ISS[i],h=[60,76,66][i];
    var body=wg(function(g){
      g.lineStyle(2,I.c,.95);
      if(i===0){g.beginFill(0x3a1230).moveTo(0,0).bezierCurveTo(-52,-34,-34,-74,0,-52).bezierCurveTo(34,-74,52,-34,0,0).endFill();g.lineStyle(1.6,0xffe1e8,.9).moveTo(0,-52).lineTo(-6,-38).lineTo(5,-28).lineTo(-3,-14).lineTo(0,-4)}
      else if(i===1){g.beginFill(0x15244a).drawRect(-30,-66,60,66).endFill();g.lineStyle(1.4,I.c,.6).moveTo(-30,-44).lineTo(30,-44).moveTo(-30,-22).lineTo(30,-22).moveTo(-12,-66).lineTo(-12,-76).lineTo(12,-76).lineTo(12,-66);g.lineStyle(1.6,0xe0ecff,.9).moveTo(-30,-66).lineTo(-6,-34).lineTo(8,-40).lineTo(30,0)}
      else{g.beginFill(0x0f3331).drawRoundedRect(-30,-64,60,64,10).endFill();g.lineStyle(0).beginFill(I.c,.9).drawRoundedRect(-6,-56,12,36,2).drawRoundedRect(-18,-44,36,12,2).endFill();g.lineStyle(1.6,0xe0fff8,.9).moveTo(-26,-9).lineTo(-12,-9).lineTo(-7,-18).lineTo(-1,0).lineTo(5,-13).lineTo(9,-9).lineTo(26,-9);g.lineStyle(1.4,0xe0fff8,.8).moveTo(-8,-64).lineTo(-3,-50).lineTo(4,-42)}
    });
    var glow=spr(glowTex,130,I.c,.28);glow.y=-34;
    var lab=new PIXI.Container(),tx=new PIXI.Text(I.l,{fontFamily:'Outfit, Segoe UI, sans-serif',fontSize:11,fill:0x0a0820,fontWeight:'700',letterSpacing:1}),w=tx.width+20,pg=new PIXI.Graphics();
    tx.anchor.set(.5);pg.beginFill(I.c,.92).drawRoundedRect(-w/2,-10,w,20,10).endFill();lab.addChild(pg,tx);
    o._ly=-h-24;lab.y=o._ly;o.addChild(glow,body,lab);o.body=body;o.lab=lab;o.glow=glow;o._i=i;o._c=I.c;return o;
  }
  var BR=[0,1,2,3].map(function(i){var gap=Math.max(70,W*.1),x=XO-(3-i)*gap,b=mkIssue(i);b.x=x;b.y=gy(x)+4;return b});
  function chunkC(x,y,col){var g=wg(function(q){var r=5+Math.random()*7;q.lineStyle(1,col,.9).beginFill(col,.45).moveTo(-r,0).lineTo(-r*.4,-r).lineTo(r*.8,-r*.6).lineTo(r,r*.4).lineTo(-r*.3,r*.8).closePath().endFill()});g.x=x;g.y=y;FX.addChild(g);var vx=(Math.random()-.5)*180,vy=-40-Math.random()*80,du=.9+Math.random()*.4;gsap.to(g,{x:x+vx,rotation:(Math.random()-.5)*9,duration:du,ease:'none'});gsap.timeline().to(g,{y:y+vy,duration:du*.4,ease:'power2.out'}).to(g,{y:y+50,duration:du*.6,ease:'power2.in'}).to(g,{alpha:0,duration:.4,onComplete:function(){g.destroy()}})}
  function blast(i){
    var b=BR[i],cy=b.y-32,col=b._c;shake(6);
    flashS.x=b.x;flashS.y=cy;gsap.fromTo(flashS,{alpha:.7},{alpha:0,duration:.5});
    for(var k=0;k<16;k++)chunkC(b.x,cy,col);for(var q=0;q<16;q++)leaf(b.x,cy,q%2?col:0xffffff);
    puff(b.x,b.y,0x8a82a8,16,5);ring2(b.x,cy,0);
    gsap.to(b.body,{alpha:0,duration:.12});gsap.to(b.glow,{alpha:0,duration:.4});gsap.to(b.lab,{alpha:0,duration:.5});gsap.to(b.lab.scale,{x:1.4,y:1.4,duration:.5});
    var ct=new PIXI.Text('\u2726 cleared',{fontFamily:'Outfit, Segoe UI, sans-serif',fontSize:15,fill:col,fontWeight:'600',letterSpacing:2});ct.anchor.set(.5);ct.x=b.x;ct.y=cy-30;FX.addChild(ct);
    gsap.fromTo(ct.scale,{x:0,y:0},{x:1,y:1,duration:.5,ease:'back.out(2.5)'});gsap.to(ct,{alpha:0,y:ct.y-40,duration:.8,delay:1.1,onComplete:function(){ct.destroy()}});
    if(i===2)gsap.to(fogs,{_b:0,duration:1.5});
  }
  var MSG=['A relationship issue blocks my way\u2026','Now a career issue\u2026','And a family issue\u2026'],WIN=['Healed. One down!','Cleared. Two down!','All obstacles destroyed!'];
  function destroy(L,i){
    var b=BR[i],T=function(s){L.to({},{duration:s})};
    L.to(KK,{lean:0,uF:-.2,fF:-.3,uB:.05,fB:-.1,stf:0,stance:0,crouch:0,x:b.x-78,duration:i?1.5:1.1,ease:'power1.inOut'})
     .add(function(){wsay(MSG[i])});T(.9);
    L.to(KK,{uF:-2.8,fF:-.45,uB:-.7,fB:-.3,lean:-.2,crouch:.08,stance:.3,stf:.25,duration:.7,ease:'power2.out'})
     .to(KK,{uF:-.85,fF:-.05,lean:.45,crouch:.5,stf:-.35,duration:.14,ease:'power4.in'})
     .add(function(){blast(i)})
     .to(KK,{lean:.1,crouch:.2,duration:.5,ease:'power2.out'});
    L.add(function(){wsay(WIN[i])});T(.9);
  }
  var rock=new PIXI.Container();
  var rg=wg(function(g){g.lineStyle(1.5,0x7a6fc4,.8).beginFill(0x2a2450).moveTo(-34,0).lineTo(-40,-18).lineTo(-27,-44).lineTo(0,-58).lineTo(26,-49).lineTo(40,-24).lineTo(35,0).closePath().endFill();g.lineStyle(1,0x4a4090,.7).moveTo(-27,-44).lineTo(-8,-26).lineTo(0,0);g.moveTo(26,-49).lineTo(10,-28).lineTo(-8,-26);g.moveTo(-40,-18).lineTo(-8,-26)});
  var crack=wg(function(g){g.lineStyle(2,0xffe1a8,1).moveTo(0,-58).lineTo(-6,-40).lineTo(5,-30).lineTo(-3,-16).lineTo(2,0)});crack.alpha=0;
  rock.addChild(rg,crack);rock.x=XO;rock.y=gy(XO)+4;rock.visible=false;
  var dots=[];for(var dx=XO-10;dx<W*.97;dx+=34){var dd=spr(glowTex,48,0xffd27a,0);dd.height=13;dd.x=dx;dd.y=gy(dx)+7;dd._b=0;dots.push(dd)}
  // character rig (faces +x). Positive rotation swings limbs backward.
  function mkLeg(c){var th=new PIXI.Container(),u=wg(function(g){g.beginFill(0xffffff).drawRoundedRect(-2,0,4,15,1.8).endFill()}),sh=new PIXI.Container(),l=wg(function(g){g.beginFill(0xffffff).drawRoundedRect(-1.7,0,3.4,14,1.6).endFill();g.beginFill(0xffffff).drawRoundedRect(-1.7,12,7,3.4,1.5).endFill()});u.tint=c;l.tint=c;sh.y=15;sh.addChild(l);th.addChild(u,sh);th.sh=sh;th.ps=[u,l];th.y=-30;CH.addChild(th);return th}
  function mkArm(c){var a=new PIXI.Container(),up=wg(function(g){g.beginFill(0xffffff).drawRoundedRect(-1.9,0,3.8,9,1.8).endFill()}),fo=new PIXI.Container(),fa=wg(function(g){g.beginFill(0xffffff).drawRoundedRect(-1.7,0,3.4,9,1.6).endFill()}),hn=wg(function(g){g.beginFill(0xf2c9a0).drawCircle(0,10,2.3).endFill()});up.tint=c;fa.tint=c;fo.y=9;fo.addChild(fa,wg(function(g){g.beginFill(0xe6b56a).drawRoundedRect(-2,5.5,4,1.6,.8).endFill()}),hn);a.addChild(up,fo);a.fo=fo;a.ps=[up,fa];a.y=-17;return a}
  function feather(k){var f=wg(function(g){g.beginFill(0xfff1c2,.8).moveTo(0,0).lineTo(30-k*3,-6-k*3).lineTo(34-k*3,-2-k*3).closePath().endFill()});f.rotation=-.5-k*.28;f.blendMode=PIXI.BLEND_MODES.ADD;return f}
  function feathers(){var c=new PIXI.Container();for(var k=0;k<6;k++)c.addChild(feather(k));return c}
  var cgl=spr(glowTex,170,0xffb347,.2);cgl.y=-14;CH.addChild(cgl);
  var legB=mkLeg(0x0a0720),legF=mkLeg(0x120d33);legB.x=-1.5;legF.x=1.5;
  var TOR=new PIXI.Container();TOR.y=-30;CH.addChild(TOR);
  var WG=new PIXI.Container();WG.x=-2;WG.y=-17;WG.scale.set(0);var wA=feathers(),wB=feathers();wA.scale.x=-1;wB.scale.set(-.7,.7);wB.rotation=.5;WG.addChild(wB,wA);TOR.addChild(WG);
  var capeC=new PIXI.Container();capeC.y=-18;
  var cape=wg(function(g){g.beginFill(0xffffff).moveTo(-2,0).lineTo(3,0).bezierCurveTo(4,14,2,26,-5,35).lineTo(-15,33).bezierCurveTo(-15,18,-8,8,-2,0).endFill()});cape.tint=0x1b1450;
  capeC.addChild(cape,wg(function(g){g.lineStyle(1.2,0xe6b56a,.85).moveTo(-5,35).lineTo(-15,33)}));TOR.addChild(capeC);
  var armB=mkArm(0x1c1550);TOR.addChild(armB);
  var cloak=wg(function(g){g.beginFill(0xffffff).moveTo(-5.5,-19).lineTo(5.5,-19).lineTo(8,5).lineTo(-8,5).closePath().endFill()});cloak.tint=0x2a1f7a;TOR.addChild(cloak);
  TOR.addChild(wg(function(g){g.lineStyle(1.4,0xffb84d,.9).moveTo(-6.4,-8).lineTo(6.4,-8)}));
  var shade=wg(function(g){g.beginFill(0x000000,.22).moveTo(-5.5,-19).lineTo(-1,-19).lineTo(-3,5).lineTo(-8,5).closePath().endFill();g.beginFill(0xffffff,.08).moveTo(1,-19).lineTo(5.5,-19).lineTo(8,5).lineTo(3,5).closePath().endFill()});
  var mantle=wg(function(g){g.beginFill(0xffffff).drawEllipse(0,-18.5,7.5,3.4).endFill()});mantle.tint=0x3a2b9a;
  TOR.addChild(shade,mantle,wg(function(g){g.lineStyle(1,0xe6b56a,.9).drawEllipse(0,-18.5,7.5,3.4);g.lineStyle(0).beginFill(0xe6b56a).drawCircle(1,-8,1.7).endFill();g.beginFill(0x14102b).drawCircle(1,-8,.7).endFill()}));
  var HD=new PIXI.Container();HD.y=-20;TOR.addChild(HD);
  var hatG=wg(function(g){g.beginFill(0xffffff).moveTo(-7.5,-8).lineTo(7.5,-8).lineTo(2,-26).closePath().endFill()});hatG.tint=0x3b2a8f;
  var haloG=wg(function(g){g.lineStyle(1.6,0xffe1a8,1).drawEllipse(0,-31,8,2.6)});haloG.blendMode=PIXI.BLEND_MODES.ADD;haloG.alpha=0;
  HD.addChild(wg(function(g){g.beginFill(0xf2c9a0).drawCircle(0,-5,5.2).endFill();g.beginFill(0x1a1025).drawCircle(2.4,-5.4,.9).endFill()}),hatG,wg(function(g){g.beginFill(0xffd27a).drawCircle(1,-19,1.4).endFill()}),haloG);
  var brim=wg(function(g){g.beginFill(0xffffff).drawEllipse(0,-8,9.5,2.4).endFill()});brim.tint=0x3b2a8f;
  var eyeG=wg(function(g){g.beginFill(0xffffff).drawEllipse(0,0,1.7,1.45).endFill();g.beginFill(0x1a1025).drawCircle(.3,0,.95).endFill();g.beginFill(0xffffff).drawCircle(.6,-.4,.3).endFill()});eyeG.x=2.6;eyeG.y=-5.5;
  HD.addChild(wg(function(g){g.beginFill(0xeceaf7).drawEllipse(-5.2,-3.4,1.7,2.8).endFill();g.beginFill(0xff8a8a,.25).drawEllipse(3.2,-2.6,1.6,.9).endFill();g.beginFill(0xe6b08a).drawCircle(5,-3.8,.9).endFill();g.beginFill(0xeceaf7).moveTo(-3.6,-2.2).quadraticCurveTo(-1,9,5,-1.5).quadraticCurveTo(2.5,.4,-3.6,-2.2).endFill();g.lineStyle(.9,0x1a1025,.8).moveTo(1,-8.2).lineTo(4.2,-7.8)}),eyeG,brim,wg(function(g){g.lineStyle(1.2,0xe6b56a,.9).moveTo(-6.8,-11).lineTo(6.8,-11)}));
  var armF=mkArm(0x2a1f7a);TOR.addChild(armF);
  var stfC=new PIXI.Container();stfC.y=9;armF.fo.addChild(stfC);
  stfC.addChild(wg(function(g){g.lineStyle(2.4,0x9a6a28).moveTo(0,-30).lineTo(0,30);g.lineStyle(0).beginFill(0xffd27a).drawCircle(0,-32,3.4).endFill()}));
  stfC.addChild(wg(function(g){g.lineStyle(1.4,0xe6b56a,1).drawEllipse(0,-26,2.6,1);g.lineStyle(1,0xffffff,.9).beginFill(0xbfe6ff,.95).moveTo(0,-41).lineTo(4.4,-34).lineTo(0,-27).lineTo(-4.4,-34).closePath().endFill()}));
  var og=spr(glowTex,30,0xffd27a,.9);og.y=-32;stfC.addChild(og);
  function setLook(u){var c=lerpC(0x2a1f7a,0xffe9a8,u);cloak.tint=c;cape.tint=lerpC(0x1b1450,0xf6dca6,u);brim.tint=lerpC(0x3b2a8f,0xfff4d0,u);mantle.tint=lerpC(0x3a2b9a,0xffffff,u);hatG.tint=lerpC(0x3b2a8f,0xfff4d0,u);armF.ps.concat(armB.ps).forEach(function(p){p.tint=c});[legB,legF].forEach(function(l){l.ps.forEach(function(p){p.tint=lerpC(0x120d33,0xe8c46a,u)})});cgl.alpha=.2+.35*u;cgl.tint=lerpC(0xffb347,0xfff0b0,u)}
  var flashS=spr(glowTex,700,0xfff4d0,0);
  var BB=new PIXI.Container(),bbBg=new PIXI.Graphics(),bbTx=new PIXI.Text('',{fontFamily:'Outfit, Segoe UI, sans-serif',fontSize:13,fill:0x1a1025,fontWeight:'600'});bbTx.anchor.set(.5);bbTx.y=-22;BB.addChild(bbBg,bbTx);BB.alpha=0;
  [shad].concat(fogs,BR,[rock],dots,[CH,FX,flashS,BB]).forEach(function(o){SK2.addChild(o)});
  function wsay(t){if(!t){gsap.to(BB,{alpha:0,duration:.3});return}sfx.say(t,0);bbTx.text=t;var w=bbTx.width+22;bbBg.clear().beginFill(0xffffff,.95).drawRoundedRect(-w/2,-37,w,30,14).moveTo(-5,-8).lineTo(5,-8).lineTo(0,0).endFill();BB.alpha=1;gsap.fromTo(BB.scale,{x:.6,y:.6},{x:1,y:1,duration:.35,ease:'back.out(2)'})}
  // effects
  function shake(a){gsap.fromTo(stage,{x:a},{x:0,duration:.45,ease:'elastic.out(1,.25)'})}
  function pf1(x,y,c,sz){var s=new PIXI.Sprite(glowTex);s.anchor.set(.5);var z=sz*(.6+Math.random()*.8);s.width=s.height=z;s.tint=c;s.alpha=.35;s.x=x+(Math.random()-.5)*20;s.y=y;FX.addChild(s);gsap.to(s,{x:s.x+(Math.random()-.5)*50,y:y-10-Math.random()*26,alpha:0,width:z*2.2,height:z*2.2,duration:.9+Math.random()*.5,ease:'power2.out',onComplete:function(){s.destroy()}})}
  function puff(x,y,c,sz,n){for(var i=0;i<n;i++)pf1(x,y,c,sz)}
  function leaf(x,y,col){var s=spr(glowTex,6+Math.random()*6,col,1);s.x=x;s.y=y;FX.addChild(s);var a=-Math.PI*Math.random(),r=20+Math.random()*50;gsap.to(s,{x:x+Math.cos(a)*r,y:y+Math.sin(a)*r+20,alpha:0,duration:.8,ease:'power2.out',onComplete:function(){s.destroy()}})}
  function chunk(x,y){var g=wg(function(q){var r=5+Math.random()*7;q.lineStyle(1,0x7a6fc4,.7).beginFill(0x2a2450).moveTo(-r,0).lineTo(-r*.4,-r).lineTo(r*.8,-r*.6).lineTo(r,r*.4).lineTo(-r*.3,r*.8).closePath().endFill()});g.x=x;g.y=y;FX.addChild(g);var vx=(Math.random()-.3)*130,vy=-30-Math.random()*70,du=.9+Math.random()*.4;gsap.to(g,{x:x+vx,rotation:(Math.random()-.5)*8,duration:du,ease:'none'});gsap.timeline().to(g,{y:y+vy,duration:du*.4,ease:'power2.out'}).to(g,{y:y+40,duration:du*.6,ease:'power2.in'}).to(g,{alpha:0,duration:.4,onComplete:function(){g.destroy()}})}
  function ring2(x,y,dl){var g=wg(function(q){q.lineStyle(2.5,0xffd27a,1).drawCircle(0,0,30)});g.blendMode=PIXI.BLEND_MODES.ADD;g.x=x;g.y=y;g.scale.set(.2);g.alpha=.9;FX.addChild(g);gsap.to(g.scale,{x:3.4,y:2.4,duration:1.2,delay:dl,ease:'power2.out'});gsap.to(g,{alpha:0,duration:1.2,delay:dl,ease:'power2.in',onComplete:function(){g.destroy()}})}
  function spiral(cx0,cy0){var ps=[];for(var i=0;i<34;i++){var s=spr(glowTex,8+Math.random()*8,i%2?0xffd27a:0xc9a0ff,.9);s._a=Math.random()*6.28;s._k=.5+Math.random()*.5;FX.addChild(s);ps.push(s)}var pr={u:0};gsap.to(pr,{u:1,duration:1.4,ease:'power2.in',onUpdate:function(){ps.forEach(function(s){var r=(1-pr.u)*110*s._k,a=s._a+pr.u*9;s.x=cx0+Math.cos(a)*r;s.y=cy0+Math.sin(a)*r*.7})},onComplete:function(){ps.forEach(function(s){s.destroy()})}})}
  function hit(i){var b=BR[i];for(var k=0;k<12;k++)leaf(b.x,b.y-18,k%3?0x4cc27a:0xff5577);puff(b.x,b.y,0x6b8f6f,12,3);gsap.to(b,{alpha:0,duration:.35});gsap.to(b.scale,{y:.15,duration:.35,ease:'power2.in'});shake(2)}
  function smash(){crack.alpha=1;shake(3);gsap.delayedCall(.2,function(){var rx=rock.x,ry=rock.y-24;rock.alpha=0;for(var k=0;k<14;k++)chunk(rx,ry);puff(rx,rock.y,0x8a82a8,18,6);flashS.x=rx;flashS.y=ry;gsap.fromTo(flashS,{alpha:.8},{alpha:0,duration:.6});for(var q=0;q<14;q++)leaf(rx,ry,0xffd27a);shake(6);gsap.to(fogs,{_b:0,duration:1.5})})}
  function flare(){sfx.boom();var sk=KK.sk*KK.sc,cy=gy(KK.x)+4-(30+KK.flt)*sk;flashS.x=KK.x;flashS.y=cy;gsap.fromTo(flashS,{alpha:1},{alpha:0,duration:.9,ease:'power2.out'});ring2(KK.x,cy,0);ring2(KK.x,cy,.25);ring2(KK.x,cy,.5);for(var k=0;k<26;k++)leaf(KK.x,cy,k%2?0xffd27a:0xffffff);shake(4)}
  function trail(x,y){var s=spr(glowTex,8+Math.random()*10,Math.random()<.5?0xffd27a:0xfff1c2,.8);s.x=x+(Math.random()-.5)*8;s.y=y+(Math.random()-.5)*8;FX.addChild(s);gsap.to(s,{y:s.y+30,alpha:0,duration:.9,ease:'power1.out',onComplete:function(){s.destroy()}})}
  function sunhit(){gsap.to(core,{_s:core._s*1.4,duration:.5,yoyo:true,repeat:1});gsap.to(halo,{_s:halo._s*1.4,duration:.5,yoyo:true,repeat:1});shake(3)}
  function resetAll(){Object.assign(KK,IDLE,{x:W*.06,px:W*.06,dir:1,flt:0,wing:0,sc:1,vis:0});lk.u=0;setLook(0);rock.alpha=1;rock.rotation=0;crack.alpha=0;BR.forEach(function(b){b.alpha=0;b.scale.set(OBS);b.body.alpha=1;b.lab.alpha=1;b.lab.scale.set(1);b.glow.alpha=.28});fogs.forEach(function(f){f._b=.22});dots.forEach(function(q){q._b=0});BB.alpha=0;G.vis=0;G.fol=0;G.dir=-1;G.x=W+60;GBc.alpha=0;GL.alpha=0;emblem.alpha=0;glTx.text='YOUR GOAL';maskReset();obReset()}
  // ---- Realistic character: shaded, canvas-painted body parts (replaces the cartoon rig) ----
  CH.removeChildren();
  function cv(w,h,f){var c=document.createElement('canvas');c.width=w*4;c.height=h*4;var x=c.getContext('2d');x.scale(4,4);f(x);var s=new PIXI.Sprite(PIXI.Texture.from(c));s.width=w;s.height=h;return s}
  function mkSp(w,h,f,ax,ay){var s=cv(w,h,f);s.anchor.set(ax,ay);return s}
  function lgd(x,x0,y0,x1,y1,st){var g=x.createLinearGradient(x0,y0,x1,y1);st.forEach(function(s){g.addColorStop(s[0],s[1])});return g}
  var T8=[[0,'#6f6f6f'],[.55,'#cfcfcf'],[1,'#f2f2f2']];
  function legSet(){
    var th=new PIXI.Container(),sh=new PIXI.Container();
    var u=mkSp(8,15.5,function(x){x.fillStyle=lgd(x,0,0,8,0,T8);x.beginPath();x.moveTo(.6,0);x.lineTo(7.4,0);x.lineTo(6.4,15.5);x.lineTo(1.6,15.5);x.closePath();x.fill();x.strokeStyle='rgba(0,0,0,.16)';x.lineWidth=.4;x.beginPath();x.moveTo(1.8,8);x.lineTo(5.6,9.6);x.stroke()},.5,0);
    var l=mkSp(6.6,13.5,function(x){x.fillStyle=lgd(x,0,0,6.6,0,T8);x.beginPath();x.moveTo(.8,0);x.lineTo(5.8,0);x.lineTo(5,13.5);x.lineTo(1.6,13.5);x.closePath();x.fill();x.fillStyle='rgba(0,0,0,.25)';x.fillRect(1.5,12,3.4,1.5)},.5,0);
    var shoe=mkSp(13,6,function(x){x.fillStyle=lgd(x,0,0,0,6,[[0,'#4a3a32'],[1,'#17120f']]);x.beginPath();x.moveTo(2,0);x.lineTo(6.5,0);x.bezierCurveTo(9,1.5,12.5,2.2,12.8,4);x.lineTo(12.8,5);x.lineTo(1.5,5);x.lineTo(1.5,1);x.closePath();x.fill();x.fillStyle='#e7dfd4';x.fillRect(1.5,4.8,11.3,1.2);x.fillStyle='rgba(255,255,255,.25)';x.fillRect(3,.6,4,.8)},.22,.1);shoe.y=9.2;
    sh.y=14.5;sh.addChild(l,shoe);th.addChild(u,sh);th.sh=sh;th.shoe=shoe;th.ps=[u,l];th.y=-30;return th;
  }
  function armSet(){
    var a=new PIXI.Container(),fo=new PIXI.Container();
    var u=mkSp(5.6,11.5,function(x){x.fillStyle=lgd(x,0,0,5.6,0,T8);x.beginPath();x.moveTo(.5,0);x.lineTo(5.1,0);x.lineTo(4.6,11.5);x.lineTo(1,11.5);x.closePath();x.fill()},.5,0);
    var f=mkSp(4.8,11,function(x){x.fillStyle=lgd(x,0,0,4.8,0,T8);x.beginPath();x.moveTo(.8,0);x.lineTo(4,0);x.lineTo(3.8,11);x.lineTo(1,11);x.closePath();x.fill();x.fillStyle='rgba(0,0,0,.28)';x.fillRect(.9,9.2,2.9,1.8)},.5,0);
    var h=mkSp(4.6,5.8,function(x){x.fillStyle=lgd(x,0,0,4.6,0,[[0,'#b57f5d'],[1,'#e8b998']]);x.beginPath();x.moveTo(.8,0);x.lineTo(3.8,0);x.lineTo(4.2,3.4);x.quadraticCurveTo(3.8,5.8,2.3,5.8);x.quadraticCurveTo(.6,5.6,.6,3.4);x.closePath();x.fill();x.strokeStyle='rgba(90,50,30,.4)';x.lineWidth=.3;x.beginPath();x.moveTo(1.7,3);x.lineTo(1.7,5.4);x.moveTo(2.7,3);x.lineTo(2.7,5.5);x.stroke()},.5,0);h.y=10.4;
    fo.y=10.6;fo.addChild(f,h);a.addChild(u,fo);a.fo=fo;a.ps=[u,f];a.y=-19;return a;
  }
  var legB=legSet(),legF=legSet();legB.x=-1.5;legF.x=1.5;
  var TOR=new PIXI.Container();TOR.y=-30;
  var WG=new PIXI.Container();WG.x=-2;WG.y=-18;WG.scale.set(0);var wA=feathers(),wB=feathers();wA.scale.x=-1;wB.scale.set(-.7,.7);wB.rotation=.5;WG.addChild(wB,wA);
  var armB=armSet(),armF=armSet();
  var neckS=mkSp(4.4,6,function(x){x.fillStyle=lgd(x,0,0,0,6,[[0,'#8a5a40'],[.5,'#c48c68'],[1,'#d9a07a']]);x.fillRect(.4,0,3.6,6);x.fillStyle='rgba(60,30,20,.2)';x.fillRect(.4,0,1.2,6)},.5,0);neckS.y=-26;
  var cloak=mkSp(15,24,function(x){x.fillStyle=lgd(x,0,0,15,0,T8);x.beginPath();x.moveTo(3.2,0);x.quadraticCurveTo(7.5,-1,11.8,0);x.lineTo(14,3);x.lineTo(13.4,23);x.lineTo(1.6,23);x.lineTo(1,3);x.closePath();x.fill();
    x.strokeStyle='rgba(0,0,0,.3)';x.lineWidth=.5;x.beginPath();x.moveTo(11.5,1.5);x.lineTo(12.6,23);x.stroke();
    x.strokeStyle='rgba(0,0,0,.14)';x.beginPath();x.moveTo(4,10);x.quadraticCurveTo(7,13,10,12);x.moveTo(3,17);x.quadraticCurveTo(7,19,11,18);x.stroke();
    x.fillStyle='rgba(0,0,0,.22)';x.fillRect(1.6,21,11.8,2);x.fillStyle='rgba(255,255,255,.35)';x.beginPath();x.moveTo(3.2,0);x.quadraticCurveTo(7.5,-1,11.8,0);x.lineTo(12.5,2);x.lineTo(2.5,2);x.fill()},.5,0);cloak.y=-21;
  var HD=new PIXI.Container();HD.y=-25;
  var headS=mkSp(20,22,function(x){
    var g=x.createRadialGradient(11,9,.5,9,12,8);g.addColorStop(0,'#f2c9a8');g.addColorStop(.6,'#d9a07a');g.addColorStop(1,'#a56f4e');
    x.fillStyle=g;x.beginPath();x.ellipse(9,12,5,6,0,0,Math.PI*2);x.fill();
    x.fillStyle='rgba(120,70,45,.25)';x.beginPath();x.ellipse(9.5,16.5,3.6,2,0,0,Math.PI*2);x.fill();
    x.fillStyle='#d49b78';x.beginPath();x.moveTo(13.6,10.8);x.lineTo(15.6,13.8);x.lineTo(13.4,14.4);x.closePath();x.fill();
    x.fillStyle='rgba(110,60,40,.35)';x.beginPath();x.moveTo(13.4,14.4);x.lineTo(15.4,13.9);x.lineTo(14.2,14.9);x.fill();
    x.fillStyle='#c58b68';x.beginPath();x.ellipse(4.3,12.6,1,1.7,0,0,Math.PI*2);x.fill();
    x.fillStyle='rgba(40,28,20,0)';x.beginPath();x.ellipse(10,16.4,3.8,1.8,0,0,Math.PI*2);x.fill();
    var hg=x.createLinearGradient(4,2,14,10);hg.addColorStop(0,'#4a3a2c');hg.addColorStop(1,'#1f1812');
    x.fillStyle=hg;x.beginPath();x.moveTo(3.6,12);x.bezierCurveTo(2.4,4,7.5,1.6,11.6,2.6);x.bezierCurveTo(15.6,3.6,14.6,8.4,13.8,9.4);x.lineTo(12.2,7.4);x.bezierCurveTo(9.4,6.6,6.4,7.8,5.6,12);x.closePath();x.fill();
    x.strokeStyle='rgba(255,255,255,.18)';x.lineWidth=.3;x.beginPath();x.moveTo(6,5);x.quadraticCurveTo(9,3,12,4);x.moveTo(5.4,7);x.quadraticCurveTo(9,4.4,13,6);x.stroke();
    x.strokeStyle='#2a2018';x.lineWidth=.7;x.beginPath();x.moveTo(10,9);x.lineTo(13.2,8.7);x.stroke();
  },0,0);headS.x=-9;headS.y=-18;
  var eyeG=new PIXI.Graphics();eyeG.beginFill(0xffffff).drawEllipse(0,0,1.9,1.35).endFill();eyeG.beginFill(0x3a2a20).drawCircle(.5,0,.95).endFill();eyeG.beginFill(0x000000).drawCircle(.55,0,.45).endFill();eyeG.beginFill(0xffffff,.9).drawCircle(.85,-.35,.28).endFill();eyeG.x=2.6;eyeG.y=-7.2;
  var mouthG=new PIXI.Graphics(),mood=9;mouthG.x=3.2;mouthG.y=-1.6;
  function setMood(m){if(m===mood)return;mood=m;mouthG.clear().lineStyle(.8,0x7a3f35,1).moveTo(-1.5,0).quadraticCurveTo(0,m*1.2,1.5,0)}
  var haloG=new PIXI.Graphics();haloG.lineStyle(1.4,0xffe1a8,1).drawEllipse(0,-19,7,2.2);haloG.blendMode=PIXI.BLEND_MODES.ADD;haloG.alpha=0;
  HD.addChild(headS,eyeG,mouthG,haloG);
  TOR.addChild(WG,armB,neckS,cloak,HD,armF);
  CH.addChild(cgl,legB,legF,TOR);
  var capeC=new PIXI.Container(),cape=new PIXI.Graphics(),stfC=new PIXI.Container(),og=new PIXI.Sprite();
  function setLook(u){
    var jc=lerpC(0x3e5a96,0xffe9a8,u);cloak.tint=jc;
    armF.ps.forEach(function(p){p.tint=jc});armB.ps.forEach(function(p){p.tint=lerpC(0x2e4575,0xe6d08e,u)});
    legF.ps.forEach(function(p){p.tint=lerpC(0x2a3045,0xe8c46a,u)});legB.ps.forEach(function(p){p.tint=lerpC(0x1b1f30,0xc9a553,u)});
    cgl.alpha=.2+.35*u;cgl.tint=lerpC(0xffb347,0xfff0b0,u);
  }
  setLook(0);
  // per-frame animation (velocity-driven walk cycle, no foot sliding)
  function seekerTick(d){
    var sk=KK.sk=Math.max(.85,Math.min(1.3,app.screen.width/1000));
    var vx=KK.x-KK.px;KK.px=KK.x;
    KK.walk+=(Math.min(1,Math.max(0,(Math.abs(vx)/d-.25)/.9))-KK.walk)*.18;
    if(KK.walk>.04)KK.ph+=Math.abs(vx)*.11;
    var ph=KK.ph,sw=Math.sin(ph)*KK.walk,cs=Math.cos(ph)*KK.walk,cr=KK.crouch,st=KK.stance;
    legF.rotation=-sw*.62-st*.5-cr*.5;legF.sh.rotation=Math.max(0,cs)*.95+cr+st*.2;
    legB.rotation=sw*.62+st*.6-cr*.3;legB.sh.rotation=Math.max(0,-cs)*.95+cr*.6;
    legF.shoe.rotation=-(legF.rotation+legF.sh.rotation)*.9+Math.sin(ph+.9)*.35*KK.walk;legB.shoe.rotation=-(legB.rotation+legB.sh.rotation)*.9-Math.sin(ph+.9)*.35*KK.walk;cloak.skew.x=Math.sin(ph*2)*.04*KK.walk;TOR.x=Math.sin(t*.8)*.4*(1-KK.walk);
    var hy=-30+30*(1-Math.cos(sw*.62))+cr*5;legF.y=legB.y=hy;TOR.y=hy;
    TOR.rotation=KK.lean+sw*.03+.1*KK.walk;TOR.scale.y=1+Math.sin(t*2)*.008;
    armF.rotation=KK.uF+sw*.5;armF.fo.rotation=KK.fF-Math.max(0,-sw)*.55;armB.rotation=KK.uB-sw*.5;armB.fo.rotation=KK.fB-Math.max(0,sw)*.55;armF.y=-19+sw*.4;armB.y=-19-sw*.4;
    setMood(KK.wing>.4||KK.smile>.5?1:(KK.head>.2?-1:0));eyeG.scale.y=(t%3.7>3.58)?.12:1;capeC.rotation=.1+KK.walk*.28+Math.sin(t*3)*.04+Math.sin(KK.ph*2)*.05*KK.walk+Math.min(.5,KK.flt*.006);capeC.scale.x=1+Math.sin(t*4)*.05;capeC.alpha=KK.wing;pF.visible=pB.visible=KK.wing<.3&&Math.abs(KK.pitch)<.3&&KK.uF>-1.5;
    stfC.rotation=KK.stf;HD.rotation=KK.head-sw*.02-KK.lean*.5+Math.sin(t*.7)*.02*(1-KK.walk)+(G.vis>.5?Math.max(-.4,Math.min(.15,(GD.y-(CH.y-60*sk))*.003)):0);
    WG.scale.set(KK.wing);WG.rotation=Math.sin(t*(3+KK.flap*9))*(.06+.28*KK.flap)*KK.wing;WG.alpha=KK.wing;haloG.alpha=KK.wing*(.7+.3*Math.sin(t*3));og.alpha=.7+.3*Math.sin(t*4);
    var gnd=gy(KK.x)+4;CH.scale.set(.86*sk*KK.sc*KK.dir,.86*sk*KK.sc);CH.pivot.set(0,-30);CH.x=KK.x;CH.y=gnd-KK.flt*sk-30*.86*sk*KK.sc+KK.fall*sk;CH.rotation=KK.pitch-Math.atan2(gy(KK.x)-gy(KK.x+8),8)*.8*Math.max(0,1-KK.flt/12);
    shad.x=KK.x;shad.y=gnd;shad.scale.set(sk*KK.sc*Math.max(0,1-KK.flt*.02));shad.alpha=Math.max(.2,1-KK.flt*.03);shad.skew.x=-(sun.x-KK.x)*.0006;
    var stp=Math.floor(ph/Math.PI);if(stp!==KK.step){KK.step=stp;if(KK.walk>.45&&KK.flt<4){puff(KK.x+4*sk,gnd,0x8a82a8,10,2);sfx.step(KK.walk)}}
    BR.forEach(function(b){if(b.body.alpha>.5)b.glow.alpha=.18+.08*Math.sin(t*2.4+b._i);b.lab.y=b._ly+Math.sin(t*2+b._i)*3});
    fogs.forEach(function(f,i){f.x=f._x+Math.sin(t*.6+i*2)*14;f.alpha=f._b*(.8+.2*Math.sin(t+i))});
    dots.forEach(function(q,i){q.alpha=q._b*(.65+.35*Math.sin(t*3-i*.5))});
    BB.x=Math.max(90,Math.min(app.screen.width-90,KK.x));BB.y=gnd-(92*KK.sc+KK.flt)*sk;
    if(G.fol>0){G.x+=((KK.x-34*sk)-G.x)*.08;G.y+=((CH.y-62*KK.sc*sk)-G.y)*.08}
    GD.x=G.x+Math.sin(t*2)*6;GD.y=G.y+Math.sin(t*4)*4;GD.scale.set(1.5*sk*G.dir*G.sc,1.5*sk*G.sc);GD.rotation=Math.sin(t*2.2)*.12;GD.alpha=G.vis;gW1.rotation=gW2.rotation=Math.sin(t*6)*.28;
    GBc.x=Math.max(100,Math.min(app.screen.width-100,GD.x));GBc.y=GD.y-24*sk;
    if(G.vis>.5&&Math.random()<.5)trail(GD.x-6*G.dir,GD.y+4);
    SK2.alpha=KK.vis*S.rise;
    if(KK.flt>24&&KK.vis>.1&&Math.random()<.8)trail(KK.x-6*sk*KK.dir,CH.y);
    if(KK.pitch>.5&&KK.vis>.1&&Math.random()<.9)speedLine();
    sfx.level(G.vis>.5?1:0,KK.pitch>.4?1:0);drawFlag();glRing.rotation+=.01*d;glStar.rotation-=.004*d;glS.alpha=.6+.25*Math.sin(t*2);
  }
  // story
  function hack(L,i){
    L.add(function(){if(i===0)wsay('Break through!')})
     .to(KK,{uF:-2.7,fF:-.5,uB:-.6,fB:-.3,lean:-.12,crouch:.1,stf:.2,duration:.5,ease:'power2.out'})
     .to(KK,{uF:-.9,fF:-.1,uB:-.3,lean:.32,crouch:.35,stf:-.3,duration:.16,ease:'power4.in'})
     .add(function(){hit(i)})
     .to(KK,{lean:.15,crouch:.2,duration:.3,ease:'power2.out'})
     .to(KK,{x:'+=16',duration:.5,ease:'power1.inOut'});
  }
  function push(L,first){
    L.add(function(){if(first)wsay('Too heavy\u2026')})
     .to(KK,{lean:.42,uF:-1.45,fF:-.05,uB:-1.35,fB:-.05,stance:.55,crouch:.45,head:.1,duration:.55,ease:'power2.out'})
     .to(KK,{x:'+=3',duration:.5,ease:'power1.in'})
     .to(rock,{rotation:.03,duration:.08,yoyo:true,repeat:5},'<.2')
     .to(KK,{x:'-=5',lean:.2,duration:.5,ease:'power2.out'});
  }
  // ---- Small guide: flies in and frees the person from each obstacle ----
  var G={x:W+60,y:H*.15,vis:0,fol:0,dir:-1,sc:1};
  var GD=new PIXI.Container(),gGlow=spr(glowTex,110,0xffd27a,.7);
  function gwing(){return wg(function(g){g.beginFill(0xfff1c2,.85).moveTo(0,0).quadraticCurveTo(-14,-14,-20,-4).quadraticCurveTo(-12,4,0,2).endFill()})}
  var gW1=gwing(),gW2=gwing();gW2.scale.x=-1;
  var gBody=wg(function(g){g.beginFill(0xfff1c2).drawCircle(0,0,6).endFill();g.beginFill(0xffd27a,.6).drawCircle(1,1,4).endFill();g.beginFill(0x1a1025).drawCircle(2.2,-.8,.9).drawCircle(-1.2,-.8,.9).endFill();g.beginFill(0x3b2a8f).moveTo(-5,-4).lineTo(5,-4).lineTo(0,-15).closePath().endFill();g.beginFill(0xffd27a).drawCircle(0,-12,1).endFill()});
  GD.addChild(gGlow,gW1,gW2,gBody);GD.alpha=0;
  var GBc=new PIXI.Container(),gBg=new PIXI.Graphics(),gTx=new PIXI.Text('',{fontFamily:'Outfit, Segoe UI, sans-serif',fontSize:13,fill:0x1a1025,fontWeight:'600'});gTx.anchor.set(.5);gTx.y=-22;GBc.addChild(gBg,gTx);GBc.alpha=0;
  SK2.addChild(GD,GBc);
  function gsay(t){if(!t){gsap.to(GBc,{alpha:0,duration:.3});return}sfx.say(t,1);gTx.text=t;var w=gTx.width+22;gBg.clear().beginFill(0xffe9b0,.96).drawRoundedRect(-w/2,-37,w,30,14).moveTo(-5,-8).lineTo(5,-8).lineTo(0,0).endFill();GBc.alpha=1;gsap.fromTo(GBc.scale,{x:.6,y:.6},{x:1,y:1,duration:.35,ease:'back.out(2)'})}
  function zap(i){
    var b=BR[i],x0=GD.x+8,y0=GD.y,x1=b.x,y1=b.y-34;
    var bm=wg(function(g){g.lineStyle(7,0xffd27a,.35).moveTo(x0,y0).lineTo(x1,y1);g.lineStyle(3,0xfff1c2,.9).moveTo(x0,y0).lineTo(x1,y1);g.lineStyle(1,0xffffff,1).moveTo(x0,y0).lineTo(x1,y1)});
    bm.blendMode=PIXI.BLEND_MODES.ADD;FX.addChild(bm);
    gsap.fromTo(bm,{alpha:0},{alpha:1,duration:.12,yoyo:true,repeat:1,onComplete:function(){bm.destroy()}});
    gsap.delayedCall(.14,function(){blast(i)});
  }
  var GM=['Your relationship worries\u2026 let them go.','Your career fears\u2026 let them go.','Your health struggles\u2026 let them go.','Your business blockage\u2026 let it go.'],HOPE=['I can breathe again.','I can see my way.','I feel strong again!','My business can grow again!'];
  function guideEnter(L){
    var T=function(s){L.to({},{duration:s})};
    L.add(function(){G.dir=-1;G.x=W+60;G.y=H*.15;gsap.to(G,{vis:1,duration:.4})})
     .to(G,{x:BR[0].x-60,y:gy(BR[0].x)-165,duration:2.4,ease:'power2.out'})
     .add(function(){G.dir=1;gsay('Hi! I am your guide. I will help you.')})
     .to(KK,{head:-.1,lean:.1,duration:.7,ease:'power2.out'});T(1.2);
    L.add(function(){gsay('');wsay('Who\u2026 are you?')});T(1.2);
  }
  function guideFree(L,i){
    var b=BR[i],T=function(s){L.to({},{duration:s})},nx=i<3?Math.max(30,BR[i+1].x-100):XO+30;
    L.add(function(){gsay(GM[i])}).to(G,{x:b.x-52,y:gy(b.x)-165,duration:1.1,ease:'power2.inOut'});T(.6);
    L.add(function(){zap(i)});T(.7);
    L.add(function(){gsay('');wsay(HOPE[i])}).to(KK,{lean:0,head:-.12,uF:-.2,fF:-.3,uB:.05,fB:-.1,crouch:0,duration:.7,ease:'power2.out'});T(.7);
    L.to(KK,{x:nx,duration:i<3?2:2.2,ease:'power1.inOut'});
    if(i<3)L.to(KK,{lean:.12,head:.22,uF:.05,fF:.1,duration:.6,ease:'power2.out'});
  }
  // ---- Happy transformation + Superman-style flight toward the goal ----
  var GX=W*.86,GY=gy(W*.86);
  var GL=new PIXI.Container(),glS=spr(glowTex,200,0xffd27a,.8);
  var glStar=wg(function(g){g.beginFill(0xffffff).moveTo(0,-26).lineTo(5,-5).lineTo(26,0).lineTo(5,5).lineTo(0,26).lineTo(-5,5).lineTo(-26,0).lineTo(-5,-5).closePath().endFill()});
  var glRing=wg(function(g){g.lineStyle(1.5,0xffd27a,.8).drawCircle(0,0,38);g.lineStyle(1,0xffd27a,.5).drawCircle(0,0,50)});glRing.blendMode=PIXI.BLEND_MODES.ADD;
  var glTx=new PIXI.Text('YOUR GOAL',{fontFamily:'Outfit, Segoe UI, sans-serif',fontSize:12,fill:0xffe1a8,fontWeight:'600',letterSpacing:4});glTx.anchor.set(.5);glTx.y=20;
  GL.addChild(glS,glRing,glStar,glTx);GL.x=GX;GL.y=GY;GL.alpha=0;SK2.addChild(GL);
  var capeS=mkSp(18,34,function(x){x.fillStyle=lgd(x,0,0,18,0,[[0,'#7a7a7a'],[.5,'#d6d6d6'],[1,'#f4f4f4']]);x.beginPath();x.moveTo(5,0);x.lineTo(13,0);x.bezierCurveTo(14,12,17,24,16,33);x.quadraticCurveTo(10,31,2,33);x.bezierCurveTo(2,22,4,10,5,0);x.closePath();x.fill();x.strokeStyle='rgba(0,0,0,.18)';x.lineWidth=.5;x.beginPath();x.moveTo(8,2);x.quadraticCurveTo(7,18,6,32);x.moveTo(11,2);x.quadraticCurveTo(12,18,13,32);x.stroke();x.strokeStyle='rgba(255,236,170,.9)';x.lineWidth=.8;x.beginPath();x.moveTo(2,33);x.quadraticCurveTo(10,31,16,33);x.stroke()},.5,0);capeS.tint=0xd9433a;
  capeC.y=-19;capeC.addChild(capeS);capeC.alpha=0;TOR.addChildAt(capeC,1);
  var emblem=wg(function(g){g.beginFill(0xffe9a8).moveTo(1.5,-14).lineTo(2.5,-11.6).lineTo(5.1,-11.4).lineTo(3.1,-9.8).lineTo(3.8,-7.4).lineTo(1.5,-8.8).lineTo(-.8,-7.4).lineTo(-.1,-9.8).lineTo(-2.1,-11.4).lineTo(.5,-11.6).closePath().endFill()});emblem.alpha=0;TOR.addChildAt(emblem,TOR.getChildIndex(cloak)+1);
  function cf1(x,y){var col=[0xffd27a,0xff6b8a,0x6aa8ff,0x5eead4,0xffffff,0xc084fc][Math.floor(Math.random()*6)],g=wg(function(q){q.beginFill(col).drawRect(-1.5,-2.5,3,5).endFill()});g.x=x;g.y=y;g.rotation=Math.random()*6;FX.addChild(g);var a=-Math.PI*(.15+.7*Math.random()),v=60+Math.random()*120;gsap.to(g,{x:x+Math.cos(a)*v,rotation:g.rotation+(Math.random()-.5)*14,duration:1.8,ease:'power1.out'});gsap.timeline().to(g,{y:y+Math.sin(a)*v,duration:.6,ease:'power2.out'}).to(g,{y:y+160,alpha:0,duration:1.4,ease:'power1.in',onComplete:function(){g.destroy()}})}
  function confetti(x,y,n){for(var i=0;i<n;i++)cf1(x,y)}
  function speedLine(){var th=1.5708-KK.pitch,dx=Math.cos(th),dy=-Math.sin(th),s=spr(glowTex,90,0xffffff,.5);s.height=2;s.x=CH.x+(Math.random()-.5)*60-dx*40;s.y=CH.y+(Math.random()-.5)*60-dy*40;s.rotation=-th;FX.addChild(s);gsap.to(s,{x:s.x-dx*170,y:s.y-dy*170,alpha:0,duration:.4,ease:'none',onComplete:function(){s.destroy()}})}
  function showGoal(){gsap.fromTo(GL,{alpha:0},{alpha:1,duration:.8});gsap.fromTo(GL.scale,{x:.2,y:.2},{x:1,y:1,duration:.9,ease:'back.out(2)'})}
  function goalHit(){sfx.fanfare();flashS.x=GX;flashS.y=GY;gsap.fromTo(flashS,{alpha:1},{alpha:0,duration:.9});confetti(GX,GY,60);for(var k=0;k<24;k++)leaf(GX,GY,k%2?0xffd27a:0xffffff);ring2(GX,GY,0);ring2(GX,GY,.3);glTx.text='GOAL REACHED';gsap.fromTo(GL.scale,{x:1.5,y:1.5},{x:1,y:1,duration:.7,ease:'elastic.out(1,.4)'});shake(4)}
  function heroEnding(L){
    var T=function(s){L.to({},{duration:s})},x0=XO+30,gnd0=gy(x0)+4,sk0=Math.max(.85,Math.min(1.3,W/1000)),tx=GX-30,tfl=(gnd0-GY)/sk0+110,th=Math.atan2(tfl*sk0,tx-x0),pt=1.5708-th;
    L.add(function(){sfx.chime();wsay('Yes! I did it!');gsay('You are free! Go for your goal!');KK.smile=1;confetti(KK.x,gy(KK.x)-40,40);showGoal()})
     .to(KK,{uF:-2.7,uB:-2.7,fF:-.3,fB:-.3,head:-.2,lean:-.05,flt:16,duration:.45,ease:'power2.out'})
     .to(KK,{flt:0,duration:.4,ease:'bounce.out'}).to(KK,{flt:18,duration:.45,ease:'power2.out'}).to(KK,{flt:0,duration:.4,ease:'bounce.out'});T(.3);
    L.add(function(){sfx.rise();wsay('I feel incredible!');promisePop();gsay('');spiral(KK.x,gy(KK.x)+4-(30+9)*KK.sk)})
     .to(KK,{uF:-2.6,uB:-2.4,fF:-.3,fB:-.3,head:-.2,flt:20,duration:1.4,ease:'power2.out'},'<')
     .add(flare)
     .to(lk,{u:1,duration:.7,onUpdate:function(){setLook(lk.u)}},'<')
     .to(KK,{wing:1,sc:1.14,duration:1,ease:'back.out(1.7)'},'<')
     .to(emblem,{alpha:1,duration:.6},'<')
     .add(function(){confetti(KK.x,gy(KK.x)-60,50)});T(.8);
    L.add(function(){wsay('To my goal!')})
     .to(KK,{crouch:.5,lean:.2,uF:-.5,uB:.3,flt:20,duration:.5,ease:'power2.in'})
     .add(function(){sfx.whoosh();wsay('');KK.dir=1;var g0=gy(KK.x)+4;puff(KK.x,g0,0x8a82a8,18,7);ring2(KK.x,g0-4,0);shake(4)})
     .to(KK,{pitch:pt,head:-(pt-.15),lean:0,uF:-3.1,fF:0,uB:.15,fB:-.2,stance:0,crouch:0,flap:1,duration:.7,ease:'power3.out'})
     .to(KK,{x:tx,flt:tfl,sc:.75,duration:3.4,ease:'power2.inOut'},'<.25')
     .add(goalHit)
     .to(KK,{pitch:0,head:0,uF:-3,uB:-.3,fF:-.2,fB:-.2,flap:0,duration:.8,ease:'power2.out'})
     .add(function(){wsay('Goal reached!');gsay('Well done!')});T(2.2);
    L.add(function(){wsay('Now, down to the journey!');sfx.whoosh();goNext()})
     .to(KK,{crouch:.4,uF:-.5,uB:.3,duration:.3,ease:'power2.in'})
     .to(KK,{crouch:0,pitch:2.2,head:-2.05,lean:0,uF:-3.1,fF:0,uB:.15,fB:-.2,flap:1,duration:.5,ease:'power3.out'})
     .to(KK,{fall:H*1.4/sk0,duration:1.2,ease:'power2.in'},'<.2')
     .to(KK,{vis:0,duration:.4},'-=.3');T(.8);
  }
  // ---- Realism pass: stone obstacles with lighting + glowing runes, physics debris, insect-winged guide ----
  function mkRockTex(i){
    var TW=240,TH=216,c=document.createElement('canvas');c.width=TW;c.height=TH;var x=c.getContext('2d'),im=x.createImageData(TW,TH),hm=new Float32Array(TW*TH),rd=new Float32Array(TW*TH),sd=SEED+i*17;
    for(var y=0;y<TH;y++)for(var xx=0;xx<TW;xx++){
      var u=(xx-TW/2)/(TW*.46),v=(y-TH*.55)/(TH*.45),r=Math.sqrt(u*u+v*v),th=Math.atan2(v,u),rad=.88+.22*(fb(Math.cos(th)*1.6+sd,Math.sin(th)*1.6+sd,3)-.5),k=y*TW+xx;
      rd[k]=(y<TH*.95)?(rad-r)/rad:-1;hm[k]=Math.sqrt(Math.max(0,1-(r/rad)*(r/rad)))*.9+fb(xx*.04+sd,y*.04,5)*.5+(vn(xx*.2,y*.2)-.5)*.08;
    }
    var base=[[128,112,120],[108,122,150],[108,132,124],[140,120,95]][i],em=[[255,107,138],[106,168,255],[94,234,212],[255,184,77]][i],L=[-.5,-.7,.55];
    for(var y2=1;y2<TH-1;y2++)for(var x2=1;x2<TW-1;x2++){
      var k2=y2*TW+x2,e=rd[k2];if(e<=0)continue;
      var dx=hm[k2+1]-hm[k2-1],dy=hm[k2+TW]-hm[k2-TW],nx=-dx*6,ny=-dy*6,nl=Math.sqrt(nx*nx+ny*ny+1),dif=Math.max(0,(nx*L[0]+ny*L[1]+L[2])/(nl*1.021)),sh=.25+.95*dif;
      var tone=.75+.5*fb(x2*.02+sd,y2*.02,4),gr=(vn(x2*.5,y2*.5)-.5)*.2,rid=1-Math.abs(2*fb(x2*.03+sd*2,y2*.03,4)-1),cr=Math.max(0,(rid-.955)/.045),moss=Math.max(0,fb(x2*.025+sd*3,y2*.025,4)-.6)*3/nl,ao=.75+.25*Math.min(1,e*3);
      var R=base[0]*tone,G=base[1]*tone,B=base[2]*tone;R+=(60-R)*moss*.5;G+=(105-G)*moss*.5;B+=(60-B)*moss*.5;
      var f=sh*ao*(1-cr*.6)+gr,o=k2*4;
      im.data[o]=Math.min(255,R*f+em[0]*cr*1.3);im.data[o+1]=Math.min(255,G*f+em[1]*cr*1.3);im.data[o+2]=Math.min(255,B*f+em[2]*cr*1.3);im.data[o+3]=255*Math.min(1,e*14);
    }
    x.putImageData(im,0,0);x.save();x.globalCompositeOperation='lighter';x.translate(TW/2,TH*.52);x.shadowColor='rgb('+em+')';x.shadowBlur=14;x.lineWidth=5;x.strokeStyle='rgba('+em+',.85)';x.lineJoin='round';x.beginPath();
    if(i===0){x.moveTo(0,24);x.bezierCurveTo(-40,-4,-26,-38,0,-16);x.bezierCurveTo(26,-38,40,-4,0,24)}
    else if(i===1){x.rect(-30,-16,60,40);x.moveTo(-12,-16);x.lineTo(-12,-28);x.lineTo(12,-28);x.lineTo(12,-16);x.moveTo(-30,3);x.lineTo(30,3)}
    else if(i===2){x.rect(-9,-30,18,60);x.rect(-30,-9,60,18)}else{x.moveTo(-30,-22);x.lineTo(-10,-2);x.lineTo(2,-12);x.lineTo(28,16);x.moveTo(18,16);x.lineTo(28,16);x.lineTo(28,6);x.moveTo(-30,24);x.lineTo(30,24)}
    x.stroke();x.shadowBlur=0;x.lineWidth=1.6;x.strokeStyle='rgba(255,255,255,.8)';x.stroke();x.restore();
    return PIXI.Texture.from(c);
  }
  BR.forEach(function(b,i){var s=new PIXI.Sprite(mkRockTex(i));s.anchor.set(.5,.95);s.width=120;s.height=108;s.y=4;b.tex=s.texture;b.removeChild(b.body);b.body=s;b.addChildAt(s,1);b._ly=-118;b.glow.y=-52;b.glow.width=b.glow.height=170;b.glow.alpha=.22;b.addChildAt(wg(function(g){g.beginFill(0x000000,.45).drawEllipse(0,2,54,8).endFill()}),0)});
  var PART=[];
  function addPart(s,vx,vy,vr,g,life){PART.push({s:s,vx:vx,vy:vy,vr:vr,g:g,life:life})}
  function partsTick(d){for(var i=PART.length-1;i>=0;i--){var p=PART[i],s=p.s;p.vy+=.35*d;s.x+=p.vx*d;s.y+=p.vy*d;s.rotation+=p.vr*d;if(s.y>p.g){s.y=p.g;if(Math.abs(p.vy)>1.2){p.vy*=-.38;p.vx*=.72;p.vr*=.6}else{p.vy=0;p.vx*=.8;p.vr*=.8}}p.life-=d;if(p.life<60)s.alpha=Math.max(0,p.life/60);if(p.life<=0){s.destroy({children:true});PART.splice(i,1)}}}
  function chunkR(x,y,b){
    var tx=b.tex,cw=18+Math.random()*22,ch=cw*(.7+Math.random()*.6),sub=new PIXI.Texture(tx.baseTexture,new PIXI.Rectangle(Math.random()*(tx.width-cw),Math.random()*(tx.height-ch),cw,ch)),s=new PIXI.Sprite(sub),c=new PIXI.Container(),m=new PIXI.Graphics(),n=5+Math.floor(Math.random()*3),pts=[];
    s.anchor.set(.5);for(var k=0;k<n;k++){var a=k/n*Math.PI*2,rr=.42+Math.random()*.1;pts.push(Math.cos(a)*cw*rr,Math.sin(a)*ch*rr)}
    m.beginFill(0xffffff);m.drawPolygon(pts);m.endFill();c.addChild(s,m);s.mask=m;c.x=x;c.y=y;c.scale.set(.5);FX.addChild(c);
    addPart(c,(Math.random()-.5)*9,-3-Math.random()*8,(Math.random()-.5)*.3,b.y+2+Math.random()*6,150+Math.random()*60);
  }
  function zap(i){
    var b=BR[i],x0=GD.x+8,y0=GD.y,x1=b.x,y1=b.y-50;
    var bm=wg(function(g){g.lineStyle(7,0xffd27a,.35).moveTo(x0,y0).lineTo(x1,y1);g.lineStyle(3,0xfff1c2,.9).moveTo(x0,y0).lineTo(x1,y1);g.lineStyle(1,0xffffff,1).moveTo(x0,y0).lineTo(x1,y1)});
    bm.blendMode=PIXI.BLEND_MODES.ADD;FX.addChild(bm);
    gsap.fromTo(bm,{alpha:0},{alpha:1,duration:.12,yoyo:true,repeat:1,onComplete:function(){bm.destroy()}});
    sfx.zap();gsap.fromTo(b.body,{x:-2},{x:2,duration:.03,yoyo:true,repeat:5,onComplete:function(){b.body.x=0}});gsap.to(b.glow,{alpha:.8,duration:.2});
    gsap.delayedCall(.2,function(){blast(i)});
  }
  function blast(i){
    var b=BR[i],cy=b.y-50,col=b._c;obDone(i);sfx.blast();shake(7);
    flashS.x=b.x;flashS.y=cy;gsap.fromTo(flashS,{alpha:.7},{alpha:0,duration:.5});
    for(var k=0;k<16;k++)chunkR(b.x+(Math.random()-.5)*50,cy+(Math.random()-.5)*40,b);
    for(var q=0;q<14;q++)leaf(b.x,cy,q%2?col:0xffffff);
    puff(b.x,b.y,0x8a82a8,18,8);ring2(b.x,cy,0);
    gsap.to(b.body,{alpha:0,duration:.08});gsap.to(b.glow,{alpha:0,duration:.4});gsap.to(b.lab,{alpha:0,duration:.5});gsap.to(b.lab.scale,{x:1.4,y:1.4,duration:.5});
    var ct=new PIXI.Text('\u2726 cleared',{fontFamily:'Outfit, Segoe UI, sans-serif',fontSize:15,fill:col,fontWeight:'600',letterSpacing:2});ct.anchor.set(.5);ct.x=b.x;ct.y=cy-40;FX.addChild(ct);
    gsap.fromTo(ct.scale,{x:0,y:0},{x:1,y:1,duration:.5,ease:'back.out(2.5)'});gsap.to(ct,{alpha:0,y:ct.y-40,duration:.8,delay:1.1,onComplete:function(){ct.destroy()}});
    if(i===2)gsap.to(fogs,{_b:0,duration:1.5});
  }
  // guide: luminous insect-winged spirit with translucent veined wings
  GD.removeChildren();
  function wDraw(x){var g=x.createLinearGradient(0,0,24,0);g.addColorStop(0,'rgba(255,255,255,.6)');g.addColorStop(1,'rgba(170,215,255,.12)');x.fillStyle=g;x.beginPath();x.moveTo(0,5.5);x.bezierCurveTo(5,-.5,17,0,24,4.2);x.bezierCurveTo(18,11,6,11.5,0,5.5);x.fill();x.strokeStyle='rgba(255,255,255,.55)';x.lineWidth=.35;x.beginPath();x.moveTo(0,5.5);x.lineTo(23,4.4);x.moveTo(3,5.2);x.lineTo(14,1.2);x.moveTo(4,5.8);x.lineTo(15,9.6);x.moveTo(9,4.9);x.lineTo(19,2.2);x.moveTo(9,5.6);x.lineTo(18,8.4);x.stroke();x.strokeStyle='rgba(255,255,255,.7)';x.lineWidth=.5;x.beginPath();x.moveTo(0,5.5);x.bezierCurveTo(5,-.5,17,0,24,4.2);x.stroke()}
  function wingSet(base){var f=new PIXI.Container(),h=new PIXI.Container(),a=mkSp(24,11,wDraw,0,.5),b=mkSp(24,11,wDraw,0,.5);b.width*=.75;b.height*=.75;b.rotation=.28;a.rotation=-.22;a.alpha=b.alpha=.9;h.rotation=base;h.addChild(b,a);f.addChild(h);return f}
  var gW1=wingSet(-2.3),gW2=wingSet(-2.3);gW2.scale.x=-1;gW1.y=gW2.y=-1.5;
  var gBody=mkSp(13,7,function(x){var g=x.createRadialGradient(4,3.5,.3,5,3.5,6);g.addColorStop(0,'#fffbe8');g.addColorStop(.6,'#ffd27a');g.addColorStop(1,'#e8962a');x.fillStyle=g;x.beginPath();x.ellipse(5,3.5,5,2.7,0,0,Math.PI*2);x.fill();x.fillStyle='#fff6d0';x.beginPath();x.arc(10.2,3.5,2.1,0,Math.PI*2);x.fill();x.fillStyle='#2a1a10';x.beginPath();x.arc(11.2,3.2,.6,0,Math.PI*2);x.fill();x.strokeStyle='rgba(120,70,20,.5)';x.lineWidth=.3;x.beginPath();x.moveTo(3,1.2);x.lineTo(3,5.8);x.moveTo(5.4,1);x.lineTo(5.4,6);x.stroke()},.5,.5);
  GD.addChild(gGlow,gW2,gW1,gBody);
  // ---- Understanding real people: the guide breaks a mask and reveals the real face ----
  var MX=Math.min(XO+130,W*.93),MY=gy(MX)-120;
  var maskObj=new PIXI.Container(),faceC=new PIXI.Container();
  var maskS=mkSp(28,32,function(x){
    x.fillStyle=lgd(x,0,0,28,32,[[0,'#fff8ea'],[1,'#e8d9bf']]);x.beginPath();x.moveTo(14,1);x.bezierCurveTo(25,1,27,10,25,19);x.bezierCurveTo(22,28,17,31,14,31);x.bezierCurveTo(11,31,6,28,3,19);x.bezierCurveTo(1,10,3,1,14,1);x.fill();x.strokeStyle='#c9a24a';x.lineWidth=.8;x.stroke();
    x.fillStyle='#14102b';x.beginPath();x.ellipse(9,12,3.2,1.8,-.2,0,Math.PI*2);x.fill();x.beginPath();x.ellipse(19,12,3.2,1.8,.2,0,Math.PI*2);x.fill();
    x.strokeStyle='#b0463a';x.lineWidth=1.2;x.beginPath();x.moveTo(8.5,21);x.quadraticCurveTo(14,26,19.5,21);x.stroke();
    x.strokeStyle='#c9a24a';x.lineWidth=.7;x.beginPath();x.moveTo(5,8);x.quadraticCurveTo(9,6,12,8);x.moveTo(16,8);x.quadraticCurveTo(19,6,23,8);x.moveTo(14,14);x.lineTo(14,18);x.stroke();
    x.fillStyle='#c9a24a';x.beginPath();x.arc(14,4,1.2,0,Math.PI*2);x.fill();
  },.5,.5);
  maskS.scale.set(maskS.scale.x*2.4,maskS.scale.y*2.4);maskS._s=maskS.scale.x;
  var fS=new PIXI.Sprite(headS.texture);fS.anchor.set(.5);fS.width=20;fS.height=22;
  var feG=new PIXI.Graphics();feG.beginFill(0xffffff).drawEllipse(1.6,-.2,1.9,1.35).endFill();feG.beginFill(0x3a2a20).drawCircle(2.1,-.2,.95).endFill();feG.beginFill(0xffffff,.9).drawCircle(2.45,-.55,.28).endFill();feG.lineStyle(.8,0x7a3f35,1).moveTo(.8,5.4).quadraticCurveTo(2.2,6.8,3.6,5.4);
  faceC.addChild(spr(glowTex,34,0xffd27a,.55),fS,feG);faceC.scale.set(3.4);faceC.alpha=0;
  var mLb=new PIXI.Text('UNDERSTAND REAL PEOPLE',{fontFamily:'Outfit, Segoe UI, sans-serif',fontSize:11,fill:0xffe1a8,fontWeight:'600',letterSpacing:3});mLb.anchor.set(.5);mLb.y=64;mLb.alpha=0;
  maskObj.addChild(faceC,maskS,mLb);maskObj.x=MX;maskObj.y=MY;maskObj.alpha=0;SK2.addChild(maskObj);
  function maskIn(){maskObj.alpha=1;gsap.fromTo(maskS.scale,{x:0,y:0},{x:maskS._s,y:maskS._s,duration:.7,ease:'back.out(2)'});gsap.to(maskObj,{y:MY-6,duration:1.4,yoyo:true,repeat:-1,ease:'sine.inOut'})}
  function beamTo(x1,y1){var x0=GD.x+8,y0=GD.y,bm=wg(function(g){g.lineStyle(7,0xffd27a,.35).moveTo(x0,y0).lineTo(x1,y1);g.lineStyle(3,0xfff1c2,.9).moveTo(x0,y0).lineTo(x1,y1);g.lineStyle(1,0xffffff,1).moveTo(x0,y0).lineTo(x1,y1)});bm.blendMode=PIXI.BLEND_MODES.ADD;FX.addChild(bm);gsap.fromTo(bm,{alpha:0},{alpha:1,duration:.12,yoyo:true,repeat:1,onComplete:function(){bm.destroy()}})}
  function chunkM(){var tx=maskS.texture,cw=14+Math.random()*12,ch=cw*(.8+Math.random()*.5),sub=new PIXI.Texture(tx.baseTexture,new PIXI.Rectangle(Math.random()*(tx.width-cw),Math.random()*(tx.height-ch),cw,ch)),s=new PIXI.Sprite(sub),c=new PIXI.Container(),m=new PIXI.Graphics(),pts=[];s.anchor.set(.5);for(var k=0;k<5;k++){var a=k/5*Math.PI*2,rr=.42+Math.random()*.1;pts.push(Math.cos(a)*cw*rr,Math.sin(a)*ch*rr)}m.beginFill(0xffffff);m.drawPolygon(pts);m.endFill();c.addChild(s,m);s.mask=m;c.x=MX+(Math.random()-.5)*40;c.y=MY+(Math.random()-.5)*40;c.scale.set(.6);FX.addChild(c);addPart(c,(Math.random()-.5)*7,-2-Math.random()*6,(Math.random()-.5)*.3,gy(MX)+4+Math.random()*6,150)}
  function maskBreak(){sfx.glass();maskS.visible=false;shake(5);for(var k=0;k<10;k++)chunkM();for(var q=0;q<18;q++)leaf(MX,MY,q%2?0xffd27a:0xffffff);ring2(MX,MY,0);flashS.x=MX;flashS.y=MY;gsap.fromTo(flashS,{alpha:.8},{alpha:0,duration:.6});gsap.killTweensOf(maskObj);maskObj.y=MY;gsap.fromTo(faceC,{alpha:0},{alpha:1,duration:.7});gsap.fromTo(faceC.scale,{x:2,y:2},{x:3.4,y:3.4,duration:.9,ease:'back.out(1.8)'});gsap.to(mLb,{alpha:1,duration:.6,delay:.4})}
  function zapMask(){sfx.zap();beamTo(MX,MY);gsap.fromTo(maskS,{x:-2},{x:2,duration:.03,yoyo:true,repeat:5,onComplete:function(){maskS.x=0}});gsap.delayedCall(.25,maskBreak)}
  function maskReset(){gsap.killTweensOf(maskObj);maskObj.alpha=0;maskObj.y=MY;maskS.visible=true;maskS.x=0;faceC.alpha=0;mLb.alpha=0}
  function maskScene(L){
    var T=function(s){L.to({},{duration:s})};
    L.add(function(){G.fol=0;gsay('Now, see people as they truly are.');maskIn()}).to(G,{x:MX-70,y:MY-40,duration:1.3,ease:'power2.inOut'});T(.6);
    L.add(function(){zapMask()});T(1);
    L.add(function(){gsay('');wsay('I can see the real person now.')});T(2);
    L.add(function(){gsap.to(maskObj,{alpha:0,duration:.8});G.fol=1});T(.8);
  }
  // ---- Evolving universe: stars live and die, planets change through eras ----
  function mkPlanet2(S0,lx,pix){
    var c=document.createElement('canvas');c.width=c.height=S0;var x=c.getContext('2d'),im=x.createImageData(S0,S0),R=S0/2,ln=Math.sqrt(lx*lx+.2025+.49),Lx=lx/ln,Ly=-.45/ln,Lz=.7/ln;
    for(var j=0;j<S0;j++)for(var i=0;i<S0;i++){
      var nx=(i+.5-R)/R,ny=(j+.5-R)/R,d2=nx*nx+ny*ny;if(d2>1)continue;
      var nz=Math.sqrt(1-d2),col=pix(Math.atan2(nx,nz),Math.asin(ny)),df=Math.max(0,nx*Lx+ny*Ly+nz*Lz),k=(.06+.94*Math.pow(df,.8))*(.55+.45*nz),o=(j*S0+i)*4;
      im.data[o]=Math.min(255,col[0]*k+(col[3]||0));im.data[o+1]=Math.min(255,col[1]*k+(col[4]||0));im.data[o+2]=Math.min(255,col[2]*k+(col[5]||0));im.data[o+3]=255*Math.min(1,(1-Math.sqrt(d2))*R*.8);
    }
    x.putImageData(im,0,0);return PIXI.Texture.from(c);
  }
  var EVO={},ES=new PIXI.Container();stage.addChildAt(ES,stage.getChildIndex(starLayer)+1);
  (function(){
    var gc0=PLS[0].c,D=190,st=new PIXI.Sprite(mkPlanet(384,.9,function(lon,lat){
      var n=fb(lon*2+SEED+7,lat*5+SEED,4),b=Math.sin(lat*16+3*n+2)*.5+.5,m=fb(lon*3+4,lat*18,3),col=mix3([220,160,120],[120,60,40],b*.7+m*.3),sd=Math.pow((lon+.5)/.6,2)+Math.pow((lat+.1)/.2,2);
      if(sd<1)col=mix3(col,[230,70,40],(1-sd)*.9);return col;
    }));st.anchor.set(.5);st.width=st.height=D;st.alpha=0;gc0.addChildAt(st,2);EVO.storm=st;
    var e=PLS[1].c,D2=96;
    function ps(tex){var s=new PIXI.Sprite(tex);s.anchor.set(.5);s.width=s.height=D2;s.alpha=0;return s}
    var mo=ps(mkPlanet2(256,-.9,function(lon,lat){
      var n=fb(lon*2+SEED,lat*2+SEED*2,5),rid=1-Math.abs(2*fb(lon*3+SEED*3,lat*3,5)-1),cr=Math.max(0,(rid-.9)/.1),mg=Math.min(1,Math.max(0,fb(lon*1.4+SEED*4,lat*1.4,4)-.55)*3),col=mix3([48,30,26],[90,55,40],n);
      return[col[0],col[1],col[2],255*cr*.9+200*mg,110*cr+70*mg,20*cr+10*mg];
    }));
    var fr=ps(mkPlanet2(256,-.9,function(lon,lat){
      var n=fb(lon*2+SEED*5,lat*2,5),col=mix3([230,240,250],[150,190,228],n);
      if(fb(lon*1.6+SEED*2+5,lat*1.6+SEED,5)>.58)col=mix3(col,[105,108,120],.6);
      if(1-Math.abs(2*fb(lon*4+SEED*6,lat*4,4)-1)>.95)col=mix3(col,[90,140,190],.6);
      return[col[0],col[1],col[2],0,0,0];
    }));
    var ma=atmo(D2,'255,120,50',0),fa=atmo(D2,'190,230,255',0);
    e.addChildAt(mo,1);e.addChildAt(fr,2);e.addChildAt(ma,4);e.addChildAt(fa,5);
    EVO.mo=mo;EVO.fr=fr;EVO.ma=ma;EVO.fa=fa;EVO.mars=PLS[2].c.children[1];
  })();
  var EST=[];
  for(var hs2=0;hs2<7;hs2++){var eo={off:hs2/7,spd:.022+Math.random()*.014,prev:1,x:0,y:0,g:spr(glowTex,100,0xffffff,0),c:spr(glowTex,24,0xffffff,0),n:spr(glowTex,200,0xc084fc,0),r:spr(ringTex,60,0xffd9a0,0)};ES.addChild(eo.n,eo.r,eo.g,eo.c);EST.push(eo)}
  function smooth3(x){x=Math.max(0,Math.min(1,x));return x*x*(3-2*x)}
  function evoTick(){
    EST.forEach(function(o){
      var p=(t*o.spd+o.off)%1;if(p<o.prev){o.x=W*(.05+Math.random()*.9);o.y=H*(.04+Math.random()*.5);o.n.tint=Math.random()<.5?0xc084fc:0xff6b9a}o.prev=p;
      var sz,col,al,nz=0,rg=0,u;
      if(p<.15){u=p/.15;sz=3+u*9;col=0xbcd4ff;al=u*.9}
      else if(p<.6){sz=12;col=0xfff1d0;al=.9}
      else if(p<.85){u=(p-.6)/.25;sz=12+u*u*40;col=lerpC(0xfff1d0,0xff6a3a,u);al=.9}
      else if(p<.9){u=(p-.85)/.05;sz=52+u*220;col=0xffffff;al=1-u*.3;rg=u}
      else{u=(p-.9)/.1;sz=Math.max(4,272*(1-u)*(1-u));col=0xaad4ff;al=.8*(1-u)+.15;nz=Math.min(1,u*3)*(1-u*.8);rg=1+u}
      al*=.9+.1*Math.sin(t*5+o.off*10);
      o.g.x=o.c.x=o.n.x=o.r.x=o.x;o.g.y=o.c.y=o.n.y=o.r.y=o.y;
      o.g.width=o.g.height=sz*3.2;o.g.tint=col;o.g.alpha=al*.75;
      o.c.width=o.c.height=Math.max(3,sz*.7);o.c.alpha=al;
      o.n.width=o.n.height=140+nz*380;o.n.alpha=nz*.35;
      o.r.width=o.r.height=40+rg*420;o.r.alpha=rg>0?Math.max(0,1-rg/2)*.7:0;
    });
    var q=(t/30+.3)%1,wm=smooth3(1-Math.min(q,1-q)/.18),wf=smooth3(1-Math.abs(q-.7)/.2);
    EVO.mo.alpha=wm;EVO.fr.alpha=wf;EVO.ma.alpha=wm*.9;EVO.fa.alpha=wf*.9;EVO.storm.alpha=.5+.5*Math.sin(t*.16);EVO.mars.alpha=.3+.3*Math.sin(t*.2);
  }
  // ---- Sound: synthesized with the Web Audio API (no files), starts after the first tap/click ----
  var sfx=(function(){
    var ac=null,master,noiseBuf,guideG,windG,on=false,musicG,mIn,mTimer=null,nextT=0,mStep=0;
    function env(g,t0,a,d,pk){g.gain.cancelScheduledValues(t0);g.gain.setValueAtTime(.0001,t0);g.gain.exponentialRampToValueAtTime(pk,t0+a);g.gain.exponentialRampToValueAtTime(.0001,t0+a+d)}
    function noise(dur,f0,f1,vol,type){var s=ac.createBufferSource();s.buffer=noiseBuf;var f=ac.createBiquadFilter();f.type=type||'lowpass';var g=ac.createGain(),t0=ac.currentTime;f.frequency.setValueAtTime(f0,t0);f.frequency.exponentialRampToValueAtTime(f1,t0+dur);env(g,t0,.005,dur,vol);s.connect(f);f.connect(g);g.connect(master);s.start(t0,Math.random(),dur+.05)}
    function tone(f0,f1,dur,vol,type,delay){var o=ac.createOscillator();o.type=type||'sine';var g=ac.createGain(),t0=ac.currentTime+(delay||0);o.frequency.setValueAtTime(f0,t0);o.frequency.exponentialRampToValueAtTime(f1,t0+dur);env(g,t0,.01,dur,vol);o.connect(g);g.connect(master);o.start(t0);o.stop(t0+dur+.05)}
    function mtof(m){return 440*Math.pow(2,(m-69)/12)}
    function mNote(m,t0,dur,vol,type,out,det){var o=ac.createOscillator(),g=ac.createGain();o.type=type;o.frequency.value=mtof(m);if(det)o.detune.value=det;g.gain.setValueAtTime(.0001,t0);g.gain.exponentialRampToValueAtTime(vol,t0+(dur>1?.5:.01));g.gain.exponentialRampToValueAtTime(.0001,t0+dur);o.connect(g);g.connect(out);o.start(t0);o.stop(t0+dur+.05)}
    var CHORDS=[[60,64,67],[59,62,67],[57,60,64],[57,60,65]],BASS=[48,43,45,41],PENT=[72,74,76,79,81,84],SD=60/92/2;
    function bell(n,t0){mNote(n,t0,1.6,.05,'sine',mIn);mNote(n+12,t0,.9,.02,'sine',mIn);mNote(n+19,t0,.6,.01,'sine',mIn)}
    function sched(){
      if(!ac||!on)return;
      while(nextT<ac.currentTime+.5){
        var step=mStep%32,bar=Math.floor(step/8)%4,k=step%8,ch=CHORDS[bar],t0=nextT;
        if(k===0){ch.forEach(function(m,i){mNote(m,t0,SD*8+.4,.035,'triangle',mIn,i*4-4);mNote(m-12,t0,SD*8+.4,.02,'sine',mIn,0)});mNote(BASS[bar],t0,SD*3,.09,'sine',musicG)}
        if(k===4)mNote(BASS[bar],t0,SD*2.5,.06,'sine',musicG);
        mNote(ch[[0,1,2,1,2,1,2,1][k]]+12,t0,SD*1.8,.04,'triangle',mIn);
        if(k%2===0&&Math.random()<(mStep%16<8?.55:.8))bell(PENT[Math.floor(Math.random()*PENT.length)],t0+(Math.random()<.3?SD/2:0));
        if(k%2===1)noise(.05,9000,9000,.012,'highpass');
        nextT+=SD;mStep++;
      }
    }
    function startMusic(){if(!ac||mTimer)return;nextT=ac.currentTime+.1;mTimer=setInterval(sched,120);musicG.gain.setTargetAtTime(.3,ac.currentTime,1.5)}
    function stopMusic(){if(mTimer){clearInterval(mTimer);mTimer=null}}
    function duck(d){if(ac&&musicG&&on)musicG.gain.setTargetAtTime(d?.08:.3,ac.currentTime,.25)}
    function voiceFor(who){
      var vs=(window.speechSynthesis?speechSynthesis.getVoices():[]).filter(function(v){return /^en/i.test(v.lang)});if(!vs.length)return null;
      var fem=/aria|jenny|neerja|heera|samantha|ava|allison|susan|serena|karen|moira|tessa|libby|sonia|natasha|zira|female|google uk english female|google us english/i,mal=/guy|davis|ryan|prabhat|ravi|alex|daniel|aaron|fred|george|mark|david|james|oliver|thomas|google uk english male/i;
      function sc(v){var n=v.name,s=0;if(/natural|neural|online/i.test(n))s+=50;if(/google/i.test(n))s+=20;if(/en-IN/i.test(v.lang))s+=12;if(who){if(fem.test(n))s+=30;if(mal.test(n)&&!/female/i.test(n))s-=40}else{if(mal.test(n)&&!/female/i.test(n))s+=30;if(fem.test(n))s-=40}return s}
      vs.sort(function(a,b){return sc(b)-sc(a)});return vs[0];
    }
    function init(){
      if(ac)return;var C=window.AudioContext||window.webkitAudioContext;if(!C)return;
      ac=new C();master=ac.createGain();master.gain.value=0;master.connect(ac.destination);
      noiseBuf=ac.createBuffer(1,ac.sampleRate*2,ac.sampleRate);var d=noiseBuf.getChannelData(0);for(var i=0;i<d.length;i++)d[i]=Math.random()*2-1;
      var amb=ac.createGain();amb.gain.value=.2;amb.connect(master);
      [55,82.4,110.2].forEach(function(f,i){var o=ac.createOscillator();o.type=i?'sine':'sawtooth';o.frequency.value=f*(1+(i-1)*.002);var g=ac.createGain();g.gain.value=i?.12:.05;var lp=ac.createBiquadFilter();lp.type='lowpass';lp.frequency.value=260;o.connect(g);g.connect(lp);lp.connect(amb);o.start()});
      var lfo=ac.createOscillator();lfo.frequency.value=.07;var lg=ac.createGain();lg.gain.value=.25;lfo.connect(lg);lg.connect(amb.gain);lfo.start();
      var ns=ac.createBufferSource();ns.buffer=noiseBuf;ns.loop=true;var bp=ac.createBiquadFilter();bp.type='bandpass';bp.frequency.value=500;bp.Q.value=.6;var ng=ac.createGain();ng.gain.value=.025;ns.connect(bp);bp.connect(ng);ng.connect(amb);ns.start();
      guideG=ac.createGain();guideG.gain.value=0;guideG.connect(master);
      var go=ac.createOscillator();go.type='triangle';go.frequency.value=200;var vg=ac.createGain();vg.gain.value=.5;var tr=ac.createOscillator();tr.frequency.value=24;var trg=ac.createGain();trg.gain.value=.5;tr.connect(trg);trg.connect(vg.gain);go.connect(vg);vg.connect(guideG);go.start();tr.start();
      windG=ac.createGain();windG.gain.value=0;windG.connect(master);
      var ws=ac.createBufferSource();ws.buffer=noiseBuf;ws.loop=true;var wf=ac.createBiquadFilter();wf.type='bandpass';wf.frequency.value=900;wf.Q.value=.5;ws.connect(wf);wf.connect(windG);ws.start();
      musicG=ac.createGain();musicG.gain.value=0;musicG.connect(master);mIn=ac.createGain();mIn.connect(musicG);
      var rev=ac.createConvolver(),len=ac.sampleRate*2.2,imp=ac.createBuffer(2,len,ac.sampleRate);for(var c=0;c<2;c++){var dd=imp.getChannelData(c);for(var q=0;q<len;q++)dd[q]=(Math.random()*2-1)*Math.pow(1-q/len,2.5)}
      rev.buffer=imp;var rs=ac.createGain();rs.gain.value=.55;mIn.connect(rs);rs.connect(rev);rev.connect(musicG);
      var dl=ac.createDelay(1);dl.delayTime.value=.36;var fb=ac.createGain();fb.gain.value=.3;var dlp=ac.createBiquadFilter();dlp.type='lowpass';dlp.frequency.value=2500;mIn.connect(dl);dl.connect(dlp);dlp.connect(fb);fb.connect(dl);dlp.connect(musicG);
    }
    return{
      isOn:function(){return on},
      enable:function(){init();if(!ac)return;ac.resume();on=true;master.gain.setTargetAtTime(.9,ac.currentTime,.3);startMusic()},
      disable:function(){on=false;stopMusic();try{speechSynthesis.cancel()}catch(e){}if(ac)master.gain.setTargetAtTime(0,ac.currentTime,.1)},
      suspend:function(){if(ac)ac.suspend()},resume:function(){if(ac&&on)ac.resume()},
      step:function(w){if(!on)return;noise(.09,900,250,.12*(.5+w),'lowpass');tone(110,60,.08,.08)},
      say:function(t,who){if(!on||!('speechSynthesis' in window))return;try{speechSynthesis.cancel();var u=new SpeechSynthesisUtterance(String(t).replace(/\u2026|\.\.\./g,', ').replace(/,\s*,/g,','));var v=voiceFor(who);if(v){u.voice=v;u.lang=v.lang}u.rate=.9;u.pitch=who?1.08:1.2;u.volume=1;u.onstart=function(){duck(1)};u.onend=u.onerror=function(){duck(0)};speechSynthesis.speak(u)}catch(e){}},
      voice:function(who){return voiceFor(who)},duck:function(d){duck(d)},
      zap:function(){if(!on)return;tone(400,2200,.22,.12,'sawtooth');noise(.25,6000,800,.06,'bandpass')},
      blast:function(){if(!on)return;noise(.7,2200,120,.5,'lowpass');tone(120,38,.5,.45,'sine');tone(900,200,.2,.08,'square',.05)},
      glass:function(){if(!on)return;[1320,1760,2350,2960].forEach(function(f,i){tone(f,f*.98,.5,.07,'sine',i*.03)});noise(.3,8000,2000,.08,'highpass')},
      chime:function(){if(!on)return;[523,659,784,1047].forEach(function(f,i){tone(f,f,.5,.09,'triangle',i*.1)})},
      rise:function(){if(!on)return;tone(200,1600,1.4,.1,'sine');tone(300,2400,1.4,.06,'triangle',.1);[523,659,784].forEach(function(f){tone(f,f,1.2,.05,'sine',.9)})},
      boom:function(){if(!on)return;noise(.9,3000,200,.4,'lowpass');tone(160,45,.7,.4,'sine')},
      thud:function(){if(!on)return;tone(110,45,.25,.35,'sine');noise(.25,800,150,.2,'lowpass')},
      whoosh:function(){if(!on)return;noise(1.6,400,3500,.3,'bandpass')},
      fanfare:function(){if(!on)return;[523,659,784,1047,1319].forEach(function(f,i){tone(f,f,.7,.1,'triangle',i*.12)});noise(.6,6000,1500,.1,'highpass')},
      pop:function(){if(!on)return;tone(660,990,.12,.08,'sine')},
      level:function(g,w){if(!on||!ac)return;guideG.gain.setTargetAtTime(g*.06,ac.currentTime,.2);windG.gain.setTargetAtTime(w*.18,ac.currentTime,.3)}
    };
  })();
  (function(){
    ['step','say','zap','blast','glass','chime','rise','boom','thud','whoosh','fanfare','pop'].forEach(function(n){sfx[n]=function(){}});sfx.level=function(){};
    var btn=document.getElementById('snd'),userSet=false;
    function sync(){btn.classList.toggle('on',sfx.isOn())}
    btn.addEventListener('click',function(e){e.stopPropagation();userSet=true;if(sfx.isOn())sfx.disable();else sfx.enable();sync()});
    function first(){if(!userSet&&!sfx.isOn()){sfx.enable();sync()}sfx.resume();['pointerdown','keydown'].forEach(function(ev){removeEventListener(ev,first)})}
    ['pointerdown','keydown'].forEach(function(ev){addEventListener(ev,first)});try{sfx.enable();sync()}catch(e){}
    document.addEventListener('visibilitychange',function(){if(document.hidden)sfx.suspend();else sfx.resume()});
  })();
  // ---- Sun rays that hook the eye: dense sunburst, sweeping beams, sonar pulses ----
  var burst=new PIXI.Container();sun.addChildAt(burst,2);
  for(var bi=0;bi<44;bi++){var br=new PIXI.Sprite(beamTex);br.anchor.set(0,.5);br.width=900+Math.random()*900;br.height=6+Math.random()*16;br.rotation=bi/44*Math.PI*2+Math.random()*.1;br.tint=bi%2?0xffe3a8:0xffc27a;br._a=.1+Math.random()*.22;br._p=Math.random()*6;br.blendMode=PIXI.BLEND_MODES.ADD;burst.addChild(br)}
  var sweeps=[];for(var si=0;si<3;si++){var sw2=new PIXI.Sprite(beamTex);sw2.anchor.set(0,.5);sw2.width=1500;sw2.height=220;sw2.tint=0xffd9a0;sw2.alpha=0;sw2.blendMode=PIXI.BLEND_MODES.ADD;sw2._b=si*2.1;burst.addChild(sw2);sweeps.push(sw2)}
  var lastPulse=0;
  function sunPulse(){var s=new PIXI.Sprite(ringTex);s.anchor.set(.5);s.blendMode=PIXI.BLEND_MODES.ADD;s.width=s.height=120;s.alpha=.6;sun.addChild(s);gsap.to(s,{width:1800,height:1800,alpha:0,duration:2.4,ease:'power2.out',onComplete:function(){s.destroy()}})}
  function raysTick(d){
    var D=S.dock;burst.rotation-=.0008*d;burst.alpha=Math.min(1,(.35+.65*S.rise)*(1+D*.6));burst.scale.set(1+D*1.7);
    for(var i=0;i<44;i++){var b=burst.children[i];b.alpha=Math.min(1,b._a*(.5+.5*Math.sin(t*1.4+b._p))*(1+D))}
    sweeps.forEach(function(s){s.rotation=Math.sin(t*.35+s._b)*1.2+s._b;s.alpha=(.05+.07*D)*(.6+.4*Math.sin(t*1.1+s._b))});
    rays.scale.set(1+D*1.6);
    if(D>.95&&t-lastPulse>3.2){lastPulse=t;sunPulse()}
  }
  // ---- Angels: one per issue, each emerges from the centre of the sun and flies straight to its issue ----
  GD.removeChildren();
  function angWing(base){var f=new PIXI.Container(),h=new PIXI.Container(),s=mkSp(26,22,function(x){for(var k=0;k<5;k++){var g=x.createLinearGradient(0,0,26,0);g.addColorStop(0,'rgba(255,255,255,.95)');g.addColorStop(1,'rgba(225,232,255,.5)');x.fillStyle=g;var y0=11-k*1.8,len=26-k*2.2;x.beginPath();x.moveTo(0,11);x.bezierCurveTo(len*.3,y0-6-k,len*.7,y0-5-k,len,y0-1-k*.6);x.bezierCurveTo(len*.7,y0+3,len*.3,y0+4,0,11);x.fill();x.strokeStyle='rgba(170,182,220,.5)';x.lineWidth=.3;x.stroke()}},0,.5);h.rotation=base;h.addChild(s);f.addChild(h);return f}
  var gW1=angWing(-2.0),gW2=angWing(-2.0);gW2.scale.x=-1;
  var angRobe=mkSp(11,18,function(x){var g=x.createLinearGradient(0,0,11,0);g.addColorStop(0,'#cfd6ee');g.addColorStop(.5,'#ffffff');g.addColorStop(1,'#e8ecfa');x.fillStyle=g;x.beginPath();x.moveTo(3.5,0);x.lineTo(7.5,0);x.bezierCurveTo(9,6,11,12,10.5,18);x.lineTo(.5,18);x.bezierCurveTo(0,12,2,6,3.5,0);x.fill();x.strokeStyle='rgba(140,150,190,.5)';x.lineWidth=.3;x.beginPath();x.moveTo(5.5,3);x.lineTo(4.5,18);x.moveTo(7,4);x.lineTo(8.5,18);x.stroke();x.fillStyle='#e6b56a';x.fillRect(3.4,3.6,4.2,.8)},.5,0);angRobe.y=-3.5;
  var angHead=mkSp(6,6,function(x){var g=x.createRadialGradient(2.4,2.2,.3,3,3,3.2);g.addColorStop(0,'#fde0c4');g.addColorStop(1,'#d9a07a');x.fillStyle=g;x.beginPath();x.arc(3,3,2.7,0,Math.PI*2);x.fill();x.fillStyle='#e6c76a';x.beginPath();x.arc(3,2.4,2.9,Math.PI,0);x.fill();x.strokeStyle='#8a4a3a';x.lineWidth=.3;x.beginPath();x.arc(3.4,3.6,.9,.2,Math.PI-.2);x.stroke()},.5,.5);angHead.y=-7.5;
  var angHalo=wg(function(g){g.lineStyle(.9,0xffe9a8,1).drawEllipse(0,-13,3.8,1.2)});angHalo.blendMode=PIXI.BLEND_MODES.ADD;
  GD.addChild(gGlow,gW2,gW1,angRobe,angHead,angHalo);
  function angelTint(i){var c=ISS[i].c;gGlow.tint=c;angHalo.tint=c;angRobe.tint=lerpC(0xffffff,c,.25)}
  function sunFlash(){flashS.x=sun.x;flashS.y=sun.y;gsap.fromTo(flashS,{alpha:.9},{alpha:0,duration:.6});sunPulse()}
  function zapCol(i){var b=BR[i],x0=GD.x+8,y0=GD.y,x1=b.x,y1=b.y-50,c=b._c,bm=wg(function(g){g.lineStyle(10,c,.45).moveTo(x0,y0).lineTo(x1,y1);g.lineStyle(4,c,.85).moveTo(x0,y0).lineTo(x1,y1)});bm.blendMode=PIXI.BLEND_MODES.ADD;FX.addChild(bm);gsap.fromTo(bm,{alpha:0},{alpha:1,duration:.12,yoyo:true,repeat:1,onComplete:function(){bm.destroy()}})}
  var AM=['Angel of Love is here.','Angel of Purpose is here.','Angel of Healing is here.','Angel of Prosperity is here.'];
  function guideEnter(L){var T=function(s){L.to({},{duration:s})};L.add(function(){sunFlash();wsay('A light from the sun\u2026')}).to(KK,{head:-.25,lean:.05,duration:.8,ease:'power2.out'});T(1.2)}
  function guideFree(L,i){
    var b=BR[i],T=function(s){L.to({},{duration:s})},nx=i<3?Math.max(30,BR[i+1].x-100):XO+30,tx=b.x-52,ty=gy(b.x)-165;
    L.add(function(){angelTint(i);G.fol=0;G.dir=1;G.x=sun.x;G.y=sun.y;G.sc=0;G.vis=1;sunFlash();sfx.chime();gsay(AM[i])})
     .to(G,{sc:1,duration:.45,ease:'back.out(2)'})
     .to(G,{x:tx,y:ty,duration:1,ease:'power2.inOut'},'<.15');T(.9);
    L.add(function(){gsay(GM[i])});T(2.6);
    L.add(function(){zap(i);zapCol(i)});T(.7);
    L.add(function(){gsay('');wsay(HOPE[i])}).to(KK,{lean:0,head:-.12,uF:-.2,fF:-.3,uB:.05,fB:-.1,crouch:0,duration:.7,ease:'power2.out'});T(1.6);
    L.to(KK,{x:nx,duration:i<3?2:2.2,ease:'power1.inOut'});
    if(i<3)L.to(G,{x:function(){return sun.x},y:function(){return sun.y},sc:.15,duration:1,ease:'power2.in'},'<').add(function(){G.vis=0;G.sc=1;sunPulse()},'<1');
    if(i<3)L.to(KK,{lean:.12,head:.22,uF:.05,fF:.1,duration:.6,ease:'power2.out'});
  }
  // ---- AI voice for the chat reply (browser speech synthesis, no files) ----
  (function(){
    var btn=document.getElementById('vnBtn'),wf=document.getElementById('vnWf'),tm=document.getElementById('vnT');
    if(!btn)return;if(!('speechSynthesis' in window)){btn.style.display='none';return}
    var voices=[],bars=[],TXT='Hello! I am Anamika\u2019s AI assistant. Share your birth date and time, and I will prepare your first reading.';
    for(var k=0;k<26;k++){var b=document.createElement('i');b.style.height=(25+Math.abs(Math.sin(k*1.7)*60)+Math.random()*15)+'%';wf.appendChild(b);bars.push(b)}
    tm.textContent='0:'+('0'+Math.round(TXT.split(' ').length*.38)).slice(-2);
    function load(){voices=speechSynthesis.getVoices()}load();speechSynthesis.onvoiceschanged=load;
    function pick(){var pref=/female|samantha|zira|aria|jenny|natalie|serena|karen|moira|tessa|google uk english female|google us english/i,en=voices.filter(function(v){return /^en/i.test(v.lang)});return en.filter(function(v){return pref.test(v.name)})[0]||en[0]||voices[0]}
    function setProg(p){var n=Math.round(p*bars.length);bars.forEach(function(x,i){x.classList.toggle('on',i<n)})}
    function stop(){speechSynthesis.cancel();btn.classList.remove('sp');wf.classList.remove('sp');setProg(0)}
    window.speakReply=function(){
      stop();var u=new SpeechSynthesisUtterance(TXT),v=sfx.voice(1)||pick();if(v){u.voice=v;u.lang=v.lang}u.rate=.9;u.pitch=1.08;
      u.onstart=function(){btn.classList.add('sp');wf.classList.add('sp');sfx.duck(1)};
      u.onboundary=function(e){setProg(e.charIndex/TXT.length)};
      u.onend=u.onerror=function(){sfx.duck(0);btn.classList.remove('sp');wf.classList.remove('sp');setProg(1);setTimeout(function(){setProg(0)},800)};
      speechSynthesis.speak(u);
    };
    btn.addEventListener('click',function(e){e.stopPropagation();if(speechSynthesis.speaking)stop();else window.speakReply()});
    addEventListener('pagehide',function(){speechSynthesis.cancel()});
  })();
  BB.visible=false;GBc.visible=false;
  // ---- Mountain climb: sloped terrain, a young climber with a backpack, obstacles that rush to the front ----
  function gy(x){var u=Math.max(0,Math.min(1,(x-W*.04)/(W*.88))),s=u*u*(3-2*u);return H*.9-H*.46*(.25*u+.75*s)+Math.sin(x*.02)*3+Math.sin(x*.007)*5}
  function drawHills(){
    var w=app.screen.width,h=app.screen.height,x;hills.clear();
    hills.beginFill(0x1b2150,.85);hills.moveTo(0,h);hills.lineTo(0,h*.62);
    for(x=0;x<=w;x+=16)hills.lineTo(x,h*.6-Math.abs(Math.sin(x*.0045+1))*h*.12-Math.sin(x*.013)*h*.025);
    hills.lineTo(w,h);hills.endFill();
    var px=w*.86,py=h*.28;
    hills.beginFill(0x252c68);hills.moveTo(w*.42,h);hills.lineTo(w*.6,h*.56);hills.lineTo(px-w*.07,h*.4);hills.lineTo(px,py);hills.lineTo(px+w*.07,h*.42);hills.lineTo(w*1.05,h*.6);hills.lineTo(w*1.05,h);hills.endFill();
    hills.beginFill(0x1d2354,.9);hills.moveTo(px,py);hills.lineTo(px+w*.07,h*.42);hills.lineTo(w*1.05,h*.6);hills.lineTo(w*1.05,h);hills.lineTo(px+w*.02,h);hills.closePath();hills.endFill();
    hills.beginFill(0xe9efff,.92);hills.moveTo(px,py);hills.lineTo(px-w*.034,h*.36);hills.lineTo(px-w*.016,h*.348);hills.lineTo(px-w*.002,h*.372);hills.lineTo(px+w*.012,h*.352);hills.lineTo(px+w*.036,h*.372);hills.lineTo(px+w*.028,h*.345);hills.closePath();hills.endFill();
    hills.beginFill(0x131838,.95);hills.moveTo(0,h);hills.lineTo(0,h*.74);
    for(x=0;x<=w*.8;x+=14)hills.lineTo(x,h*.72-Math.abs(Math.sin(x*.006+2))*h*.1-Math.sin(x*.02)*h*.012);
    hills.lineTo(w*.8,h);hills.endFill();
    hills.beginFill(0x0a0820);hills.moveTo(0,h);hills.lineTo(0,gy(0));
    for(x=0;x<=w;x+=12)hills.lineTo(x,gy(x));
    hills.lineTo(w,h);hills.endFill();
    hills.lineStyle(2,0x4b4f94,.7);hills.moveTo(0,gy(0));for(x=0;x<=w;x+=12)hills.lineTo(x,gy(x));hills.lineStyle(0);
  }
  HD.scale.set(1.14);
  var packG=wg(function(g){g.beginFill(0xc8402f).drawRoundedRect(-10,-19,9,16,2).endFill();g.beginFill(0xa73222).drawRoundedRect(-9.2,-9,7.4,6,1.5).endFill();g.beginFill(0xe8b56a).drawRoundedRect(-10.4,-21,10,3,1.2).endFill();g.lineStyle(.8,0x5a1a12,.7).moveTo(-5,-19).lineTo(-5,-8)});
  TOR.addChildAt(packG,TOR.getChildIndex(cloak));
  BR.forEach(function(b){b._x0=b.x;b._y0=b.y;b.alpha=0});
  function arrive(i){var b=BR[i],vx=W*.72,vy=H*.58;b.x=vx;b.y=vy;b.scale.set(.08);b.alpha=0;gsap.to(b,{alpha:1,duration:.3});gsap.to(b,{x:b._x0,y:b._y0,duration:.9,ease:'power2.in'});gsap.to(b.scale,{x:OBS,y:OBS,duration:.9,ease:'power2.in',onComplete:function(){shake(5);puff(b._x0,b._y0,0x8a82a8,22,8);sfx.thud()}})}
  function schedArrive(i,d){gsap.delayedCall(d,function(){arrive(i)})}
  function arriveAll(d0){document.getElementById('obl').style.opacity=1;for(var k=0;k<BR.length;k++)schedArrive(k,d0+k*.55)}
  function obDone(i){var e=document.querySelectorAll('.ob-ic')[i];if(e)e.classList.add('done')}
  function obReset(){document.querySelectorAll('.ob-ic').forEach(function(e){e.classList.remove('done')});document.getElementById('obl').style.opacity=0}
  // ---- Realistic mountains: noise-shaded, lit ridges with snow, haze layers, mist, pines and scree ----
  function mkMountains(){
    var MH=450,MW=Math.max(300,Math.min(900,Math.round(W/H*450))),c=document.createElement('canvas');c.width=MW;c.height=MH;var c2d=c.getContext('2d'),im=c2d.createImageData(MW,MH),sd=SEED*3;
    var LY=[
      {col:[84,98,168],hz:.5,snow:0,ridge:function(u){return MH*.58-Math.abs(fb(u*3.2+sd,1.5,4)-.35)*MH*.55}},
      {col:[58,68,138],hz:.3,snow:1,ridge:function(u){return Math.min(MH*(.28+Math.abs(u-.86)*.62),MH*(.42+Math.abs(u-.62)*.5))+(fb(u*14+sd,2,4)-.5)*MH*.07+(vn(u*60+sd,7)-.5)*MH*.012}},
      {col:[32,40,96],hz:.14,snow:0,ridge:function(u){return MH*.72-Math.abs(fb(u*5+sd+9,3,4)-.4)*MH*.32}}
    ];
    LY.forEach(function(Ly,li){
      var ry=new Float32Array(MW),xx,y;for(xx=0;xx<MW;xx++)ry[xx]=Ly.ridge(xx/MW);
      for(xx=0;xx<MW;xx++){
        var top=Math.max(0,Math.floor(ry[xx])),slope=(ry[Math.min(MW-1,xx+3)]-ry[Math.max(0,xx-3)])/6;
        for(y=top;y<MH;y++){
          var d=y-ry[xx],n=fb(xx*.025+sd+li*7,y*.04,4),n2=vn(xx*.3,y*.3),lit=.62+Math.max(-.35,Math.min(.5,-slope*.9)),sh=lit*(.8+.5*n)*(.92+.16*n2)+Math.sin((y+n*30)*.35)*.04;
          sh*=1-Math.min(.4,d/MH*.7);
          var r=Ly.col[0]*sh,g=Ly.col[1]*sh,b=Ly.col[2]*sh;
          if(Ly.snow){var sl=MH*.5+(n-.5)*MH*.12,sv=Math.max(0,Math.min(1,(sl-y)/(MH*.05)+.2));if(sv>0){var sw=.55+lit*.6;r+=(240*sw-r)*sv;g+=(246*sw-g)*sv;b+=(255*sw-b)*sv}}
          var hz=Ly.hz;r=r*(1-hz)+120*hz;g=g*(1-hz)+130*hz;b=b*(1-hz)+190*hz;
          var o=(y*MW+xx)*4;im.data[o]=Math.min(255,r);im.data[o+1]=Math.min(255,g);im.data[o+2]=Math.min(255,b);im.data[o+3]=255;
        }
      }
    });
    c2d.putImageData(im,0,0);return PIXI.Texture.from(c);
  }
  var mtnSprite=new PIXI.Sprite(mkMountains()),MIST=new PIXI.Container(),MS=[];
  stage.addChildAt(mtnSprite,stage.getChildIndex(hills));stage.addChildAt(MIST,stage.getChildIndex(hills));
  for(var mi=0;mi<4;mi++){var ms=new PIXI.Sprite(glowTex);ms.anchor.set(.5);ms.tint=0xaab4e0;ms.alpha=.22;MIST.addChild(ms);MS.push(ms);gsap.to(ms,{x:'+='+(80+mi*20),duration:14+mi*3,yoyo:true,repeat:-1,ease:'sine.inOut'})}
  function drawHills(){
    var w=app.screen.width,h=app.screen.height,x,k;
    if(mtnSprite){mtnSprite.width=w;mtnSprite.height=h;MS.forEach(function(m,i){m.x=w*(.2+i*.22);m.y=h*(.52+i*.07);m.width=w*.7;m.height=h*.16})}
    hills.clear();
    hills.beginFill(0x0a0820);hills.moveTo(0,h);hills.lineTo(0,gy(0));for(x=0;x<=w;x+=12)hills.lineTo(x,gy(x));hills.lineTo(w,h);hills.endFill();
    hills.lineStyle(2.5,0x6a6fb0,.55);hills.moveTo(0,gy(0));for(x=0;x<=w;x+=12)hills.lineTo(x,gy(x));hills.lineStyle(0);
    for(k=0;k<60;k++){var rx=(k*97.3%1000)/1000*w,ry2=gy(rx)+6+((k*53)%40),rs=2+((k*37)%7);hills.beginFill(0x1b2048,.9);hills.drawPolygon([rx-rs,ry2,rx-rs*.4,ry2-rs*.8,rx+rs*.7,ry2-rs*.6,rx+rs,ry2]);hills.endFill()}
    for(k=0;k<18;k++){var tx=w*(.01+k*.021);if(tx>w*.4)break;var ts=(1-tx/w*1.3)*26+8,ty=gy(tx)+4;hills.beginFill(0x070d1c);hills.drawRect(tx-1.2,ty-ts*.2,2.4,ts*.2);for(var j=0;j<3;j++){var wy=ty-ts*.2-j*ts*.26,ww=ts*(.38-j*.08);hills.drawPolygon([tx-ww,wy,tx,wy-ts*.42,tx+ww,wy])}hills.endFill()}
  }
  drawHills();
  // ---- Goal flag on the summit + mountaineer gear (beanie, trekking poles, bedroll) ----
  glStar.visible=false;glRing.visible=false;glS.alpha=.5;
  var flagG=new PIXI.Graphics();GL.addChildAt(flagG,2);
  function drawFlag(){
    var g=flagG,N=12,i,u,x,w,top=[],bot=[],sp=[],cy0=-63+Math.sin(t*5+2.5)*2.2;g.clear();
    g.lineStyle(3,0xd8d2c0,1).moveTo(0,0).lineTo(0,-78);g.lineStyle(0).beginFill(0xe6b56a).drawCircle(0,-80,3.4).endFill();
    for(i=0;i<=N;i++){u=i/N;x=2+u*54;w=Math.sin(t*5+u*5)*4*u;top.push(x,-76+w);bot.unshift(x,-50+w*1.1)}
    g.lineStyle(1,0xb8601a,.8).beginFill(0xff9a3c).drawPolygon(top.concat(bot)).endFill();g.lineStyle(0);
    for(i=0;i<10;i++){var a=-Math.PI/2+i*Math.PI/5,r=i%2?3.2:7;sp.push(28+Math.cos(a)*r,cy0+Math.sin(a)*r)}
    g.beginFill(0xfff4d6).drawPolygon(sp).endFill();
  }
  var beanie=wg(function(g){g.beginFill(0xf08a3a).moveTo(-5.4,-8.6).bezierCurveTo(-6,-16,5.5,-18.5,5.8,-9.5).lineTo(5.6,-8).lineTo(-5.4,-7.6).closePath().endFill();g.beginFill(0xc96a22).drawRoundedRect(-5.7,-9.6,11.6,2.4,1).endFill();g.beginFill(0xfff1c8).drawCircle(.4,-18,1.7).endFill()});
  HD.addChild(beanie);
  TOR.addChildAt(wg(function(g){g.beginFill(0x3f8f6a).drawRoundedRect(-11.5,-24.5,11,3.6,1.8).endFill();g.lineStyle(.7,0x1d4a36).moveTo(-8,-24.5).lineTo(-8,-20.9).moveTo(-4.5,-24.5).lineTo(-4.5,-20.9)}),TOR.getChildIndex(cloak));
  function mkPole(c){return wg(function(g){g.lineStyle(1.6,c).moveTo(0,10).lineTo(2,44);g.lineStyle(2.6,0x2b3150).moveTo(0,7).lineTo(0,14);g.lineStyle(.9,c).drawCircle(1.8,40,2.3)})}
  var pF=mkPole(0xdfe4f5),pB=mkPole(0xb8bfd8);armF.fo.addChild(pF);armB.fo.addChild(pB);
  // ---- Character polish: re-painted jacket, trousers, boots, gloves, face; scarf, backpack, expressive brows ----
  var T8b=[[0,'#5f5f66'],[.45,'#d6d6dc'],[.8,'#f4f4f8'],[1,'#ffffff']];
  cloak.texture=cv(15,24,function(x){
    x.fillStyle=lgd(x,0,0,15,0,T8b);x.beginPath();x.moveTo(3.2,0);x.quadraticCurveTo(7.5,-1.2,11.8,0);x.lineTo(14.2,3);x.lineTo(13.6,23);x.lineTo(1.6,23);x.lineTo(.9,3);x.closePath();x.fill();
    x.fillStyle=lgd(x,0,14,0,23,[[0,'rgba(0,0,0,0)'],[1,'rgba(0,0,0,.28)']]);x.fill();
    x.fillStyle='rgba(255,255,255,.18)';x.beginPath();x.moveTo(3.2,0);x.quadraticCurveTo(7.5,-1.2,11.8,0);x.lineTo(13.8,2.8);x.lineTo(1.2,2.8);x.closePath();x.fill();
    x.strokeStyle='rgba(0,0,0,.28)';x.lineWidth=.35;x.beginPath();x.moveTo(1,6);x.lineTo(14,6);x.stroke();
    x.strokeStyle='rgba(0,0,0,.14)';x.lineWidth=.3;for(var y=9.5;y<22;y+=3.4){x.beginPath();x.moveTo(1.2,y);x.quadraticCurveTo(7.5,y+.9,13.5,y);x.stroke()}
    x.strokeStyle='rgba(30,30,40,.7)';x.lineWidth=.6;x.beginPath();x.moveTo(11.6,1.5);x.lineTo(12.7,23);x.stroke();
    x.fillStyle='rgba(255,255,255,.55)';x.fillRect(1.2,12.6,12.3,.9);
    x.strokeStyle='rgba(0,0,0,.3)';x.lineWidth=.35;x.strokeRect(8,8,3.6,3);
    x.fillStyle='rgba(255,255,255,.35)';x.beginPath();x.moveTo(3.2,0);x.quadraticCurveTo(7.5,-1.2,11.8,0);x.lineTo(11.2,1.6);x.quadraticCurveTo(7.5,.6,3.8,1.6);x.closePath();x.fill();
    x.fillStyle='rgba(0,0,0,.25)';x.fillRect(1.6,21.6,12,1.4);
    x.strokeStyle='rgba(255,236,200,.8)';x.lineWidth=.5;x.beginPath();x.moveTo(14.1,3);x.lineTo(13.5,22.6);x.stroke();
    x.strokeStyle='rgba(0,0,0,.35)';x.lineWidth=.4;x.beginPath();x.moveTo(3.2,0);x.quadraticCurveTo(7.5,-1.2,11.8,0);x.lineTo(14.2,3);x.lineTo(13.6,23);x.lineTo(1.6,23);x.lineTo(.9,3);x.closePath();x.stroke();
  }).texture;
  var thT=cv(8,15.5,function(x){x.fillStyle=lgd(x,0,0,8,0,[[0,'#52525a'],[.5,'#c9c9d0'],[1,'#f0f0f4']]);x.beginPath();x.moveTo(.6,0);x.lineTo(7.4,0);x.lineTo(6.4,15.5);x.lineTo(1.6,15.5);x.closePath();x.fill();x.fillStyle=lgd(x,0,0,0,5,[[0,'rgba(0,0,0,.3)'],[1,'rgba(0,0,0,0)']]);x.fill();x.strokeStyle='rgba(0,0,0,.22)';x.lineWidth=.3;x.beginPath();x.moveTo(2.2,5);x.lineTo(5.8,5.6);x.lineTo(5.6,9.4);x.lineTo(2.4,9);x.closePath();x.stroke();x.beginPath();x.moveTo(1.9,8);x.quadraticCurveTo(4,10,5.9,10.4);x.stroke();x.strokeStyle='rgba(255,236,200,.6)';x.lineWidth=.4;x.beginPath();x.moveTo(7.3,.5);x.lineTo(6.3,15);x.stroke();x.strokeStyle='rgba(0,0,0,.35)';x.lineWidth=.35;x.beginPath();x.moveTo(.6,0);x.lineTo(7.4,0);x.lineTo(6.4,15.5);x.lineTo(1.6,15.5);x.closePath();x.stroke()}).texture;
  var shT=cv(6.6,13.5,function(x){x.fillStyle=lgd(x,0,0,6.6,0,[[0,'#52525a'],[.5,'#c4c4cc'],[1,'#ececf0']]);x.beginPath();x.moveTo(.8,0);x.lineTo(5.8,0);x.lineTo(5,13.5);x.lineTo(1.6,13.5);x.closePath();x.fill();x.fillStyle='rgba(0,0,0,.2)';x.fillRect(1,.2,4.8,3.2);x.fillStyle='rgba(0,0,0,.32)';x.fillRect(1.5,10.6,3.5,2.9);x.strokeStyle='rgba(255,236,200,.6)';x.lineWidth=.4;x.beginPath();x.moveTo(5.7,.5);x.lineTo(4.9,13);x.stroke();x.strokeStyle='rgba(0,0,0,.35)';x.lineWidth=.35;x.beginPath();x.moveTo(.8,0);x.lineTo(5.8,0);x.lineTo(5,13.5);x.lineTo(1.6,13.5);x.closePath();x.stroke()}).texture;
  var bootT=cv(13,6,function(x){x.fillStyle=lgd(x,0,0,0,6,[[0,'#6b5a4c'],[.5,'#3b2f27'],[1,'#17120f']]);x.beginPath();x.moveTo(1.8,0);x.lineTo(6.2,0);x.bezierCurveTo(8.6,.8,12.4,1.8,12.9,3.8);x.lineTo(12.9,4.9);x.lineTo(1.3,4.9);x.lineTo(1.3,.9);x.closePath();x.fill();x.fillStyle='rgba(255,255,255,.1)';x.beginPath();x.moveTo(8.4,1.5);x.quadraticCurveTo(12,2.2,12.9,3.8);x.lineTo(12.9,4.9);x.lineTo(8.4,4.9);x.closePath();x.fill();x.strokeStyle='#f08a3a';x.lineWidth=.35;for(var i=0;i<4;i++){x.beginPath();x.moveTo(3.1+i*1.15,.6+i*.15);x.lineTo(4.1+i*1.15,1.1+i*.15);x.stroke()}x.fillStyle='#e8e0d2';x.fillRect(1.2,4.6,11.9,1.4);x.fillStyle='#2a2420';for(var j=0;j<9;j++)x.fillRect(1.6+j*1.3,5.5,.7,.5);x.fillStyle='rgba(255,255,255,.28)';x.fillRect(2.6,.8,3.4,.6)}).texture;
  [legF,legB].forEach(function(l){l.ps[0].texture=thT;l.ps[1].texture=shT;l.shoe.texture=bootT});
  var upT=cv(5.6,11.5,function(x){x.fillStyle=lgd(x,0,0,5.6,0,T8b);x.beginPath();x.moveTo(.5,0);x.lineTo(5.1,0);x.lineTo(4.6,11.5);x.lineTo(1,11.5);x.closePath();x.fill();x.fillStyle=lgd(x,0,7,0,11.5,[[0,'rgba(0,0,0,0)'],[1,'rgba(0,0,0,.25)']]);x.fill();x.strokeStyle='rgba(0,0,0,.18)';x.lineWidth=.3;x.beginPath();x.moveTo(1,3.6);x.quadraticCurveTo(2.8,4.4,4.9,3.6);x.moveTo(.9,7.4);x.quadraticCurveTo(2.8,8.2,4.7,7.4);x.stroke();x.strokeStyle='rgba(255,236,200,.7)';x.lineWidth=.4;x.beginPath();x.moveTo(5,.5);x.lineTo(4.5,11);x.stroke();x.strokeStyle='rgba(0,0,0,.35)';x.lineWidth=.35;x.beginPath();x.moveTo(.5,0);x.lineTo(5.1,0);x.lineTo(4.6,11.5);x.lineTo(1,11.5);x.closePath();x.stroke()}).texture;
  var foT=cv(4.8,11,function(x){x.fillStyle=lgd(x,0,0,4.8,0,T8b);x.beginPath();x.moveTo(.8,0);x.lineTo(4,0);x.lineTo(3.8,11);x.lineTo(1,11);x.closePath();x.fill();x.fillStyle='rgba(0,0,0,.3)';x.fillRect(.9,8.8,2.9,2.2);x.fillStyle='rgba(255,255,255,.4)';x.fillRect(.9,8.7,2.9,.4);x.strokeStyle='rgba(255,236,200,.7)';x.lineWidth=.35;x.beginPath();x.moveTo(3.9,.5);x.lineTo(3.7,10.6);x.stroke();x.strokeStyle='rgba(0,0,0,.35)';x.lineWidth=.3;x.beginPath();x.moveTo(.8,0);x.lineTo(4,0);x.lineTo(3.8,11);x.lineTo(1,11);x.closePath();x.stroke()}).texture;
  var glvT=cv(4.6,5.8,function(x){x.fillStyle=lgd(x,0,0,4.6,0,[[0,'#2b2e38'],[1,'#666c80']]);x.beginPath();x.moveTo(.8,0);x.lineTo(3.8,0);x.lineTo(4.2,3.4);x.quadraticCurveTo(3.8,5.8,2.3,5.8);x.quadraticCurveTo(.6,5.6,.6,3.4);x.closePath();x.fill();x.fillStyle='#f08a3a';x.fillRect(.8,0,3,1.1);x.strokeStyle='rgba(255,255,255,.25)';x.lineWidth=.3;x.beginPath();x.moveTo(1.6,3);x.lineTo(1.6,5.3);x.moveTo(2.6,3);x.lineTo(2.7,5.5);x.moveTo(3.5,2.8);x.lineTo(3.7,4.6);x.stroke()}).texture;
  [armF,armB].forEach(function(a){a.ps[0].texture=upT;a.ps[1].texture=foT;a.fo.children[1].texture=glvT});
  headS.texture=cv(20,22,function(x){
    var g=x.createRadialGradient(11,9,.5,9.5,12,8.5);g.addColorStop(0,'#f6d0b0');g.addColorStop(.55,'#dca37c');g.addColorStop(1,'#a8704f');
    x.fillStyle=g;x.beginPath();x.ellipse(9,12,5,6,0,0,Math.PI*2);x.fill();
    x.fillStyle='rgba(130,75,48,.22)';x.beginPath();x.ellipse(9.6,16.6,3.5,1.9,0,0,Math.PI*2);x.fill();
    x.fillStyle='rgba(255,120,110,.22)';x.beginPath();x.ellipse(11.6,14.2,1.7,1.1,0,0,Math.PI*2);x.fill();
    x.fillStyle='#d9a07c';x.beginPath();x.moveTo(13.7,11.2);x.quadraticCurveTo(15.8,13.6,13.6,14.4);x.lineTo(13,13.4);x.closePath();x.fill();
    x.fillStyle='rgba(255,255,255,.35)';x.beginPath();x.ellipse(13.9,12.6,.35,.8,0,0,Math.PI*2);x.fill();
    x.fillStyle='#c98b66';x.beginPath();x.ellipse(4.4,12.8,1.1,1.8,0,0,Math.PI*2);x.fill();x.strokeStyle='rgba(120,60,35,.5)';x.lineWidth=.3;x.beginPath();x.arc(4.5,12.8,.6,Math.PI*.6,Math.PI*1.7);x.stroke();
    var hg=x.createLinearGradient(3,6,12,12);hg.addColorStop(0,'#5b4330');hg.addColorStop(1,'#2a1d14');
    x.fillStyle=hg;x.beginPath();x.moveTo(3.6,9);x.bezierCurveTo(3.2,13,3.4,15,4.6,15.6);x.lineTo(5.4,13);x.lineTo(5.2,9.4);x.closePath();x.fill();
    x.beginPath();x.moveTo(5,7.6);x.bezierCurveTo(7,8.4,10,8.2,13.4,8.8);x.lineTo(13.6,10);x.bezierCurveTo(12,9.2,9,9.4,6.4,10.4);x.closePath();x.fill();
    x.strokeStyle='rgba(255,255,255,.18)';x.lineWidth=.25;x.beginPath();x.moveTo(6,8.8);x.quadraticCurveTo(9,8.4,12.6,9.2);x.stroke();
    x.strokeStyle='rgba(90,50,30,.35)';x.lineWidth=.35;x.beginPath();x.ellipse(9,12,5,6,0,0,Math.PI*2);x.stroke();
  }).texture;
  eyeG.clear();eyeG.beginFill(0xffffff).drawEllipse(0,0,2.1,1.6).endFill();eyeG.beginFill(0x6b4a2f).drawCircle(.4,0,1.15).endFill();eyeG.beginFill(0x1a1008).drawCircle(.45,0,.58).endFill();eyeG.beginFill(0xffffff,.95).drawCircle(.85,-.5,.38).endFill();eyeG.beginFill(0xffffff,.6).drawCircle(-.05,.45,.2).endFill();eyeG.lineStyle(.5,0x2a1a10,.9).arc(0,0,2.1,Math.PI*1.05,Math.PI*1.95);
  var browG=new PIXI.Graphics();HD.addChildAt(browG,HD.getChildIndex(beanie));
  function setMood(m){if(m===mood)return;mood=m;mouthG.clear().lineStyle(.8,0x7a3f35,1).moveTo(-1.5,0).quadraticCurveTo(0,m*1.2,1.5,0);browG.clear().lineStyle(.9,0x3a2618,1);if(m<0)browG.moveTo(1,-9.9).lineTo(4.2,-9.1);else if(m>0)browG.moveTo(1,-9.5).quadraticCurveTo(2.6,-10.4,4.2,-9.5);else browG.moveTo(1,-9).lineTo(4.2,-9.3)}
  var hairF=wg(function(g){g.beginFill(0x3a2618).moveTo(-5.2,-9.4).lineTo(-3.4,-8).lineTo(-4.6,-6.2).closePath().endFill();g.beginFill(0x3a2618).moveTo(3.4,-8.6).lineTo(5.2,-8.2).lineTo(4.2,-7).closePath().endFill()});HD.addChildAt(hairF,HD.getChildIndex(beanie));
  var scarfT=wg(function(g){g.beginFill(0xf08a3a).moveTo(0,0).lineTo(-7,2.5).lineTo(-6.6,5).lineTo(-3.4,3.4).lineTo(0,2.4).closePath().endFill();g.lineStyle(.5,0xc96a22,.9).moveTo(-1.6,.8).lineTo(-1.2,2.6).moveTo(-3.4,1.4).lineTo(-3,3.1)});
  var scarfC=new PIXI.Container();scarfC.y=-21.2;scarfC.x=-2.4;scarfC.addChild(scarfT);
  var scarfB=wg(function(g){g.beginFill(0xf08a3a).drawRoundedRect(-3.6,-23.2,7.2,2.8,1.3).endFill();g.lineStyle(.5,0xc96a22,.9).moveTo(-1.4,-23).lineTo(-1.4,-20.6).moveTo(1.2,-23).lineTo(1.2,-20.6);g.lineStyle(.5,0xffd9a6,.7).moveTo(-3.2,-22.8).lineTo(3.2,-22.8)});
  TOR.addChildAt(scarfC,TOR.getChildIndex(HD));TOR.addChildAt(scarfB,TOR.getChildIndex(HD));
  var packC=new PIXI.Container();packC.x=-1.5;packC.y=-19;
  var packS=mkSp(11,19,function(x){x.fillStyle=lgd(x,0,0,11,0,[[0,'#8e2a1c'],[.5,'#d9503a'],[1,'#f07a5a']]);x.beginPath();x.moveTo(1.6,0);x.lineTo(9.4,0);x.quadraticCurveTo(11,2,10.6,16);x.quadraticCurveTo(10.2,19,8,19);x.lineTo(3,19);x.quadraticCurveTo(.4,19,.4,16);x.quadraticCurveTo(0,2,1.6,0);x.closePath();x.fill();x.fillStyle='rgba(0,0,0,.28)';x.beginPath();x.moveTo(1.4,0);x.lineTo(9.6,0);x.lineTo(9.9,4.4);x.lineTo(1.1,4.4);x.closePath();x.fill();x.fillStyle='rgba(0,0,0,.2)';x.fillRect(2,9,7,7);x.strokeStyle='rgba(255,255,255,.35)';x.lineWidth=.35;x.strokeRect(2,9,7,7);x.beginPath();x.moveTo(2,11.4);x.lineTo(9,11.4);x.stroke();x.fillStyle='#4aa3d8';x.beginPath();x.ellipse(.6,13,1.2,2.6,0,0,Math.PI*2);x.fill();x.strokeStyle='rgba(20,10,10,.6)';x.lineWidth=.6;x.beginPath();x.moveTo(3.2,4.4);x.lineTo(3.2,9);x.moveTo(7.8,4.4);x.lineTo(7.8,9);x.stroke();x.fillStyle='#d8dce8';x.fillRect(2.8,6,.9,.9);x.fillRect(7.4,6,.9,.9);x.strokeStyle='rgba(0,0,0,.35)';x.lineWidth=.35;x.stroke()},1,0);
  packS.x=1.5;packS.y=-2;packS.width=11;packC.addChild(packS);
  packG.visible=false;TOR.addChildAt(packC,TOR.getChildIndex(cloak));
  function charPolish(){
    var sw=Math.sin(KK.ph)*KK.walk;
    packC.rotation=-.03-sw*.04+Math.sin(KK.ph*2+.8)*.03*KK.walk;
    beanie.rotation=Math.sin(KK.ph*2+1)*.04*KK.walk;
    scarfC.rotation=.25+Math.abs(Math.sin(KK.ph))*.15*KK.walk+Math.sin(t*5)*.1*KK.walk+Math.min(1.2,KK.pitch*.6)+KK.walk*.15;
    eyeG.x=2.6+Math.max(-.5,Math.min(.6,(GD.x-KK.x)*.0012))*.6;
  }
  // ---- Wavy rolling hills with gradient slope, grass tufts, pines; scales for phones ----
  var OBS=Math.max(.5,Math.min(1,W/1100));
  function gy(x){var u=Math.max(0,Math.min(1,(x-W*.04)/(W*.88))),s=u*u*(3-2*u),R=Math.min(H*.46,W*.88*.55),U=Math.min(H,W*.62);return H*.9-R*(.25*u+.75*s)+Math.sin(x/W*13+1)*U*.02+Math.sin(x/W*29+2)*U*.009+Math.sin(x/W*5)*U*.015}
  BR.forEach(function(b){b.lab.visible=W>=600});
  var slopeC=new PIXI.Container(),slopeMask=new PIXI.Graphics(),deco=new PIXI.Graphics();
  var slopeSpr=(function(){var c=document.createElement('canvas');c.width=4;c.height=256;var x=c.getContext('2d'),g=x.createLinearGradient(0,0,0,256);g.addColorStop(0,'#3a5684');g.addColorStop(.35,'#1f3160');g.addColorStop(1,'#080b22');x.fillStyle=g;x.fillRect(0,0,4,256);return new PIXI.Sprite(PIXI.Texture.from(c))})();
  slopeC.addChild(slopeSpr,slopeMask);slopeSpr.mask=slopeMask;
  stage.addChildAt(slopeC,stage.getChildIndex(hills)+1);stage.addChildAt(deco,stage.getChildIndex(slopeC)+1);
  function drawHills(){
    if(!deco)return;
    var w=app.screen.width,h=app.screen.height,x,k,ms=Math.max(.6,Math.min(1.2,w/1000)),U=Math.min(h,w*.62);
    if(mtnSprite){mtnSprite.width=w;mtnSprite.height=h;MS.forEach(function(m,i){m.x=w*(.2+i*.22);m.y=h*(.52+i*.07);m.width=w*.7;m.height=h*.16})}
    function wv(x,o,a,b){return Math.sin(x/w*7+o)*U*a+Math.sin(x/w*17+o*2)*U*b}
    hills.clear();
    hills.beginFill(0x1a2052,.92);hills.moveTo(0,h);hills.lineTo(0,gy(0)-h*.2);for(x=0;x<=w;x+=10)hills.lineTo(x,gy(x)-h*.2+wv(x,1,.035,.014));hills.lineTo(w,h);hills.endFill();
    hills.beginFill(0x131841,.96);hills.moveTo(0,h);hills.lineTo(0,gy(0)-h*.1);for(x=0;x<=w;x+=10)hills.lineTo(x,gy(x)-h*.1+wv(x,3,.03,.012));hills.lineTo(w,h);hills.endFill();
    slopeSpr.width=w;slopeSpr.height=h*.75;slopeSpr.y=h*.3;
    slopeMask.clear().beginFill(0xffffff).moveTo(0,h).lineTo(0,gy(0));for(x=0;x<=w;x+=8)slopeMask.lineTo(x,gy(x));slopeMask.lineTo(w,h).endFill();
    deco.clear();
    deco.lineStyle(7,0x7f9ce0,.12).moveTo(0,gy(0)+4);for(x=0;x<=w;x+=8)deco.lineTo(x,gy(x)+4);
    deco.lineStyle(2.2,0xa9bdf0,.55).moveTo(0,gy(0));for(x=0;x<=w;x+=8)deco.lineTo(x,gy(x));
    deco.lineStyle(1,0x8fe0b0,.4);for(x=6;x<=w;x+=Math.round(17*ms)){var y0=gy(x),hh=(3+((x*7)%5))*ms;deco.moveTo(x,y0).lineTo(x-1.5*ms,y0-hh);deco.moveTo(x,y0).lineTo(x+.5*ms,y0-hh*1.25);deco.moveTo(x,y0).lineTo(x+2*ms,y0-hh*.8)}
    deco.lineStyle(0);
    for(k=0;k<60;k++){var rx=(k*97.3%1000)/1000*w,ry2=gy(rx)+6+((k*53)%40)*ms,rs=(2+((k*37)%7))*ms;deco.beginFill(0x233067,.9).drawPolygon([rx-rs,ry2,rx-rs*.4,ry2-rs*.8,rx+rs*.7,ry2-rs*.6,rx+rs,ry2]).endFill()}
    for(k=0;k<18;k++){var tx=w*(.01+k*.021);if(tx>w*.4)break;var ts=((1-tx/w*1.3)*26+8)*ms,ty=gy(tx)+4;deco.beginFill(0x061018).drawRect(tx-1.2*ms,ty-ts*.2,2.4*ms,ts*.2);for(var j=0;j<3;j++){var wy=ty-ts*.2-j*ts*.26,ww=ts*(.38-j*.08);deco.drawPolygon([tx-ww,wy,tx,wy-ts*.42,tx+ww,wy])}deco.endFill()}
  }
  drawHills();
  function promisePop(){var msgs=[['\u2715 No expensive gemstones',0xff8a8a],['\u2715 No costly pooja',0xff8a8a],['\u2713 Simple remedies only',0x7dffb3]];msgs.forEach(function(m,i){var tx2=new PIXI.Text(m[0],{fontFamily:'Outfit, Segoe UI, sans-serif',fontSize:15,fill:m[1],fontWeight:'700',letterSpacing:1,dropShadow:true,dropShadowDistance:1,dropShadowColor:0x000000,dropShadowAlpha:.8});tx2.anchor.set(.5);tx2.x=Math.max(120,Math.min(app.screen.width-120,KK.x));tx2.y=gy(KK.x)-130-i*26;tx2.alpha=0;FX.addChild(tx2);gsap.to(tx2,{alpha:1,duration:.4,delay:.5+i*.55});gsap.fromTo(tx2.scale,{x:.4,y:.4},{x:1,y:1,duration:.5,delay:.5+i*.55,ease:'back.out(2)'});gsap.to(tx2,{alpha:0,y:tx2.y-30,duration:.6,delay:3.6+i*.15,onComplete:function(){tx2.destroy()}})})}
  // ---- Alternative design: soft rolling green hills with a winding trail and a flag on the hilltop (no high mountain) ----
  function gy(x){var u=Math.max(0,Math.min(1,(x-W*.04)/(W*.88))),s=u*u*(3-2*u),R=Math.min(H*.3,W*.88*.4),U=Math.min(H,W*.62);return H*.9-R*(.3*u+.7*s)+Math.sin(x/W*11+1)*U*.026+Math.sin(x/W*23+2)*U*.01+Math.sin(x/W*4)*U*.02}
  function mkMountains(){
    var MH=450,MW=Math.max(300,Math.min(900,Math.round(W/H*450))),c=document.createElement('canvas');c.width=MW;c.height=MH;var c2d=c.getContext('2d'),im=c2d.createImageData(MW,MH),sd=SEED*3;
    var LY=[
      {col:[70,92,170],hz:.52,g:0,ridge:function(u){return MH*.56-(Math.sin(u*5+sd)*.5+Math.sin(u*11+sd*2)*.25+fb(u*4+sd,1,3))*MH*.07}},
      {col:[48,96,128],hz:.32,g:.4,ridge:function(u){return MH*.64-(Math.sin(u*4+sd+2)*.5+Math.sin(u*9+sd)*.22+fb(u*5+sd+4,2,3))*MH*.06-Math.exp(-Math.pow((u-.86)/.1,2))*MH*.1}},
      {col:[34,86,96],hz:.16,g:.8,ridge:function(u){return MH*.74-(Math.sin(u*3+sd+4)*.45+Math.sin(u*8+sd*3)*.2+fb(u*6+sd+8,3,3))*MH*.05}}
    ];
    LY.forEach(function(Ly,li){
      var ry=new Float32Array(MW),xx,y;for(xx=0;xx<MW;xx++)ry[xx]=Ly.ridge(xx/MW);
      for(xx=0;xx<MW;xx++){
        var u=xx/MW,s0=(.5-u)>0?1:-1,top=Math.max(0,Math.floor(ry[xx])),slope=(ry[Math.min(MW-1,xx+3)]-ry[Math.max(0,xx-3)])/6;
        for(y=top;y<MH;y++){
          var d=y-ry[xx],n=fb(xx*.03+sd+li*7,y*.05,4),n2=vn(xx*.4,y*.4),lit=.62+Math.max(-.35,Math.min(.5,s0*slope*.9)),sh=lit*(.8+.45*n)*(.93+.14*n2);
          sh*=1-Math.min(.35,d/MH*.6);sh+=Math.max(0,(8-d)/8)*.18;
          var r=Ly.col[0]*sh,g=Ly.col[1]*sh,b=Ly.col[2]*sh;
          if(Ly.g){var gm=Ly.g*(.5+n*.6);r+=(60-r)*gm*.15;g+=(130*sh-g)*gm*.25}
          var hz=Ly.hz;r=r*(1-hz)+120*hz;g=g*(1-hz)+135*hz;b=b*(1-hz)+195*hz;
          var o=(y*MW+xx)*4;im.data[o]=Math.min(255,r);im.data[o+1]=Math.min(255,g);im.data[o+2]=Math.min(255,b);im.data[o+3]=255;
        }
      }
    });
    c2d.putImageData(im,0,0);return PIXI.Texture.from(c);
  }
  slopeSpr.texture=(function(){var c=document.createElement('canvas');c.width=4;c.height=256;var x=c.getContext('2d'),g=x.createLinearGradient(0,0,0,256);g.addColorStop(0,'#4a8a78');g.addColorStop(.35,'#2a5e5a');g.addColorStop(1,'#07151a');x.fillStyle=g;x.fillRect(0,0,4,256);return PIXI.Texture.from(c)})();
  var CL=[];
  for(var ci=0;ci<4;ci++){var cs=new PIXI.Sprite(glowTex);cs.anchor.set(.5);cs.tint=0xffd9c4;cs.alpha=.14;cs.width=420+ci*60;cs.height=90;MIST.addChildAt(cs,0);CL.push(cs);gsap.to(cs,{x:'+='+(120+ci*30),duration:30+ci*8,yoyo:true,repeat:-1,ease:'sine.inOut'})}
  function drawHills(){
    if(!deco)return;
    var w=app.screen.width,h=app.screen.height,x,k,ms=Math.max(.6,Math.min(1.2,w/1000)),U=Math.min(h,w*.62);
    if(mtnSprite){mtnSprite.width=w;mtnSprite.height=h;MS.forEach(function(m,i){m.x=w*(.2+i*.22);m.y=h*(.58+i*.06);m.width=w*.7;m.height=h*.14});if(CL)CL.forEach(function(c,i){c.x=w*(.15+i*.25);c.y=h*(.16+(i%2)*.1)})}
    function wv(x,o,a,b){return Math.sin(x/w*7+o)*U*a+Math.sin(x/w*17+o*2)*U*b}
    hills.clear();
    hills.beginFill(0x1f4a5a,.9);hills.moveTo(0,h);hills.lineTo(0,gy(0)-h*.12);for(x=0;x<=w;x+=10)hills.lineTo(x,gy(x)-h*.12+wv(x,1,.03,.012));hills.lineTo(w,h);hills.endFill();
    hills.beginFill(0x17394a,.96);hills.moveTo(0,h);hills.lineTo(0,gy(0)-h*.05);for(x=0;x<=w;x+=10)hills.lineTo(x,gy(x)-h*.05+wv(x,3,.026,.01));hills.lineTo(w,h);hills.endFill();
    slopeSpr.width=w;slopeSpr.height=h*.75;slopeSpr.y=h*.3;
    slopeMask.clear().beginFill(0xffffff).moveTo(0,h).lineTo(0,gy(0));for(x=0;x<=w;x+=8)slopeMask.lineTo(x,gy(x));slopeMask.lineTo(w,h).endFill();
    deco.clear();
    deco.lineStyle(9*ms,0xd8c49a,.22).moveTo(0,gy(0)+8*ms);for(x=0;x<=w;x+=8)deco.lineTo(x,gy(x)+8*ms);
    deco.lineStyle(2*ms,0xf3e2b8,.4);for(x=0;x<w;x+=16){deco.moveTo(x,gy(x)+8*ms).lineTo(x+7,gy(x+7)+8*ms)}
    deco.lineStyle(2.2,0xbfe8d0,.5).moveTo(0,gy(0));for(x=0;x<=w;x+=8)deco.lineTo(x,gy(x));
    deco.lineStyle(1,0x9fe8b8,.45);for(x=6;x<=w;x+=Math.round(17*ms)){var y0=gy(x),hh=(3+((x*7)%5))*ms;deco.moveTo(x,y0).lineTo(x-1.5*ms,y0-hh);deco.moveTo(x,y0).lineTo(x+.5*ms,y0-hh*1.25);deco.moveTo(x,y0).lineTo(x+2*ms,y0-hh*.8)}
    deco.lineStyle(0);
    var fc=[0xff8fb1,0xffd86b,0xffffff,0xc9a0ff];for(k=0;k<70;k++){var fx=(k*53.7%1000)/1000*w,fy=gy(fx)+14*ms+((k*29)%26)*ms;deco.beginFill(fc[k%4],.9).drawCircle(fx,fy,1.4*ms).endFill()}
    for(k=0;k<60;k++){var rx=(k*97.3%1000)/1000*w,ry2=gy(rx)+8+((k*53)%40)*ms,rs=(2+((k*37)%7))*ms;deco.beginFill(0x2a5a60,.9).drawPolygon([rx-rs,ry2,rx-rs*.4,ry2-rs*.8,rx+rs*.7,ry2-rs*.6,rx+rs,ry2]).endFill()}
    for(k=0;k<14;k++){var bx=w*(.03+k*.07),by=gy(bx)+3,bs=(7+((k*13)%6))*ms;deco.beginFill(0x0f3b32).drawCircle(bx,by-bs*.5,bs).drawCircle(bx-bs*.8,by-bs*.3,bs*.7).drawCircle(bx+bs*.8,by-bs*.3,bs*.7).endFill();deco.beginFill(0x1f6b52,.7).drawCircle(bx+bs*.2,by-bs*.8,bs*.45).endFill()}
    for(k=0;k<22;k++){var tx=w*(.01+k*.021),right=tx>w*.78;if(tx>w*.4&&!right)continue;if(tx>w*.97)break;var ts=((right?.7:(1-tx/w*1.3))*26+8)*ms,ty=gy(tx)+4;deco.beginFill(0x061018).drawRect(tx-1.2*ms,ty-ts*.2,2.4*ms,ts*.2);for(var j=0;j<3;j++){var wy=ty-ts*.2-j*ts*.26,ww=ts*(.38-j*.08);deco.drawPolygon([tx-ww,wy,tx,wy-ts*.42,tx+ww,wy])}deco.endFill()}
  }
  drawHills();
  // ---- Simple flat style: clean ground, two flat hill silhouettes, lightweight for phones ----
  function gy(x){var u=Math.max(0,Math.min(1,(x-W*.04)/(W*.88))),s=u*u*(3-2*u),R=Math.min(H*.14,W*.88*.16);return H*.86-R*s+Math.sin(x/W*5+1)*Math.min(H,W*.62)*.008}
  function mkMountains(){var c=document.createElement('canvas');c.width=c.height=2;return PIXI.Texture.from(c)}
  slopeSpr.texture=(function(){var c=document.createElement('canvas');c.width=4;c.height=256;var x=c.getContext('2d'),g=x.createLinearGradient(0,0,0,256);g.addColorStop(0,'#2e4a78');g.addColorStop(1,'#0b1030');x.fillStyle=g;x.fillRect(0,0,4,256);return PIXI.Texture.from(c)})();
  function drawHills(){
    if(!deco)return;
    var w=app.screen.width,h=app.screen.height,x,k,ms=Math.max(.6,Math.min(1.2,w/1000));
    if(mtnSprite)mtnSprite.visible=false;if(MIST)MIST.visible=false;
    hills.clear();
    hills.beginFill(0x1a2150);hills.moveTo(0,h);hills.lineTo(0,h*.66);for(x=0;x<=w;x+=12)hills.lineTo(x,h*.66-Math.sin(x/w*3.2+.6)*h*.05-Math.sin(x/w*7+1)*h*.012);hills.lineTo(w,h);hills.endFill();
    hills.beginFill(0x141a45);hills.moveTo(0,h);hills.lineTo(0,h*.74);for(x=0;x<=w;x+=12)hills.lineTo(x,h*.74-Math.sin(x/w*2.4+2.2)*h*.04);hills.lineTo(w,h);hills.endFill();
    slopeSpr.width=w;slopeSpr.height=h*.75;slopeSpr.y=h*.3;
    slopeMask.clear().beginFill(0xffffff).moveTo(0,h).lineTo(0,gy(0));for(x=0;x<=w;x+=10)slopeMask.lineTo(x,gy(x));slopeMask.lineTo(w,h).endFill();
    deco.clear();
    deco.lineStyle(8*ms,0xe9d9b0,.16).moveTo(0,gy(0)+9*ms);for(x=0;x<=w;x+=10)deco.lineTo(x,gy(x)+9*ms);
    deco.lineStyle(3*ms,0x9fb3ea,.55).moveTo(0,gy(0));for(x=0;x<=w;x+=10)deco.lineTo(x,gy(x));
    deco.lineStyle(0);
    for(k=0;k<3;k++){var tx=w*(.08+k*.1),ty=gy(tx)+3,th=(26+k*5)*ms;deco.beginFill(0x0b1330).drawRect(tx-1.6*ms,ty-th*.55,3.2*ms,th*.55).endFill();deco.beginFill(0x24507a).drawCircle(tx,ty-th*.72,th*.34).endFill()}
  }
  drawHills();
  function runStory(){
    resetAll();
    var L=gsap.timeline({delay:1,onComplete:function(){goNext();gsap.delayedCall(1.2,runStory)}});
    var T=function(s){L.to({},{duration:s})};
    L.to(KK,{vis:1,duration:.8}).add(function(){wsay('Relationships\u2026 career\u2026 health\u2026 business\u2026');arriveAll(2)})
     .to(KK,{x:Math.max(30,BR[0].x-112),duration:4.5,ease:'power1.out'})
     .add(function(){wsay('I feel so stuck\u2026')})
     .to(KK,{lean:.22,head:.4,uF:.1,fF:.15,uB:.15,fB:.1,crouch:.1,duration:1,ease:'power2.out'});T(1.8);
    guideEnter(L);
    for(var i=0;i<4;i++)guideFree(L,i);
    L.add(function(){wsay('The way is open.');G.fol=1;G.dir=1;gsap.to(dots,{_b:.9,duration:.5,stagger:.07})})
     .to(KK,{lean:0,uF:-.2,fF:-.3,uB:.05,fB:-.1,stf:0,stance:0,crouch:0,x:XO+30,duration:2.2,ease:'power1.inOut'});T(.6);
    maskScene(L);heroEnding(L);return;
    L.add(function(){wsay('I am ready.');spiral(KK.x,gy(KK.x)+4-(30+9)*KK.sk)})
     .to(KK,{uF:-2.6,fF:-.3,uB:-2.4,fB:-.3,lean:-.08,head:-.2,flt:18,duration:1.4,ease:'power2.out'},'<')
     .add(flare)
     .to(lk,{u:1,duration:.7,onUpdate:function(){setLook(lk.u)}},'<')
     .to(KK,{wing:1,sc:1.14,duration:1,ease:'back.out(1.7)'},'<')
     .to(KK,{uF:-.3,fF:-.5,uB:-.1,fB:-.1,head:0,lean:0,duration:1,ease:'power2.inOut'});T(1);
    L.add(function(){wsay('Now, to the sky!')})
     .to(KK,{crouch:.7,lean:.2,uF:-.5,uB:.3,duration:.6,ease:'power2.in'})
     .add(function(){wsay('');KK.dir=-1;var g0=gy(KK.x)+4;puff(KK.x,g0,0x8a82a8,18,7);ring2(KK.x,g0-4,0);shake(4)})
     .to(KK,{crouch:0,lean:.25,uF:-2.9,fF:-.2,uB:-2.8,fB:-.2,stance:.9,flap:1,duration:.5,ease:'power3.out'})
     .to(KK,{flt:H*1.2,duration:3.6,ease:'power2.in'},'<.2')
     .to(KK,{x:W*.5,duration:3.6,ease:'power1.inOut'},'<')
     .to(KK,{sc:.3,duration:3.6,ease:'power1.in'},'<')
     .to(KK,{vis:0,duration:.9},'-=1.1')
     .add(sunhit);T(1.2);
  }
  // ---- Advanced hero effects: scramble text, 3D tilt + glare, cursor, spotlight, scroll exit ----
  function scramble(el){
    if(!el)return;var T0=el._t||(el._t=el.textContent),pr={u:0},C='ABCDEFGHJKLMNPQRSTUVWXYZ0123456789#*+';
    gsap.to(pr,{u:1,duration:1.2,ease:'none',overwrite:false,onUpdate:function(){var n=Math.floor(pr.u*T0.length),s='';for(var k=0;k<T0.length;k++){var ch=T0[k];s+=(k<n||ch===' ')?ch:C[Math.floor(Math.random()*C.length)]}el.textContent=s},onComplete:function(){el.textContent=T0}});
  }
  var fine=matchMedia('(pointer:fine)').matches,rootS=document.documentElement.style;
  addEventListener('pointermove',function(e){
    var nx=e.clientX/innerWidth-.5,ny=e.clientY/innerHeight-.5;
    rootS.setProperty('--mx',e.clientX+'px');rootS.setProperty('--my',e.clientY+'px');
    if(fine){gsap.to('.cur',{x:e.clientX,y:e.clientY,duration:.1,overwrite:'auto'});gsap.to('.cur-r',{x:e.clientX,y:e.clientY,duration:.45,ease:'power3.out',overwrite:'auto'})}
    gsap.to('.slides',{rotationY:nx*7,rotationX:-ny*5,transformPerspective:1200,duration:.8,ease:'power3.out',overwrite:'auto'});
    var c=document.getElementById('c1'),r=c.getBoundingClientRect();
    gsap.to(c,{rotationY:nx*16,rotationX:-ny*12,transformPerspective:900,duration:.6,ease:'power3.out',overwrite:'auto'});
    c.style.setProperty('--gx',((e.clientX-r.left)/r.width*100)+'%');c.style.setProperty('--gy',((e.clientY-r.top)/r.height*100)+'%');
  });
  document.addEventListener('pointerover',function(e){var on=!!(e.target.closest&&e.target.closest('a,button,.nx-card'));gsap.to('.cur-r',{scale:on?1.9:1,backgroundColor:on?'rgba(255,210,122,.18)':'rgba(255,210,122,0)',duration:.3,overwrite:'auto'})});
  addEventListener('scroll',function(){var p=Math.min(1,window.scrollY/(innerHeight*.9));gsap.set('.content',{y:-p*90,scale:1-p*.07,opacity:Math.max(0,1-p*1.3),filter:p>0?'blur('+(p*8)+'px)':'none',transformOrigin:'50% 0%'})},{passive:true});
  // ---- Evolution transition (stuck -> guided -> transformed), then hand-off to WhatsApp ----
  var NS='http://www.w3.org/2000/svg',orbSvg=document.getElementById('orb'),manual=false;
  function sv(n,a,p){var e=document.createElementNS(NS,n);for(var k in a)e.setAttribute(k,a[k]);(p||orbSvg).appendChild(e);return e}
  var spt=[];for(var ei=0;ei<24;ei++){var ea=ei/24*Math.PI*2,er=ei%2?58:88;spt.push((100+Math.cos(ea)*er).toFixed(1)+','+(100+Math.sin(ea)*er).toFixed(1))}
  sv('polygon',{id:'orbSpikes',points:spt.join(' '),fill:'rgba(125,111,168,.16)',stroke:'#7d6fa8','stroke-width':1.5});
  var orbRays=sv('g',{id:'orbRays'}),raySpin=sv('g',{id:'raySpin'},orbRays);
  for(var ej=0;ej<16;ej++){var ra=ej/16*Math.PI*2,r2=ej%2?90:98;sv('line',{x1:100+Math.cos(ra)*66,y1:100+Math.sin(ra)*66,x2:100+Math.cos(ra)*r2,y2:100+Math.sin(ra)*r2,stroke:'#ffd27a','stroke-width':2,'stroke-linecap':'round'},raySpin)}
  sv('circle',{id:'orbRing',cx:100,cy:100,r:62,fill:'none',stroke:'#7d6fa8','stroke-width':2,'stroke-dasharray':'6 10'});
  sv('circle',{id:'orbCore',cx:100,cy:100,r:36,fill:'#4b3f7a'});
  var orbGuide=sv('g',{id:'orbGuide',opacity:0});sv('circle',{cx:100,cy:30,r:5,fill:'#fff1c2'},orbGuide);
  gsap.set('#orbRays',{scale:0,svgOrigin:'100 100'});
  gsap.to('#raySpin',{rotation:360,svgOrigin:'100 100',duration:30,repeat:-1,ease:'none'});
  gsap.to('#orbGuide',{rotation:360,svgOrigin:'100 100',duration:4,repeat:-1,ease:'none'});
  gsap.to('#orbSpikes',{rotation:4,svgOrigin:'100 100',duration:.15,repeat:-1,yoyo:true,ease:'none'});
  ['wheel','touchstart'].forEach(function(ev){addEventListener(ev,function(){manual=true},{passive:true})});
  function smoothTo(y,dur){var o={y:window.scrollY};scTw=gsap.to(o,{y:y,duration:dur,ease:'power3.inOut',onUpdate:function(){window.scrollTo(0,o.y)}})}
  function showWA(){sfx.pop();
    gsap.fromTo('#waF',{scale:0,opacity:0},{scale:1,opacity:1,duration:.8,ease:'back.out(2.2)'});
    gsap.fromTo('#waTip',{x:20,opacity:0},{x:0,opacity:1,duration:.5,delay:.7});gsap.to('#waTip',{opacity:0,duration:.5,delay:6});
  }
  var evoDone=false;
  function playEvo(){
    if(evoDone)return;evoDone=true;manual=false;
    var S0='.evo-step[data-i="0"]',S1='.evo-step[data-i="1"]',S2='.evo-step[data-i="2"]';
    var T=gsap.timeline({onComplete:function(){showWA();gsap.delayedCall(1.2,function(){var cy=document.getElementById('chat').offsetTop;if(!manual&&window.scrollY<cy-200)smoothTo(cy,1.8)})}});
    T.fromTo('#lander',{y:-420,rotation:200,scale:.5,opacity:1},{y:0,rotation:0,scale:1,duration:.8,ease:'power2.in'}).to('#lander',{y:-18,duration:.18,yoyo:true,repeat:1,ease:'power1.out'}).add(function(){sfx.thud()}).to('#lander',{opacity:0,scale:.3,duration:.5})
     .fromTo('#orb',{opacity:0,scale:.7,transformOrigin:'50% 50%'},{opacity:1,scale:1,duration:1,ease:'expo.out'})
     .to(S0,{opacity:1,y:0,duration:.7},'<.2').to('#evoBar',{width:'33%',duration:1.2},'<').to({},{duration:1.4})
     .to(S0,{opacity:0,y:-20,duration:.5})
     .to('#orbSpikes',{scale:.3,opacity:0,svgOrigin:'100 100',duration:1.2,ease:'power3.inOut'},'<')
     .to('#orbRing',{stroke:'#6aa8ff',duration:1.2},'<').to('#orbCore',{fill:'#6aa8ff',duration:1.2},'<')
     .to('#orbGuide',{opacity:1,duration:.6},'<.4')
     .to(S1,{opacity:1,y:0,duration:.7},'<.3').to('#evoBar',{width:'66%',duration:1.2},'<').to({},{duration:1.4})
     .to(S1,{opacity:0,y:-20,duration:.5})
     .to('#orbCore',{fill:'#ffd27a',duration:1.2},'<').to('#orbRing',{stroke:'#ffd27a',duration:1.2},'<')
     .to('#orbRays',{scale:1,svgOrigin:'100 100',duration:1.4,ease:'back.out(1.7)'},'<')
     .to('#orb',{scale:1.12,filter:'drop-shadow(0 0 30px rgba(255,200,110,.7))',duration:1.4},'<')
     .to(S2,{opacity:1,y:0,duration:.7},'<.4').to('#evoBar',{width:'100%',duration:1.2},'<').to({},{duration:1.6});
  }
  var chatDone=false;
  function playChat(){
    if(chatDone)return;chatDone=true;
    var T=gsap.timeline();
    T.fromTo('#chat .t2e,#chat h2,.cp',{y:30,opacity:0},{y:0,opacity:1,duration:.9,stagger:.12,ease:'expo.out'})
     .fromTo('.phone',{y:60,opacity:0,rotationX:20,transformPerspective:800},{y:0,opacity:1,rotationX:0,duration:1,ease:'expo.out'},'<.2')
     .fromTo('#m1',{y:16,opacity:0,scale:.9},{y:0,opacity:1,scale:1,duration:.5,ease:'back.out(2)'})
     .fromTo('#typ',{opacity:0},{opacity:1,duration:.2},'+=.4').to('#typ',{opacity:0,duration:.2},'+=1')
     .fromTo('#m2',{y:16,opacity:0,scale:.9},{y:0,opacity:1,scale:1,duration:.5,ease:'back.out(2)'})
     .add(function(){if(sfx.isOn()&&window.speakReply)window.speakReply()})
     .fromTo('.wa-btn',{y:20,opacity:0,scale:.9},{y:0,opacity:1,scale:1,duration:.7,ease:'back.out(2)'},'-=.3')
     .add(function(){gsap.to('.wa-btn',{scale:1.05,duration:.7,yoyo:true,repeat:-1,ease:'sine.inOut'});showWA()});
  }
  var evoIO=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){evoIO.disconnect();playEvo()}})},{threshold:.45});evoIO.observe(document.querySelector('.evo'));
  var chatIO=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){chatIO.disconnect();playChat()}})},{threshold:.35});chatIO.observe(document.getElementById('chat'));
  document.getElementById('up2').addEventListener('click',function(e){e.preventDefault();window.scrollTo({top:0,behavior:'smooth'})});
  // ---- Business block: drag to reveal persona vs real drivers ----
  (function(){
    var box=document.getElementById('reveal');if(!box)return;var o={v:50};
    function set(p){p=Math.max(4,Math.min(96,p));box.style.setProperty('--x',p+'%')}set(50);
    function mv(e){var r=box.getBoundingClientRect();set((e.clientX-r.left)/r.width*100)}
    box.addEventListener('pointerdown',function(e){gsap.killTweensOf(o);box.setPointerCapture(e.pointerId);mv(e);box.onpointermove=mv});
    box.addEventListener('pointerup',function(){box.onpointermove=null});
    var io=new IntersectionObserver(function(es){if(!es[0].isIntersecting)return;io.disconnect();
      gsap.timeline().to(o,{v:85,duration:1.2,ease:'power2.inOut',onUpdate:function(){set(o.v)}}).to(o,{v:15,duration:1.8,ease:'power2.inOut',onUpdate:function(){set(o.v)}}).to(o,{v:50,duration:1,ease:'power2.inOut',onUpdate:function(){set(o.v)}});
    },{threshold:.5});io.observe(box);
  })();
  // ---- Professional layout helpers: sticky nav state, scroll reveal, in-page links ----
  addEventListener('scroll',function(){document.body.classList.toggle('sc',window.scrollY>30)},{passive:true});
  var rvIO=new IntersectionObserver(function(es){es.forEach(function(e){if(!e.isIntersecting)return;var sib=[].slice.call(e.target.parentNode.children).filter(function(c){return c.classList.contains('rv')});e.target.style.transitionDelay=(sib.indexOf(e.target)%4)*90+'ms';e.target.classList.add('in');rvIO.unobserve(e.target)})},{threshold:.15});
  document.querySelectorAll('.rv').forEach(function(el){rvIO.observe(el)});
  document.querySelectorAll('a[href^="#"]').forEach(function(a){var h=a.getAttribute('href');if(h.length<2)return;a.addEventListener('click',function(e){var tg=document.querySelector(h);if(!tg)return;e.preventDefault();manual=true;smoothTo(tg.getBoundingClientRect().top+window.scrollY-(tg.id==='next'?0:64),1.4)})});
  // ---- After the story ends: scroll to the next section ----
  var scrolled=false,scTw;
  function goNext(){
    if(scrolled)return;scrolled=true;
    var y0=window.scrollY,y1=document.getElementById('next').offsetTop;
    if(y0>=y1-10)return;
    gsap.timeline().to(S,{zoom:2.4,duration:.9,ease:'power2.in'}).to(S,{zoom:1,duration:1.2,ease:'expo.out'});
    gsap.fromTo('.wipe',{opacity:0,scale:.2},{opacity:.6,scale:1.6,duration:.9,yoyo:true,repeat:1,ease:'power2.inOut'});
    var o={y:y0};scTw=gsap.to(o,{y:y1,duration:1.8,ease:'power3.inOut',onUpdate:function(){window.scrollTo(0,o.y)}});
  }
  ['wheel','touchstart'].forEach(function(ev){addEventListener(ev,function(){if(scTw)scTw.kill()},{passive:true})});
  addEventListener('scroll',function(){document.body.classList.toggle('past',window.scrollY>innerHeight*.5)},{passive:true});
  var io=new IntersectionObserver(function(es){es.forEach(function(e){if(!e.isIntersecting)return;io.disconnect();
    gsap.fromTo('.nx-head>*',{y:40,opacity:0},{y:0,opacity:1,duration:1,stagger:.12,ease:'expo.out'});
    gsap.fromTo('.nx-card',{y:90,opacity:0,scale:.92},{y:0,opacity:1,scale:1,duration:1.1,stagger:.15,delay:.3,ease:'expo.out'});
  })},{threshold:.2});io.observe(document.getElementById('next'));
  document.getElementById('up').addEventListener('click',function(e){e.preventDefault();window.scrollTo({top:0,behavior:'smooth'})});
  function startSeeker(){runStory()}

  var flares=new PIXI.Container();stage.addChild(flares);
  [[.35,60,0xffb070,.25],[.65,120,0x9ad1ff,.14],[.95,44,0xff7a59,.3],[1.4,190,0xffd0a0,.12],[1.85,76,0xc084fc,.2]].forEach(function(f){var s=spr(glowTex,f[1],f[2],0);s._k=f[0];s._a=f[3];flares.addChild(s)});
  function layout(){sun.x=cx();sun.y=horizon()+260-S.rise*(horizon()-app.screen.height*.34+260);drawHills()}
  layout();addEventListener('resize',function(){layout()});
  addEventListener('pointermove',function(e){S.mx=(e.clientX/innerWidth-.5);S.my=(e.clientY/innerHeight-.5)});

  var t=0;
  app.ticker.add(function(d){
    t+=d/60;
    stars.forEach(function(s){s.alpha=.3+.7*Math.abs(Math.sin(t*s._s+s._p))});
    planets.forEach(function(p){p._a+=.006*p._sp*d;p.x=Math.cos(p._a)*p._r;p.y=Math.sin(p._a)*p._r*.32;p.scale.set(1+Math.sin(p._a)*.2)});
    rays.rotation+=.0012*d;
    rays.children.forEach(function(b){b.alpha=b._a*(.55+.45*Math.sin(t*1.2+b._p))});
    core.scale.set(core._s*(1+Math.sin(t*2)*.02+Math.sin(t*7.3)*.008));halo.scale.set(halo._s*(1+Math.sin(t*1.3)*.03));
    haze.alpha=(.25+.3*S.rise)*(1-.5*S.dock);streak.alpha=(.1+.4*S.rise)*(1-.7*S.dock);
    embers.children.forEach(function(m){m._l+=.004*m._sp*d;if(m._l>1){m._l=0;m.x=(Math.random()-.5)*160;m.y=(Math.random()-.5)*60}m.x+=m._dx*d;m.y-=m._sp*d*1.2;m.alpha=Math.sin(Math.PI*m._l)*.8*S.rise*(1-S.dock)});
    var fx=app.screen.width/2-sun.x,fy=app.screen.height/2-sun.y;
    flares.children.forEach(function(f){f.x=sun.x+fx*f._k;f.y=sun.y+fy*f._k;f.alpha=f._a*S.rise*(1-S.dock)*(.7+.3*Math.sin(t*1.5+f._k*5))});
    charPolish();raysTick(d);twinkleTick();evoTick();partsTick(d);placePlanets();surf1.rotation+=.0012*d;surf2.rotation-=.0008*d;ringS.alpha=.5+.2*Math.sin(t*1.7);
    galaxy.x=app.screen.width/2-S.mx*24;galaxy.y=app.screen.height*.46-S.my*14;galaxy.scale.set(Math.max(app.screen.width/gc.width,app.screen.height/gc.height)*1.35*(1+(S.zoom-1)*.12));galaxy.rotation=-.06+t*.004;galaxy.alpha=.95-.3*S.rise;
    seekerTick(d);hg.x=cx();hg.y=horizon();hg.alpha=(.1+.6*S.rise)*(1-.5*S.dock);
    sun.x=cx()+S.mx*30;starLayer.x+=((app.screen.width/2-S.mx*20)-starLayer.x)*.05;starLayer.y+=((app.screen.height/2-S.my*12)-starLayer.y)*.05;starLayer.scale.set(S.zoom);
    var by0=horizon()+260-S.rise*(horizon()-app.screen.height*.34+260)+S.my*10*(1-S.dock),D=S.dock,bx0=sun.x;sun.y=by0;sun.scale.set(1);if(D>0){var lr=document.getElementById('logoMark').getBoundingClientRect();sun.x=bx0+(lr.left+lr.width/2-bx0)*D;sun.y=by0+(lr.top+lr.height/2-by0)*D;sun.scale.set(1-.55*D);orbit.alpha=Math.max(0,1-D*2.2)}
    var cs=Math.min(1,app.screen.width/1100);cosmic.scale.set(cs);cosmic.alpha=S.rise*Math.max(0,1-D*2.2);
    gSpin.rotation+=.0014*d;zRot+=.0032*d;
    Z.forEach(function(z,k){var a=zRot+k/12*Math.PI*2,sn=Math.sin(a);z.x=Math.cos(a)*ZR;z.y=sn*ZR*.38;z.scale.set((k===4?1.3:1)*(.8+.3*sn));z.alpha=(k===4?1:.6)+.3*sn});
    leoG.x=Z[4].x;leoG.y=Z[4].y;leoG.alpha=.55+.3*Math.sin(t*2.2);leoL.x=Z[4].x;leoL.y=Z[4].y+34*Z[4].scale.y;leoL.alpha=Z[4].alpha;
    cStars.forEach(function(s){s.alpha=.5+.5*Math.abs(Math.sin(t*1.8+s._p))});
    starLayer.alpha=1-S.rise*.45;
  });

  // GSAP timeline: sun rises -> page reveals
  gsap.set('#intro',{opacity:1});
  gsap.to('.lb.t',{yPercent:-100,duration:2,ease:'power4.inOut',delay:.3});
  gsap.to('.lb.b',{yPercent:100,duration:2,ease:'power4.inOut',delay:.3});
  var tl=gsap.timeline({defaults:{ease:'power3.out'}});
  tl.to(S,{rise:1,duration:3.2,ease:'power2.inOut'})
    .to('#dawn',{opacity:1,duration:3.2,ease:'power1.inOut'},0)
    .to('#introTxt',{opacity:0,letterSpacing:'1em',duration:1},2.2)
    .to('#nav',{opacity:1,y:0,duration:.8},'-=.6')
    .to('#tag',{opacity:1,y:0,duration:.7},'-=.4')
    .add(function(){scramble(document.getElementById('tag'))},'<')
    .to('#title .w i',{y:0,yPercent:0,transform:'translateY(0)',duration:1,stagger:.1,ease:'expo.out'},'-=.4')
    .fromTo('#title',{letterSpacing:'.3em'},{letterSpacing:'.01em',duration:1.8,ease:'expo.out'},'<')
    .to('#sub',{opacity:1,duration:.8},'-=.6')
    .to('#cta',{opacity:1,duration:.8},'-=.5')
    .to('#stats',{opacity:1,duration:.8},'-=.5')
    .fromTo('#c1',{opacity:0,y:60,rotate:4},{opacity:1,y:0,rotate:0,duration:1},'-=1')
    .fromTo('#c2',{opacity:0,y:60},{opacity:1,y:0,duration:1},'-=.8')
    .to('#bar',{width:'82%',duration:1.6},'-=.6')
    .to('#scroll',{opacity:1,duration:.6},'-=.8')
    .add(function(){
      document.querySelectorAll('[data-n]').forEach(function(el){
        var o={v:0},n=+el.dataset.n;
        gsap.to(o,{v:n,duration:2,ease:'power2.out',onUpdate:function(){el.textContent=Math.round(o.v).toLocaleString()}});
      });
      gsap.to(['#c1'],{y:-12,duration:3,repeat:-1,yoyo:true,ease:'sine.inOut'});
      gsap.to(['#c2'],{y:10,duration:3.6,repeat:-1,yoyo:true,ease:'sine.inOut'});
      
    },'-=1.4')
    .to(S,{dock:1,duration:2.4,ease:'power3.inOut'},'+=1.2')
    .to('#logoMark',{scale:1.3,duration:.35,yoyo:true,repeat:1,ease:'power2.out'})
    .add(startNotices)
    .add(startSlides);

  // ---- Side-sliding hero slides with zoom-in transitions ----
  var SL=['sl0','sl1','sl2'].map(function(id){return document.getElementById(id)});
  var cur=0,busy=false,prog,TT=6.5;
  var CARDS=[{h:'Today’s Planetary Sky',p:'Live alignment snapshot',r:[['☉ Sun','Scorpio 12°'],['☽ Moon','Taurus 28°'],['♀ Venus','Libra 4°']],l:'Career window strength',b:82},
    {h:'Your Birth Chart',p:'Sample reading preview',r:[['☊ Rising','Leo'],['☿ Mercury','Virgo'],['♂ Mars','Aries']],l:'Chart accuracy',b:96},
    {h:'Best Launch Window',p:'Next 30 days',r:[['📅 Nov 12','Strong'],['📅 Nov 21','Peak'],['📅 Dec 03','Moderate']],l:'Timing confidence',b:74}];
  function fillCard(c){var ps=document.querySelectorAll('#c1 p'),rs=document.querySelectorAll('#c1 .row');document.querySelector('#c1 h3').textContent=c.h;ps[0].textContent=c.p;ps[1].textContent=c.l;rs.forEach(function(r,k){r.children[0].textContent=c.r[k][0];r.children[1].textContent=c.r[k][1]})}
  function startAuto(){
    var f=document.querySelectorAll('.trk i');gsap.set(f,{scaleY:0});
    prog=gsap.to(f[cur],{scaleY:1,duration:TT,ease:'none',onComplete:function(){go((cur+1)%3,1)}});
  }
  function anim(o,i,n,dir){
    var a=gsap.timeline(),h=i.querySelector('h1');scramble(i.children[0]);
    gsap.set(i.children,{x:0,y:0,rotationY:0,scale:1,filter:'blur(0px)',opacity:1});
    if(n===0){ // 1) Zoom Drift: slides in from the side, grows, star punch-in
      a.to(o.children,{x:-90*dir,opacity:0,filter:'blur(8px)',duration:.6,stagger:.05,ease:'power3.in'},0)
       .fromTo(i.children,{x:110*dir,opacity:0,scale:.86,filter:'blur(10px)'},{x:0,opacity:1,scale:1,filter:'blur(0px)',duration:1.1,stagger:.09,ease:'expo.out',transformOrigin:'left center'},.45)
       .to(S,{zoom:1.7,duration:.45,ease:'power2.in'},0).to(S,{zoom:1,duration:1.4,ease:'expo.out'},.45)
       .fromTo(h,{letterSpacing:'.3em'},{letterSpacing:'.01em',duration:1.6,ease:'expo.out'},.45);
    }else if(n===1){ // 2) Mask Rise: words rise out of a mask, galaxy + zodiac spin
      a.to(o.children,{y:-70,opacity:0,duration:.55,stagger:.04,ease:'power3.in'},0)
       .fromTo(i.querySelectorAll('.w i'),{yPercent:115,rotation:6},{yPercent:0,rotation:0,duration:1.1,stagger:.07,ease:'expo.out'},.5)
       .fromTo([i.children[0],i.children[2],i.children[3]],{y:50,opacity:0},{y:0,opacity:1,duration:.9,stagger:.12,ease:'power3.out'},.8);
      gsap.to(gSpin,{rotation:'+=2.2',duration:2.4,ease:'power3.out'});
      var zp={v:0},zl=0;gsap.to(zp,{v:2.4,duration:2.4,ease:'power3.out',onUpdate:function(){zRot+=zp.v-zl;zl=zp.v}});
    }else{ // 3) Cinema Flip: 3D page-flip + light wipe, sun flash, stars pull back
      a.to(o.children,{rotationY:75,opacity:0,transformPerspective:900,transformOrigin:'right center',duration:.6,stagger:.05,ease:'power3.in'},0)
       .fromTo(i.children,{rotationY:-80,x:-60,opacity:0,transformPerspective:900,transformOrigin:'left center'},{rotationY:0,x:0,opacity:1,duration:1.2,stagger:.1,ease:'expo.out'},.5)
       .fromTo(i,{clipPath:'inset(0 100% 0 0)'},{clipPath:'inset(0 0% 0 0)',duration:1.2,ease:'power4.inOut'},.45)
       .fromTo(S,{zoom:1},{zoom:.55,duration:.5,ease:'power2.in'},0).to(S,{zoom:1,duration:1.5,ease:'expo.out'},.5)
       .to(halo,{_s:halo._s*1.5,duration:.5,yoyo:true,repeat:1,ease:'power2.out'},.4)
       .to(core,{_s:core._s*1.35,duration:.5,yoyo:true,repeat:1,ease:'power2.out'},.4)
       .set(i,{clearProps:'clipPath'},'>');
    }
    return a;
  }
  function go(n,dir){
    if(busy||n===cur)return;busy=true;dir=dir||1;
    if(prog)prog.kill();
    var o=SL[cur],i=SL[n],c=CARDS[n];
    gsap.set(i,{visibility:'visible'});
    document.getElementById('cnt').textContent='0'+(n+1);
    var tl=gsap.timeline({onComplete:function(){gsap.set(o,{visibility:'hidden'});cur=n;busy=false;startAuto()}});
    tl.add(anim(o,i,n,dir),0)
      .to('#c1',{opacity:0,scale:.92,duration:.4,ease:'power2.in'},0).add(function(){fillCard(c)},.4)
      .to('#c1',{opacity:1,scale:1,duration:.9,ease:'expo.out'},.45)
      .to('#bar',{width:'0%',duration:.3},0).to('#bar',{width:c.b+'%',duration:1.4,ease:'power3.out'},.6);
  }
  function startSlides(){
    gsap.to('#side',{opacity:1,duration:.8});startSeeker();gsap.fromTo('.cap>*',{y:24,opacity:0},{y:0,opacity:1,duration:1,stagger:.12,ease:'expo.out',delay:.6});
    document.getElementById('next').onclick=function(){go((cur+1)%3,1)};
    document.getElementById('prev').onclick=function(){go((cur+2)%3,-1)};
    document.querySelectorAll('.trk').forEach(function(t,k){t.onclick=function(){go(k,k>cur?1:-1)}});
    var sw=document.querySelector('.slides');
    sw.addEventListener('pointerenter',function(){if(prog)prog.pause()});
    sw.addEventListener('pointerleave',function(){if(prog)prog.play()});
    addEventListener('keydown',function(e){if(e.key==='ArrowRight'||e.key==='ArrowDown')go((cur+1)%3,1);if(e.key==='ArrowLeft'||e.key==='ArrowUp')go((cur+2)%3,-1)});
  }

  // ---- Dummy customer-notice hook: call window.notifyCustomer({ic,t}) from anywhere ----
  var NOTICES=[{ic:'✦',t:'Riya from Pune just booked a Career Chart reading'},{ic:'🔥',t:'Only 3 consultation slots left today'},{ic:'☽',t:'Full moon alert: best week to start something new'},{ic:'★',t:'Arjun from Bengaluru left a 5-star review'},{ic:'🎁',t:'Free birth-chart report for new visitors today'}];
  var feed=[],unread=0,ni=0,open=false;
  function notifyCustomer(n){sfx.pop();
    feed.unshift(n);unread++;
    var bd=document.getElementById('badge');bd.textContent=unread;bd.style.display='grid';
    var item=document.createElement('div');item.className='ni';item.textContent=n.ic+'  '+n.t;
    var pl=document.getElementById('plist');pl.insertBefore(item,pl.firstChild);
    var el=document.createElement('div');el.className='toast';
    var ic=document.createElement('span');ic.className='ic';ic.textContent=n.ic;
    var tx=document.createElement('span');tx.textContent=n.t;el.appendChild(ic);el.appendChild(tx);
    document.getElementById('toasts').appendChild(el);
    gsap.from(el,{x:-60,opacity:0,duration:.6,ease:'back.out(1.7)'});
    gsap.fromTo('#bell',{rotate:-18},{rotate:0,duration:1,ease:'elastic.out(1,.3)'});
    var kill=function(){gsap.to(el,{opacity:0,x:-40,duration:.4,onComplete:function(){el.remove()}})};
    el.addEventListener('click',kill);gsap.delayedCall(5,kill);
  }
  window.notifyCustomer=notifyCustomer;
  function startNotices(){return;
    notifyCustomer(NOTICES[0]);ni=1;
    var iv=setInterval(function(){notifyCustomer(NOTICES[ni++%NOTICES.length]);if(feed.length>=12)clearInterval(iv)},7000);
  }
  gsap.set('#panel',{y:-10});
  document.getElementById('bell').addEventListener('click',function(){
    open=!open;unread=0;document.getElementById('badge').style.display='none';
    document.getElementById('panel').classList.toggle('o',open);
    gsap.to('#panel',{opacity:open?1:0,y:open?0:-10,duration:.3});
  });

  // Magnetic buttons
  document.querySelectorAll('.mag').forEach(function(b){
    b.addEventListener('pointermove',function(e){var r=b.getBoundingClientRect();gsap.to(b,{x:(e.clientX-r.left-r.width/2)*.25,y:(e.clientY-r.top-r.height/2)*.35,duration:.3})});
    b.addEventListener('pointerleave',function(){gsap.to(b,{x:0,y:0,duration:.6,ease:'elastic.out(1,.4)'})});
  });
})();

  return function cleanup() {
    listeners.forEach(function (l) { try { l[0].removeEventListener(l[1], l[2], l[3]); } catch (e) {} });
    intervals.forEach(function (id) { clearInterval(id); });
    contexts.forEach(function (c) { try { c.close(); } catch (e) {} });
    try { window.speechSynthesis && window.speechSynthesis.cancel(); } catch (e) {}
    try { gsap.globalTimeline.clear(); } catch (e) {}
    try { app_ && app_.destroy(true, { children: true, texture: true, baseTexture: true }); } catch (e) {}
    delete window.addEventListener; delete document.addEventListener; delete window.setInterval;
    if (origAC) window.AudioContext = origAC;
    delete window.notifyCustomer; delete window.speakReply;
    document.body.classList.remove('sc', 'past');
  };
}
