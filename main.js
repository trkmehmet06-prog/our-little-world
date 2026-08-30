const W=720,H=1280;
const SAVE_KEY='misa-complete-v1';
const clamp=(v,a=0,b=100)=>Math.max(a,Math.min(b,v));
const today=()=>new Date().toISOString().slice(0,10);
const defaultState={hunger:82,happiness:86,energy:78,cleanliness:88,love:72,coins:100,xp:0,level:1,last:Date.now(),dailyDate:'',dailyClaimed:false,highScore:0,missions:{feed:0,love:0,play:0,clean:0},dailyMissions:{feed:0,love:0,play:0,clean:0},achievements:[],owned:[],equipped:{hat:'',toy:''}};
let state;
function loadState(){try{const raw=JSON.parse(localStorage.getItem(SAVE_KEY));state={...defaultState,...raw,missions:{...defaultState.missions,...(raw?.missions||{})},dailyMissions:{...defaultState.dailyMissions,...(raw?.dailyMissions||{})},equipped:{...defaultState.equipped,...(raw?.equipped||{})},owned:Array.isArray(raw?.owned)?raw.owned:[],achievements:Array.isArray(raw?.achievements)?raw.achievements:[]};}catch{state={...defaultState,missions:{...defaultState.missions},owned:[],achievements:[],equipped:{...defaultState.equipped}}}}
function saveState(){state.last=Date.now();localStorage.setItem(SAVE_KEY,JSON.stringify(state));}
function applyAwayDecay(){const mins=Math.max(0,(Date.now()-state.last)/60000);if(mins<1)return;const ticks=Math.min(720,Math.floor(mins/10));if(!ticks)return;state.hunger=clamp(state.hunger-ticks*.42);state.happiness=clamp(state.happiness-ticks*.28);state.energy=clamp(state.energy-ticks*.16);state.cleanliness=clamp(state.cleanliness-ticks*.22);state.love=clamp(state.love-ticks*.10);saveState();}
loadState();applyAwayDecay();
const frames=Array.from({length:8},(_,i)=>`misa${i+1}`);
const SHOP=[
 {id:'hat_blue',name:'Mavi Şapka',icon:'🎩',price:70,type:'hat'},
 {id:'hat_crown',name:'Mini Taç',icon:'👑',price:120,type:'hat'},
 {id:'hat_party',name:'Parti Şapkası',icon:'🥳',price:90,type:'hat'},
 {id:'toy_ball',name:'Top',icon:'⚽',price:60,type:'toy'},
 {id:'toy_mouse',name:'Oyuncak Fare',icon:'🐭',price:80,type:'toy'},
 {id:'toy_star',name:'Yıldız Oyuncak',icon:'⭐',price:100,type:'toy'}
];
const ACH=[
 ['first_feed','İlk Mama','Mişa’yı ilk kez besle.',s=>s.missions.feed>=1],
 ['lover','Sevgi Pıtırcığı','Mişa’yı 20 kez sev.',s=>s.missions.love>=20],
 ['cleaner','Mis Gibi','Mişa’yı 10 kez yıka.',s=>s.missions.clean>=10],
 ['gamer','Oyun Arkadaşı','10 oyun tamamla.',s=>s.missions.play>=10],
 ['rich','Kumbaracı','500 coin biriktir.',s=>s.coins>=500],
 ['level5','Büyüdün!','Seviye 5’e ulaş.',s=>s.level>=5]
];
function xpNeed(level){return 100+level*35}
function mood(){const avg=(state.hunger+state.happiness+state.energy+state.cleanliness+state.love)/5;if(state.energy<20)return ['😴','Uykulu'];if(state.hunger<20)return ['🤤','Çok Aç'];if(state.cleanliness<20)return ['🫧','Kirli'];if(avg>=82)return ['😍','Çok Mutlu'];if(avg>=65)return ['😊','Mutlu'];if(avg>=45)return ['🙂','İyi'];if(avg>=25)return ['🥺','Keyifsiz'];return ['😿','Üzgün'];}
class HomeScene extends Phaser.Scene{
 constructor(){super('HomeScene');this.mode='home';this.busy=false;this.idleTimer=null;this.tapTimes=[];this.currentTab='home';this.overlay=null;this.miniObjects=[];}
 preload(){frames.forEach((k,i)=>this.load.image(k,`assets/misa/misa_idle_0${i+1}.png`));}
 create(){
  this.cameras.main.setBackgroundColor('#fff7fb');
  this.add.rectangle(W/2,H/2,W,H,0xfff7fb);
  this.drawHome();
  this.startIdle();
  this.refresh();
  this.setupDaily();
  this.liveDecayTimer=this.time.addEvent({delay:60000,loop:true,callback:()=>this.liveDecay()});
 }
 txt(x,y,t,size,color='#342b3b',style='bold'){return this.add.text(x,y,t,{fontFamily:'Arial',fontSize:size+'px',color,fontStyle:style}).setOrigin(.5)}
 box(x,y,w,h,color=0xffffff,alpha=1,stroke=0xeadfeb){const r=this.add.rectangle(x,y,w,h,color,alpha).setOrigin(.5);if(stroke!==null)r.setStrokeStyle(2,stroke,1);return r}
 button(x,y,w,h,label,fn,color=0xffffff){const b=this.box(x,y,w,h,color,1);b.setInteractive({useHandCursor:true});this.txt(x,y,label,18,'#4f4554');b.on('pointerdown',()=>fn());return b}
 drawHome(){
  this.title=this.txt(W/2,38,'🐱  MİŞA',42,'#2e2638');
  this.subtitle=this.txt(W/2,80,"Mehmet ❤️ Özlem'in küçük dünyası",21,'#776b7e');
  this.coinText=this.txt(620,40,'🪙 100',23,'#6b4d18');
  this.levelText=this.txt(82,40,'Lv. 1',22,'#5b4a75');
  this.xpBg=this.box(W/2,112,430,14,0xe9e2eb,1,null);
  this.xpFill=this.add.graphics();this.xpLabel=this.txt(W/2,112,'XP',12,'#5d5264');
  this.statusPanel=this.box(W/2,280,650,285,0xffffff,.96);
  this.statusTitle=this.txt(W/2,157,'Durum',19,'#5c5262');
  this.bars={};
  const stats=[['🍗','Açlık','hunger'],['😊','Mutluluk','happiness'],['⚡','Enerji','energy'],['🧼','Temizlik','cleanliness'],['❤️','Sevgi','love']];
  stats.forEach((s,i)=>{const y=205+i*43;this.txt(60,y,s[0]+' '+s[1],17,'#5c5262').setOrigin(0,.5);this.bars[s[2]]={y,bg:this.add.graphics(),fill:this.add.graphics(),label:this.txt(570,y,'0%',17,'#675b69').setOrigin(1,.5)};});
  this.moodText=this.txt(W/2,430,'😊 Mutlu',18,'#6b5b70');
  this.messageBox=this.box(W/2,486,560,58,0xffffff,.98);
  this.message=this.txt(W/2,486,'Mişa seni bekliyor ❤️',20,'#544858');
  this.petZone=this.add.rectangle(W/2,700,620,420,0xffffff,0).setInteractive();
  this.misa=this.add.image(W/2,735,'misa1').setOrigin(.5).setScale(.88).setInteractive({useHandCursor:true});
  this.misa.on('pointerdown',p=>this.petTap(p));
  this.accessoryHat=this.txt(W/2,540,'',48).setDepth(5);
  this.accessoryToy=this.txt(500,835,'',42).setDepth(5);
  const acts=[['🍖','Besle','feed'],['❤️','Sev','love'],['🎮','Oyna','play'],['🧼','Yıka','clean'],['💤','Uyu','sleep']];
  acts.forEach((a,i)=>{const x=80+i*140;const y=1020;const b=this.box(x,y,122,92,0xffffff,1).setInteractive();this.txt(x,y-15,a[0],30);this.txt(x,y+25,a[1],16,'#4f4554');b.on('pointerdown',()=>this.action(a[2]));});
  this.button(40,1145,115,58,'🎤 Konuş',()=>this.talk());
  this.button(165,1145,125,58,'🎮 Oyunlar',()=>this.openGames());
  this.button(300,1145,125,58,'🛍️ Mağaza',()=>this.openShop());
  this.button(435,1145,125,58,'📋 Görevler',()=>this.openMissions());
  this.button(570,1145,110,58,'🎁 Ödül',()=>this.claimDaily(),0xfff5df);
  this.resetBtn=this.button(W/2,1220,170,38,'Sıfırla',()=>this.reset());
 }
 redrawBar(k){const o=this.bars[k],v=clamp(state[k]);o.bg.clear();o.fill.clear();o.bg.fillStyle(0xeee8f0,1);o.fill.fillStyle(v<25?0xe88ba9:0xf0b5cf,1);o.bg.fillRoundedRect(105,o.y-9,400,18,9);if(v>0)o.fill.fillRoundedRect(105,o.y-9,400*(v/100),18,9);o.label.setText(Math.round(v)+'%');}
 refresh(){
  Object.keys(this.bars).forEach(k=>this.redrawBar(k));
  this.coinText.setText('🪙 '+state.coins);this.levelText.setText('Lv. '+state.level);
  const need=xpNeed(state.level),cur=state.xp;this.xpFill.clear();this.xpFill.fillStyle(0x9f8ad5,1);this.xpFill.fillRoundedRect(W/2-215,105,430*(cur/need),14,7);this.xpLabel.setText(`XP ${cur}/${need}`);
  const m=mood();this.moodText.setText(`${m[0]} ${m[1]}`);this.accessoryHat.setText(state.equipped.hat?SHOP.find(x=>x.id===state.equipped.hat)?.icon||'':'');this.accessoryToy.setText(state.equipped.toy?SHOP.find(x=>x.id===state.equipped.toy)?.icon||'':'');
 }
 setMsg(t){this.message.setText(t);this.tweens.add({targets:this.message,scale:1.04,duration:150,yoyo:true});}
 gainXP(n){state.xp+=n;let leveled=false;while(state.xp>=xpNeed(state.level)){state.xp-=xpNeed(state.level);state.level++;state.coins+=25;leveled=true;}if(leveled){this.setMsg('🎉 Seviye atladın! +25 🪙');this.sparkle();}this.checkAchievements();}
 action(type){if(this.busy||this.mode!=='home')return;let ok=true;this.busy=true;
  if(type==='feed'){state.hunger=clamp(state.hunger+22);state.happiness=clamp(state.happiness+5);state.missions.feed++;state.dailyMissions.feed++;this.gainXP(12);this.setMsg('😋 Mişa karnını doyurdu!');this.animate('eat');}
  else if(type==='love'){state.love=clamp(state.love+12);state.happiness=clamp(state.happiness+10);state.missions.love++;state.dailyMissions.love++;this.gainXP(10);this.setMsg('❤️ Mişa mırıldanıyor.');this.animate('love');}
  else if(type==='play'){if(state.energy<12){ok=false;this.setMsg('🥱 Mişa çok yorgun. Önce uyut!');}else{state.energy=clamp(state.energy-12);state.happiness=clamp(state.happiness+22);state.love=clamp(state.love+4);state.missions.play++;state.dailyMissions.play++;this.gainXP(16);this.setMsg('🎉 Mişa seninle oynuyor!');this.animate('play');}}
  else if(type==='clean'){state.cleanliness=clamp(state.cleanliness+30);state.happiness=clamp(state.happiness+5);state.missions.clean++;state.dailyMissions.clean++;this.gainXP(12);this.setMsg('🫧 Mişa mis gibi oldu!');this.animate('clean');}
  else if(type==='sleep'){state.energy=clamp(state.energy+35);state.happiness=clamp(state.happiness+3);this.gainXP(8);this.setMsg('💤 Mişa dinleniyor...');this.animate('sleep');}
  if(ok){saveState();this.refresh();this.checkAchievements();this.time.delayedCall(type==='sleep'?1900:1100,()=>{this.busy=false;this.startIdle();});}else this.busy=false;
 }
 startIdle(){if(this.mode!=='home'||!this.misa)return;if(this.idleTimer)this.idleTimer.remove();const seq=[1,2,3,4,5,6,7,8,7,6,5,4,3,2];let i=0;this.idleTimer=this.time.addEvent({delay:155,loop:true,callback:()=>{if(this.mode==='home'&&!this.busy)this.misa.setTexture('misa'+seq[i++%seq.length]);}});}
 animate(kind){if(this.idleTimer)this.idleTimer.remove();const b=this.misa; if(kind==='eat'){this.playFrames([2,3,4,3,2],150);this.floatIcon('🍖');}if(kind==='love'){this.tweens.add({targets:b,y:700,scale:.94,duration:160,yoyo:true,repeat:2});this.floatIcons('❤️');}if(kind==='play'){this.tweens.add({targets:b,y:650,angle:-6,duration:180,yoyo:true,repeat:4});this.floatIcons('⭐');}if(kind==='clean'){this.floatIcons('🫧');this.tweens.add({targets:b,angle:-4,duration:130,yoyo:true,repeat:6});}if(kind==='sleep'){this.playFrames([7,7,8,8,7],250);this.tweens.add({targets:b,alpha:.72,duration:450,yoyo:true,repeat:1});this.floatIcon('💤');}}
 playFrames(seq,delay){let i=0;this.time.addEvent({delay,repeat:seq.length-1,callback:()=>this.misa.setTexture('misa'+seq[i++])});}
 floatIcon(icon){const t=this.txt(this.misa.x+120,650,icon,34);this.tweens.add({targets:t,y:t.y-110,alpha:0,duration:800,onComplete:()=>t.destroy()});}
 floatIcons(icon){for(let i=0;i<5;i++){const t=this.txt(this.misa.x+(i-2)*35,610,icon,28);this.tweens.add({targets:t,y:t.y-100-Math.random()*50,x:t.x+(Math.random()-.5)*70,alpha:0,duration:900,delay:i*70,onComplete:()=>t.destroy()});}}
 petTap(p){if(this.busy||this.mode!=='home')return;const now=Date.now();this.tapTimes=this.tapTimes.filter(t=>now-t<750);this.tapTimes.push(now);const x=p.worldX||p.x,y=p.worldY||p.y;let msg='❤️ Mişa seni seviyor!';if(y<650){msg='😽 Kafasını sevdin!';state.love=clamp(state.love+4);state.happiness=clamp(state.happiness+3);this.floatIcons('❤️');}else if(x<275&&y>720){msg='😂 Kuyruğuna dokundun!';state.happiness=clamp(state.happiness+6);this.floatIcon('😂');}else if(y>790){msg='🐾 Patisine dokundun!';state.love=clamp(state.love+4);this.floatIcon('🐾');}else{msg='😹 Gıdıklandı!';state.happiness=clamp(state.happiness+5);this.floatIcons('✨');}if(this.tapTimes.length>=4){msg='😂 Tamam tamam, yeter!';state.happiness=clamp(state.happiness+8);this.tapTimes=[];this.tweens.add({targets:this.misa,angle:-8,duration:80,yoyo:true,repeat:7});}this.gainXP(3);saveState();this.refresh();this.setMsg(msg);}
 sparkle(){for(let i=0;i<12;i++){const t=this.txt(360+(Math.random()-.5)*300,700+(Math.random()-.5)*260,'⭐',20);this.tweens.add({targets:t,alpha:0,y:t.y-100,duration:900,delay:i*35,onComplete:()=>t.destroy()});}}

