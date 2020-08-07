import MovingWall from './MovingWall';
import * as THREE from 'three';
import { WALL_DEPTH, WALL_HEIGHT, WALL_WIDTH } from '../../viewer-config';
import getTexture from './TextureHelper';
import { AUDIO_ENHANCEMENT, DEBUG_MODE } from '@/js/viewer-config';

class Choreograph {
    /**
     *
     * @type {Object3D}
     */
    object = null;

    /**
     *
     * @type {Material[]}
     */
    materials = [];

    /**
     *
     * @type {MovingWall[]}
     */
    walls = [];

    /**
     * @param object {Object3D}
     */
    constructor(object) {
        this.object = object;
        this.setupWalls();
    }

    /**
     * Start all walls
     */
    start() {
        this.walls.forEach((wall, index) => {
            wall.start();
            wall.on('destroyed', () => {
                // Remove the wall from the memory (since it's destroyed)
                this.walls.splice(index, 1);
                if (DEBUG_MODE) {
                    console.log('Wall removed');
                }
            });
        });
    }

    /**
     *
     * @param listener {AudioListener}
     */
    setAudio(listener) {
        const audioLoader = new THREE.AudioLoader();
        this.walls.forEach(wall => {
            audioLoader.load(`assets/sounds/${wall.name}.mp3`, buffer => {
                const audio = new THREE.PositionalAudio(listener);
                audio.setDirectionalCone(360, 360, 1);
                audio.setRefDistance(AUDIO_ENHANCEMENT);
                audio.setVolume(.1);
                audio.setBuffer(buffer);
                wall.setAudio(audio);
            });
        });
    }

