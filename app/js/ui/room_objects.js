const html = require('./html');
const Component = require('./component');
const ScrollPane = require('./scroll_pane');

class RoomObjects extends Component {
  constructor(params={}) {
    super(params);
    // this.render();

    this.el = html.div().class('room-objects-container').dom();

    this.scrollPane = new ScrollPane({ orientation: 'horizontal' });
    // container.append(html.div().class('heading3').append(html.text('Objects')));

    let objects = html.div().id('objects').class('room-objects');
    // this.el.appendChild(objects.dom());

    this.scrollPane.update({ component: objects.dom() });

    // this.scroller = new Scroller({ orientation: 'horizontal' });
    // this.scroller.update({ component: objects.dom() });
    this.el.appendChild(this.scrollPane.dom());
  }

  render() {
    if (this.model.objects && this.model.objects.length) {
      let objectsEl = this.el.querySelector('#objects');

      while (objectsEl.firstChild) objectsEl.removeChild(objectsEl.firstChild);

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
        objectsEl.appendChild(item.dom());
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
    // this.scroller.adjust();
    this.scrollPane.adjust();
  }

  reset() {
    // this.scroller.reset();
    this.scrollPane.reset();
  }
}

module.exports = RoomObjects;
