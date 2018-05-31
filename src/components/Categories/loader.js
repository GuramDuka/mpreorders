//------------------------------------------------------------------------------
import { bfetch } from '../../backend';
import { zLink } from '../../const';
import { successor, failer, starter } from '../load';
//------------------------------------------------------------------------------
export const storePrefix = 'category';
//------------------------------------------------------------------------------
const opts = {
	r: { m: 'category', f: 'list', r: { target: 'products' } }
};
//------------------------------------------------------------------------------
export default function loader(alias = 'list') {
	return bfetch(
		opts,
		successor(result => {
			result.rows.push({ link: zLink, name: 'Вне категорий' });
			this.setState({ [alias]: result });
		}),
		failer(),
		starter()
	);
}
//------------------------------------------------------------------------------
