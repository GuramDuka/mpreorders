//------------------------------------------------------------------------------
import { bfetch } from '../../backend/backend';
import disp from '../../lib/store';
import { headerTitleStorePath } from '../../const';
import { successor, failer, starter } from '../load';
//------------------------------------------------------------------------------
export const storePrefix = 'category';
//------------------------------------------------------------------------------
export default function loader(success, fail, start) {
	return bfetch(
		{ r: { m: 'category', f: 'list', r: { target: 'products' } } },
		successor(
			result => disp(store => store.setIn(storePrefix + '.list', result)
				.setIn(headerTitleStorePath, 'Категории')),
			success
		),
		failer(fail),
		starter(start)
	);
}
//------------------------------------------------------------------------------
