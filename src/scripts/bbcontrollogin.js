const BBControlLoginView = Backbone.View.extend({
  template: _.template(`
    <%= obj.lastName ? lastName : '' %><%= obj.firstName || obj.lastName ? ',' : '' %>
    <%= obj.firstName ? firstName : '' %>
    <button class="btn btn-default <%= obj.sid ? 'btn-logout' : 'btn-login' %>">
      <%= obj.sid ? 'Logout' : 'Login' %>
    </button>
  `),

  events: {
    'click .btn-login': 'doLogin',
    'click .btn-logout': 'doLogout'
  },

  doLogin: function() {
    this.login.showLogin(() => {

      // Reload if successfully logged in.
      if (this.login.isLoggedIn()) {
        window.location.reload();
      }
    });
  },

  doLogout: function() {
    this.login.logout();
  },

  initialize: function(opts) {
    if (opts.login) {
      this.login = opts.login;
    }
    // this.listenTo(this.model, 'change', this.render); // No longer needed.
  },

  render: function() {
    this.$el.html(this.template(this.model.toJSON()));
  }
});
