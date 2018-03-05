const html = require('./html');
const Component = require('./component');

class Game extends Component {
  constructor() {
    super();

    this.el = html.div().dom();
    this.el.appendChild(html.div().id('title').dom());
    this.el.appendChild(html.div().id('version').dom());
  }

  render() {
    console.log('Game.render');
    this.el.querySelector('#title').appendChild(html.text(this.model.title).dom());
    this.el.querySelector('#version').appendChild(html.text(this.model.version).dom());
    // this.el.appendChild(html.div().append(html.text(this.model.version)).dom());
  }

}

module.exports = Game;
