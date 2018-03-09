const html = require('./html');
const Component = require('./component');
const RoomImage = require('./room_image');
const Scroller = require('./scroller');
const RoomObjects = require('./room_objects');


class RoomDetail extends Component {
  constructor() {
    super();

    this.el = html.div().class('room-detail-container').dom();

    let componentEl = html.div().class('room-detail').dom();

    this.el.appendChild(componentEl);

    componentEl.appendChild(html.div().id('title').class('room-title').dom());
    componentEl.appendChild(html.div().id('dimensions').dom());

    componentEl.appendChild(html.div().style('height', '1rem').dom());

    this.roomImage = new RoomImage();
    componentEl.appendChild(this.roomImage.dom());

    componentEl.appendChild(html.div().style('height', '1rem').dom());

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

    componentEl.appendChild(this.roomObjects.dom());
  }

  render() {

    if (this.model.id !== undefined) {
      let titleEl = this.el.querySelector('#title');
      if (titleEl.firstChild) titleEl.removeChild(titleEl.firstChild);
      titleEl.appendChild(html.text((this.model.id || '') + ' ' + (this.model.name || '')).dom());
    }

    if (this.model.width !== undefined && this.model.height !== undefined) {
      let dimensionsEl = this.el.querySelector('#dimensions');
      if (dimensionsEl.firstChild) dimensionsEl.removeChild(dimensionsEl.firstChild);
      dimensionsEl.appendChild(html.text(this.model.width + 'x' + this.model.height).dom());
    }

    // if (!this.model.image) {
    //   this.roomImage.hide();
    // } else {
    //   this.roomImage.show();
    // }
  }

  update(model={}) {
    super.update(model);

    // if (this.model.image) {
    //   this.reset();
    // }

    this.roomImage.update({ image: this.model.image, width: this.model.width, height: this.model.height });
    this.roomObjects.update({ objects: this.model.objects });
    this.render();
  }

  reset() {
    let titleEl = this.el.querySelector('#title');
    if (titleEl.firstChild) titleEl.removeChild(titleEl.firstChild);
    let dimensionsEl = this.el.querySelector('#dimensions');
    if (dimensionsEl.firstChild) dimensionsEl.removeChild(dimensionsEl.firstChild);
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
