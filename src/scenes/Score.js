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

    this.container = this.add.container(0, 1920, [
      bg,
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
