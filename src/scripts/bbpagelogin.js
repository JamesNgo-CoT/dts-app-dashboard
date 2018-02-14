const BBPageLoginView = Backbone.View.extend({
  template: _.template(`
    <h2>Login Required</h2>

    <p>Login is required to continue.</p>
  `),

  render: function() {
    this.$el.html(this.template());
  }
});
