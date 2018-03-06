const html = require('./html');
const Component = require('./component');
const RoomImage = require('./room_image');
const Scroller = require('./scroller');
const RoomObjects = require('./room_objects');


class RoomDetail extends Component {
  constructor() {
    super();

    this.el = html.div().class('room-detail-container').dom();

    let component = html.div()
      .attribute('class', 'room-detail')
    ;

    this.el.appendChild(component.dom());

    component.append(html.div().id('title').class('room-title'));
    component.append(html.div().id('dimensions'));

    component.append(html.div().style('height', '1rem'));

    this.roomImage = new RoomImage();
    component.append(this.roomImage.dom());

    component.append(html.div().style('height', '1rem'));

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
    // this.updateElements();
  }

  update(model={}) {
    super.update(model);
    this.roomImage.update({ image: this.model.image, width: this.model.width, height: this.model.height });
    // this.roomObjects.update({ objects: this.model.objects });
    this.render();
  }

  render() {
    let title = (this.model.id || '') + ' ' + (this.model.name || '');

    let titleEl = this.el.querySelector('#title');
    let dimensionsEl = this.el.querySelector('#dimensions');

    if (this.model.title !== undefined) {
      if (titleEl.firstChild) titleEl.removeChild(titleEl.firstChild);
      titleEl.appendChild(html.text(title).dom());
    }

    if (this.model.width !== undefined && this.model.height !== undefined) {
      if (dimensionsEl.firstChild) dimensionsEl.removeChild(dimensionsEl.firstChild);
      dimensionsEl.appendChild(html.text(this.model.width + 'x' + this.model.height).dom());
    }

    // if (!this.model.image) {
    //   this.roomImage.hide();
    // } else {
    //   this.roomImage.show();
    // }
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
    this.render();
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
