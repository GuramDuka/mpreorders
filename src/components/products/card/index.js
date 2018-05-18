//------------------------------------------------------------------------------
import { Component } from 'preact';
import Card from 'preact-material-components/Card';
import 'preact-material-components/Card/style.css';
import 'preact-material-components/Button/style.css';
import { prevent, plinkRoute } from '../../../lib/util';
import { nullLink } from '../../../const';
import { icoUrl, imgUrl } from '../../../backend';
import root from '../../../lib/root';
//import nopic from '../../../assets/nopic.svg';
//import hourglassImage from '../../../assets/hourglass.svg';
//import loadingImage from '../../../assets/loading-process.svg';
import style from './style.scss';
//------------------------------------------------------------------------------
////////////////////////////////////////////////////////////////////////////////
//------------------------------------------------------------------------------
export default class ProductCard extends Component {
	static __id = 0

	constructor() {
		super();

		this.id = '$__pcard__#' + (++ProductCard.__id);
		this.primaryImageOnLoad = this.primaryImageOnLoad.bind(this);
		this.primaryImageOnError = this.primaryImageOnError.bind(this);
		this.waitStyleComputed = this.waitStyleComputed.bind(this);
	}

	componentWillMount() {
		this.mount(this.props);
	}

	componentWillReceiveProps(props) {
		this.mount(props);
	}

	mount(props) {
		const {
			link,
			code,
			name,
			article,
			manufacturer,
			remainder,
			reserve,
			price,
			primaryImageLink
		} = props.data;

		this.goProduct = this.linkTo('/product/' + link);

		// regex replace comma without space after
		const cr = /(,(?=\S)|:)/g;
		const sr = /(\s{2})/g;

		this.code = `[${code}]`;
		this.name = name.replace(cr, ', ').replace(sr, ' ').trim();
		this.article = article.replace(cr, ', ').trim();
		this.manufacturer = manufacturer.replace(cr, ', ').trim();
		this.remainder = remainder !== 0 || reserve !== 0 ? remainder + (reserve ? ' (' + reserve + ')' : '') : '';
		this.price = price + '₽';

		this.title = this.name;
		let subTitle = '';

		for (const v of [
			this.article,
			this.manufacturer,
			this.remainder,
			this.price
		])
			if (v.length !== 0)
				subTitle += `, ${v}`;

		this.subTitle = subTitle.substr(2);

		let url = '/assets/nopic.svg', ld = true, cb;

		if (primaryImageLink && primaryImageLink !== nullLink) {
			url = '/assets/loading-process.svg';
			ld = undefined;
			cb = this.waitStyleComputed;
		}

		this.setState(
			{
				isPrimaryImageLoaded: ld,
				primaryImageUrl: url
			},
			cb
		);
	}

	waitStyleComputed(e) {
		const image = root.document.getElementById(this.id);
		let loop = true;

		if (image) {
			let { width, height } = root.getComputedStyle(image);

			width = ~~width.replace(/px$/, '');
			height = ~~height.replace(/px$/, '');

			if (width && height) {
				const { props } = this;
				const { primaryImageLink } = props.data;
				const primaryImageUrl = icoUrl(primaryImageLink,
					width,
					height,
					16);

				let cache = root.document.getElementById('cache');

				if (!cache) {
					cache = root.document.createElement('div');
					cache.id = 'cache';
					cache.style.display = 'none';
					root.document.body.appendChild(cache);
				}

				let entry = root.document.evaluate(
					`img[@src='${primaryImageUrl}']`,
					cache,
					null,
					XPathResult.FIRST_ORDERED_NODE_TYPE,
					null).singleNodeValue;

				if (entry) {
					if (entry.done) {
						this.setState({
							primaryImageUrl: entry.src,
							isPrimaryImageLoaded: true
						});
						loop = false;
					}
				}
				else {
					entry = root.document.createElement('img');
					entry.style.display = 'none';
					entry.onload = this.primaryImageOnLoad;
					entry.onerror = this.primaryImageOnError;
					entry.src = primaryImageUrl;
					cache.appendChild(entry);
					loop = false;
				}
			}
		}

		if (loop)
			root.setTimeout(this.waitStyleComputed, 1);
	}

	primaryImageOnLoad(e) {
		e.target.done = true;

		this.setState({
			primaryImageUrl: e.target.src,
			isPrimaryImageLoaded: true
		});

		return prevent(e);
	}

	primaryImageOnError(e) {
		this.setState({
			isPrimaryImageLoaded: true,
			primaryImageUrl: '/assets/hourglass.svg'
		});
		return prevent(e);
	}

	linkTo = path => ({ href: path, onClick: plinkRoute(path) })

	openImageMagnifier = e => {
		const { props } = this;
		const { primaryImageLink } = props.data;

		if (primaryImageLink && primaryImageLink !== nullLink)
			props.openImageMagnifier(imgUrl(primaryImageLink));

		return prevent(e);
	}

	titleStyle = [style.title, 'mdc-typography--title'].join(' ')
	subTitleStyle = [style.subTitle, 'mdc-typography--caption'].join(' ')

	render(props, { isPrimaryImageLoaded, primaryImageUrl }) {
		const m = {
			id: this.id,
			class: [
				style.media,
				isPrimaryImageLoaded ? '' : style.spin
			].join(' '),
			style: {
				backgroundImage: `url(${primaryImageUrl})`
			},
			onClick: this.openImageMagnifier
		};

		return (
			<Card>
				<div class={this.titleStyle}>
					{this.title}
				</div>
				<div class={this.subTitleStyle}>
					{this.subTitle}
				</div>
				<Card.Media>
					<div {...m} />
				</Card.Media>
				<Card.ActionButton {...this.goProduct}>
					ПЕРЕЙТИ
				</Card.ActionButton>
			</Card >);
	}
}
//------------------------------------------------------------------------------
