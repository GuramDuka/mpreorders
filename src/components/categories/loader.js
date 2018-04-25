//------------------------------------------------------------------------------
import { bfetch } from '../../backend';
import disp from '../../lib/store';
import { zLink } from '../../const';
import { successor, failer, starter } from '../load';
//------------------------------------------------------------------------------
export const storePrefix = 'category';
//------------------------------------------------------------------------------
export default function loader() {
	return bfetch(
		{ r: { m: 'category', f: 'list', r: { target: 'products' } } },
		successor(result => {
			result.rows.push({ link: zLink, name: 'Вне категорий' });
			disp(store =>
				store.setIn(storePrefix + '.list', result).
					cmpSetIn(storePrefix + '.list.nostore', true));
		}),
		failer(),
		starter()
	);
}
//------------------------------------------------------------------------------
