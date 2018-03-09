const html = require('./html');
const Component = require('./component');
const RoomImage = require('./room_image');
const Scroller = require('./scroller');
const RoomObjects = require('./room_objects');


class RoomDetail extends Component {
  constructor() {
    super();

    this.el = html.div().class('room-detail-container').dom();

    this.roomDetailEl = html.div().class('room-detail').dom();

    this.roomDetailEl.appendChild(html.div().id('title').class('room-title').dom());
    this.roomDetailEl.appendChild(html.div().id('dimensions').dom());

    this.roomDetailEl.appendChild(html.div().style('height', '1rem').dom());

    this.roomImage = new RoomImage();
    this.roomDetailEl.appendChild(this.roomImage.dom());

    this.roomDetailEl.appendChild(html.div().style('height', '1rem').dom());

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

    this.roomDetailEl.appendChild(this.roomObjects.dom());

    this.el.appendChild(this.roomDetailEl);

    // this.roomDetailEl.style.visibility = 'hidden';
    this.hideDetail();
  }

  render() {
    if (this.model.id !== undefined) {
      let titleEl = this.el.querySelector('#title');
      if (titleEl.firstChild) titleEl.removeChild(titleEl.firstChild);
      let title = (this.model.id);
      if (this.model.name)
        title = this.model.name;
      titleEl.appendChild(html.text(title).dom());

      if (this.model.width !== undefined && this.model.height !== undefined) {
        let dimensionsEl = this.el.querySelector('#dimensions');
        if (dimensionsEl.firstChild) dimensionsEl.removeChild(dimensionsEl.firstChild);
        dimensionsEl.appendChild(html.text(this.model.width + 'x' + this.model.height).dom());
      }

      this.showDetail();
    }

  }

  update(model={}) {
    super.update(model);
    this.roomImage.update({ image: this.model.image, width: this.model.width, height: this.model.height });
    this.roomObjects.update({ objects: this.model.objects });
    this.render();
  }

  reset() {
    this.roomImage.reset();
    this.roomObjects.reset();
    // this.render();
  }

  adjust() {
    this.roomImage.adjust();
    this.roomObjects.adjust();
  }

  clear() {
    let titleEl = this.el.querySelector('#title');
    if (titleEl.firstChild) titleEl.removeChild(titleEl.firstChild);
    let dimensionsEl = this.el.querySelector('#dimensions');
    if (dimensionsEl.firstChild) dimensionsEl.removeChild(dimensionsEl.firstChild);
    this.roomImage.clear();
    this.roomObjects.clear();

    this.hideDetail();
  }

  toggleObject(ob) {
    let state = this.roomImage.toggleObject(ob);
    let el = document.getElementById('ob' + ob.number);
    if (el) {
      // el.style.background = state ? 'dodgerblue' : 'initial';
      state ? el.classList.add('selected') : el.classList.remove('selected');
    }
  }

  hideDetail() {
    this.roomDetailEl.style.visibility = 'hidden';
  }

  showDetail() {
    this.roomDetailEl.style.removeProperty('visibility');
  }
}

module.exports = RoomDetail;
