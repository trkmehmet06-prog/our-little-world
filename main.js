const W = 720;
const H = 1280;

const state = {
  player: "mehmet",
  hunger: 80,
  energy: 80,
  happiness: 80,
  xp: 0,
  coins: 100,
  lastAction: "Mişa seni bekliyor ❤️"
};

class HomeScene extends Phaser.Scene {
  constructor() {
    super("HomeScene");
  }

  create() {
    this.cameras.main.setBackgroundColor("#fff6fb");

    this.add.rectangle(W/2, H/2, W, H, 0xfff6fb);
    this.add.rectangle(W/2, H*0.48, W-50, H*0.62, 0xf7efff)
      .setStrokeStyle(6, 0xffffff, 1);

    // Zemin
    this.add.ellipse(W/2, H*0.68, 500, 120, 0xe8dff0, 0.65);

    // Basit oda
    this.add.rectangle(W/2, H*0.25, 250, 160, 0xdcecff)
      .setStrokeStyle(5, 0xffffff, 1);
    this.add.text(W/2, H*0.25, "🏠 Mişa'nın Evi", {
      fontFamily: "Arial", fontSize: "30px", color: "#574a62",
      fontStyle: "bold"
    }).setOrigin(0.5);

    // Yatak
    this.add.ellipse(W*0.25, H*0.68, 190, 90, 0xd8b9ff);
    this.add.text(W*0.25, H*0.68, "🛏️", {fontSize:"58px"}).setOrigin(0.5);

    // Mama
    this.add.text(W*0.76, H*0.68, "🍖", {fontSize:"58px"}).setOrigin(0.5);

    this.createMisa();
    this.createUI();

    this.input.on("pointerdown", (p) => {
      // Mişa'nın gövdesine dokunulduğunda sev
      if (Phaser.Math.Distance.Between(p.x, p.y, this.misa.x, this.misa.y) < 170) {
        this.love();
      }
    });

    this.time.addEvent({
      delay: Phaser.Math.Between(2500, 5000),
      loop: true,
      callback: () => this.randomIdle()
    });
  }

  createMisa() {
    const g = this.add.graphics();
    g.fillStyle(0xf7f4f8, 1);
    g.lineStyle(8, 0x554a60, 1);

    // Gövde
    g.fillEllipse(0, 65, 180, 210);
    g.strokeEllipse(0, 65, 180, 210);

    // Kafa
    g.fillCircle(0, -55, 112);
    g.strokeCircle(0, -55, 112);

    // Kulaklar
    g.fillTriangle(-85,-115,-145,-205,-30,-160);
    g.strokeTriangle(-85,-115,-145,-205,-30,-160);
    g.fillTriangle(85,-115,145,-205,30,-160);
    g.strokeTriangle(85,-115,145,-205,30,-160);

    // Pembe iç kulak
    g.fillStyle(0xf2b9cc, 1);
    g.fillTriangle(-88,-135,-125,-190,-48,-160);
    g.fillTriangle(88,-135,125,-190,48,-160);

    // Gözler
    g.fillStyle(0x302936, 1);
    g.fillEllipse(-42,-62,24,34);
    g.fillEllipse(42,-62,24,34);

    // Burun
    g.fillStyle(0xe58ca9, 1);
    g.fillTriangle(0,-35,-13,-20,13,-20);

    // Pati
    g.fillStyle(0xf7f4f8, 1);
    g.lineStyle(7,0x554a60,1);
    g.fillEllipse(-65,145,55,90);
    g.strokeEllipse(-65,145,55,90);
    g.fillEllipse(65,145,55,90);
    g.strokeEllipse(65,145,55,90);

    // Kuyruk
    g.lineStyle(24,0xf0eaf2,1);
    g.beginPath();
    g.arc(105,85,75,Phaser.Math.DegToRad(280),Phaser.Math.DegToRad(80),false);
    g.strokePath();

    this.misa = this.add.container(W/2, H*0.54, [g]);
    this.misa.setSize(300, 400);
    this.misa.setInteractive(
      new Phaser.Geom.Circle(0, 0, 170),
      Phaser.Geom.Circle.Contains
    );

    this.misa.on("pointerdown", () => this.love());

    this.tweens.add({
      targets: this.misa,
      y: this.misa.y - 7,
      duration: 1400,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut"
    });

    this.time.addEvent({
      delay: 4200,
      loop: true,
      callback: () => this.blink()
    });
  }

