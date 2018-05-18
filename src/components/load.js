//------------------------------------------------------------------------------
import { loaderSpinnerStorePath } from '../const';
import { transform } from '../lib/util';
import disp from '../lib/store';
//------------------------------------------------------------------------------
function spinPath() {
	return loaderSpinnerStorePath + '.active';
}
//------------------------------------------------------------------------------
function incSpin(store) {
	const p = spinPath();
	return store.cmpSetIn(loaderSpinnerStorePath + '.nostore', true)
		.setIn(p, ~~store.getIn(p) + 1);
}
//------------------------------------------------------------------------------
function decSpin(store) {
	const p = spinPath();
	const counter = ~~store.getIn(p) - 1;

	return counter === 0
		? store.deleteIn(p)
		: store.setIn(p, counter);
}
//------------------------------------------------------------------------------
export function successor(...successors) {
	return result => {
		disp(decSpin);

		result = transform(result);

		for (const success of successors)
			success && success(result);
	};
}
//------------------------------------------------------------------------------
export function failer(...failers) {
	return error => {
		disp(decSpin);

		for (const fail of failers)
			fail && fail(error);
	};
}
//------------------------------------------------------------------------------
export function starter(...starters) {
	return opts => {
		disp(incSpin);

		for (const start of starters)
			start && start(opts);
	};
}
//------------------------------------------------------------------------------
