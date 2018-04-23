//------------------------------------------------------------------------------
// static stringify(obj) {
// 	const placeholder = '____PLACEHOLDER____';
// 	const fns = [];
// 	const json = JSON.stringify(obj, (k, v) => {
// 		if (v !== undefined && v !== null) {
// 			if ((!!v.nostore) === true)
// 				return undefined;

// 			if (v.constructor === Function || v instanceof Function) {
// 				fns.push(v);
// 				return placeholder;
// 			}

// 			if (v.constructor === Set || v instanceof Set)
// 				throw new Error('invalid stringify value');
// 			//return [...v];

// 			if (v.constructor === Map || v instanceof Map)
// 				throw new Error('invalid stringify value');
// 			//return [...v];
// 		}
// 		return v;
// 	});
// 	return json.replace(new RegExp(`"${placeholder}"`, 'g'), e => fns.shift());
// }
// eslint-disable-next-line
//state = '(' + eval(state) + ')';
//------------------------------------------------------------------------------
function stringifyHelper(types, path, value, debug) {
	if (value === undefined || value === null)
		return JSON.stringify(value);

	if (value.constructor === String || value instanceof String) {
		// let r = value.replace(/'/g, '\\\'');
		// r = r.replace(/\r/g, '\\r');
		// r = r.replace(/\n/g, '\\n');
		// return `'${r}'`;
		return JSON.stringify(value);
	}

	if (Array.isArray(value)) {
		let r = '';
		const l = value.length;

		for (let i = 0; i < l; i++) {
			const p = `${path}.#${i}`;
			const val = value[i];

			if (val === undefined)
				types.undef.push(p.substr(1));
			else
				r += ',' + stringifyHelper(types, p, val);
		}

		return `[${r.substr(1)}]`;
	}

	if (value.constructor === Set || value instanceof Set) {
		types.sets.push(path.substr(1));
		return stringifyHelper(types, path, value.values());
	}

	if (value.constructor === Map || value instanceof Map) {
		types.maps.push(path.substr(1));
		return stringifyHelper(types, path, [...value]);
	}

	if (value.constructor === Date || value instanceof Date) {
		types.dates.push(path.substr(1));
		return stringifyHelper(types, path, value.toISOString());
	}

	if (value.constructor === RegExp || value instanceof RegExp) {
		types.regexp.push(path.substr(1));
		return stringifyHelper(types, path, value.toString());
	}

	if (value.constructor === Object || value instanceof Object) {
		if ((!!value.nostore) === true)
			return '{}';
	
		const keys = Object.keys(value);
		const l = keys.length;
		let r = '';

		for (let i = 0; i < l; i++) {
			const key = keys[i];
			const val = value[key];
			const p = `${path}.${key}`;

			if (val === undefined)
				types.undef.push(p.substr(1));
			else
				r += `,${JSON.stringify(key)}:` + stringifyHelper(types, p, val);
		}

		return `{${r.substr(1)}}`;
	}

	return JSON.stringify(value);
}
//------------------------------------------------------------------------------
export function stringify(value) {
	const types = { undef: [], dates: [], sets: [], maps: [], regexp: [] };
	const json = stringifyHelper(types, '', value);
	// eslint-disable-next-line
	return JSON.stringify({ json: json, types: types });
}
//------------------------------------------------------------------------------
export function destringify(s) {
	const state = JSON.parse(s);
	const { types } = state, json = JSON.parse(state.json);
	let i;

	for (const path of types.undef) {
		const vPath = path.split('.');
		let node = json;

		for (i = 0; i < vPath.length - 1; i++)
			node = node[vPath[i]];

		node[vPath[i]] = undefined;
	}
	
	for (const path of types.dates) {
		const vPath = path.split('.');
		let node = json;

		for (i = 0; i < vPath.length - 1; i++)
			node = node[vPath[i]];

		const p = vPath[i];
		node[p] = new Date(Date.parse(node[p]));
	}

	for (const path of types.sets) {
		const vPath = path.split('.');
		let node = json;

		for (i = 0; i < vPath.length - 1; i++)
			node = node[vPath[i]];

		const p = vPath[i];
		node[p] = new Set(node[p]);
	}

	for (const path of types.maps) {
		const vPath = path.split('.');
		let node = json;

		for (i = 0; i < vPath.length - 1; i++)
			node = node[vPath[i]];

		const p = vPath[i];
		node[p] = new Map(node[p]);
	}

	for (const path of types.regexp) {
		const vPath = path.split('.');
		let node = json;

		for (i = 0; i < vPath.length - 1; i++)
			node = node[vPath[i]];

		const p = vPath[i];
		const v = node[p];
		const j = v.lastIndexOf('/') + 1;
		node[p] = new RegExp(v.substr(0, j), v.substr(j));
	}
	
	return json;
}
//------------------------------------------------------------------------------
