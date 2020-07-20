function apps_devPhase_choicesMap(choices) {
  choices.unshift({ text: '', value: '' });
  return choices;
}

function apps_qaPhase_choicesMap(choices) {
  choices.unshift({ text: '', value: '' });
  return choices;
}

function apps_uatPhase_choicesMap(choices) {
  choices.unshift({ text: '', value: '' });
  return choices;
}

function apps_aodaPhase_choicesMap(choices) {
  choices.unshift({ text: '', value: '' });
  return choices;
}

function apps_prodPhase_choicesMap(choices) {
  // choices.unshift({ text: '∀ PROD', value: '' });
  choices.unshift({ text: '', value: '' });
  return choices;
}

function apps_allPhase_createdCell(td, cellData, rowData, row, col) {
  if (cellData) {
    td.classList.add('highlighted');
  }
}

function apps_allPhase_render(data) {
  return (data ? '✓ ' : '') + '<span class=\"sr-only\">' + data + '</span>';
}

function app_view_render(data) {
  return '<a href=\"#\" class=\"btn btn-default\">View</a>';
}
