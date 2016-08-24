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
        radio: radio,
        email: email,
        digits: digits,
        equalTo: equalTo,
        lettersOnly: lettersOnly,
        required: required,
        maxLength: maxLength,
        minLength: minLength,
      },

      // error template for string placeholders
      // for dynamic error messages
      stringTemplate = {},

      // default error message
      errors = {
        lettersOnly: 'Please use letters only.',
        radio: 'Please select an option.',
        email: 'Please enter a valid email address.',
        equalTo: 'Please enter the same value.',
        digits: 'Please enter a valid digit.',
        required: 'This field is required.',
        minLength: `Please enter a minimum of ${stringTemplate['minLength']} characters.`,
        maxLength: `Please enter a maximum of ${stringTemplate['maxLength']} characters.`
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
      options.formElement = document.forms[options.formElement] || null; // replace name string with html form element
    } else {
      throw 'Please provide a valid object with config options to validateManager';
    }
  }

  function validate(...validationObjects) {

    // assign validation objects after initial object modification
    formData.validateObjects = setupValidationObjects(validationObjects);

    // setup placeholders in dom for error messages
    createErrorPlaceholders(formData.validateObjects);

    // initialize form
    init();
  }

  // update validation object with unique ids, html elements, require rules, and error messages
  function setupValidationObjects(validationObjects) {
    var objWithIds = createIdForEach(validationObjects),
        objWithElements = addDomElementsForEach(objWithIds),
        objWithRequiredRules = addRequiredRules(objWithElements),
        objWithErrorMessages = addErrorMessages(objWithRequiredRules);
    return objWithErrorMessages;
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
        requiredFieldsCompleted = getRequiredFieldsCompleted(requiredFields);

    // verify if required fields are completed and there are not errors in the error queue
    if (isRequiredFieldsCompleted(requiredFields, requiredFieldsCompleted) && formData.errorQueue.length === 0) {
      var inputValuesAndNames = getInputValuesAndNames(formData.validateObjects);
      utils.isFunction(options.onSuccess) && options.onSuccess(inputValuesAndNames);
      options.resetFormOnSubmit && options.formElement.reset();
      !options.preventSubmit && options.formElement.submit();
    } else {
      validateAllRequiredFields(requiredFields);
    }
  }

  // get key/value pair for `onSuccess` callback
  function getInputValuesAndNames(validateObjects) {
    var key;
    return validateObjects.reduce((data, validateObject) => {

      // if input is a node list then get first element name
      key = validateObject.input.name || validateObject.input[0].name;

      data[key] = validateObject.input.value;
      return data;
    }, {});
  }

  function errorMessages() {
    return {
      set: function (key, value) {
        stringTemplate[key] = value;
      },
      get: function(key) {
        return errors[key];
      },
      add: function(name, message) {
        errors[name] = message;
      }
    };
  }

  function addRequiredRules(validateObjects) {
    var validateObjHasRules,
        isRequired,
        validateObjectsCopy = [...validateObjects],
        validateObjectsRequired = [];

    validateObjectsCopy.forEach((validateObject) => {

      validateObjHasRules = validateObject.hasOwnProperty('rules');
      isRequired = validateObject.hasOwnProperty('required') && validateObject.required;

      // assign validation rules. if the validation object is required then add 'required' to rules
      if (validateObjHasRules && isRequired) {
        utils.extend(validateObject.rules, { required: true });
      } else if (!validateObjHasRules && isRequired) {
        utils.extend(validateObject, { rules: { required: true } });
      }

      validateObjectsRequired.push(validateObject);
    });

    return validateObjectsRequired;
  }

  function addErrorMessages(validateObjects) {
    var validateObjectsCopy = [...validateObjects],
        validateObjectsErrors = [],
        errorMessage = errorMessages();

    validateObjectsCopy.forEach((validateObject) => {
      var ruleKeys = Object.keys(validateObject.rules);

      validateObject.error = validateObject.error || {};

      ruleKeys.forEach((ruleKey) => {

        if (!validateObject.error.hasOwnProperty(ruleKey) && utils.isBoolean(validateObject.rules[ruleKey])) {

          // add default error messages
          validateObject.error[ruleKey] = {
            isValid: null,
            message: errorMessage.get(ruleKey)
          };
        } else if (!validateObject.error.hasOwnProperty(ruleKey)) {

          // add default error messages with dynamic values
          errorMessage.set(ruleKey, validateObject.rules[ruleKey]);
          validateObject.error[ruleKey] = {
            isValid: null,
            message: errorMessage.get(ruleKey)
          };
        }

        // overwrite default messages to add custom ones
        if (validateObject.hasOwnProperty('message')) {
          validateObject.error[ruleKey].message = validateObject.message[ruleKey];
        }

      });

      // message property no longer needed
      delete validateObject.message;

      validateObjectsErrors.push(validateObject);
    });

    return validateObjectsErrors;
  }

  function addDomElementsForEach(validateObjects) {
    return validateObjects.map((validateObject) => {
      return utils.extend(validateObject, { input: options.formElement[validateObject.input] });
    });
  }

  function addMethod(methodName, fn, message) {
    if (!validateMethod.hasOwnProperty(methodName)) {
      validateMethod[methodName] = fn;
      message && errorMessages().add(methodName, message);
    } else {
      console.warn(`Method '${methodName}' has already been defined.`);
    }
  }

  function validateAllRequiredFields(requiredFields) {
    requiredFields.forEach((validateObject) => {
      validateInput(validateObject.input);
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

  function validateInput(inputElement) {
    var ruleKeys,
        currentValidateObject = getValidateObject(inputElement.name)[0],
        currentValidateRules = currentValidateObject.rules,
        errorQueue = updateQueue('errorQueue');

    ruleKeys = Object.keys(currentValidateRules);

    // validate each rule
    ruleKeys.forEach((ruleKey) => {
      var dynamicValidateMethod,
        isKeyBoolean = utils.isBoolean(currentValidateRules[ruleKey]),
        secondArgValue = (!isKeyBoolean) ? currentValidateRules[ruleKey] : null,
        inputValue = (ruleKey === 'radio') ? currentValidateObject.input : inputElement.value;

      if (utils.isFunction(validateMethod[ruleKey])) {
        dynamicValidateMethod = validateMethod[ruleKey];
      } else {
        throw '"' + validateMethod[ruleKey] + '" is not a valid method.';
      }

      if (currentValidateRules[ruleKey] && dynamicValidateMethod(inputValue, secondArgValue, options.formElement)) {
        currentValidateObject.error[ruleKey].isValid = true;

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
      return (validateMethod.required(validateObject.input.value));
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

  /*
   * Validation Methods
   */

  function required(value) {
    return !(value.length === 0 || value.trim() == "" || value == null);
  }

  function digits(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
  }

  function lettersOnly(value) {
    return /^[a-z]+$/i.test(value);
  }

  function maxLength(value, maxLength) {
    return (value.length <= maxLength);
  }

  function minLength(value, minLength) {
    return (value.length >= minLength);
  }

  function equalTo(value, elementName, mainForm) {
    var element = mainForm[elementName];
    return (value === element.value);
  }

  function email(email) {
    var emailRegEx = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return emailRegEx.test(email);
  }

  function radio(radioNodeList) {
    for (var i = 0; i < radioNodeList.length; ++i) {
      if (radioNodeList[i].checked) {
        return true;
      }
    }
    return false;
  }

  /*
   * helper methods
   */

  function helperUtils() {
    var helperMethod = {},
        objProto = Object.prototype,
        toString = objProto.toString;

    helperMethod.insertAfter = (newNode, element) => { element.parentNode.insertBefore(newNode, element.nextSibling) };
    helperMethod.html = (element, content) => { element.innerHTML = content };
    helperMethod.removeNode = (element) => { element.parentNode.removeChild(element) };
    helperMethod.exists = (selector) => document.querySelectorAll(selector).length > 0;
    helperMethod.isBoolean = (obj) => toString.call(obj) === '[object Boolean]';
    helperMethod.isRadioList = (obj) => toString.call(obj) === '[object RadioNodeList]';
    helperMethod.isObject = (obj) => toString.call(obj) === '[object Object]';
    helperMethod.isFunction = (obj) => toString.call(obj) === '[object Function]';
    helperMethod.isString = (obj) => toString.call(obj) === '[object String]';

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

};