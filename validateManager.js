/*
 * ValidateManager: A JavaScript form validator
 * Version: 0.1.1
 * By Hassan Hibbert <http://hassanhibbert.com/>
 * Copyright 2016 Hassan Hibbert, under the MIT License
 */

'use strict';
;(function (global, doc) {

  //:::::::::: Utilities :::::::::://

  var objProto = Object.prototype;
  var toString = objProto.toString;
  var hasOwn = objProto.hasOwnProperty;

  var utils = {
    extend: (source, properties) => {
      for (var property in properties) {
        if (hasOwn.call(properties, property)) {
          source[property] = properties[property];
        }
      }
      return source;
    },
    insertAfter:      (newNode, element) => { element.parentNode.insertBefore(newNode, element.nextSibling) },
    html:             (element, content) => { element.innerHTML = content },
    removeNode:       (element) => { element.parentNode.removeChild(element) },
    exists:           (selector) => doc.querySelectorAll(selector).length > 0,
    isBoolean:        (obj) => toString.call(obj) === '[object Boolean]',
    isNodeList:       (obj) => toString.call(obj) === '[object RadioNodeList]',
    isObject:         (obj) => toString.call(obj) === '[object Object]',
    isFunction:       (obj) => toString.call(obj) === '[object Function]',
    isString:         (obj) => toString.call(obj) === '[object String]',
    getCheckedValues: (nodeList) => [...nodeList].filter((item) => item.checked).map((item) => item.value),
    first:            (obj) => obj.length > 0 ? obj[0] : obj,
    flatten:          (array) => [].concat(...array)
  };

  //:::::::::: ValidateManager Constructor :::::::::://

  function ValidateManager(config) {

    // Defaults
    var defaults = {
      onSubmitHandler: null,
      onChangeHandler: null,
      formElement: null,
      validateOnChange: true,
      resetFormOnSubmit: true
    };

    // Default error message
    this.errorMessages = {
      lettersOnly: 'Please use letters only.',
      email: 'Please enter a valid email address.',
      equalTo: 'Please enter the same value.',
      digits: 'Please enter a valid digit.',
      range: 'Please enter a number between {0} and {1}',
      required: 'This field is required.',
      minLength: 'Please enter a minimum of {0} characters.',
      maxLength: 'Please enter a maximum of {0} characters.'
    };

    this.form = { validationList: [], errorCollection: [], errorMethods: errorMethods.call(this) };

    this.validationMethods = internalValidationMethods.call(this);

    this.listeners = {};
    this.listeners.onChangeHandler = onChangeHandler.bind(this);
    this.listeners.onSubmitHandler = onSubmitHandler.bind(this);

    if (utils.isObject(config)) {
      this.options = utils.extend(defaults, config);
    }
  }

  //:::::::::: Public Methods :::::::::://

  ValidateManager.prototype = {

    validate: function (...validationList) {
      if (doc.forms[this.options.formElement]) {
        this.options.formElement = doc.forms[this.options.formElement];
        this.form.validationList = updateList.call(this, utils.flatten(validationList));
        buildErrorPlaceholders.call(this);
        initializeEvents.call(this);
      } else {
        throw new Error(`Could not find a form element with the name "${this.options.formElement}"`);
      }
    },

    addMethod: function (name, method, message = '') {
      if (!hasOwn.call(this.validationMethods, name)) {
        this.validationMethods[name] = method;
        this.errorMessages[name] = message;
      } else {
        throw new Error(`Method '${name}' is already use.`);
      }
    },

    valid: function() {
      var isValid = false;
      validateRequiredFields.call(this, () => { isValid = true });
      return isValid;
    },

    getInvalidList: function () {
      this.valid();
      return errorMethods.call(this).getInvalid.call(this);
    },
    getInvalidCount: function() {
      return this.getInvalidList.call(this).length;
    }

  };

  // Expose ValidateManager
  global.ValidateManager = global.ValidateManager || ValidateManager;

  //:::::::::: Private Methods :::::::::://

  function initializeEvents() {
    if (this.options.validateOnChange) {
      this.options.formElement.addEventListener('change', this.listeners.onChangeHandler, false);
    }

    if (this.options.formElement) {
      this.options.formElement.addEventListener('submit', this.listeners.onSubmitHandler, false);
    }
  }

  function onChangeHandler(event) {
    event.preventDefault();
    validateField.call(this, event.target);
    if (utils.isFunction(this.options.onChangeHandler)) {
      this.options.onChangeHandler(event, event.target, this.options.formElement);
    }
  }

  function onSubmitHandler(event) {
    event.preventDefault();
    validateRequiredFields.call(this, (data) => {
      if (utils.isFunction(this.options.onSubmitHandler)) {
        this.options.onSubmitHandler(event, data, this.options.formElement);
      }

      if (this.options.resetFormOnSubmit) {
        this.options.formElement.reset();
      }
    });
  }

  function getAllValues() {
    return this.form.validationList.reduce((results, validateItem) => {
      results[validateItem.fieldName] = utils.isNodeList(validateItem.element)
        ? utils.getCheckedValues(validateItem.element)
        : validateItem.element.value;
      return results;
    }, {});
  }

  function getRequiredFields() {
    return this.form.validationList
      .filter((validateItem) => hasOwn.call(validateItem.rules, 'required'))
      .map((validateItem) => validateItem.element);
  }

  function validateRequiredFields(callback) {
    getRequiredFields.call(this).forEach((element) => {
      validateField.call(this, element);
    });

    // verify that there are no errors before executing the callback
    var error = errorMethods.call(this);
    if (error.isErrorCollectionEmpty.call(this) && utils.isFunction(callback)) {
      callback(getAllValues.call(this), error);
    }
  }

  function validateField(element) {

    // Get validation object
    var validateItem = utils.first(this.form.validationList.filter((validateItem) => {
      var elementName = utils.isNodeList(element) ? element[0].name : element.name;
      return validateItem.fieldName === elementName;
    }));

    var errorMethod = errorMethods();
    var ruleNameList = Object.keys(validateItem.rules);

    // Validate each rule
    ruleNameList.some((ruleName) => {
      var dynamicMethod = this.validationMethods[ruleName];
      var value1 = utils.isNodeList(validateItem.element) ? validateItem.element : validateItem.element.value;
      var value2 = !utils.isBoolean(validateItem.rules[ruleName]) ? validateItem.rules[ruleName] : undefined;

      if (!utils.isFunction(dynamicMethod)) {
        throw new Error(` "${ruleName}" is not a valid rule.`);
      }

      var validationPassed = validateItem.rules[ruleName] && dynamicMethod(value1, value2, this.options.formElement);

      validationPassed
        ? errorMethod.remove.apply(this, [ruleName, validateItem])
        : errorMethod.add.apply(this, [ruleName, validateItem]);

      if (errorMethod.isErrorInCollection.apply(this, [ruleName, validateItem])) {
        showError(validateItem.id, validateItem.error[ruleName]);
      } else if (!errorMethod.isErrorInCollection.apply(this, [ruleName, validateItem, false])) {
        hideError(validateItem.id);
      }
      return !validationPassed; // if true the loop stops to display one error at a time
    });
  }

  function showError(id, errorMessage) {
    var element = doc.querySelector('#error-mgn-' + id);
    utils.html(element, errorMessage);
    element.style.display = 'block';
  }

  function hideError(id) {
    doc.querySelector('#error-mgn-' + id).style.display = 'none';
  }

  function errorMethods() {

    return { add, remove, isErrorInCollection, isErrorCollectionEmpty, getInvalid };

    ////////////////////

    function isErrorInCollection(ruleName, validateItem, strictSearch = true) {
      var errorInCollection = this.form.errorCollection
        .filter((error) => {
          return (strictSearch)
            ? error.id === validateItem.id && ruleName === error.rule
            : error.id === validateItem.id
        });

      return errorInCollection.length > 0;
    }

    function isErrorCollectionEmpty() {
      return this.form.errorCollection.length === 0;
    }

    function getInvalid() {
      return this.form.errorCollection;
    }

    function add(ruleName, validateItem) {
      if (!isErrorInCollection.apply(this, [ruleName, validateItem])) {
        this.form.errorCollection.push({
          id: validateItem.id,
          rule: ruleName,
          message: validateItem.error[ruleName]
        });
      }
    }

    function remove(ruleName, validateItem) {
      if (isErrorInCollection.apply(this, [ruleName, validateItem])) {
        this.form.errorCollection = this.form.errorCollection
          .filter((error) => validateItem.id !== error.id && ruleName === error.rule);
      }
    }
  }

  function updateList(validationList) {

    return validationList.map((validateItem, index) => // Add unique ids
      utils.extend(validateItem, { id: index }))

    // Assign HTML elements to input property
      .map((validateItem) =>
        utils.extend(validateItem, { element: this.options.formElement[validateItem.fieldName] }))

      // Add extra rule for required field
      .map((validateItem) => {
        var hasRules = hasOwn.call(validateItem, 'rules');
        var isRequired = hasOwn.call(validateItem, 'required');

        if (!hasRules) {
          validateItem.rules = {};
        }

        if (isRequired) {
          utils.extend(validateItem.rules, { required: true });
        }

        return validateItem;
      })

      // Add error messages
      .map((validateItem) => {

        var ruleNameList = Object.keys(validateItem.rules);
        validateItem.error = {};

        ruleNameList.forEach((ruleName) => {
          if (!hasOwn.call(validateItem.error, ruleName)) {
            validateItem.error[ruleName] = utils.isBoolean(validateItem.rules[ruleName])
              ? this.errorMessages[ruleName]
              : formatString(this.errorMessages[ruleName], validateItem.rules[ruleName]);
          }

          // Overwrite the default error message with the custom one
          if (hasOwn.call(validateItem, 'message') && validateItem.message[ruleName]) {
            validateItem.error[ruleName] = validateItem.message[ruleName];
          }
        });

        delete validateItem.message;
        delete validateItem.required;
        return validateItem;
      });

    // Formats dynamic error messages
    function formatString(string, ...values) {
      return string.replace(/{(.*?)}/g, (match, templateIndex) => {
        values = Array.isArray(values[templateIndex]) ? utils.flatten(values) : values;
        return values[templateIndex];
      });
    }
  }

  function buildErrorPlaceholders() {
    this.form.validationList.forEach((validateItem) => {
      var errorDiv = doc.createElement('div');
      errorDiv.className = 'error-message';
      errorDiv.id = `error-mgn-${validateItem.id}`;
      errorDiv.style.display = 'none';

      if (utils.isNodeList(validateItem.element)) {
        var lastRadioButton = validateItem.element[validateItem.element.length - 1];
        lastRadioButton.parentNode.appendChild(errorDiv);
      } else {
        validateItem.element.parentNode.appendChild(errorDiv);
      }
    });
  }

  //:::::::::: Validation Methods :::::::::://

  function internalValidationMethods() {
    return {
      required: (value) => {
        if (utils.isNodeList(value)) {
          for (var i = 0; i < value.length; ++i) {
            if (value[i].checked) {
              return true;
            }
          }
          return false;
        } else {
          return !(value.length === 0 || value.trim() === '' || value === null);
        }
      },
      range: (value, range) => parseInt(value) >= range[0] && parseInt(value) <= range[1],
      digits: (value) => !isNaN(parseFloat(value)) && isFinite(value),
      lettersOnly: (value) => /^[a-z]+$/i.test(value),
      maxLength: (value, maxLength) => utils.isNodeList(value)
        ? utils.getCheckedValues(value).length <= maxLength
        : value.length <= maxLength,
      minLength: (value, minLength) => utils.isNodeList(value)
        ? utils.getCheckedValues(value).length >= minLength
        : value.length >= minLength,
      equalTo: (value, elementName, mainForm) => {
        var element = mainForm[elementName];
        return (value === element.value);
      },
      email: (email) => {
        var emailRegEx = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return emailRegEx.test(email);
      }
    };
  }

})(window, document);