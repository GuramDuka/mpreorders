//------------------------------------------------------------------------------
import List from 'preact-material-components/List';
import 'preact-material-components/List/style.css';
import Button from 'preact-material-components/Button';
import 'preact-material-components/Button/style.css';
import { route } from 'preact-router';
import Component from '../../components/component';
import style from './style';
import { transform } from '../../lib/util';
import { bfetch } from '../../backend/backend';
import disp from '../../lib/store';
//------------------------------------------------------------------------------
////////////////////////////////////////////////////////////////////////////////
//------------------------------------------------------------------------------
export default class Categories extends Component {
	storePaths = new Map([
		[
			state => this.mergeState(state),
			{ path: 'categories.list', alias: 'categories' }
		]
	])

	fetchStorePaths() {
		const r = { r: { m: 'category', f: 'list', r: { target: 'products' } } };

		bfetch(r, json =>
			disp(state =>
				state.setIn('categories.list', transform(json))));
	}

	linkTo = path => e => route(path)
	goCategory = link => this.linkTo('/categories/' + link)

	render(props, { categories }) {
		if (categories === undefined)
			return undefined;

		const items = categories.rows.map(({ link, name }) =>
			(<List.Item>
				<Button ripple key={link} onClick={this.goCategory(link)}>
					{name}
				</Button>
			</List.Item>));

		return (
			<div class={style.categories} className="mdc-toolbar-fixed-adjust">
				<List>
					{items}
				</List>
			</div>
		);
	}
}
//------------------------------------------------------------------------------
