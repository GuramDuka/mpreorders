//------------------------------------------------------------------------------
import { route } from 'preact-router';
import LayoutGrid from 'preact-material-components/LayoutGrid';
import 'preact-material-components/LayoutGrid/style.css';
import Dialog from 'preact-material-components/Dialog';
import 'preact-material-components/Dialog/style.css';
import Component from '../Component';
import disp from '../../lib/store';
import root from '../../lib/root';
import { prevent, plinkRoute } from '../../lib/util';
import { headerSearchStorePath } from '../../const';
import loader, { storePrefix } from './loader';
import style from './style.scss';
import ProductCard from '../Products/Card';
import ProductCardStyle from '../Products/Card/style.scss';
import VerticalActionBar from '../VerticalActionBar';
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

		this.setState({ list: undefined });
	}

	linkTo = path => ({ href: path, onClick: plinkRoute(path) })
	pageHref = page => '/category/' + this.props.category + '/' + page + ',' + this.pageSize
	goPage = page => this.linkTo(this.pageHref(page))

	goNextStyle = [ProductCardStyle.m, style.fr].join(' ')

	//goPrev = e => root.history.back()
	goUp = e => {
		root.scrollTo({
			top: 0,
			left: 0,
			behavior: 'instant'
		});
		return prevent(e);
	}

	goUpStyle = [ProductCardStyle.m, style.fr, style.mr].join(' ')

	imageMagnifierRef = e => this.imageMagnifier = e
	openImageMagnifier = url => this.setState(
		{ imageMagnifierUrl: undefined },
		() => this.setState(
			{ imageMagnifierUrl: url },
			() => this.imageMagnifier.MDComponent.show()
		)
	)

	closeImageMagnifier = () => this.imageMagnifier.MDComponent.close()

	render(props, { list, imageMagnifierUrl }) {
		if (list === undefined)
			return undefined;

		const view = list.rows.map(row => (
			<LayoutGrid.Cell>
				<ProductCard
					openImageMagnifier={this.openImageMagnifier}
					data={row}
				/>
			</LayoutGrid.Cell>));

		return (
			<div class={style.category}>
				<Dialog ref={this.imageMagnifierRef} class={style.dia}
					onClick={this.closeImageMagnifier}
				>
					<Dialog.Body>
						<div class={style.media}
							style={{ backgroundImage: `url(${imageMagnifierUrl}})` }}
						/>
					</Dialog.Body>
					<Dialog.Footer>
						<Dialog.FooterButton accept>
							Закрыть
						</Dialog.FooterButton>
					</Dialog.Footer>
				</Dialog>
				<LayoutGrid>
					<LayoutGrid.Inner>
						{view}
					</LayoutGrid.Inner>
				</LayoutGrid>
				<VerticalActionBar popup fixed>
					<VerticalActionBar.Fab onClick={this.goUp}>
						arrow_upward
					</VerticalActionBar.Fab>
					{this.page < list.pages ? <VerticalActionBar.Fab {...this.goNext}>
						arrow_forward
					</VerticalActionBar.Fab> : undefined}
				</VerticalActionBar>
			</div>);
	}
}
//------------------------------------------------------------------------------
