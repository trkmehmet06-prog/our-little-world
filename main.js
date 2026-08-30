const W=720,H=1280;
const KEY='misa-final-v1';
const clamp=(v,a=0,b=100)=>Math.max(a,Math.min(b,v));
const defaults={hunger:78,happiness:82,energy:76,cleanliness:86,love:70,coins:100,xp:0,level:1,last:Date.now(),dailyDate:'',dailyClaimed:false,highScore:0};
function loadState(){try{const s=JSON.parse(localStorage.getItem(KEY));return {...defaults,...s};}catch{return {...defaults}}}
function saveState(){state.last=Date.now();localStorage.setItem(KEY,JSON.stringify(state));}
let state=loadState();
// Time decay while away: deliberately gentle so the pet never becomes unusable.
(()=>{const mins=Math.max(0,(Date.now()-state.last)/60000);const ticks=Math.min(720,Math.floor(mins/12));if(ticks){state.hunger=clamp(state.hunger-ticks*.55);state.happiness=clamp(state.happiness-ticks*.35);state.energy=clamp(state.energy-ticks*.18);state.cleanliness=clamp(state.cleanliness-ticks*.3);state.love=clamp(state.love-ticks*.12);saveState();}})();
const frames=Array.from({length:8},(_,i)=>`misa${i+1}`);
class HomeScene extends Phaser.Scene{
 constructor(){super('HomeScene');this.busy=false;this.mode='idle';this.idleIndex=0;this.tapTimes=[];this.mini=false;}
 preload(){frames.forEach((k,i)=>this.load.image(k,`assets/misa/misa_idle_0${i+1}.png`));}
 create(){
  this.cameras.main.setBackgroundColor('#fff7fb');
  this.add.rectangle(W/2,H/2,W,H,0xfff7fb);
  this.drawUI();
  this.misa=this.add.image(W/2,610,'misa1').setOrigin(.5).setScale(.88).setInteractive({useHandCursor:true});
  this.misa.on('pointerdown',p=>this.petTap(p));
  this.startIdle();
  this.refresh();
  this.events.on('shutdown',()=>{});
 }
 txt(x,y,t,size,color='#342b3b',style='bold'){return this.add.text(x,y,t,{fontFamily:'Arial',fontSize:size+'px',color,fontStyle:style}).setOrigin(.5)}
 rounded(x,y,w,h,color,alpha=1){return this.add.rectangle(x,y,w,h,color,alpha).setOrigin(.5)}
 drawUI(){
  this.txt(W/2,42,'🐱  MİŞA',44,'#2e2638');
  this.txt(W/2,88,"Mehmet ❤️ Özlem'in küçük dünyası",23,'#776b7e');
  this.coinText=this.txt(590,48,'🪙 100',25,'#6b4d18');
  this.levelText=this.txt(90,48,'Lv. 1',24,'#5b4a75');
  // Status panel
  this.rounded(W/2,200,650,225,0xffffff,.94).setStrokeStyle(2,0xeadfeb,1);
  const stats=[['🍗','Açlık','hunger'],['😊','Mutluluk','happiness'],['⚡','Enerji','energy'],['🧼','Temizlik','cleanliness'],['❤️','Sevgi','love']];
  this.bars={}; this.barY={}; this.barBg=this.add.graphics(); this.barFill=this.add.graphics(); stats.forEach((s,i)=>{const y=120+i*40;this.txt(62,y,s[0]+' '+s[1],18,'#5c5262').setOrigin(0,.5);this.barY[s[2]]=y;this.bars[s[2]+'_label']=this.txt(370,y,'0%',17,'#675b69').setOrigin(0,.5);}); this.redrawBars();
  this.bubble=this.rounded(W/2,388,570,64,0xffffff,.98).setStrokeStyle(2,0xeee1ea,1);this.message=this.txt(W/2,388,'Mişa seni bekliyor ❤️',21,'#544858');
  // Action buttons
  this.buttons=[];const acts=[['🍖','Besle','feed'],['❤️','Sev','love'],['🎮','Oyna','play'],['🧼','Yıka','clean'],['💤','Uyu','sleep']];
  acts.forEach((a,i)=>{const x=90+i*135;const bg=this.rounded(x,1000,116,92,0xffffff).setStrokeStyle(2,0xeadfeb,1).setInteractive();this.txt(x,983,a[0],31);this.txt(x,1021,a[1],17,'#4f4554');bg.on('pointerdown',()=>this.action(a[2]));this.buttons.push(bg);});
  const mini=this.rounded(W/2,1125,370,64,0x6d5aa8).setInteractive();this.txt(W/2,1125,'🎈  MİŞA İLE OYNA — Mini Oyun',20,'#ffffff');mini.on('pointerdown',()=>this.startMini());
  const reset=this.rounded(W/2,1200,220,42,0xffffff).setStrokeStyle(1,0xe5dce8,1).setInteractive();this.txt(W/2,1200,'Sıfırla',16,'#8b7d8e');reset.on('pointerdown',()=>this.reset());
  this.xpBg=this.rounded(W/2,108,430,13,0xe9e2eb);this.xpBar=this.rounded(W/2-215,108,430,13,0x9f8ad5).setOrigin(0,0.5);this.xpLabel=this.txt(W/2,108,'XP',12,'#5d5264');
 }
 redrawBars(){
  const names=['hunger','happiness','energy','cleanliness','love'];
  this.barBg.clear(); this.barFill.clear();
  this.barBg.fillStyle(0xeee8f0,1); this.barFill.fillStyle(0xf0b5cf,1);
  names.forEach(k=>{const y=this.barY[k]; const v=clamp(state[k]); this.barBg.fillRoundedRect(75,y-9,280,18,9); if(v>0)this.barFill.fillRoundedRect(75,y-9,280*(v/100),18,9); this.bars[k+'_label'].setText(Math.round(v)+'%').setX(370);});
 }
 refresh(){
  this.redrawBars();
  this.coinText.setText('🪙 '+state.coins);this.levelText.setText('Lv. '+state.level);const need=100+state.level*35;const cur=state.xp%need;this.xpBar.displayWidth=430*(cur/need);this.xpBar.x=W/2-215;this.xpLabel.setText(`XP ${cur}/${need}`);
 }
 setMsg(t){this.message.setText(t);this.tweens.add({targets:this.message,scale:1.05,duration:100,yoyo:true});}
 gainXP(n){const before=state.level;state.xp+=n;while(state.xp>=100+state.level*35){state.xp-=100+state.level*35;state.level++;state.coins+=25;this.levelUp();}if(state.level>before)this.setMsg('🎉 Mişa seviye atladı! +25 🪙');}
 levelUp(){const burst=this.add.text(W/2,520,'⭐ SEVİYE ATLADI! ⭐',{fontFamily:'Arial',fontSize:'34px',color:'#7b5fb1',fontStyle:'bold'}).setOrigin(.5);this.tweens.add({targets:burst,y:470,alpha:0,duration:1400,onComplete:()=>burst.destroy()});}
 spendCoin(n){if(state.coins<n){this.setMsg('🪙 Biraz daha coin kazanmalısın.');return false}state.coins-=n;return true}
 action(type){if(this.busy)return;this.busy=true;let ok=true;
  if(type==='feed'){state.hunger=clamp(state.hunger+22);state.happiness=clamp(state.happiness+5);this.gainXP(12);this.setMsg('😋 Mişa karnını doyurdu!');this.animatePet('eat');}
  if(type==='love'){state.love=clamp(state.love+12);state.happiness=clamp(state.happiness+10);this.gainXP(10);this.setMsg('❤️ Mişa sevildi ve mırıldanıyor.');this.animatePet('love');}
  if(type==='play'){if(state.energy<12){this.setMsg('🥱 Mişa çok yorgun. Önce uyut!');ok=false;}else{state.energy=clamp(state.energy-12);state.happiness=clamp(state.happiness+22);state.love=clamp(state.love+4);this.gainXP(16);this.setMsg('🎉 Mişa seninle oynuyor!');this.animatePet('play');}}
  if(type==='clean'){state.cleanliness=clamp(state.cleanliness+30);state.happiness=clamp(state.happiness+5);this.gainXP(12);this.setMsg('🫧 Mişa mis gibi oldu!');this.animatePet('clean');}
  if(type==='sleep'){state.energy=clamp(state.energy+35);state.happiness=clamp(state.happiness+3);this.gainXP(8);this.setMsg('💤 Mişa biraz dinleniyor...');this.animatePet('sleep');}
  if(ok){saveState();this.refresh();}else{this.busy=false;return}
  this.time.delayedCall(type==='sleep'?1900:1100,()=>{this.busy=false;this.startIdle();});
 }
 startIdle(){if(this.mini)return;this.mode='idle';if(this.idleTimer)this.idleTimer.remove();const seq=[1,2,3,4,5,6,7,8,7,6,5,4,3,2];let i=0;this.idleTimer=this.time.addEvent({delay:150,loop:true,callback:()=>{if(this.mode==='idle'&&!this.busy)this.misa.setTexture('misa'+seq[i++%seq.length]);}});}
 animatePet(kind){if(this.idleTimer)this.idleTimer.remove();this.mode=kind;const base=this.misa;
  if(kind==='eat'){const seq=[2,3,4,3,2];this.playFrames(seq,170);}
  if(kind==='love'){this.tweens.add({targets:base,y:580,scale:.96,duration:180,yoyo:true,repeat:2});this.hearts();}
  if(kind==='play'){this.tweens.add({targets:base,y:530,angle:-5,duration:220,yoyo:true,repeat:3});this.hearts('⭐');}
  if(kind==='clean'){this.bubbles();this.tweens.add({targets:base,angle:-3,duration:140,yoyo:true,repeat:5});}
  if(kind==='sleep'){this.playFrames([7,7,7,8,8,7],250);this.tweens.add({targets:base,alpha:.72,duration:450,yoyo:true,repeat:1});}
 }
 playFrames(seq,delay){let i=0;this.time.addEvent({delay,repeat:seq.length-1,callback:()=>this.misa.setTexture('misa'+seq[i++])});}
 hearts(icon='❤️'){for(let i=0;i<5;i++){const t=this.add.text(this.misa.x+(i-2)*35,520,icon,{fontSize:'30px'}).setOrigin(.5);this.tweens.add({targets:t,y:t.y-100-Math.random()*60,x:t.x+(Math.random()-.5)*70,alpha:0,duration:900,delay:i*70,onComplete:()=>t.destroy()});}}
 bubbles(){for(let i=0;i<7;i++){const t=this.add.text(this.misa.x+(Math.random()-.5)*180,560+(Math.random()-.5)*100,'🫧',{fontSize:'28px'}).setOrigin(.5);this.tweens.add({targets:t,y:t.y-150,x:t.x+(Math.random()-.5)*60,alpha:0,duration:1000,delay:i*80,onComplete:()=>t.destroy()});}}
 petTap(p){if(this.busy||this.mini)return;const now=Date.now();this.tapTimes=this.tapTimes.filter(t=>now-t<700);this.tapTimes.push(now);let msg='❤️ Mişa seni seviyor!';if(this.tapTimes.length>=4){msg='😂 Gıdıklama yeter!';this.tapTimes=[];state.happiness=clamp(state.happiness+8);this.gainXP(8);this.tickle();}else{state.love=clamp(state.love+3);state.happiness=clamp(state.happiness+4);this.gainXP(3);this.hearts();}saveState();this.refresh();this.setMsg(msg);}
 tickle(){this.busy=true;this.tweens.add({targets:this.misa,angle:-8,duration:90,yoyo:true,repeat:7});this.time.delayedCall(1000,()=>{this.busy=false;this.startIdle();});}
 startMini(){if(this.mini)return;this.mini=true;this.mode='mini';if(this.idleTimer)this.idleTimer.remove();this.children.list.filter(o=>o!==this.misa).forEach(o=>o.setVisible(false));this.misa.setVisible(false);this.add.rectangle(W/2,H/2,W,H,0x3f3552,.97).setDepth(10);this.add.text(W/2,190,'🎈 MİŞA BALON AVI',{fontFamily:'Arial',fontSize:'42px',color:'#fff',fontStyle:'bold'}).setOrigin(.5).setDepth(11);this.add.text(W/2,245,'20 saniyede mümkün olduğunca çok balon patlat!',{fontFamily:'Arial',fontSize:'20px',color:'#eee',fontStyle:'bold'}).setOrigin(.5).setDepth(11);this.score=0;this.scoreText=this.add.text(W/2,315,'Skor: 0',{fontFamily:'Arial',fontSize:'30px',color:'#fff',fontStyle:'bold'}).setOrigin(.5).setDepth(11);this.timerText=this.add.text(W/2,360,'20', {fontFamily:'Arial',fontSize:'28px',color:'#fff'}).setOrigin(.5).setDepth(11);this.closeMini=this.add.text(W/2,1150,'✕ Oyundan çık',{fontFamily:'Arial',fontSize:'20px',color:'#fff',fontStyle:'bold'}).setOrigin(.5).setDepth(11).setInteractive();this.closeMini.on('pointerdown',()=>this.endMini(false));this.spawnBalloon();this.miniTimer=this.time.addEvent({delay:1000,repeat:19,callback:()=>{this.timerText.setText(String(19-this.miniTimer.repeatCount));}});this.time.delayedCall(20000,()=>this.endMini(true));}
 spawnBalloon(){if(!this.mini)return;const x=70+Math.random()*580,y=480+Math.random()*480;const colors=[0xff8fb3,0x8dc9ff,0xffd66e,0x9ee6b0,0xb99cff];const b=this.add.circle(x,y,42,colors[Math.floor(Math.random()*colors.length)],1).setDepth(12).setInteractive();b.setStrokeStyle(4,0xffffff,.8);this.add.text(x,y,'🎈',{fontSize:'30px'}).setOrigin(.5).setDepth(13);const label=this.add.text(x,y,'',{fontSize:'1px'}).setOrigin(.5).setDepth(13);b.on('pointerdown',()=>{if(!this.mini)return;this.score++;this.scoreText.setText('Skor: '+this.score);this.tweens.add({targets:[b,label],scale:1.7,alpha:0,duration:120,onComplete:()=>{b.destroy();label.destroy();}});this.spawnBalloon();});this.time.delayedCall(1700,()=>{if(b.active){b.destroy();label.destroy();this.spawnBalloon();}});}
 endMini(reward){if(!this.mini)return;this.mini=false;this.time.removeAllEvents();this.children.list.filter(o=>o.depth>=10).forEach(o=>o.destroy());if(reward){const coins=Math.min(60,10+this.score*2);state.coins+=coins;state.happiness=clamp(state.happiness+Math.min(25,this.score));this.gainXP(this.score*3);state.highScore=Math.max(state.highScore,this.score);saveState();}this.scene.restart();}
 reset(){if(confirm('Mişa\'yı ve tüm ilerlemeyi sıfırlamak istediğine emin misin?')){localStorage.removeItem(KEY);location.reload();}}
}
new Phaser.Game({type:Phaser.AUTO,parent:'game',width:W,height:H,backgroundColor:'#fff7fb',scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH,width:W,height:H},render:{antialias:true,roundPixels:false},input:{activePointers:3},scene:[HomeScene]});
