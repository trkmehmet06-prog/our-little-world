const W=720,H=1280;
const SAVE_KEY="misa_v1_save";
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const defaultState=()=>({hunger:78, happiness:82, energy:76, clean:86, love:70, xp:0, level:1, coins:120, last:Date.now()});
function loadState(){
  try{
    const s=JSON.parse(localStorage.getItem(SAVE_KEY)||"null");
    const x=Object.assign(defaultState(),s||{});
    const hours=Math.min(24,(Date.now()-(x.last||Date.now()))/3600000);
    x.hunger=clamp(x.hunger-hours*4,0,100);
    x.happiness=clamp(x.happiness-hours*2,0,100);
    x.energy=clamp(x.energy-hours*1.5,0,100);
    x.clean=clamp(x.clean-hours*2.2,0,100);
    x.love=clamp(x.love-hours*1.2,0,100);
    x.last=Date.now(); return x;
  }catch{return defaultState()}
}
const state=loadState();
function save(){state.last=Date.now();localStorage.setItem(SAVE_KEY,JSON.stringify(state))}
function addXP(scene,n){
  state.xp+=n;
  const need=100+(state.level-1)*60;
  if(state.xp>=need){state.xp-=need;state.level++;state.coins+=50;scene.floatText("⭐ LEVEL "+state.level+"!",W/2,300)}
  save(); scene.refreshUI();
}
class HomeScene extends Phaser.Scene{
  constructor(){super("HomeScene")}
  preload(){
    for(let i=1;i<=8;i++){
      const n=String(i).padStart(2,"0");
      this.load.image(`misa${i}`,`assets/misa/idle/misa_idle_${n}.png`);
    }
  }
  create(){
    this.cameras.main.setBackgroundColor("#fff6fb");
    this.buildBackground();
    this.buildUI();
    this.createMisa();
    this.createButtons();
    this.refreshUI();
    this.scheduleNeeds();
    this.say("Merhaba! Ben Mişa ❤️");
  }
  buildBackground(){
    this.add.rectangle(W/2,H/2,W,H,0xfff6fb);
    this.add.rectangle(W/2,500,650,790,0xf7efff).setStrokeStyle(5,0xffffff,1);
    this.add.rectangle(W/2,1035,650,260,0xeee4f3);
    this.add.ellipse(W/2,940,520,130,0xded2e8,.7);
    this.add.rectangle(W/2,760,650,350,0xfffbff,.45);
    this.add.text(360,42,"🐱 MİŞA",{fontFamily:"Arial",fontSize:"48px",color:"#29243a",fontStyle:"bold"}).setOrigin(.5);
    this.add.text(360,92,"Mehmet ❤️ Özlem'in küçük dünyası",{fontFamily:"Arial",fontSize:"23px",color:"#756a83",fontStyle:"bold"}).setOrigin(.5);
  }
  buildUI(){
    this.ui={};
    const pill=(x,y,label,color)=>{
      this.add.rectangle(x,y,190,54,0xffffff,.95).setStrokeStyle(2,0xe8dce9,1);
      this.add.text(x-76,y-14,label,{fontFamily:"Arial",fontSize:"18px",color:"#5a5060",fontStyle:"bold"});
      const bar=this.add.rectangle(x+25,y+8,78,10,0xe9e0eb).setOrigin(.5);
      const fill=this.add.rectangle(x-14,y+8,78,10,color).setOrigin(.5);
      this.ui[label]={fill,bar};
    };
    pill(120,145,"🍗 Açlık",0xff9f9f); pill(360,145,"😊 Mutluluk",0xffc76d); pill(600,145,"⚡ Enerji",0x7db8ff);
    pill(120,215,"🧼 Temizlik",0x75d6b2); pill(360,215,"❤️ Sevgi",0xff7fa8e8);
    this.levelText=this.add.text(600,205,"Lv. 1",{fontFamily:"Arial",fontSize:"24px",color:"#4b4055",fontStyle:"bold"}).setOrigin(.5);
    this.xpText=this.add.text(600,232,"XP 0 / 100",{fontFamily:"Arial",fontSize:"15px",color:"#756a83"}).setOrigin(.5);
    this.msg=this.add.text(360,340,"Mişa seni bekliyor ❤️",{fontFamily:"Arial",fontSize:"25px",color:"#4b4055",backgroundColor:"#ffffff",padding:{left:22,right:22,top:13,bottom:13}}).setOrigin(.5);
    this.coinText=this.add.text(55,1120,"🪙 120",{fontFamily:"Arial",fontSize:"25px",color:"#4b4055",fontStyle:"bold"});
  }
  createMisa(){
    this.misa=this.add.image(360,700,"misa1").setOrigin(.5).setScale(1.02).setInteractive({useHandCursor:true});
    // The source frames share the exact same 384x384 canvas and centered subject,
    // so texture swaps do not change the character's anchor.
    this.seq=[1,2,3,4,5,6,7,8,7,6,5,4,3,2]; this.frame=0;
    this.animTimer=this.time.addEvent({delay:115,loop:true,callback:()=>{
      this.frame=(this.frame+1)%this.seq.length;
      this.misa.setTexture("misa"+this.seq[this.frame]);
    }});
    this.misa.on("pointerdown",p=>this.handlePet(p));
    this.input.on("pointerdown",p=>{
      if(p.x>70&&p.x<650&&p.y>430&&p.y<970 && !this.isButtonArea(p)){ this.handlePet(p) }
    });
  }
  isButtonArea(p){return p.y>1050}
  handlePet(p){
    if(this.busy)return;
    const localX=p.x, localY=p.y;
    let type="love", text="Miyaaa! ❤️";
    if(localY<610){type="head";text="Başımı sevmen çok güzel! 😽";state.happiness=clamp(state.happiness+4,0,100);state.love=clamp(state.love+5,0,100)}
    else if(localY>800){type="belly";text="Hahaha! Karnım gıdıklandı! 😂";state.happiness=clamp(state.happiness+7,0,100)}
    else if(localX<270){type="paw";text="Patimi yakaladın! 🐾";state.happiness=clamp(state.happiness+5,0,100)}
    else if(localX>470){type="tail";text="Hey! Kuyruğum! 😾";state.happiness=clamp(state.happiness-2,0,100)}
    else{state.love=clamp(state.love+4,0,100);state.happiness=clamp(state.happiness+3,0,100)}
    this.msg.setText(text); this.floatText("❤️ +"+(type==="tail"?"0":"1"),360,510);
    this.tweens.add({targets:this.misa,scaleX:1.08,scaleY:.97,duration:100,yoyo:true,ease:"Sine.easeOut"});
    this.say(type==="tail"?"Hey!":"Miyaaa!");
    addXP(this,3); save(); this.refreshUI();
  }
  createButtons(){
    const buttons=[
      [105,1185,"🍖","Yemek",()=>this.feed()],
      [235,1185,"❤️","Sev",()=>this.love()],
      [365,1185,"🧼","Yıka",()=>this.wash()],
      [495,1185,"💤","Uyu",()=>this.sleep()],
      [615,1185,"🎮","Oyna",()=>this.play()]
    ];
    buttons.forEach(([x,y,icon,label,fn])=>{
      const c=this.add.container(x,y);
      const bg=this.add.rectangle(0,0,104,118,0xffffff).setStrokeStyle(3,0xe8dce9,1).setInteractive();
      c.add(bg); c.add(this.add.text(0,-27,icon,{fontSize:"36px"}).setOrigin(.5)); c.add(this.add.text(0,25,label,{fontFamily:"Arial",fontSize:"17px",color:"#4b4055",fontStyle:"bold"}).setOrigin(.5));
      bg.on("pointerdown",fn);
    });
  }
  action(kind){
    if(this.busy)return false; this.busy=true;
    this.time.delayedCall(750,()=>this.busy=false); return true;
  }
  feed(){
    if(!this.action())return;
    if(state.coins<5){this.msg.setText("Mama almak için 5 coin lazım 🪙");return}
    state.coins-=5; state.hunger=clamp(state.hunger+20,0,100); state.happiness=clamp(state.happiness+3,0,100);
    this.msg.setText("Mmm, çok lezzetli! 🍖"); this.floatText("🍖 +20 Açlık",360,520); addXP(this,8); save(); this.refreshUI(); this.say("Mmm çok güzel!");
  }
  love(){
    if(!this.action())return;
    state.love=clamp(state.love+12,0,100); state.happiness=clamp(state.happiness+8,0,100);
    this.msg.setText("Mişa sevgini hissediyor ❤️"); this.floatText("❤️ +12 Sevgi",360,520); addXP(this,6); save(); this.refreshUI(); this.say("Seni seviyorum!");
  }
  wash(){
    if(!this.action())return;
    state.clean=clamp(state.clean+25,0,100); state.happiness=clamp(state.happiness+2,0,100);
    this.msg.setText("Pırıl pırıl oldum! ✨"); this.floatText("🧼 +25 Temizlik",360,520); addXP(this,7); save(); this.refreshUI(); this.say("Mis gibi oldum!");
  }
  sleep(){
    if(!this.action())return;
    state.energy=clamp(state.energy+25,0,100); state.happiness=clamp(state.happiness+2,0,100);
    this.msg.setText("Zzz... Zzz... 💤"); this.floatText("⚡ +25 Enerji",360,520); addXP(this,7); save(); this.refreshUI(); this.say("Zzz...");
  }
  play(){
    if(!this.action())return;
    if(state.energy<10){this.msg.setText("Çok yoruldum, biraz uyuyalım 💤");return}
    state.energy=clamp(state.energy-8,0,100); state.happiness=clamp(state.happiness+15,0,100); state.coins+=8;
    this.msg.setText("Oyun çok eğlenceliydi! 🎮"); this.floatText("🪙 +8",360,520); addXP(this,12); save(); this.refreshUI();
    this.tweens.add({targets:this.misa,y:670,duration:180,yoyo:true,repeat:2,ease:"Quad.easeOut"});
  }
  scheduleNeeds(){
    this.time.addEvent({delay:60000,loop:true,callback:()=>{
      state.hunger=clamp(state.hunger-.4,0,100); state.happiness=clamp(state.happiness-.2,0,100);
      state.energy=clamp(state.energy-.15,0,100); state.clean=clamp(state.clean-.25,0,100); state.love=clamp(state.love-.12,0,100);
      save(); this.refreshUI();
    }});
  }
  refreshUI(){
    const vals={ "🍗 Açlık":state.hunger,"😊 Mutluluk":state.happiness,"⚡ Enerji":state.energy,"🧼 Temizlik":state.clean,"❤️ Sevgi":state.love };
    Object.entries(vals).forEach(([k,v])=>this.ui[k].fill.width=78*(v/100));
    const need=100+(state.level-1)*60;
    this.levelText.setText("Lv. "+state.level);
    this.xpText.setText(`XP ${state.xp} / ${need}`);
    this.coinText.setText("🪙 "+state.coins);
  }
  floatText(t,x,y){
    const o=this.add.text(x,y,t,{fontFamily:"Arial",fontSize:"25px",color:"#5c4768",fontStyle:"bold"}).setOrigin(.5);
    this.tweens.add({targets:o,y:y-70,alpha:0,duration:900,onComplete:()=>o.destroy()});
  }
  say(t){
    if("speechSynthesis" in window){
      window.speechSynthesis.cancel();
      const u=new SpeechSynthesisUtterance(t); u.lang="tr-TR"; u.pitch=1.45; u.rate=1.08; u.volume=.75;
      window.speechSynthesis.speak(u);
    }
  }
}
new Phaser.Game({type:Phaser.AUTO,parent:"game",width:W,height:H,backgroundColor:"#fff6fb",
scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH,width:W,height:H},
render:{antialias:true,roundPixels:true},scene:[HomeScene]});
