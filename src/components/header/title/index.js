//------------------------------------------------------------------------------
import Component from '../../component';
import TopAppBar from 'preact-material-components/TopAppBar';
import 'preact-material-components/TopAppBar/style.css';
import style from './style.scss';
//------------------------------------------------------------------------------
export default class Title extends Component {
	storePaths = new Map([
		[
			state => this.setState(state),
			{ path: 'header.title', alias: 'title' }
		]
	])

	render(props, { title }) {
		// Zero Width Space https://unicode-table.com/ru/200B/
		// Need for right positioning when title.length === 0
		return (
			<TopAppBar.Title class={style.title}>
				&#x200B;
				{title}
			</TopAppBar.Title>);
	}
}
//------------------------------------------------------------------------------
