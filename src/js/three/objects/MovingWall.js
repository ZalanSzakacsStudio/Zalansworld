import { EventEmitter } from 'events';
import * as THREE from 'three';
import TWEEN from '@tweenjs/tween.js';
import { getWall } from './ReflectiveWall';

class MovingWall extends EventEmitter {
    /**
     * The object where the wall should be added to
     * @type {Object3D}
     */
    object = null;

    /**
     * Size of the wall
     * @type {Vector2}
     */
    size = null;

    /**
     * Material of the wall
     * @type {Material}
     */
    material = null;

    /**
     * Rotation of the wall
     * @type {Vector3}
     */
    rotation = null;

    /**
     * Start delay in seconds
     * @type {number}
     */
    delay = 0;

    /**
     * Animation timing in seconds
     * @type {number}
     */
    timing = 0;

    /**
     * The wall
     * @type {THREE.Mesh}
     */
    wall = null;

    /**
     * Tween object
     * @type {Tween}
     */
    tween = null;

    /**
     * Does this wall needs to be destroyed after the animation is completed ?
     * @type {boolean}
     */
    destroyOnComplete = false;

    /**
     * After how many seconds should the wall be DESTROYED
     * @type {number}
     */
    destroyDelay = 0;

    /**
     * Spawns the wall in the passed object parameter of the constructor just before the tween is started (= delay)
     * @type {boolean}
     */
    spawnOnStart = true;

    /**
     * Amount of chains, this is needed so we know when to dispose the wall
     * @type {number}
     */
    chains = 0;

    /**
     *
     * @type {PositionalAudio}
     */
    audio = null;

    /**
     * Debug mode
     * @type {boolean}
     */
    debug = false;

    /**
     *
     * @param object {Object3D}
     * @param size {Vector2}
     * @param material {Material}
     * @param position {Vector3}
     * @param delay {number}
     * @param timing {number}
     * @param spawnOnStart {boolean}
     */
    constructor(object, size, material, position, delay, timing, spawnOnStart = true) {
        super();
        this.object = object;
        this.size = size;
        this.material = material;
        this.delay = delay * 1000;
        this.timing = timing * 1000;
        this.spawnOnStart = spawnOnStart;

        this.setupWall(position);
    }

    /**
     * Add a target position for the wall
     * @param target {Vector3} position
     * @param options {object}
     * @param options.delay {number} - delay in seconds, leave open to use the delay passed to the constructor
     * @param options.timing {number} - timing in seconds, leave open to use the timing passed to the constructor
     */
    addTargetPosition(target, options = {}) {
        if (!this.hasEndValues()) {
            this.setTargetPosition(this.wall.position);
        }
        const tween = this.getInitialTweenInstance(this.wall.position, options.delay, options.timing);
        tween.to(target);
        tween.onStart(() => {
            if (this.debug) {
                console.log('Position animation');
            }
            this.playAudio();
        });
        tween.onComplete(() => this.onComplete());
        this.appendToTween(this.tween, tween);
    }

    /**
     * Add a target rotation for the wall
     * @param target {Vector3} position
     * @param options {object}
     * @param options.delay {number} - delay in seconds, leave open to use the delay passed to the constructor
     * @param options.timing {number} - timing in seconds, leave open to use the timing passed to the constructor
     */
    addTargetRotation(target, options = {}) {
        const tween = this.getInitialTweenInstance(this.rotation, options.delay, options.timing);
        tween.to(target);
        tween.onStart(() => {
            if (this.debug) {
                console.log('Rotation animation');
            }
            this.playAudio();
        });
        tween.onUpdate(() => this.onUpdateRotation());
        tween.onComplete(() => this.onComplete());
        this.appendToTween(this.tween, tween);
    }

    /**
     * Add a target scale for the wall
     * @param target {Vector2} position
     * @param options {object}
     * @param options.delay {number} - delay in seconds, leave open to use the delay passed to the constructor
     * @param options.timing {number} - timing in seconds, leave open to use the timing passed to the constructor
     */
    addTargetScale(target, options = {}) {
        const tween = this.getInitialTweenInstance(this.size, options.delay, options.timing);
        tween.to(new THREE.Vector3(target.x, target.y, 1));
        tween.onStart(() => {
            if (this.debug) {
                console.log('Scale animation');
            }
            this.playAudio();
        });
        tween.onUpdate(() => this.onUpdateScale());
        tween.onComplete(() => this.onComplete());
        this.appendToTween(this.tween, tween);
    }

    /**
     * Add wall to the passed object in the constructor
     */
    addWallToObject() {
        this.object.add(this.wall);
    }

    /**
     * Chain the tween to or the main tween object or the deepest nested chained tween object
     * @param tween {Tween}
     * @param chainTween {Tween}
     */
    appendToTween(tween, chainTween) {
        if (tween._chainedTweens.length === 0) {
            tween.chain(chainTween);
            this.chains++;
            if (this.debug) {
                console.log('Animation chain added');
            }
        } else {
            this.appendToTween(tween._chainedTweens[0], chainTween);
        }
    }

