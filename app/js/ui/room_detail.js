const html = require('./html');
const Component = require('./component');
const RoomImage = require('./room_image');
const Scroller = require('./scroller');
const RoomObjects = require('./room_objects');


class RoomDetail extends Component {
  constructor(params={}) {
    super(params);
    this.render();
  }

  render() {
    let container = html.div().class('room-detail-container');

    let component = html.div()
      .attribute('class', 'room-detail')
    ;

    container.append(component);

    component.append(html.div().attribute('id', 'title').attribute('class', 'room-title'))
    component.append(html.div().attribute('id', 'dimensions'))

    component.append(html.div().style('height', '1rem'));

    this.roomImage = new RoomImage();
    component.append(this.roomImage.dom());

    component.append(html.div().style('height', '1rem'));

    // if (this.model.objects)
      // component.append(html.div().class('heading3').append(html.text('Objects')));

    this.roomObjects = new RoomObjects();
    this.roomObjects.on('enter', (ob) => {
      this.roomImage.showObject(ob);
    });
    this.roomObjects.on('leave', (ob) => {
      this.roomImage.showObject(null);
    });
    this.roomObjects.on('toggle', (ob) => {
      this.toggleObject(ob);
    });
    component.append(this.roomObjects.dom());

    this.el = container.dom();
    this.updateElements();
  }

  updateElements() {
    let title = (this.model.id || '') + ' ' + (this.model.name || '');
    this.el.querySelector('#title').innerHTML = title;
    this.el.querySelector('#dimensions').innerHTML = this.model.width + 'x' + this.model.height;

    this.roomImage.update({ image: this.model.image, width: this.model.width, height: this.model.height });
    this.roomObjects.update({ objects: this.model.objects });

    if (!this.model.image) {
      this.roomImage.hide();
    } else {
      this.roomImage.show();
    }
  }

  update(model={}) {
    super.update(model);
    this.updateElements();
  }

  reset() {
    this.model = {
      id: null,
      name: null,
      image: null,
      width: null,
      height: null
    };
    this.roomImage.reset();
    this.roomObjects.reset();
    this.updateElements();
  }

  adjust() {
    this.roomImage.adjust();
    this.roomObjects.adjust();
  }

  toggleObject(ob) {
    let state = this.roomImage.toggleObject(ob);
    let el = document.getElementById('ob' + ob.number);
    if (el) {
      // el.style.background = state ? 'dodgerblue' : 'initial';
      state ? el.classList.add('selected') : el.classList.remove('selected');
    }
  }


}

module.exports = RoomDetail;
