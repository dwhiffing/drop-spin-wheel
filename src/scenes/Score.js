export default class extends Phaser.Scene {
  constructor() {
    super({ key: 'Score' })
  }

  init(opts = {}) {
    this.width = this.cameras.main.width
    this.height = this.cameras.main.height
    this.prize = opts.prize || 0
  }

  create() {
    const bg = this.add.graphics()
    bg.fillStyle(0x524ab3)
    bg.fillRect(0, 0, 1080, 1920)
    const text1 = this.add.text(40, 400, 'You won!', {
      fontSize: 90,
      fontFamily: 'SailecBold',
      color: '#fff',
    })
    const text2 = this.add.text(40, 510, this.prize, {
      fontSize: 90,
      fontFamily: 'SailecBold',
      color: '#fff',
    })

    const text3 = this.add.text(
      40,
      700,
      'Check the inbox of your Drop email for the details of your prize',
      {
        fontSize: 45,
        lineSpacing: 10,
        fontFamily: 'Sailec',
        color: '#fff',
        wordWrap: { width: 800, useAdvancedWrap: true },
      },
    )

    const buttonGraphics = this.add.graphics()
    buttonGraphics.fillStyle(0x000000)
    buttonGraphics.fillRoundedRect(40, 1920 * 0.8, 1000, 150, 75)
    buttonGraphics.setInteractive(
      new Phaser.Geom.Rectangle(40, 1920 * 0.8, 1000, 150),
      Phaser.Geom.Rectangle.Contains,
    )
    buttonGraphics.on('pointerdown', () => {
      this.tweens.add({
        targets: [this.container],
        y: 1920,
        ease: 'Cubic.easeOut',
        duration: 500,
      })
    })

    const buttonText = this.add
      .text(1080 / 2, 1920 * 0.84, 'Done', {
        fontSize: 40,
        lineSpacing: 10,
        fontFamily: 'SailecBold',
        color: '#fff',
      })
      .setOrigin(0.5)

    this.confettiConfig = {
      x: { min: -20, max: this.cameras.main.width + 20 },
      y: -100,
      rotate: { min: -500, max: 500, start: -500, end: 500 },
      speedX: { min: -150, max: 150 },
      speedY: { min: 0, max: 200 },
      alpha: { start: 0.25, end: 0 },
      frame: [0, 1, 2, 3, 4, 5, 6, 7, 8],
      lifespan: 2000,
      gravityY: 800,
      quantity: 1,
      scale: { min: 1, max: 1.5 },
      frequency: 50,
    }
    this.confetti = this.add.particles('confetti-white', this.confettiConfig)
    this.emitter = this.confetti.createEmitter()

    this.container = this.add.container(0, 1920, [
      bg,
      this.confetti,
      text1,
      text2,
      text3,
      buttonGraphics,
      buttonText,
    ])

    this.tweens.add({
      targets: [this.container],
      y: 0,
      ease: 'Cubic.easeOut',
      duration: 500,
    })
  }
}
