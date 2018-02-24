const html = require('./html');

class CharacterMap {
  constructor(model) {
    this.model = model;
  }

  render() {
    let component = html.div()
      .attribute('class', 'character-map')
    ;
    for (var i = 0; i < this.model.characters.length; i++) {
      let ch = this.model.characters[i];
      if (ch.image) {
        component.append(html.div().attribute('class', 'character-map-item').append(ch.image));
      } else {
        component.append(html.div().attribute('class', 'character-map-item').append(html.div().attribute('class', 'null-character')));
      }
    }
    return component.dom();
  }
}

module.exports = CharacterMap;
