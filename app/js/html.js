
class Html {
  constructor(el) {
    this.el = el;
  }

  dom() {
    return this.el;
  }

  class(name) {
    this.el.classList.add(name);
    return this;
  }

  on(e, callback) {
    this.el.addEventListener(e, callback);
    return this;
  }

  dataset(prop, value) {
    this.el.dataset[prop] = value;
    return this;
  }

  attribute(name, value) {
    // this.el[attr] = value;
    // this.el.attributes[attr] = value;
    this.el.setAttribute(name, value);
    return this;
  }

  style(name, value) {
    this.el.style[name] = value;
    return this;
  }

  append(el) {
    if (el instanceof Html) {
      this.el.appendChild(el.el);
    } else if (el instanceof Node) {
      this.el.appendChild(el);
    }
    return this;
  }

  static div(style) {
    let el = document.createElement('div');
    if (style instanceof Object) {
      for (let property in style) el.style[property] = style[property];
    }
    // if (child) el.appendChild(child);
    return new Html(el);
  }

  static text(value) {
    if (value == undefined)
      return new Html(document.createTextNode(''));
    else
      return new Html(document.createTextNode(value));
  }
}

module.exports = Html;
