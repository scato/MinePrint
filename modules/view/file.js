import { readNbt, writeNbt } from '../model/nbt.js';

function readFileAsArrayBuffer(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            resolve(e.target.result);
        };

        reader.readAsArrayBuffer(file);
    });
}

function unzipArrayBuffer(buffer) {
    const input = new ReadableStream({
        pull(controller) {
            controller.enqueue(buffer);
            controller.close();
        }
    });

    const output = input.pipeThrough(new DecompressionStream("gzip"));

    return new Response(output).arrayBuffer();
}

function unzipResponse(response) {
    const output = response.body.pipeThrough(new DecompressionStream("gzip"));

    return new Response(output).arrayBuffer();
}

function zipArrayBuffer(buffer) {
    const input = new ReadableStream({
        pull(controller) {
            controller.enqueue(buffer);
            controller.close();
        }
    });

    const output = input.pipeThrough(new CompressionStream("gzip"));

    return new Response(output).arrayBuffer();
}

export async function readStructureFromUpload(upload) {
        const file = upload.files[0];

        const zippedBuffer = await readFileAsArrayBuffer(file);
        const buffer = await unzipArrayBuffer(zippedBuffer);
        const structure = readNbt(new Uint8Array(buffer));
        
        return [file.name, structure];
}

export async function readStructureFromUrl(url) {
    const zippedResponse = await fetch(url);
    const buffer = await unzipResponse(zippedResponse);
    const structure = readNbt(new Uint8Array(buffer));

    return [url.split("/").pop(), structure];
}

export async function writeStructureAsDownload(filename, structure) {
    const buffer = writeNbt(structure).buffer;
    const zippedBuffer = await zipArrayBuffer(buffer.transferToFixedLength());
    const blob = new Blob([zippedBuffer], {type: "application/octet-stream"});
    const url = URL.createObjectURL(blob);

    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    anchor.click();

    URL.revokeObjectURL(url);
}
