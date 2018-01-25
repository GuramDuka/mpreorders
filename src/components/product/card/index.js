//------------------------------------------------------------------------------
import MuiCard from 'preact-material-components/Card';
import 'preact-material-components/Card/style.css';
import Component from '../../component';
import style from './style';
import { nullLink } from '../../../const';
import { icoUrl } from '../../../backend/backend';
//------------------------------------------------------------------------------
////////////////////////////////////////////////////////////////////////////////
//------------------------------------------------------------------------------
export default class Card extends Component {
	imgHeight = ~~style.imgHeight.substr(0, style.imgHeight.length - 2)

	ico({ primaryImageLink }) {
		if (primaryImageLink && primaryImageLink !== nullLink) {
			//const w = ~~styles.icoWidth.substring(0, styles.icoWidth.length - 2);
			//const h = ~~styles.icoHeight.substring(0, styles.icoHeight.length - 2);
			// const r = icoR(row.ОсновноеИзображение, w, h, 16);
			// return <Image url={icoUrl(row.ОсновноеИзображение, w, h, 16)} r={r} />;
			// 	return <img alt="BROKEN"
			// 	  src={icoUrl(row.primaryImageLink, undefined, h, 16)}
			// 	  className={styles.regular} />;
			//   }

			//   return <img alt="" src={nopic} className={styles.regular} />;
			return (
				<MuiCard.Media className={style.media} style={{
					backgroundImage: 'url(' + icoUrl(primaryImageLink, undefined, this.imgHeight, 16) + ')'
				}}
				/>);
		}
		return undefined;
	}

	render({ data }) {
		return (
			<MuiCard className={style.card}>
				{this.ico(data)}
				<MuiCard.Primary>
					<MuiCard.Title>{data.code}</MuiCard.Title>
					<MuiCard.Subtitle>{data.name}</MuiCard.Subtitle>
				</MuiCard.Primary>
				<MuiCard.SupportingText>
					{data.article}
					{data.manufacturer}
				</MuiCard.SupportingText>
				<MuiCard.Actions>
					<MuiCard.Action>OKAY</MuiCard.Action>
				</MuiCard.Actions>
			</MuiCard>);
	}
}
//------------------------------------------------------------------------------
