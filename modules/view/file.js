export function readFileAsArrayBuffer(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            resolve(e.target.result);
        };

        reader.readAsArrayBuffer(file);
    });
}

export function unzipArrayBuffer(buffer) {
    const input = new ReadableStream({
        pull(controller) {
            controller.enqueue(buffer);
            controller.close();
        }
    });

    const output = input.pipeThrough(new DecompressionStream("gzip"));

    return new Response(output).arrayBuffer();
}

export function unzipResponse(response) {
    const output = response.body.pipeThrough(new DecompressionStream("gzip"));

    return new Response(output).arrayBuffer();
}
