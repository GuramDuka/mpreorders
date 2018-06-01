//------------------------------------------------------------------------------
import { Component } from 'preact';
import Card from 'preact-material-components/Card';
import 'preact-material-components/Card/style.css';
import 'preact-material-components/Button/style.css';
import Image from '../../Image';
import { plinkRoute } from '../../../lib/util';
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

	// regex replace comma without space after
	static cr = /(,(?=\S)|:)/g
	static sr = /(\s{2})/g

	mount(props) {
		let {
			link,
			name,
			article,
			manufacturer,
			remainder,
			reserve,
			price
		} = props.data;

		this.goProduct = this.linkTo('/product/' + link);

		const { cr, sr } = ProductCard;

		name = name ? name.replace(cr, ', ').replace(sr, ' ').trim() : '';
		article = article ? article.replace(cr, ', ').trim() : '';
		manufacturer = manufacturer ? manufacturer.replace(cr, ', ').trim() : '';
		remainder = Number.isFinite(remainder) && remainder !== 0
			? remainder.toString() : '';
		remainder += Number.isFinite(reserve) && reserve !== 0
			? ' (' + reserve + ')' : '';
		price = price ? price + '₽' : '';

		this.title = name;
		let subTitle = '';

		for (const v of [
			article,
			manufacturer,
			remainder.trim(),
			price
		])
			if (v.length !== 0)
				subTitle += `, ${v}`;

		this.subTitle = subTitle.substr(2);

		this.titleStyle = [
			'mdc-typography--title',
			style.title,
			props.mini ? style.mini : ''
		].join(' ').trim();
		
		this.subTitleStyle = [
			'mdc-typography--caption',
			style.subTitle,
			props.mini ? style.mini : ''
		].join(' ').trim();
	}

	linkTo = path => ({ href: path, onClick: plinkRoute(path) })

	showImageMagnifier = e => {
		const { showImageMagnifier, data } = this.props;

		if (showImageMagnifier)
			showImageMagnifier(e, data.primaryImageLink);
	}

	render(props, state) {
		return (
			<Card>
				<div class={this.titleStyle}>
					{this.title}
				</div>
				<div class={this.subTitleStyle}>
					{this.subTitle}
				</div>
				<Card.Media onClick={this.showImageMagnifier}>
					<Image link={props.data.primaryImageLink} />
				</Card.Media>
				<Card.ActionButton {...this.goProduct}>
					ПЕРЕЙТИ
				</Card.ActionButton>
			</Card >);
	}
}
//------------------------------------------------------------------------------
