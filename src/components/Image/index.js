//------------------------------------------------------------------------------
import { Component } from 'preact';
import { imgReq, imgUrl, imgKey, bfetch } from '../../backend';
import { nullLink } from '../../const';
import root from '../../lib/root';
import {
	webpRuntimeInitialized,
	webp2png
} from '../../lib/webp';
//import { convert } from '../../../../lib/rgba2data';
import style from './style.scss';
//------------------------------------------------------------------------------
////////////////////////////////////////////////////////////////////////////////
//------------------------------------------------------------------------------
export default class Image extends Component {
	static __id = 0
	static __cacheId = '$__image_cache__#'
	static isWebPSupported = (() => {
		const canvas = root.document
			? root.document.createElement('canvas')
			: {};
		canvas.width = canvas.height = 1;
		return canvas.toDataURL
			? canvas.toDataURL('image/webp').indexOf('image/webp') === 5
			: false;
	})();
	
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
		root.addEventListener('resize', this.windowOnResize);
	}

	componentWillReceiveProps(props) {
		this.mount(props);
	}

	componentWillUnmount() {
		delete this.mounted;
		root.removeEventListener('resize', this.windowOnResize);
	}

	mount(props) {
		this.mounted = true;
		this.setState({ imageClass: undefined }, this.waitStyleComputed);
	}

	windowOnResize(e) {
		this.waitStyleComputed();
	}

	insertCacheEntry(cache, imageKey, imageUrl) {
		const index = cache.sheet.cssRules.length;
		cache.sheet.insertRule(`.${imageKey} { background-image: url(${imageUrl}); }`, index);
		cache.entries.set(index, imageKey);
		cache.entries.set(imageKey, index);

		if (cache.entries.size === 42) {

		}

		this.setState({ imageClass: imageKey });
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

					let cache = root.document.getElementById(Image.__cacheId);

					if (!cache) {
						cache = root.document.createElement('style');
						cache.id = Image.__cacheId;
						root.document.head.appendChild(cache);
						cache.sheet.insertRule(`.nopic { background-image: url(/assets/nopic.svg) }`, 0);
						cache.sheet.insertRule(`.picld { background-image: url(/assets/loading-process.svg) }`, 0);
					}

					// let entry = root.document.evaluate(
					// 	`style[@key='${imageKey}']`,
					// 	cache,
					// 	null,
					// 	XPathResult.FIRST_ORDERED_NODE_TYPE,
					// 	null).singleNodeValue;

					if (!cache.entries)
						cache.entries = new Map();

					let entry = cache.entries.get(imageKey);

					if (entry) {
						this.setState({ imageClass: imageKey });
					}
					else if (Image.isWebPSupported) {
						this.insertCacheEntry(cache, imageKey, imgUrl(link, width, height));
					}
					else {
						bfetch(
							imgReq(link, width, height),
							result => this.insertCacheEntry(cache, imageKey, webp2png(result)),
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
