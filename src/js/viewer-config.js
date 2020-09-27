export const SCENE_SCALE = .3;

export const WALL_HEIGHT = 2600 * SCENE_SCALE;
export const WALL_WIDTH = 4000 * SCENE_SCALE;
export const WALL_DEPTH = 35000 * SCENE_SCALE;

export const SCENE_POSITION = {
    START: [(WALL_DEPTH / 2) - (1000 * SCENE_SCALE), -WALL_HEIGHT / 2, 0],
    BETWEEN: [-(WALL_DEPTH / 2) + (13000 * SCENE_SCALE), -WALL_HEIGHT / 2, 0],
    END: [-(WALL_DEPTH / 2) - WALL_WIDTH, -WALL_HEIGHT / 2, 0]
};

export const SCENE_TIMING = 52;

export const SCENE_START_DELAY = 2;

export const REFLECTOR_TEXTURE_SIZE = 1024;

export const AUDIO_ENHANCEMENT = 400;

export const PAN_DIRECTION = {
    NONE: 0,
    UP: 1,
    DOWN: 2,
    LEFT: 3,
    RIGHT: 4
};

export const DEBUG_MODE = false;
