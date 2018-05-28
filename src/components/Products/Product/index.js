//------------------------------------------------------------------------------
import DOMPurify from 'dompurify';
import ImageList from 'preact-material-components/ImageList';
import 'preact-material-components/ImageList/style.css';
import List from 'preact-material-components/List';
import 'preact-material-components/List/style.css';
import { Component as PreactComponent } from 'preact';
import Component from '../../Component';
import VerticalActionBar from '../../VerticalActionBar';
import disp from '../../../lib/store';
import { headerSearchStorePath } from '../../../const';
import { prevent, plinkRoute } from '../../../lib/util';
import strftime from '../../../lib/strftime';
import { imgUrl } from '../../../backend';
import loader from './loader';
import style from './style.scss';
//------------------------------------------------------------------------------
function propRender(data) {
	const a = [], l = data.rows.length;

	for (let i = 0; i < l; i++) {
		const row = data.rows[i];

		if (row.index !== 0)
			continue;

		let s = row.display;

		for (const r of data.rows)
			if (r.propertyLink === row.propertyLink && r.index !== 0)
				s += ', ' + r.display;

		a.push(<span><strong>{row.propertyDisplay}</strong>:&nbsp;{s}</span>);

		if (i + 1 < l)
			a.push(<strong>; </strong>);
	}

	return a;
}
//------------------------------------------------------------------------------
function descRender(data) {
	const a = [];

	if (data.fullName)
		a.push(<strong>{data.fullName}</strong>);

	if (data.description)
		if (data.descriptionInHtml)
			a.push(
				<div
					// eslint-disable-next-line
					dangerouslySetInnerHTML={{
						__html: DOMPurify.sanitize(data.description)
					}}
				/>);
		else
			a.push(<span>{data.description}</span>);

	return a;
}
//------------------------------------------------------------------------------
function remsRender(data) {
	return (
		<table class={style.lightBorderTable}>
			<tr>
				<th>Склад</th>
				<th>Остаток</th>
			</tr>
			<tbody>
				{data.rows.map(r => (
					<tr>
						<td>{r.storeDisplay}</td>
						<td align="right">{r.remainder}</td>
					</tr>))}
			</tbody>
		</table>);
}
//------------------------------------------------------------------------------
// Intl not work correctly under android
//const dateFormatter = date => {
//	let f = new Intl.DateTimeFormat('ru-RU', {
//		year	: 'numeric',
//		month	: '2-digit',
//		day		: '2-digit',
//		hour	: '2-digit',
//		minute	: '2-digit',
//		second	: '2-digit',
//		hour12	: false
//	});
//	return f.format(date);
//};

function dateFormatter(date) {
	return strftime('%d.%m.%Y %H:%M:%S', date);
}
//------------------------------------------------------------------------------
function bprsRender(data) {
	return (
		<table class={style.lightBorderTable}>
			<thead />
			{/*<caption>Таблица размеров обуви</caption>*/}
			<tr>
				<th>Дата</th>
				<th>Документ</th>
				<th>Цена</th>
			</tr>
			<tbody>
				{data.rows.map(r => (
					<tr>
						<td>{dateFormatter(r.period)}</td>
						<td>{r.display}</td>
						<td align="right">{r.price}</td>
					</tr>))}
			</tbody>
			<tfoot />
		</table>);
}
//------------------------------------------------------------------------------
function sprsRender(data) {
	return (
		<table class={style.lightBorderTable}>
			<tr>
				<th>Поставщик</th>
				<th>Цена</th>
				<th>Дата</th>
			</tr>
			<tbody>
				{data.rows.map(r => (
					<tr>
						<td>{r.display}</td>
						<td align="right">{r.price}</td>
						<td>{dateFormatter(r.period)}</td>
					</tr>))}
			</tbody>
		</table>);
}
//------------------------------------------------------------------------------
function lprsRender(data) {
	return (
		<table class={style.lightBorderTable}>
			<tr>
				<th>Дата</th>
				<th>Склад</th>
				<th>Цена</th>
			</tr>
			<tbody>
				{data.rows.map(r => (
					<tr>
						<td>{dateFormatter(r.period)}</td>
						<td>{r.display}</td>
						<td align="right">{r.price}</td>
					</tr>))}
			</tbody>
		</table>);
}
//------------------------------------------------------------------------------
////////////////////////////////////////////////////////////////////////////////
//------------------------------------------------------------------------------
class ExpandableItem extends PreactComponent {
	onExpand = () => {
		if (this.state.isExpanded)
			loader.call(this);
	}

