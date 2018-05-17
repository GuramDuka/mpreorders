//------------------------------------------------------------------------------
import { loaderSpinnerStorePath } from '../const';
import { transform } from '../lib/util';
import disp from '../lib/store';
//------------------------------------------------------------------------------
function incSpin(store) {
	return store.setIn(loaderSpinnerStorePath,
		~~store.getIn(loaderSpinnerStorePath) + 1);
}
//------------------------------------------------------------------------------
function decSpin(store) {
	const counter = ~~store.getIn(loaderSpinnerStorePath) - 1;

	return counter === 0
		? store.deleteIn(loaderSpinnerStorePath)
		: store.setIn(loaderSpinnerStorePath, counter);
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
