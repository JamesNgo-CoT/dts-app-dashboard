const BBPageAppsView = Backbone.View.extend({
  template: _.template(`
    <div style="margin-bottom: 10px;">
      <button type="button" class="btn btn-default btn-reload">Reload</button>
      <a href="#app/new" class="btn btn-default btn-new">Add an App</a>

      <div class="btn-group pull-right" style="display: inline-block">
        <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
          Export <span class="caret"></span>
        </button>
        <ul class="dropdown-menu">
          <li><a href="#" class="export-copy">Copy</a></li>
          <li><a href="#" class="export-csv">CSV</a></li>
          <li><a href="#" class="export-excel">Excel</a></li>
          <li><a href="#" class="export-pdf">PDF</a></li>
          <li><a href="#" class="export-print">Print</a></li>
        </ul>
      </div>
    </div>

    <div class="datatable"></div>

    <div>
      <button type="button" class="btn btn-default btn-reload">Reload</button>
      <a href="#app/new" class="btn btn-default btn-new">Add an App</a>
    </div>
  `),

  events: {
    'click .btn-reload': function(e) {
      e.preventDefault();
      this.reload(true);
    },
    'click .export-copy': function(e) {
      e.preventDefault();
      this.$el.find('.buttons-copy').click();
    },
    'click .export-csv': function(e) {
      e.preventDefault();
      this.$el.find('.buttons-csv').click();
    },
    'click .export-excel': function(e) {
      e.preventDefault();
      this.$el.find('.buttons-excel').click();
    },
    'click .export-pdf': function(e) {
      e.preventDefault();
      this.$el.find('.buttons-pdf').click();
    },
    'click .export-print': function(e) {
      e.preventDefault();
      this.$el.find('.buttons-print').click();
    }
  },

  initialize: function(opts) {
    this.login = opts.login;
    this.datatableView = new BBControlAppsDatatableView({ login: this.login });
  },

  reload: function(reRenderPage) {
    this.datatableView.datatable.DataTable().ajax.reload(null, reRenderPage);
  },

  render: function() {
    this.$el.html(this.template());
    this.$el.find('.datatable').append(this.datatableView.$el);
    this.datatableView.render({ config: { $filter: 'isRetired eq false' } });
    this.$el.find('h2').focus();
    return this;
  },

  remove: function() {
    this.datatableView.remove();
    BBPageAppsView.prototype.remove.call(this);
  }
});
