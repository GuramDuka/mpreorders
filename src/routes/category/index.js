//------------------------------------------------------------------------------
import Component from '../../components/component';
import style from './style';
import { route } from 'preact-router';
import { transform } from '../../lib/util';
import { bfetch } from '../../backend/backend';
import disp from '../../lib/store';
//------------------------------------------------------------------------------
////////////////////////////////////////////////////////////////////////////////
//------------------------------------------------------------------------------
export default class Category extends Component {
	constructor(props, context) {
		super(props, context);
		props.storePaths = new Map([
			[
				state => this.setState(state),
				{ path: 'categories.dataByUUID.' + props.category, alias: 'data' }
			]
		]);
	}

	fetchState() {
		const rr = {
			m: 'category', f: 'list', r: { target: 'products' }
		};

		bfetch({ r: rr }, json =>
			disp(state => state.setIn('data', transform(json).rows)));
	}

	linkTo = path => e => route(path)
	goCategory = cUUID => this.linkTo('/categories/' + cUUID);
	
	render() {
		return (
			<div class={style.category} className="mdc-toolbar-fixed-adjust">
				<p>
					Placeholder
				</p>
			</div>
		);
	}
}
//------------------------------------------------------------------------------
