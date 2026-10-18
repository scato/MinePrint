import { lookupBlockstate } from '../model/structure.js';
import { fetchBlockStateFile, fetchModelFile, lookupParts, lookupModel, TEXTURES_ROOT, lookupTexture } from './assets.js';

const blockStateFilePromise = fetchBlockStateFile();
const modelFilePromise = fetchModelFile();

function nextRandomNumber(randomNumber) {
    // see https://en.wikipedia.org/wiki/Lehmer_random_number_generator
    return 48271 * randomNumber % 2147483647;
}

function createCamera(size, angle, aspectRatio, scene) {
    const boudingRadius = Math.sqrt(size[0] * size[0] + size[1] * size[1] + size[2] * size[2]) / 2;
    const target = new BABYLON.Vector3(size[0] / 2, size[1] / 2, size[2] / 2);

    const camera = new BABYLON.ArcRotateCamera(
        "camera",
        angle / 180 * Math.PI,
        60 / 180 * Math.PI,
        3 * boudingRadius,
        target,
        scene
    );

    camera.mode = BABYLON.Camera.ORTHOGRAPHIC_CAMERA;
    if (aspectRatio < 1) {
        camera.orthoTop = boudingRadius / aspectRatio;
        camera.orthoBottom = -boudingRadius / aspectRatio;
        camera.orthoLeft = -boudingRadius;
        camera.orthoRight = boudingRadius;
    } else {
        camera.orthoTop = boudingRadius;
        camera.orthoBottom = -boudingRadius;
        camera.orthoLeft = -boudingRadius * aspectRatio;
        camera.orthoRight = boudingRadius * aspectRatio;
    }

    return camera;
}

export function getLightDirection(angle) {
    const delta = 70;
    const x = Math.sin((delta - angle) / 180 * Math.PI);
    const y = 1.2;
    const z = Math.cos((delta - angle) / 180 * Math.PI);

    return new BABYLON.Vector3(x, y, z);
}

function createLight(angle, scene) {
    const direction = getLightDirection(angle);
    const light = new BABYLON.HemisphericLight("light", direction, scene);

    return light;
}

function createTexture(id, scene) {
    return new Promise((resolve, reject) => {
        id = id.replace("minecraft:", "");

        const url = `${TEXTURES_ROOT}/${id}.png`;

        for (let t of scene.textures) {
            if (t.url === url) {
                resolve(t);
                return;
            }
        }

        const options = {samplingMode: BABYLON.Texture.NEAREST_SAMPLINGMODE, invertY: false};
        let texture;

        options.onLoad = () => {
            const size = texture.getSize();

            texture.uScale = 1 / size.width;
            texture.vScale = 1 / size.height;

            resolve(texture);
        };
        
        texture = new BABYLON.Texture(url, scene, options);
        texture.hasAlpha = true;
    });
}

async function createMaterial(face, textures, scene) {
    const material = new BABYLON.StandardMaterial("mat", scene);
    const texture = lookupTexture(face.texture, textures);

    material.diffuseTexture = await createTexture(texture, scene);

    if (face.hasOwnProperty("tintindex")) {
        // apply the color green from plains: #91BD59
        material.diffuseColor = new BABYLON.Color3(0x91 / 0x100, 0xBD / 0x100, 0x59 / 0x100);
    }

    material.specularColor = BABYLON.Color3.Black();

    return material;
}

