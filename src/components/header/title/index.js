//------------------------------------------------------------------------------
import Component from '../../component';
import Toolbar from 'preact-material-components/Toolbar';
import 'preact-material-components/Toolbar/style.css';
//import style from './style';
//------------------------------------------------------------------------------
export default class Title extends Component {
	storePaths = new Map([
		[
			state => this.setState(state),
			{ path: 'header.title', alias: 'title' }
		]
	])

	render(props, { title }) {
		return <Toolbar.Title>{title}</Toolbar.Title>;
	}
}
//------------------------------------------------------------------------------
