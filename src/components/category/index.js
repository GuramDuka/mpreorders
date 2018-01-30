//------------------------------------------------------------------------------
import wog from 'window-or-global';
import uuidv1 from 'uuid/v1';
import { route } from 'preact-router';
import Button from 'preact-material-components/Button';
import 'preact-material-components/Button/style.css';
import Component from '../../components/component';
import loader, { storePrefix } from './loader';
//import style from './style';
import Card from '../product/card';
import CardStyle from '../product/card/style';
//------------------------------------------------------------------------------
////////////////////////////////////////////////////////////////////////////////
//------------------------------------------------------------------------------
export default class Category extends Component {
	goPage = page => this.linkTo('/category/'
		+ this.props.category + '/' + page + ',' + this.pageSize, page)
	//goPrev = e => wog.history.back()

	mount(props) {
		// decode page props
		let [page, pageSize] = props.pageProps.split(',');

		pageSize = ~~pageSize;
		this.pageSize = pageSize = pageSize > 0 ? pageSize : 40;

		this.page = page = ~~page;
		this.index = ((page > 0 ? page : 1) - 1) * pageSize;

		const storePath = storePrefix + '.' + props.category;

		this.storePaths = new Map([
			[
				state => this.setState(state),
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

	storeTrailer(store, { category }, { list }) {
		list === undefined
			&& loader(undefined, undefined, undefined,
				category, this.page, this.pageSize);
	}

	linkTo = (path, page) => ({
		onClick: e => {
			e.stopPropagation();
			e.preventDefault();

			const ctrl = (disabled, path) => {
				path && route(path);
				this.setState({ linksDisabled: disabled });
			};

			loader(
				result => ctrl(false, path),
				error => ctrl(false),
				opts => ctrl(true),
				this.props.category, page, this.pageSize);
		},
		href: path
	})

	id = uuidv1()

	didUpdate(){
		const e = document.getElementById(this.id);
		e && e.children[0] && e.children[0].scrollIntoView(false);
	}

	render({ containerClass }, { list, linksDisabled }) {
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
				disabled={linksDisabled}
				className={CardStyle.m}
				{...this.goPrev}
			>
				<Button.Icon>arrow_back</Button.Icon>
				НАЗАД
			</Button>);

		this.page < list.pages && view.push(
			<Button unelevated
				disabled={linksDisabled}
				style={{ float: 'right' }}
				className={CardStyle.m}
				{...this.goNext}
			>
				<Button.Icon>arrow_forward</Button.Icon>
				{this.page + 1}
			</Button>);

		return (
			<div id={this.id} class={containerClass}>
				{view}
			</div>);
	}
}
//------------------------------------------------------------------------------
