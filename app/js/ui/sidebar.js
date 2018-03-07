const html = require('./html');
const Component = require('./component');

class Sidebar extends Component {
  constructor(params={}) {
    super(params);
    this.selection = null;
    this.id = null;

    this.el = html.div().class('sidebar').dom();
    this.imageEl = html.div().class('sidebar-image').dom();
    this.listEl = html.element('ol').class('sidebar-list').dom();

    this.el.appendChild(this.listEl);

    this.el.appendChild(this.imageEl);
  }

  update(model={}) {
    super.update(model);
    this.updateElements();
  }

  updateElements() {
    if (this.model.items) {
      while (this.listEl.firstChild) this.listEl.removeChild(this.listEl.firstChild);
      for (var i = 0; i < this.model.items.length; i++) {
        let item = this.model.items[i];
        let el = html.element('li').id(item.id).class('sidebar-item').dom();
        el.appendChild(html.text(item.title).dom());
        el.onclick = (event) => {
          this.emit('select', event.target.id);
        };
        this.listEl.appendChild(el);
      }
    }
    if (this.model.image) {
      // console.log(this.model.image);
      while (this.imageEl.firstChild) this.imageEl.removeChild(this.imageEl.firstChild);
      this.imageEl.appendChild(this.model.image);
    }
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
