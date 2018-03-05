const html = require('./html');
const Component = require('./component');

class Sidebar extends Component {
  constructor(params={}) {
    super(params);
    this.selection = null;
    this.id = null;
    this.el = html.div().class('sidebar').dom();
  }

  update(model={}) {
    super.update(model);
    this.updateElements();
  }

  updateElements() {
    while (this.el.firstChild) this.el.removeChild(this.el.firstChild);
    let listEl = html.element('ol').class('sidebar-list').dom();
    for (var i = 0; i < this.model.items.length; i++) {
      let item = this.model.items[i];
      let el = html.element('li').id(item.id).class('sidebar-item').dom();
      el.appendChild(html.text(item.title).dom());
      el.onclick = (event) => {
        this.emit('select', event.target.id);
      };
      listEl.appendChild(el);
    }
    this.el.appendChild(listEl);
  }

  getActive() {
    return this.id;
  }

  setActive(id) {
    let el = this.el.querySelector('#' + id);
    if (el && this.selection !== el) {
      if (this.selection)
        this.selection.classList.remove('selected');
      el.classList.add('selected');
      this.selection = el;
      this.id = id;
    }
  }

}

module.exports = Sidebar;
