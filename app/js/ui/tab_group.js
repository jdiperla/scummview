const html = require('./html');
const Component = require('./component');
const Tab = require('./tab');

class TabGroup extends Component {
  constructor(params={}) {
    super(params);
    this.tabs = [];
    this.render();
  }

  updateElements() {
  }

  render() {
    let component = html.div().class('tab-group');
    this.el = component.dom();
    this.updateElements();
  }

  addItem(params={}) {
    let tab = new Tab({ index: this.tabs.length, title: params.title });
    tab.on('hit', (index) => {
      this.emit('hit', index);
    });
    this.tabs.push(tab);
    this.el.appendChild(tab.dom());
  }

  setActive(index) {
    if (index !== this.index) {
      if (this.index !== undefined) {
        this.tabs[this.index].dom().classList.remove('active');
      }
      if (this.tabs[index]) {
        this.tabs[index].dom().classList.add('active');
      }
      this.index = index;
    }
  }
}

module.exports = TabGroup;
