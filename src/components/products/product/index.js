//------------------------------------------------------------------------------
import MuiCard from 'preact-material-components/Card';
import 'preact-material-components/Card/style.css';
import Component from '../../component';
import style from './style';
import { nullLink } from '../../../const';
import { icoUrl } from '../../../backend';
import nopic from '../../../assets/nopic.svg';
//------------------------------------------------------------------------------
////////////////////////////////////////////////////////////////////////////////
//------------------------------------------------------------------------------
export default class Product extends Component {
	imgHeight = ~~style.imgHeight.substr(0, style.imgHeight.length - 2)

	ico({ primaryImageLink }) {
		const url = primaryImageLink && primaryImageLink !== nullLink
			? icoUrl(primaryImageLink, undefined, this.imgHeight, 16)
			: nopic;
		const s = { backgroundImage: 'url(' + url + ')' };
		return <MuiCard.Media className={style.media} style={s} />;
	}

	render({ classes, data }) {
		// regex replace comma without space after
		const r = /(,(?=\S)|:)/g;
		const title = `[${data.code}] ${data.name.replace(r, ', ')}`;
		let subTitle = '';

		for (const v of [
			data.article.replace(r, ', '),
			data.manufacturer.replace(r, ', '),
			data.remainder !== 0 || data.reserve !== 0 ? data.remainder + (data.reserve ? ' (' + data.reserve + ')' : '') : '',
			data.price + '₽'
		])
			if (v.length !== 0)
				subTitle += `, ${v}`;

		return (
			<MuiCard className={[style.card, ...classes].join(' ')}>
				<div>
					<h4 class="mdc-typography--title">{title}</h4>
					<div class="mdc-typography--caption">{subTitle}</div>
				</div>
				{this.ico(data)}
				{/*<MuiCard.Primary>
					<MuiCard.Title>
						{title}
					</MuiCard.Title>
					<MuiCard.Subtitle>
						{subTitle}
					</MuiCard.Subtitle>
				</MuiCard.Primary>*/}
				<MuiCard.ActionButton>OKAY</MuiCard.ActionButton>
			</MuiCard>);
	}
}
//------------------------------------------------------------------------------
