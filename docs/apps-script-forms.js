/**
 * XPENG Bulgaria — emails for Webflow forms
 * Google Apps Script (Code.gs), project "XPENG Test Drive Routing" in eyas.team@gmail.com
 *
 * Webflow "form_submission" webhooks post submissions here:
 * - Test Drive Form → the lead goes to the dealership chosen in the form.
 *   Webflow keeps sending its own notification to the main inbox, so the main
 *   inbox is not copied; it only gets a warning when a lead arrives without a
 *   recognised dealership.
 * - Subscribe / newsletter forms → the subscriber gets a confirmation email.
 *
 * Mail goes out as SENDER through the Gmail "Send mail as" alias of the account
 * that owns this script (SMTP mail.xpengauto.bg:465), so no Gmail address shows.
 * appsscript.json: "oauthScopes": ["https://mail.google.com/"].
 *
 * Deploy: Deploy → Manage deployments → edit → Version: New version. Editing the
 * existing deployment keeps the /exec URL the Webflow webhooks point to. After a
 * scope change, run doGet once from the editor and accept the permissions first.
 */

var SITE_ID = '6a041f81e8910a5a1669594c';
var SENDER = 'noreply@xpengauto.bg';
var SENDER_NAME = 'XPENG Bulgaria';
var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

var TEST_DRIVE_FORM = 'Test Drive Form';
/* "Subscribe form" is the modal and footer form; the /newsletter page form arrives as "Email Form". */
var NEWSLETTER_FORMS = ['Subscribe form', 'Email Form'];

var DEALER_FIELD = 'Дилърство';
var LEGACY_CITY_FIELD = 'Град';
var MAIN_INBOX = 'marketing@xpengauto.bg';

/* Keys must match the option values of the "Дилърство" select in Webflow
   and the store names in FIND_US_STORES (webflow-js/src/main.js). */
var DEALERS = {
  'XPENG София': 'boyko.shatev@gauto.bg',
  'XPENG Пловдив': 'chavdar.semerdjiev@gauto.bg'
};

/* Order of the rows in the lead email; anything else the form sends is appended. */
var FIELD_ORDER = ['Choose a model', 'Име', 'Фамилия', 'Имейл', 'Телефон', DEALER_FIELD, 'Marketing'];
var FIELD_LABELS = { 'Choose a model': 'Модел', 'Marketing': 'Съгласие за маркетинг' };

var SUBSCRIBE_SUBJECT = 'Благодарим за абонамента! | XPENG Bulgaria';

function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents);
    if (body.triggerType !== 'form_submission' || !body.payload) {
      return json({ ok: false, error: 'not_a_form_submission' });
    }
    return json(handleSubmission(body.payload));
  } catch (err) {
    return json({ ok: false, error: String(err) });
  }
}

function doGet() {
  return json({ status: 'ok', service: 'xpeng-forms' });
}

function handleSubmission(payload) {
  if (payload.siteId !== SITE_ID) return { ok: false, error: 'wrong_site' };
  var data = payload.data || {};
  if (payload.name === TEST_DRIVE_FORM) return routeTestDrive(payload, data);
  if (NEWSLETTER_FORMS.indexOf(payload.name) !== -1) return confirmSubscription(payload, data);
  return { ok: true, skipped: 'other_form' };
}

/* Webflow retries a webhook it considers failed; one submission must stay one email. */
function firstDelivery(payload) {
  var cache = CacheService.getScriptCache();
  var key = 'sub_' + (payload.id || payload.submittedAt);
  if (cache.get(key)) return false;
  cache.put(key, '1', 21600);
  return true;
}

/* ---------- test drive ---------- */

