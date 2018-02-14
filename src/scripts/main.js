// The main javascript file for bikestation.

$(function () {
  $.fn.oDataTable.headerWrapperString = '<div class="hidden-print" style="margin-right: -15px;">';

  // ----------------------------------------------------------------------
  // App.

  const app = new cot_app('dts-app-dashboard');
  app.render();
  app.setTitle('DTS Application Dashboard');
  app.setBreadcrumb([
    { name: 'DTS App Dashboard' }
  ], true);

  // ----------------------------------------------------------------------
  // Update c-frame.

  $('#app-breadcrumb > .row > .hidden-xs')
    .removeClass('hidden-xs');

  $('#breadcrumb-bar')
    .addClass('breadcrumb-bar-with-login-bar')
    .after('<div id="login-bar"></div>');

  $('#app-header .securesite').addClass('hidden-print');

  $('#dts-app-dashboard_container')
    .addClass('row')
    .html(`
      <div id="dts-app-dashboard_content" class="col-xs-12"></div>
    `);

  const $content = $('#dts-app-dashboard_content');

  // ----------------------------------------------------------------------
  // Login.

  const loginModel = new Backbone.Model();

  const login = new cot_login({
    appName: 'tbstation',
    ccRoot: '/*@echo LOGIN_CCROOT*/',
    onLogin: (cot_login_instance) => loginModel.set(cot_login_instance)
  });
  login.showLogin = function(cbk) {
    this.modal = cot_app.showModal({
      title: 'User Login',
      body: `
        ${this.options.loginMessage}
        <form>
          <div class="form-group">
            <label for="cot_login_username">Username</label>:
            <input class="form-control" id="cot_login_username">
          </div>
          <div class="form-group">
            <label for="cot_login_password">Password</label>:
            <input class="form-control" type="password" id="cot_login_password">
          </div>
        </form>
      `,
      footerButtonsHtml: `
        <button class="btn btn-success" type="button" data-dismiss="modal">Cancel</button>
        <button class="btn btn-success btn-cot-login" type="button">Login</button>
      `,
      originatingElement: $(this.options['welcomeSelector']).find('a.login'),
      className: 'cot-login-modal',
      onShown: () => {
        this.modal.find('.btn-cot-login').click(() => {
          this._login();
        });
        this.modal.find('.modal-body input').keydown((e) => {
          if ((e.charCode || e.keyCode || 0) === 13) {
            this._login();
          }
        });
      },
      onHidden: () => {
        cbk();
      }
    });
  };

  const loginView = new BBControlLoginView({
    model: loginModel,
    login: login
  });

  $('#login-bar').append(loginView.$el);
  loginView.render();

  // ----------------------------------------------------------------------
  // Router.

  const router = window.router = new (Backbone.Router.extend({
    routes: {
      'apps': 'appsPage',
      'app(/)(:id)(/)(:action)': 'appsItemPage',

      '*others': () => {
        router.navigate('apps', { trigger: true });
      }
    },

    loginPage: function() {
      app.setBreadcrumb([
        { name: 'DTS App Dashboard', link: '#' },
        { name: 'Login Required' }
      ], true);
      $content.children('div').hide();

      loginModel.clear();
      loginView.render();

      if (this.loginPageView) {
        this.loginPageView.$el.show();
      } else {
        this.loginPageView = new BBPageLoginView();
        $content.append(this.loginPageView.$el);
        this.loginPageView.render();
      }
    },

    appsPage: function() {
      if (!login.isLoggedIn()) {
        this.loginPage();
        return;
      }

      app.setBreadcrumb([
        { name: 'DTS App Dashboard', link: '#' },
        { name: 'Apps' }
      ], true);
      $content.children('div').hide();

      if (this.appsView) {
        this.appsView.$el.show();
        this.appsView.reload(false);
      } else {
        this.appsView = new BBPageAppsView({ login: login });
        $content.append(this.appsView.render().$el);
      }
    },

    appsItemPage: function(id, action) {
      if (!login.isLoggedIn()) {
        this.loginPage();
        return;
      }

      app.setBreadcrumb([
        { name: 'DTS App Dashboard', link: '#' },
        { name: 'Apps', link: '#apps' },
        { name: 'App' }
      ], true);
      $content.children('div').hide();

      const appsItemPageModel = window.model = new BBPageAppsItemModel({});

      if (this.appsItemPageView) {
        this.appsItemPageView.remove();
      }

      this.appsItemPageView = new BBPageAppsItemView({
        model: appsItemPageModel,
        login: login,
        router: router
      });

      $content.append(this.appsItemPageView.$el);

      if (id && id !== 'new') {
        appsItemPageModel.set('id', id);
        appsItemPageModel.fetch({
          error: () => {
            appsItemPageModel.clear();
            appsItemPageModel.set(appsItemPageModel.defaults);
            this.appsItemPageView.render(action);
          },
          success: () => {
            this.appsItemPageView.render(action);
          }
        });
      } else {
        this.appsItemPageView.render(action);
      }
    }
  }))();

  Backbone.history.start();
});
