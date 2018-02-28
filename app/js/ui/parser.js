const Component = require('./component');
const Pane = require('./pane');

class Parser {
  constructor() {
    this.tree = [];
  }

  parse(node) {
    let children = node.childNodes;
    for (var i = 0; i < children.length; i++) {
      let child = children[i];
      if (child.nodeName == 'A-PANE') {
        console.log(child.nodeName);
      }
    }
  }
}

module.exports = Parser;
