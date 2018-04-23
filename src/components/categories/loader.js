//------------------------------------------------------------------------------
import { bfetch } from '../../backend';
import disp from '../../lib/store';
import { successor, failer, starter } from '../load';
//------------------------------------------------------------------------------
export const storePrefix = 'category';
//------------------------------------------------------------------------------
export default function loader() {
	return bfetch(
		{ r: { m: 'category', f: 'list', r: { target: 'products' } } },
		successor(result =>
			disp(store =>
				store.setIn(storePrefix + '.list', result).
					cmpSetIn(storePrefix + '.nostore', true)
			)
		),
		failer(),
		starter()
	);
}
//------------------------------------------------------------------------------
