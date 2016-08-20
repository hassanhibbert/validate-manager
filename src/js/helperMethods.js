function helperUtils() {
    return {
        /**
         * Checks to see if element has the specified class name
         *
         * @param {element} DOM element to be tested
         * @param {string} Class name to test for
         * @returns {boolean} returns true or false whether the class name is in the element
         */
        hasClass: function (element, className) {
            return element.className && new RegExp("(^|\\s)" + className + "(\\s|$)").test(element.className);
        },
        /**
         * Adds class name to element
         *
         * @param {element} DOM element for class name to be added
         * @param {string} Class name to add
         */
        addClass: function (element, className) {
            if (element.className.indexOf(className) === -1) {
                if (element.className != '') {
                    className = ' ' + className;
                }
                element.className += className;
            }
        }, /**
         * Removes class name to element
         *
         * @param {element} DOM element for class name to be removed
         * @param {string} Class name to remove
         */
        removeClass: function (element, className) {
            if (element.className.indexOf(className) != -1) {
                var rxp = new RegExp('(\\s|^)' + className + '(\\s|$)');
                element.className = element.className.replace(rxp, ' ').trim();
            }
        },
        /**
         * Normalize a selector string, a single DOM element or an array of elements into an array of DOM elements.
         *
         * @param {(string|element|array)} elements - Selector, DOM element or Array of DOM elements
         * @returns {array} Array of DOM elements
         */
        getElementList: function (elements) {
            if (typeof elements === 'string') {
                return Array.prototype.slice.call(document.querySelectorAll(elements));
            } else if (typeof elements === 'undefined' || elements instanceof Array) {
                return elements;
            } else {
                return [elements];
            }
        },
        // create DOM elements with attributes and content on-the-fly
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
        removeElement: function (selector) {
            helperFn.getElementList(selector)
              .forEach(function (element) {
                  helperFn.removeNode(element);
              });
        },
        once: function () {
            var arr = [];
            return function (callback, id) {
                if (arr.indexOf(id) < 0) {
                    arr.push(id);
                    callback();
                }
            }
        },
        oncePerItem: function () {
            var arr = [];
            return function (id) {
                if (arr.indexOf(id) < 0) {
                    arr.push(id);
                    return true;
                } else {
                    return false;
                }
            }
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
        hasValue: function(value) {
            return !(value.length === 0 || value.trim() == "" || value == null);
        },
        isNumber: function(n) {
            return !isNaN(parseFloat(n)) && isFinite(n);
        },
        isAlpha: function(value) {
            var regExNumber = /[0-9]+/;
            return !(regExNumber.test(value));
        },
        maxLength: function(value) {
            return (value.currLength <= value.maxLength);
        },
        minLength: function(value) {
            return (value.currLength >= value.minLength);
        },
        equalTo: function(value) {
            var element = document.querySelector(value.selector);
            return (value.currValue === element.value);
        },
        email: function(email) {
            var emailRegEx = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return emailRegEx.test(email);
        },
        radio: function(radioNodeList) {
            for (var i = 0; i < radioNodeList.length; ++ i) {
                if (radioNodeList[i].checked) {
                    return true;
                }
            }
            return false;
        }
    }
}