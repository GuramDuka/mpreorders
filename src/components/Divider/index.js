//------------------------------------------------------------------------------
import MaterialComponent from 'preact-material-components/MaterialComponent';
import './style.scss';
//------------------------------------------------------------------------------
////////////////////////////////////////////////////////////////////////////////
//------------------------------------------------------------------------------
export default class Divider extends MaterialComponent {
	constructor() {
		super();
		this.componentName = 'divider';
		this._mdcProps = ['horizontal', 'vertical', 'inline'];
	}

	materialDom(props) {
		return <div ref={this.setControlRef} {...props} />;
	}
}
//------------------------------------------------------------------------------
