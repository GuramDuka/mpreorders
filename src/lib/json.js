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
	if (value === undefined || value === null
		|| value.constructor === String || value instanceof String)
		return JSON.stringify(value);

	if (Array.isArray(value)) {
		let r = '';
		const l = value.length;

		for (let i = 0; i < l; i++) {
			const p = [1, ...path, i];
			let val = value[i];

			if (val === undefined) {
				types.push([1, ...path, i]);
				val = 0;
			}

			r += ',' + stringifyHelper(types, [...path, i], val);
		}

		return `[${r.substr(1)}]`;
	}

	if (value.constructor === Set || value instanceof Set) {
		types.push([2, ...path]);
		return stringifyHelper(types, path, Array.from(value));
	}

	if (value.constructor === Map || value instanceof Map) {
		types.push([3, ...path]);
		return stringifyHelper(types, path, Array.from(value));
	}

	if (value.constructor === Date || value instanceof Date) {
		types.push([4, ...path]);
		return stringifyHelper(types, path, value.toISOString());
	}

	if (value.constructor === RegExp || value instanceof RegExp) {
		types.push([5, ...path]);
		return stringifyHelper(types, path, {
			source: value.source,
			flags: value.flags
		});
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

			if (val === undefined)
				types.push([1, ...path, key]);
			else
				r += `,${JSON.stringify(key)}:` + stringifyHelper(types, [...path, key], val);
		}

		return `{${r.substr(1)}}`;
	}

	return JSON.stringify(value);
}
//------------------------------------------------------------------------------
export function stringify(value) {
	const types = [];
	const json = stringifyHelper(types, [], value);

	if (types.length === 0)
		return json;

	return `{ "json": ${json}, "types": ${JSON.stringify(types)} }`;
}
//------------------------------------------------------------------------------
export function destringify(s) {
	let json = JSON.parse(s);

	const { types } = json, isHardTyped = Array.isArray(types)
		&& types.length !== 0
		&& json.json
		&& (json.json.constructor === Object || json.json instanceof Object);

	if (!isHardTyped)
		return json;

	json = json.json;

	for (let j = types.length - 1; j >= 0; j--) {
		const [type, ...path] = types[j];
		let i = 0, l = path.length - 1, node = json;

		while (i < l)
			node = node[path[i++]];

		i = path[i];

		switch (type) {
			case 1:
				node[i] = undefined;
				break;
			case 2:
				node[i] = new Set(node[i]);
				break;
			case 3:
				node[i] = new Map(node[i]);
				break;
			case 4:
				node[i] = new Date(Date.parse(node[i]));
				break;
			case 5:
				node[i] = new RegExp(node[i].source, node[i].flags);
				break;
			default:
				break;
		}
	}

	return json;
}
//------------------------------------------------------------------------------
