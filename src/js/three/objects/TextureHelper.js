import * as THREE from 'three';

/**
 *
 * @param letter {string}
 * @param opacity {number}
 * @param rotation {number}
 * @returns {MeshLambertMaterial}
 */
const getTexture = (letter, opacity = 1, rotation = 0) => {
    const wallTexture = new THREE.TextureLoader().load(`assets/images/VOID_material_${ letter }.png`);
    wallTexture.wrapS = THREE.RepeatWrapping;
    wallTexture.wrapT = THREE.RepeatWrapping;
    wallTexture.rotation = rotation;

    return new THREE.MeshLambertMaterial({
        map: wallTexture,
        side: THREE.DoubleSide,
        transparent: true,
        opacity
    });
};

export default getTexture;
