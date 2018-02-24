// const Graphics = require('../graphics');
// const Tools = require('../tools');
const html = require('./html');

const ScrollImage = require('./scroll_image');
const Scroller = require('./scroller');
const Component = require('./component');

class RoomDetail extends Component {
  constructor(params={}) {
    super(params);
    this.render();
  }

  renderObjects() {
    let component = html.div().attribute('id', 'objects').class('room-objects');

    for (var i = 0; i < this.model.objects.length; i++) {
      let ob = this.model.objects[i];
      let item = html.div()
        .attribute('class', 'room-object')
        .attribute('id', 'ob' + ob.number)
        // .style('width', 'auto')
        // .style('min-width', ob.width + 'px')
        // .style('max-width', 'auto')
        .append(
          html.div()
            .attribute('class', 'room-object-title')
            // .attribute('class', 'property-group')
            // .append(html.div().attribute('class', 'property-label').append(html.text('Number')))
            // .append(html.div().attribute('class', 'property-value').append(html.text(ob.number)))
            // .append(html.div().attribute('class', 'property-label').append(html.text('Name')))
            .append(html.div().append(html.text(ob.name ? ob.name : ob.number)))
            // .append(html.div().attribute('class', 'property-label').append(html.text('Location')))
            // .append(html.div().attribute('class', 'property-value').append(html.text(ob.x_pos + ', ' + ob.y_pos)))
            // .append(html.div().attribute('class', 'property-label').append(html.text('Dimensions')))
            // .append(html.div().attribute('class', 'property-value').append(html.text(ob.width + 'x' + ob.height)))
            // .append(html.div().attribute('class', 'property-value').append(html.text(ob.parentstate)))
            // .append(html.div().attribute('class', 'property-value').append(html.text(ob.parent)))
            // .append(html.div().attribute('class', 'property-value').append(html.text(ob.bytes)))
        )
        .append(html.div().attribute('class', 'room-object-image').append(ob.image))
        .on('pointerenter', (e) => {
          this.scrollImage.showObject(ob);
        })
        .on('pointerleave', (e) => {
          this.scrollImage.showObject(null);
        })
        .on('click', (e) => {
          this.toggleObject(ob);
        })
      ;
      component.append(item);
    }
    return component.dom();
  }

  render() {
    let component = html.div()
      .attribute('id', 'room-detail')
      .append(html.div().attribute('id', 'title').attribute('class', 'room-title'))
      .append(html.div().attribute('id', 'dimensions'))
    ;

    component.append(html.div().style('height', '16px'));

    this.scrollImage = new ScrollImage({ model: { image: this.model.image, width: this.model.width, height: this.model.height }});
    component.append(this.scrollImage.dom());

    if (this.model.objects.length) {
      component.append(html.div().style('height', '16px'));
      component.append(this.renderObjects());

      let objectsEl = component.dom().querySelector('#objects');
      this.scroller = new Scroller({ model: { component: objectsEl }});
      component.append(this.scroller.dom());

      // objectsEl.scrollLeft = 15;
    }

    this.el = component.dom();

    this.updateElements();
  }

  updateElements() {
    this.el.querySelector('#title').innerHTML = this.model.id + ' ' + (this.model.name || '');
    this.el.querySelector('#dimensions').innerHTML = this.model.width + 'x' + this.model.height;
    if (this.scroller) {
      this.scroller.update();
    }
    // this.scrollImage.update({ image: this.model.image, width: this.model.width, height: this.model.height });
  }

  update(props={}) {
    super.update(props);
    this.updateElements();
  }

  toggleObject(ob) {
    let state = this.scrollImage.toggleObject(ob);
    let el = document.getElementById('ob' + ob.number);
    if (el) {
      // el.style.background = state ? 'dodgerblue' : 'initial';
      state ? el.classList.add('selected') : el.classList.remove('selected');
    }
  }


}

module.exports = RoomDetail;
