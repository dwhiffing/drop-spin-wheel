const NUM_SEGMENTS = 6
const TEXTS = ['3x', '50', '1.5x', '100', '???', '10,000']

export default class extends Phaser.Scene {
  constructor() {
    super({ key: 'Game' })
  }

  init() {
    this.width = this.cameras.main.width
    this.height = this.cameras.main.height
    this.ended = false
    this.buttonGraphics = this.add.graphics()
    this.wheelGraphics = this.add.graphics()
    this.images = []
    this.texts = []
    this.theta = []

    var frags = 360 / NUM_SEGMENTS
    for (var i = 0; i <= NUM_SEGMENTS; i++) {
      this.theta.push((frags / 180) * i * Math.PI + 0.52)
    }

    for (let i = 0; i < NUM_SEGMENTS; i++) {
      const x = Math.round(300 * Math.cos(this.theta[i]))
      const y = Math.round(300 * Math.sin(this.theta[i]))
      const _x = Math.round(180 * Math.cos(this.theta[i]))
      const _y = Math.round(180 * Math.sin(this.theta[i]))
      this.images[i] = this.add
        .image(x, y, i % 2 === 0 ? 'coin' : 'hand')
        .setScale(0.9)
      this.texts[i] = this.add
        .text(_x, _y, TEXTS[i], {
          color: '#fff',
          fontSize: 45,
          fontFamily: 'Sailec',
        })
        .setOrigin(0.5)
      const angle = this.theta[i] * (180 / Math.PI) + 90
      this.images[i].angle = angle
      this.texts[i].angle = angle
    }

    this.container = this.add.container(this.width / 2, this.height / 2, [
      this.wheelGraphics,
      ...this.images,
      ...this.texts,
    ])

    this.tabGraphics = this.add.graphics()

    this.tabText = this.add
      .text(this.width / 2, this.height / 2, '???', {
        fontSize: 60,
        fontFamily: 'Sailec',
        color: '#000',
      })
      .setOrigin(0.5)
  }

  create() {
    let getTick = (num) => (((Math.PI / 180) * 360) / NUM_SEGMENTS) * num

    this.add
      .text(this.width / 2, this.height / 7, 'Try your luck!', {
        fontSize: 70,
        fontFamily: 'Sailec',
        fontWeight: '500',
        color: '#000',
      })
      .setOrigin(0.5)

    this.add
      .text(this.width / 2, this.height / 5.4, 'You have 1 free spin', {
        fontSize: 35,
        fontFamily: 'Sailec',
        color: '#000',
      })
      .setOrigin(0.5)

    this.buttonGraphics.fillStyle(0x000000)
    this.buttonGraphics.fillRoundedRect(
      this.width / 2 - 250,
      this.height * 0.8,
      500,
      120,
      60,
    )

    this.add
      .text(this.width / 2, this.height / 1.2, 'Spin now!', {
        fontSize: 35,
        fontFamily: 'Sailec',
        color: '#ffffff',
      })
      .setOrigin(0.5)

    this.wheelGraphics.beginPath()
    this.wheelGraphics.arc(0, 0, this.width / 2.5, 0, 6.1)
    this.wheelGraphics.fillStyle(0x000000)
    this.wheelGraphics.fill()
    this.wheelGraphics.closePath()

    for (let i = 0; i < NUM_SEGMENTS; i++) {
      let start = getTick(i)
      let end = getTick(i + 1)
      this.wheelGraphics.beginPath()
      this.wheelGraphics.lineStyle(
        this.width / 3.8,
        i % 2 === 0 ? 0x65af87 : 0x417057,
      )
      this.wheelGraphics.arc(0, 0, this.width / 4.1, start, end)
      this.wheelGraphics.strokePath()
      this.wheelGraphics.closePath()
    }

    this.tabGraphics.beginPath()
    this.tabGraphics.arc(0, 0, this.width / 8.7, 0, 6.1)
    this.tabGraphics.fillStyle(0x000000)
    this.tabGraphics.fill()
    this.tabGraphics.closePath()

    this.tabGraphics.beginPath()
    this.tabGraphics.arc(0, 0, this.width / 10.7, 0, 6.1)
    this.tabGraphics.fillStyle(0xffffff)
    this.tabGraphics.fill()
    this.tabGraphics.closePath()

    this.tabGraphics.beginPath()
    this.tabGraphics.moveTo(0, -140)
    this.tabGraphics.lineTo(-20, -120)
    this.tabGraphics.lineTo(20, -120)
    this.tabGraphics.fillStyle(0x000000)
    this.tabGraphics.fill()
    this.tabGraphics.closePath()

    this.tabGraphics.x = this.width / 2
    this.tabGraphics.y = this.height / 2

    this.input.on('pointerdown', this.spin, this)
  }

  spin() {
    this.tweens.add({
      targets: [this.tabGraphics],
      scale: 1.03,
      repeat: 20,
      yoyo: true,
      duration: 50,
      ease: 'Cubic.easeOut',
    })
    this.tweens.add({
      targets: [this.container],
      angle: 5000,
      duration: 5000,
      ease: 'Cubic.easeOut',
    })
  }

  update() {}
}
