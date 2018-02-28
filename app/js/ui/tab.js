const html = require('./html');
const Component = require('./component');

class Tab extends Component {
  constructor(params={}) {
    super(params);
    this.model.index = params.index;
    this.model.title = params.title || '';
    this.render();
  }

  updateElements() {
    this.el.dataset.index = this.model.index;
    this.el.innerHTML = this.model.title;
  }

  render() {
    let component = html.div().class('tab');
    this.el = component.dom();
    this.el.onmousedown = (event) => {
      this.emit('hit', event.target.dataset.index);
    };
    this.updateElements();
  }

  update(model={}) {
    super.update(model);
    this.updateElements();
  }
}

module.exports = Tab;
