import {
  SEGMENTS,
  SPIN_DURATION,
  PRIMARY_COLOR,
  SECONDARY_COLOR,
  BACKGROUND_COLOR,
  FOREGROUND_COLOR,
} from './constants'

const frags = 360 / SEGMENTS.length / 180
let w, h
const font = {
  fontSize: 45,
  fontFamily: 'SailecBold',
  color: '#000',
}

export default class {
  constructor(scene) {
    this.scene = scene
    w = scene.cameras.main.width
    h = scene.cameras.main.height
    this.drawWheel = this.drawWheel.bind(this)
    this.drawCursor = this.drawCursor.bind(this)
    this.drawWheel()
    this.drawCursor()
  }

  drawWheel() {
    this.shadow = this.scene.add
      .sprite(w / 2, h / 2 + 10, 'shadow')
      .setScale(0.94)
      .setAlpha(0.4)

    this.wheel = this.scene.add
      .graphics()

      // Draw bg
      .beginPath()
      .arc(0, 0, w / 2.5, 0, 2 * Math.PI)
      .fillStyle(BACKGROUND_COLOR)
      .fill()

      .beginPath()
      .arc(0, 0, w / 2.67, 0, 2 * Math.PI)
      .fillStyle(SECONDARY_COLOR)
      .fill()

    let children = []
    const arr = [...SEGMENTS]
    arr.reverse().forEach(({ icon, label }, i) => {
      // Draw segment bg
      const segmentColor = i % 2 === 0 ? PRIMARY_COLOR : SECONDARY_COLOR
      this.wheel
        .beginPath()
        .lineStyle(w / 3.8, segmentColor)
        .arc(0, 0, w / 4.1, this.getAngle(i), this.getAngle(i + 1))
        .strokePath()

      // Draw image and text
      const angle = frags * i * Math.PI - 1.05
      const degs = angle * (180 / Math.PI) + 90
      const style = { ...font, color: '#fff' }
      children.push(
        this.scene.add
          .image(300 * Math.cos(angle), 300 * Math.sin(angle), icon)
          .setScale(0.9)
          .setAngle(degs),
      )
      children.push(
        this.scene.add
          .text(180 * Math.cos(angle), 180 * Math.sin(angle), label, style)
          .setOrigin(0.5)
          .setAngle(degs),
      )
    })

    this.container = this.scene.add
      .container(w / 2, h / 2, [this.wheel, ...children])
      .setDepth(2)
      .setAngle(Math.floor(Math.random() * SEGMENTS.length) * 60 + 30)
  }

  drawCursor() {
    this.cursor = this.scene.add
      .graphics()
      .setDepth(2)
      .fillStyle(BACKGROUND_COLOR)

      // outer circle
      .arc(0, 0, w / 8.7, 0, Math.PI * 2)

      // arrow
      .moveTo(0, -140)
      .lineTo(-20, -120)
      .lineTo(20, -120)
      .fill()

      // inner circle
      .beginPath()
      .arc(0, 0, w / 10.7, 0, Math.PI * 2)
      .fillStyle(FOREGROUND_COLOR)
      .fill()

      // center
      .setPosition(w / 2, h / 2)

    this.tabText = this.scene.add
      .text(w / 2, h / 2, '???', { ...font, fontSize: 60 })
      .setOrigin(0.5)
      .setDepth(3)
  }

  spin(direction = 1, duration = SPIN_DURATION) {
    this.spinTween && this.spinTween.remove()

    if (this.spinning) return
    this.spinning = true

    const targetIndex = Phaser.Math.RND.pick([0, 1, 2, 3, 4, 5])
    const variance = Math.random() * 30 - 15

    this.spinTween = this.scene.tweens.add({
      targets: [this.container],
      angle: 5790 * direction + 60 * targetIndex + variance,
      duration: duration,
      ease: 'Cubic.easeOut',
      onComplete: this.scene.onFinishSpinning,
    })

    let tick = (delay) => {
      if (delay > 350) return

      this.scene.time.addEvent({
        delay,
        callback: () => {
          if (!this.spinning) return

          this.scene.playSound('spin', { volume: 0.25, rate: 2 - delay / 1000 })
          window.navigator.vibrate && window.navigator.vibrate(50)

          this.scene.tweens.add({
            targets: [this.cursor],
            angle: -8,
            yoyo: true,
            duration: 30,
            ease: 'Cubic.easeInOut',
          })
          tick(delay * 1.08)
        },
      })
    }

    tick(50)
  }

  getAngle(n) {
    return (((Math.PI / 180) * 360) / SEGMENTS.length) * n + 0.525
  }
}
