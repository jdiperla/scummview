const html = require('./html');
const Component = require('./component');
const Scroller = require('./scroller');

class RoomObjects extends Component {
  constructor(params={}) {
    super(params);
    // this.render();
    this.el = html.div().class('room-objects-container').dom();

    // container.append(html.div().class('heading3').append(html.text('Objects')));

    let objects = html.div().attribute('id', 'objects').class('room-objects');
    this.el.appendChild(objects.dom());

    // this.scroller = new Scroller({ orientation: 'horizontal' });
    // this.scroller.update({ component: objects.dom() });
    // this.el.appendChild(this.scroller.dom());
  }

  render() {
    if (this.model.objects && this.model.objects.length) {
      let objectsEl = this.el.querySelector('#objects');

      while (objectsEl.firstChild) objectsEl.removeChild(objectsEl.firstChild);

      for (var i = 0; i < this.model.objects.length; i++) {
        let ob = this.model.objects[i];
        let item = html.div()
          .attribute('class', 'room-object')
          .attribute('id', 'ob' + ob.number)
          .append(html.div().attribute('class', 'room-object-image').append(ob.image))
          .append(
            html.div()
              .attribute('class', 'room-object-title')
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

      // this.scroller.update();
      // this.scroller.reset();
      this.show();
    } else {
      this.hide();
    }
  }

  // update(model={}) {
  //   super.update(model);
  //   this.updateElements();
  // }

  adjust() {
    // this.scroller.adjust();
  }

  reset() {
    // this.scroller.reset();
  }
}

module.exports = RoomObjects;
