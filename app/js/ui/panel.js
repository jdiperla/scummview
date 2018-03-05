const html = require('./html');
const Component = require('./component');

class Panel extends Component {
  constructor(params={}) {
    super(params);

    this.el = html.div().class('panel').dom();
  }

  update(model={}) {
    super.update(model);
  }

  add(component) {
    if (component)
      this.el.appendChild(component.dom());
  }

  clear() {
    while (this.el.firstChild) this.el.removeChild(this.el.firstChild);
  }
}

module.exports = Panel;