    /**
     * Remove the wall from the object
     * Dispose the geometry and material
     */
    disposeWall() {
        if (this.wall.parent !== null) {
            this.object.remove(this.wall);
        }
        this.wall.geometry.dispose();
        this.wall.material.dispose();
        this.emit('destroyed');
    }

    /**
     * Check if the main tween has an end value (this means setTargetPosition has been used)
     * @returns {boolean}
     */
    hasEndValues() {
        return (this.tween._valuesEnd && Object.keys(this.tween._valuesEnd).length > 0);
    }

    /**
     * Create a wall object and set it's position
     * Spawn the wall if spawnOnStart is false
     * @param position {Vector3}
     */
    setupWall(position) {
        this.wall = getWall(this.size, this.material);
        this.wall.position.copy(position);
        this.rotation = this.wall.rotation.clone();

        if (!this.spawnOnStart) {
            this.addWallToObject();
        }

        this.setupTween();
    }

    /**
     * Get a new instance of the tween object with the passed delay and timing
     * @param startObject {Vector2|Euler}
     * @param delay {number}
     * @param timing {number}
     * @returns {Tween}
     */
    getInitialTweenInstance(startObject, delay = undefined, timing = undefined) {
        return new TWEEN.Tween(startObject).delay(delay !== undefined ? delay * 1000 : this.delay).duration(timing !== undefined ? timing * 1000 : this.timing).easing(TWEEN.Easing.Linear.None);
    }

    /**
     * Setup the initial and main tween object
     */
    setupTween() {
        this.tween = this.getInitialTweenInstance(this.wall.position);
        this.tween.onStart(() => {
            this.onStart();
            if (this.debug) {
                console.log('Animation start');
                console.log(this.tween);
            }
            if (this.wall.position.distanceTo(this.tween._valuesEnd) > 0) {
                this.playAudio();
            }
        });
        this.tween.onComplete(() => this.onComplete());
    }

    /**
     * OnStart function called just before tween starts the animation
     */
    onStart() {
        if (this.spawnOnStart) {
            if (this.debug) {
                console.log('Spawned wall');
            }
            this.addWallToObject();
        }
    }

    /**
     * OnComplete function called when tween has ended
     */
    onComplete() {
        this.stopAudio();
        if (this.chains > 0) {
            this.chains--;
        }
        if (this.debug) {
            console.log('Animation completed chains left: ', this.chains);
        }
        if (this.destroyOnComplete && this.chains === 0) {
            if (this.destroyDelay > 0) {
                if (this.debug) {
                    console.log(`Wall will be removed after ${ this.destroyDelay } seconds`);
                }
                setTimeout(() => {
                    this.disposeWall();
                }, this.destroyDelay * 1000);
            } else {
                this.disposeWall();
            }
        }
    }

    /**
     * Update the rotation of the wall
     */
    onUpdateRotation() {
        this.wall.setRotationFromEuler(new THREE.Euler().setFromVector3(this.rotation.clone()));
    }

    /**
     * Update the scale of the wall
     */
    onUpdateScale() {
        this.wall.scale.set(this.size.x, this.size.y, 1);
    }

    /**
     * Play audio
     */
    playAudio() {
        if (this.audio) {
            this.audio.play();
        }
    }

    /**
     * If true the wall will be removed after the animation is finished
     * @param bool {boolean}
     * @param delay {number}
     */
    setDestroyOnComplete(bool = true, delay = 0) {
        this.destroyDelay = delay;
        this.destroyOnComplete = bool;
    }

    /**
     * Spawn the wall just before the animation starts
     * @param bool {boolean}
     */
    setSpawnOnStart(bool = true) {
        this.spawnOnStart = bool;
    }

    /**
     * Set the initial rotation of the wall
     * @param rotation {Vector3}
     */
    setInitialRotation(rotation) {
        this.wall.setRotationFromEuler(new THREE.Euler().setFromVector3(rotation.clone()));
        this.rotation = rotation;
    }

    /**
     * Log everything step to the console
     */
    setDebug() {
        this.debug = true;
    }

    /**
     * Set the target position and adds it to tween (This is the end position of the first tween)
     * @param target {Vector3}
     */
    setTargetPosition(target) {
        if (!this.hasEndValues()) {
            this.tween.to(target);
            this.chains++;
        }
    }

    /**
     *
     * @param audio {PositionalAudio}
     */
    setAudio(audio) {
        this.audio = audio;
        this.audio.loop = true;
        if (this.debug) {
            console.log(this.audio);
        }
        this.wall.add(this.audio);
    }

    /**
     * Start the tween
     */
    start() {
        this.tween.start();
    }

    stopAudio() {
        if (this.audio && this.audio.isPlaying) {
            this.audio.stop();
        }
    }
}

export default MovingWall;
