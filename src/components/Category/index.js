//------------------------------------------------------------------------------
import { route } from 'preact-router';
import LayoutGrid from 'preact-material-components/LayoutGrid';
import 'preact-material-components/LayoutGrid/style.css';
import Component from '../Component';
import disp from '../../lib/store';
import { prevent, plinkRoute } from '../../lib/util';
import { headerSearchStorePath } from '../../const';
import loader, { storePrefix } from './loader';
import style from './style.scss';
import ProductCard from '../Products/Card';
import ProductCardStyle from '../Products/Card/style.scss';
import Vab from '../VerticalActionBar';
import Image from '../Image';
//------------------------------------------------------------------------------
////////////////////////////////////////////////////////////////////////////////
//------------------------------------------------------------------------------
export default class Category extends Component {
	constructor() {
		super();

		this.imageMagnifierRef = this.imageMagnifierRef.bind(this);
		this.showImageMagnifier = this.showImageMagnifier.bind(this);
	}

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
				this.varPath('stock'),
				this.varPath('image')
			]
		]
	])

	didSetState({ list }) {
		if (list && this.page > list.pages)
			if (list.pages !== 0)
				route(this.pageHref(list.pages), true);
			else
				route('/categories', true);
	}

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

		//this.setState({ list: undefined });
	}

	linkTo = path => ({ href: path, onClick: plinkRoute(path) })
	pageHref = page => '/category/' + this.props.category + '/' + page + ',' + this.pageSize
	goPage = page => this.linkTo(this.pageHref(page))

	goNextStyle = [ProductCardStyle.m, style.fr].join(' ')

	//goPrev = e => root.history.back()

	imageMagnifierRef = e => this.imageMagnifier = e

	showImageMagnifier = (e, link) => {
		this.imageMagnifier.show(link);
		return prevent(e);
	}

	render(props, { list }) {
		if (list === undefined)
			return undefined;

		return (
			<div class={style.category}>
				<Image.Magnifier ref={this.imageMagnifierRef} />
				<LayoutGrid>
					<LayoutGrid.Inner>
						{list.rows.map(row => (
							<LayoutGrid.Cell>
								<ProductCard data={row}
									showImageMagnifier={this.showImageMagnifier}
								/>
							</LayoutGrid.Cell>))}
					</LayoutGrid.Inner>
				</LayoutGrid>
				<Vab fixed>
					<Vab.ScrollUp />
					{this.page < list.pages
						? <Vab.Fab mini {...this.goNext}>
							<Vab.Fab.Icon>
								arrow_forward
							</Vab.Fab.Icon>
						</Vab.Fab>
						: undefined}
				</Vab>
			</div>);
	}
}
//------------------------------------------------------------------------------
