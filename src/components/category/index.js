//------------------------------------------------------------------------------
//import wog from 'window-or-global';
import Button from 'preact-material-components/Button';
import 'preact-material-components/Button/style.css';
import Component from '../../components/component';
import disp from '../../lib/store';
import { plinkRoute } from '../../lib/util';
import { headerTitleStorePath, headerSearchStorePath } from '../../const';
import loader, { storePrefix } from './loader';
import style from './style';
import Card from '../products/card';
import CardStyle from '../products/card/style';
//------------------------------------------------------------------------------
////////////////////////////////////////////////////////////////////////////////
//------------------------------------------------------------------------------
export default class Category extends Component {
	mount(props) {
		// decode page props
		let [page, pageSize] = props.pageProps.split(',');

		pageSize = ~~pageSize;
		this.pageSize = pageSize = pageSize > 0 ? pageSize : 40;

		this.page = page = ~~page;

		this.goPrev = this.goPage(page - 1);
		this.goNext = this.goPage(page + 1);
		
		this.index = ((page > 0 ? page : 1) - 1) * pageSize;
		const storePath = storePrefix + '.' + props.category;

		this.storePaths = new Map([
			[
				s => {
					const { list } = s;

					this.setState(s, list === undefined ? undefined :
						() => disp(state => state.cmpSetIn(
							headerTitleStorePath, list.category.name))
					);
				},
				{ path: storePath + '.list.' + page, alias: 'list' }
			],
			[
				state => this.setState(state, () => loader.call(this)),
				[
					{ path: storePath + '.order', alias: 'order' },
					{ path: storePath + '.filter', alias: 'filter' },
					{ path: storePath + '.stock', alias: 'stock' }
				]
			]
		]);

		disp(state => state.cmpSetIn(headerSearchStorePath, storePath));
	}

	linkTo = path => plinkRoute(path);

	goPage = page => this.linkTo('/category/'
		+ this.props.category + '/' + page + ',' + this.pageSize, page)
	//goPrev = e => wog.history.back()
	
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

		if (this.page < list.pages)
			view.push(
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
