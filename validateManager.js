/*
 * validateManager: A JavaScript form validator
 * By Hassan Hibbert <http://hassanhibbert.com/>
 * Copyright 2016 Hassan Hibbert, under the MIT License
 */


var validateManager = function validateManager(configOptions) {
  'use strict';

  var
      // helper utilities
      utils = helperUtils(),

      // defaults
      defaultOptions = {
        onSuccess: null,
        formElement: null,
        preventSubmit: false,
        validateOnChange: true,
        resetFormOnSubmit: true,
      },

      options = {},

      // validation methods
      validateMethod = {
        email: email,
        digits: digits,
        equalTo: equalTo,
        lettersOnly: lettersOnly,
        required: required,
        maxLength: maxLength,
        minLength: minLength,
      },

      // default error message
      errorMessages = {
        lettersOnly: 'Please use letters only.',
        email: 'Please enter a valid email address.',
        equalTo: 'Please enter the same value.',
        digits: 'Please enter a valid digit.',
        required: 'This field is required.',
        minLength: 'Please enter a minimum of {0} characters.',
        maxLength: 'Please enter a maximum of {0} characters.',
      },

      // object for storing form data
      formData = {
        validateObjects: null,
        errorQueue: []
      },

      // public api
      publicAPI = {
        validate: validate,
        addMethod: addMethod
      };

  // extend options
  extendDefaultOptions(configOptions);

  return publicAPI;

  //****************//

  // extend default option and assign to `options`
  function extendDefaultOptions(configOptions) {
    if (utils.isObject(configOptions)) {
      options = utils.extend(defaultOptions, configOptions);
    } else {
      throw 'Please provide a valid object with config options to validateManager';
    }
  }

  function validate(...validationObjects) {

    // overwrite `options.formElement` string name selector with the html form element
    options.formElement = document.forms[options.formElement];

    // assign validation objects after each object has been updated
    formData.validateObjects = updateValidateObj(validationObjects);

    // setup placeholders in dom for error messages
    createErrorPlaceholders(formData.validateObjects);

    // initialize form
    init();
  }

  // update validation objects with unique ids, html input elements, additional rules, and error messages
  function updateValidateObj(validationObjects) {

    // collection of methods to modify each validation object
    var updateMethods = [
        createUniqueIds, addInputElements, addRequiredRules, addErrorMessages
    ];

    updateMethods.forEach((updateMethod) => {
      updateMethod(validationObjects);
    });

    return validationObjects; // array with updated validate objects
  }

  // initialize listeners for current form
  function init() {
    options.validateOnChange && options.formElement.addEventListener('change', onChangeHandler, false);
    options.formElement.addEventListener('submit', onSubmitHandler, false);
  }

  // validate on change
  function onChangeHandler(event) {
    event.preventDefault();
    validateInput(event.target);
  }

  // validate on submit
  function onSubmitHandler(event) {
    event.preventDefault();

    var requiredFields = getRequiredFields(formData.validateObjects),
        requiredFieldsCompleted = getRequiredFieldsCompleted(requiredFields),
        isErrorQueueEmpty = formData.errorQueue.length === 0,
        isRequiredFieldsCompleted = requiredFieldsCompleted.length === requiredFields.length;

    // verify if required fields are completed and there are not errors in the error queue
    if (isRequiredFieldsCompleted && isErrorQueueEmpty) {
      var inputKeyValues = getInputKeyValues(formData.validateObjects);
      utils.isFunction(options.onSuccess) && options.onSuccess(inputKeyValues);
      options.resetFormOnSubmit && options.formElement.reset();
      !options.preventSubmit && options.formElement.submit();
    } else {
      validateAllRequiredFields(requiredFields);
    }
  }

  // get key/value pair for `onSuccess` callback
  function getInputKeyValues(validateObjects) {
    var key, value;
    return validateObjects.reduce((data, validateObject) => {

      // if input is a node list then get first element name
      key = validateObject.input.name || validateObject.input[0].name;

      // if value is a node list
      if (utils.isNodeList(validateObject.input)) {
        var inputValues = utils.getCheckedValues(validateObject.input);
        value = (inputValues.length > 1) ? inputValues : inputValues[0];
      } else {
        value = validateObject.input.value
      }

      data[key] = value;

      return data;
    }, {});
  }


  // add required rules if object is required
  function addRequiredRules(validateObjects) {
    var validateObjHasRules, isRequired;

    validateObjects.forEach((validateObject) => {
      validateObjHasRules = validateObject.hasOwnProperty('rules');
      isRequired = validateObject.hasOwnProperty('required') && validateObject.required;

      if (validateObjHasRules && isRequired) {
        utils.extend(validateObject.rules, { required: true });
      } else if (!validateObjHasRules && isRequired) {
        utils.extend(validateObject, { rules: { required: true } });
      }
    });
  }

  // formats dynamic error messages
  function formatStringTemplate(string, ...values) {
    return string.replace(/{(.*?)}/g, (match, templateIndex) => {
      return values[templateIndex];
    });
  }

  // add default and custom error messages
  function addErrorMessages(validateObjects) {

    validateObjects.forEach((validateObject) => {
      var ruleKeys = Object.keys(validateObject.rules);

      validateObject.error = validateObject.error || {};

      ruleKeys.forEach((ruleKey) => {
        if (!validateObject.error.hasOwnProperty(ruleKey) && utils.isBoolean(validateObject.rules[ruleKey])) {

          // add default error messages
          validateObject.error[ruleKey] = {
            isValid: null,
            message: errorMessages[ruleKey]
          };
        } else if (!validateObject.error.hasOwnProperty(ruleKey)) {

          // add default error messages with dynamic values
          validateObject.error[ruleKey] = {
            isValid: null,
            message: formatStringTemplate(errorMessages[ruleKey], validateObject.rules[ruleKey])
          };
        }

        // overwrite default messages to add custom ones
        if (validateObject.hasOwnProperty('message')) {
          var customMessage = validateObject.message[ruleKey],
              defaultMessage = validateObject.error[ruleKey].message;
          validateObject.error[ruleKey].message = customMessage || defaultMessage;
        }
      });

      // message property no longer needed after overwriting the default errors
      delete validateObject.message;
    });
  }

  // replace each object `validateObjects.input` string name withe the html form element
  function addInputElements(validateObjects) {
    validateObjects.forEach((validateObject) => {
       utils.extend(validateObject, { input: options.formElement[validateObject.input] });
    });
  }

  function createUniqueIds(validateObjects) {
    validateObjects.forEach((validateObject, index) => {
      utils.extend(validateObject, { id: index });
    });
  }

  // add custom validation methods
  function addMethod(methodName, fn, message) {
    if (!validateMethod.hasOwnProperty(methodName)) {
      validateMethod[methodName] = fn;
      errorMessages[methodName] = (message) ? message : '';
    } else {
      console.warn(`Method '${methodName}' has already been defined.`);
    }
  }

  function validateAllRequiredFields(requiredFields) {
    requiredFields.forEach((validateObject) => {
      var input = (utils.isNodeList(validateObject.input))
        ? validateObject.input[0]
        : validateObject.input;
      validateInput(input);
    });
  }

  function updateQueue(queue) {
    var currentQueue = queue;
    return {
      add: function (obj) {
        formData[currentQueue].push(obj);
      },
      remove: function(validateObject) {
        formData[queue] = formData[currentQueue].filter((currentItem) => {
          return currentItem.id !== validateObject.id;
        });
      },
      isItemInQueue: function(validateObject) {
        var isInQueue = formData[currentQueue].filter((currentItem) => {
          return currentItem.id === validateObject.id;
        });
        return isInQueue.length === 1;
      }
    };
  }

  function showError(id, errorMessage) {
    var errorElement = document.querySelector('#error-mgn-' + id);
    utils.html(errorElement, errorMessage);
    errorElement.style.display = 'block';
  }

  function hideError(id) {
    var errorElement = document.querySelector('#error-mgn-' + id);
    errorElement.style.display = 'none';
  }

  function getInputValue(validationObject) {
    return (utils.isNodeList(validationObject.input)) ? validationObject.input : validationObject.input.value;
  }

  function validateInput(inputElement) {
    var ruleKeys,
        currentValidateObject = getValidateObject(inputElement)[0],
        currentValidateRules = currentValidateObject.rules,
        errorQueue = updateQueue('errorQueue');

    ruleKeys = Object.keys(currentValidateRules);

    // validate each rule
    ruleKeys.forEach((ruleKey) => {
      var dynamicValidateMethod,
          isKeyBoolean = utils.isBoolean(currentValidateRules[ruleKey]),
          secondArgValue = (!isKeyBoolean) ? currentValidateRules[ruleKey] : null,
          inputValue = getInputValue(currentValidateObject);

      if (utils.isFunction(validateMethod[ruleKey])) {
        dynamicValidateMethod = validateMethod[ruleKey];
      } else {
        throw ` "${ruleKey}" is not a valid rule.`;
      }

      if (currentValidateRules[ruleKey] && dynamicValidateMethod(inputValue, secondArgValue, options.formElement)) {
        currentValidateObject.error[ruleKey].isValid = true;

        // checks if each error object flag `isValid` is set true be for proceeding to
        // remove the object from `formDate.errorQueue`
        var errorObject = currentValidateObject.error,
          isValidMap = Object.keys(errorObject).map((rule) => errorObject[rule].isValid),
          shouldRemoveError = isValidMap.filter((booleanItem) => !booleanItem).length === 0;

        if (errorQueue.isItemInQueue(currentValidateObject) && shouldRemoveError) {
          errorQueue.remove(currentValidateObject);
          hideError(currentValidateObject.id);
        }
      } else {
        currentValidateObject.error[ruleKey].isValid = false;

        if (!errorQueue.isItemInQueue(currentValidateObject)) {
          errorQueue.add(currentValidateObject);
          showError(currentValidateObject.id, currentValidateObject.error[ruleKey].message);
        } else {
          showError(currentValidateObject.id, currentValidateObject.error[ruleKey].message);
        }
      }
    });
  }

  function getValidateObject(element) {
    return formData.validateObjects.filter((obj) => {
      return (utils.isNodeList(obj.input))
        ? obj.input[0].name === element.name
        : obj.input.name === element.name;
    });
  }

  function getRequiredFields(validateObj) {
    return validateObj.filter((validateObject) => {
      return (validateObject.required);
    });
  }

  function getRequiredFieldsCompleted(requiredFields) {
    return requiredFields.filter((validateObject) => {
      var value = getInputValue(validateObject);
      return (validateMethod.required(value));
    });
  }

  function createErrorPlaceholders(validateObjects) {
    var errorMessageDiv, lastRadioButton, domElementSetup;

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

      if (utils.isNodeList(validateObject.input)) {
        lastRadioButton = [...validateObject.input].reverse()[0]; // convert node list to array then get last item
        lastRadioButton.parentNode.appendChild(errorMessageDiv);
      } else {
        validateObject.input.parentNode.appendChild(errorMessageDiv);
      }

    });
  }

  /*
   * Validation Methods
   */

  function required(value) {
    if (utils.isNodeList(value)) {
      for (var i = 0; i < value.length; ++i) {
        if (value[i].checked) {
          return true;
        }
      }
      return false;
    } else {
      return !(value.length === 0 || value.trim() == "" || value == null);
    }
  }

  function digits(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
  }

  function lettersOnly(value) {
    return /^[a-z]+$/i.test(value);
  }

  function maxLength(value, maxLength) {
    return (utils.isNodeList(value))
      ? utils.getCheckedValues(value).length <= maxLength
      : value.length <= maxLength;
  }

  function minLength(value, minLength) {
    return (utils.isNodeList(value))
      ? utils.getCheckedValues(value).length >= minLength
      : value.length >= minLength;
  }

  function equalTo(value, elementName, mainForm) {
    var element = mainForm[elementName];
    return (value === element.value);
  }

  function email(email) {
    var emailRegEx = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return emailRegEx.test(email);
  }

  /*
   * helper methods
   */

  function helperUtils() {
    var helperMethod = {},
        objProto = Object.prototype,
        toString = objProto.toString;

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

    helperMethod.insertAfter = (newNode, element) => { element.parentNode.insertBefore(newNode, element.nextSibling) };
    helperMethod.html = (element, content) => { element.innerHTML = content };
    helperMethod.removeNode = (element) => { element.parentNode.removeChild(element) };
    helperMethod.exists = (selector) => document.querySelectorAll(selector).length > 0;
    helperMethod.isBoolean = (obj) => toString.call(obj) === '[object Boolean]';
    helperMethod.isNodeList = (obj) => toString.call(obj) === '[object RadioNodeList]';
    helperMethod.isObject = (obj) => toString.call(obj) === '[object Object]';
    helperMethod.isFunction = (obj) => toString.call(obj) === '[object Function]';
    helperMethod.isString = (obj) => toString.call(obj) === '[object String]';
    helperMethod.getCheckedValues = (nodeList) => [...nodeList].filter((item) => item.checked).map((item) => item.value);

    return helperMethod;
  }

};