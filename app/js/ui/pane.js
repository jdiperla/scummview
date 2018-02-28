const html = require('./html');
const Component = require('./component');
const Panel = require('./panel');
const TabGroup = require('./tab_group');

class Pane extends Component {
  constructor(params={}) {
    super(params);
    this.items = [];
    this.render();
  }

  updateElements() {
  }

  render() {
    this.tabs = new TabGroup();
    this.tabs.on('hit', (index) => {
      // console.log('hit', index);
      this.show(index);
    });
    this.panel = new Panel();

    let component = html.div().class('pane');
    this.el = component.dom();

    this.el.appendChild(this.tabs.dom());
    this.el.appendChild(this.panel.dom());

    this.updateElements();
  }

  add(params={}) {
    if (params.component) {
      this.items.push(params.component);
      this.tabs.addItem({ title: params.title });
    }
  }

  show(index) {
    if (index != this.index) {
      let item = this.items[index];
      this.panel.clear();
      this.panel.add(item);
      // console.log(item);
      this.tabs.setActive(index);
      this.index = index;
    }
  }

}

module.exports = Pane;
