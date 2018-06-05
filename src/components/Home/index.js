//------------------------------------------------------------------------------
import Button from 'preact-material-components/Button';
import 'preact-material-components/Button/style.css';
import LayoutGrid from 'preact-material-components/LayoutGrid';
import 'preact-material-components/LayoutGrid/style.css';
import Component from '../Component';
import Vab from '../VerticalActionBar';
import ProductCard from '../Products/Card';
import '../Products/Card/style.scss';
import Divider from '../Divider';
import '../Divider/style.scss';
import categoriesLoader from '../Categories/loader';
import { goCategory } from '../Categories/link';
import loader from './loader';
import style from './style.scss';
import { headerTitleStorePath, headerSearchStorePath } from '../../const';
import disp from '../../lib/store';
//import { LogIn, LogOut, UserPlus } from 'preact-feather';
//import FaBeer from 'react-icons/fa/beer';
//------------------------------------------------------------------------------
////////////////////////////////////////////////////////////////////////////////
//------------------------------------------------------------------------------
export default class Home extends Component {
	storePaths = new Map()

	mount() {
		disp(
			store => store.deleteIn(headerTitleStorePath).
				deleteIn(headerSearchStorePath),
			() => {
				categoriesLoader.call(this, 'catList');
				loader.call(this, 0);
				loader.call(this, 1);
			}
		);
	}

	transformCategories(categoriesList) {
		const list = [];

		for (const v of categoriesList.rows)
			list.push(v, undefined);

		list.pop();

		return list;
	}

	render(props, { catList, topList, rndList }) {
		if (catList) {
			catList = this.transformCategories(catList);
		}
		else {
			catList = [];
			catList.style = style.invis;
		}

		if (!topList) {
			topList = { rows: [] };
			topList.style = style.invis;
			topList.rows.length = 10;
			topList.rows.fill({});
		}

		if (!rndList) {
			rndList = { rows: [] };
			rndList.style = style.invis;
			rndList.rows.length = 20;
			rndList.rows.fill({});
		}

		const cats = (
			<div class={[style.container, catList.style].join(' ')}>
				<Divider horizontal />
				{catList.map((v, i, a) => v ?
					<Button {...goCategory(v.link)}>
						{v.name}
					</Button>
					: <Divider inline vertical />
				)}
				<Divider horizontal />
			</div>);

		return (
			<div class={style.home}>
				{cats}
				<div class={[style.hbar, topList.style].join(' ')}>
					<Divider horizontal />
					<div>ТОП 10</div>
					<Divider horizontal />
				</div>
				<LayoutGrid class={topList.style}>
					<LayoutGrid.Inner>
						{topList.rows.map(row => (
							<LayoutGrid.Cell cols="2">
								<ProductCard mini data={row} />
							</LayoutGrid.Cell>))}
					</LayoutGrid.Inner>
				</LayoutGrid>
				<div class={[style.hbar, rndList.style].join(' ')}>
					<Divider horizontal />
					<div>СЕЗОННЫЕ</div>
					<Divider horizontal />
				</div>
				<LayoutGrid class={rndList.style}>
					<LayoutGrid.Inner>
						{rndList.rows.map(row => (
							<LayoutGrid.Cell cols="2">
								<ProductCard mini data={row} />
							</LayoutGrid.Cell>))}
					</LayoutGrid.Inner>
				</LayoutGrid>
				<Vab fixed>
					<Vab.ScrollUp />
				</Vab>
				{/*
				<FaBeer size={24} />
				<LogIn style={{ verticalAlign: 'middle' }} color="black" />
				<LogOut style={{ verticalAlign: 'middle' }} color="black" />
				<UserPlus style={{ verticalAlign: 'middle' }} color="black" />*/}
			</div>
		);
	}
}
//------------------------------------------------------------------------------
