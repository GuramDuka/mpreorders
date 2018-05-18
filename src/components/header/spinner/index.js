//------------------------------------------------------------------------------
import Component from '../../Component';
import Toolbar from 'preact-material-components/Toolbar';
import 'preact-material-components/Toolbar/style.css';
import { loaderSpinnerStorePath } from '../../../const';
import style from './style.scss';
//------------------------------------------------------------------------------
export default class Spinner extends Component {
	storePaths = new Map([
		[
			state => this.setState(state),
			{ path: loaderSpinnerStorePath + '.active', alias: 'active' }
		]
	])
	
	style = ['material-icons', style.spin].join(' ')

	render(props, { active }) {
		return active ? (
			<Toolbar.Icon
				className={this.style}
			>
				refresh
			</Toolbar.Icon>
		) : undefined;
	}
}
//------------------------------------------------------------------------------
