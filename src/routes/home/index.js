//------------------------------------------------------------------------------
import Component from '../../components/component';
import Card from 'preact-material-components/Card';
import 'preact-material-components/Card/style.css';
import style from './style';
import { headerTitleStorePath } from '../../const';
import disp from '../../lib/store';
import { LogIn, LogOut, UserPlus } from 'preact-feather';
import FaBeer from 'react-icons/fa/beer';
//------------------------------------------------------------------------------
////////////////////////////////////////////////////////////////////////////////
//------------------------------------------------------------------------------
export default class Home extends Component {
	storePaths = new Map()

	storeDisp(store) {
		return store.setIn(headerTitleStorePath, '');
	}

	mount() {
		return disp(store => store.setIn(headerTitleStorePath, ''));
	}
	
	style = [style.home, 'mdc-toolbar-fixed-adjust'].join(' ')

	render() {
		return (
			<div class={this.style}>
				<h1>Home route</h1>
				<Card>
					<Card.Primary>
						<Card.Title>Home card</Card.Title>
						<Card.Subtitle>Welcome to home route</Card.Subtitle>
					</Card.Primary>
					<Card.SupportingText>
						Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.
					</Card.SupportingText>
					<Card.Actions>
						<Card.Action>OKAY</Card.Action>
					</Card.Actions>
				</Card>
				<FaBeer size={24} />
				<LogIn style={{ verticalAlign: 'middle' }} color="black" />
				<LogOut style={{ verticalAlign: 'middle' }} color="black" />
				<UserPlus style={{ verticalAlign: 'middle' }} color="black" />
			</div>
		);
	}
}
//------------------------------------------------------------------------------
