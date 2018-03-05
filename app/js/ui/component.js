
const { EventEmitter } = require('events');

class Component extends EventEmitter {
  constructor(params={}) {
    super();

    this.model = {};
    this.el = document.createElement('div');
  }

  render() {
  }

  update(model={}) {
    this.model = {};
    for (let name in model) {
      this.model[name] = model[name];
    }
  }

  addClass(name) {
    this.el.classList.add(name);
  }

  removeClass(name) {
    this.el.classList.remove(name);
  }

  dom() {
    return this.el;
  }

  hide() {
    this.el.style.setProperty('visibility', 'hidden');
  }

  show() {
    this.el.style.removeProperty('visibility');
  }

}

module.exports = Component;
