const LoginPageView = Backbone.BaseView.extend({
  removeLoginFormView() {
    if (this.loginFormView) {
      this.loginFormView.remove();
      this.loginFormView = null;
    }
  },

  remove() {
    this.removeLoginFormView();
    Backbone.BaseView.prototype.remove.call(this);
  },

  render() {
    this.removeLoginFormView();
    while (this.el.firstChild) {
      this.el.removeChild(this.el.firstChild);
    }

    const row = this.el.appendChild(document.createElement('div'));
    row.classList.add('row');

    const instructionCol = row.appendChild(document.createElement('div'));
    instructionCol.classList.add('col-sm-6', 'col-md-8');
    instructionCol.innerHTML = `
      <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla dapibus porta consequat. Aenean in velit
      ultrices mi elementum vulputate malesuada vel sapien. Cras sed vestibulum magna. Sed in ex eget libero vestibulum
      dictum. Donec id consectetur ante, egestas hendrerit urna. Praesent sed neque suscipit, accumsan nunc in, mattis
      elit. Nam molestie vitae libero vitae cursus. Quisque et egestas est, ut viverra sapien. Proin in aliquam tortor.
      Sed vel elit sit amet sem posuere elementum. Etiam fermentum sagittis mattis. Duis interdum vel erat at mattis.</p>

      <p>Pellentesque sit amet ante pellentesque, scelerisque risus efficitur, venenatis metus. Nulla tristique diam
      lectus, vel venenatis neque consequat nec. Pellentesque habitant morbi tristique senectus et netus et malesuada
      fames ac turpis egestas. Interdum et malesuada fames ac ante ipsum primis in faucibus. Phasellus euismod augue at
      magna auctor, et malesuada tortor maximus. Sed bibendum lacinia imperdiet. Praesent urna eros, tincidunt ac est
      vestibulum, accumsan hendrerit felis. Aenean a molestie sapien, eget elementum metus. Praesent dapibus nunc vel
      condimentum sodales. Nullam sed auctor risus. Nulla facilisi. Vivamus sit amet odio ante. Donec efficitur nibh nec
      turpis porttitor, vitae pellentesque augue aliquam. Nulla bibendum leo nec dui tempus, commodo eleifend risus
      auctor. Sed tortor magna, aliquet a tincidunt at, ullamcorper eget nibh. Aliquam et arcu feugiat, lacinia mauris
      at, blandit diam.</p>

      <p>Maecenas fermentum, urna aliquet ultricies congue, mauris magna suscipit risus, eget sodales urna lacus ut
      nisi. Suspendisse convallis consequat tincidunt. Sed et augue in nibh dapibus vestibulum nec et magna. In laoreet
      posuere urna, id venenatis ex suscipit et. Donec eleifend mi nec lorem commodo, quis interdum dolor euismod. Sed a
      dui non mauris rhoncus placerat in blandit lorem. Vivamus ac orci sed dui sollicitudin mattis at lacinia enim.</p>
    `;

    const formsCol = row.appendChild(document.createElement('div'));
    formsCol.classList.add('col-sm-6', 'col-md-4');

    this.loginFormView = new LoginFormView({
      className: 'formView',
      model: this.model
    });
    this.loginFormView.on('success', () => {
      this.trigger('success');
    });
    formsCol.appendChild(this.loginFormView.el);
    return this.loginFormView.render()
      .then(() => {
        return Backbone.BaseView.prototype.render.call(this);
      });
  }
});
