module.exports.DATAACCESS_BASE_URL = 'https:config.cc.toronto.ca:49093/c3api_data/v2/DataAccess.svc'; // MASERATI
// var DATAACCESS_BASE_URL = 'https://was-intra-sit.toronto.ca/c3api_data/v2/DataAccess.svc'; // SIT
// var DATAACCESS_BASE_URL = 'https://was-intra-qa.toronto.ca/c3api_data/v2/DataAccess.svc'; // QA
// var DATAACCESS_BASE_URL = 'https://insideto-secure.toronto.ca/c3api_data/v2/DataAccess.svc'; // PROD

module.exports.DATAACCESS_APP_BASE_URL = module.exports.DATAACCESS_BASE_URL + '/dts_app_dashboard';

////////////////////////////////////////////////////////////////////////////////

module.exports.SENDMAIL_RECIPIENTS = ['jngo2@toronto.ca']; // MASERATI, SIT, QA
// module.exports.SENDMAIL_RECIPIENTS = ['Marco.Palermo@toronto.ca', 'David.Kirolos@toronto.ca', 'digital@toronto.ca', 'francine.antonioforte@toronto.ca', 'Uni.Oh@toronto.ca']; // PROD

module.exports.SENDMAIL_SUBJECT_SUFFIX = ' - DTS App Dashboard (MASERATI)'; // MASERATI
// module.exports.SENDMAIL_SUBJECT_SUFFIX = ' - DTS App Dashboard (SIT)'; // SIT
// module.exports.SENDMAIL_SUBJECT_SUFFIX = ' - DTS App Dashboard (QA)'; // QA
// module.exports.SENDMAIL_SUBJECT_SUFFIX = ' - DTS App Dashboard'; // PROD

////////////////////////////////////////////////////////////////////////////////

var EMAILANDLOG_URL = module.exports.DATAACCESS_APP_BASE_URL + '/EmailLogs';

/**
 * Send an email and post a log with email content.
 * @param {object} options
 * @param {string} options.from
 * @param {string[]} options.to
 * @param {string[]} options.cc
 * @param {string[]} options.bcc
 * @param {string} options.subject
 * @param {string} options.body
 * @param {boolean} options.sendAsHtml
 */
module.exports.emailAndLog = function (options) {
  var mail = mailClient.createMail()
    .setSubject(options.subject)
    .setTo(options.to);

  if (typeof options.sendAsHtml === 'boolean' && options.sendAsHtml) {
    var MimeBodyPart = Java.type('javax.mail.internet.MimeBodyPart');
    var mimeBodyPart = new MimeBodyPart();
    mimeBodyPart.setText(options.body, 'UTF-8', 'html');
    mail.addMessageBodyPart(mimeBodyPart);
  } else {
    mail.setBody(options.body)
  }

  if (options.from !== undefined) {
    mail.setFrom(options.from);
  }
  if (options.cc !== undefined) {
    mail.setCc(options.cc);
  }
  if (options.bcc !== undefined) {
    mail.setBcc(options.bcc);
  }

  mail.send();

  var payload = {
    subject: options.subject,
    body: options.body,
    to: options.to,
    from: options.from,
    cc: options.cc,
    bcc: options.bcc
  };

  ajax.request({
    uri: encodeURI(EMAILANDLOG_URL),
    method: 'POST',
    data: JSON.stringify(payload),
    headers: {
      'Content-Type': 'application/json'
    }
  }, function (ajaxSuccessResponse) {
  }, function (ajaxErrorResponse) {
    throw ajaxErrorResponse;
  });
}

////////////////////////////////////////////////////////////////////////////////

var ERRORLOG_URL = module.exports.DATAACCESS_BACKFLOW_BASE_URL + '/ErrorLogs';
var ERRORLOG_RECIPIENTS = ['jngo2@toronto.ca'];

/**
 * Logs and emails an error. This does not throw an error.
 * @param {any} error
 * @param {string} topic
 */
module.exports.errorLog = function (error, topic) {
  if (error !== null && typeof error === 'object') {
    error = JSON.stringify(error);
  }

  var payload = JSON.stringify({
    error: String(error),
    topic: topic
  });

  // Log error.
  log.info(payload);

  // Post error.
  if (ERRORLOG_URL) {
    ajax.request({
      uri: encodeURI(ERRORLOG_URL),
      method: 'POST',
      data: payload,
      headers: {
        'Content-Type': 'application/json'
      }
    }, function (ajaxSuccessResponse) {
    }, function (ajaxErrorResponse) {
    });
  }

  // Email error.
  if (ERRORLOG_RECIPIENTS && ERRORLOG_RECIPIENTS.length > 0) {
    mailClient.createMail()
      .setSubject(topic)
      .setBody(payload)
      .setTo(ERRORLOG_RECIPIENTS)
      .send();
  }
}
