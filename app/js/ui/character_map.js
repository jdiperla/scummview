const html = require('./html');
const Component = require('./component');

class CharacterMap extends Component {
  constructor(params={}) {
    super(params);
    this.render();
  }

  render() {
    let component = html.div()
      .attribute('class', 'character-map')
    ;
    this.el = component.dom();
    this.updateElements();
  }

  updateElements() {
    while (this.el.firstChild) this.el.removeChild(this.el.firstChild);
    
    if (this.model.characters) {
      for (var i = 0; i < this.model.characters.length; i++) {
        let ch = this.model.characters[i];
        if (ch.image) {
          this.el.appendChild(html.div().attribute('class', 'character-map-item').append(ch.image).dom());
        } else {
          this.el.appendChild(html.div().attribute('class', 'character-map-item').append(html.div().attribute('class', 'null-character')).dom());
        }
      }
    }
  }

  update(model={}) {
    super.update(model);
    this.updateElements();
  }
}

module.exports = CharacterMap;
