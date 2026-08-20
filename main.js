const W = 720;
const H = 1280;

class HomeScene extends Phaser.Scene {
  constructor() {
    super("HomeScene");
  }

  preload() {
    for (let i = 1; i <= 8; i++) {
      const n = String(i).padStart(2, "0");
      this.load.image(`misa${i}`, `assets/misa/misa_idle_${n}.png?v=3`);
    }
  }

  create() {
    this.cameras.main.setBackgroundColor("#fff6fb");
    this.add.rectangle(W / 2, H / 2, W, H, 0xfff6fb);

    this.add.text(W / 2, 55, "🐱 Mişa 2.0", {
      fontFamily: "Arial",
      fontSize: "52px",
      color: "#29243a",
      fontStyle: "bold"
    }).setOrigin(0.5);

    this.add.text(W / 2, 115, "Mehmet ❤️ Özlem'in Mişa'sı", {
      fontFamily: "Arial",
      fontSize: "25px",
      color: "#756a83",
      fontStyle: "bold"
    }).setOrigin(0.5);

    this.add.rectangle(W / 2, H * 0.48, W - 50, H * 0.62, 0xf7efff)
      .setStrokeStyle(6, 0xffffff, 1);

    this.add.text(W / 2, H * 0.25, "🏠 Mişa'nın Evi", {
      fontFamily: "Arial",
      fontSize: "30px",
      color: "#574a62",
      fontStyle: "bold"
    }).setOrigin(0.5);

    this.add.ellipse(W * 0.25, H * 0.70, 190, 90, 0xd8b9ff);
    this.add.text(W * 0.25, H * 0.70, "🛏️", { fontSize: "58px" }).setOrigin(0.5);
    this.add.text(W * 0.76, H * 0.70, "🍖", { fontSize: "58px" }).setOrigin(0.5);

    this.misa = this.add.image(W / 2, H * 0.55, "misa1")
      .setOrigin(0.5)
      .setScale(0.72)
      .setInteractive();

    // Gerçek kare-kare idle:
    // 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 7 → ... → 1
    const sequence = [1,2,3,4,5,6,7,8,7,6,5,4,3,2];
    let index = 0;

    this.time.addEvent({
      delay: 500,
      loop: true,
      callback: () => {
        index = (index + 1) % sequence.length;
        this.misa.setTexture(`misa${sequence[index]}`);
      }
    });

    this.tweens.add({
      targets: this.misa,
      y: H * 0.55 - 4,
      duration: 1600,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut"
    });

    this.bubble = this.add.text(W / 2, H * 0.39,
      "Mişa seni bekliyor ❤️", {
        fontFamily: "Arial",
        fontSize: "27px",
        color: "#4b4055",
        backgroundColor: "#ffffff",
        padding: { left: 22, right: 22, top: 14, bottom: 14 }
      }).setOrigin(0.5);

    this.misa.on("pointerdown", () => {
      this.bubble.setText("Mişa sevildi! ❤️");
      const heart = this.add.text(this.misa.x, this.misa.y - 130, "❤️", {
        fontSize: "48px"
      }).setOrigin(0.5);

      this.tweens.add({
        targets: heart,
        y: heart.y - 100,
        alpha: 0,
        duration: 900,
        onComplete: () => heart.destroy()
      });
    });
  }
}

new Phaser.Game({
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
  scene: [HomeScene]
});
