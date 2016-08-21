var validateManager = function validateManager(configObject) {
  'use strict';

  var utils = helperUtils(),
      config = {},
      formData = {
        validateObjects: null,
        errorQueue: [],
        successQueue: []
      },
      publicAPI = {
        validate: validate
      };

  // setup data in 'config' object
  processConfig(configObject);

  return publicAPI;

  //:::::::::::::::::::::::://
  //:::: HELPER UTILITY :::://
  //:::::::::::::::::::::::://

  function helperUtils(){return{hasClass:function(e,t){return e.className&&new RegExp("(^|\\s)"+t+"(\\s|$)").test(e.className)},addClass:function(e,t){e.className.indexOf(t)===-1&&(""!=e.className&&(t=" "+t),e.className+=t)},removeClass:function(e,t){if(e.className.indexOf(t)!=-1){var n=new RegExp("(\\s|^)"+t+"(\\s|$)");e.className=e.className.replace(n," ").trim()}},getElementList:function(e){return"string"==typeof e?Array.prototype.slice.call(document.querySelectorAll(e)):"undefined"==typeof e||e instanceof Array?e:[e]},createNode:function(e){var t=e.type,n=e.attr,r=e.content,o=document.createElement(t);return n&&Object.keys(n).forEach(function(e){o.setAttribute(e,n[e])}),r&&r.forEach(function(e){"string"==typeof e?o.appendChild(document.createTextNode(e)):o.appendChild(e)}),o},insertAfter:function(e,t){var n=t.parentNode;n.insertBefore(e,t.nextSibling)},html:function(e,t){e.innerHTML=t},exists:function(e){return document.querySelectorAll(e).length>0},removeNode:function(e){e.parentNode.removeChild(e)},removeElement:function(e){helperUtils.getElementList(e).forEach(function(e){helperUtils.removeNode(e)})},once:function(){var e=[];return function(t,n){e.indexOf(n)<0&&(e.push(n),t())}},oncePerItem:function(){var e=[];return function(t){return e.indexOf(t)<0&&(e.push(t),!0)}},extend:function(e,t){var n;for(n in t)t.hasOwnProperty(n)&&(e[n]=t[n]);return e},isBoolean:function(e){return"boolean"==typeof e},isRadioList:function(e){return"[object RadioNodeList]"===Object.prototype.toString.call(e)},isObject:function(e){return"[object Object]"===Object.prototype.toString.call(e)},isFunction:function(e){return"function"==typeof e},validateMethods:{hasValue:function(e){return!(0===e.length||""==e.trim()||null==e)},number:function(e){return!isNaN(parseFloat(e))&&isFinite(e)},isAlpha:function(e){var t=/[0-9]+/;return!t.test(e)},maxLength:function(e,t){return e.length<=t},minLength:function(e,t){return e.length>=t},equalTo:function(e,t,n){var r=n[t];return e===r.value},email:function(e){var t=/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;return t.test(e)},radio:function(e){for(var t=0;t<e.length;++t)if(e[t].checked)return!0;return!1}}}}

  //::::::::::::::::::::::::::://

  function processConfig(configObj) {

    if (utils.isObject(configObj)) {

      config.formElement = (configObj.hasOwnProperty('formName'))
        ? document.forms[configObject.formName]
        : null;

      config.onSuccessCallback = (configObj.hasOwnProperty('onSuccess') && utils.isFunction(configObj.onSuccess))
        ? configObj.onSuccess
        : null;

    } else {
      throw 'Not an object.'
    }
  }

  function validate(...validationObjects) {

    // get validation object after setup
    formData.validateObjects = setupValidationObjects(validationObjects);

    // setup placeholders in dom for errors
    createErrorPlaceholders(formData.validateObjects);

    // initialize form
    init();
  }

  function setupValidationObjects(validationObjects) {
    var validateObjId = createIdForEach(validationObjects),
        validateObjElements = addDomElementsForEach(validateObjId),
        validateObjRequired = addRequiredRules(validateObjElements);
    return addErrorMessages(validateObjRequired);
  }


  function init() {
    config.formElement.addEventListener('change', onChangeHandler, false);
    config.formElement.addEventListener('submit', onSubmitHandler, false);
  }

  function onChangeHandler(event) {
    event.preventDefault();
    validateInput(event.target);
  }

  function onSubmitHandler(event) {
    event.preventDefault();
    var requiredFields = getRequiredFields(formData.validateObjects),
        requiredFieldsCompleted = getRequiredFieldsCompleted(requiredFields);

    validateAllRequiredFields(requiredFields);

    if (isRequiredFieldsCompleted(requiredFields, requiredFieldsCompleted)
      && formData.errorQueue.length === 0) {

    }
  }

  function defaultErrorMessages() {
    var errors = {},
      updateObj = {};
    return {
      set: function (key, value) {
        updateObj[key] = value;
      },
      get: function(key) {
        errors.isAlpha = 'Please use letters only';
        errors.radio = 'Please select an option';
        errors.email = 'Please enter a valid email address';
        errors.equalTo = `This field is not the same as ${updateObj['equalTo']}`;
        errors.minLength = `Please enter a minimum of ${updateObj['minLength']} characters`;
        errors.maxLength = `Please enter a maximum of ${updateObj['maxLength']} characters`;
        errors.number = 'Please enter a valid number';
        errors.hasValue = 'Please fill out the required field';
        return errors[key];
      }
    }
  }

  function addRequiredRules(validateObjects) {
    var hasRules,
        isRequired,
        validateObjectsCopy = [...validateObjects],
        validateObjectRequiredRules = [];

    validateObjectsCopy.forEach((currentValidateObject) => {

      hasRules = currentValidateObject.hasOwnProperty('rules');
      isRequired = currentValidateObject.hasOwnProperty('required') && currentValidateObject.required;

      // assign validation rules. if the validation object is required then add 'hasValue' to rules
      if (hasRules && isRequired) {
        utils.extend(currentValidateObject.rules, { hasValue: true });
      } else if (!hasRules && isRequired) {
        utils.extend(currentValidateObject, { rules: { hasValue: true } });
      }

      validateObjectRequiredRules.push(currentValidateObject);
    });

    return validateObjectRequiredRules;
  }

  function addErrorMessages(validateObjects) {
    var validateObjectsCopy = [...validateObjects],
      validateObjectsErrors = [],
      errorMessages = defaultErrorMessages();

    validateObjectsCopy.forEach((validateObject) => {
      var ruleKeys = Object.keys(validateObject.rules);

      validateObject.errorMessages = validateObject.errorMessages || {};
      ruleKeys.forEach((ruleKey) => {

        // protect custom error messages if there's one present
        if (!validateObject.errorMessages.hasOwnProperty(ruleKey)
          && utils.isBoolean(validateObject.rules[ruleKey])) {

          // add default error messages
          validateObject.errorMessages[ruleKey] = errorMessages.get(ruleKey);
        } else if (!validateObject.errorMessages.hasOwnProperty(ruleKey)) {

          // add default error messages with dynamic values
          errorMessages.set(ruleKey, validateObject.rules[ruleKey]);
          validateObject.errorMessages[ruleKey] = errorMessages.get(ruleKey);
        }
      });
      validateObjectsErrors.push(validateObject);
    });
    return validateObjectsErrors;
  }

  function addDomElementsForEach(validateObjects) {
    return validateObjects.map((validateObject) => {
      return utils.extend(validateObject, { input: config.formElement[validateObject.input] });
    });
  }

  function validateAllRequiredFields(requiredFields) {
    requiredFields.forEach((validateObject) => {
      validateInput(validateObject.input);
    });
  }

  function validateInput(inputElement) {
    var ruleKeys,
        validateMethods = utils.validateMethods,
        currentValidateObject = getValidateObject(inputElement.name)[0],
        currentValidateRules = currentValidateObject.rules;

    ruleKeys = Object.keys(currentValidateRules);

    // validate each rule
    ruleKeys.forEach((ruleKey) => {
      var dynamicValidateMethod,
          isKeyBoolean = utils.isBoolean(currentValidateRules[ruleKey]),
          secondArgValue = (!isKeyBoolean) ? currentValidateRules[ruleKey] : null,
          inputValue = (ruleKey === 'radio') ? currentValidateObject.input : inputElement.value;

      if (utils.isFunction(validateMethods[ruleKey])) {
        dynamicValidateMethod = validateMethods[ruleKey];
      } else {
        throw '"' + validateMethods[ruleKey] + '" is not a valid method.';
      }

      if (currentValidateRules[ruleKey] && dynamicValidateMethod(inputValue, secondArgValue, config.formElement)) {
        console.log('passed: ', ruleKey, inputElement);
      } else {
        console.log('failed: ', ruleKey, inputElement);
      }

    });
  }

  function getValidateObject(elementName) {
    return formData.validateObjects.filter((obj) => {
      return (utils.isRadioList(obj.input))
        ? (obj.input[0].name === elementName)
        : (obj.input.name === elementName);
    });
  }

  function createIdForEach(validateObjects) {
    return validateObjects.map((validateObject, index) => {
      return utils.extend(validateObject, { id: index });
    });
  }

  function getRequiredFields(validateObj) {
    return validateObj.filter((validateObject) => {
      return (validateObject.required);
    });
  }

  function getRequiredFieldsCompleted(requiredFields) {
    return requiredFields.filter((validateObject) => {
      return (utils.validateMethods.hasValue(validateObject.input.value));
    });
  }

  function isRequiredFieldsCompleted(requiredFields, requiredFieldsCompleted) {
    return (requiredFieldsCompleted.length === requiredFields.length);
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