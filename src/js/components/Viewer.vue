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
    SCENE_POSITION,
    SCENE_START_DELAY,
    SCENE_TIMING,
    WALL_DEPTH,
    WALL_HEIGHT,
    WALL_WIDTH
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

        window.mobileCheck = function () {
            let check = false;
            (function (a) {
                if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true;
            })(navigator.userAgent || navigator.vendor || window.opera);
            return check;
        };

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

            this.camera.position.set(0, 0, 0);
            this.controls.target.set(1, 0, 0);
            this.controls.update();
        },
        setupBox() {
            this.sceneElements = new THREE.Object3D();
            this.sceneElements.position.copy(new THREE.Vector3(...SCENE_POSITION.START));
            this.scene.add(this.sceneElements);

            const reflectorPosition = window.mobileCheck() ? 5 : .3;
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
            const vrButton = VRButton.createButton(this.renderer);
            this.$refs['viewer'].appendChild(vrButton);
            vrButton.addEventListener('click', () => {
                this.start();
            });
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
