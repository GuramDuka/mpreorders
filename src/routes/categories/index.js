//------------------------------------------------------------------------------
import Component from '../../components/component';
import style from './style';
import { transform } from '../../lib/util';
import { bfetch } from '../../backend/backend';
import disp from '../../lib/store';
//------------------------------------------------------------------------------
////////////////////////////////////////////////////////////////////////////////
//------------------------------------------------------------------------------
export default class Categories extends Component {
	constructor(props, context) {
		super(props, context);

		props.storePaths = new Map([
			[
				state => this.mergeState(state),
				{ path: 'categories.list', alias: 'categories' }
			]
		]);
	}

	fetchState() {
		const rr = {
			m: 'category', f: 'list', r: { target: 'products' }
		};

		bfetch({ r: rr }, json =>
			disp(state =>
				state.setIn('categories.list', transform(json))));
	}

	render(props, { categories }) {
		if (categories === undefined)
			return undefined;

		return (
			<div class={style.categories} className="mdc-toolbar-fixed-adjust">
				{categories.rows.map((r, i) => (
					<p>
						<span>key: {i}, </span>
						<span>text: {r.name}, </span>
						<span>value: {r.link}</span>
					</p>))}
			</div>
		);
	}
}
//------------------------------------------------------------------------------
