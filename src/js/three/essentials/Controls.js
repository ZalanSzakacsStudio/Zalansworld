import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

class Controls {
    controls = null;

    constructor(camera, canvas) {
        this.controls = new OrbitControls(camera, canvas);

        this.controls.enableKeys = false;
        // this.controls.enableZoom = false;
        // this.controls.enablePan = false;
        this.controls.enableDamping = true;
        this.controls.rotateSpeed = 0.1;
        this.controls.dampingFactor = 0.15;

        return this.controls;
    }
}

export default Controls;
