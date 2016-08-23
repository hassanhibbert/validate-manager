function helperUtils() {
  return {
    hasClass: function (element, className) {
      return element.className && new RegExp("(^|\\s)" + className + "(\\s|$)").test(element.className);
    },
    addClass: function (element, className) {
      if (element.className.indexOf(className) === -1) {
        if (element.className != '') {
          className = ' ' + className;
        }
        element.className += className;
      }
    },
    removeClass: function (element, className) {
      if (element.className.indexOf(className) != -1) {
        var rxp = new RegExp('(\\s|^)' + className + '(\\s|$)');
        element.className = element.className.replace(rxp, ' ').trim();
      }
    },
    getElementList: function (elements) {
      if (typeof elements === 'string') {
        return Array.prototype.slice.call(document.querySelectorAll(elements));
      } else if (typeof elements === 'undefined' || elements instanceof Array) {
        return elements;
      } else {
        return [elements];
      }
    },
    createNode: function (element) {

      var elemType = element.type,
          attributes = element.attr,
          innerContent = element.content,
          el = document.createElement(elemType);

      if (attributes) {
        Object.keys(attributes).forEach(function (attrName) {
          el.setAttribute(attrName, attributes[attrName]);
        });
      }

      if (innerContent) {
        innerContent.forEach(function (element) {
          if (typeof element === 'string') {
            el.appendChild(document.createTextNode(element));
          } else {
            el.appendChild(element);
          }
        });
      }

      return el;
    },
    insertAfter: function (newNode, element) {
      var parentNode = element.parentNode;
      parentNode.insertBefore(newNode, element.nextSibling);

    },
    html: function (element, content) {
      element.innerHTML = content;
    },
    exists: function (selector) {
      return (document.querySelectorAll(selector).length > 0);
    },
    removeNode: function (element) {
      element.parentNode.removeChild(element);
    },
    extend: function extend(source, properties) {
      var property;
      for (property in properties) {
        if (properties.hasOwnProperty(property)) {
          source[property] = properties[property];
        }
      }
      return source;
    },
    isBoolean: function (obj) {
      return typeof obj === 'boolean';
    },
    isRadioList: function (obj) {
      return Object.prototype.toString.call(obj) === '[object RadioNodeList]'
    },
    isObject: function (obj) {
      return Object.prototype.toString.call(obj) === '[object Object]'
    },
    isFunction: function (fn) {
      return typeof fn === 'function';
    }
  }
}