const Graphics = require('../graphics');
const html = require('../html');
const Tools = require('../tools');
const ScrollImage = require('./scroll_image');

class RoomDetail {
  constructor(model) {
    this.model = model;
  }

  renderImage() {
    let model = {
      image: this.model.image,
      width: this.model.width,
      height: this.model.height,
    };
    let scrollImage = new ScrollImage(model);
    this.scrollImage = scrollImage;
    return scrollImage.render();
  }

  renderObjects() {
    let component = html.div().attribute('id', 'room-objects');
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
      // let el = component.dom();
      // component.on('mousemove', (event) => {
      //   let x = event.pageX;
      //   let y = event.pageY;
      //   let rect = el.getBoundingClientRect();
      //   if (x > rect.left && x < rect.left + 32 && y > rect.top && y < rect.bottom) {
      //     console.log('<<');
      //     setInterval();
      //   } else if (x < rect.right && x > rect.right - 32 && y > rect.top && y < rect.bottom) {
      //     console.log('>>');
      //   } else {}
      //   // console.log(event.offsetX);
      //   // if (el.clientX)
      //   // el.scrollLeft += 10;
      //   // console.log('mouseover', event.clientX);
      // });
      component.append(item);
    }
    return component.dom();
  }

  toggleObject(ob) {
    let state = this.scrollImage.toggleObject(ob);
    let el = document.getElementById('ob' + ob.number);
    if (el) {
      // el.style.background = state ? 'dodgerblue' : 'initial';
      state ? el.classList.add('selected') : el.classList.remove('selected');
    }
  }

  render() {
    let component = html.div()
      .attribute('id', 'room-detail')
      .append(html.div().attribute('class', 'room-title').append(html.text(this.model.id + ' ' + (this.model.name || '') )))
      .append(html.div().append(html.text(this.model.width + 'x' + this.model.height)))
      .append(
        html.div()
          .attribute('id', 'room-properties')
          .append(
            html.div()
              .attribute('class', 'property-group')
              // .append(html.div().attribute('class', 'property-label').append(html.text('Description')))
              // .append(html.div().attribute('class', 'property-value').append(html.text(this.model.description)))
              // .append(html.div().attribute('class', 'property-label').append(html.text('Dimensions')))
              // .append(html.div().attribute('class', 'property-value').append(html.text(this.model.width + 'x' + this.model.height)))
              // .append(html.div().attribute('class', 'property-label').append(html.text('Objects')))
              // .append(html.div().attribute('class', 'property-value').append(html.text(this.model.objects.length)))
          )
          .append(html.div().style('flex', 'auto'))
      )
      // .append(html.div().attribute('id', 'room-image').append(this.model.image))
      // .append(this.renderObjects())
    ;

    component.append(html.div().style('height', '16px'));
    component.append(this.renderImage());
    if (this.model.objects.length) {
      component.append(html.div().style('height', '16px'));
      component.append(this.renderObjects());
    }

    return component.dom();
  }

  hide() {
    this.el.style.visibility = 'hidden';
  }

  show() {
    this.el.style.removeProperty('visibility');
  }

}

module.exports = RoomDetail;
