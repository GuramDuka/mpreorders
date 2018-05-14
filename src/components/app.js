//------------------------------------------------------------------------------
//import debug from 'preact/devtools';
//------------------------------------------------------------------------------
import Component from './component';
import { Router } from 'preact-router';
import Header from './header';
import Home from '../routes/home';//import Home from 'async!../routes/home';
import Profile from '../routes/profile';//import Profile from 'async!../routes/profile';
import Login from '../routes/profile/login';
import Registration from '../routes/profile/registration';
import Categories from '../routes/categories';//import Categories from 'async!../routes/categories';
import Category from '../routes/category';//import Category from 'async!../routes/category';
import Product from '../routes/product';//import Product from 'async!../routes/product';
//------------------------------------------------------------------------------
/** fall-back route (handles unroutable URLs) */
const Error = ({ type, url }) => (
	<section class="error">
		<h2>Error {type}</h2>
		<p>It looks like we hit a snag.</p>
		<pre>{url}</pre>
	</section>
);
//------------------------------------------------------------------------------
export default class App extends Component {
	/** Gets fired when the route changes.
	 *	@param {Object} event		"change" event from [preact-router](http://git.io/preact-router)
	 *	@param {string} event.url	The newly routed URL
	 */
	handleRoute = e => this.currentUrl = e.url

	render() {
		return (
			<div id="app">
				<Header />
				<Router onChange={this.handleRoute}>
					<Home path="/" />
					<Profile path="/profile/" />
					<Login path="/login/" />
					<Registration path="/registration/" />
					<Category path="/category/:category/:pageProps" />
					<Categories path="/categories/" />
					<Product path="/product/:link" />
					<Error type="404" default />
				</Router>
			</div>
		);
	}
}