    setupWalls() {
        const diagonalWallWidth = Math.round(WALL_WIDTH * Math.sqrt(2));
        const one = new MovingWall(this.object,
            new THREE.Vector2(WALL_WIDTH, WALL_HEIGHT), // Size of the wall
            getTexture('M', 1),
            new THREE.Vector3(-WALL_DEPTH / 2, WALL_HEIGHT / 2, 0), // Start position
            1,
            30,
            false);
        one.setInitialRotation(new THREE.Vector3(0, THREE.Math.degToRad(90), 0));
        one.setTargetPosition(new THREE.Vector3(-WALL_DEPTH / 2 + 500, WALL_HEIGHT / 2, 0));
        one.name = '1';
        this.walls.push(one);

        const two = new MovingWall(this.object,
            new THREE.Vector2(diagonalWallWidth, WALL_HEIGHT), // Size of the wall
            getTexture('J', .9),
            new THREE.Vector3(-WALL_DEPTH / 2 + WALL_WIDTH * 2, WALL_HEIGHT / 2, WALL_WIDTH / 2), // Start position
            2,
            10,
            false);
        two.setInitialRotation(new THREE.Vector3(0, THREE.Math.degToRad(-45), 0));
        two.setTargetPosition(new THREE.Vector3(-WALL_DEPTH / 2 + WALL_WIDTH, WALL_HEIGHT / 2, -WALL_WIDTH));
        two.setDestroyOnComplete();
        two.name = '2';
        this.walls.push(two);

        const three = new MovingWall(this.object,
            new THREE.Vector2(WALL_WIDTH, WALL_HEIGHT), // Size of the wall
            getTexture('A', .9),
            new THREE.Vector3(1000, WALL_HEIGHT / 2, 0), // Start position
            2,
            40,
            false);
        three.setInitialRotation(new THREE.Vector3(0, THREE.Math.degToRad(90), 0));
        three.setTargetPosition(new THREE.Vector3(WALL_DEPTH / 2 - WALL_WIDTH / 2, WALL_HEIGHT / 2, 0));
        three.setDestroyOnComplete(true, 20);
        three.name = '3';
        this.walls.push(three);

        const fourTargetPosition = new THREE.Vector3(WALL_DEPTH / 5 + WALL_WIDTH / 2, WALL_HEIGHT / 2, 0);
        const fourTargetScale = new THREE.Vector2(diagonalWallWidth / 2, WALL_HEIGHT);
        const four = new MovingWall(this.object,
            new THREE.Vector2(diagonalWallWidth, WALL_HEIGHT), // Size of the wall
            getTexture('B', .9),
            new THREE.Vector3(WALL_DEPTH / 5, WALL_HEIGHT / 2, -WALL_WIDTH / 2), // Start position
            20,
            8,
            false);
        four.setInitialRotation(new THREE.Vector3(0, THREE.Math.degToRad(-45), 0));
        four.setTargetPosition(fourTargetPosition);
        four.addTargetScale(fourTargetScale, {
            delay: 0,
            timing: 4
        });
        four.addTargetPosition(new THREE.Vector3(WALL_DEPTH / 5 + WALL_WIDTH / 4, WALL_HEIGHT / 2, -WALL_WIDTH * .25), {
            delay: 4,
            timing: 4
        });
        four.addTargetPosition(new THREE.Vector3(WALL_DEPTH / 5 - WALL_WIDTH / 2, WALL_HEIGHT / 2, -diagonalWallWidth * .75), {
            delay: 19,
            timing: 8
        });
        four.setDestroyOnComplete();
        four.name = '4';
        this.walls.push(four);

        const five = new MovingWall(this.object,
            fourTargetScale, // Size of the wall
            getTexture('B', .9),
            fourTargetPosition, // Start position
            32,
            0,
            true);
        five.setInitialRotation(new THREE.Vector3(0, THREE.Math.degToRad(-45), 0));
        five.addTargetRotation(new THREE.Vector3(0, THREE.Math.degToRad(-135), 0), {
            delay: 0,
            timing: 4
        });
        five.addTargetPosition(new THREE.Vector3(WALL_DEPTH / 5 + WALL_WIDTH / 4, WALL_HEIGHT / 2, WALL_WIDTH * .25), {
            delay: 0,
            timing: 4
        });
        five.addTargetPosition(new THREE.Vector3(WALL_DEPTH / 5 - WALL_WIDTH / 2, WALL_HEIGHT / 2, diagonalWallWidth * .75), {
            delay: 19,
            timing: 8
        });
        five.setDestroyOnComplete();
        five.name = '5';
        this.walls.push(five);

        const six = new MovingWall(this.object,
            new THREE.Vector2(diagonalWallWidth, WALL_HEIGHT), // Size of the wall
            getTexture('B', .9),
            new THREE.Vector3(0, WALL_HEIGHT / 2, -diagonalWallWidth * .75), // Start position
            4,
            30,
            false);
        six.setInitialRotation(new THREE.Vector3(0, THREE.Math.degToRad(45), 0));
        six.setTargetPosition(new THREE.Vector3(-diagonalWallWidth * 2, WALL_HEIGHT / 2, diagonalWallWidth * .75));
        six.setDestroyOnComplete();
        six.name = '6';
        this.walls.push(six);

        const seven = new MovingWall(this.object,
            new THREE.Vector2(diagonalWallWidth, WALL_HEIGHT), // Size of the wall
            getTexture('B', .9),
            new THREE.Vector3(0, WALL_HEIGHT / 2, diagonalWallWidth * .75), // Start position
            4,
            26,
            false);
        seven.setInitialRotation(new THREE.Vector3(0, THREE.Math.degToRad(-45), 0));
        seven.setTargetPosition(new THREE.Vector3(-diagonalWallWidth * 2, WALL_HEIGHT / 2, -diagonalWallWidth * .75));
        seven.setDestroyOnComplete();
        seven.name = '7';
        this.walls.push(seven);

        const eightTargetScale = new THREE.Vector2(diagonalWallWidth / 2, WALL_HEIGHT);
        const eightTargetPosition = new THREE.Vector3(-1000 + WALL_WIDTH / 4, WALL_HEIGHT / 2, 0);
        const eight = new MovingWall(this.object,
            new THREE.Vector2(diagonalWallWidth, WALL_HEIGHT), // Size of the wall
            getTexture('F', .9),
            new THREE.Vector3(-1000, WALL_HEIGHT / 2, diagonalWallWidth * .75), // Start position
            36,
            10,
            false);
        eight.setInitialRotation(new THREE.Vector3(0, THREE.Math.degToRad(45), 0));
        eight.setTargetPosition(eightTargetPosition);
        eight.addTargetScale(eightTargetScale, {
            delay: 0,
            timing: 4
        });
        eight.addTargetPosition(new THREE.Vector3(-1000 + WALL_WIDTH / 2, WALL_HEIGHT / 2, -WALL_WIDTH * .25), {
            delay: 4,
            timing: 4
        });
        eight.addTargetPosition(new THREE.Vector3(-1000 + WALL_WIDTH, WALL_HEIGHT / 2, -diagonalWallWidth * .75), {
            delay: 1,
            timing: 8
        });
        eight.setDestroyOnComplete();
        eight.name = '8';
        this.walls.push(eight);

        const nine = new MovingWall(this.object,
            eightTargetScale, // Size of the wall
            getTexture('F', .9),
            eightTargetPosition, // Start position
            50,
            0,
            true);
        nine.setInitialRotation(new THREE.Vector3(0, THREE.Math.degToRad(45), 0));
        nine.addTargetRotation(new THREE.Vector3(0, THREE.Math.degToRad(135), 0), {
            delay: 0,
            timing: 4
        });
        nine.addTargetPosition(new THREE.Vector3(-1000 + WALL_WIDTH / 2, WALL_HEIGHT / 2, WALL_WIDTH * .25), {
            delay: 0,
            timing: 4
        });
        nine.addTargetPosition(new THREE.Vector3(-1000 + WALL_WIDTH, WALL_HEIGHT / 2, diagonalWallWidth * .75), {
            delay: 1,
            timing: 8
        });
        nine.setDestroyOnComplete();
        nine.name = '9';
        this.walls.push(nine);
    }
}

export default Choreograph;
