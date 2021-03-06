<template>
  <div class="viewer u-cf">
    <transition
        name="fade"
        mode="out-in"
    >
      <div
          class="overlay"
          :class="{
            'overlay--done': !loading
          }"
          v-if="!started"
      >
        <div class="overlay__background">
          <p class="overlay__text">
            WELCOME TO ZALANSWORLD
          </p>
        </div>
        <button
            class="startButton"
            @click="start"
            v-if="!loading"
        >
          EXPLORE
        </button>
      </div>
    </transition>
    <div
        ref="viewer"
        class="viewer__background"
    />
  </div>
</template>

<script>
import * as THREE from 'three';
import TWEEN from '@tweenjs/tween.js';
import { VRButton } from 'three/examples/jsm/webxr/VRButton';
import {
  AUDIO_ENHANCEMENT,
  SCENE_POSITION, SCENE_START_DELAY, SCENE_TIMING,
  WALL_DEPTH, WALL_HEIGHT, WALL_WIDTH
} from '../viewer-config';

import Controls from '../three/essentials/Controls';
import Renderer from '../three/essentials/Renderer';
import Choreograph from '../three/objects/Choreograph';
import getTexture from '../three/objects/TextureHelper';
import { getMirror, getWall } from '../three/objects/ReflectiveWall';

