/**
 * XPENG Bulgaria — Test drive lead routing
 * Google Apps Script (Code.gs)
 *
 * A Webflow "form_submission" webhook posts every Test Drive Form
 * submission here. The script emails the lead to the dealership chosen
 * in the form and copies the main inbox. Webflow keeps storing the
 * submission and sending its own notification — this only adds routing.
 *
 * Setup:
 * 1. https://script.google.com → New Project → paste this file into Code.gs
 * 2. Run testRouting() once from the editor and accept the Gmail permission
 * 3. Deploy → New deployment → Web app
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 4. Give the deployment URL to Georgi — it becomes the webhook URL in Webflow
 *    (trigger: form_submission, filter: "Test Drive Form")
 *
 * Mail is sent from the Google account that owns this script, shown as
 * SENDER_NAME. Reply-To is the customer, so the dealer answers them directly.
 */

var SITE_ID = '6a041f81e8910a5a1669594c';
var FORM_NAME = 'Test Drive Form';
var DEALER_FIELD = 'Дилърство';

var MAIN_INBOX = 'marketing@xpengauto.bg';
var SENDER_NAME = 'XPENG Bulgaria';

/* Keys must match the option values of the "Дилърство" select in Webflow
   and the store names in FIND_US_STORES (webflow-js/src/main.js). */
var DEALERS = {
  'XPENG София': 'boyko.shatev@gauto.bg',
  'XPENG Пловдив': 'chavdar.semerdjiev@gauto.bg'
};

/* Order of the rows in the email; anything else the form sends is appended. */
var FIELD_ORDER = ['Choose a model', 'Име', 'Фамилия', 'Имейл', 'Телефон', DEALER_FIELD, 'Marketing'];
var FIELD_LABELS = { 'Choose a model': 'Модел', 'Marketing': 'Съгласие за маркетинг' };

function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents);
    if (body.triggerType !== 'form_submission' || !body.payload) {
      return json({ ok: false, error: 'not_a_form_submission' });
    }
    return json(routeSubmission(body.payload));
  } catch (err) {
    return json({ ok: false, error: String(err) });
  }
}

function doGet() {
  return json({ status: 'ok', service: 'xpeng-test-drive-routing' });
}

function routeSubmission(payload) {
  if (payload.siteId !== SITE_ID) return { ok: false, error: 'wrong_site' };
  if (payload.name !== FORM_NAME) return { ok: true, skipped: 'other_form' };

  /* Webflow retries a webhook it considers failed; one lead must stay one email. */
  var cache = CacheService.getScriptCache();
  var key = 'lead_' + (payload.id || payload.submittedAt);
  if (cache.get(key)) return { ok: true, skipped: 'duplicate' };
  cache.put(key, '1', 21600);

  var fields = payload.data || {};
  var dealer = String(fields[DEALER_FIELD] || '').trim();
  var dealerEmail = DEALERS[dealer];
  var model = String(fields['Choose a model'] || '').trim();
  var customerEmail = String(fields['Имейл'] || '').trim();

  var mail = {
    to: dealerEmail || MAIN_INBOX,
    subject: 'Заявка за тест драйв' + (model ? ' — XPENG ' + model : '') + (dealer ? ' — ' + dealer : ''),
    htmlBody: leadHtml(fields, dealer, !dealerEmail),
    name: SENDER_NAME
  };
  if (dealerEmail) mail.cc = MAIN_INBOX;
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) mail.replyTo = customerEmail;

  MailApp.sendEmail(mail);
  return { ok: true, to: mail.to };
}

function leadHtml(fields, dealer, unrouted) {
  var keys = FIELD_ORDER.filter(function(k) { return fields[k] !== undefined; });
  Object.keys(fields).forEach(function(k) {
    if (keys.indexOf(k) === -1 && k.indexOf('cf-turnstile') === -1) keys.push(k);
  });

  var rows = keys.map(function(k) {
    return '<tr>' +
      '<td style="padding:8px 16px 8px 0;font-size:14px;color:#666666;vertical-align:top;white-space:nowrap;">' + esc(FIELD_LABELS[k] || k) + '</td>' +
      '<td style="padding:8px 0;font-size:14px;color:#1A1A1A;">' + esc(fields[k]) + '</td>' +
      '</tr>';
  }).join('');

  var note = unrouted
    ? '<p style="margin:0 0 20px;font-size:14px;line-height:1.6;color:#B00020;">Заявката е без разпознато дилърство' +
      (dealer ? ' („' + esc(dealer) + '“)' : '') + ' и е изпратена само до основната поща.</p>'
    : '';

  return '<div style="font-family:-apple-system,BlinkMacSystemFont,\'Segoe UI\',Roboto,Helvetica,Arial,sans-serif;max-width:600px;">' +
    '<h1 style="margin:0 0 16px;font-size:20px;font-weight:600;color:#1A1A1A;">Нова заявка за тест драйв</h1>' +
    note +
    '<table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">' + rows + '</table>' +
    '<p style="margin:24px 0 0;font-size:12px;line-height:1.5;color:#999999;">Изпратено автоматично от www.xpengauto.bg. Отговорът на това писмо отива директно до клиента.</p>' +
    '</div>';
}

function esc(value) {
  return String(value === null || value === undefined ? '' : value)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/* ---------- test helper ---------- */

/* Sends ONE real email to the Sofia dealer + main inbox. Change DEALERS / MAIN_INBOX
   to your own address first if you only want to check the layout. */
function testRouting() {
  var result = routeSubmission({
    id: 'test-' + new Date().getTime(),
    siteId: SITE_ID,
    name: FORM_NAME,
    data: {
      'Choose a model': 'G9',
      'Име': 'Тест',
      'Фамилия': 'Тестов',
      'Имейл': 'test@example.com',
      'Телефон': '0888 000 000',
      'Дилърство': 'XPENG София',
      'Marketing': 'true'
    }
  });
  Logger.log(JSON.stringify(result));
}
