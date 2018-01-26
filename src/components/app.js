//------------------------------------------------------------------------------
//import debug from 'preact/devtools';
//------------------------------------------------------------------------------
import Component from './component';
import { Router } from 'preact-router';
import Header from './header';
import Home from '../routes/home'; // import Home from 'async!../routes/home';
import Profile from '../routes/profile'; // import Profile from 'async!../routes/profile';
import Categories from '../routes/categories';
import Category from '../routes/category';
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
					<Profile path="/profile/" user="me" />
					<Profile path="/profile/:user" />
					<Category path="/categories/:category/:pageProps" />
					<Categories path="/categories/" />
				</Router>
			</div>
		);
	}
}
