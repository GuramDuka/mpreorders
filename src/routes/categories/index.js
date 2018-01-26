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
	mountState = state => {
		this.setState(state);
		state.categories === undefined && this.fetchData();
	}

	storePaths = new Map([
		[
			this.mountState,
			{ path: 'categories.list', alias: 'categories' }
		]
	])

	storeDisp(store) {
		return store.setIn('header.title', 'Категории');
	}

	fetchData() {
		let { fetchControl } = this;

		fetchControl && fetchControl.controller.abort();

		this.fetchControl = fetchControl = bfetch(
			{ r: { m: 'category', f: 'list', r: { target: 'products' } } },
			json => fetchControl === this.fetchControl &&
				disp(state => state.setIn('categories.list', transform(json))
					.deleteIn('header.spinner.active')),
			error => fetchControl === this.fetchControl &&
				disp(state => state.deleteIn('header.spinner.active')),
			opts => fetchControl === this.fetchControl &&
				disp(state => state.setIn('header.spinner.active', true))
		);
	}

	linkTo = path => ({
		onClick: e => {
			e.stopPropagation();
			e.preventDefault();
			route(path);
		},
		href: path
	})

	goCategory = link => this.linkTo('/categories/' + link + '/1,40');

	render(props, { categories }) {
		if (categories === undefined)
			return undefined;

		const items = categories.rows.map(({ link, name }) => (
			<List.Item>
				<Button unelevated key={link} {...this.goCategory(link)}>
					{name}
				</Button>
			</List.Item>));

		return (
			<div class={[style.categories, 'mdc-toolbar-fixed-adjust'].join(' ')}>
				<List>
					{items}
				</List>
			</div>
		);
	}
}
//------------------------------------------------------------------------------
