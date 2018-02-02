//------------------------------------------------------------------------------
import { nullLink } from './const';
//------------------------------------------------------------------------------
export const defaultState = {
	version: 0,
	metadataVersion: 7,
	auth: {
	},
	header: {
		darkThemeEnabled: false
	},
	products: {
		list: {
			breadcrumb: [{ name: '', link: nullLink }],
			view: {
				type: 'products',
				order: {
					field: 'name',
					direction: 'asc'
				},
				parent: nullLink,
				groups: true,
				elements: true
			}
		}
	}
};
//------------------------------------------------------------------------------
