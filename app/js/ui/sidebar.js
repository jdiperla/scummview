const html = require('./html');
const Component = require('./component');

class Sidebar extends Component {
  constructor(params={}) {
    super(params);
    this.selection = null;
    this.render();
  }

  render() {
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
      let el = html.element('li').dataset('id', item.id).class('sidebar-item').dom();
      el.appendChild(html.text(item.title).dom());
      el.onclick = (e) => {
        let el = e.target;
        let id = el.dataset.id;
        if (this.selection !== el) {
          if (this.selection !== null)
            this.selection.classList.remove('selected');
          el.classList.add('selected');
          this.selection = el;
        }
        this.emit('select', id);
      };
      listEl.appendChild(el);
    }
    this.el.appendChild(listEl);
    // console.log('update');
  }

}

module.exports = Sidebar;
