//------------------------------------------------------------------------------
import List from 'preact-material-components/List';
import 'preact-material-components/List/style.css';
import Button from 'preact-material-components/Button';
import 'preact-material-components/Button/style.css';
//import IconToggle from 'preact-material-components/IconToggle';
//import 'preact-material-components/IconToggle/style.css';
import Checkbox from 'preact-material-components/Checkbox';
import 'preact-material-components/Checkbox/style.css';
import Component from '../Component';
import disp from '../../lib/store';
import { headerTitleStorePath, headerSearchStorePath } from '../../const';
import loader from './loader';
import { goCategory } from './link';
import style from './style.scss';
import { prevent } from '../../lib/util';
//------------------------------------------------------------------------------
////////////////////////////////////////////////////////////////////////////////
//------------------------------------------------------------------------------
export default class Categories extends Component {
	mount() {
		disp(
			store => store.setIn(headerTitleStorePath, 'Категории')
				.deleteIn(headerSearchStorePath)
			,
			() => loader.call(this)
		);
	}

	handleCategoriesCheckList = link => e => {
		let { checked } = this.state;
		checked || (checked = {});
		checked[link] = e.target.checked;

		// eslint-disable-next-line
		this.setState({ checked: checked });
		return prevent(e);
	}

	render(props, { list, checked }) {
		if (list === undefined)
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
					{...goCategory(link)}
				>
					{name}
				</Button>
			</List.Item>));

		if (checkedKeys.length > 1)
			items.push((
				<List.Item>
					<Button unelevated
						{...goCategory(checkedKeys.join(','))}
					>
						Открыть выбранные
					</Button>
				</List.Item>));

		return (
			<div class={style.categories}>
				<List>
					{items}
				</List>
			</div>
		);
	}
}
//------------------------------------------------------------------------------
