import * as THREE from 'three';

class Renderer {
    /**
     * @type {WebGLRenderer}
     */
    renderer = null;

    /**
     * Renderer constructor
     * @param width - Width of the client
     * @param height - Height of the client
     * @returns {WebGLRenderer}
     */
    constructor(width, height) {
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            preserveDrawingBuffer: true,
            alpha: true
        });
        // Set the right devicePixelRatio, Retina displays would otherwise show objects in a grainy look
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(width, height);
        // this.renderer.setClearColor(0xffffff, 0);

        // ENABLE VR
        this.renderer.xr.enabled = true;

        return this.renderer;
    }
}

export default Renderer;
