const BBControlAppsDatatableView = Backbone.View.extend({
  template: _.template('<table width="100%"></table>'),

  events: {
    'dblclick td': function(e) {
      $(e.currentTarget).closest('tr').find('.btn').get(0).click();
    }
  },

  initialize: function(opts) {
    this.login = opts.login;
    this.datatable = null;
  },

  render: function(opts = {}) {
    opts.config = opts.config || {};

    this.$el.html(this.template());

    const config = $.extend({
      ajax: {
        Authorization: `AuthSession ${this.login.sid}`,
        url: BBControlAppsDatatableView.url
      },
      columns: [
        BBControlAppsDatatableView.columns.name,
        BBControlAppsDatatableView.columns.developer,
        BBControlAppsDatatableView.columns.api,
        BBControlAppsDatatableView.columns.dev,
        BBControlAppsDatatableView.columns.qa,
        BBControlAppsDatatableView.columns.aoda,
        BBControlAppsDatatableView.columns.stage,
        BBControlAppsDatatableView.columns.prod,
        BBControlAppsDatatableView.columns.link
      ],
      dom: BBControlAppsDatatableView.dom
    }, opts.config);

    this.datatable = this.$el.find('table').oDataTable(config);

    return this;
  }
}, {
  url: '/*@echo C3API_URL_BASE*//c3api_data/v2/DataAccess.svc/dts_app_dashboard/app',

  dom: `<'row'<'col-sm-6'l><'col-sm-6'f>><'row'<'table-responsive'<'col-sm-12'tr>>><'row'<'col-sm-5'i><'col-sm-7'p>>B`,

  columns: {
    createdOn: {
      data: '__CreatedOn',
      default: '',
      searchable: true,
      searchType: 'date-between',
      render: (data) => moment(data).format('l'),
      title: 'Date'
    },
    id: {
      data: 'id',
      default: '',
      searchable: true,
      searchType: 'string-contains',
      title: 'ID'
    },
    name: {
      data: 'name',
      default: '',
      searchable: true,
      searchType: 'string-contains',
      title: 'App'
    },
    developer: {
      data: 'developer',
      default: '',
      searchable: true,
      searchType: 'string-contains',
      title: 'Developer'
    },
    version: {
      data: 'version',
      default: '',
      searchable: true,
      searchType: 'string-contains',
      title: 'Version'
    },
    api: {
      data: 'dependencies',
      default: '',
      searchable: false,
      render: (data) => data && data.length > 0 && (data[0].api || data[0].url) ? data.map((val) => val.api || 'Other').join(', ') : '',
      title: 'API'
    },
    dev: {
      data: 'isStageDEV',
      default: '',
      searchable: true,
      searchChoices: ['', 'Yes', 'No'],
      render: (data) => data === 'Yes' ? '<span class="glyphicon glyphicon-ok" aria-hidden="true"></span>' : '',
      title: 'DEV',
      className: 'stageCol'
    },
    qa: {
      data: 'isStageQA',
      default: '',
      searchable: true,
      searchChoices: ['', 'Yes', 'No'],
      render: (data) => data === 'Yes' ? '<span class="glyphicon glyphicon-ok" aria-hidden="true"></span>' : '',
      title: 'QA',
      className: 'stageCol'
    },
    aoda: {
      data: 'isStageAODA',
      default: '',
      searchable: true,
      searchChoices: ['', 'Yes', 'No'],
      render: (data) => data === 'Yes' ? '<span class="glyphicon glyphicon-ok" aria-hidden="true"></span>' : '',
      title: 'AODA',
      className: 'stageCol'
    },
    stage: {
      data: 'isStageSTAGE',
      default: '',
      searchable: true,
      searchChoices: ['', 'Yes', 'No'],
      render: (data) => data === 'Yes' ? '<span class="glyphicon glyphicon-ok" aria-hidden="true"></span>' : '',
      title: 'STAGE',
      className: 'stageCol'
    },
    prod: {
      data: 'isStagePROD',
      default: '',
      searchable: true,
      searchChoices: ['', 'Yes', 'No'],
      render: (data) => data === 'Yes' ? '<span class="glyphicon glyphicon-ok" aria-hidden="true"></span>' : '',
      title: 'PROD',
      className: 'stageCol'
    },
    link: {
      data: 'id',
      orderable: false,
      render: (data) => '<a href="#app/' + data + '/view" class="btn btn-default">View</a>',
      searchable: false,
      title: 'Action'
    }
  }
});
