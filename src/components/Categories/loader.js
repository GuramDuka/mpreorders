//------------------------------------------------------------------------------
import { bfetch } from '../../backend';
import { zLink } from '../../const';
import { successor, failer, starter } from '../load';
//------------------------------------------------------------------------------
export const storePrefix = 'category';
//------------------------------------------------------------------------------
export default function loader(alias = 'list') {
	return bfetch(
		{ r: { m: 'category', f: 'list', r: { target: 'products' } } },
		successor(result => {
			result.rows.push({ link: zLink, name: 'Вне категорий' });
			this.setState({ [alias]: result });
		}),
		failer(),
		starter()
	);
}
//------------------------------------------------------------------------------
