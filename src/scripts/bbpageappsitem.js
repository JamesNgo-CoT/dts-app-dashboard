const BBPageAppsItemModel = Backbone.Model.extend({
  defaults: {
    name: '',
    description: '',
    client: '',
    type: 'Standalone',
    visibility: 'Intranet',
    version: '1.0.0',
    cabTicket: '',
    cabDate: '',
    dependencies: [{ api: '', url: '' }],
    developer: '',
    gitRepo: '',
    devUrl: '',
    qaUrl: '',
    uatTester: '',
    uatApprovalDate: '',
    qaTester: '',
    qaApprovalDate: '',
    accessibilityTester: '',
    accessibilityApprovalDate: '',
    prodUrl: '',
    notes: '',
    isRetired: false,
    originalId: '',
    stages: [],
    isStageDev: 'NO',
    isStageQA: 'NO',
    isStageAODA: 'NO',
    isStageSTAGE: 'NO',
    isStagePROD: 'NO'
  },

  url: function() {
    if (this.isNew()) {
      return Backbone.Model.prototype.url.call(this);
    }
    var base = _.result(this, 'urlRoot') || _.result(this.collection, 'url') || urlError();
    var id = this.get(this.idAttribute);
    return base.replace(/\/$/, '') + '(\'' + encodeURIComponent(id) + '\')';
  },

  urlRoot: '/*@echo C3API_URL_BASE*//c3api_data/v2/DataAccess.svc/dts_app_dashboard/app',

  fetch: function(opts = {}) {
    const originalSuccess = opts.success || function() {};
    opts.success = (...args) => {
      if (this.get('uatApprovalDate')) { this.set('uatApprovalDate', moment(this.get('uatApprovalDate')).format('l')); }
      if (this.get('qaApprovalDate')) { this.set('qaApprovalDate', moment(this.get('qaApprovalDate')).format('l')); }
      if (this.get('accessibilityApprovalDate')) { this.set('accessibilityApprovalDate', moment(this.get('accessibilityApprovalDate')).format('l')); }
      originalSuccess.call(...args);
    };
    return Backbone.Model.prototype.fetch.call(this, opts);
  },

  save: function(attrs, opts = {}) {
    const originalSuccess = opts.success || function() {};
    opts.success = (...args) => {
      if (this.get('uatApprovalDate')) { this.set('uatApprovalDate', moment(this.get('uatApprovalDate')).format('l')); }
      if (this.get('qaApprovalDate')) { this.set('qaApprovalDate', moment(this.get('qaApprovalDate')).format('l')); }
      if (this.get('accessibilityApprovalDate')) { this.set('accessibilityApprovalDate', moment(this.get('accessibilityApprovalDate')).format('l')); }

      if (this.has('id') && !this.get('originalId')) {
        this.set('originalId', this.get('id'));
        Backbone.Model.prototype.save.call(this, attrs, opts);
      } else {
        originalSuccess.call(...args);
      }
    };
    if (this.get('uatApprovalDate')) { this.set('uatApprovalDate', moment(this.get('uatApprovalDate'), 'l').format()); }
    if (this.get('qaApprovalDate')) { this.set('qaApprovalDate', moment(this.get('qaApprovalDate'), 'l').format()); }
    if (this.get('accessibilityApprovalDate')) { this.set('accessibilityApprovalDate', moment(this.get('accessibilityApprovalDate'), 'l').format()); }
    const stages = this.get('stages') || [];

    this.set('isStageDEV', stages.indexOf('DEV') === -1 ? 'No' : 'Yes');
    this.set('isStageQA', stages.indexOf('QA') === -1 ? 'No' : 'Yes');
    this.set('isStageAODA', stages.indexOf('AODA') === -1 ? 'No' : 'Yes');
    this.set('isStageSTAGE', stages.indexOf('STAGE') === -1 ? 'No' : 'Yes');
    this.set('isStagePROD', stages.indexOf('PROD') === -1 ? 'No' : 'Yes');

    return Backbone.Model.prototype.save.call(this, attrs, opts);
  }
});

