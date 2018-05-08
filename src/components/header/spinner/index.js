//------------------------------------------------------------------------------
import Component from '../../component';
import Toolbar from 'preact-material-components/Toolbar';
import 'preact-material-components/Toolbar/style.css';
import style from './style';
//------------------------------------------------------------------------------
export default class Spinner extends Component {
	storePaths = new Map([
		[
			state => this.setState(state),
			{ path: 'header.spinner.active', alias: 'active' }
		]
	])
	
	render(props, { active }) {
		return active ? (
			<Toolbar.Icon
				className={['material-icons', style.spin].join(' ')}
			>
				refresh
			</Toolbar.Icon>
		) : undefined;
	}
}
//------------------------------------------------------------------------------
