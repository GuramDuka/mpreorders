//------------------------------------------------------------------------------
import Deque from 'double-ended-queue';
import { Component } from 'preact';
import { imgReq, imgUrl, imgKey, bfetch } from '../../backend';
import { nullLink } from '../../const';
import root from '../../lib/root';
import { webpRuntimeInitialized, webp2png } from '../../lib/webp';
//import { convert } from '../../../../lib/rgba2data';
import style from './style.scss';
//------------------------------------------------------------------------------
////////////////////////////////////////////////////////////////////////////////
//------------------------------------------------------------------------------
export default class Image extends Component {
	static isWebPSupported = (() => {
		const canvas = root.document
			? root.document.createElement('canvas')
			: {};
		canvas.width = canvas.height = 1;
		return canvas.toDataURL
			? canvas.toDataURL('image/webp').indexOf('image/webp') === 6
			: false;
	})();

	static __id = 0
	static __cacheId = '$__image_cache__#'
	static __cacheTuples = new Deque([])
	static __cacheMaxTuples = 40 * 10
	
	constructor() {
		super();

		this.idn = ++Image.__id;
		this.ids = `$__image__#${this.idn}`;
		this.waitStyleComputed = this.waitStyleComputed.bind(this);
		this.windowOnResize = this.windowOnResize.bind(this);
	}

	componentWillMount() {
		this.mount(this.props);
	}

	componentDidMount() {
		let cache = root.document.getElementById(Image.__cacheId);

		if (cache) {
			cache.refCount++;
		}
		else {
			cache = root.document.createElement('style');
			cache.id = Image.__cacheId;
			cache.refCount = 1;
			root.document.head.appendChild(cache);
			cache.sheet.insertRule(`.nopic { background-image: url(/assets/nopic.svg) }`, 0);
			cache.sheet.insertRule(`.picld { background-image: url(/assets/loading-process.svg) }`, 0);
		}

		root.addEventListener('resize', this.windowOnResize);
	}

	componentWillReceiveProps(props) {
		this.mount(props);
	}

	componentWillUnmount() {
		delete this.mounted;
		root.removeEventListener('resize', this.windowOnResize);

		let cache = root.document.getElementById(Image.__cacheId);

		if (cache && --cache.refCount === 0)
			cache.remove();

		this.removeCacheEntry(this.state.imageClass);
	}

	mount(props) {
		this.mounted = true;
		this.setState({ imageClass: undefined }, this.waitStyleComputed);
	}

	windowOnResize(e) {
		this.waitStyleComputed();
	}

	findCacheEntry(key) {
		return root.document.getElementById(key);
		// return root.document.evaluate(
		// 	`style[@key='${key}']`,
		// 	root.document.head,
		// 	null,
		// 	XPathResult.FIRST_ORDERED_NODE_TYPE,
		// 	null).singleNodeValue;
	}

	removeCacheEntry(key) {
		const entry = this.findCacheEntry(key);

		if (entry && --entry.refCount === 0)
			entry.remove();
	}
	
	insertCacheEntry(entry, key, url) {
		while (Image.__cacheTuples.length >= Image.__cacheMaxTuples)
			this.removeCacheEntry(Image.__cacheTuples.shift());

		if (entry) {
			entry.refCount++;
		}
		else {
			entry = root.document.createElement('style');
			entry.id = key;
			//entry.setAttribute('key', key);
			entry.refCount = 1;
			root.document.head.appendChild(entry);
			//const index = cache.sheet.cssRules.length;
			entry.sheet.insertRule(`.${key} { background-image: url(${url}); }`);
		}

		Image.__cacheTuples.push(key);

		this.setState({ imageClass: key });
	}

	waitStyleComputed() {
		if (!this.mounted)
			return;

		if (!Image.isWebPSupported)
			if (!webpRuntimeInitialized(this.waitStyleComputed))
				return;

		const image = root.document.getElementById(this.ids);
		let loop = true;

		if (image) {
			let { width, height } = root.getComputedStyle(image);

			width = ~~width.replace(/px$/, '');
			height = ~~height.replace(/px$/, '');

			if (width > 0 && height > 0) {
				const { props } = this;
				const { link } = props;

				if (link && link !== nullLink) {
					const imageKey = imgKey(link, width, height);

					let entry = this.findCacheEntry(imageKey);

					if (entry) {
						this.setState({ imageClass: imageKey });
					}
					else if (Image.isWebPSupported) {
						this.insertCacheEntry(entry, imageKey, imgUrl(link, width, height));
					}
					else {
						bfetch(
							imgReq(link, width, height),
							result => this.insertCacheEntry(entry, imageKey, webp2png(result)),
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
		m.class = (Array.isArray(m.class) ? [...m.class] : [m.class]).concat(
			style.media,
			imageClass,
			imageClass === 'picld' ? style.spin : ''
		).join(' ').trim();

		return (
			<div {...m}>
				{props.children}
			</div>);
	}
}
//------------------------------------------------------------------------------
