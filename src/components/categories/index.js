//------------------------------------------------------------------------------
import List from 'preact-material-components/List';
import 'preact-material-components/List/style.css';
import Button from 'preact-material-components/Button';
import 'preact-material-components/Button/style.css';
import { route } from 'preact-router';
import Component from '../../components/component';
import disp from '../../lib/store';
import { headerTitleStorePath } from '../../const';
import loader, { storePrefix } from './loader';
import style from './style';
//------------------------------------------------------------------------------
////////////////////////////////////////////////////////////////////////////////
//------------------------------------------------------------------------------
export default class Categories extends Component {
	storePaths = new Map([
		[
			state => this.setState(state),
			{
				path: storePrefix + '.list',
				alias: 'list'
			}
		]
	])

	didSetState({ list }) {
		if (list)
			disp(store => store.cmpSetIn(headerTitleStorePath, 'Категории'));
		else
			loader.call(this);
	}

	linkTo = path => e => {
		e.stopPropagation();
		e.preventDefault();
		route(path);
	}

	goCategory = (link, page = 1, pageSize = 40) =>
		this.linkTo('/category/' + link + '/' + page + ',' + pageSize);

	style = [style.categories, 'mdc-toolbar-fixed-adjust'].join(' ');

	render(props, { list }) {
		if (list === undefined)
			return undefined;

		const items = list.rows.map(({ link, name }) => (
			<List.Item>
				<Button unelevated
					key={link}
					onClick={this.goCategory(link)}
				>
					{name}
				</Button>
			</List.Item>));

		return (
			<div class={this.style}>
				<List>
					{items}
				</List>
			</div>
		);
	}
}
//------------------------------------------------------------------------------
