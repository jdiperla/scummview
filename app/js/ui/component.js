
const { EventEmitter } = require('events');

class Component extends EventEmitter {
  constructor(params={}) {
    super();
    this.model = {};
    this.el = params.el || document.createElement('div');
    // this.update(params.props);
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

  dom() {
    return this.el;
  }

}

module.exports = Component;
