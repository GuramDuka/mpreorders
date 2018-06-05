//------------------------------------------------------------------------------
//import debug from 'preact/devtools';
//------------------------------------------------------------------------------
import { Component } from 'preact';
import { Router } from 'preact-router';
import Header from '../Header';
import Home from '../../routes/Home';//import Home from 'async!../routes/Home';
import Cart from '../../routes/Cart';//import Cart from 'async!../routes/Cart';
import Profile from '../../routes/Profile';//import Profile from 'async!../routes/Profile';
import Login from '../../routes/Profile/Login';
import Registration from '../../routes/Profile/Registration';
import Categories from '../../routes/Categories';//import Categories from 'async!../routes/Categories';
import Category from '../../routes/Category';//import Category from 'async!../routes/Category';
import Product from '../../routes/Product';//import Product from 'async!../routes/Product';
//------------------------------------------------------------------------------
import style from './style.scss';
//------------------------------------------------------------------------------
/** fall-back route (handles unroutable URLs) */
const Error = ({ type, url }) => (
	<section class={style.error}>
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
					<Cart path="/cart/" />
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
