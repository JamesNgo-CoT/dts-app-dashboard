const AppDetailsFormView = FormView.extend({
  formDefinition: {
    sections: [
      {
        title: 'Details',

        rows: [
          {
            fields: [
              {
                title: 'Name + Version'
              }
            ]
          },
          {
            fields: [
              {
                title: 'Description',
                type: 'textarea'
              }
            ]
          },
          {
            fields: [
              {
                title: 'Client(s)',
              }
            ]
          },
          {
            fields: [
              {
                choices: [
                  {
                    text: 'Stand Alone'
                  },
                  {
                    text: 'Embedded'
                  }
                ],
                orientation: 'horizontal',
                title: 'Type',
                type: 'radio'
              },
              {
                choices: [
                  {
                    text: 'Internet (External)'
                  },
                  {
                    text: 'Intranet (Internal)'
                  }
                ],
                orientation: 'horizontal',
                title: 'Visibility',
                type: 'radio'
              }
            ]
          },
          {
            fields: [
              {
                title: 'Access Group(s)',
                type: 'textarea'
              }
            ]
          },
          {
            fields: [
              {
                title: 'Cookies'
              }
            ]
          },
          {
            fields: [
              {
                title: 'Local Storage'
              }
            ]
          },
          {
            fields: [
              {
                title: 'Session Storage'
              }
            ]
          }
        ]
      },
      {
        title: 'APIs',

        rows: [
          {
            fields: [
              {
                title: 'C3API Auths',
                type: 'textarea'
              }
            ]
          },
        ]
      },
      {
        title: 'DEV Phase',

        rows: []
      },
      {
        title: 'SIT Phase',

        rows: []
      },
      {
        title: 'QA Phase',

        rows: []
      },
      {
        title: 'PROD Phase',

        rows: []
      }
    ]
  }
});

const AppDetailsPageView = Backbone.BaseView.extend({
  removeFormView() {
    if (this.formView) {
      this.formView.remove();
      this.formView = null;
    }
  },

  remove() {
    this.removeFormView();
    Backbone.BaseView.prototype.remove.call(this);
  },

  render() {
    this.removeFormView();
    while (this.el.firstChild) {
      this.el.removeChild(this.el.firstChild);
    }

    const row = this.el.appendChild(document.createElement('div'));
    row.classList.add('row');

    const formCol = row.appendChild(document.createElement('div'));
    formCol.classList.add('col-md-9');

    this.formView = new AppDetailsFormView({
      model: this.model
    });

    formCol.appendChild(this.formView.el);

    const metaCol = row.appendChild(document.createElement('div'));
    metaCol.classList.add('col-md-3');

    metaCol.innerHTML = `
      METADATA
    `;

    return this.formView.render()
      .then(() => {
        return Backbone.BaseView.prototype.render.call(this);
      });
  }
});
