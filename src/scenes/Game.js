import { SEGMENTS, BACKGROUND_COLOR } from '../constants'
import Particles from '../Particles'
import Wheel from '../Wheel'

let w, h
const font = {
  fontSize: 45,
  fontFamily: 'SailecBold',
  color: '#000',
}

// TODO: backend integration

export default class extends Phaser.Scene {
  constructor() {
    super({ key: 'Game' })
    this.spin = this.spin.bind(this)
    this.drawUI = this.drawUI.bind(this)
    this.click = this.click.bind(this)
    this.move = this.move.bind(this)
    this.release = this.release.bind(this)
    this.onFinishSpinning = this.onFinishSpinning.bind(this)
    this.playSound = this.playSound.bind(this)
  }

  init() {
    w = this.cameras.main.width
    h = this.cameras.main.height
  }

  create() {
    this.particles = new Particles(this)
    this.wheel = new Wheel(this)
    this.drawUI()

    this.input.on('pointermove', this.move, this)
    this.input.on('pointerdown', this.click, this)
    this.input.on('pointerup', this.release, this)
  }

  click(pointer) {
    if (this.wheel.spinning) return
    this.last = { x: pointer.x, y: pointer.y }
    this.isDown = true
    this.startAngle = this.wheel.container.angle
    this.startAngleD =
      Phaser.Math.RAD_TO_DEG *
      Phaser.Math.Angle.Between(pointer.x, pointer.y, w / 2, h / 2)
  }

  move(pointer) {
    if (this.wheel.spinning) return

    if (this.isDown) {
      const angle =
        Phaser.Math.RAD_TO_DEG *
        Phaser.Math.Angle.Between(pointer.x, pointer.y, w / 2, h / 2)
      this.force = this.last.x - pointer.x + (this.last.y - pointer.y)
      this.wheel.container.angle = this.startAngle + (angle - this.startAngleD)
      this.last = { x: pointer.x, y: pointer.y }
    }
  }

  release() {
    this.isDown = false
    if (Math.abs(this.force) > 30) {
      this.spin(this.force > 0 ? -1 : 1)
    }
  }

  spin(direction) {
    this.wheel.spin(direction)

    this.tweens.add({
      targets: [this.buttonGraphics, this.headingText],
      alpha: 0,
      duration: 500,
    })
  }

  onFinishSpinning() {
    if (!this.wheel.spinning) return

    const selectedIndex =
      (Math.floor((this.wheel.container.angle + 180) / 60) + 3) % 6
    const segment = SEGMENTS[selectedIndex]

    this.particles.confettiRain()

    this.time.addEvent({
      delay: 150,
      callback: () => {
        this.particles.iconBlast(segment.icon)
        this.playSound('win', { volume: 0.5 })
        this.scene.launch('Score', { prize: segment.heading })
      },
    })
  }

  drawUI() {
    const headingStyle = { ...font, fontSize: 70 }
    const bodyStyle = { ...font, fontSize: 35 }

    this.headingText = this.add
      .text(w / 2, h / 7, 'Try your luck!', headingStyle)
      .setOrigin(0.5)

    this.buttonGraphics = this.add.graphics()
    this.buttonGraphics.fillStyle(BACKGROUND_COLOR)
    this.buttonGraphics.fillRoundedRect(w / 2 - 250, h * 0.8, 500, 120, 60)
    this.buttonGraphics.setDepth(3)

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
      .setDepth(4)
  }

  playSound(key, opts = {}) {
    try {
      this.sound.play(key, opts)
    } catch (e) {}
  }
}
