function helperUtils() {
  var helperMethod = {};

  helperMethod.hasClass = function (element, className) {
    return element.className && new RegExp("(^|\\s)" + className + "(\\s|$)").test(element.className);
  };

  helperMethod.addClass = function (element, className) {
    if (element.className.indexOf(className) === -1) {
      if (element.className != '') {
        className = ' ' + className;
      }
      element.className += className;
    }
  };

  helperMethod.removeClass = function (element, className) {
    if (element.className.indexOf(className) != -1) {
      var rxp = new RegExp('(\\s|^)' + className + '(\\s|$)');
      element.className = element.className.replace(rxp, ' ').trim();
    }
  };

  helperMethod.getElementList = function (elements) {
    if (typeof elements === 'string') {
      return Array.prototype.slice.call(document.querySelectorAll(elements));
    } else if (typeof elements === 'undefined' || elements instanceof Array) {
      return elements;
    } else {
      return [elements];
    }
  };

  helperMethod.createNode = function (element) {
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
  };

  helperMethod.insertAfter = function (newNode, element) {
    var parentNode = element.parentNode;
    parentNode.insertBefore(newNode, element.nextSibling);
  };

  helperMethod.html = function (element, content) {
    element.innerHTML = content;
  };

  helperMethod.exists = function (selector) {
    return (document.querySelectorAll(selector).length > 0);
  };

  helperMethod.removeNode = function (element) {
    element.parentNode.removeChild(element);
  };

  helperMethod.extend = function extend(source, properties) {
    var property;
    for (property in properties) {
      if (properties.hasOwnProperty(property)) {
        source[property] = properties[property];
      }
    }
    return source;
  };

  helperMethod.isBoolean = function (obj) {
    return typeof obj === 'boolean';
  };

  helperMethod.isRadioList = function (obj) {
    return Object.prototype.toString.call(obj) === '[object RadioNodeList]'
  };

  helperMethod.isObject = function (obj) {
    return Object.prototype.toString.call(obj) === '[object Object]'
  };

  helperMethod.isFunction = function (fn) {
    return typeof fn === 'function';
  };

  return helperMethod;
}