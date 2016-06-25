/**
 * Created by Hassan on 6/7/2016.
 */
var helperFn = {};

/**
 * Checks to see if element has the specified class name
 *
 * @param {element} DOM element to be tested
 * @param {string} Class name to test for
 * @returns {boolean} returns true or false whether the class name is in the element
 */
helperFn.hasClass = function (element, className) {
    return element.className && new RegExp("(^|\\s)" + className + "(\\s|$)").test(element.className);
};

/**
 * Adds class name to element
 *
 * @param {element} DOM element for class name to be added
 * @param {string} Class name to add
 */
helperFn.addClass = function (element, className) {
    if (element.className.indexOf(className) === -1) {
        if (element.className != '') {
            className = ' ' + className;
        }
        element.className += className;
    }
};

/**
 * Removes class name to element
 *
 * @param {element} DOM element for class name to be removed
 * @param {string} Class name to remove
 */
helperFn.removeClass = function (element, className) {
    if (element.className.indexOf(className) != -1) {
        var rxp = new RegExp('(\\s|^)' + className + '(\\s|$)');
        element.className = element.className.replace(rxp,' ').trim();
    }
};

/**
 * Normalize a selector string, a single DOM element or an array of elements into an array of DOM elements.
 *
 * @param {(string|element|array)} elements - Selector, DOM element or Array of DOM elements
 * @returns {array} Array of DOM elements
 */
helperFn.getElementList = function (elements) {
    if (typeof elements === 'string') {
        return Array.prototype.slice.call(document.querySelectorAll(elements));
    } else if (typeof elements === 'undefined' || elements instanceof Array) {
        return elements;
    } else {
        return [elements];
    }
};

// create DOM elements with attributes and content on-the-fly
helperFn.createNode = function (element) {

    var elemType = element.type,
        attributes = element.attr,
        innerContent = element.content,
        el = document.createElement(elemType);

    if (attributes) {
        Object.keys(attributes).forEach(function(attrName) {
            el.setAttribute(attrName, attributes[attrName]);
        });
    }

    if (innerContent) {
        innerContent.forEach(function(element) {
            if (typeof element === 'string') {
                el.appendChild(document.createTextNode(element));
            } else {
                el.appendChild(element);
            }
        });
    }

    return el;
};

helperFn.insertAfter = function(newNode, element) {
    var parentNode = element.parentNode;
    parentNode.insertBefore(newNode, element.nextSibling);
};

helperFn.html = function(element, content) {
    if (typeof content === 'string') {
        element.appendChild(document.createTextNode(content));
    } else {
        element.appendChild(content);
    }
};

helperFn.exists = function(selector) {
    return (document.querySelectorAll(selector).length > 0);
};

helperFn.removeNode = function(element) {
    element.parentNode.removeChild(element);
};

helperFn.removeElement = function(selector) {
    helperFn.getElementList(selector)
        .forEach(function(element) {
            helperFn.removeNode(element);
        });
};

/*
helperFn.once = function(callback) {
    if (typeof helperFn.once === 'function') {
        callback();
    } else {
        console.log('not a function');
    }
    helperFn.once = null;
};
*/

helperFn.once = function() {
    var arr = [];
    return function(callback, id) {
        if (arr.indexOf(id) < 0) {
            arr.push(id);
            callback();
        }
    }
};

helperFn.oncePerItem = function() {
    var arr = [];
    return function(id) {
        if (arr.indexOf(id) < 0) {
            arr.push(id);
            return true;
        } else {
            return false;
        }
    }
};

helperFn.hasValue = function(value) {
    return !(value.length === 0 || value.trim() == "" || value == null);
};







