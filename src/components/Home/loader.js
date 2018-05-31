//------------------------------------------------------------------------------
import { bfetch } from '../../backend';
import { successor, failer, starter } from '../load';
//------------------------------------------------------------------------------
const opts = {
	r: {
		m: 'pkg',
		r: [
			{
				alias: 'topList',
				m: 'category',
				f: 'top',
				r: { target: 'products' }
			},
			{
				alias: 'rndList',
				m: 'category',
				f: 'rnd',
				r: { target: 'products' }
			}
		]
	}
};
//------------------------------------------------------------------------------
export default function loader(i) {
	const r = Object.assign({}, opts.r.r[i]);
	const { alias } = r;

	delete r.alias;

	return bfetch(
		// eslint-disable-next-line
		{ r: r },
		successor(result => this.setState({
			//topList: result.topList,
			//rndList: result.rndList
			[alias]: result
		})),
		failer(),
		starter()
	);
}
//------------------------------------------------------------------------------
