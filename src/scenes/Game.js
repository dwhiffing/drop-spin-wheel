let w, h
const font = { fontSize: 45, fontFamily: 'Sailec', color: '#000' }
const SEGMENTS = [
  { icon: 'hand', label: '1.5x' },
  { icon: 'coin', label: '100' },
  { icon: 'question', label: '???' },
  { icon: 'coin', label: '10,000' },
  { icon: 'hand', label: '3x' },
  { icon: 'coin', label: '50' },
]
const frags = 360 / SEGMENTS.length / 180

export default class extends Phaser.Scene {
  constructor() {
    super({ key: 'Game' })
  }

  init() {
    w = this.cameras.main.width
    h = this.cameras.main.height
  }

  create() {
    this.drawWheel()
    this.drawCursor()
    this.drawUI()

    this.input.on('pointerdown', this.spin, this)
  }

  spin() {
    this.tweens.add({
      targets: [this.cursor],
      scale: 1.03,
      repeat: 22,
      yoyo: true,
      duration: 100,
      ease: 'Cubic.easeOut',
    })
    this.tweens.add({
      targets: [this.container],
      angle: 5000 + Math.random() * 1000,
      duration: 5000,
      ease: 'Cubic.easeOut',
    })
  }

  drawWheel() {
    this.wheel = this.add.graphics()

    // Draw bg
    this.wheel.arc(0, 0, w / 2.5, 0, 6.1)
    this.wheel.fill()
    let children = []
    SEGMENTS.forEach(({ icon, label }, i) => {
      // Draw segment bg
      this.wheel.beginPath()
      const segmentColor = i % 2 === 0 ? 0x65af87 : 0x417057
      this.wheel.lineStyle(w / 3.8, segmentColor)
      this.wheel.arc(0, 0, w / 4.1, this.getAngle(i), this.getAngle(i + 1))
      this.wheel.strokePath()

      // Draw image and text
      const angle = frags * i * Math.PI + 0.52
      const degs = angle * (180 / Math.PI) + 90
      const style = { ...font, color: '#fff' }
      children.push(
        this.add
          .image(300 * Math.cos(angle), 300 * Math.sin(angle), icon)
          .setScale(0.9)
          .setAngle(degs),
      )
      children.push(
        this.add
          .text(180 * Math.cos(angle), 180 * Math.sin(angle), label, style)
          .setOrigin(0.5)
          .setAngle(degs),
      )
    })

    this.container = this.add.container(w / 2, h / 2, [this.wheel, ...children])
  }

  drawCursor() {
    this.cursor = this.add.graphics()

    this.cursor.arc(0, 0, w / 8.7, 0, 6.1)
    this.cursor.fillStyle(0x000000)
    this.cursor.fill()

    this.cursor.moveTo(0, -140)
    this.cursor.lineTo(-20, -120)
    this.cursor.lineTo(20, -120)
    this.cursor.fill()

    this.cursor.beginPath()
    this.cursor.arc(0, 0, w / 10.7, 0, 6.1)
    this.cursor.fillStyle(0xffffff)
    this.cursor.fill()

    this.cursor.x = w / 2
    this.cursor.y = h / 2

    this.tabText = this.add
      .text(w / 2, h / 2, '???', { ...font, fontSize: 60 })
      .setOrigin(0.5)
  }

  drawUI() {
    const headingStyle = { ...font, fontSize: 70 }
    const bodyStyle = { ...font, fontSize: 35 }

    this.add.text(w / 2, h / 7, 'Try your luck!', headingStyle).setOrigin(0.5)

    this.add
      .text(w / 2, h / 5.4, 'You have 1 free spin', bodyStyle)
      .setOrigin(0.5)

    this.buttonGraphics = this.add.graphics()
    this.buttonGraphics.fillStyle(0x000000)
    this.buttonGraphics.fillRoundedRect(w / 2 - 250, h * 0.8, 500, 120, 60)

    this.add
      .text(w / 2, h / 1.2, 'Spin now!', { ...bodyStyle, color: '#ffffff' })
      .setOrigin(0.5)
  }

  getAngle(n) {
    return (((Math.PI / 180) * 360) / SEGMENTS.length) * n
  }
}
