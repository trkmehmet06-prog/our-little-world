const W=720,H=1280;
class HomeScene extends Phaser.Scene{
  constructor(){super("HomeScene")}
  preload(){
    for(let i=1;i<=8;i++){
      const n=String(i).padStart(2,"0");
      this.load.image(`misa${i}`,`assets/misa/idle/misa_idle_${n}.png?v=clean1`);
    }
  }
  create(){
    this.cameras.main.setBackgroundColor("#fff6fb");
    this.add.rectangle(W/2,H/2,W,H,0xfff6fb);
    this.add.rectangle(W/2,H*.48,W-50,H*.62,0xf7efff).setStrokeStyle(6,0xffffff,1);
    this.add.ellipse(W/2,H*.70,500,120,0xe8dff0,.65);
    this.add.text(W/2,55,"🐱 Mişa 2.0",{fontFamily:"Arial",fontSize:"52px",color:"#29243a",fontStyle:"bold"}).setOrigin(.5);
    this.add.text(W/2,115,"Mehmet ❤️ Özlem'in Mişa'sı",{fontFamily:"Arial",fontSize:"25px",color:"#756a83",fontStyle:"bold"}).setOrigin(.5);
    this.add.text(W/2,H*.25,"🏠 Mişa'nın Evi",{fontFamily:"Arial",fontSize:"30px",color:"#574a62",fontStyle:"bold"}).setOrigin(.5);

    this.misa=this.add.image(W/2,H*.55,"misa1").setOrigin(.5).setScale(.82).setInteractive();

    // 8 gerçek poz. 10 fps ile akıcı, tersine dönen loop.
    const seq=[1,2,3,4,5,6,7,8,7,6,5,4,3,2];
    let i=0;
    this.time.addEvent({delay:100,loop:true,callback:()=>{
      i=(i+1)%seq.length;
      this.misa.setTexture(`misa${seq[i]}`);
    }});

    this.add.text(W/2,H*.39,"Mişa seni bekliyor ❤️",{fontFamily:"Arial",fontSize:"27px",color:"#4b4055",backgroundColor:"#fff",padding:{left:22,right:22,top:14,bottom:14}}).setOrigin(.5);
    this.misa.on("pointerdown",()=>{
      const heart=this.add.text(this.misa.x,this.misa.y-150,"❤️",{fontSize:"48px"}).setOrigin(.5);
      this.tweens.add({targets:heart,y:heart.y-100,alpha:0,duration:900,onComplete:()=>heart.destroy()});
    });
  }
}
new Phaser.Game({type:Phaser.AUTO,parent:"game",width:W,height:H,backgroundColor:"#fff6fb",scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH,width:W,height:H},render:{antialias:true,roundPixels:true},scene:[HomeScene]});
