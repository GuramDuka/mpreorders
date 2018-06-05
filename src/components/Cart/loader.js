//------------------------------------------------------------------------------
import { bfetch } from '../../backend';
import { successor, failer, starter } from '../load';
//------------------------------------------------------------------------------
export function pull() {
	const { props, state } = this;
	const { auth, f, link } = props;
	const opts = {
		r: {
			m: 'dict',
			f: f ? f : 'object',
			r: {
				target: 'products',
				// eslint-disable-next-line
				link: link
			}
		},
		a: auth || (state.auth && state.auth.authorized),
		e: auth
	};

	return bfetch(
		opts,
		successor(result => {
			this.refreshUrls = { [opts.url]: result.endOfLife };
			this.setState({ data: result });
		}),
		failer(),
		starter()
	);
}
//------------------------------------------------------------------------------
export function push(r) {
	const { props } = this;
	const opts = {
		refreshUrls: this.refreshUrls,
		method: 'PUT',
		r: {
			m: 'dict',
			f: 'push',
			r: {
				target: 'products',
				link: props.link,
				...r
			}
		},
		a: true
	};

	return bfetch(
		opts,
		successor(result => this.setState(result)),
		failer(error => this.showError(error.message)),
		starter()
	);
}
//------------------------------------------------------------------------------
