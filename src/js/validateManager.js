var validateManager = function validateManager(configObject) {
  'use strict';

  var utils = helperUtils(),
      formElement = document.forms[configObject.formName],
      formData = {
        validateObjects: null,
        errorQueue: [],
        successQueue: []
      },
      publicAPI = {
        validate: validate
      };

  return publicAPI;

  //:::::::::::::::::::::::://
  //:::: HELPER UTILITY :::://
  //:::::::::::::::::::::::://

  function helperUtils(){return{hasClass:function(a,b){return a.className&&new RegExp("(^|\\s)"+b+"(\\s|$)").test(a.className)},addClass:function(a,b){-1===a.className.indexOf(b)&&(""!=a.className&&(b=" "+b),a.className+=b)},removeClass:function(a,b){if(-1!=a.className.indexOf(b)){var c=new RegExp("(\\s|^)"+b+"(\\s|$)");a.className=a.className.replace(c," ").trim()}},getElementList:function(a){return"string"==typeof a?Array.prototype.slice.call(document.querySelectorAll(a)):"undefined"==typeof a||a instanceof Array?a:[a]},createNode:function(a){var b=a.type,c=a.attr,d=a.content,e=document.createElement(b);return c&&Object.keys(c).forEach(function(a){e.setAttribute(a,c[a])}),d&&d.forEach(function(a){"string"==typeof a?e.appendChild(document.createTextNode(a)):e.appendChild(a)}),e},insertAfter:function(a,b){var c=b.parentNode;c.insertBefore(a,b.nextSibling)},html:function(a,b){a.innerHTML=b},exists:function(a){return document.querySelectorAll(a).length>0},removeNode:function(a){a.parentNode.removeChild(a)},removeElement:function(a){helperFn.getElementList(a).forEach(function(a){helperFn.removeNode(a)})},once:function(){var a=[];return function(b,c){a.indexOf(c)<0&&(a.push(c),b())}},oncePerItem:function(){var a=[];return function(b){return a.indexOf(b)<0?(a.push(b),!0):!1}},extend:function(a,b){var c;for(c in b)b.hasOwnProperty(c)&&(a[c]=b[c]);return a},hasValue:function(a){return!(0===a.length||""==a.trim()||null==a)},isNumber:function(a){return!isNaN(parseFloat(a))&&isFinite(a)},isAlpha:function(a){var b=/[0-9]+/;return!b.test(a)},maxLength:function(a){return a.currLength<=a.maxLength},minLength:function(a){return a.currLength>=a.minLength},equalTo:function(a){var b=document.querySelector(a.selector);return a.currValue===b.value},email:function(a){var b=/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;return b.test(a)},radio:function(a){for(var b=0;b<a.length;++b)if(a[b].checked)return!0;return!1}}}

  //::::::::::::::::::::::::::://

  function validate(...validationObjects) {
    var validateObjWithId;

    // setup validation objects, and placeholders for errors
    validateObjWithId = createIdForEach(validationObjects);
    formData.validateObjects = addDomElementsForEach(validateObjWithId);
    createErrorPlaceholders(formData.validateObjects);

    // initialize form and set listeners
    init();
  }

  function init() {
    formElement.addEventListener('change', onChangeHandler, false);
  }

  function onChangeHandler(event) {
    event.preventDefault();
    //validateCurrentInput(evt.target);
    //updateSubmitButton();
  }

  function createIdForEach(validateObjects) {
    var validateObjectsCopy = [...validateObjects],
        validateObjectsWithId = validateObjectsCopy.map((validateObject, index) => {
          return utils.extend(validateObject, { id: index });
        });
    return validateObjectsWithId;
  }

  function addDomElementsForEach(validateObjects) {
    var validateObjectsCopy = [...validateObjects],
        validateObjectsWithElement = validateObjectsCopy.map((validateObject) => {
          return utils.extend(validateObject, { input: formElement[validateObject.input] });
        });
    return validateObjectsWithElement;
  }

  function getRequiredFields() {
        return formData.validateObjects.filter(function(validateObject) {
            return (validateObject.required);
        });
    }

  function getRequiredFieldsCompleted() {
    return getRequiredFields().filter(function (validateObject) {
      return (utils.hasValue(validateObject.input.value));
    });
  }

  function isRequiredFieldsCompleted() {
    return (getRequiredFieldsCompleted().length === getRequiredFields().length);
  }

  function createErrorPlaceholders(validateObjects) {
    var errorMessageDiv,
        lastRadioButton,
        domElementSetup;

    validateObjects.forEach((validateObject) => {
      domElementSetup = {
        type: 'div',
        attr: {
          'class': 'error-message',
          'id': 'error-mgn-' + validateObject.id,
          'style': 'display:none'
        }
      };

      // create error message div
      errorMessageDiv = utils.createNode(domElementSetup);

      if (validateObject.rules && validateObject.rules.radio) {
        lastRadioButton = [...validateObject.input].reverse()[0]; // convert node list to array then get last item
        utils.insertAfter(errorMessageDiv, lastRadioButton);
      } else {
        utils.insertAfter(errorMessageDiv, validateObject.input);
      }

    });
 }


};
// var validateManager = (function() {
//     "use strict";
//
//     var options,
//         errorMessageDiv,
//         formElement,
//         submitButton,
//         tabOnce,
//         validationMethods = {},
//         helperFn = {},
//
//         // Default options
//         defaults = {
//             formId: null,
//             successCallback: null,
//             resetFormOnSubmit: true,
//             validateOnKeyUp: false
//         },
//
//         // Set unique id
//         uniqueId = {
//             id: 0,
//             createNewId: function() {
//                 return this.id += 1;
//             }
//         },
//
//         // Collection of form values
//         formData = {
//             successValues: [],
//             collection: [],
//             errorMessage: []
//         },
//
//         publicAPI = {
//             config: config,
//             init: init,
//             extend: extend,
//             method: validationMethods,
//             helperFn: helperFn
//         };
//
//     return publicAPI;
//
//     //::::::::::::::::::::::::::::::://
//     //:::: Initialize and config :::://
//     //::::::::::::::::::::::::::::::://
//
//     function init(obj) {
//
//         // Extend defaults and assign it to options
//         if (obj && typeof obj === "object") {
//             options = extend(defaults, obj);
//         }
//
//         // Get form DOM elements
//         formElement = helperFn.getElementList(options.formId)[0];
//         submitButton = helperFn.getElementList(options.submitButton)[0];
//
//         // Event listeners to handle form validation
//         if (options.validateOnKeyUp) {
//             tabOnce = helperFn.oncePerItem();
//             formElement.addEventListener('keyup', onKeyUpHandler, false);
//         }
//
//         formElement.addEventListener('change', onChangeHandler, false);
//         formElement.addEventListener('submit', onSubmitHandler, false);
//         submitButton.disabled = true;
//
//         formData.collection.forEach(mergeInputElements);
//         formData.collection.forEach(createErrorPlaceholders);
//     }
//
//     // Updates the 'formData.collection' array with validation objects
//     function config(data) {
//         data.forEach(function(obj) {
//             if (obj.rules) {
//                 createMultiValidationObjects(obj);
//             } else {
//                 formData.collection.push(obj);
//             }
//         });
//     }
//
//     //:::::::::::::::::::::::://
//     //:::: Event Handlers :::://
//     //:::::::::::::::::::::::://
//
//     function onSubmitHandler(evt) {
//         evt.preventDefault();
//         if (isRequiredFieldsCompleted() && formData.errorMessage.length === 0) {
//             populateValues(function(successValues) {
//                 options.successCallback(successValues);
//                 submitButton.disabled = true;
//                 formData.successValues = [];
//                 if (options.resetFormOnSubmit) {
//                     formElement.reset();
//                 }
//             });
//         }
//     }
//
//     function onKeyUpHandler(evt) {
//         evt.preventDefault();
//         var keyCode = evt.keyCode || evt.which;
//
//         // skip validation on initial tab key press for each form field
//         if (tabOnce(evt.target.id) && keyCode === 9) {
//             return;
//         }
//
//         validateCurrentInput(evt.target);
//         updateSubmitButton();
//     }
//
//     function onChangeHandler(evt) {
//         evt.preventDefault();
//         validateCurrentInput(evt.target);
//         updateSubmitButton();
//     }
//
//     // Replace the input selector with an actual DOM element
//     function mergeInputElements(obj) {
//             var inputElement = (obj.name)
//                 ? document.forms[formElement.id][obj.name]
//                 : helperFn.getElementList(obj.input)[0];
//             extend(obj, { input: inputElement, id: uniqueId.createNewId() });
//     }
//
//     function createErrorPlaceholders(inputObject) {
//         errorMessageDiv = helperFn.createNode({
//             type: 'div',
//             attr: {'class': 'error-message', 'id': 'error-mgn-' + inputObject.id, 'style': 'display:none'}
//         });
//
//         if (Object.prototype.toString.call(inputObject.input) === '[object RadioNodeList]') {
//             var lastElementPosition = inputObject.input.length;
//             helperFn.insertAfter(errorMessageDiv, inputObject.input[lastElementPosition - 1]);
//         } else {
//             helperFn.insertAfter(errorMessageDiv, inputObject.input);
//         }
//     }
//
//     // extends an object with new properties
//     function extend(source, properties) {
//         var property;
//         for (property in properties) {
//             if (properties.hasOwnProperty(property)) {
//                 source[property] = properties[property];
//             }
//         }
//         return source;
//     }
//
//     // returns an array of objects that's required
//     function getRequiredFields() {
//         return formData.collection.filter(function(inputObject) {
//             return (inputObject.required);
//         });
//     }
//
//     // returns an array of required objects that has been filled out
//     function getRequiredFieldsCompleted() {
//         return getRequiredFields().filter(function(inputObject) {
//             return (helperFn.hasValue(inputObject.input.value));
//         });
//     }
//
//     // verify if required fields are filled out
//     function isRequiredFieldsCompleted() {
//         return (getRequiredFieldsCompleted().length === getRequiredFields().length);
//     }
//
//     // Enable submit button if required fields are filled out and there are no errors.
//     function updateSubmitButton() {
//         submitButton.disabled = (isRequiredFieldsCompleted() && formData.errorMessage.length === 0) ? false : true;
//     }
//
//     // Populate 'formData.successValues' with input values that has been validated then invoke the callback function
//     function populateValues(callback) {
//         var currentInputId = '';
//         formData.collection.forEach(function(inputObject) {
//             if (currentInputId != inputObject.input.id) {
//                 formData.successValues.push({
//                     id: inputObject.input.id || inputObject.name,
//                     value: inputObject.input.value
//                 });
//                 currentInputId = inputObject.input.id;
//             }
//         });
//         callback(formData.successValues);
//     }
//
//     // Returns an array of validation objects that matches the input id provided
//     function inputLookUp(id) {
//         return formData.collection.filter(function(obj) {
//             return (obj.input.id == id);
//         });
//     }
//
//     function nameLookUp(name) {
//         return formData.collection.filter(function(obj) {
//             return (obj.name == name);
//         })
//     }
//
//     // Validates the current input that matches the provided id
//     function validateCurrentInput(element) {
//         var inputObj = (element.getAttribute('type') === 'radio')
//             ? nameLookUp(element.name)
//             : inputLookUp(element.id);
//
//         if (inputObj.length > 1) {
//             inputObj.forEach(function(currInputObj) {
//
//                 validateInput(currInputObj);
//             });
//         } else {
//             validateInput(inputObj[0]);
//         }
//     }
//
//     // Validation objects with 'rules' property will be pushed to the 'formData.collection' array separately
//     function createMultiValidationObjects(obj) {
//         obj.rules.forEach(function(inputObj) {
//             formData.collection.push(extend({
//                 method: inputObj.method,
//                 error: inputObj.error
//             }, obj));
//         });
//     }
//
//     function isRadio(object) {
//         return (Object.prototype.toString.call(object) === '[object RadioNodeList]')
//     }
//
//     function assignValue(obj) {
//         var keys = Object.keys(obj);
//         for(var i = 0; i < keys.length; i++) {
//             if (keys[i] === 'maxLength') {
//                 return { currLength: obj.input.value.length, maxLength: obj.maxLength };
//             }
//             if (keys[i] === 'minLength') {
//                 return { currLength: obj.input.value.length, minLength: obj.minLength };
//             }
//             if (keys[i] === 'equalTo') {
//                 return { currValue: obj.input.value, selector: obj.equalTo };
//             }
//              if (keys[i] === 'name'){
//                  return obj.input;
//              }
//         }
//         return obj.input.value;
//     }
//
//     // validates the input field
//     function validateInput(obj) {
//         var value = assignValue(obj);
//         if (obj.method(value)) {
//             hideErrorMessage(obj);
//         } else {
//             insertErrorMessage(obj);
//         }
//     }
//
//     function hideErrorMessage(obj) {
//         var errorPlaceholder = document.querySelector('#error-mgn-' + obj.id);
//         if (formData.errorMessage.indexOf(obj.error) >= 0) {
//
//             // update error message array
//             formData.errorMessage = formData.errorMessage.filter(function(errorMessage) {
//                 return errorMessage != obj.error;
//             });
//
//             errorPlaceholder.style.display = 'none';
//             if (!isRadio(obj.input)) {
//                 helperFn.removeClass(obj.input, 'error-highlight');
//             }
//         } else {
//             errorPlaceholder.style.display = 'none';
//             if (!isRadio(obj.input)) {
//                 helperFn.removeClass(obj.input, 'error-highlight');
//             }
//         }
//     }
//
//     function insertErrorMessage(obj) {
//         var errorPlaceholder = document.querySelector('#error-mgn-' + obj.id);
//         if (formData.errorMessage.indexOf(obj.error) < 0) {
//             formData.errorMessage.push(obj.error);
//             helperFn.html(errorPlaceholder, obj.error);
//             errorPlaceholder.style.display = 'block';
//             if (!isRadio(obj.input)) {
//                 helperFn.addClass(obj.input, 'error-highlight');
//             }
//         } else {
//             errorPlaceholder.style.display = 'block';
//              if (!isRadio(obj.input)) {
//                 helperFn.addClass(obj.input, 'error-highlight');
//             }
//         }
//     }
// })();