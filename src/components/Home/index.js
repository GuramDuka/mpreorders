//------------------------------------------------------------------------------
import Button from 'preact-material-components/Button';
import 'preact-material-components/Button/style.css';
import LayoutGrid from 'preact-material-components/LayoutGrid';
import 'preact-material-components/LayoutGrid/style.css';
import Component from '../Component';
import VerticalActionBar from '../VerticalActionBar';
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
				categoriesLoader.call(this, 'categoriesList');
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

	render(props, { categoriesList, topList, rndList }) {
		if (categoriesList)
			categoriesList = this.transformCategories(categoriesList);

		return (
			<div class={style.home}>
				{categoriesList ? <Divider horizontal /> : undefined}
				{categoriesList ? <div class={style.container}>
					{categoriesList.map((v, i, a) => v ?
						<Button {...goCategory(v.link)}>
							{v.name}
						</Button>
						: <Divider inline vertical />
					)}
				</div> : undefined}
				{categoriesList ? <Divider horizontal /> : undefined}
				{topList ? <div class={style.hbar}>
					<Divider horizontal />
					<div>ТОП 10</div>
					<Divider horizontal />
				</div> : undefined}
				{topList ? <LayoutGrid>
					<LayoutGrid.Inner>
						{topList.rows.map(row => (
							<LayoutGrid.Cell cols="2">
								<ProductCard mini data={row} />
							</LayoutGrid.Cell>))}
					</LayoutGrid.Inner>
				</LayoutGrid> : undefined}
				{rndList ? <div class={style.hbar}>
					<Divider horizontal />
					<div>СЛУЧАЙНЫЕ</div>
					<Divider horizontal />
				</div> : undefined}
				{rndList ? <LayoutGrid>
					<LayoutGrid.Inner>
						{rndList.rows.map(row => (
							<LayoutGrid.Cell cols="2">
								<ProductCard mini data={row} />
							</LayoutGrid.Cell>))}
					</LayoutGrid.Inner>
				</LayoutGrid> : undefined}
				<VerticalActionBar popup fixed>
					<VerticalActionBar.ScrollUpFab />
				</VerticalActionBar>
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
