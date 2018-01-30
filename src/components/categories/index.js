//------------------------------------------------------------------------------
import List from 'preact-material-components/List';
import 'preact-material-components/List/style.css';
import Button from 'preact-material-components/Button';
import 'preact-material-components/Button/style.css';
import { route } from 'preact-router';
import Component from '../../components/component';
import loader, { storePrefix } from './loader';
//import style from './style';
import categoryLoader from '../category/loader';
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

	storeTrailer(store, props, { list }) {
		list === undefined && loader();
	}

	linkTo = (path, category, page, pageSize) => ({
		onClick: e => {
			e.stopPropagation();
			e.preventDefault();

			const ctrl = (disabled, path) => {
				path && route(path);
				this.setState({ linksDisabled: disabled });
			};

			categoryLoader(
				result => ctrl(false, path),
				error => ctrl(false),
				opts => ctrl(true),
				category, page, pageSize);
		},
		href: path
	})

	goCategory = (link, page = 1, pageSize = 40) =>
		this.linkTo('/category/' + link + '/' + page + ',' + pageSize, link, page, pageSize);

	render(props, { list, linksDisabled }) {
		if (list === undefined)
			return undefined;

		const items = list.rows.map(({ link, name }) => (
			<List.Item>
				<Button unelevated
					disabled={linksDisabled}
					key={link} {...this.goCategory(link)}
				>
					{name}
				</Button>
			</List.Item>));

		return (
			<List>
				{items}
			</List>
		);
	}
}
//------------------------------------------------------------------------------
