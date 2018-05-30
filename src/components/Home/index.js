//------------------------------------------------------------------------------
import Component from '../Component';
import Divider from '../Divider';
import '../Divider/style.scss';
import categoriesLoader from '../Categories/loader';
import { goCategory } from '../Categories/link';
import Button from 'preact-material-components/Button';
import 'preact-material-components/Button/style.css';
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
			() => categoriesLoader.call(this, 'categoriesList')
		);
	}

	transformCategories(categoriesList) {
		const list = [];

		for (const v of categoriesList.rows)
			list.push(v, undefined);

		list.pop();

		return list;
	}

	render(props, { categoriesList }) {
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
