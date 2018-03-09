const html = require('./html');
const Component = require('./component');
const ScrollPane = require('./scroll_pane');

class RoomObjects extends Component {
  constructor(params={}) {
    super(params);

    this.el = html.div().class('room-objects-container').dom();

    this.scrollPane = new ScrollPane({ orientation: 'horizontal' });

    this.objectsEl = html.div().id('objects').class('room-objects').dom();

    this.scrollPane.update({ component: this.objectsEl });

    this.el.appendChild(this.scrollPane.dom());
  }

  render() {
    if (this.model.objects && this.model.objects.length) {
      this.clear();
      for (var i = 0; i < this.model.objects.length; i++) {
        let ob = this.model.objects[i];
        let item = html.div()
          .class('room-object')
          .id('ob' + ob.number)
          .append(html.div().class('room-object-image').append(ob.image))
          .append(
            html.div()
              .class('room-object-title')
              .append(html.div().append(html.text(ob.name ? ob.name : ob.number)))
          )
          .on('pointerenter', (e) => {
            // e.target.style.background = 'yellow';
            this.emit('enter', ob);
          })
          .on('pointerleave', (e) => {
            // e.target.style.background = 'initial';
            this.emit('leave', ob);
          })
          .on('click', (e) => {
            this.emit('toggle', ob);
          })
        ;
        this.objectsEl.appendChild(item.dom());
      }

      this.show();
    } else {
      this.hide();
    }
  }

  update(model={}) {
    super.update(model);
    if (this.model.objects) {
      this.reset();
    }
    this.render();
    this.scrollPane.update();
  }

  adjust() {
    this.scrollPane.adjust();
  }

  reset() {
    this.scrollPane.reset();
  }

  clear() {
    while (this.objectsEl.firstChild) this.objectsEl.removeChild(this.objectsEl.firstChild);
  }
}

module.exports = RoomObjects;
