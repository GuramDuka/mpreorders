//------------------------------------------------------------------------------
import { Component } from 'preact';
import Categories from '../../components/categories';
import style from './style';
//------------------------------------------------------------------------------
////////////////////////////////////////////////////////////////////////////////
//------------------------------------------------------------------------------
export default class CategoriesRoute extends Component {
	style = [style.categories, 'mdc-toolbar-fixed-adjust'].join(' ');

	render(props) {
		return (
			<div class={this.style}>
				<Categories {...props} />
			</div>
		);
	}
}
//------------------------------------------------------------------------------
