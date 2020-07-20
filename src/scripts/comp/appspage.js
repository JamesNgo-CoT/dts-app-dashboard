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
  return (data ? '✓ ' : '') + '<span class="sr-only">' + data + '</span>';
}

function app_view_render(data) {
  return '<a href="#apps/' + data + '" class="btn btn-default">View</a>';
}

////////////////////////////////////////////////////////////////////////////////

const AppsDatatableView = FilteredDatatableView.extend({
  // datatableDefinition: '/* @echo C3DATA_APPSPAGE_APPS_DATATABLE_DEFINITION_URL */'
  datatableDefinition: {
    "columns": [
      {
        "data": "app",
        "title": "App",
        "type": "string"
      },
      {
        "data": "developers",
        "title": "Developer(s)",
        "type": "string"
      },
      {
        "data": "apis",
        "searchable": false,
        "title": "API(s)",
        "type": "string"
      },
      {
        "choices": "https://config.cc.toronto.ca:49093/c3api_data/v2/DataAccess.svc/dts_app_dashboard/Media('apps_devphase_choices.json')/$value",
        "choicesMap": "apps_devPhase_choicesMap",
        "createdCell": "apps_allPhase_createdCell",
        "data": "devphase",
        "render": "apps_allPhase_render",
        "title": "DEV",
        "type": "boolean",
        "width": "55px",
        "search": "test"
      },
      {
        "choices": "https://config.cc.toronto.ca:49093/c3api_data/v2/DataAccess.svc/dts_app_dashboard/Media('apps_qaphase_choices.json')/$value",
        "choicesMap": "apps_qaPhase_choicesMap",
        "createdCell": "apps_allPhase_createdCell",
        "data": "qaphase",
        "render": "apps_allPhase_render",
        "title": "QA",
        "type": "boolean"
      },
      {
        "choices": "https://config.cc.toronto.ca:49093/c3api_data/v2/DataAccess.svc/dts_app_dashboard/Media('apps_uatphase_choices.json')/$value",
        "choicesMap": "apps_uatPhase_choicesMap",
        "createdCell": "apps_allPhase_createdCell",
        "data": "uatphase",
        "render": "apps_allPhase_render",
        "title": "UAT",
        "type": "boolean",
        "width": "55px"
      },
      {
        "choices": "https://config.cc.toronto.ca:49093/c3api_data/v2/DataAccess.svc/dts_app_dashboard/Media('apps_aodaphase_choices.json')/$value",
        "choicesMap": "apps_aodaPhase_choicesMap",
        "createdCell": "apps_allPhase_createdCell",
        "data": "aodaphase",
        "render": "apps_allPhase_render",
        "title": "AODA",
        "type": "boolean",
        "width": "55px"
      },
      {
        "choices": "https://config.cc.toronto.ca:49093/c3api_data/v2/DataAccess.svc/dts_app_dashboard/Media('apps_prodphase_choices.json')/$value",
        "choicesMap": "apps_prodPhase_choicesMap",
        "createdCell": "apps_allPhase_createdCell",
        "data": "prodphase",
        "render": "apps_allPhase_render",
        "title": "PROD",
        "type": "boolean",
        "width": "55px"
      },
      {
        "className": "excludeFromButtons",
        "data": "id",
        "orderable": false,
        "render": "app_view_render",
        "searchable": false,
        "width": "57px"
      }
    ],
    "stateSave": true,
    "serverSide": true,
    "searchCols": [
      null,
      { "search": "app" }
    ]
    // "scripts": [
    //   "https://config.cc.toronto.ca:49093/c3api_data/v2/DataAccess.svc/dts_app_dashboard/Media('apps_datatable.js')/$value"
    // ]
  }
});

////////////////////////////////////////////////////////////////////////////////

const AppsPageView = Backbone.BaseView.extend({
  events: {
    ['click .btn-resetFilters'](event) {
      event.preventDefault();
      this.datatableView.resetFilters();
    },

    ['dblclick tr'](event) {
      event.currentTarget.querySelector('a.btn[href]').click();
    },

    ['click .dropdown-menu-copy'](event) {
      event.preventDefault();
      this.el.querySelector('.buttons-copy').click();
    },
    ['click .dropdown-menu-csv'](event) {
      event.preventDefault();
      this.el.querySelector('.buttons-csv').click();
    },
    ['click .dropdown-menu-excel'](event) {
      event.preventDefault();
      this.el.querySelector('.buttons-excel').click();
    },
    ['click .dropdown-menu-pdf'](event) {
      event.preventDefault();
      this.el.querySelector('.buttons-pdf').click();
    },
    ['click .dropdown-menu-print'](event) {
      event.preventDefault();
      this.el.querySelector('.buttons-print').click();
    }
  },

  removeDatatableView() {
    if (this.datatableView) {
      this.datatableView.remove();
      this.datatableView = null;
    }
  },

  remove() {
    this.removeDatatableView();
    Backbone.BaseView.prototype.remove.call(this);
  },

  render() {
    this.removeDatatableView();
    while (this.el.firstChild) {
      this.el.removeChild(this.el.firstChild);
    }

    const topRow = this.el.appendChild(document.createElement('div'));
    topRow.classList.add('row');
    topRow.innerHTML = `
      <div class="col-sm-6">
        <a href="#apps/new" class="btn btn-default">New Application</a>
      </div>

      <div class="col-sm-6 text-right">
        <button type="button" class="btn btn-default btn-resetFilters">Reset Filters</button>

        <!-- Single button -->
        <div class="btn-group btn-group-action">
          <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
            Action <span class="caret"></span>
          </button>
          <ul class="dropdown-menu dropdown-menu-right">
            <li><a href="#" class="dropdown-menu-copy">Copy</a></li>
            <li><a href="#" class="dropdown-menu-csv">CSV</a></li>
            <li><a href="#" class="dropdown-menu-excel">Excel</a></li>
            <li><a href="#" class="dropdown-menu-pdf">PDF</a></li>
            <li><a href="#" class="dropdown-menu-print">Print</a></li>
          </ul>
        </div>
      </div>
    `;

    this.datatableView = new AppsDatatableView({
      className: 'datatableView',
      collection: this.collection
    })

    this.el.appendChild(this.datatableView.el);

    const bottomRow = this.el.appendChild(document.createElement('div'));
    bottomRow.classList.add('row');
    bottomRow.innerHTML = `
      <div class="col-sm-6">
        <a href="#apps/new" class="btn btn-default">New Application</a>
      </div>

      <div class="col-sm-6 text-right">
        <button type="button" class="btn btn-default btn-resetFilters">Reset Filters</button>

        <!-- Single button -->
        <div class="btn-group dropup btn-group-action">
          <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
            Action <span class="caret"></span>
          </button>
          <ul class="dropdown-menu dropdown-menu-right">
            <li><a href="#" class="dropdown-menu-copy">Copy</a></li>
            <li><a href="#" class="dropdown-menu-csv">CSV</a></li>
            <li><a href="#" class="dropdown-menu-excel">Excel</a></li>
            <li><a href="#" class="dropdown-menu-pdf">PDF</a></li>
            <li><a href="#" class="dropdown-menu-print">Print</a></li>
          </ul>
        </div>
      </div>
    `;

    return this.datatableView.render().then(() => {
      return Backbone.BaseView.prototype.render.call(this);
    });
  }
});
