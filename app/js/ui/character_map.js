const html = require('./html');
const Component = require('./component');
const Pane = require('./pane');

class CharacterMap extends Component {
  constructor(params={}) {
    super(params);
    this.render();
  }

  render() {
    this.pane = new Pane();
    // let component
    // ui.pane.add({ component: ui.roomContent, title: 'Rooms' });
    // ui.pane.add({ component: ui.characterMap, title: 'Charsets' });
    // ui.pane.show(0);
    // let component = html.div()
    //   .attribute('class', 'character-map')
    // ;
    // this.el = component.dom();
    this.el = this.pane.dom();
    this.updateElements();
  }

  updateElements() {
    this.pane.clear();
    if (this.model.charsets) {
      for (var i = 0; i < this.model.charsets.length; i++) {
        let charset = this.model.charsets[i];
        let component = html.div().class('character-map');
        for (var j = 0; j < charset.characters.length; j++) {
          let ch = charset.characters[j]
          let item = html.div().class('character-map-item');
          if (ch.image) {
            item.append(ch.image);
          } else {
            // this.el.appendChild(html.div().attribute('class', 'character-map-item').append(html.div().attribute('class', 'null-character')).dom());
            item.append(html.div().class('null-character'));
          }
          component.append(item);
        }
        let container = html.div().class('character-map-container');
        container.append(component);
        this.pane.add({ component: container, title: 'CH' + i });
      }
      this.pane.show(0);
    }

    // while (this.el.firstChild) this.el.removeChild(this.el.firstChild);
    // if (this.model.characters) {
    //   for (var i = 0; i < this.model.characters.length; i++) {
    //     let ch = this.model.characters[i];
    //     if (ch.image) {
    //       this.el.appendChild(html.div().attribute('class', 'character-map-item').append(ch.image).dom());
    //     } else {
    //       this.el.appendChild(html.div().attribute('class', 'character-map-item').append(html.div().attribute('class', 'null-character')).dom());
    //     }
    //   }
    // }
  }

  update(model={}) {
    super.update(model);
    this.updateElements();
  }

  clear() {
    this.pane.clear();
  }
}

module.exports = CharacterMap;
