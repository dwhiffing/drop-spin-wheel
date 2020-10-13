export default class {
  constructor(scene) {
    this.scene = scene
    this.emitters = {}
    this.confettiRain = this.confettiRain.bind(this)
    this.iconBlast = this.iconBlast.bind(this)
    this.clean = this.clean.bind(this)
    this.create = this.create.bind(this)
    const baseIconConfig = {
      x: scene.cameras.main.width / 2,
      y: scene.cameras.main.height / 2,
      rotate: { min: -5000, max: 5000, start: -5000, end: 5000 },
      active: false,
      lifespan: 5000,
      gravityY: 2200,
      speedX: { min: -700, max: 700 },
      speedY: { min: -1800, max: -500 },
    }
    this.iconConfig = {
      ...baseIconConfig,
      scale: 0.4,
    }
    this.iconConfig2 = {
      ...baseIconConfig,
      scale: 1,
    }
    this.confettiConfig = {
      x: { min: -20, max: scene.cameras.main.width + 20 },
      y: -300,
      rotate: { min: -2000, max: 2000, start: -2000, end: 2000 },
      speedX: { min: -200, max: 200 },
      speedY: { min: 500, max: 1000 },
      frame: [0, 1, 2, 3, 4, 5, 6, 7, 8],
      lifespan: 9000,
      alpha: { min: 0.5, max: 1 },
      gravityY: 1800,
      quantity: 2,
      active: false,
      scale: { min: 1, max: 1.5 },
      frequency: 40,
    }

    this.create()
  }

  create() {
    this.emitters.confetti = this.scene.add
      .particles('confetti', this.confettiConfig)
      .setDepth(1)
    this.coinParticles = this.scene.add.particles('coin').setDepth(5)
    this.questionParticles = this.scene.add.particles('question').setDepth(5)
    this.handParticles = this.scene.add.particles('hand').setDepth(5)
    this.emitters.coin = this.coinParticles.createEmitter(this.iconConfig)
    this.emitters.question = this.questionParticles.createEmitter(
      this.iconConfig,
    )
    this.emitters.hand = this.handParticles.createEmitter(this.iconConfig)
    this.emitters.coin2 = this.coinParticles.createEmitter(this.iconConfig2)
    this.emitters.question2 = this.questionParticles.createEmitter(
      this.iconConfig2,
    )
    this.emitters.hand2 = this.handParticles.createEmitter(this.iconConfig2)
  }

  confettiRain() {
    this.emitters.confetti.emitters.list.forEach((e) => {
      e.active = true
    })
  }

  iconBlast(key) {
    this.emitters[key].active = true
    this.emitters[key].explode(50)

    this.emitters[key + '2'].active = true
    this.emitters[key + '2'].explode(15)
  }

  clean() {
    this.emitters.confetti.destroy()
    this.emitters.coin.destroy()
    this.emitters.hand.destroy()
    this.emitters.question.destroy()
  }
}
