//------------------------------------------------------------------------------
//import wog from 'window-or-global';
import { route } from 'preact-router';
import Button from 'preact-material-components/Button';
import 'preact-material-components/Button/style.css';
import Component from '../../components/component';
import disp from '../../lib/store';
import { headerTitleStorePath } from '../../const';
import loader, { storePrefix } from './loader';
import style from './style';
import Card from '../products/card';
import CardStyle from '../products/card/style';
//------------------------------------------------------------------------------
////////////////////////////////////////////////////////////////////////////////
//------------------------------------------------------------------------------
export default class Category extends Component {
	linkTo = path => e => {
		e.stopPropagation();
		e.preventDefault();
		route(path);
	}

	goPage = page => this.linkTo('/category/'
		+ this.props.category + '/' + page + ',' + this.pageSize, page)
	//goPrev = e => wog.history.back()

	mount(props, { list }) {
		// decode page props
		let [page, pageSize] = props.pageProps.split(',');

		pageSize = ~~pageSize;
		this.pageSize = pageSize = pageSize > 0 ? pageSize : 40;

		this.page = page = ~~page;
		this.index = ((page > 0 ? page : 1) - 1) * pageSize;

		const storePath = storePrefix + '.' + props.category;

		this.storePaths = new Map([
			[
				state => {
					this.setState(state);
					const { list } = state;
					list && disp(state => state.setIn(headerTitleStorePath, list.category.name));
				},
				[
					{
						path: storePath + '.list.' + page,
						alias: 'list'
					},
					{
						path: storePath + '.order',
						alias: 'order'
					},
					{
						path: storePath + '.filter',
						alias: 'filter'
					}
				]
			]
		]);

		this.goPrev = this.goPage(page - 1);
		this.goNext = this.goPage(page + 1);
	}

	storeTrailer(props, { list }) {
		list === undefined && loader.call(this);
	}

	style = [style.category, 'mdc-toolbar-fixed-adjust'].join(' ');

	render(props, { list }) {
		if (list === undefined)
			return undefined;

		const view = list.rows.map((row, i) => (
			<Card
				classes={CardStyle.m}
				key={row.link}
				data={row}
			/>));

		this.page > 1 && view.push(
			<Button unelevated
				className={CardStyle.m}
				onClick={this.goPrev}
			>
				<Button.Icon>arrow_back</Button.Icon>
				НАЗАД
			</Button>);

		this.page < list.pages && view.push(
			<Button unelevated
				style={{ float: 'right' }}
				className={CardStyle.m}
				onClick={this.goNext}
			>
				<Button.Icon>arrow_forward</Button.Icon>
				{this.page + 1}
			</Button>);

		return (
			<div class={this.style}>
				{view}
			</div>);
	}
}
//------------------------------------------------------------------------------
