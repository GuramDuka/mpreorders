//------------------------------------------------------------------------------
import { bfetch } from '../../backend';
import disp from '../../lib/store';
import { nullLink, headerTitleStorePath } from '../../const';
import { successor, failer, starter } from '../load';
//------------------------------------------------------------------------------
export const storePrefix = 'category';
//------------------------------------------------------------------------------
export default function loader() {
	const { page, pageSize, props, state } = this;
	const { category } = props;
	const { order, filter, stock } = state;
	const r = {
		type: 'products',
		piece: pageSize,
		index: (page - 1) * pageSize
	};

	if (order && Object.keys(order).length !== 0)
		r.order = order;

	if (filter)
		r.filter = filter;

	if (stock !== undefined)
		r.stock = stock;

	if (category !== undefined)
		r.category = category;
	else if (parent !== nullLink)
		r.parent = parent;

	return bfetch(
		// eslint-disable-next-line
		{ r: { m: 'dict', f: 'filter', r: r } },
		successor(result =>
			this.setState({ list: result }, () =>
				disp(store => store.cmpSetIn(
					headerTitleStorePath, result.category.name)))
		),
		failer(),
		starter()
	);
}
//------------------------------------------------------------------------------
