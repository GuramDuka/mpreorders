import { array2base64 } from './base64';
import webpModule from './webp_bind';
//------------------------------------------------------------------------------
////////////////////////////////////////////////////////////////////////////////
//------------------------------------------------------------------------------
class RuntimeInitializer {
	static webp = undefined
	static queue = []
	static initialized = false
}
//------------------------------------------------------------------------------
export function webpRuntimeInitialized(...functors) {
	const rt = RuntimeInitializer;

	if (rt.initialized)
		return true;

	if (rt.webp === undefined)
		rt.webp = webpModule({
			locateFile: s => '/assets/' + s,
			onRuntimeInitialized: webpRuntimeInitialized
		});

	rt.queue.push(...functors);

	if (functors.length === 0) {
		// onRuntimeInitialized call
		rt.initialized = true;

		for (const functor of rt.queue)
			functor();

		rt.queue.length = 0;
	}

	return false;
}
//------------------------------------------------------------------------------
// export function webpVersion(buffer) {
// 	const { webp } = RuntimeInitializer;
// 	return webp._version();
// }
// //------------------------------------------------------------------------------
// export function webpGetInfo(buffer) {
// 	const { webp } = RuntimeInitializer;
// 	const size = buffer.byteLength;
// 	const ptr = webp._malloc(size);
// 	webp.HEAPU8.set(buffer, ptr);

// 	const infoPtr = webp._getInfo(ptr, size);
// 	const resCode = webp.getValue(infoPtr, 'i32');

// 	const r = {
// 		width: resCode !== 0 ? webp.getValue(infoPtr + 4, 'i32') : null,
// 		height: resCode !== 0 ? webp.getValue(infoPtr + 8, 'i32') : null
// 	};

// 	webp._free(infoPtr);
// 	webp._free(ptr);

// 	return r;
// }
// //------------------------------------------------------------------------------
// export function webpDecode2RGBA(buffer) {
// 	const { webp } = RuntimeInitializer;
// 	let result;

// 	if (buffer.constructor === ArrayBuffer || buffer instanceof ArrayBuffer)
// 		buffer = new Uint8Array(buffer);

// 	const size = buffer.byteLength;
// 	const ptr = webp._malloc(size);

// 	// wasm must be compiled with ABORTING_MALLOC=0
// 	if (ptr !== 0) {
// 		webp.HEAPU8.set(buffer, ptr);

// 		const infoPtr = webp._getInfo(ptr, size);

// 		if (infoPtr !== 0) {
// 			const resCode = webp.getValue(infoPtr, 'i32');

// 			if (resCode !== 0) {
// 				const w = webp.getValue(infoPtr + 4, 'i32');
// 				const h = webp.getValue(infoPtr + 8, 'i32');

// 				const resultPtr = webp._decode(ptr, size);

// 				if (resultPtr !== 0) {
// 					result = webp.HEAPU8.buffer.slice(resultPtr, resultPtr + w * h * 4);
// 					result.width = w;
// 					result.height = h;
// 					webp._free(resultPtr);
// 				}
// 			}

// 			webp._free(infoPtr);
// 		}

// 		webp._free(ptr);
// 	}

// 	return result;
// }
// //------------------------------------------------------------------------------
// export function rgba2png(buffer) {
// 	const { webp } = RuntimeInitializer;
// 	let result;

// 	const size = buffer.byteLength;
// 	const ptr = webp._malloc(size);

// 	if (ptr !== 0) {
// 		const data = new Uint8Array(buffer);
// 		webp.HEAPU8.set(data, ptr);

// 		const resultPtr = webp._svpng(buffer.width, buffer.height, ptr, 1);

// 		if (resultPtr !== 0) {
// 			const resultSize = webp.getValue(resultPtr, 'i32');
// 			result = webp.HEAPU8.buffer.slice(resultPtr + 4, resultPtr + 4 + resultSize);
// 			webp._free(resultPtr);
// 		}

// 		webp._free(ptr);
// 	}

// 	return array2base64(result, 'data:image/png;base64,');
// }
// //------------------------------------------------------------------------------
export function webp2png(buffer) {
	const { webp } = RuntimeInitializer;
	let result;

	const size = buffer.byteLength;
	const ptr = webp._malloc(size);

	if (ptr !== 0) {
		const data = new Uint8Array(buffer);
		webp.HEAPU8.set(data, ptr);

		const resultPtr = webp._webp2png(ptr, size);

		if (resultPtr !== 0) {
			const resultSize = webp.getValue(resultPtr, 'i32');
			result = webp.HEAPU8.buffer.slice(resultPtr + 4, resultPtr + 4 + resultSize);
			webp._free(resultPtr);
		}

		webp._free(ptr);
	}

	return array2base64(result, 'data:image/png;base64,');
}
//------------------------------------------------------------------------------
