import { AnimationAction, Scene } from "three/src/Three.js";
import Keyboard from "./KeyboardController";
import Avatar from "./Avatar";

export default class AnimationController {
  scene: Scene;
  wait = false;
  animationActions: { [key: string]: AnimationAction } = {};
  activeAction?: AnimationAction;
  speed = 0;
  keyboard: Keyboard;
  model?: Avatar;

  /**
   * Creates a new AnimationController.
   *
   * @param {Scene} scene - The scene in which the animation will be added.
   * @param {Keyboard} keyboard - The KeyboardController to read input from.
   */
  constructor(scene: Scene, keyboard: Keyboard) {
    this.scene = scene;
    this.keyboard = keyboard;
  }

/**
 * Initializes the AnimationController by loading the Avatar model and its animations.
 * Sets the initial active animation to 'idle' and adds the model to the scene.
 * 
 * @returns {Promise<void>} A promise that resolves when the Avatar model and animations are loaded.
 */

  async init() {
    this.model = new Avatar();
    await this.model.init(this.animationActions);
    this.activeAction = this.animationActions["idle"];
    this.scene.add(this.model);
  }

  /**
   * Sets the active animation to the given action.
   * If the given action is different from the current active action, it will fade out the current action and fade in the given action.
   * Also sets the speed of the player depending on the given action.
   * @param {AnimationAction} action - The action to become the active animation.
   */
  setAction(action: AnimationAction) {
    if (this.activeAction != action) {
      this.activeAction?.fadeOut(0.1);
      action.reset().fadeIn(0.1).play();
      this.activeAction = action;

      switch (action) {
        case this.animationActions["walk"]:
          this.speed = 5.25;
          break;
        case this.animationActions["run"]:
        case this.animationActions["jump"]:
          this.speed = 16;
          break;
        case this.animationActions["pose"]:
        case this.animationActions["idle"]:
          this.speed = 0;
          break;
      }
    }
  }

  update(delta: number) {
    if (!this.wait) {
      let actionAssigned = false;

      if (this.keyboard.keyMap["Space"]) {
        this.setAction(this.animationActions["jump"]);
        actionAssigned = true;
        this.wait = true; // blocks further actions until jump is finished
        setTimeout(() => (this.wait = false), 1200);
      }

      // if (
      //   !actionAssigned &&
      //   this.keyboard.keyMap["KeyW"] &&
      //   this.keyboard.keyMap["ShiftLeft"]
      // ) {
      //   this.setAction(this.animationActions["run"]);
      //   actionAssigned = true;
      // }

      // if (!actionAssigned && this.keyboard.keyMap["KeyW"]) {
      //   this.setAction(this.animationActions["walk"]);
      //   actionAssigned = true;
      // }

      if (
        !actionAssigned &&
        (this.keyboard.keyMap['KeyW'] ||
          this.keyboard.keyMap['KeyA'] ||
          this.keyboard.keyMap['KeyS'] ||
          this.keyboard.keyMap['KeyD']) &&
        this.keyboard.keyMap['ShiftLeft']
      ) {
        this.setAction(this.animationActions['run'])
        actionAssigned = true
      }

      if (
        !actionAssigned &&
        (this.keyboard.keyMap['KeyW'] ||
          this.keyboard.keyMap['KeyA'] ||
          this.keyboard.keyMap['KeyS'] ||
          this.keyboard.keyMap['KeyD'])
      ) {
        this.setAction(this.animationActions['walk'])
        actionAssigned = true
      }

      if (!actionAssigned && this.keyboard.keyMap["KeyQ"]) {
        this.setAction(this.animationActions["pose"]);
        actionAssigned = true;
      }

      !actionAssigned && this.setAction(this.animationActions["idle"]);
    }

    // update the Avatar models animation mixer
    this.model?.update(delta);
  }
}
