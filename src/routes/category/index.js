//------------------------------------------------------------------------------
import { Component } from 'preact';
import Category from '../../components/category';
import style from './style';
//------------------------------------------------------------------------------
////////////////////////////////////////////////////////////////////////////////
//------------------------------------------------------------------------------
export default class CategoryRoute extends Component {
	style = [style.category, 'mdc-toolbar-fixed-adjust'].join(' ');

	render(props) {
		return <Category containerClass={this.style} {...props} />;
	}
}
//------------------------------------------------------------------------------
