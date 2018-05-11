//------------------------------------------------------------------------------
import Card from 'preact-material-components/Card';
import 'preact-material-components/Card/style.css';
import 'preact-material-components/Button/style.css';
import { prevent } from '../../../lib/util';
import Component from '../../component';
import style from './style';
import { nullLink } from '../../../const';
import { icoUrl } from '../../../backend';
//import nopic from '../../../assets/nopic.svg';
//import hourglassImage from '../../../assets/hourglass.svg';
//import loadingImage from '../../../assets/loading-process.svg';
import styleSpin from '../../header/spinner/style.css';
//------------------------------------------------------------------------------
////////////////////////////////////////////////////////////////////////////////
//------------------------------------------------------------------------------
export default class ProductCard extends Component {
	willMount() {
		this.transform(this.props);
	}

	willReceiveProps(props) {
		this.transform(props);
	}

	transform(props) {
		const {
			code,
			name,
			article,
			manufacturer,
			remainder,
			reserve,
			price,
			primaryImageLink
		} = props.data;
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
		this.primaryImageUrl = primaryImageLink && primaryImageLink !== nullLink
			? icoUrl(primaryImageLink, undefined, 150, 16)
			: '/assets/nopic.svg';
	}

	primaryImageOnLoad = e => {
		this.setState({
			isPrimaryImageLoaded: true,
			primaryImage: {
				backgroundImage: `url(${this.primaryImageUrl})`
			}
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

	render({ classes }, { isPrimaryImageLoaded, isPrimaryImageLoadError, primaryImage }) {
		return (
			<Card className={[style.card, ...classes].join(' ')}>
				<div>
					<h4 class="mdc-typography--title">{this.title}</h4>
					<div class="mdc-typography--caption">{this.subTitle}</div>
				</div>
				<Card.Media
					style={primaryImage}
					className={style.media}
				>
					{isPrimaryImageLoaded ? undefined : (
						<img src={this.primaryImageUrl}
							style={{ display: 'none' }}
							onLoad={this.primaryImageOnLoad}
							onError={this.primaryImageOnError}
						/>)}
					{isPrimaryImageLoaded ? undefined : (
						<div className={[style.media, styleSpin.spin].join(' ')}
							style={{
								backgroundImage: 'url('
									+ (isPrimaryImageLoadError
										? '/assets/hourglass.svg'
										: '/assets/loading-process.svg')
									+ ')'
							}}
						/>)}
				</Card.Media>
				<Card.ActionButton>OKAY</Card.ActionButton>
			</Card >);
	}
}
//------------------------------------------------------------------------------
