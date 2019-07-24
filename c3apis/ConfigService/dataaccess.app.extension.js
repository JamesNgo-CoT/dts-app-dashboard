var common = require('tw_backflowprevention/common.js');

////////////////////////////////////////////////////////////////////////////////

function afterQuery(content, request, uriInfo, response) { }

function beforeContentParse(content, request, uriInfo, response) { }

function afterCreate(content, request, uriInfo, response) {
  var contentJson = JSON.parse(content.toString());
  sendEmail(contentJson);
}

function afterUpdate(content, request, uriInfo, response) { }

function afterDelete(content, request, uriInfo, response) { }

////////////////////////////////////////////////////////////////////////////////

function sendEmail(json) {
  common.emailAndLog({
    to: module.exports.SENDMAIL_RECIPIENTS,
    subject: json.name + module.exports.SENDMAIL_SUBJECT_SUFFIX,
    body: buildBody(json)
  });
}

function buildBody(json) {
  const bodyItems = [];

  bodyItems.push(
    '<p>New Record has been added to the DTS App Dashboard.</p>',
    '<table border="1" width="100%">',
    '<tbody>',
    '<tr>',
    '<th width="20%" style="text-align: left;">Name</th>',
    '<td>'
  );

  if (json.name) {
    bodyItems.push(json.name);
  } else {
    bodyItems.push('-');
  }

  bodyItems.push(
    '</td>',
    '</tr>',
    '<tr>',
    '<th width="20%" style="text-align: left;">Description</th>',
    '<td>'
  );

  if (json.desc) {
    bodyItems.push(json.desc);
  } else {
    bodyItems.push('-');
  }

  bodyItems.push(
    '</td>',
    '</tr>',
    '<tr>',
    '<th width="20%" style="text-align: left;">Developer</th>',
    '<td>'
  );

  if (json.developer) {
    bodyItems.push(json.developer);
  } else {
    bodyItems.push('-');
  }

  bodyItems.push(
    '</td>',
    '</tr>',
    '<tr>',
    '<th width="20%" style="text-align: left;">Dashboard Link</th>',
    '<td><a href="' + module.exports.DATAACCESS_APP_BASE_URL + '/#app/' + json.id + '/view">', json.id, '</a></td>',
    '</tr>',
    '<tr>',
    '<th width="20%" style="text-align: left;">Environments</th>',
    '<td>'
  );

  if (!json.devUrl && !json.qaUrl && !json.prodUrl) {
    bodyItems.push('DEV');
  } else {
    const urls = []
    if (json.devUrl) {
      urls.push('<a href="' + json.devUrl + '">DEV</a>');
    }
    if (json.qaUrl) {
      urls.push('<a href="' + json.qaUrl + '">DEV</a>');
    }
    if (json.prodUrl) {
      urls.push('<a href="' + json.prodUrl + '">DEV</a>');
    }

    bodyItems.push(urls.filter(function (url) { return url; }).join(', '));
  }

  bodyItems.push(
    '</td>',
    '</tr>',
    '</tbody>',
    '</table>'
  );

  return bodyItems.join(' ');
};
