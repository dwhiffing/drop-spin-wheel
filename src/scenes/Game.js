import { SEGMENTS } from '../constants'

const SPIN_DURATION = 5000

let w, h
const font = {
  fontSize: 45,
  fontFamily: 'SailecBold',
  color: '#000',
}
const frags = 360 / SEGMENTS.length / 180
const PRIZES = [5, 1, 4, 0, 2, 3]
let spinCount = 0
// TODO: win screen
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
    // this.musicAsset = this.sound.add('music', { volume: 0.7, loop: true })
    // this.musicAsset.play()

    this.emitters = {}
    this.emitterConfig = {
      x: w / 2,
      y: h / 2 - 300,
      speed: { min: -800, max: 800 },
      rotate: { min: -500, max: 500, start: -500, end: 500 },
      angle: { min: 0, max: 360 },
      scale: { min: 0.2, max: 0.5 },
      alpha: { start: 1, end: 0 },
      active: false,
      lifespan: { min: 500, max: 3000 },
      gravityY: 1200,
    }
    this.emitterConfig2 = {
      x: w / 2,
      y: h / 2,
      angle: { min: 180, max: 360 },
      rotate: { min: -500, max: 500, start: -500, end: 500 },
      speed: { min: 800, max: 1500 },
      lifespan: 5000,
      gravityY: 1000,
      quantity: 1,
      active: false,
      scale: { min: 0.1, max: 1 },
    }
    this.emitters.confetti = this.add.particles('confetti', [
      { frame: 0, ...this.emitterConfig2 },
      { frame: 1, ...this.emitterConfig2 },
      { frame: 2, ...this.emitterConfig2 },
    ])
    this.emitters.coin = this.add
      .particles('coin')
      .createEmitter(this.emitterConfig)
    this.emitters.question = this.add
      .particles('question')
      .createEmitter(this.emitterConfig)
    this.emitters.hand = this.add
      .particles('hand')
      .createEmitter(this.emitterConfig)

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
    // TODO: start time needs to be reset whenever cursor hasn't moved much
    const timeDelta = this.startTime - new Date()
    const xDelta = this.startX - pointer.x
    const force = xDelta / timeDelta
    if (force > 2) {
      this.spin()
    } else {
      this.spin(force * 100, 1000)
    }
  }

  finish() {
    if (!this.spinning) return

    this.spinning = false
    this.tweens.add({
      targets: this.buttonGraphics,
      alpha: 1,
      duration: 500,
    })
    const selectedIndex =
      (Math.floor((this.container.angle + 180) / 60) + 3) % 6
    const segment = SEGMENTS[selectedIndex]
    // this.emitters[segment.icon].active = true
    // this.emitters[segment.icon].explode(30 + 10 * (segment.value || 1))
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
            // this.tweens.add({
            //   targets: this.musicAsset,
            //   volume: 0.7,
            //   duration: 500,
            // })
            this.time.addEvent({
              delay: 1000,
              callback: () => {
                this.headingText.text = 'Try your luck!'
                this.emitters.confetti.destroy()
                this.emitters.confetti = this.add.particles('confetti', [
                  { frame: 0, ...this.emitterConfig2 },
                  { frame: 1, ...this.emitterConfig2 },
                  { frame: 2, ...this.emitterConfig2 },
                ])
              },
            })
            this.scene.launch('Score', { prize: segment.heading })
          },
        })
      },
    })
  }

  spin(amount = 5000 + Math.random() * 1000, duration = SPIN_DURATION) {
    this.spinTween && this.spinTween.remove()
    if (this.spinning) return

    // this.tweens.add({
    //   targets: this.musicAsset,
    //   volume: 0.2,
    //   duration: 500,
    // })

    // const targetIndex = Math.floor(Math.random() * SEGMENTS.length)
    const targetIndex = PRIZES[spinCount % PRIZES.length]
    const variance = Math.random() * 30 - 15

    this.spinTween = this.tweens.add({
      targets: [this.container],
      angle: amount > 1000 ? 5790 + 60 * targetIndex + variance : amount,
      duration: duration,
      ease: 'Cubic.easeOut',
      onComplete: amount > 1000 ? this.finish.bind(this) : null,
    })
    // this.sound.play('spin3', { volume: 0.5 })

    let tick = (delay) => {
      this.time.addEvent({
        delay,
        callback: () => {
          if (!this.spinning) return

          window.navigator.vibrate && window.navigator.vibrate(50)

          this.sound.play('spin', { volume: 0.5, rate: 2 - delay / 650 })

          this.tweens.add({
            targets: [this.cursor],
            scale: 1 + (500 - delay) / 6000,
            yoyo: true,
            duration: 20,
            ease: 'Cubic.easeInOut',
          })
          if (delay < 350) {
            tick(delay * 1.08)
          }
        },
      })
    }

    tick(50)

    if (amount > 1000) {
      spinCount++
      this.spinning = true
      this.headingText.text = '👀'

      this.tweens.add({
        targets: this.buttonGraphics,
        alpha: 0,
        duration: 500,
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
    const arr = [...SEGMENTS]
    arr.reverse().forEach(({ icon, label }, i) => {
      // Draw segment bg
      this.wheel.beginPath()
      const segmentColor = i % 2 === 0 ? 0x65af87 : 0x417057
      this.wheel.lineStyle(w / 3.8, segmentColor)
      this.wheel.arc(0, 0, w / 4.1, this.getAngle(i), this.getAngle(i + 1))
      this.wheel.strokePath()

      // Draw image and text
      // TODO: offset only works for 6 segments
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
    return (((Math.PI / 180) * 360) / SEGMENTS.length) * n + 0.525
  }
}
