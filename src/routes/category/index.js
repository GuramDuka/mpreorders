//------------------------------------------------------------------------------
import Card from 'preact-material-components/Card';
import 'preact-material-components/Card/style.css';
import Component from '../../components/component';
import style from './style';
import { route } from 'preact-router';
import VirtualList from 'preact-virtual-list';
import { copy, transform } from '../../lib/util';
import { bfetch, icoUrl } from '../../backend/backend';
import disp from '../../lib/store';
import { nullLink } from '../../const';
//------------------------------------------------------------------------------
////////////////////////////////////////////////////////////////////////////////
//------------------------------------------------------------------------------
export default class Category extends Component {
	mergeState = state => {
		super.mergeState(state);
		state.list === undefined && this.fetchData();
	}

	piece = 40	// items

	l2i(l, p) {
		return Math.trunc(l / p) + (l % p ? 1 : 0);
	}

	fetchData() {
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
				//if (index === 0)
				//	disp(state => state.setIn(storeListPath, copy(data)));

				this.list = data;
				this.fetchData();
			}
			else {
				delete this.list;
				disp(state => state.setIn(storeListPath, data));
			}
		});
	}

	willReceiveProps(props, context) {
		this.storeListPath = (this.storePrefix =
			'categories.' + this.props.category + '.') + 'list';
		const { storePrefix, storeListPath } = this;

		this.storePaths = new Map([
			[
				this.mergeState,
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

	didMount() {
		this.willReceiveProps();
	}

	ico({ primaryImageLink }) {
		if (primaryImageLink && primaryImageLink !== nullLink) {
			//const w = ~~styles.icoWidth.substring(0, styles.icoWidth.length - 2);
			//const h = ~~styles.icoHeight.substring(0, styles.icoHeight.length - 2);
			// const r = icoR(row.ОсновноеИзображение, w, h, 16);
			// return <Image url={icoUrl(row.ОсновноеИзображение, w, h, 16)} r={r} />;
			// 	return <img alt="BROKEN"
			// 	  src={icoUrl(row.primaryImageLink, undefined, h, 16)}
			// 	  className={styles.regular} />;
			//   }

			//   return <img alt="" src={nopic} className={styles.regular} />;
			return (
				<Card.Media
					image={icoUrl(primaryImageLink, undefined, undefined, 16)}
					title="BROKEN"
				/>);
		}
		return undefined;
	}

	card = row => {
		return (
			<Card>
				{this.ico(row)}
				<Card.Primary>
					<Card.Title>Home card</Card.Title>
					<Card.Subtitle>Welcome to home route</Card.Subtitle>
				</Card.Primary>
				<Card.SupportingText>
					Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.
				</Card.SupportingText>
				<Card.Actions>
					<Card.Action>OKAY</Card.Action>
				</Card.Actions>
			</Card>);
	}

	vlRenderRow = row => <div class={style.vlRow}>{row.name}</div>;

	render(props, { list }) {
		if (list === undefined)
			return undefined;

		return (
			<div class={[style.category, 'mdc-toolbar-fixed-adjust'].join(' ')}>
				<VirtualList
					data={list.rows}
					renderRow={this.vlRenderRow}
					rowHeight={~~style.vlRowHeight.substr(0, style.vlRowHeight.length - 2)}
					overscanCount={10}
				/>
			</div>
		);
	}
}
//------------------------------------------------------------------------------
