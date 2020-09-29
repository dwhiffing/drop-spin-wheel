import { SEGMENTS } from '../constants'

let w, h
const font = { fontSize: 45, fontFamily: 'Sailec', color: '#000' }
const frags = 360 / SEGMENTS.length / 180

// TODO: win screen
// TODO: particles
// TODO: drop shadows
// TODO: sound
// TODO: backend integration

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

    this.input.on('pointermove', this.move, this)
    this.input.on('pointerdown', this.click, this)
    this.input.on('pointerup', this.release, this)
  }

  click(pointer) {
    if (this.spinning) return

    this.isDown = true
    this.startX = pointer.x
    this.startY = pointer.y
    this.startAngle = this.container.angle
    this.startTime = +new Date()
  }

  move(pointer) {
    if (this.spinning) return

    if (this.isDown) {
      const diff = (pointer.x - this.startX) / 5
      this.container.angle = this.startAngle + diff
    }
  }

  release(pointer) {
    if (this.spinning) return

    this.isDown = false
    const timeDelta = Math.abs(this.startTime - new Date())
    const xDelta = Math.abs(this.startX - pointer.x)
    const force = xDelta / timeDelta
    if (force > 3) {
      this.spin()
    } else {
      this.spin(force * 100, 1000)
    }
  }

  spin(amount = 5000 + Math.random() * 1000, duration = 8000) {
    if (this.spinning) return

    this.tweens.add({
      targets: [this.container],
      angle: this.container.angle + amount,
      duration: duration,
      ease: 'Cubic.easeOut',
      onComplete: () => {
        this.spinning = false
        this.headingText.text = 'Try your luck!'
        this.tweens.add({
          targets: this.buttonGraphics,
          alpha: 1,
          duration: 500,
        })
      },
    })

    if (amount > 1000) {
      this.spinning = true
      this.headingText.text = '👀'

      this.tweens.add({
        targets: this.buttonGraphics,
        alpha: 0,
        duration: 500,
      })
      this.tweens.add({
        targets: [this.cursor],
        scale: 1.03,
        repeat: 22,
        yoyo: true,
        duration: duration / 50,
        ease: 'Cubic.easeOut',
      })
    }
  }

  drawWheel() {
    this.wheel = this.add.graphics()

    // Draw bg
    this.wheel.arc(0, 0, w / 2.5, 0, 6.1)
    this.wheel.fillStyle(0x000000)
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

    this.headingText = this.add
      .text(w / 2, h / 7, 'Try your luck!', headingStyle)
      .setOrigin(0.5)

    // this.add
    //   .text(w / 2, h / 5.4, 'You have 1 free spin', bodyStyle)
    //   .setOrigin(0.5)

    this.buttonGraphics = this.add.graphics()
    this.buttonGraphics.fillStyle(0x000000)
    this.buttonGraphics.fillRoundedRect(w / 2 - 250, h * 0.8, 500, 120, 60)

    this.buttonGraphics.setInteractive(
      new Phaser.Geom.Rectangle(w / 2 - 250, h * 0.8, 500, 120),
      Phaser.Geom.Rectangle.Contains,
    )
    this.buttonGraphics.on('pointerdown', () => {
      this.spin()
    })

    this.add
      .text(w / 2, h / 1.2, 'Spin now!', { ...bodyStyle, color: '#ffffff' })
      .setOrigin(0.5)
  }

  getAngle(n) {
    return (((Math.PI / 180) * 360) / SEGMENTS.length) * n
  }
}
