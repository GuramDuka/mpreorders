//------------------------------------------------------------------------------
import MuiCard from 'preact-material-components/Card';
import 'preact-material-components/Card/style.css';
import Component from '../../component';
import style from './style';
import { nullLink } from '../../../const';
import { icoUrl } from '../../../backend/backend';
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
		//const w = ~~styles.icoWidth.substring(0, styles.icoWidth.length - 2);
		//const h = ~~styles.icoHeight.substring(0, styles.icoHeight.length - 2);
		// const r = icoR(row.ОсновноеИзображение, w, h, 16);
		// return <Image url={icoUrl(row.ОсновноеИзображение, w, h, 16)} r={r} />;
		// 	return <img alt="BROKEN"
		// 	  src={icoUrl(row.primaryImageLink, undefined, h, 16)}
		// 	  className={styles.regular} />;
		//   }

		//   return <img alt="" src={nopic} className={styles.regular} />;
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
