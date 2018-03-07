const html = require('./html');
const Component = require('./component');

class Game extends Component {
  constructor() {
    super();

    this.el = html.div().class('game').dom();
    this.el.appendChild(html.div().id('title').dom());
    this.el.appendChild(html.div().id('version').dom());
  }

  update(model={}) {
    super.update(model);

    if (this.model.title) {
      let title = this.el.querySelector('#title');
      if (title.firstChild) title.removeChild(title.firstChild);
      this.el.querySelector('#title').appendChild(html.text(this.model.title).dom());
    }
    if (this.model.version) {
      let version = this.el.querySelector('#version');
      if (version.firstChild) version.removeChild(version.firstChild);
      version.appendChild(html.text(this.model.version).dom());
    }
  }

}

module.exports = Game;