 liveDecay(){
  if(this.mode!=='home'||this.busy)return;
  state.hunger=clamp(state.hunger-.18);state.happiness=clamp(state.happiness-.12);state.energy=clamp(state.energy-.06);state.cleanliness=clamp(state.cleanliness-.10);state.love=clamp(state.love-.04);saveState();this.refresh();
  if(state.hunger<20)this.setMsg('🍗 Mişa acıkmaya başladı.');
  else if(state.energy<20)this.setMsg('💤 Mişa uykulu görünüyor.');
 }
 talk(){
  if(this.busy||this.mode!=='home')return;
  const phrases=['Miyav! 😺','Mehmet, biraz sevgi istiyorum! ❤️','Özlem nerede? 😸','Bugün çok mutluyum! ✨','Biraz oyun oynayalım mı? 🎮','Karnım acıkmadı ama mama güzel olur. 🍖'];
  const phrase=phrases[Math.floor(Math.random()*phrases.length)];this.setMsg('🗣️ Mişa: '+phrase);window.misaSpeak(phrase);this.floatIcons('💬');
  if(window.SpeechRecognition||window.webkitSpeechRecognition){this.setMsg('🎤 Dinliyorum...');window.misaListen().then(text=>{this.setMsg('🗣️ '+text);window.misaSpeak(text);state.happiness=clamp(state.happiness+3);state.love=clamp(state.love+2);this.gainXP(2);saveState();this.refresh();}).catch(()=>{this.setMsg('🎤 Mikrofon kullanılamadı.');});}
 }

