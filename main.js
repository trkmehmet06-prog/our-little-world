const W = 720;
const H = 1280;

const state = { hunger:80, energy:80, happiness:80, xp:0, coins:100, lastAction:"Mişa seni bekliyor ❤️" };

class HomeScene extends Phaser.Scene {
  constructor(){ super("HomeScene"); }

  preload(){
    for(let i=1;i<=8;i++){
      this.load.image(`misa_idle_${i}`, `assets/misa/idle/misa_idle_${String(i).padStart(2,"0")}.png`);
    }
  }

  create(){
    this.cameras.main.setBackgroundColor("#fff6fb");
    this.add.rectangle(W/2,H/2,W,H,0xfff6fb);
    this.add.rectangle(W/2,H*0.48,W-50,H*0.62,0xf7efff).setStrokeStyle(6,0xffffff,1);
    this.add.ellipse(W/2,H*0.70,500,120,0xe8dff0,0.65);
    this.add.rectangle(W/2,H*0.24,250,150,0xdcecff).setStrokeStyle(5,0xffffff,1);
    this.add.text(W/2,H*0.24,"🏠 Mişa'nın Evi",{fontFamily:"Arial",fontSize:"30px",color:"#574a62",fontStyle:"bold"}).setOrigin(0.5);

    this.add.text(W/2,45,"🐱 Mişa 2.0",{fontFamily:"Arial",fontSize:"52px",color:"#29243a",fontStyle:"bold"}).setOrigin(0.5);
    this.add.text(W/2,105,"Mehmet ❤️ Özlem'in Mişa'sı",{fontFamily:"Arial",fontSize:"25px",color:"#756a83",fontStyle:"bold"}).setOrigin(0.5);

    this.createMisa();
    this.createUI();
    this.input.on("pointerdown",p=>{ if(Phaser.Math.Distance.Between(p.x,p.y,this.misa.x,this.misa.y)<180)this.love(); });
  }

  createMisa(){
    this.anims.create({
      key:"misa_idle",
      frames:Array.from({length:8},(_,i)=>({key:`misa_idle_${i+1}`})),
      frameRate:4,
      repeat:-1,
      yoyo:true
    });
    this.misa=this.add.sprite(W/2,H*0.55,"misa_idle_1").setOrigin(0.5).setScale(0.82).setInteractive();
    this.misa.play("misa_idle");
    this.misa.on("pointerdown",()=>this.love());
  }

  createUI(){
    this.bubble=this.add.text(W/2,H*0.39,state.lastAction,{fontFamily:"Arial",fontSize:"27px",color:"#4b4055",backgroundColor:"#ffffff",padding:{left:22,right:22,top:14,bottom:14}}).setOrigin(0.5);
    this.stats=this.add.text(28,H-235,"",{fontFamily:"Arial",fontSize:"23px",color:"#4b4055",fontStyle:"bold",lineSpacing:10});
    const buttons=[["❤️","Sev",()=>this.love()],["🍖","Besle",()=>this.feed()],["🎾","Oyna",()=>this.play()],["😴","Dinlendir",()=>this.rest()]];
    buttons.forEach((b,i)=>{
      const x=95+i*175,y=H-105;
      const bg=this.add.rectangle(x,y,150,105,0xffffff).setStrokeStyle(4,0xeadcf0,1).setInteractive();
      this.add.text(x,y-22,b[0],{fontSize:"38px"}).setOrigin(0.5);
      this.add.text(x,y+25,b[1],{fontFamily:"Arial",fontSize:"19px",color:"#4b4055",fontStyle:"bold"}).setOrigin(0.5);
      bg.on("pointerdown",b[2]);
    });
    this.updateUI();
  }

  updateUI(){ this.stats.setText(`🍖 Açlık: ${Math.round(state.hunger)}     ⚡ Enerji: ${Math.round(state.energy)}\n❤️ Mutluluk: ${Math.round(state.happiness)}     ⭐ XP: ${state.xp}     🪙 ${state.coins}`); this.bubble.setText(state.lastAction); }
  popup(t,e){ state.lastAction=t; this.updateUI(); const x=this.add.text(this.misa.x+Phaser.Math.Between(-60,60),this.misa.y-150,e,{fontSize:"42px"}).setOrigin(.5); this.tweens.add({targets:x,y:x.y-100,alpha:0,duration:900,onComplete:()=>x.destroy()}); }
  love(){ state.happiness=Math.min(100,state.happiness+10); state.xp+=10; this.popup("Mişa sevildi ve çok mutlu oldu! ❤️","❤️"); }
  feed(){ if(state.hunger>=100){this.popup("Mişa'nın karnı tok 🥰","🍖");return;} state.hunger=Math.min(100,state.hunger+18);state.happiness=Math.min(100,state.happiness+3);state.xp+=10;this.popup("Mişa mamasını afiyetle yedi! 🍖","🍖"); }
  play(){ if(state.energy<10){this.popup("Mişa biraz yorgun 😴","💤");return;} state.energy=Math.max(0,state.energy-10);state.hunger=Math.max(0,state.hunger-5);state.happiness=Math.min(100,state.happiness+12);state.xp+=15;this.popup("Mişa seninle oynuyor! 🎾","⭐"); }
  rest(){ if(state.energy>=100){this.popup("Mişa'nın enerjisi zaten dolu ⚡","⚡");return;} state.energy=Math.min(100,state.energy+20);state.happiness=Math.min(100,state.happiness+3);state.xp+=8;this.popup("Mişa dinleniyor... 💤","💤"); }
}

new Phaser.Game({type:Phaser.AUTO,parent:"game",width:W,height:H,backgroundColor:"#fff6fb",scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH,width:W,height:H},render:{antialias:true,roundPixels:true},scene:[HomeScene]});
