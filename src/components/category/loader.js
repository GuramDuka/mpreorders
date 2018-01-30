//------------------------------------------------------------------------------
import { bfetch } from '../../backend/backend';
import disp, { getStore } from '../../lib/store';
import { nullLink, headerTitleStorePath } from '../../const';
import { successor, failer, starter } from '../load';
//------------------------------------------------------------------------------
export const storePrefix = 'category';
//------------------------------------------------------------------------------
export default function loader(success, fail, start, category, page, pageSize) {
	const storePath = storePrefix + '.' + category;
	const storeListPath = storePath + '.list.' + page;
	const { order, filter } = getStore().getIn(storePath, {});
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
			result => disp(store => store.setIn(storeListPath, result)
				.setIn(headerTitleStorePath, result.category.name)),
			success
		),
		failer(fail),
		starter(start)
	);
}
//------------------------------------------------------------------------------
