//------------------------------------------------------------------------------
import { bfetch } from '../../../backend';
import disp from '../../../lib/store';
import { headerTitleStorePath } from '../../../const';
import { successor, failer, starter } from '../../load';
//------------------------------------------------------------------------------
export default function loader() {
	const { props } = this;
	const { auth, employee, f, link } = props;

	return bfetch(
		{
			r: {
				m: 'dict',
				f: f ? f : 'object',
				r: {
					type: 'products',
					// eslint-disable-next-line
					link: link
				}
			},
			a: !!auth,
			e: !!employee
		},
		successor(result => this.setState(
			{ data: result },
			f ? undefined :
				() => disp(store => store.cmpSetIn(
					headerTitleStorePath, result.rows[0].name))
		)),
		failer(),
		starter()
	);
}
//------------------------------------------------------------------------------