	onClick = e => {
		this.setState({ isExpanded: !this.state.isExpanded }, this.onExpand);
		return prevent(e);
	}

	render({ title, meta, render }, { data, isExpanded }) {
		return (
			<div>
				<List className={style.p0} onClick={this.onClick}>
					<List.Divider />
					<List.Item>
						<List.ItemGraphic>
							{`expand_${isExpanded ? 'less' : 'more'}`}
						</List.ItemGraphic>
						{title}
						<List.ItemMeta>
							{meta}
						</List.ItemMeta>
					</List.Item>
					{isExpanded ? <List.Divider /> : undefined}
					{isExpanded && data ? render(data) : undefined}
					<List.Divider />
				</List>
			</div>);
	}
}
//------------------------------------------------------------------------------
////////////////////////////////////////////////////////////////////////////////
//------------------------------------------------------------------------------
export default class Product extends Component {
	storePaths = new Map([
		[
			state => this.setState(state),
			{ path: 'auth', alias: 'auth' }
		]
	])

	mount() {
		disp(
			store => store.deleteIn(headerSearchStorePath),
			() => loader.call(this)
		);
	}

	linkTo = path => ({ href: path, onClick: plinkRoute(path) })

	favoriteIcons = ['favorite_border', 'favorite']
	inCartIcons = ['add_shopping_cart', 'remove_shopping_cart']

	render(props, { auth, data, isFavorite, isInCart }) {
		if (data === undefined)
			return undefined;

		let {
			link,
			code,
			name,
			article,
			manufacturer,
			remainder,
			reserve,
			price,
			images
		} = data.rows[0];

		// regex replace comma without space after
		const cr = /(,(?=\S)|:)/g;
		const sr = /(\s{2})/g;

		name = name.replace(cr, ', ').replace(sr, ' ').trim();
		article = article.replace(cr, ', ').trim();
		manufacturer = manufacturer.replace(cr, ', ').trim();
		remainder = remainder !== 0 || reserve !== 0 ? remainder + (reserve ? ' (' + reserve + ')' : '') : '';
		price = price + '₽';

		let display = `[${code}] ${name}`;

		if (article)
			display += `, артикул: ${article}`;

		if (manufacturer)
			display += `, производитель: ${manufacturer}`;

		if (remainder)
			display += `, остаток: ${remainder}`;

		if (price)
			display += `, цена: ${price}`;

		const items = [
			<div>
				{display}
			</div>,
			<div style={{ overflowX: 'scroll', overflowY: 'auto' }}>{images.map(v => (
				<div class={style.media}
					style={{ backgroundImage: `url(${imgUrl(v)})` }}
				/>))}
			</div>,
			<ExpandableItem link={link}
				f="prop" render={propRender}
				title="Свойства"
				meta="list"
			/>,
			<ExpandableItem link={link}
				f="desc" render={descRender}
				title="Описание"
				meta="info"
			/>
		];

		if (auth && auth.authorized && auth.employee)
			items.push(
				<ExpandableItem auth employee link={link}
					f="rems" render={remsRender}
					title="Остатки"
					meta="reorder"
				/>,
				<ExpandableItem auth employee link={link}
					f="bprs" render={bprsRender}
					title="Базовые цены"
					meta="monetization_on"
				/>,
				<ExpandableItem auth employee link={link}
					f="sprs" render={sprsRender}
					title="Цены поставщиков"
					meta="multiline_chart"
				/>,
				<ExpandableItem auth employee link={link}
					f="lprs" render={lprsRender}
					title="Цены продажи"
					meta="score"
				/>
			);

		return (
			<div class={style.product}>
				{items}
				<VerticalActionBar>
					<VerticalActionBar.Fab>
						{this.favoriteIcons[isFavorite ? 1 : 0]}
					</VerticalActionBar.Fab>
					<VerticalActionBar.Fab>
						{this.inCartIcons[isInCart ? 1 : 0]}
					</VerticalActionBar.Fab>
				</VerticalActionBar>
			</div>
		);
	}
}
		//------------------------------------------------------------------------------
