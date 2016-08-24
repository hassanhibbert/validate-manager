function helperUtils() {
  var helperMethod = {};

  helperMethod.insertAfter = (newNode, element) => { element.parentNode.insertBefore(newNode, element.nextSibling) };
  helperMethod.html = (element, content) => { element.innerHTML = content };
  helperMethod.removeNode = (element) => { element.parentNode.removeChild(element) };
  helperMethod.exists = (selector) => document.querySelectorAll(selector).length > 0;
  helperMethod.isBoolean = (obj) => Object.prototype.toString.call(obj) === '[object Boolean]';
  helperMethod.isRadioList = (obj) => Object.prototype.toString.call(obj) === '[object RadioNodeList]';
  helperMethod.isObject = (obj) => Object.prototype.toString.call(obj) === '[object Object]';
  helperMethod.isFunction = (obj) => Object.prototype.toString.call(obj) === '[object Function]';

  helperMethod.createNode = (element) => {
    var elemType = element.type,
        attributes = element.attr,
        innerContent = element.content,
        el = document.createElement(elemType);

    if (attributes) {
      Object.keys(attributes).forEach((attrName) => {
        el.setAttribute(attrName, attributes[attrName]);
      });
    }

    if (innerContent) {
      innerContent.forEach((element) => {
        if (typeof element === 'string') {
          el.appendChild(document.createTextNode(element));
        } else {
          el.appendChild(element);
        }
      });
    }
    return el;
  };

  helperMethod.extend = (source, properties) => {
    var property;
    for (property in properties) {
      if (properties.hasOwnProperty(property)) {
        source[property] = properties[property];
      }
    }
    return source;
  };

  return helperMethod;
}