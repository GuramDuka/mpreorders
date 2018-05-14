//------------------------------------------------------------------------------
import wog from 'window-or-global';
import Card from 'preact-material-components/Card';
import 'preact-material-components/Card/style.css';
import 'preact-material-components/Button/style.css';
import { prevent, plinkRoute } from '../../../lib/util';
import Component from '../../component';
import style from './style';
import { nullLink } from '../../../const';
import { icoUrl, imgUrl } from '../../../backend';
//import nopic from '../../../assets/nopic.svg';
//import hourglassImage from '../../../assets/hourglass.svg';
//import loadingImage from '../../../assets/loading-process.svg';
import styleSpin from '../../header/spinner/style.css';
//------------------------------------------------------------------------------
const icoWidth = wog.document && wog.getComputedStyle
	? Math.min(360,
		~~wog.getComputedStyle(wog.document.getElementById('app'))
			.width.replace(/px$/, '') * 0.65)
	: 0;
const icoHeight = wog.document && wog.getComputedStyle
	? Math.min(200,
		~~wog.getComputedStyle(wog.document.getElementById('app'))
			.height.replace(/px$/, '') * 0.65)
	: 0;
//------------------------------------------------------------------------------
////////////////////////////////////////////////////////////////////////////////
//------------------------------------------------------------------------------
export default class ProductCard extends Component {
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

		//const imgHeight = ~~style.imgHeight.substr(0, style.imgHeight.length - 2);
		this.setState({
			primaryImageUrl: primaryImageLink && primaryImageLink !== nullLink
				? icoUrl(primaryImageLink, icoWidth, icoHeight, 16)
				: '/assets/nopic.svg'
		});

		// let { width, height } = wog.getComputedStyle(wog.document.getElementById('app'));
		// width = ~~width.replace(/px$/, '');
		// height = ~~height.replace(/px$/, '');
		// console.log(width, height, width * 0.65, height * 0.65);
	}

	primaryImageOnLoad = e => {
		this.setState({
			isPrimaryImageLoaded: true,
			isPrimaryImageLoadError: undefined
		});
		return prevent(e);
	}

	primaryImageOnError = e => {
		this.setState({
			isPrimaryImageLoaded: true,
			isPrimaryImageLoadError: true
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

	ims = [style.im, styleSpin.spin].join(' ')

	render({ classes }, { isPrimaryImageLoaded, isPrimaryImageLoadError, primaryImageUrl }) {
		return (
			<Card className={[style.card, ...classes].join(' ')}>
				<div>
					<h4 class="mdc-typography--title">{this.title}</h4>
					<div class="mdc-typography--caption">{this.subTitle}</div>
				</div>
				<Card.Media>
					{isPrimaryImageLoaded ? undefined :
						<img class={style.dn}
							src={primaryImageUrl}
							onLoad={this.primaryImageOnLoad}
							onError={this.primaryImageOnError}
						/>}
					<img class={isPrimaryImageLoaded ? style.im : this.ims}
						src={isPrimaryImageLoaded
							? isPrimaryImageLoadError
								? '/assets/hourglass.svg'
								: primaryImageUrl
							: '/assets/loading-process.svg'}
						onClick={this.openImageMagnifier}
					/>
				</Card.Media>
				<Card.ActionButton {...this.goProduct}>
					ПЕРЕЙТИ
				</Card.ActionButton>
			</Card >);
	}
}
//------------------------------------------------------------------------------
