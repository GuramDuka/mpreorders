//------------------------------------------------------------------------------
import { loaderSpinnerStorePath } from '../const';
import { transform } from '../lib/util';
import disp from '../lib/store';
//------------------------------------------------------------------------------
export function successor(...successors) {
	return result => {
		disp(store => store.deleteIn(loaderSpinnerStorePath));

		result = transform(result);

		for (const success of successors)
			success && success(result);
	};
}
//------------------------------------------------------------------------------
export function failer(...failers) {
	return error => {
		disp(store => store.deleteIn(loaderSpinnerStorePath));

		for (const fail of failers)
			fail && fail(error);
	};
}
//------------------------------------------------------------------------------
export function starter(...starters) {
	return opts => {
		disp(store => store.setIn(loaderSpinnerStorePath, true));

		for (const start of starters)
			start && start(opts);
	};
}
//------------------------------------------------------------------------------
