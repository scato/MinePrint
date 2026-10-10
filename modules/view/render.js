import { lookupBlockstate } from '../model/structure.js';
import { fetchBlockStateFile, fetchModelFile, lookupParts, lookupModel, TEXTURES_ROOT, lookupTexture } from './assets.js';

const blockStateFilePromise = fetchBlockStateFile();
const modelFilePromise = fetchModelFile();

function nextRandomNumber(randomNumber) {
    // see https://en.wikipedia.org/wiki/Lehmer_random_number_generator
    return 48271 * randomNumber % 2147483647;
}

function createCamera(size, aspectRatio, scene) {
    const target = new BABYLON.Vector3(size[0] / 2, size[1] / 2, size[2] / 2);
    const position = target.add(new BABYLON.Vector3(2, Math.sin(60 / 180 * Math.PI) * 2, 2));

    const camera = new BABYLON.FreeCamera("camera", position, scene);
    camera.setTarget(target);

    const boudingRadius = Math.sqrt(size[0] * size[0] + size[1] * size[1] + size[2] * size[2]) / 2;

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

function createLight(scene) {
    const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(1, 3, 2), scene);

    return light;
}

function createTexture(id, scene) {
    return new Promise((resolve, reject) => {
        id = id.replace("minecraft:", "");

        const url = `${TEXTURES_ROOT}/${id}.png`;

        for (let t of scene.textures) {
            if (t.url === url) {
                resolve(t);
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
    });
}

async function createMaterial(face, textures, scene) {
    const material = new BABYLON.StandardMaterial("mat", scene);
    const texture = lookupTexture(face.texture, textures);

    material.diffuseTexture = await createTexture(texture, scene);

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

    if (face.hasOwnProperty("uv")) {
        vertexData.uvs = [
            face.uv[0], face.uv[1],
            face.uv[0], face.uv[3],
            face.uv[2], face.uv[3],
            face.uv[2], face.uv[1],
        ];
    } else {
        vertexData.uvs = [
            0, 0,
            16, 0,
            16, 16,
            0, 16,
        ];
    }

    vertexData.indices = [0, 1, 2, 3, 0, 2];
    vertexData.applyToMesh(side);

    side.material = await createMaterial(face, textures, scene);

    if (element.hasOwnProperty("rotation")) {
        const origin = new BABYLON.Vector3(
            element.rotation.origin[0] / 16 - 0.5,
            element.rotation.origin[1] / 16 - 0.5,
            element.rotation.origin[2] / 16 - 0.5
        );

        side.translate(origin, 1);
        side.rotate(
            BABYLON.Axis[element.rotation.axis.toUpperCase()],
            element.rotation.angle / 180 * Math.PI
        );
        side.translate(origin, -1);
    }

    return side;
}

async function createMesh(blockstate, randomNumber, scene) {
    const blockStateFile = await blockStateFilePromise;
    const modelFile = await modelFilePromise;

    const parts = lookupParts(blockstate, randomNumber, blockStateFile);

    if (parts === null) {
        return null;
    }

    const sides = [];
    for (let part of parts) {
        let model = lookupModel(part.model, modelFile);

        for (let element of model.elements) {
            for (let direction of Object.keys(element.faces)) {
                const side = await createSide(element, direction, model.textures, scene);

                if (part.hasOwnProperty("y")) {
                    side.rotate(BABYLON.Axis.Y, -part.y / 180 * Math.PI);
                }

                if (part.hasOwnProperty("x")) {
                    side.rotate(BABYLON.Axis.X, -part.x / 180 * Math.PI);
                }    

                sides.push(side);
            }
        }
    }

    // set multiMultiMaterials to true
    return BABYLON.Mesh.MergeMeshes(sides, true, false, undefined, false, true);
}

export async function createScene(size, blocks, palette, aspectRatio, engine) {
    const scene = new BABYLON.Scene(engine);
    scene.useRightHandedSystem = true;
    scene.clearColor = new BABYLON.Color4(0, 0, 0, 0);

    createCamera(size, aspectRatio, scene);
    createLight(scene);

    let randomNumber = 42;
    for (let block of blocks) {
        randomNumber = nextRandomNumber(randomNumber);

        const blockstate = lookupBlockstate(block, palette);
        const mesh = await createMesh(blockstate, randomNumber, scene);

        if (mesh === null) {
            continue;
        }

        mesh.position.x = block.pos[0] + 0.5;
        mesh.position.y = block.pos[1] + 0.5;
        mesh.position.z = block.pos[2] + 0.5;
    }

    return scene;
}
