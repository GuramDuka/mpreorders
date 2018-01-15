//------------------------------------------------------------------------------
import root from 'window-or-global';
//------------------------------------------------------------------------------
export function copyObject(src, template) {
	let dst = src;

	// if( src.constructor === Date   || src.constructor === RegExp || src.constructor === Function ||
	//     src.constructor === String || src.constructor === Number || src.constructor === Boolean )
	//     return new src.constructor(src);
    
	if ( src === undefined || src === null ) {
	}
	else if ( src.constructor === Object ) {
		dst = new src.constructor();

		if ( template === undefined ) {
			for ( let n in src )
			//if( src.hasOwnProperty(n) )
				dst[n] = copyObject(src[n]);
		}
		else {
			for ( let n in template ) {
				let v = src[n];
				dst[n] = copyObject(v !== undefined ? v : template[n]);
			}
		}
	}
	else if ( src.constructor === Array ) {
		dst = new src.constructor();

		for ( let v of src )
			dst.push(copyObject(v));
	}
	else
		dst = new src.constructor(src);
    
	return dst;
}
//------------------------------------------------------------------------------
// last argument is template, all rest them objects merge
export function mergeObjectsProps(...args) {
	const argc = args.length - 1;
	const template = argc === -1 ? undefined : args[argc];
	let dst = {};

	for ( let i = 0; i <= argc; i++ ) {
		const src = args[i];
        
		if ( src === undefined || src === null || src.constructor !== Object )
			continue;

		// eslint-disable-next-line
		for ( let n in template ) {
			let v = src[n];
			if ( dst[n] === undefined && v !== undefined )
				dst[n] = v;
		}
	}

	return dst;
}
//------------------------------------------------------------------------------
// last argument is template, all rest them objects join
export function joinObjectsProps(...args) {
	const argc = args.length - 1;
	const template = argc === -1 ? undefined : args[argc];
	let dst = {};

	for ( let i = 0; i <= argc; i++ ) {
		const src = args[i];
        
		if ( src.constructor === Object ) {
			for ( let n in template )
				if ( src[n] !== undefined )
					dst[n] = src[n];
		}
		else if ( src.constructor === Array ) {
		// eslint-disable-next-line
        for ( let qrc in src )
				for ( let n in template )
					if ( qrc[n] !== undefined )
						dst[n] = qrc[n];
		}
	}

	return dst;
}
//------------------------------------------------------------------------------
export function scrollXY() {
	const supportPageOffset = root.pageXOffset !== undefined;
	const isCSS1Compat = ((document.compatMode || '') === 'CSS1Compat');

	return {
		x: supportPageOffset ? root.pageXOffset : isCSS1Compat ? document.documentElement.scrollLeft : document.body.scrollLeft,
		y: supportPageOffset ? root.pageYOffset : isCSS1Compat ? document.documentElement.scrollTop : document.body.scrollTop
	};
}
//------------------------------------------------------------------------------
export function windowSize() {
	//root.devicePixelRatio = 1;
	return [
		root.innerWidth || document.documentElement.clientWidth || document.body.clientWidth,
		root.innerHeight || document.documentElement.clientHeight || document.body.clientHeight,
		root.devicePixelRatio
	];
}
//------------------------------------------------------------------------------
// http://blog.grayghostvisuals.com/js/detecting-scroll-position/
export function isVisibleInWindow(e, complete) {
	const r = e.getBoundingClientRect();
	const h = root.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
	// completely visible elements return true:
	if ( complete )
		return r.top >= 0 && r.bottom <= h;
	// Partially visible elements return true:
	return r.top < h && r.bottom >= 0;
}
//------------------------------------------------------------------------------
// Determine if an element is in the visible viewport
export function isInViewport(element) {
	let rect = element.getBoundingClientRect();
	let html = document.documentElement;
	return (
		rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (root.innerHeight || html.clientHeight) &&
    rect.right <= (root.innerWidth || html.clientWidth)
	);
}
//The above function could be used by adding a “scroll” event listener to the window and then calling isInViewport().
//------------------------------------------------------------------------------
