//------------------------------------------------------------------------------
import { bfetch } from '../../../backend';
import { successor, failer, starter } from '../../load';
import disp from '../../../lib/store';
import { headerTitleStorePath } from '../../../const';
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
			this.setState(
				{ data: result },
				f ? undefined :
					() => disp(store => store.cmpSetIn(
						headerTitleStorePath, result.rows[0].name))
			);
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
			m: 'cart',
			f: 'push',
			r: {
				link: props.link,
				...r
			}
		},
		a: true
	};

	return bfetch(
		opts,
		successor(result =>
			this.setState({ vabDisabled: false, ...result })
		),
		failer(error =>
			this.setState(
				{ vabDisabled: false },
				() => this.showError(error.message)
			)
		),
		starter(opts => this.setState({ vabDisabled: true }))
	);
}
//------------------------------------------------------------------------------
