const html = require('./html');
const Component = require('./component');

class Sidebar extends Component {
  constructor(params={}) {
    super(params);
    this.render();
  }

  render() {
    this.el = html.div().dom();
  }

  update(model={}) {
    super.update(model);
    this.updateElements();
  }

  updateElements() {
    while (this.el.firstChild) this.el.removeChild(this.el.firstChild);
    
    for (var i = 0; i < this.model.items.length; i++) {
      let item = this.model.items[i];
      let el = html.element('li').dom();

    }
  }

}

module.exports = Sidebar;
