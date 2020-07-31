import * as THREE from 'three';
import { Reflector } from 'three/examples/jsm/objects/Reflector';
import { REFLECTOR_TEXTURE_SIZE } from '../../viewer-config';
import { SCENE_SCALE } from '@/js/viewer-config';

/**
 *
 * @param size {Vector2}
 * @param material {Material}
 */
const getWall = (size, material) => {
    const wall = new THREE.Mesh(new THREE.PlaneBufferGeometry(1, 1), material);
    wall.scale.set(size.width, size.height, 1);
    return wall;
};

/**
 *
 * @param size {Vector2}
 * @param color {number}
 */
const getMirror = (size, color) => {
    return new Reflector(new THREE.PlaneBufferGeometry(size.width, size.height), {
        clipBias: 0.003,
        textureWidth: REFLECTOR_TEXTURE_SIZE * window.devicePixelRatio,
        textureHeight: REFLECTOR_TEXTURE_SIZE * window.devicePixelRatio,
        color,
    });
};

export { getWall, getMirror };
