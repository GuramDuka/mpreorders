//------------------------------------------------------------------------------
import wog from 'window-or-global';
import Button from 'preact-material-components/Button';
import 'preact-material-components/Button/style.css';
import Component from '../../components/component';
import disp from '../../lib/store';
import { prevent, plinkRoute } from '../../lib/util';
import { headerSearchStorePath } from '../../const';
import loader, { storePrefix } from './loader';
import style from './style';
import ProductCard from '../products/card';
import ProductCardStyle from '../products/card/style';
//------------------------------------------------------------------------------
////////////////////////////////////////////////////////////////////////////////
//------------------------------------------------------------------------------
export default class Category extends Component {
	varPathValidator = s => s === this.props.category
	varPath = name => ({
		path: new RegExp('^' + storePrefix + '\\.(.*)\\.search\\.' + name + '$'),
		alias: name,
		validator: this.varPathValidator
	})

	storePaths = new Map([
		[
			state => this.setState(state, () => loader.call(this)),
			[
				this.varPath('order'),
				this.varPath('filter'),
				this.varPath('stock')
			]
		]
	])

	mount(props) {
		// decode page props
		let [page, pageSize] = props.pageProps.split(',');

		pageSize = ~~pageSize;
		this.pageSize = pageSize = pageSize > 0 ? pageSize : 40;

		this.page = page = ~~page;

		//this.goPrev = this.goPage(page - 1);
		this.goNext = this.goPage(page + 1);

		this.index = ((page > 0 ? page : 1) - 1) * pageSize;
		this.storePath = storePrefix + '.' + props.category;

		disp(
			state => {
				state = state.cmpSetIn(headerSearchStorePath, this.storePath);
				for (const [functor, paths] of this.storePaths.entries())
					for (const { alias } of paths)
						state = state.pubIn([
							functor,
							storePrefix + '.'
							+ this.props.category + '.search.'
							+ alias
						]);
				return state;
			}
		);
	}

	linkTo = path => ({ href: path, onClick: plinkRoute(path) })

	goPage = page => this.linkTo('/category/'
		+ this.props.category + '/' + page + ',' + this.pageSize)
	
	goNextStyle = [ProductCardStyle.m, style.fr].join(' ')

	//goPrev = e => wog.history.back()
	goUp = e => {
		wog.scrollTo({
			top: 0,
			left: 0,
			behavior: 'instant'
		});
		return prevent(e);
	}

	goUpStyle = [ProductCardStyle.m, style.fr, style.mr].join(' ')

	style = [style.category, 'mdc-toolbar-fixed-adjust'].join(' ');

	render(props, { list }) {
		if (list === undefined)
			return undefined;

		const view = list.rows.map((row, i) => (
			<ProductCard
				classes={ProductCardStyle.m}
				key={row.link}
				data={row}
			/>));

		// this.page > 1 && view.push(
		// 	<Button unelevated
		// 		className={CardStyle.m}
		// 		onClick={this.goPrev}
		// 	>
		// 		<Button.Icon>arrow_back</Button.Icon>
		// 		НАЗАД
		// 	</Button>);

		if (this.page < list.pages)
			view.push(
				<Button unelevated
					className={this.goNextStyle}
					{...this.goNext}
				>
					<Button.Icon>arrow_forward</Button.Icon>
					{this.page + 1}
				</Button>);

		view.push(
			<Button unelevated
				className={this.goUpStyle}
				onClick={this.goUp}
			>
				<Button.Icon onClick={this.goUp}>arrow_upward</Button.Icon>
			</Button>);

		return (
			<div class={this.style}>
				{view}
			</div>);
	}
}
//------------------------------------------------------------------------------
