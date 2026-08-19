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

  preload() {
    // Idle animasyon kareleri
    for (let i = 1; i <= 8; i++) {
      this.load.image(
        `misaIdle${i}`,
        `assets/misa/misa_idle_${String(i).padStart(2, "0")}.png`
      );
    }
  }

  create() {
    this.cameras.main.setBackgroundColor("#fff6fb");

    // Oda
    this.add.rectangle(W / 2, H / 2, W, H, 0xfff6fb);
    this.add.rectangle(W / 2, H * 0.48, W - 50, H * 0.62, 0xf7efff)
      .setStrokeStyle(6, 0xffffff, 1);

    this.add.ellipse(W / 2, H * 0.68, 500, 120, 0xe8dff0, 0.65);

    // Pencere
    this.add.rectangle(W / 2, H * 0.25, 250, 160, 0xdcecff)
      .setStrokeStyle(5, 0xffffff, 1);

    this.add.text(W / 2, H * 0.25, "🏠 Mişa'nın Evi", {
      fontFamily: "Arial",
      fontSize: "30px",
      color: "#574a62",
      fontStyle: "bold"
    }).setOrigin(0.5);

    // Yatak ve mama
    this.add.ellipse(W * 0.25, H * 0.68, 190, 90, 0xd8b9ff);
    this.add.text(W * 0.25, H * 0.68, "🛏️", { fontSize: "58px" }).setOrigin(0.5);
    this.add.text(W * 0.76, H * 0.68, "🍖", { fontSize: "58px" }).setOrigin(0.5);

    this.createMisa();
    this.createUI();

    // Ekrana/karaktere dokunma
    this.input.on("pointerdown", (p) => {
      if (
        Phaser.Math.Distance.Between(
          p.x,
          p.y,
          this.misa.x,
          this.misa.y
        ) < 190
      ) {
        this.love();
      }
    });

    // Rastgele idle davranışları
    this.time.addEvent({
      delay: 4000,
      loop: true,
      callback: () => this.randomIdle()
    });
  }

  createMisa() {
    // Gerçek Mişa idle sprite'ı
    this.misa = this.add.sprite(W / 2, H * 0.54, "misaIdle1")
      .setOrigin(0.5, 0.5)
      .setInteractive();

    // Mobilde uygun boyut
    this.misa.setScale(0.72);

    // 8 karelik idle animasyonu
    this.anims.create({
      key: "misa-idle",
      frames: [
        { key: "misaIdle1" },
        { key: "misaIdle2" },
        { key: "misaIdle3" },
        { key: "misaIdle4" },
        { key: "misaIdle5" },
        { key: "misaIdle6" },
        { key: "misaIdle7" },
        { key: "misaIdle8" },
        { key: "misaIdle7" },
        { key: "misaIdle6" },
        { key: "misaIdle5" },
        { key: "misaIdle4" },
        { key: "misaIdle3" },
        { key: "misaIdle2" }
      ],
      frameRate: 6,
      repeat: -1
    });

    this.misa.play("misa-idle");

    this.misa.on("pointerdown", () => this.love());

    // Hafif canlılık hareketi
    this.tweens.add({
      targets: this.misa,
      y: this.misa.y - 5,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut"
    });
  }

  createUI() {
    this.add.text(W / 2, 45, "🐱 Mişa 2.0", {
      fontFamily: "Arial",
      fontSize: "52px",
      color: "#29243a",
      fontStyle: "bold"
    }).setOrigin(0.5);

    this.add.text(W / 2, 105, "Mehmet ❤️ Özlem'in Mişa'sı", {
      fontFamily: "Arial",
      fontSize: "25px",
      color: "#756a83",
      fontStyle: "bold"
    }).setOrigin(0.5);

    this.bubble = this.add.text(W / 2, H * 0.39, state.lastAction, {
      fontFamily: "Arial",
      fontSize: "27px",
      color: "#4b4055",
      backgroundColor: "#ffffff",
      padding: { left: 22, right: 22, top: 14, bottom: 14 }
    }).setOrigin(0.5);

    this.stats = this.add.text(28, H - 235, "", {
      fontFamily: "Arial",
      fontSize: "23px",
      color: "#4b4055",
      fontStyle: "bold",
      lineSpacing: 10
    });

    const buttons = [
      ["❤️", "Sev", () => this.love()],
      ["🍖", "Besle", () => this.feed()],
      ["🎾", "Oyna", () => this.play()],
      ["😴", "Dinlendir", () => this.rest()]
    ];

    buttons.forEach((item, i) => {
      const x = 95 + i * 175;
      const y = H - 105;

      const bg = this.add.rectangle(x, y, 150, 105, 0xffffff)
        .setStrokeStyle(4, 0xeadcf0, 1)
        .setInteractive();

      this.add.text(x, y - 22, item[0], { fontSize: "38px" })
        .setOrigin(0.5);

      this.add.text(x, y + 25, item[1], {
        fontFamily: "Arial",
        fontSize: "19px",
        color: "#4b4055",
        fontStyle: "bold"
      }).setOrigin(0.5);

      bg.on("pointerdown", item[2]);
    });

    this.updateUI();
  }

  updateUI() {
    this.stats.setText(
      `🍖 Açlık: ${Math.round(state.hunger)}     ⚡ Enerji: ${Math.round(state.energy)}\n` +
      `❤️ Mutluluk: ${Math.round(state.happiness)}     ⭐ XP: ${state.xp}     🪙 ${state.coins}`
    );

    this.bubble.setText(state.lastAction);
  }

  popup(text, emoji) {
    state.lastAction = text;
    this.updateUI();

    const e = this.add.text(
      this.misa.x + Phaser.Math.Between(-70, 70),
      this.misa.y - 120,
      emoji,
      { fontSize: "42px" }
    ).setOrigin(0.5);

    this.tweens.add({
      targets: e,
      y: e.y - 130,
      alpha: 0,
      duration: 900,
      onComplete: () => e.destroy()
    });
  }

  randomIdle() {
    const actions = [
      () => this.popup("Mişa etrafa bakıyor 👀", "✨"),
      () => this.popup("Mişa kuyruğunu sallıyor 🐾", "💫"),
      () => this.popup("Mişa biraz sevgi istiyor ❤️", "❤️"),
      () => this.popup("Mişa seni izliyor 😺", "👀")
    ];

    Phaser.Utils.Array.GetRandom(actions)();
  }

  love() {
    state.happiness = Math.min(100, state.happiness + 10);
    state.xp += 10;

    this.popup("Mişa sevildi ve çok mutlu oldu! ❤️", "❤️");

    this.tweens.add({
      targets: this.misa,
      scale: 0.80,
      duration: 180,
      yoyo: true,
      repeat: 1
    });
  }

  feed() {
    if (state.hunger >= 100) {
      this.popup("Mişa'nın karnı tok 🥰", "🍖");
      return;
    }

    state.hunger = Math.min(100, state.hunger + 18);
    state.happiness = Math.min(100, state.happiness + 3);
    state.xp += 10;

    this.popup("Mişa mamasını afiyetle yedi! 🍖", "🍖");
    this.jump();
  }

  play() {
    if (state.energy < 10) {
      this.popup("Mişa biraz yorgun 😴", "💤");
      return;
    }

    state.energy = Math.max(0, state.energy - 10);
    state.hunger = Math.max(0, state.hunger - 5);
    state.happiness = Math.min(100, state.happiness + 12);
    state.xp += 15;

    this.popup("Mişa seninle oynuyor! 🎾", "⭐");
    this.jump();
  }

  rest() {
    if (state.energy >= 100) {
      this.popup("Mişa'nın enerjisi zaten dolu ⚡", "⚡");
      return;
    }

    state.energy = Math.min(100, state.energy + 20);
    state.happiness = Math.min(100, state.happiness + 3);
    state.xp += 8;

    this.popup("Mişa dinleniyor... 💤", "💤");
  }

  jump() {
    this.tweens.add({
      targets: this.misa,
      y: this.misa.y - 70,
      duration: 220,
      yoyo: true,
      ease: "Quad.easeOut"
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
