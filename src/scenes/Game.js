import { SEGMENTS } from '../constants'

const SPIN_DURATION = 5000

let w, h
const font = {
  fontSize: 45,
  fontFamily: 'SailecBold',
  color: '#000',
}
const frags = 360 / SEGMENTS.length / 180
const PRIZES = [5, 4, 2, 0, 1, 3]
let spinCount = 0

// TODO: drop shadows
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

    this.emitters = {}
    this.iconConfig = {
      x: w / 2,
      y: h / 2 - 300,
      speedX: { min: -400, max: 400 },
      speedY: { min: -1200, max: -300 },
      rotate: { min: -1000, max: 1000, start: -1000, end: 1000 },
      scale: { min: 0.5, max: 1 },
      active: false,
      lifespan: 5000,
      gravityY: 1500,
    }
    this.confettiConfig = {
      x: { min: -20, max: w + 20 },
      y: -100,
      rotate: { min: -500, max: 500, start: -500, end: 500 },
      speedX: { min: -50, max: 50 },
      speedY: { min: 0, max: 1000 },
      frame: [0, 1, 2, 3, 4, 5, 6, 7, 8],
      lifespan: 5000,
      alpha: { min: 0.5, max: 1 },
      gravityY: 1000,
      quantity: 2,
      active: false,
      scale: { min: 1, max: 1.5 },
    }
    this.emitters.confetti = this.add.particles('confetti', this.confettiConfig)
    this.coinParticles = this.add.particles('coin').setDepth(22)
    this.questionParticles = this.add.particles('question').setDepth(22)
    this.handParticles = this.add.particles('hand').setDepth(22)
    this.emitters.coin = this.coinParticles.createEmitter(this.iconConfig)
    this.emitters.question = this.questionParticles.createEmitter(
      this.iconConfig,
    )
    this.emitters.hand = this.handParticles.createEmitter(this.iconConfig)

    this.input.on('pointermove', this.move, this)
    this.input.on('pointerdown', this.click, this)
    this.input.on('pointerup', this.release, this)
  }

  click(pointer) {
    if (this.spinning) return
    this.lastX = pointer.x
    this.lastY = pointer.y
    this.isDown = true
    this.startAngle = this.container.angle
    this.startAngleD =
      Phaser.Math.RAD_TO_DEG *
      Phaser.Math.Angle.Between(pointer.x, pointer.y, w / 2, h / 2)
  }

  move(pointer) {
    if (this.spinning) return

    if (this.isDown) {
      const angle =
        Phaser.Math.RAD_TO_DEG *
        Phaser.Math.Angle.Between(pointer.x, pointer.y, w / 2, h / 2)
      this.xDelta = this.lastX - pointer.x
      this.yDelta = this.lastY - pointer.y
      this.container.angle = this.startAngle + (angle - this.startAngleD)
      this.lastX = pointer.x
      this.lastY = pointer.y
    }
  }

  release(pointer) {
    if (this.spinning) return

    this.isDown = false
    let force = this.xDelta + this.yDelta
    if (Math.abs(force) > 30) {
      this.spin(force > 0 ? -1 : 1)
    }
  }

  finish() {
    if (!this.spinning) return

    const selectedIndex =
      (Math.floor((this.container.angle + 180) / 60) + 3) % 6
    const segment = SEGMENTS[selectedIndex]

    this.emitters[segment.icon].active = true
    this.emitters[segment.icon].explode(25)

    this.emitters.confetti.emitters.list.forEach((e) => {
      e.active = true
    })

    this.time.addEvent({
      delay: 10,
      callback: () => {
        this.sound.play('win', { volume: 0.5 })
        this.time.addEvent({
          delay: 2500,
          callback: () => {
            this.time.addEvent({
              delay: 1000,
              callback: () => {
                this.headingText.text = 'Try your luck!'
                this.emitters.confetti.destroy()
                this.emitters.confetti = this.add.particles('confetti', [
                  { frame: 0, ...this.confettiConfig },
                  { frame: 1, ...this.confettiConfig },
                  { frame: 2, ...this.confettiConfig },
                ])
              },
            })
            this.spinning = false
            this.tweens.add({
              targets: this.buttonGraphics,
              alpha: 1,
              duration: 500,
            })
            this.scene.launch('Score', { prize: segment.heading })
          },
        })
      },
    })
  }

  spin(direction = 1, duration = SPIN_DURATION) {
    this.spinTween && this.spinTween.remove()
    if (this.spinning) return

    const targetIndex = PRIZES[spinCount % PRIZES.length]
    const variance = Math.random() * 30 - 15

    this.spinTween = this.tweens.add({
      targets: [this.container],
      angle: 5790 * direction + 60 * targetIndex + variance,
      duration: duration,
      ease: 'Cubic.easeOut',
      onComplete: this.finish.bind(this),
    })

    let tick = (delay) => {
      this.time.addEvent({
        delay,
        callback: () => {
          if (!this.spinning) return

          window.navigator.vibrate && window.navigator.vibrate(50)

          this.sound.play('spin', { volume: 0.5, rate: 2 - delay / 1000 })

          this.tweens.add({
            targets: [this.cursor],
            angle: -8,
            // scale: 1.05,
            yoyo: true,
            duration: 30,
            ease: 'Cubic.easeInOut',
          })
          if (delay < 350) {
            tick(delay * 1.08)
          }
        },
      })
    }

    tick(50)

    spinCount++
    this.spinning = true
    this.headingText.text = '👀'

    this.tweens.add({
      targets: this.buttonGraphics,
      alpha: 0,
      duration: 500,
    })
  }

  drawWheel() {
    this.shadow = this.add
      .sprite(w / 2, h / 2 + 10, 'shadow')
      .setScale(0.94)
      .setAlpha(0.4)
    this.wheel = this.add.graphics()

    // Draw bg
    this.wheel.arc(0, 0, w / 2.5, 0, 6.1)
    this.wheel.fillStyle(0x000000)
    this.wheel.fill()
    let children = []
    const arr = [...SEGMENTS]
    arr.reverse().forEach(({ icon, label }, i) => {
      // Draw segment bg
      this.wheel.beginPath()
      const segmentColor = i % 2 === 0 ? 0x65af87 : 0x417057
      this.wheel.lineStyle(w / 3.8, segmentColor)
      this.wheel.arc(0, 0, w / 4.1, this.getAngle(i), this.getAngle(i + 1))
      this.wheel.strokePath()

      // Draw image and text
      const offset = 1.05
      const angle = frags * i * Math.PI - offset
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
    this.container.angle = Math.floor(Math.random() * SEGMENTS.length) * 60 + 30
    this.container.setDepth(19)
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

    this.cursor.setDepth(20)
    this.tabText.setDepth(21)
  }

  drawUI() {
    const headingStyle = { ...font, fontSize: 70 }
    const bodyStyle = { ...font, fontSize: 35 }

    this.headingText = this.add
      .text(w / 2, h / 7, 'Try your luck!', headingStyle)
      .setOrigin(0.5)

    this.buttonGraphics = this.add.graphics()
    this.buttonGraphics.fillStyle(0x000000)
    this.buttonGraphics.fillRoundedRect(w / 2 - 250, h * 0.8, 500, 120, 60)
    this.buttonGraphics.setDepth(21)

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
      .setDepth(22)
  }

  getAngle(n) {
    return (((Math.PI / 180) * 360) / SEGMENTS.length) * n + 0.525
  }
}
