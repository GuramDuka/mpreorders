//------------------------------------------------------------------------------
import { Component } from 'preact';
import generateThemeClass from 'preact-material-components/themeUtils/generateThemeClass';
import MFab from 'preact-material-components/Fab';
import 'preact-material-components/Fab/style.css';
import { prevent } from '../../lib/util';
import root from '../../lib/root';
import style from './style.scss';
//------------------------------------------------------------------------------
////////////////////////////////////////////////////////////////////////////////
//------------------------------------------------------------------------------
class Fab extends MFab {
	constructor() {
		super();
		this._mdcProps.push('disabled');
	}

	materialDom(props) {
		const classNames = [];

		for (const themeProp of this.themeProps)
			if (themeProp in props && props[themeProp] !== false)
				classNames.push(generateThemeClass(themeProp));

		if (props.disabled)
			classNames.push(style.disabled);

		const classNameString = classNames.join(' ');
		const ButtonElement = props.href ? 'a' : 'button';

		return (
			<ButtonElement
				ref={this.setControlRef}
				{...props}
				className={classNameString}
			>
				{props.children}
			</ButtonElement>
		);
	}
}
//------------------------------------------------------------------------------
////////////////////////////////////////////////////////////////////////////////
//------------------------------------------------------------------------------
class Vab extends Component {
	static __id = 0

	constructor() {
		super();

		this.handleOutsideClick = this.handleOutsideClick.bind(this);
		this.id = '$__vab__#' + (++Vab.__id);
	}

	componentWillMount() {
		this.componentWillReceiveProps(this.props);
	}

	componentWillReceiveProps(props) {
		if (this.state.isPopup)
			this.handlePopupStateChange(false);

		this.stateChangeCallback();
	}

	stateChangeCallback = () => {
		if (!this.props.fixed)
			this.handlePopupStateChange(this.state.isPopup);
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

	render(props, state) {
		const popuper = props.fixed ? undefined : (
			<Fab
				class={style.vis}
				mini secondary disabled={props.disabled}
				onClick={this.handleClickPopup}
			>
				<Fab.Icon>
					{state.isPopup ? 'remove' : 'add'}
				</Fab.Icon>
			</Fab>);

		const className = [
			style.bar,
			props.fixed || state.isPopup ? undefined : style.invis
		].join(' ');

		return (
			<div {...props} id={this.id} className={className}>
				{props.children}
				{popuper}
			</div>);
	}
}
//------------------------------------------------------------------------------
////////////////////////////////////////////////////////////////////////////////
//------------------------------------------------------------------------------
class ScrollUp extends Component {
	static goUp = e => {
		root.scrollTo({
			top: 0,
			left: 0,
			behavior: 'instant'
		});
		return prevent(e);
	}

	render(props) {
		return (
			<Fab mini {...props} onClick={ScrollUp.goUp}>
				<Fab.Icon>
					arrow_upward
				</Fab.Icon>
			</Fab>
		);
	}
}
//------------------------------------------------------------------------------
Vab.Fab = Fab;
Vab.Fab.Icon = MFab.Icon;
Vab.ScrollUp = ScrollUp;
//------------------------------------------------------------------------------
export default Vab;
//------------------------------------------------------------------------------
