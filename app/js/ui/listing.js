const Component = require('./component');

class Listing extends Component {
  constructor(params={}) {
    this.render();
  }

  render() {
    this.el = html.div().class('listing');
  }

  update(model={}) {
    super.update(model);
  }

  generateBranch(item) {
    let el = html.element('ol');
    for (var i = 0; i < item.children.length; i++) {
      let child = item.children[i];
      let branch = this.generateBranch(child);
      el.appendChild(branch);
    }
    return el;
  }

  updateElements() {
    while (this.el.firstChild) this.el.removeChild(this.el.firstChild);
    if (this.model.items) {
      let items = this.model.items;
      for (var i = 0; i < items.length; i++) {
        let item = items[i];
        let branch = this.generateBranch(item);
        this.el.appendChild(branch);
      }
    }
  }
}

module.exports = Listing;
