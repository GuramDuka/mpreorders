//------------------------------------------------------------------------------
import Button from 'preact-material-components/Button';
import 'preact-material-components/Button/style.css';
import Component from '../../components/component';
import style from './style';
import Card from '../../components/product/card';
import CardStyle from '../../components/product/card/style';
import { route } from 'preact-router';
import { transform } from '../../lib/util';
import { bfetch } from '../../backend/backend';
import disp from '../../lib/store';
import { nullLink } from '../../const';
//------------------------------------------------------------------------------
////////////////////////////////////////////////////////////////////////////////
//------------------------------------------------------------------------------
export default class Category extends Component {
	mountState = state => {
		this.setState(state);
		state.list === undefined && this.fetchData();
	}

	mount(props) {
		// decode page props
		let [page, pageSize] = props.pageProps.split(',');

		pageSize = ~~pageSize;
		this.pageSize = pageSize = pageSize > 0 ? pageSize : 40;

		this.page = page = ~~page;
		this.index = ((page > 0 ? page : 1) - 1) * pageSize;

		this.storeListPath = (this.storePrefix =
			'categories.' + props.category + '.')
			+ 'list.' + page;
		const { storePrefix, storeListPath } = this;

		this.storePaths = new Map([
			[
				this.mountState,
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
						path: storePrefix + 'filter',
						alias: 'filter'
					}
				]
			]
		]);
	}

	fetchData() {
		let { fetchControl } = this;
		fetchControl && fetchControl.controller.abort();

		const { storeListPath, props, state, index, pageSize } = this;
		const { category } = props;
		const { parent, order, filter } = state;

		// eslint-disable-next-line
		const r = { type: 'products', piece: pageSize, index: index };

		if (order)
			r.order = order;

		if (filter)
			r.filter = filter;

		if (category !== undefined)
			r.category = category;
		else if (parent !== nullLink)
			r.parent = parent;

		this.fetchControl = fetchControl = bfetch(
			// eslint-disable-next-line
			{ r: { m: 'dict', f: 'filter', r: r } },
			json => fetchControl === this.fetchControl &&
				disp(state => state.setIn(storeListPath, transform(json))
					.setIn('header.title', json.category.name)
					.deleteIn('header.spinner.active')),
			error => fetchControl === this.fetchControl &&
				disp(state => state.deleteIn('header.spinner.active')),
			opts => fetchControl === this.fetchControl &&
				disp(state => state.setIn('header.spinner.active', true))
		);
	}

	linkTo = path => ({
		onClick: e => {
			e.stopPropagation();
			e.preventDefault();
			route(path);
		},
		href: path
	})

	goPage = page => this.linkTo('/categories/'
		+ this.props.category + '/' + page + ',' + this.pageSize);

	render(props, { list }) {
		if (list === undefined)
			return undefined;

		const links = [];

		if (this.page > 1)
			links.push(
				<Button unelevated
					className={CardStyle.m}
					{...this.goPage(this.page - 1) }>
					<Button.Icon>arrow_back</Button.Icon>
					{this.page - 1}
				</Button>);

		if (this.page < list.pages)
			links.push(
				<Button unelevated
					style={{ float: 'right' }}
					className={CardStyle.m}
					{...this.goPage(this.page + 1) }>
					<Button.Icon>arrow_forward</Button.Icon>
					{this.page + 1}
				</Button>);

		return (
			<div class={[style.category, 'mdc-toolbar-fixed-adjust'].join(' ')}>
				{list.rows.map(row => (
					<Card
						classes={CardStyle.m}
						key={row.link}
						data={row}
					/>))}
				{links}
			</div>
		);
	}
}
//------------------------------------------------------------------------------
