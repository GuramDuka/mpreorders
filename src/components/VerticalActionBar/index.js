//------------------------------------------------------------------------------
import { Component } from 'preact';
import Fab from 'preact-material-components/Fab';
import 'preact-material-components/Fab/style.css';
import { prevent } from '../../lib/util';
import root from '../../lib/root';
import style from './style.scss';
//------------------------------------------------------------------------------
////////////////////////////////////////////////////////////////////////////////
//------------------------------------------------------------------------------
class VerticalActionBarInner extends Component {
	render(props) {
		return (
			<li {...props}>
				{props.children}
			</li>
		);
	}
}
//------------------------------------------------------------------------------
////////////////////////////////////////////////////////////////////////////////
//------------------------------------------------------------------------------
class VerticalActionBarFab extends Component {
	render(props) {
		return (
			<VerticalActionBarInner>
				<Fab {...props} mini primary>
					<Fab.Icon>
						{props.children}
					</Fab.Icon>
				</Fab>
			</VerticalActionBarInner>
		);
	}
}
//------------------------------------------------------------------------------
////////////////////////////////////////////////////////////////////////////////
//------------------------------------------------------------------------------
class VerticalActionBar extends Component {
	static __id = 0

	constructor() {
		super();

		this.handleOutsideClick = this.handleOutsideClick.bind(this);
		this.id = '$__vab__#' + (++VerticalActionBar.__id);
	}

	componentWillMount() {
		this.setState(
			{ isPopup: this.props.popup },
			this.stateChangeCallback
		);
	}

	componentWillReceiveProps(props) {
		this.setState(
			{ isPopup: props.popup },
			this.stateChangeCallback
		);
	}

	handleOutsideClick(e) {
		const { id } = this;
		// ignore clicks on the component itself
		for (let t = e.target; t && t !== e.currentTarget; t = t.parentNode)
			if (t.id === id)
				return;

		this.handleClickPopup(e);
	}

	handlePopupStateChange = isPopup => {
		const p = isPopup ? 'add' : 'remove';
		const f = root.document[`${p}EventListener`];

		for (const e of ['mousedown', 'keydown', 'touchstart'])
			f(e, this.handleOutsideClick, false);
	}

	handleClickPopup = e => {
		this.setState(
			{ isPopup: !this.state.isPopup },
			this.stateChangeCallback
		);
		return prevent(e);
	}

	stateChangeCallback = () => {
		if (!this.props.fixed)
			this.handlePopupStateChange(this.state.isPopup);
	}

	render(props, state) {
		// const actionsFabs = isPopup
		// 	? props.actions.map(v => (
		// 		<li>
		// 			<Fab mini primary {...v.action}>
		// 				<Fab.Icon>
		// 					{Array.isArray(v.icon)
		// 						? v.icon[v.iconIndex]
		// 						: v.icon}
		// 				</Fab.Icon>
		// 			</Fab>
		// 		</li>))
		// 	: undefined;

		const popuper = props.fixed ? undefined : (
			<VerticalActionBarFab secondary onClick={this.handleClickPopup}>
				{state.isPopup ? 'remove' : 'add'}
			</VerticalActionBarFab>);

		return (
			<ul {...props} id={this.id} class={style.bar}>
				{state.isPopup ? props.children : undefined}
				{popuper}
			</ul>);
	}
}
//------------------------------------------------------------------------------
VerticalActionBar.Inner = VerticalActionBarInner;
VerticalActionBar.Fab = VerticalActionBarFab;
//------------------------------------------------------------------------------
export default VerticalActionBar;
//------------------------------------------------------------------------------
