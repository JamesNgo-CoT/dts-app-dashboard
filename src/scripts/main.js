// The main javascript file for feis_bicycle_parking.
// IMPORTANT:
// Any resources from this project should be referenced using SRC_PATH preprocessor var
// Ex: let myImage = '/*@echo SRC_PATH*//img/sample.jpg';

$(function () {
  const appTitle = 'DTS Application Dashboard';
  const app = new cot_app(appTitle, {
    hasContentTop: false,
    hasContentBottom: false,
    hasContentRight: false,
    hasContentLeft: false,
    searchcontext: 'INTRA'
  });

  app.setBreadcrumb([
    { 'name': appTitle, 'link': '#home' }
  ], true);

  app.render();

  ////////////////////////////////////////////////////////////////////////////////

  const wrapper = document.getElementById('dts-app-dashboard_container');
  app.bodyContainer = wrapper.appendChild(document.createElement('div'));
  app.bodyView = null;

  //////////////////////////////////////////////////////////////////////////////

  const AuthModel = Backbone.AuthModel.extend({
    webStorageKey: `Auth`,
    urlRoot: '/* @echo C3AUTH_URL */',
    app: appTitle
  });

  Backbone.authModel = new AuthModel();

  const AppLoginButtonView = LoginButtonView.extend({
    loginFragment: 'login'
  });

  const loginButtonView = new AppLoginButtonView({
    className: 'loginButtonView',
    model: Backbone.authModel
  });
  const lockIcon = document.querySelector('.securesite img');
  lockIcon.parentNode.insertBefore(loginButtonView.el, lockIcon);
  loginButtonView.render();

  //////////////////////////////////////////////////////////////////////////////

  const Router = Backbone.BaseRouter.extend({
    routes: {
      'home': 'routeApps',

      'login': 'routeLoginPage',

      '*default': 'routeDefault'
    },

    ////////////////////////////////////////////////////////////////////////////

    routeApps() {
    },

    ////////////////////////////////////////////////////////////////////////////

    routeLoginPage(queryString) {
      const navigateBack = () => {
        const queryObject = toQueryObject(queryString);
        if (queryObject && queryObject.redirect != null) {
          this.navigate(queryObject.redirect, { trigger: true });
        } else {
          const defaultFragment = _.result(this, 'defaultFragment');
          this.navigate(defaultFragment, { trigger: true });
        }
      }

      if (Backbone.authModel.isLoggedIn()) {
        navigateBack();
      } else {
        const view = new LoginPageView({
          className: 'loginPageView',
          model: Backbone.authModel
        });
        view.on('success', () => {
          navigateBack();
        });

        app.bodyView = swapView(app.bodyContainer, app.bodyView, view);

        app.setTitle(appTitle);
        app.setBreadcrumb([
          app.breadcrumbItems[0],
          {
            name: 'Login'
          }
        ], true);

        loginButtonView.hide();

        if (this.showFocus) {
          app.titleElement.focus();
        } else {
          this.showFocus = true;
        }

        return (name) => {
          loginButtonView.show();
        }
      }
    }
  });

  const router = new Router();
  router.on('route', () => {
    loginButtonView.render();
  });

  Backbone.history.start();
});
