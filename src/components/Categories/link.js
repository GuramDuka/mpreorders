import { plinkRoute } from '../../lib/util';
//------------------------------------------------------------------------------
export function linkTo(path) {
	return { href: path, onClick: plinkRoute(path) };
}
//------------------------------------------------------------------------------
export function goCategory(link, page = 1, pageSize = 40) {
	return linkTo('/category/' + link + '/' + page + ',' + pageSize);
}
//------------------------------------------------------------------------------
