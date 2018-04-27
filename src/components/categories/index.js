//------------------------------------------------------------------------------
import List from 'preact-material-components/List';
import 'preact-material-components/List/style.css';
import Button from 'preact-material-components/Button';
import 'preact-material-components/Button/style.css';
//import IconToggle from 'preact-material-components/IconToggle';
//import 'preact-material-components/IconToggle/style.css';
import Checkbox from 'preact-material-components/Checkbox';
import 'preact-material-components/Checkbox/style.css';
import Component from '../../components/component';
import disp from '../../lib/store';
import { headerTitleStorePath, headerSearchStorePath } from '../../const';
import loader, { storePrefix } from './loader';
import style from './style';
import { prevent, plinkRoute } from '../../lib/util';
//------------------------------------------------------------------------------
////////////////////////////////////////////////////////////////////////////////
//------------------------------------------------------------------------------
export default class Categories extends Component {
	storePaths = new Map([
		[
			state => this.setState(state),
			{ path: storePrefix + '.list', alias: 'list' }
		]
	])

	didMount() {
		disp(store => store.cmpSetIn(headerTitleStorePath, 'Категории')
			.deleteIn(headerSearchStorePath));
	}

	mount() {
		loader.call(this);
	}

	linkTo = path => plinkRoute(path)

	goCategory = (link, page = 1, pageSize = 40) =>
		this.linkTo('/category/' + link + '/' + page + ',' + pageSize);

	handleCategoriesCheckList = link => e => {
		let { checked } = this.state;
		checked || (checked = {});
		checked[link] = e.target.checked;

		// eslint-disable-next-line
		this.setState({ checked: checked });
		return prevent(e);
	}

	style = [style.categories, 'mdc-toolbar-fixed-adjust'].join(' ');

	render(props, { list, checked }) {
		if (list === undefined || list.rows === undefined)
			return undefined;

		checked || (checked = {});
		const checkedKeys = Object.keys(checked);

		const items = list.rows.map(({ link, name }) => (
			<List.Item key={link}>
				<Checkbox
					checked={checked[link]}
					onChange={this.handleCategoriesCheckList(link)}
				/>
				<Button unelevated
					disabled={checked[link] && checkedKeys.length > 1}
					onClick={this.goCategory(link)}
				>
					{name}
				</Button>
			</List.Item>));

		if (checkedKeys.length > 1)
			items.push((
				<List.Item>
					<Button unelevated
						onClick={this.goCategory(checkedKeys.join(','))}
					>
						Открыть выбранные
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
