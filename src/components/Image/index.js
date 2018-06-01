//------------------------------------------------------------------------------
import { LRUMap } from 'lru_map';
import { Component } from 'preact';
import { imgReq, imgUrl, imgKey, bfetch } from '../../backend';
import { nullLink } from '../../const';
import { randomInteger, prevent } from '../../lib/util';
import root from '../../lib/root';
import { webpRuntimeInitialized, webp2png } from '../../lib/webp';
import style from './style.scss';
//------------------------------------------------------------------------------
function createElement(tag) {
	return root.document
		? root.document.createElement(tag)
		: {};
}
//------------------------------------------------------------------------------
function headAppendChild(element) {
	return root.document
		? root.document.head.appendChild(element)
		: element;
}
//------------------------------------------------------------------------------
function getElementById(key) {
	return root.document
		? root.document.getElementById(key)
		: undefined;
}
//------------------------------------------------------------------------------
////////////////////////////////////////////////////////////////////////////////
//------------------------------------------------------------------------------
class Image extends Component {
	static isWebPSupported = (() => {
		const canvas = createElement('canvas');
		canvas.width = canvas.height = 1;
		return canvas.toDataURL
			? canvas.toDataURL('image/webp').indexOf('image/webp') === 5
			: false;
	})();

	static __id = 0
	static __cacheId = '$__image_cache__#'
	static __cacheLRU = (() => {
		const c = new LRUMap(40 * 3);
		c.shift = function () {
			let entry = LRUMap.prototype.shift.call(this);
			const [key] = entry;
			const e = getElementById(key);

			if (e)
				e.remove();

			return entry;
		};
		return c;
	})()

	constructor() {
		super();

		this.idn = ++Image.__id;
		this.ids = `$__image__#${this.idn}`;
		this.waitStyleComputed = this.waitStyleComputed.bind(this);
		this.windowOnResize = this.windowOnResize.bind(this);
	}

	componentWillMount() {
		let cache = getElementById(Image.__cacheId);

		if (cache) {
			cache.refCount++;
		}
		else {
			cache = createElement('style');
			cache.id = Image.__cacheId;
			cache.refCount = 1;
			headAppendChild(cache);

			if (cache.sheet) {
				cache.sheet.insertRule(`.nopic { background-image: url(/assets/nopic.svg) }`);
				cache.sheet.insertRule(`.picld { background-image: url(/assets/loading-process.svg) }`);
			}
		}

		this.mount(this.props);
	}

	componentDidMount() {
		root.addEventListener('resize', this.windowOnResize);
	}

	componentWillReceiveProps(props) {
		this.mount(props);
	}

	componentWillUnmount() {
		delete this.mounted;
		root.removeEventListener('resize', this.windowOnResize);

		const cache = getElementById(Image.__cacheId);

		if (--cache.refCount === 0)
			cache.remove();
	}

	mount(props) {
		this.mounted = true;
		this.setState({ imageClass: undefined }, this.waitStyleComputed);
	}

	windowOnResize(e) {
		this.waitStyleComputed();
	}

	// findCacheEntry(key) {
	// 	return getElementById(key);
	// 	// return root.document.evaluate(
	// 	// 	`style[@key='${key}']`,
	// 	// 	root.document.head,
	// 	// 	null,
	// 	// 	XPathResult.FIRST_ORDERED_NODE_TYPE,
	// 	// 	null).singleNodeValue;
	// }

	insertCacheEntry(key, url) {
		const { __cacheLRU } = Image;
		let entry = __cacheLRU.get(key);

		if (!entry) {
			entry = createElement('style');
			entry.id = key;
			headAppendChild(entry);

			if (entry.sheet) {
				//const index = cache.sheet.cssRules.length;
				entry.sheet.insertRule(`.${key} { background-image: url(${url}); }`);
			}

			__cacheLRU.set(key, true);
		}

		this.setState({ imageClass: key });
	}

	waitStyleComputed(props) {
		if (!this.mounted)
			return;

		if (!Image.isWebPSupported)
			if (!webpRuntimeInitialized(this.waitStyleComputed))
				return;

		const image = getElementById(this.ids);
		let loop = true;

		if (image) {
			let { width, height } = root.getComputedStyle(image);

			width = ~~width.replace(/px$/, '');
			height = ~~height.replace(/px$/, '');

			if (width > 0 && height > 0) {
				const { link, lossless, noresize } = props ? props : this.props;

				if (link && link !== nullLink) {
					const r = { u: link, w: width, h: height };

					if (lossless)
						r.lossless = true;

					if (noresize)
						r.w = r.h = undefined;

					const imageKey = imgKey(r);

					let entry = Image.__cacheLRU.get(imageKey);

					if (entry) {
						this.setState({ imageClass: imageKey });
					}
					else if (Image.isWebPSupported) {
						this.insertCacheEntry(imageKey, imgUrl(r));
					}
					else {
						bfetch(
							imgReq(r),
							result => this.insertCacheEntry(imageKey, webp2png(result)),
							error => this.setState({ imageClass: 'nopic' })
						);
						this.setState({ imageClass: 'picld' });
					}
					loop = false;
				}
				else {
					this.setState({ imageClass: 'nopic' });
					loop = false;
				}
			}
		}

		if (loop)
			root.setTimeout(this.waitStyleComputed, 10);
	}

	render(props, { imageClass }) {
		const m = { ...props };

		m.id = this.ids;
		m.class = [
			style.media,
			m.inline ? 'mdc-display-inline' : '',
			imageClass,
			imageClass === 'picld' ? style['spin' + randomInteger(0, 7)] : ''
		].concat(
			...(Array.isArray(m.class) ? m.class : [m.class])
		).join(' ').trim();

		return (
			<div {...m}>
				{props.children}
			</div>);
	}
}
//------------------------------------------------------------------------------
class Magnifier extends Component {
	show = link => this.setState(
		// eslint-disable-next-line
		{ link: link }
	)

	close = e => {
		this.setState({ link: undefined });
		return prevent(e);
	}

	render(props, { link }) {
		const s = [
			style.magnifier,
			link === undefined ? style.dn : ''
		].join(' ').trim();

		return (
			<div class={s}>
				<Image class={style.magnifierImage} lossless noresize
					onClick={this.close}
					link={link}
				/>
			</div>);
	}
}
//------------------------------------------------------------------------------
Image.Magnifier = Magnifier;
export default Image;
//------------------------------------------------------------------------------
