const html = require('./html');
const Component = require('./component');

class Panel extends Component {
  constructor(params={}) {
    super(params);
    this.render();
  }

  render() {
    this.el = html.div().class('panel').dom();
  }

  update(model={}) {
    super.update(model);
    this.updateElement();
  }

  updateElements() {
  }

  add(component) {
    if (component) {
      this.el.appendChild(component.dom());
      if (component.adjust) {
        component.adjust();
      }
    }
  }

  clear() {
    while (this.el.firstChild) this.el.removeChild(this.el.firstChild);
  }
}

module.exports = Panel;
