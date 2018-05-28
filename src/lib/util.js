//------------------------------------------------------------------------------
import { route } from 'preact-router';
//------------------------------------------------------------------------------
export const root = typeof window === 'object' ? window : global;
//------------------------------------------------------------------------------
export function isDevelopment() {
	return (root.process
		&& root.process.env
		&& root.process.env.NODE_ENV === 'development')
		|| (root.webpackJsonp && root.webpackJsonp.name.length !== 0);
}
//------------------------------------------------------------------------------
export function isProduction() {
	return (root.process
		&& root.process.env
		&& root.process.env.NODE_ENV === 'production')
		|| (root.webpackJsonp && root.webpackJsonp.name.length === 0);
}
//------------------------------------------------------------------------------
export function isPrimitiveValue(v) {
	return v === undefined
		|| v === null
		|| v === Infinity
		|| Number.isNaN(v)
		|| v.constructor === Boolean || v instanceof Boolean
		|| v.constructor === String || v instanceof String
		|| v.constructor === Number || v instanceof Number
		|| v.constructor === Symbol || v instanceof Symbol;
}
//------------------------------------------------------------------------------
export function bXOR(b1, b2) {
	return !!(~~!!b1 ^ ~~!!b2);
}
//------------------------------------------------------------------------------
export function sscat(delimiter, ...args) {
	let s = '';

	for (const arg of args) {
		if (isPrimitiveValue(arg))
			continue;

		const a = arg.toString().trim();

		if (a.length !== 0)
			s += delimiter + a;
	}

	return s.substr(delimiter.length).trim();
}
//------------------------------------------------------------------------------
export function isArrow(functor) {
	return functor
		&& (functor.constructor === Function || functor instanceof Function)
		&& !functor.hasOwnProperty('prototype');
}
//------------------------------------------------------------------------------
function equ(a, b) {
	return a === b;
}
//------------------------------------------------------------------------------
export function shallowEqual(a, b, equal = equ) {
	if (a === b)
		return true;

	if (isPrimitiveValue(a) || isPrimitiveValue(b))
		return a === b;

	let i, isA = Array.isArray(a), isB = Array.isArray(b);

	if (isA && isB) {
		if (a.length !== b.length)
			return false;

		for (i = a.length - 1; i >= 0; i--)
			if (!equal(a[i], b[i], equal))
				return false;

		return true;
	}

	if (isA !== isB)
		return false;

	isA = a.constructor === Set || a instanceof Set;
	isB = b.constructor === Set || b instanceof Set;

	if (isA && isB) {
		if (a.size !== b.size)
			return false;

		const values = a.values();

		for (const v of values)
			if (!equal(v, b.get(v), equal))
				return false;
	}

	if (isA !== isB)
		return false;

	isA = a.constructor === Map || a instanceof Map;
	isB = b.constructor === Map || b instanceof Map;

	if (isA && isB) {
		if (a.size !== b.size)
			return false;

		const keys = a.keys();

		for (const key of keys)
			if (!equal(a.get(key), b.get(key), equal))
				return false;
	}

	if (isA !== isB)
		return false;

	isA = a.constructor === Date || a instanceof Date;
	isB = b.constructor === Date || b instanceof Date;

	if (isA && isB)
		return a.getTime() === b.getTime();

	if (isA !== isB)
		return false;

	isA = a.constructor === RegExp || a instanceof RegExp;
	isB = b.constructor === RegExp || b instanceof RegExp;

	if (isA && isB)
		return a.toString() === b.toString();

	if (isA !== isB)
		return false;

	isA = a.constructor === Object || a instanceof Object;
	isB = b.constructor === Object || b instanceof Object;

	if (isA && isB) {
		const keys = Object.keys(a);

		if (keys.length !== Object.keys(b).length)
			return false;

		for (i = keys.length - 1; i >= 0; i--) {
			const key = keys[i];

			if (!equal(a[key], b[key], equal))
				return false;
		}

		return true;
	}

	if (isA !== isB)
		return false;

	return false;
}
//------------------------------------------------------------------------------
export function equal(a, b) {
	return shallowEqual(a, b, shallowEqual);
}
//------------------------------------------------------------------------------
export function copy(src) {
	let dst = src;

	if (src === undefined || src === null) {
	}
	else if (Array.isArray(src)) {
		dst = [];

		for (const v of src)
			dst.push(copy(v));
	}
	else if (src.constructor === Map || src instanceof Map) {
		dst = new Map();
		src.forEach((v, k) => dst.set(k, v));
	}
	else if (src.constructor === Set || src instanceof Set) {
		dst = new Set();
		src.forEach(v => dst.add(v));
	}
	else if (src.constructor === String || src instanceof String)
		dst = src.valueOf();
	else if (src.constructor === Number || src instanceof Number)
		dst = src.valueOf();
	else if (src.constructor === Boolean || src instanceof Boolean)
		dst = src.valueOf();
	else if (src.constructor === Date || src instanceof Date)
		dst = new Date(src.valueOf());
	else if (src.constructor === Object || src instanceof Object) {
		dst = {};

		// eslint-disable-next-line
		for (const n in src)
			dst[n] = copy(src[n]);
	}
	else
		dst = new src.constructor(src.valueOf());

	return dst;
}
//------------------------------------------------------------------------------
export function transform(raw, store) {
	if (Array.isArray(raw)) {
		for (let i = raw.length - 1; i >= 0; i--)
			raw[i] = transform(raw[i]);
	}
	else {
		const { cols } = raw;

		// eslint-disable-next-line
		for (const k of ['rows', 'grps']) {
			const recs = raw[k];

			if (recs === undefined)
				continue;

			for (let i = recs.length - 1; i >= 0; i--) {
				const now = {}, row = recs[i], { r, t } = row;

				for (let j = r.length - 1; j >= 0; j--) {
					const n = cols[j];

					switch (t[j]) {
						case 0: // null
							now[n] = null;
							break;
						case 1: // undefined
							now[n] = undefined;
							break;
						case 2: // string
							now[n] = r[j];
							break;
						case 3: // boolean
							now[n] = r[j] !== 0;
							break;
						case 4: // numeric
							now[n] = r[j];
							break;
						case 5: // date
							now[n] = new Date(Date.parse(r[j]));
							break;
						case 6: // link
							now[n] = r[j];
							break;
						case 7: // array
							now[n] = r[j];
							break;
						default:
							throw new Error('Unsupported value type in row transformation');
					}
				}

				recs[i] = now;
			}
		}
	}

	if (!!store === false)
		raw.nostore = true;

	return raw;
}
//------------------------------------------------------------------------------
function encode(val) {
	return encodeURIComponent(val)
		.replace(/%40/gi, '@')
		.replace(/%3A/gi, ':')
		.replace(/%24/g, '$')
		.replace(/%2C/gi, ',')
		//.replace(/%20/g, '+')
		.replace(/%5B/gi, '[')
		.replace(/%5D/gi, ']');
}
//------------------------------------------------------------------------------
function parseValue(k, v) {
	if (v.constructor === Date || v instanceof Date)
		v = v.toISOString();
	else if (v.constructor === Object || v instanceof Object)
		v = JSON.stringify(v);
	else if (v.constructor === Set || v instanceof Set)
		v = JSON.stringify([...v]);
	else if (v.constructor === Map || v instanceof Map)
		v = JSON.stringify([...v]);
	return encode(k) + '=' + encode(v);
}
//------------------------------------------------------------------------------
export function serializeURIParams(params) {
	const parts = [];

	// eslint-disable-next-line
	for (let key in params) {
		let val = params[key];

		if (val === undefined || val === null)
			continue;

		const isArray = Array.isArray(val);

		if (isArray)
			key += '[]';
		else
			val = [val];

		for (const v of val)
			parts.push(parseValue(key, v));
	}

	return parts;
}
//------------------------------------------------------------------------------
export function prevent(e) {
	if (e) {
		if (e.stopImmediatePropagation)
			e.stopImmediatePropagation();

		if (e.stopPropagation)
			e.stopPropagation();

		e.preventDefault();
	}
	return false;
}
//------------------------------------------------------------------------------
export function pRoute(e, path) {
	route(path);
	return prevent(e);
}
//------------------------------------------------------------------------------
export function plinkRoute(path) {
	return e => pRoute(e, path);
}
//------------------------------------------------------------------------------
