//------------------------------------------------------------------------------
import { bfetch } from '../../backend';
import disp from '../../lib/store';
import { nullLink } from '../../const';
import { successor, failer, starter } from '../load';
//------------------------------------------------------------------------------
export const storePrefix = 'category';
//------------------------------------------------------------------------------
export default function loader() {
	const { page, pageSize, props, state } = this;
	const { category } = props;
	const { order, filter } = state;
	const storePath = storePrefix + '.' + category;
	const storeListPath = storePath + '.list.' + page;
	const r = {
		type: 'products',
		piece: pageSize,
		index: (page - 1) * pageSize
	};

	if (order)
		r.order = order;

	if (filter)
		r.filter = filter;

	if (category !== undefined)
		r.category = category;
	else if (parent !== nullLink)
		r.parent = parent;

	return bfetch(
		// eslint-disable-next-line
		{ r: { m: 'dict', f: 'filter', r: r } },
		successor(
			result => disp(store => store.setIn(storeListPath, result))
		),
		failer(),
		starter()
	);
}
//------------------------------------------------------------------------------
