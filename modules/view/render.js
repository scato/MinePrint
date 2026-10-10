import { lookupBlockstate } from '../model/structure.js';
import { fetchBlockStateFile, fetchModelFile, lookupParts, lookupModel } from './assets.js';

const blockStateFilePromise = fetchBlockStateFile();
const modelFilePromise = fetchModelFile();

function nextRandomNumber(randomNumber) {
    // see https://en.wikipedia.org/wiki/Lehmer_random_number_generator
    return 48271 * randomNumber % 2147483647;
}

function createCamera(size, aspectRatio, scene) {
    const target = new BABYLON.Vector3(size[0] / 2, size[1] / 2, size[2] / 2);
    const position = target.add(new BABYLON.Vector3(-2, Math.sin(60 / 180 * Math.PI) * 2, 2));

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
    const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(-2, 3, 1), scene);

    return light;
}

function createSide(element, direction, scene) {
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
                from[0], from[1], from[2],
                from[0], from[1], to[2],
                to[0], from[1], to[2],
                to[0], from[1], from[2],
            ];
            break;
        case "north":
            vertexData.positions = [
                from[0], from[1], from[2],
                to[0], from[1], from[2],
                to[0], to[1], from[2],
                from[0], to[1], from[2],
            ];
            break;
        case "south":
            vertexData.positions = [
                from[0], from[1], to[2],
                from[0], to[1], to[2],
                to[0], to[1], to[2],
                to[0], from[1], to[2],
            ];
            break;
        case "east":
            vertexData.positions = [
                to[0], from[1], from[2],
                to[0], from[1], to[2],
                to[0], to[1], to[2],
                to[0], to[1], from[2],
            ];
            break;
        case "west":
            vertexData.positions = [
                from[0], from[1], from[2],
                from[0], to[1], from[2],
                from[0], to[1], to[2],
                from[0], from[1], to[2],
            ];
            break;
    }

    vertexData.indices = [0, 1, 2, 2, 3, 0];

    vertexData.applyToMesh(side);

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
                const side = createSide(element, direction, scene);

                if (part.hasOwnProperty("x")) {
                    side.rotation.x = part.x / 180 * Math.PI;
                }

                if (part.hasOwnProperty("y")) {
                    side.rotation.y = part.y / 180 * Math.PI;
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