export default {
  data() {
    return {
      width: 0,
      height: 0,
      scene: null,
      ambLight: null,
      camera: null,
      controls: null,
      renderer: null,
      sceneElements: null,
      started: false,
      choreograph: null,
      sceneTween: null,
      loading: true
    };
  },
  mounted() {
    window.addEventListener('resize', this.handleResize);
    this.init();
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize);
  },
  methods: {
    init() {
      this.createScene();
      this.createCamera();
      this.renderer = new Renderer(this.width, this.height);
      this.setupControls();

      this.setupViewer();
      this.handleResize();

      this.setupLighting();
      this.setupBox();
    },
    setupControls() {
      this.controls = new Controls(this.camera, this.renderer.domElement);

      this.camera.position.set(0, WALL_HEIGHT / 2, 0);
      this.controls.target.set(1, WALL_HEIGHT / 2, 0);
      this.controls.update();
    },
    setupBox() {
      this.sceneElements = new THREE.Object3D();
      this.sceneElements.position.copy(new THREE.Vector3(...SCENE_POSITION.START));
      this.scene.add(this.sceneElements);

      const reflectorPosition = .3;
      /*
      FLOOR
      */
      const floorSize = new THREE.Vector2(WALL_DEPTH, WALL_WIDTH);
      const floor = getWall(floorSize, getTexture('M', .4));
      floor.rotation.x = -Math.PI / 2;
      this.sceneElements.add(floor);

      const floorMirror = getMirror(floorSize, 0x010e2a);
      floorMirror.scale.add(new THREE.Vector3(0, WALL_WIDTH * .00001, 0));
      floorMirror.position.y -= reflectorPosition;
      floorMirror.rotation.copy(floor.rotation);
      this.sceneElements.add(floorMirror);

      /*
      LEFT WALL
       */
      const leftWallSize = new THREE.Vector2(WALL_DEPTH, WALL_HEIGHT);
      const leftWall = getWall(leftWallSize, getTexture('C', .8));
      leftWall.position.z = -floorSize.height / 2;
      leftWall.position.y += WALL_HEIGHT / 2;
      this.sceneElements.add(leftWall);

      const leftWallMirrorSize = leftWallSize.clone();
      leftWallMirrorSize.x -= 20;
      const leftWallMirror = getMirror(leftWallMirrorSize, 0xffffff);
      leftWallMirror.position.copy(leftWall.position);
      leftWallMirror.position.z -= reflectorPosition;
      this.sceneElements.add(leftWallMirror);

      /*
      RIGHT WALL
       */
      const rightWallSize = new THREE.Vector2(WALL_DEPTH, WALL_HEIGHT);
      const rightWall = getWall(rightWallSize, getTexture('C', .8, THREE.Math.degToRad(180)));
      rightWall.position.z = floorSize.height / 2;
      rightWall.position.y += WALL_HEIGHT / 2;
      rightWall.rotateY(THREE.Math.degToRad(180));
      this.sceneElements.add(rightWall);

      const rightWallMirror = getMirror(rightWallSize, 0xffffff);
      rightWallMirror.rotation.copy(rightWall.rotation);
      rightWallMirror.position.copy(rightWall.position);
      rightWallMirror.position.z += reflectorPosition;
      this.sceneElements.add(rightWallMirror);

      /*
      CEILING
      */
      const ceiling = getWall(floorSize, getTexture('C', 1));
      ceiling.rotation.x = Math.PI / 2;
      ceiling.position.y = WALL_HEIGHT;
      this.sceneElements.add(ceiling);

      const whiteSpace = new THREE.Mesh(new THREE.BoxBufferGeometry(WALL_WIDTH, WALL_HEIGHT - 1, WALL_WIDTH - 1));
      whiteSpace.material = new THREE.MeshLambertMaterial({
        color: 0xffffff,
        emissive: 5,
        side: THREE.DoubleSide
      });
      whiteSpace.position.y = WALL_HEIGHT / 2;
      whiteSpace.position.x = WALL_DEPTH / 2 - 50;
      this.sceneElements.add(whiteSpace);

      // Initialise the choreograph
      this.choreograph = new Choreograph(this.sceneElements);

      this.sceneTween = new TWEEN.Tween(this.sceneElements.position).to(new THREE.Vector3(...SCENE_POSITION.BETWEEN)).duration(SCENE_TIMING * 1000).delay(SCENE_START_DELAY * 1000).easing(TWEEN.Easing.Sinusoidal.InOut);
      const secondSceneTween = new TWEEN.Tween(this.sceneElements.position).to(new THREE.Vector3(...SCENE_POSITION.END)).duration(8 * 1000).delay(6 * 1000).easing(TWEEN.Easing.Sinusoidal.InOut);
      this.sceneTween.chain(secondSceneTween);

      setTimeout(() => {
        this.render();
        this.loading = false;
      }, 2000);
    },
    createScene() {
      // Overkill to make a separate class for this.
      this.scene = new THREE.Scene();
    },
    createCamera() {
      // Create a camera with the given type, and properties and return it
      this.camera = new THREE.PerspectiveCamera(45, this.width / this.height, 1, 50000);

      // Add the camera to the scene
      this.scene.add(this.camera);
    },
    setAmbientAudio(listener) {
      const audioLoader = new THREE.AudioLoader();
      audioLoader.load('assets/sounds/Drone.mp3', buffer => {
        const audio = new THREE.PositionalAudio(listener);
        audio.setDirectionalCone(360, 360, 1);
        audio.setRefDistance(AUDIO_ENHANCEMENT);
        audio.setBuffer(buffer);
        audio.play();
        this.camera.add(audio);
      });
    },
    setupViewer() {
      this.$refs['viewer'].appendChild(this.renderer.domElement);
      this.$refs['viewer'].appendChild(VRButton.createButton(this.renderer));
    },
    setupLighting() {
      // Add an ambient light to the scene
      this.ambLight = new THREE.AmbientLight(0xffffff, 1);
      this.scene.add(this.ambLight);
    },
    render() {
      if (this.started) {
        this.renderer.setAnimationLoop(this.render);
        TWEEN.update();
        // Update the controls when enableDamping or autoRotate is enabled
        // This is needed to ease out the movement or rotation
        // https://threejs.org/docs/#examples/en/controls/OrbitControls
        if (this.controls.enableDamping || this.controls.autoRotate) {
          this.controls.update();
        }
      }

      this.renderer.render(this.scene, this.camera);
    },
    handleResize() {
      this.width = this.$refs['viewer'].clientWidth;
      this.height = this.$refs['viewer'].clientHeight;
      this.camera.aspect = this.width / this.height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(this.width, this.height);
    },
    start() {
      this.started = true;
      this.render();

      const listener = new THREE.AudioListener();
      this.camera.add(listener);

      this.setAmbientAudio(listener);

      this.choreograph.setAudio(listener);
      this.choreograph.start();
      this.sceneTween.start();
    }
  }
};
</script>

<style
    scoped
    lang="scss"
>
.viewer {
  height: 100%;
  overflow: hidden;

  &__background {
    height: 100%;
  }
}

@keyframes fadein {
  0% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}

@-webkit-keyframes fadein {
  0% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}

$buttonColor: #001242;

.overlay {
  display: flex;
  justify-content: center;
  align-items: center;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: transparent;
  transition: background .2s;

  .overlay__background {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    text-align: center;
    align-items: center;
    background-image: url('../../../public/assets/images/VOID_material_I.png');
  }

  .overlay__text {
    width: 100%;
    font-size: 1em;
    color: $buttonColor
  }

  &--done {
    .overlay__background {
      animation-name: fadein;
      animation-duration: 1s;
      animation-fill-mode: forwards;
      pointer-events: none;
    }
  }

  $buttonSize: 200px;
  $circlePosition: calc(50% - #{$buttonSize / 2});

  .startButton {
    appearance: none;
    background: transparent;
    border-radius: 100%;
    height: $buttonSize;
    width: $buttonSize;
    left: $circlePosition;
    top: $circlePosition;
    border: 2px solid $buttonColor;
    color: $buttonColor;
    outline: none;
    cursor: pointer;
    font-size: 1em;
  }
}
</style>
