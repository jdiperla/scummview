const html = require('./html');
const Component = require('./component');

class Panes extends Component {
  constructor() {

  }

  render() {
    let component = html.div();

    this.component = component;
  }

  setPane(pane) {

  }
}

module.exports = Panes;
