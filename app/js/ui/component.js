
const { EventEmitter } = require('events');

class Component extends EventEmitter {
  constructor(params={}) {
    super();

    this.model = {};

    this.el = params.el || document.createElement('div');
    params.id ? this.el.id = params.id : null;

    for (let name in params.model) {
      this.model[name] = params.model[name];
    }
  }

  render() {}

  update(model={}) {
    for (let name in model) {
      this.model[name] = model[name];
    }
  }

  addClass(name) {
    this.el.classList.add(name);
  }

  dom() {
    return this.el;
  }

  hide() {
    this.el.style.setProperty('visibility', 'hidden');
    // console.log(this.el, 'hidden');
  }

  show() {
    this.el.style.removeProperty('visibility');
  }

}

module.exports = Component;
