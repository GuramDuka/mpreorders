//------------------------------------------------------------------------------
import { Component } from 'preact';
import './style.scss';
import '../../lib/css/display.scss';
//------------------------------------------------------------------------------
////////////////////////////////////////////////////////////////////////////////
//------------------------------------------------------------------------------
export default class Divider extends Component {
	static __classes = [
		undefined,
		'mdc-horizontal-divider',
		'mdc-vertical-divider'
	]

	componentWillMount() {
		this.componentWillReceiveProps(this.props);
	}

	componentWillReceiveProps(props) {
		const { inline, horizontal, vertical } = props;

		this.class = [
			Divider.__classes[~~horizontal | (~~vertical << 1)],
			inline ? 'mdc-display-inline' : ''
		].concat(
			...(Array.isArray() ? props.class : [props.class])
		).join(' ').trim();
	}

	render(props) {
		return this.class
			? <div {...props} class={this.class} />
			: undefined;
	}
}
//------------------------------------------------------------------------------
