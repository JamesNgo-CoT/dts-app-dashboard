const AppsDatatableView = FilteredDatatableView.extend({
  datatableDefinition: '/* @echo C3DATA_APPSPAGE_APPS_DATATABLE_URL */'
});

////////////////////////////////////////////////////////////////////////////////

const AppsPageView = Backbone.BaseView.extend({
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
        <p><a class="btn btn-default">New Application</a></p>
      </div>

      <div class="col-sm-6 text-right">

      </div>
    `;

    this.datatableView = new AppsDatatableView({
      className: 'datatableView',
      collection: this.collection
    })

    this.el.appendChild(this.datatableView.el);

    return this.datatableView.render().then(() => {
      return Backbone.BaseView.prototype.render.call(this);
    });
  }
});