 setupDaily(){if(state.dailyDate!==today()){state.dailyDate=today();state.dailyClaimed=false;state.dailyMissions={feed:0,love:0,play:0,clean:0};saveState();}}
 claimDaily(){if(state.dailyClaimed){this.setMsg('🎁 Bugünkü ödülünü zaten aldın.');return}state.dailyClaimed=true;state.coins+=50;state.happiness=clamp(state.happiness+10);saveState();this.refresh();this.setMsg('🎁 Günlük ödül: +50 🪙');this.sparkle();}
 checkAchievements(){ACH.forEach(a=>{if(!state.achievements.includes(a[0])&&a[2](state)){state.achievements.push(a[0]);state.coins+=40;this.setMsg('🏆 Başarım: '+a[1]+' • +40 🪙');saveState();}});}
 overlayBase(title){if(this.overlay)this.closeOverlay();this.mode='overlay';if(this.idleTimer)this.idleTimer.remove();const shade=this.add.rectangle(W/2,H/2,W,H,0x2f2738,.92).setDepth(20);const panel=this.box(W/2,650,640,1080,0xfffbfe,1,0xe7dbe8).setDepth(21);const t=this.txt(W/2,150,title,30,'#3e3445').setDepth(22);const close=this.txt(620,150,'✕',28,'#6f5d72').setDepth(22).setInteractive();close.on('pointerdown',()=>this.closeOverlay());this.overlay={shade,panel,t,close,items:[]};return this.overlay;}
 addOverlayText(x,y,text,size=18,color='#514657'){const o=this.txt(x,y,text,size,color).setDepth(22);this.overlay.items.push(o);return o}
 closeOverlay(){if(!this.overlay)return;Object.values(this.overlay).forEach(v=>{if(Array.isArray(v))v.forEach(o=>o.destroy());else if(v?.destroy)v.destroy();});this.overlay=null;this.mode='home';this.startIdle();this.refresh();}
 openGames(){const o=this.overlayBase('🎮 Mini Oyunlar');this.addOverlayText(360,235,'Mişa ile oynayarak coin ve XP kazan!',19);this.overlayButton(360,340,500,90,'🎈 Balon Avı',()=>this.startBalloonGame());this.overlayButton(360,460,500,90,'🐟 Balık Yakala',()=>this.startTargetGame('🐟','Balık Avı'));this.overlayButton(360,580,500,90,'⭐ Yıldız Topla',()=>this.startTargetGame('⭐','Yıldız Topla'));this.addOverlayText(360,760,`🏆 En yüksek skor: ${state.highScore}`,18);}
 overlayButton(x,y,w,h,label,fn){const b=this.box(x,y,w,h,0xffffff,1,0xe5dce8).setDepth(22).setInteractive();this.addOverlayText(x,y,label,21);b.on('pointerdown',fn);this.overlay.items.push(b);return b;}
 startBalloonGame(){if(this.overlay){this.closeOverlay();}this.mode='mini';if(this.idleTimer)this.idleTimer.remove();this.misa.setVisible(false);this.hideHome(true);this.miniObjects=[];this.miniScore=0;this.miniTime=20;this.miniShade=this.add.rectangle(W/2,H/2,W,H,0x3f3552,.97).setDepth(30);this.miniTitle=this.txt(W/2,150,'🎈 MİŞA BALON AVI',34,'#fff').setDepth(31);this.miniScoreText=this.txt(W/2,220,'Skor: 0',25,'#fff').setDepth(31);this.miniTimeText=this.txt(W/2,260,'20',24,'#fff').setDepth(31);this.miniClose=this.txt(360,1140,'✕ Oyundan çık',19,'#fff').setDepth(31).setInteractive();this.miniClose.on('pointerdown',()=>this.endMini(false));this.spawnBalloon();this.miniTimer=this.time.addEvent({delay:1000,repeat:19,callback:()=>{this.miniTime--;this.miniTimeText.setText(String(this.miniTime));}});this.time.delayedCall(20000,()=>this.endMini(true));}
 spawnBalloon(){if(this.mode!=='mini')return;const x=70+Math.random()*580,y=380+Math.random()*620;const b=this.add.circle(x,y,40,[0xff8fb3,0x8dc9ff,0xffd66e,0x9ee6b0,0xb99cff][Math.floor(Math.random()*5)]).setDepth(32).setInteractive();const e=this.txt(x,y,'🎈',28).setDepth(33);this.miniObjects.push(b,e);b.on('pointerdown',()=>{if(this.mode!=='mini')return;this.miniScore++;this.miniScoreText.setText('Skor: '+this.miniScore);b.destroy();e.destroy();this.spawnBalloon();});this.time.delayedCall(1600,()=>{if(b.active){b.destroy();e.destroy();this.spawnBalloon();}});}
 startTargetGame(icon,title){this.closeOverlay();this.mode='mini';this.hideHome(true);this.misa.setVisible(false);this.miniScore=0;this.miniTime=20;this.miniShade=this.add.rectangle(W/2,H/2,W,H,0x314255,.97).setDepth(30);this.miniTitle=this.txt(W/2,150,'🎯 '+title,34,'#fff').setDepth(31);this.miniScoreText=this.txt(W/2,220,'Skor: 0',25,'#fff').setDepth(31);this.miniTimeText=this.txt(W/2,260,'20',24,'#fff').setDepth(31);this.miniClose=this.txt(360,1140,'✕ Oyundan çık',19,'#fff').setDepth(31).setInteractive();this.miniClose.on('pointerdown',()=>this.endMini(false));this.targetIcon=icon;this.spawnTarget();this.miniTimer=this.time.addEvent({delay:1000,repeat:19,callback:()=>{this.miniTime--;this.miniTimeText.setText(String(this.miniTime));}});this.time.delayedCall(20000,()=>this.endMini(true));}
 spawnTarget(){if(this.mode!=='mini')return;const x=60+Math.random()*600,y=380+Math.random()*620;const t=this.txt(x,y,this.targetIcon,54).setDepth(32).setInteractive();this.miniObjects.push(t);t.on('pointerdown',()=>{if(this.mode!=='mini')return;this.miniScore++;this.miniScoreText.setText('Skor: '+this.miniScore);t.destroy();this.spawnTarget();});this.time.delayedCall(1300,()=>{if(t.active){t.destroy();this.spawnTarget();}});}
 endMini(reward){if(this.mode!=='mini')return;this.time.removeAllEvents();this.miniObjects.forEach(o=>o.destroy());this.miniObjects=[];[this.miniShade,this.miniTitle,this.miniScoreText,this.miniTimeText,this.miniClose].forEach(o=>o?.destroy());if(reward){const coins=Math.min(80,10+this.miniScore*2);state.coins+=coins;state.happiness=clamp(state.happiness+Math.min(25,this.miniScore));state.energy=clamp(state.energy-5);this.gainXP(this.miniScore*3);state.highScore=Math.max(state.highScore,this.miniScore);saveState();this.setMsg(`🏆 Oyun bitti! +${coins} 🪙`);}this.mode='home';this.hideHome(false);this.misa.setVisible(true);this.startIdle();this.refresh();}
 hideHome(hide){const names=['title','subtitle','coinText','levelText','xpBg','xpFill','xpLabel','statusPanel','statusTitle','moodText','messageBox','message','petZone','accessoryHat','accessoryToy','resetBtn',...Object.values(this.bars).flatMap(o=>[o.bg,o.fill,o.label])];this.children.list.forEach(o=>{if(names.includes(o))o.setVisible(!hide);});this.buttonsHidden=this.buttonsHidden||[];}
 openShop(){const o=this.overlayBase('🛍️ Mişa Mağazası');this.addOverlayText(360,215,'Coinlerini aksesuarlar için kullan.',18);SHOP.forEach((item,i)=>{const rowY=300+i*105;const owned=state.owned.includes(item.id);this.addOverlayText(160,rowY,item.icon,36);this.addOverlayText(310,rowY,item.name,18,'#4f4554');const price=owned?'SAHİP':`🪙 ${item.price}`;const b=this.box(535,rowY,150,58,owned?0xe9f5e9:0xffffff,1,0xe5dce8).setDepth(22).setInteractive();this.addOverlayText(535,rowY,price,16,owned?'#397044':'#6b4d18');b.on('pointerdown',()=>this.buyOrEquip(item));this.overlay.items.push(b);});}
 buyOrEquip(item){if(state.owned.includes(item.id)){state.equipped[item.type]=state.equipped[item.type]===item.id?'':item.id;saveState();this.refresh();this.openShop();return}if(state.coins<item.price){this.setMsg('🪙 Yeterli coin yok.');return}state.coins-=item.price;state.owned.push(item.id);state.equipped[item.type]=item.id;saveState();this.refresh();this.setMsg(`${item.icon} ${item.name} alındı!`);this.openShop();}
 openMissions(){const o=this.overlayBase('📋 Görevler & Başarımlar');this.addOverlayText(360,215,'Bugün yaptıkların:',18);const ms=[['🍖','Besle',state.dailyMissions.feed],['❤️','Sev',state.dailyMissions.love],['🎮','Oyna',state.dailyMissions.play],['🧼','Yıka',state.dailyMissions.clean]];ms.forEach((m,i)=>{this.addOverlayText(170,300+i*65,`${m[0]} ${m[1]}`,18);this.addOverlayText(540,300+i*65,`${m[2]} kez`,18,'#6d5aa8');});this.addOverlayText(360,600,'🏆 Başarımlar',22,'#4b3d54');ACH.forEach((a,i)=>{const unlocked=state.achievements.includes(a[0]);this.addOverlayText(150,670+i*70,unlocked?'🏆':'🔒',24);this.addOverlayText(220,670+i*70,a[1],18,unlocked?'#4b7a52':'#625767');this.addOverlayText(500,670+i*70,unlocked?'AÇILDI':'Kilitli',15,unlocked?'#4b7a52':'#8d818f');});}
 reset(){if(confirm('Mişa’yı ve tüm ilerlemeyi sıfırlamak istediğine emin misin?')){localStorage.removeItem(SAVE_KEY);location.reload();}}
}
new Phaser.Game({type:Phaser.AUTO,parent:'game',width:W,height:H,backgroundColor:'#fff7fb',scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH,width:W,height:H},render:{antialias:true,roundPixels:false},input:{activePointers:3},scene:[HomeScene]});

// Small browser-level helpers: voice and microphone are exposed through touch-friendly global hooks.
window.misaSpeak=function(text){try{if('speechSynthesis'in window){speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.lang='tr-TR';u.rate=.95;u.pitch=1.45;speechSynthesis.speak(u);}}catch{}};
window.misaListen=function(){const SR=window.SpeechRecognition||window.webkitSpeechRecognition;if(!SR)return Promise.reject(new Error('Tarayıcı konuşma tanımayı desteklemiyor.'));return new Promise((resolve,reject)=>{const r=new SR();r.lang='tr-TR';r.interimResults=false;r.maxAlternatives=1;r.onresult=e=>resolve(e.results[0][0].transcript);r.onerror=reject;r.start();});};
