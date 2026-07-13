/**
 * XPENG Bulgaria — Newsletter Confirmation Email
 * Google Apps Script (Code.gs)
 *
 * Setup:
 * 1. Go to https://script.google.com → New Project
 * 2. Paste this entire file into Code.gs
 * 3. Deploy → New deployment → Web app
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 4. Copy the deployment URL → paste into NEWSLETTER_ENDPOINT in main.js
 *
 * Gmail "Send mail as" alias (required for branded sender):
 * 1. Open Gmail → Settings → Accounts → "Send mail as" → Add another email
 * 2. Name: XPENG Bulgaria | Email: noreply@xpengauto.bg
 * 3. SMTP: mail.xpengauto.bg | Port: 465 | SSL
 * 4. Username: noreply@xpengauto.bg | Password: (from team)
 * 5. Gmail sends a verification code to noreply@xpengauto.bg
 * 6. Open webmail (cPanel → Roundcube) to get the code and verify
 */

var SENDER = 'noreply@xpengauto.bg';
var SENDER_NAME = 'XPENG Bulgaria';
var SUBJECT = 'Благодарим за абонамента! | XPENG Bulgaria';

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var email = (data.email || '').trim().toLowerCase();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return json({ ok: false, error: 'invalid_email' });
    }

    MailApp.sendEmail({
      to: email,
      subject: SUBJECT,
      htmlBody: getConfirmationHtml(),
      name: SENDER_NAME,
      replyTo: SENDER
    });

    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  }
}

function doGet() {
  return json({ status: 'ok', service: 'xpeng-newsletter-confirm' });
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/* ---------- email template ---------- */

function getConfirmationHtml() {
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
    '<a href="https://www.xpengauto.bg/privacy" style="color:#999999;text-decoration:underline;">Политика за поверителност</a>',
    '</p>',
    '</td></tr>',

    '</table>',

    '</td></tr>',
    '</table>',

    '</body></html>'
  ].join('\n');
}

/* ---------- test helper ---------- */

function testSend() {
  var mock = {
    postData: {
      contents: JSON.stringify({ email: 'test@example.com' })
    }
  };
  var result = doPost(mock);
  Logger.log(result.getContent());
}
