//import 'preact/debug';
import { h, Component } from 'preact';
import { Router } from 'preact-router';

import Header from './header';
import Home from '../routes/home';
import Profile from '../routes/profile';
// import Home from 'async!../routes/home';
// import Profile from 'async!../routes/profile';

import { bfetch, transform } from '../backend/backend';

export default class App extends Component {
	/** Gets fired when the route changes.
	 *	@param {Object} event		"change" event from [preact-router](http://git.io/preact-router)
	 *	@param {string} event.url	The newly routed URL
	 */
	handleRoute = e => {
		this.currentUrl = e.url;
		this.load(e);
	};

	load = e => {
		const obj = this;
		const rr = {
			m: 'category',
			f: 'list',
			r: {
				target: 'Номенклатура'
			}
		};

		bfetch({ r: rr }, json => {
			obj.setState({
				options: transform(json).rows.map(
					(r, i) => ({ key: i, text: r.Наименование, value: r.Ссылка }))
			});
		});
	};

	render() {
		return (
			<div id="app">
				<Header />
				<Router onChange={this.handleRoute}>
					<Home path="/" />
					<Profile path="/profile/" user="me" />
					<Profile path="/profile/:user" />
				</Router>
			</div>
		);
	}
}
