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
export default class Card extends Component {
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
		const name = data.name.replace(r, ', ');
		const article = data.article.replace(r, ', ');
		const manufacturer = data.manufacturer.replace(r, ', ');
		const title = `[${data.code}] ${name}`;
		const subTitle = [];
		[
			article,
			manufacturer,
			data.remainder + (data.reserve ? ' (' + data.reserve + ')' : ''),
			data.price + '₽'
		].forEach(v => v.length !== 0 && subTitle.push(v));

		return (
			<MuiCard className={[style.card, ...classes].join(' ')}>
				{this.ico(data)}
				<MuiCard.Primary>
					<MuiCard.Title>
						{title}
					</MuiCard.Title>
					<MuiCard.Subtitle>
						{subTitle.join(', ')}
					</MuiCard.Subtitle>
				</MuiCard.Primary>
				<MuiCard.Actions />
			</MuiCard>);
	}
}
//------------------------------------------------------------------------------
