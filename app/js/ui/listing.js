const html = require('./html');
const Component = require('./component');

class Listing extends Component {
  constructor(params={}) {
    super(params);
    this.render();
  }

  render() {
    this.el = html.div().class('listing').dom();
  }

  update(model={}) {
    super.update(model);
    this.updateElements();
  }

  generateBranch(item, root=false) {
    let el;
    if (item.children) {
      el = html.element('li').class(root ? 'listing-root' : 'listing-item').dom();
      el.appendChild(html.div().append(html.text(item.title)).dom());

      let ul = html.element('ul').class('listing-list').dom();

      for (var i = 0; i < item.children.length; i++) {
        let child = item.children[i];
        let branch = this.generateBranch(child);
        ul.appendChild(branch);
      }

      el.appendChild(ul);
    } else {
      el = html.element('li').class('listing-item').dom();
      el.appendChild(html.div().append(html.text(item.title)).dom());
    }
    return el;
  }

  updateElements() {
    while (this.el.firstChild) this.el.removeChild(this.el.firstChild);
    if (this.model.root) {
      let item = this.model.root;
      // console.log(this.model.root);
      // let el = html.element('ul').class('listing-list').dom();
      // el.appendChild(html.text(item.title).dom());
      let ul = html.element('ul').class('listing-list').dom();
      let branchEl = this.generateBranch(item, true);
      ul.appendChild(branchEl);
      // el.appendChild(branchEl);
      this.el.appendChild(ul);
    }
  }
}

module.exports = Listing;
