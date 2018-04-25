//------------------------------------------------------------------------------
import List from 'preact-material-components/List';
import 'preact-material-components/List/style.css';
import Button from 'preact-material-components/Button';
import 'preact-material-components/Button/style.css';
//import IconToggle from 'preact-material-components/IconToggle';
//import 'preact-material-components/IconToggle/style.css';
import Checkbox from 'preact-material-components/Checkbox';
import 'preact-material-components/Checkbox/style.css';
import { route } from 'preact-router';
import Component from '../../components/component';
import disp from '../../lib/store';
import { headerTitleStorePath, headerSearchStorePath } from '../../const';
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
		if (list && list.rows)
			disp(store => store.cmpSetIn(headerTitleStorePath, 'Категории')
				.deleteIn(headerSearchStorePath));
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

	handleCategoriesCheckList = link => e => {
		e.stopPropagation();
		e.preventDefault();

		const { rows } = this.state.list;
		const row = rows.find(v => v.link === link);
		row.checked = e.target.checked;
		row.disabled = row.checked;

		let a = 0;

		for (const v of rows)
			a += ~~v.checked;

		this.setState({ checkedCategories: a > 1 });
	}

	style = [style.categories, 'mdc-toolbar-fixed-adjust'].join(' ');

	render(props, { list, checkedCategories }) {
		if (list === undefined || list.rows === undefined)
			return undefined;

		// const toggleOnIcon = {
		// 	content: 'check_circle',
		// 	label: 'Remove From checklist'
		// };
		// const toggleOffIcon = {
		// 	content: 'check',
		// 	label: 'Add to checklist'
		// };

		const items = list.rows.map(({ link, name, checked, disabled }) => (
			<List.Item key={link}>
				{/*<IconToggle
					role="button"
					tabindex="0"
					aria-pressed="false"
					aria-label="Add to checklist"
					data-toggle-on={toggleOnIcon}
					data-toggle-off={toggleOffIcon}
					onChange={this.handleCategoriesCheckList(link)}
				/>*/}
				<Checkbox
					checked={checked}
					onChange={this.handleCategoriesCheckList(link)}
				/>
				<Button unelevated
					disabled={disabled}
					onClick={this.goCategory(link)}
				>
					{name}
				</Button>
			</List.Item>));

		if (checkedCategories) {
			const click = this.goCategory(
				list.rows.reduce((a, v) => a + (v.checked ? ',' + v.link : ''), '').substr(1)
			);
			const item = (
				<List.Item>
					<Button unelevated onClick={click}>Открыть выбранные</Button>
				</List.Item>);

			items.push(item);
		}

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