function routeTestDrive(payload, data) {
  /* The old form (free-text city, no dealer select) has no dealer to route to;
     its leads already reach the main inbox through Webflow's own notification. */
  if (data[DEALER_FIELD] === undefined && data[LEGACY_CITY_FIELD] !== undefined) {
    return { ok: true, skipped: 'legacy_form' };
  }
  if (!firstDelivery(payload)) return { ok: true, skipped: 'duplicate' };

  var dealer = String(data[DEALER_FIELD] || '').trim();
  var dealerEmail = DEALERS[dealer];
  var model = String(data['Choose a model'] || '').trim();
  var customerEmail = String(data['Имейл'] || '').trim();

  var mail = {
    to: dealerEmail || MAIN_INBOX,
    subject: 'Заявка за тест драйв' + (model ? ' — XPENG ' + model : '') + (dealer ? ' — ' + dealer : ''),
    htmlBody: leadHtml(data, dealer, !dealerEmail)
  };
  if (EMAIL_RE.test(customerEmail)) mail.replyTo = customerEmail;

  send(mail);
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

/* ---------- newsletter ---------- */

function confirmSubscription(payload, data) {
  var email = findEmail(data);
  if (!email) return { ok: false, error: 'invalid_email' };
  if (!firstDelivery(payload)) return { ok: true, skipped: 'duplicate' };

  send({ to: email, subject: SUBSCRIBE_SUBJECT, htmlBody: confirmationHtml() });
  return { ok: true, to: email };
}

/* The email field is "Имейл" on every form today; any other email-looking value is the fallback. */
function findEmail(data) {
  var values = [data['Имейл']].concat(Object.keys(data).map(function(k) { return data[k]; }));
  for (var i = 0; i < values.length; i++) {
    var value = String(values[i] === undefined || values[i] === null ? '' : values[i]).trim().toLowerCase();
    if (EMAIL_RE.test(value)) return value;
  }
  return '';
}

function confirmationHtml() {
  return [
    '<!DOCTYPE html>',
    '<html lang="bg">',
    '<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>',
    '<body style="margin:0;padding:0;background:#f4f4f4;font-family:-apple-system,BlinkMacSystemFont,\'Segoe UI\',Roboto,Helvetica,Arial,sans-serif;">',

    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;">',
    '<tr><td align="center" style="padding:40px 16px;">',

    '<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:8px;overflow:hidden;">',

    // header
    '<tr><td style="background:#0A0A0A;padding:32px 40px;text-align:center;">',
    '<span style="font-size:28px;font-weight:700;letter-spacing:4px;color:#ffffff;">XPENG</span>',
    '</td></tr>',

    // body
    '<tr><td style="padding:40px 40px 32px;">',
    '<h1 style="margin:0 0 16px;font-size:22px;font-weight:600;color:#1A1A1A;line-height:1.3;">',
    'Благодарим за абонамента!',
    '</h1>',
    '<p style="margin:0 0 28px;font-size:15px;line-height:1.7;color:#555555;">',
    'Записахме ви за нашия бюлетин. Ще ви информираме за новости, събития и специални предложения от XPENG Bulgaria.',
    '</p>',
    '<table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="border-radius:4px;background:#0A0A0A;">',
    '<a href="https://www.xpengauto.bg/" target="_blank" style="display:inline-block;padding:14px 32px;font-size:14px;font-weight:500;color:#ffffff;text-decoration:none;letter-spacing:0.5px;">',
    'Към сайта &rarr;',
    '</a>',
    '</td></tr></table>',
    '</td></tr>',

    // footer
    '<tr><td style="padding:24px 40px;border-top:1px solid #eeeeee;text-align:center;">',
    '<p style="margin:0 0 8px;font-size:12px;color:#999999;line-height:1.5;">',
    'XPENG Bulgaria &middot; Bulgarian Automotive Industry EAD',
    '</p>',
    '<p style="margin:0;font-size:12px;color:#999999;line-height:1.5;">',
    '<a href="https://www.xpengauto.bg/privacy-policy" style="color:#999999;text-decoration:underline;">Политика за поверителност</a>',
    '</p>',
    '</td></tr>',

    '</table>',

    '</td></tr>',
    '</table>',

    '</body></html>'
  ].join('\n');
}

/* ---------- shared ---------- */

function send(mail) {
  var options = { from: SENDER, name: SENDER_NAME, htmlBody: mail.htmlBody };
  if (mail.replyTo) options.replyTo = mail.replyTo;
  GmailApp.sendEmail(mail.to, mail.subject, plainText(mail.htmlBody), options);
}

/* Fallback body for mail clients that do not render HTML. */
function plainText(html) {
  return String(html)
    .replace(/<(br|\/p|\/tr|\/h1)[^>]*>/gi, '\n')
    .replace(/<\/td>/gi, '  ')
    .replace(/<[^>]+>/g, '')
    .replace(/&rarr;/g, '→').replace(/&middot;/g, '·')
    .replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')
    .replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n')
    .trim();
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

/* Sends ONE real email to the Sofia dealer. Change DEALERS to your own address
   first if you only want to check the layout. */
function testRouting() {
  var result = handleSubmission({
    id: 'test-' + new Date().getTime(),
    siteId: SITE_ID,
    name: TEST_DRIVE_FORM,
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
