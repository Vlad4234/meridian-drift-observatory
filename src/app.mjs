import NAV from './navigation.mjs';
import {initialState, reduce, price, PRICES, reservedQuote, reservedBase} from './model.mjs';
import {DONATION_ADDRESS} from './donation.mjs';

let state = initialState();
let notice = '';
const $ = (s) => document.querySelector(s);
const fmt = (n) => n.toLocaleString('ru-RU', {maximumFractionDigits: 2});
const healthNames = {READY:'Готов к mock-шагу', STALE:'Данные устарели', UNAVAILABLE:'Mock-площадка недоступна'};
const pages = Object.fromEntries(NAV);
const tag = (text, tone = '') => `<span class="tag ${tone}">${text}</span>`;
const head = (eyebrow, title, text) => `<div class="page-head"><div class="eyebrow">${eyebrow}</div><h1>${title}</h1><p>${text}</p></div>`;
const metric = (label, value, sub) => `<div class="metric"><span>${label}</span><strong>${value}</strong><small>${sub}</small></div>`;
function chart() {
  const candles = Array.from({length: 40}, (_, i) => {
    const n = ((state.tick - 39 + i) % PRICES.length + PRICES.length) % PRICES.length;
    const close = PRICES[n];
    const open = PRICES[(n + PRICES.length - 1) % PRICES.length];
    const high = Math.max(open, close) + 1, low = Math.min(open, close) - 1;
    const y = (v) => 236 - (v - 93) * 16;
    const color = close >= open ? 'var(--healthy)' : 'var(--blocked)';
    const x = 14 + i * 18;
    return `<line x1="${x}" x2="${x}" y1="${y(high)}" y2="${y(low)}" stroke="${color}"/><rect x="${x - 4}" y="${Math.min(y(open), y(close))}" width="8" height="${Math.max(2, Math.abs(y(close) - y(open)))}" fill="${color}"/>`;
  }).join('');
  return `<div class="chart-wrap"><svg class="chart" viewBox="0 0 800 280" role="img" aria-label="DEMO: синтетические свечи, цикл из 12 вымышленных цен">${[96,99,102,105].map(v=>`<line x1="0" x2="730" y1="${236-(v-93)*16}" y2="${236-(v-93)*16}" stroke="var(--border)" stroke-dasharray="3 7"/><text x="738" y="${240-(v-93)*16}" fill="#94a3b8" font-size="11">${v}</text>`).join('')}${candles}<text x="12" y="270" fill="#94a3b8" font-size="11">SYNTHETIC LOOP / DEMO DATA / NOT MARKET HISTORY</text></svg></div>`;
}
function summary() {
  return `<div class="metrics">${metric('Синтетический баланс',fmt(state.quote)+' UNIT','DEMO · условные единицы')}${metric('Mock-позиция',fmt(state.base)+' DEMO','Отмена заявок не закрывает позицию')}${metric('Открытые mock-заявки',state.orders.length,'Исполнено: '+state.fills.length)}${metric('Источник данных',state.health,'Шаг сценария '+state.tick)}</div>`;
}
function orders() {
  return `<section class="panel"><div class="section-head"><h2>Mock-заявки</h2>${tag('DEMO')}</div>${state.orders.length ? `<div class="table-wrap"><table><thead><tr><th>ID</th><th>Сторона</th><th>Количество</th><th>Лимит</th></tr></thead><tbody>${state.orders.map(o=>`<tr><td>${o.id}</td><td>${tag(o.side,o.side==='BUY'?'green':'purple')}</td><td>${o.quantity}</td><td>${fmt(o.limit)}</td></tr>`).join('')}</tbody></table></div>` : '<div class="empty">Открытых mock-заявок нет. Позиция указана отдельно.</div>'}</section>`;
}
function controls() {
  return `<section class="panel"><div class="section-head"><h2>Пульт симуляции</h2>${tag('ТОЛЬКО В ЭТОЙ ВКЛАДКЕ','purple')}</div><p>Разместите BUY, затем выполните шаг. При пересечении цены лимита mock исполнит заявку. SELL требует доступного DEMO-актива.</p><form id="order-form"><label>Сторона<select id="side"><option>BUY</option><option>SELL</option></select></label><label>Лимит, UNIT<input id="limit" type="number" min="0.01" max="100000" step="0.01" value="${price(state)-1}" required></label><label>Количество DEMO<input id="quantity" type="number" min="1" max="100" step="1" value="1" required></label><button class="primary" type="submit">Разместить mock-заявку</button></form><div class="actions"><button data-action="STEP" class="primary">Следующий mock-шаг</button><button data-action="CANCEL_ALL">Отменить mock-заявки</button><button data-action="RESET" class="quiet">Сбросить демо</button></div><div class="scenario"><label>Состояние сценария<select id="health"><option ${state.health==='READY'?'selected':''}>READY</option><option ${state.health==='STALE'?'selected':''}>STALE</option><option ${state.health==='UNAVAILABLE'?'selected':''}>UNAVAILABLE</option></select></label><p>STALE и UNAVAILABLE отклоняют действия. Ошибка не меняет баланс, заявки и позицию.</p></div></section>`;
}
function donations() {
  const lines = [
    ['EN', 'Support the project with a donation in EVM-compatible native coins or tokens, including USDT and USDC where supported. Verify the exact network and token before sending. Fiat payments are not available at this address.'],
    ['RU', 'Поддержите развитие проекта донатом в нативных монетах или токенах EVM-сетей, включая USDT и USDC там, где они поддерживаются. Перед отправкой проверьте конкретную сеть и токен. Обычные валюты на этот адрес не принимаются.'],
    ['IT', 'Sostieni il progetto con monete native o token di reti EVM, inclusi USDT e USDC dove supportati. Verifica la rete e il token esatti prima di inviare. Questo indirizzo non accetta valute fiat.'],
    ['FR', 'Soutenez le projet avec des monnaies natives ou des jetons sur les réseaux EVM, dont USDT et USDC lorsqu’ils sont pris en charge. Vérifiez le réseau et le jeton exacts avant l’envoi. Cette adresse n’accepte pas les devises classiques.'],
    ['ES', 'Apoya el proyecto con monedas nativas o tokens de redes EVM, incluidos USDT y USDC donde estén disponibles. Verifica la red y el token exactos antes de enviar. Esta dirección no acepta monedas fiduciarias.'],
    ['DE', 'Unterstütze das Projekt mit nativen Coins oder Token kompatibler EVM-Netzwerke, einschließlich USDT und USDC, sofern verfügbar. Prüfe vor dem Senden Netzwerk und Token. Diese Adresse nimmt keine Fiat-Währungen an.'],
    ['UK', 'Підтримайте проєкт нативними монетами або токенами сумісних EVM-мереж, зокрема USDT і USDC там, де вони підтримуються. Перед надсиланням перевірте мережу й токен. Звичайні валюти ця адреса не приймає.'],
    ['ZH', '欢迎通过兼容 EVM 网络的原生币或代币支持本项目，包括相应网络支持的 USDT 和 USDC。发送前请核对网络与代币。此地址不接收法定货币。'],
    ['JA', '対応する EVM ネットワークのネイティブ通貨やトークンでプロジェクトを支援できます。利用可能な場合は USDT、USDC も対象です。送信前にネットワークとトークンを確認してください。法定通貨は受け取れません。'],
    ['HI', 'संगत EVM नेटवर्क के मूल कॉइन या टोकन से परियोजना का समर्थन करें, जहाँ उपलब्ध हों वहाँ USDT और USDC सहित। भेजने से पहले नेटवर्क और टोकन जाँचें। इस पते पर फिएट मुद्रा स्वीकार नहीं होती।'],
  ];
  const destination = `<div class="donation-address"><span>PUBLIC EVM ADDRESS · ДОБРОВОЛЬНЫЙ ДОНАТ</span><code>${DONATION_ADDRESS}</code><button id="copy-address" type="button">Скопировать адрес / Copy address</button></div><p class="donation-warning">Проверьте сеть и токен в своём кошельке. Ошибочный перевод может быть необратим. Демо не подключает кошелёк и не отправляет транзакции.</p>`;
  return `<section class="panel donation"><div class="section-head"><h2>Поддержать проект / Support the project</h2>${tag('OPTIONAL','purple')}</div><div class="donation-languages">${lines.map(([lang,copy])=>`<p><strong lang="${lang.toLowerCase()}">${lang}</strong><span lang="${lang.toLowerCase()}">${copy}</span></p>`).join('')}</div>${destination}</section>`;
}
function events() {
  return state.events.length ? `<ol class="event-list">${state.events.map(e=>`<li><span class="event-tick">ШАГ ${e.tick}</span><span>${tag(e.kind)}<span class="event-message">${e.message}</span></span></li>`).join('')}</ol>` : '<div class="empty">Архив пуст. Выполните mock-действие — оно появится здесь с отметкой DEMO.</div>';
}
function home() {
  return `${head('MERIDIAN DRIFT OBSERVATORY / FIELD ARCHIVE','Карта торговых звёзд','Полевой архив вымышленных наблюдений. Исследуйте интерфейс и пройдите mock-сценарий.')}<section class="panel chart-panel"><div class="section-head"><div><h2>DEMO / UNIT</h2><span class="muted">Синтетическая последовательность · без рыночного подключения</span></div><div class="mark-price">${fmt(price(state))}<small>DEMO PRICE</small></div></div>${chart()}<div class="chart-caption">Повторяющийся сценарий из 12 цен. Не бэктест и не доказательство доходности.</div></section>${summary()}<div class="status-strip"><a href="/systems">${tag('MOCK','green')}<strong>Adaptive Grid</strong><small>Учебная модель заявок</small></a><a href="/systems">${tag('DEMO','purple')}<strong>Полевой архив</strong><small>Подтверждённые и отклонённые действия</small></a><a href="/operations">${tag(state.health,state.health==='READY'?'green':'amber')}<strong>Операции</strong><small>${healthNames[state.health]}</small></a></div>${controls()}${orders()}${donations()}`;
}
function systems() {
  return `${head('SURVEY SYSTEMS','Системы','Границы этой демонстрации видны прямо здесь.')}<div class="two-col"><section class="panel"><div class="section-head"><h2>Adaptive Grid · mock</h2>${tag('DEMO','green')}</div><p>Ограниченная учебная модель: лимитные заявки, резервирование синтетического баланса, исполнения и отмены.</p><ul class="facts"><li>Заявки исполняются только по кнопке шага.</li><li>Цена определяется фиксированным циклом.</li><li>Нет комиссий, проскальзывания и оценки доходности.</li><li>Это не производственный движок и не BrainV1.</li></ul><a class="text-link" href="/">Открыть пульт →</a></section><section class="panel"><div class="section-head"><h2>Исследовательский архив</h2>${tag('ILLUSTRATIVE','purple')}</div><p>Концепция Meridian Drift сохраняет подтверждённые и отклонённые находки. Здесь журнал содержит только действия текущей вкладки.</p><div class="empty">Реальные стратегии, отчёты, сделки и закрытые данные не включены.</div><a class="text-link" href="/events">Открыть журнал →</a></section></div><section class="panel"><h2>Без торгового подключения</h2><p>В проекте нет подписания, ключей, кошелька, авторизации торгового аккаунта, фонового исполнения и live-режима. Браузерный сетевой доступ закрыт политикой connect-src.</p></section>`;
}
function operations() {
  return `${head('MISSION CONTROL','Операции','Проверьте отказы, а не только зелёные лампочки.')}<div class="status-line">${tag(state.health,state.health==='READY'?'green':'amber')}<span>${healthNames[state.health]}</span></div>${controls()}<div class="two-col"><section class="panel"><h2>Протокол проверки</h2><ol class="facts"><li>READY → разместить BUY по 99.</li><li>Следующий шаг → mock-исполнение по 99.</li><li>Отменить заявки → позиция останется 1 DEMO.</li><li>UNAVAILABLE → шаг или заявка получит ошибку.</li><li>READY → можно продолжить; сброс очищает всё.</li></ol></section><section class="panel"><h2>Границы состояния</h2><p>Симуляция живёт только в памяти вкладки. Перезагрузка очищает её. События ограничены 80 записями, видимая история исполнений — 100.</p><p>Нет доступа к дискам хоста, сервисам, журналам, резервным копиям или рабочим данным.</p></section></div>`;
}
function account() {
  return `${head('EXPEDITION INVENTORY','Кабинет','Синтетический инвентарь. Подключение реального счёта отсутствует.')}<section class="identity"><span class="avatar">N</span><div><h2>name</h2><span class="muted">YOUR_ACCOUNT_ID · DEMO · без регистрации</span></div>${tag('SYNTHETIC','purple')}</section>${summary()}<section class="panel"><h2>Резервы mock-заявок</h2><div class="metrics compact">${metric('Свободно UNIT',fmt(state.quote-reservedQuote(state)),'Без заёмных средств')}${metric('Зарезервировано UNIT',fmt(reservedQuote(state)),'Под BUY-заявки')}${metric('Свободно DEMO',fmt(state.base-reservedBase(state)),'Под SELL-заявки')}${metric('Зарезервировано DEMO',fmt(reservedBase(state)),'Синтетический актив')}</div></section><section class="panel"><div class="section-head"><h2>История mock-исполнений</h2>${tag('НЕ РЕАЛЬНЫЕ СДЕЛКИ')}</div>${state.fills.length?`<div class="table-wrap"><table><thead><tr><th>ID / DEMO</th><th>Сторона</th><th>Объём</th><th>Цена UNIT</th><th>Шаг</th></tr></thead><tbody>${state.fills.map(f=>`<tr><td>${f.id}</td><td>${f.side}</td><td>${f.quantity}</td><td>${fmt(f.executionPrice)}</td><td>${f.tick}</td></tr>`).join('')}</tbody></table></div>`:'<div class="empty">Mock-исполнений пока нет.</div>'}</section><section class="panel"><h2>Результаты</h2><p>Доходность не рассчитывается. Этот сценарий не оценивает стратегию и не подтверждает экономическую работоспособность бота.</p></section>`;
}
function route() {
  const path=location.pathname;
  const label=pages[path];
  $('#page-title').textContent=label||'Страница не найдена';
  $('#navigation').innerHTML=NAV.map(([url,text])=>`<a href="${url}" ${url===path?'class="active" aria-current="page"':''}><span class="nav-orbit" aria-hidden="true">${url==='/'?'◈':'○'}</span>${text}</a>`).join('');
  $('#page').innerHTML=path==='/'?home():path==='/systems'?systems():path==='/operations'?operations():path==='/events'?head('EXPEDITION LOG','События','Каждая запись — синтетическое действие текущей вкладки.')+`<section class="panel">${events()}</section>`:path==='/account'?account():head('404','Страница не найдена','Такого раздела в демо нет.')+'<a href="/">Вернуться на главную</a>';
  $('#feedback').hidden=!notice;
  $('#feedback').textContent=notice;
  $('#order-form')?.addEventListener('submit',(e)=>{e.preventDefault(); dispatch({type:'PLACE',side:$('#side').value,limit:Number($('#limit').value),quantity:Number($('#quantity').value)});});
  $('#health')?.addEventListener('change',(e)=>dispatch({type:'HEALTH',value:e.target.value}));
  document.querySelectorAll('[data-action]').forEach(b=>b.addEventListener('click',()=>dispatch({type:b.dataset.action})));
  $('#copy-address')?.addEventListener('click',async()=>{
    try { await navigator.clipboard.writeText(DONATION_ADDRESS); notice='Публичный EVM-адрес скопирован. Проверьте сеть и токен перед отправкой.'; $('#feedback').classList.remove('error'); }
    catch { notice='Не удалось скопировать адрес. Выделите его и скопируйте вручную.'; $('#feedback').classList.add('error'); }
    $('#feedback').hidden=false; $('#feedback').textContent=notice;
  });
}
function dispatch(action) {
  try {
    state=reduce(state,action);
    notice=action.type==='RESET'?'DEMO сброшено.':action.type==='PLACE'?'DEMO: mock-заявка размещена.':action.type==='STEP'?'DEMO: mock-шаг выполнен.':action.type==='CANCEL_ALL'?'DEMO: mock-заявки отменены. Позиция не закрывалась.':`DEMO: состояние ${state.health}.`;
    $('#feedback').classList.remove('error');
  } catch (e) { notice=e.message; $('#feedback').classList.add('error'); }
  route();
}
let previousFocus;
function menu(open) {
  if(open) previousFocus=document.activeElement;
  $('#sidebar').classList.toggle('open',open);
  $('#scrim').hidden=!open;
  $('#open-menu').setAttribute('aria-expanded',String(open));
  document.body.classList.toggle('menu-open',open);
  $('#sidebar').inert=window.innerWidth<768&&!open;
  if(window.innerWidth<768) {
    $('.workspace').inert=open;
    if(open) $('#close-menu').focus(); else previousFocus?.focus();
  }
}
$('#open-menu').onclick=()=>menu(true);
$('#close-menu').onclick=()=>menu(false);
$('#scrim').onclick=()=>menu(false);
window.addEventListener('resize',()=>menu(false));
document.addEventListener('keydown',(e)=>{
  if(e.key==='Escape')menu(false);
  if(e.key==='Tab'&&$('#sidebar').classList.contains('open')) {
    const links=[...$('#sidebar').querySelectorAll('a,button')];
    const first=links[0],last=links.at(-1);
    if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
    else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
  }
});
document.addEventListener('click',(e)=>{
  const a=e.target.closest('a');
  if(!a||e.ctrlKey||e.metaKey||e.shiftKey||e.altKey)return;
  if(a.origin===location.origin) {e.preventDefault();history.pushState(null,'',a.pathname);notice='';menu(false);route();window.scrollTo(0,0);$('main').setAttribute('tabindex','-1');$('main').focus();}
});
window.addEventListener('popstate',()=>{notice='';menu(false);route();});
menu(false);
route();
