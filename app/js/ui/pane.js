const html = require('./html');
const Component = require('./component');
const Panel = require('./panel');
const TabGroup = require('./tab_group');

class Pane extends Component {
  constructor(params={}) {
    super(params);
    this.items = [];
    // this.index = -1;
    this.render();
  }

  render() {
    // this.tabs = new TabGroup();
    // this.tabs.on('hit', (index) => {
    //   this.show(index);
    // });
    // this.panel = new Panel();
    //
    // let component = html.div().class('pane');
    // this.el = component.dom();
    //
    // this.el.appendChild(this.tabs.dom());
    // this.el.appendChild(this.panel.dom());

    this.el = html.div().class('pane').dom();
  }

  update(model={}) {
    super.update(model);
    this.updateElements();
  }

  updateElements() {
  }

  add(params={}) {
    if (params.component) {
      let component = params.component;
      this.items.push(component);
      this.el.appendChild(component.dom());
      // this.tabs.addItem({ title: params.title });
    }
  }

  adjust() {

  }

  clear() {
    // this.panel.clear();
    // this.tabs.clear();
    // this.items = [];
    // this.index = -1;
  }

  show(index) {
    // if (index != this.index) {
    //   let item = this.items[index];
    //   this.panel.clear();
    //   this.panel.add(item);
    //
    //   this.tabs.setActive(index);
    //   this.index = index;
    // }
  }

}

module.exports = Pane;