const BBPageAppsItemView = Backbone.View.extend({
  events: {
    'click .btn-cancel': function() {
      return confirm('Any changes made will not be saved. Do you want to continue?');
    },
    'click .btn-save': function(e) {
      e.preventDefault();
      this.$el.find('form').submit();
    },
    'click .btn-version': 'newVersion',
    'click .btn-delete': function(e) {
      e.preventDefault();
      if (prompt('The current app will be deleted. Please type "Delete" on the prompt if you want to continue.') === 'Delete') {
        this.model.destroy({
          error: (jqxhr, textstatus, errorthrown) => {
            alert('An error has occured while deleting the app. ' + errorthrown);
          },
          success: () => {
            this.router.navigate('apps', { trigger: true });
          }
        });
      }
    }
  },

  initialize: function(opts) {
    this.login = opts.login;
    this.router = opts.router;
  },

  render: function(action) {
    this.$el.empty();

    if (this.model.isNew()) {
      this.$el.append('<h2>New App</h2>');
    } else {
      this.$el.append('<h2>' + (this.model.get('name') || this.model.get('id')) + ' (' + (this.model.get('isRetired') ? 'Retired ' : '') + 'App)</h2>');
    }

    this.$el.append('<div class="form"></div>');

    if (this.model.isNew() || action === 'update') {
      this.render_edit();
    } else {
      this.render_view();
    }
  },

  render_edit: function() {
    const form = new CotForm({
      id: 'form',
      rootPath: '/*@echo SRC_PATH*//',
      success: (event) => {
        event.preventDefault();

        (new Promise((resolve, reject) => {
          if (this.login.isLoggedIn()) {
            resolve();
          } else {
            this.login.showLogin(() => {
              if (this.login.isLoggedIn()) {
                resolve();
              } else {
                this.login.logout();
              }
            });
          }
        })).then(() => {
          return new Promise((resolve, reject) => {
            this.model.save({}, {
              error: (jqxhr, textstatus, errorthrown) => reject(errorthrown),
              success: () => resolve()
            });
          });
        }).then(() => {
          this.router.navigate('app/' + this.model.get('id') + '/view', { trigger: true });
        }, (errorthrown) => {
          alert('An error has occured while saving. ' + errorthrown);
        });

        return false;
      },
      useBinding: true,

      sections: [{
        title: 'App Information',

        rows: [{
          fields: [{
            id: 'name',
            title: 'Name',
            type: 'text',
            required: true,
            bindTo: 'name',
            className: 'col-xs-12 col-sm-8'
          }, {
            id: 'version',
            title: 'Version',
            type: 'text',
            bindTo: 'version',
            className: 'col-xs-12 col-sm-4'
          }]
        }, {
          fields: [{
            id: 'description',
            title: 'Description',
            type: 'textarea',
            bindTo: 'description'
          }]
        }, {
          fields: [{
            id: 'client',
            title: 'Client',
            type: 'text',
            bindTo: 'client'
          }]
        }, {
          fields: [{
            id: 'type',
            title: 'Type',
            type: 'radio',
            choices: [{ text: 'Standalone' }, { text: 'Embedded' }],
            orientation: 'horizontal',
            required: true,
            bindTo: 'type'
          }, {
            id: 'visibility',
            title: 'Visibility',
            type: 'radio',
            choices: [{ text: 'Intranet' }, { text: 'Internet' }],
            orientation: 'horizontal',
            required: true,
            bindTo: 'visibility'
          }]
        }, {
          grid: {
            id: 'dependencies',
            bindTo: 'dependencies',
            title: 'API Dependencies',
            headers: [
              {title: 'API'},
              {title: 'URL'}
            ],
            fields: [
              {
                id: 'api',
                type: 'dropdown',
                choices: [{
                  text: ''
                }, {
                  text: 'Config API'
                }, {
                  text: 'Config API v2'
                }, {
                  text: 'Content API'
                }, {
                  text: 'DataAccess API'
                }, {
                  text: 'DataAccess API v2'
                }, {
                  text: 'Event Dispatch 2'
                }, {
                  text: 'Repo API'
                }, {
                  text: 'Repo API v2'
                }, {
                  text: 'Scheduler API'
                }, {
                  text: 'Submit API'
                }, {
                  text: 'Upload API'
                }],
                bindTo: 'api'
              }, {
                id: 'url',
                bindTo: 'url',
                type: 'text'
              }
            ]
          }
        // }, {
        //   fields: [{
        //     id: 'apis',
        //     title: 'API Dependencies',
        //     type: 'checkbox',
        //     orientation: 'horizontal',
        //     choices: [{
        //       text: 'Config API'
        //     }, {
        //       text: 'Config API v2'
        //     }, {
        //       text: 'Content API'
        //     }, {
        //       text: 'DataAccess API'
        //     }, {
        //       text: 'DataAccess API v2'
        //     }, {
        //       text: 'Event Dispatch 2'
        //     }, {
        //       text: 'Repo API'
        //     }, {
        //       text: 'Repo API v2'
        //     }, {
        //       text: 'Scheduler API'
        //     }, {
        //       text: 'Submit API'
        //     }, {
        //       text: 'Upload API'
        //     }],
        //     bindTo: 'apis'
        //   }]
        }]
      }, {
        title: 'DEV Phase',

        rows: [{
          fields: [{
            id: 'developer',
            title: 'Developer',
            type: 'text',
            bindTo: 'developer'
          // }, {
          //   id: 'devDate',
          //   title: 'Start Date',
          //   type: 'datetimepicker',
          //   bindTo: 'devDate'
          }]
        }, {
          fields: [{
            id: 'gitRepo',
            title: 'GIT Repo URL',
            type: 'text',
            bindTo: 'gitRepo'
          }]
        }, {
          fields: [{
            id: 'devUrl',
            title: 'DEV URL',
            type: 'text',
            bindTo: 'devUrl'
          }]
        }]
      }, {
        title: 'QA Phase',

        rows: [{
          fields: [{
            id: 'qaUrl',
            title: 'QA URL',
            type: 'text',
            bindTo: 'qaUrl'
          }]
        }, {
          fields: [{
            id: 'uatTester',
            title: 'Assigned to UAT Tester',
            type: 'text',
            bindTo: 'uatTester'
          }, {
            id: 'qaApprovalDate',
            title: 'QA Approval Date?',
            type: 'datetimepicker',
            bindTo: 'qaApprovalDate'
          }]
        }, {
          fields: [{
            id: 'accessibilityTester',
            title: 'Assigned to Accessibility Tester',
            type: 'text',
            bindTo: 'accessibilityTester'
          }, {
            id: 'accessibilityApprovalDate',
            title: 'Accessibility Approval Date?',
            type: 'datetimepicker',
            bindTo: 'accessibilityApprovalDate'
          }]
        }]
      }, {
        title: 'Change Management',

        rows: [{
          fields: [{
            id: 'cabTicket',
            title: 'CAB Ticket',
            type: 'text',
            bindTo: 'cabTicket'
          }]
        }]
      }, {
        title: 'PROD Phase',

        rows: [{
          fields: [{
            id: 'prodUrl',
            title: 'PROD URL',
            type: 'text',
            bindTo: 'prodUrl'
          }]
        }]
      }, {
        rows: [{
          fields: [{
            id: 'stages',
            title: 'Stage',
            type: 'checkbox',
            choices: [{
              text: 'DEV'
            }, {
              text: 'QA'
            }, {
              text: 'AODA'
            }, {
              text: 'STAGE'
            }, {
              text: 'PROD'
            }],
            orientation: 'horizontal',
            bindTo: 'stages'
          }]
        }, {
          fields: [{
            id: 'notes',
            title: 'Notes',
            type: 'textarea',
            rows: 10,
            bindTo: 'notes'
          }]
        }]
      }]
    });
    form.setModel(this.model);
    form.render({ target: this.$el.find('.form') });

    if (this.model.isNew()) {
      this.$el.find('form').prepend(`
        <p>
          <a href="#apps" class="btn btn-default btn-cancel">Cancel</a>
          <button type="button" class="btn btn-success btn-save">Create</button>
        </p>
      `).append(`
        <p>
          <a href="#apps" class="btn btn-default btn-cancel">Cancel</a>
          <button type="button" class="btn btn-success btn-save">Create</button>
        </p>
      `);
    } else {
      this.$el.find('form').prepend(`
        <p>
          <a href="#app/${this.model.get('id')}/view" class="btn btn-default btn-cancel">Cancel</a>
          <button type="button" class="btn btn-success btn-save">Save</button>
        </p>
      `).append(`
        <p>
          <a href="#app/${this.model.get('id')}/view" class="btn btn-default btn-cancel">Cancel</a>
          <button type="button" class="btn btn-success btn-save">Save</button>
        </p>
      `);
    }

    this.$el.find('h2').focus();
  },

  render_view: function() {
    const form = new CotForm({
      id: 'form',
      rootPath: '/*@echo SRC_PATH*//',
      success: (event) => {
        event.preventDefault();
        return false;
      },
      useBinding: false,

      sections: [{
        title: 'App Information',

        rows: [{
          fields: [{
            title: 'Name',
            type: 'static',
            value: this.model.get('name') || '-',
            className: 'col-xs-12 col-sm-8'
          }, {
            title: 'Version',
            type: 'static',
            value: this.model.get('version') || '-',
            className: 'col-xs-12 col-sm-4'
          }]
        }, {
          fields: [{
            type: 'html',
            html: `<span class="staticlabel"><span>Description</span></span><p>${this.model.get('description') ? this.model.get('description').replace(/(\r\n|\r|\n)/g, '<br>') : '-'}</p>`
          }]
        }, {
          fields: [{
            title: 'Client',
            type: 'static',
            value: this.model.get('client') || '-'
          }]
        }, {
          fields: [{
            title: 'Type',
            type: 'static',
            value: this.model.get('type') || '-'
          }, {
            title: 'Visibility',
            type: 'static',
            value: this.model.get('visibility') || '-'
          }]
        }, {
          // fields: [{
          //   title: 'API Dependencies',
          //   type: 'static',
          //   value: this.model.get('apis') && this.model.get('apis').length > 0 ? this.model.get('apis').join(', ') : '-'
          // }]
          fields: [{
            type: 'html',
            html: `
              <span class="staticlabel"><span>API Dependencies</span></span>
              <ul>
                ${this.model.get('dependencies') && this.model.get('dependencies').length > 0 && (this.model.get('dependencies')[0].api || this.model.get('dependencies')[0].url)
                  ? this.model.get('dependencies').filter((value) => value.api || value.url).map((value) => '<li>' + value.api + ' - <a href="' +  value.url + '">' + value.url + '</a></li>').join('')
                  : '<li>None</li>'}
              </ul>
            `
          }]
        }]
      }, {
        title: 'DEV Phase',

        rows: [{
          fields: [{
            title: 'Developer',
            type: 'static',
            value: this.model.get('developer') || '-'
          }]
        }, {
          fields: [{
            type: 'html',
            html: `<span class="staticlabel"><span>GIT Repo URL</span></span><p>${this.model.get('gitRepo') ? '<a href="' + this.model.get('gitRepo') + '">' + this.model.get('gitRepo') + '</a>' : '-'}</p>`
          }]
        }, {
          fields: [{
            type: 'html',
            html: `<span class="staticlabel"><span>DEV URL</span></span><p>${this.model.get('devUrl') ? '<a href="' + this.model.get('devUrl') + '">' + this.model.get('devUrl') + '</a>' : '-'}</p>`
          }]
        }]
      }, {
        title: 'QA Phase',

        rows: [{
          fields: [{
            type: 'html',
            html: `<span class="staticlabel"><span>QA URL</span></span><p>${this.model.get('qaUrl') ? '<a href="' + this.model.get('qaUrl') + '">' + this.model.get('qaUrl') + '</a>' : '-'}</p>`
          }]
        }, {
          fields: [{
            title: 'UAT Tester',
            type: 'static',
            value: this.model.get('uatTester') || '-'
          }, {
            title: 'QA Approval Date?',
            type: 'static',
            value: this.model.get('qaApprovalDate') || '-'
          }]
        }, {
          fields: [{
            title: 'Accessibility Tester',
            type: 'static',
            value: this.model.get('accessibilityTester') || '-'
          }, {
            title: 'Accessibility Approval Date?',
            type: 'static',
            value: this.model.get('accessibilityApprovalDate') || '-'
          }]
        }]
      }, {
        title: 'Change Management',

        rows: [{
          fields: [{
            title: 'CAB Ticket',
            type: 'static',
            value: this.model.get('cabTicket') || '-'
          }]
        }]
      }, {
        title: 'PROD Phase',

        rows: [{
          fields: [{
            type: 'html',
            html: `<span class="staticlabel"><span>PROD URL</span></span><p>${this.model.get('prodUrl') ? '<a href="' + this.model.get('prodUrl') + '">' + this.model.get('prodUrl') + '</a>' : '-'}</p>`
          }]
        }]
      }, {
        rows: [{
          fields: [{
            title: 'Stage',
            type: 'static',
            value: this.model.get('stages') && this.model.get('stages').length > 0 ?this.model.get('stages').join(', ') : '-'
          }]
        }, {
          fields: [{
            type: 'html',
            html: `<span class="staticlabel"><span>Notes</span></span><p>${this.model.get('notes') ? this.model.get('notes').replace(/(\r\n|\r|\n)/g, '<br>') : '-'}</p>`
          }]
        }]
      }, {
        title: 'Versions',
        className: 'panel panel-default versions',

        rows: []
      }]
    });
    form.render({ target: this.$el.find('.form') });

    this.$el.find('form').prepend(`
      <p class="hidden-print">
        <a href="#apps" class="btn btn-default btn-back">Back to Apps</a>
        <a href="#app/${this.model.get('id')}/update" class="btn btn-default btn-update">Update App</a>
        ${this.model.get('isRetired') ? '<button type="button" class="btn btn-default" disabled>New Version</button>' : '<button type="button" class="btn btn-default btn-version">New Version</button>' }
        <button type="button" class="btn btn-danger btn-delete pull-right">Delete App</button>
      </p>
    `).append(`
      <p class="hidden-print">
        <a href="#apps" class="btn btn-default btn-back">Back to Apps</a>
        <a href="#app/${this.model.get('id')}/update" class="btn btn-default btn-update">Update App</a>
        ${this.model.get('isRetired') ? '<button type="button" class="btn btn-default" disabled>New Version</button>' : '<button type="button" class="btn btn-default btn-version">New Version</button>' }
        <button type="button" class="btn btn-danger btn-delete pull-right">Delete App</button>
      </p>
    `);

    this.datatableView = new BBControlAppsDatatableView({ login: this.login });

    this.$el.find('.versions .panel-body').append(this.datatableView.$el);
    const version = $.extend({
      render: (data, type, row) => data + (row.isRetired ? '' : ' (Active)')
    }, BBControlAppsDatatableView.columns.version);
    this.datatableView.render({
      config: {
        $filter: `originalId eq '${this.model.get('originalId')}'`,
        $select: 'isRetired',
        columns: [
          BBControlAppsDatatableView.columns.createdOn,
          version,
          BBControlAppsDatatableView.columns.dev,
          BBControlAppsDatatableView.columns.qa,
          BBControlAppsDatatableView.columns.aoda,
          BBControlAppsDatatableView.columns.stage,
          BBControlAppsDatatableView.columns.prod,
          BBControlAppsDatatableView.columns.link
        ]
      }
    });

    this.$el.find('h2').focus();
  },

  newVersion: function() {
    if (confirm('This will retire the current app and create a new version. Do you want to continue?')) {
      this.model.save({ isRetired: true }, {
        error: (jqxhr, textstatus, errorthrown) => {
          alert('An error has occured while retiring the app. ' + errorthrown);
        },
        success: () => {
          this.model.save({ id: null, isRetired: false, __CreatedOn: moment().format(), __ModifiedOn: null, __Owner: null, __Status: null }, {
            error: (jqxhr, textstatus, errorthrown) => {
              alert('An error has occured while saving a new version. ' + errorthrown);
            },
            success: () => {
              this.router.navigate('app/' + this.model.get('id') + '/update', { trigger: true });
            }
          });
        }
      });
    }
  }
});
