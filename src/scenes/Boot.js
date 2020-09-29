export default class extends Phaser.Scene {
  constructor() {
    super({ key: 'Boot' })
  }

  preload() {
    const progress = this.add.graphics()

    this.load.on('progress', (value) => {
      progress.clear()
      progress.fillStyle(0xffffff, 1)
      progress.fillRect(
        0,
        this.sys.game.config.height / 2,
        this.sys.game.config.width * value,
        60,
      )
    })

    this.load.script(
      'webfont',
      'https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js',
    )

    this.load.image('playButton', 'assets/images/button.png')
    this.load.image('coin', 'assets/images/coin.png')
    this.load.image('question', 'assets/images/question.png')
    this.load.image('hand', 'assets/images/hand.png')

    this.load.on('complete', () => {
      if (!window.WebFont) {
        progress.destroy()
        this.scene.start('Game')
        return
      }
      WebFont.load({
        custom: {
          families: ['Sailec'],
        },
        active: () => {
          progress.destroy()
          this.scene.start('Game')
        },
      })
    })
  }
}