  createUI() {
    this.title = this.add.text(W/2, 45, "🐱 Mişa 2.0", {
      fontFamily:"Arial", fontSize:"52px", color:"#29243a", fontStyle:"bold"
    }).setOrigin(0.5);

    this.subtitle = this.add.text(W/2, 105, "Mehmet ❤️ Özlem'in Mişa'sı", {
      fontFamily:"Arial", fontSize:"25px", color:"#756a83", fontStyle:"bold"
    }).setOrigin(0.5);

    this.bubble = this.add.text(W/2, H*0.39, "Merhaba! 🐾", {
      fontFamily:"Arial", fontSize:"27px", color:"#4b4055",
      backgroundColor:"#ffffff", padding:{left:22,right:22,top:14,bottom:14}
    }).setOrigin(0.5);

    this.stats = this.add.text(28, H-235, "", {
      fontFamily:"Arial", fontSize:"23px", color:"#4b4055",
      fontStyle:"bold", lineSpacing:10
    });

    const labels = [
      ["❤️","Sev",()=>this.love()],
      ["🍖","Besle",()=>this.feed()],
      ["🎾","Oyna",()=>this.play()],
      ["😴","Dinlendir",()=>this.rest()]
    ];

    labels.forEach((item,i)=>{
      const x = 95 + i*175;
      const y = H-105;
      const bg = this.add.rectangle(x,y,150,105,0xffffff)
        .setStrokeStyle(4,0xeadcf0,1)
        .setInteractive({useHandCursor:true});
      this.add.text(x,y-22,item[0],{fontSize:"38px"}).setOrigin(0.5);
      this.add.text(x,y+25,item[1],{
        fontFamily:"Arial",fontSize:"19px",color:"#4b4055",fontStyle:"bold"
      }).setOrigin(0.5);
      bg.on("pointerdown",item[2]);
    });

    this.updateUI();
  }

  updateUI() {
    this.stats.setText(
      `🍖 Açlık: ${Math.round(state.hunger)}     ⚡ Enerji: ${Math.round(state.energy)}\n`+
      `❤️ Mutluluk: ${Math.round(state.happiness)}     ⭐ XP: ${state.xp}     🪙 ${state.coins}`
    );
    this.bubble.setText(state.lastAction);
  }

  popup(text, emoji) {
    state.lastAction = text;
    this.updateUI();

    const e = this.add.text(
      this.misa.x + Phaser.Math.Between(-70,70),
      this.misa.y - 120,
      emoji,
      {fontSize:"42px"}
    ).setOrigin(0.5);

    this.tweens.add({
      targets:e, y:e.y-130, alpha:0, duration:900,
      onComplete:()=>e.destroy()
    });
  }

  blink() {
    // Gözleri ayrı çizmediğimiz için kısa bir “şaşırma/tepki” animasyonu.
    this.tweens.add({
      targets:this.misa,
      scaleX:1.04, scaleY:0.94,
      duration:90, yoyo:true, ease:"Quad.easeOut"
    });
  }

  randomIdle() {
    const actions = [
      ()=>this.popup("Mişa etrafa bakıyor 👀","✨"),
      ()=>this.popup("Mişa kuyruğunu sallıyor 🐾","💫"),
      ()=>this.popup("Mişa biraz sevgi istiyor ❤️","❤️"),
      ()=>this.popup("Mişa seni izliyor 😺","👀")
    ];
    Phaser.Utils.Array.GetRandom(actions)();
  }

  love() {
    state.happiness = Math.min(100,state.happiness+10);
    state.xp += 10;
    this.popup("Mişa sevildi ve çok mutlu oldu! ❤️","❤️");
    this.tweens.add({
      targets:this.misa, scale:1.1, duration:180, yoyo:true, repeat:1
    });
  }

  feed() {
    if(state.hunger>=100){ this.popup("Mişa'nın karnı tok 🥰","🍖"); return; }
    state.hunger = Math.min(100,state.hunger+18);
    state.happiness = Math.min(100,state.happiness+3);
    state.xp += 10;
    this.popup("Mişa mamasını afiyetle yedi! 🍖","🍖");
    this.jump();
  }

  play() {
    if(state.energy<10){ this.popup("Mişa biraz yorgun 😴","💤"); return; }
    state.energy=Math.max(0,state.energy-10);
    state.hunger=Math.max(0,state.hunger-5);
    state.happiness=Math.min(100,state.happiness+12);
    state.xp+=15;
    this.popup("Mişa seninle oynuyor! 🎾","⭐");
    this.jump();
  }

  rest() {
    if(state.energy>=100){ this.popup("Mişa'nın enerjisi zaten dolu ⚡","⚡"); return; }
    state.energy=Math.min(100,state.energy+20);
    state.happiness=Math.min(100,state.happiness+3);
    state.xp+=8;
    this.popup("Mişa dinleniyor... 💤","💤");
  }

  jump() {
    this.tweens.add({
      targets:this.misa,
      y:this.misa.y-70,
      duration:220,
      yoyo:true,
      ease:"Quad.easeOut"
    });
  }
}

const config = {
  type: Phaser.AUTO,
  parent: "game",
  width: W,
  height: H,
  backgroundColor: "#fff6fb",
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: W,
    height: H
  },
  render: {
    antialias: true,
    roundPixels: true
  },
  input: {
    activePointers: 3
  },
  scene: [HomeScene]
};

new Phaser.Game(config);