async function createSide(element, direction, textures, scene) {
    const face = element.faces[direction];
    const side = new BABYLON.Mesh(direction, scene);
    const vertexData = new BABYLON.VertexData();

    const from = [element.from[0] / 16 - 0.5, element.from[1] / 16 - 0.5, element.from[2] / 16 - 0.5];
    const to = [element.to[0] / 16 - 0.5, element.to[1] / 16 - 0.5, element.to[2] / 16 - 0.5];

    switch (direction) {
        case "up":
            vertexData.positions = [
                from[0], to[1], from[2],
                to[0], to[1], from[2],
                to[0], to[1], to[2],
                from[0], to[1], to[2],
            ];
            break;
        case "down":
            vertexData.positions = [
                from[0], from[1], to[2],
                to[0], from[1], to[2],
                to[0], from[1], from[2],
                from[0], from[1], from[2],
            ];
            break;
        case "north":
            vertexData.positions = [
                to[0], to[1], from[2],
                from[0], to[1], from[2],
                from[0], from[1], from[2],
                to[0], from[1], from[2],
            ];
            break;
        case "south":
            vertexData.positions = [
                from[0], to[1], to[2],
                to[0], to[1], to[2],
                to[0], from[1], to[2],
                from[0], from[1], to[2],
            ];
            break;
        case "east":
            vertexData.positions = [
                to[0], to[1], to[2],
                to[0], to[1], from[2],
                to[0], from[1], from[2],
                to[0], from[1], to[2],
            ];
            break;
        case "west":
            vertexData.positions = [
                from[0], to[1], from[2],
                from[0], to[1], to[2],
                from[0], from[1], to[2],
                from[0], from[1], from[2],
            ];
            break;
    }

    let uvs;

    if (face.hasOwnProperty("uv")) {
        uvs = [
            face.uv[0], face.uv[1],
            face.uv[2], face.uv[1],
            face.uv[2], face.uv[3],
            face.uv[0], face.uv[3],
        ];
    } else {
        uvs = [
            0, 0,
            16, 0,
            16, 16,
            0, 16,
        ];
    }


    if (face.hasOwnProperty("rotation")) {
        let rotation = face.rotation;

        while (rotation > 0) {
            // move a uv-coordinate from the end of the array to the beginning
            // once for y and once for x
            uvs.unshift(uvs.pop());
            uvs.unshift(uvs.pop());
            rotation -= 90;
        }
    }

    vertexData.uvs = uvs;

    vertexData.indices = [0, 1, 2, 3, 0, 2];
    vertexData.applyToMesh(side);

    side.material = await createMaterial(face, textures, scene);

    if (element.hasOwnProperty("rotation")) {
        const origin = new BABYLON.Vector3(
            element.rotation.origin[0] / 16 - 0.5,
            element.rotation.origin[1] / 16 - 0.5,
            element.rotation.origin[2] / 16 - 0.5
        );

        side.translate(origin, 1, BABYLON.Space.WORLD);
        side.rotate(
            BABYLON.Axis[element.rotation.axis.toUpperCase()],
            element.rotation.angle / 180 * Math.PI,
            BABYLON.Space.WORLD
        );
        side.translate(origin, -1, BABYLON.Space.WORLD);
    }

    return side;
}

async function createMeshes(blockstate, scene) {
    const blockStateFile = await blockStateFilePromise;
    const modelFile = await modelFilePromise;

    const variants = lookupParts(blockstate, blockStateFile);

    return await Promise.all(variants.map(async (parts) => {
        if (parts === null) {
            return null;
        }
    
        const sides = [];
        for (let part of parts) {
            let model = lookupModel(part.model, modelFile);
    
            if (!model.hasOwnProperty("elements")) {
                continue;
            }
    
            for (let element of model.elements) {
                for (let direction of Object.keys(element.faces)) {
                    const side = await createSide(element, direction, model.textures, scene);
    
                    if (part.hasOwnProperty("y")) {
                        side.rotate(BABYLON.Axis.Y, -part.y / 180 * Math.PI, BABYLON.Space.WORLD);
                    }
    
                    if (part.hasOwnProperty("x")) {
                        side.rotate(BABYLON.Axis.X, -part.x / 180 * Math.PI, BABYLON.Space.WORLD);
                    }
    
                    sides.push(side);
                }
            }
        }
    
        // set multiMultiMaterials to true
        const mesh = BABYLON.Mesh.MergeMeshes(sides, true, false, undefined, false, true);
        if (mesh !== null) {
            mesh.isVisible = false;
        }
        return mesh;
    }));
}

export async function createScene(size, blocks, palette, angle, aspectRatio, engine) {
    const scene = new BABYLON.Scene(engine);
    scene.useRightHandedSystem = true;
    scene.clearColor = new BABYLON.Color4(0, 0, 0, 0);

    createCamera(size, angle, aspectRatio, scene);
    createLight(angle, scene);

    const meshesByBlockstate = {};

    await Promise.all(palette.map(async (blockstate) => {
        const meshes = await createMeshes(blockstate, scene);

        meshesByBlockstate[JSON.stringify(blockstate)] = meshes;
    }));

    let randomNumber = 42;
    for (let block of blocks) {
        randomNumber = nextRandomNumber(randomNumber);

        // look up blockstate because of jigsaw blocks
        const blockstate = lookupBlockstate(block, palette);
        const blockstateJson = JSON.stringify(blockstate);

        let meshes;
        if (meshesByBlockstate.hasOwnProperty(blockstateJson)) {
            meshes = meshesByBlockstate[blockstateJson];
        } else {
            // blockstate may not be in the palette because of jigsaw blocks
            meshes = await createMeshes(blockstate, scene);
        }

        const mesh = meshes.length === 1 ? meshes[0] : meshes[randomNumber % meshes.length];

        if (mesh === null) {
            continue;
        }

        const instance = mesh.createInstance("block:" + block.pos.toString());
        const position = new BABYLON.Vector3(block.pos[0] + 0.5, block.pos[1] + 0.5, block.pos[2] + 0.5);
        instance.translate(position, 1, BABYLON.Space.WORLD);
    }

    return scene;
}
