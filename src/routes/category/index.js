//------------------------------------------------------------------------------
import Component from '../../components/component';
import style from './style';
import { route } from 'preact-router';
import VirtualList from 'preact-virtual-list';
import { copy, transform } from '../../lib/util';
import { bfetch } from '../../backend/backend';
import disp from '../../lib/store';
import { nullLink } from '../../const';
//------------------------------------------------------------------------------
////////////////////////////////////////////////////////////////////////////////
//------------------------------------------------------------------------------
export default class Category extends Component {
	willReceiveProps(props, context) {
		this.storeListPath = (this.storePrefix =
			'categories.' + this.props.category + '.') + 'list';
		const { storePrefix, storeListPath } = this;

		this.storePaths = new Map([
			[
				state => this.mergeState(state),
				[
					{
						path: storeListPath,
						alias: 'list'
					},
					{
						path: storePrefix + 'order',
						alias: 'order'
					},
					{
						path: storePrefix + '.filter',
						alias: 'filter'
					}
				]
			]
		]);
	}

	piece = 40	// items
	l2i = (l, p) => Math.trunc(l / p) + (l % p ? 1 : 0)

	fetchStorePaths() {
		const { storeListPath, piece, list, props, state } = this;
		const { category } = props;
		const { parent, order, filter } = state;
		const index = list ? this.l2i(list.rows.length, piece) * piece : 0;

		// eslint-disable-next-line
		let r = { type: 'products', piece: piece, index: index };

		if (order)
			r.order = order;

		if (filter)
			r.filter = filter;

		if (category !== undefined)
			r.category = category;
		else if (parent !== nullLink)
			r.parent = parent;

		// eslint-disable-next-line
		r = { r: { m: 'dict', f: 'filter', r: r } };

		// eslint-disable-next-line
		bfetch(r, json => {
			const next = transform(json);
			const data = list ? list : next;
			const src = next.rows, dst = data.rows;

			// refresh list
			if (dst !== src) {
				// append or set
				for (let i = src.length - 1; i >= 0; i--)
					dst[index + i] = src[i];

				// delete old
				if (src.length !== 0 && dst.length > index + src.length)
					data.rows = dst.slice(0, index + length);
			}

			if (src.length !== 0) {
				// render first piece immediately, keep fetching in background
				// copy helps shallowEqual in Component.mergeState detects when data change
				if (index === 0)
					disp(state => state.setIn(storeListPath, copy(data)));

				this.list = data;
				this.fetchStorePaths();
			}
			else {
				delete this.list;
				disp(state => state.setIn(storeListPath, data));
			}
		});
	}

	vlRenderRow = row => <div>{row.name}</div>;

	render(props, { list }) {
		console.log(list);
		if (list === undefined)
			return undefined;

		return (
			<div class={style.category} className="mdc-toolbar-fixed-adjust">
				<VirtualList
					data={list.rows}
					renderRow={this.vlRenderRow}
					rowHeight={22}
					overscanCount={10}
				/>
			</div>
		);
	}
}
//------------------------------------------------------------------------------
