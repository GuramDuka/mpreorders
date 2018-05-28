//------------------------------------------------------------------------------
import { Component } from 'preact';
import Card from 'preact-material-components/Card';
import 'preact-material-components/Card/style.css';
import 'preact-material-components/Button/style.css';
import Image from '../../Image';
import { prevent, plinkRoute } from '../../../lib/util';
import { nullLink } from '../../../const';
import { imgUrl } from '../../../backend';
//import nopic from '../../../assets/nopic.svg';
//import hourglassImage from '../../../assets/hourglass.svg';
//import loadingImage from '../../../assets/loading-process.svg';
import style from './style.scss';
//------------------------------------------------------------------------------
////////////////////////////////////////////////////////////////////////////////
//------------------------------------------------------------------------------
export default class ProductCard extends Component {
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
			price
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

	render(props, state) {
		return (
			<Card>
				<div class={this.titleStyle}>
					{this.title}
				</div>
				<div class={this.subTitleStyle}>
					{this.subTitle}
				</div>
				<Card.Media onClick={this.openImageMagnifier}>
					<Image link={props.data.primaryImageLink} />
				</Card.Media>
				<Card.ActionButton {...this.goProduct}>
					ПЕРЕЙТИ
				</Card.ActionButton>
			</Card >);
	}
}
//------------------------------------------------------------------------------
