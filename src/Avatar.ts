import { AnimationAction, AnimationMixer, Group, Mesh, AnimationUtils } from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js'
import avatar_walk from './assets/models/avatar_compressed.glb'
import avatar_idle from './assets/models/idle.glb'
import avatar_pose from './assets/models/pose.glb'
import avatar_jump from './assets/models/jump.glb'

export default class avatar extends Group {
  mixer?: AnimationMixer
  glTFLoader: GLTFLoader

  constructor() {
    super()

    const dracoLoader = new DRACOLoader()
    dracoLoader.setDecoderPath('jsm/libs/draco/')

    this.glTFLoader = new GLTFLoader()
    this.glTFLoader.setDRACOLoader(dracoLoader)
  }

  async init(animationActions: { [key: string]: AnimationAction }) {
    const [avatar, idle, jump, pose] = await Promise.all([
      this.glTFLoader.loadAsync(avatar_walk),
      this.glTFLoader.loadAsync(avatar_idle),
      this.glTFLoader.loadAsync(avatar_jump),
      this.glTFLoader.loadAsync(avatar_pose),
    ])

    avatar.scene.traverse((m) => {
      if ((m as Mesh).isMesh) {
        m.castShadow = true
      }
    })

    this.mixer = new AnimationMixer(avatar.scene)
    animationActions['idle'] = this.mixer.clipAction(idle.animations[0])
    animationActions['walk'] = this.mixer.clipAction(AnimationUtils.subclip(avatar.animations[0], 'walk', 0, 42))
    // jump.animations[0].tracks = jump.animations[0].tracks.filter(function (e) {
    //   return !e.name.endsWith('.position')
    // })
    //console.log(jump.animations[0].tracks)
    animationActions['jump'] = this.mixer.clipAction(jump.animations[0])
    animationActions['pose'] = this.mixer.clipAction(pose.animations[0])

    animationActions['idle'].play()

    this.add(avatar.scene)
  }

  update(delta: number) {
    this.mixer?.update(delta)
  }
}