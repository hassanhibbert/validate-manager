/*
 * ValidateManager: A JavaScript form validator
 * Version: 1.0.0
 * Author: Hassan Hibbert <http://hassanhibbert.com/>
 * Github:
 * Copyright 2016-2017 Hassan Hibbert, under the MIT License
 */


(function (global, doc) {
  'use strict';

  /*
   * deepmerge - Merge the enumerable attributes of two objects deeply.
   * https://github.com/KyleAMathews/deepmerge
   * Author: Kyle Mathews
   * MIT License
   */
  !function(r){function e(r){var e=r&&"object"==typeof r;return e&&"[object RegExp]"!==Object.prototype.toString.call(r)&&"[object Date]"!==Object.prototype.toString.call(r)}function t(r){return Array.isArray(r)?[]:{}}function n(r,n){var o=n&&n.clone===!0;return o&&e(r)?c(t(r),r,n):r}function o(r,t,o){var a=r.slice();return t.forEach(function(t,i){void 0===a[i]?a[i]=n(t,o):e(t)?a[i]=c(r[i],t,o):-1===r.indexOf(t)&&a.push(n(t,o))}),a}function a(r,t,o){var a={};return e(r)&&Object.keys(r).forEach(function(e){a[e]=n(r[e],o)}),Object.keys(t).forEach(function(i){a[i]=e(t[i])&&r[i]?c(r[i],t[i],o):n(t[i],o)}),a}function c(r,e,t){var c=Array.isArray(e),i=t||{arrayMerge:o},u=i.arrayMerge||o;return c?Array.isArray(r)?u(r,e,t):n(e,t):a(r,e,t)}c.all=function(r,e){if(!Array.isArray(r)||r.length<2)throw Error("first argument should be an array with at least two elements");return r.reduce(function(r,t){return c(r,t,e)})},r.deepmerge=r.deepmerge||c}(window);

  // Shortcut variables
  var objProto = Object.prototype;
  var toString = objProto.toString;
  var hasOwn = objProto.hasOwnProperty;

  // Creates a new instance of an object
  var Extend = function (source, object) {
    return Object.assign(Object.create(source), object);
  };

  // =========================================================================================== //
  // Helper methods
  // =========================================================================================== //

  var Helpers = {
    insertAfter(newNode, element) {
      element.parentNode.insertBefore(newNode, element.nextSibling);
    },
    html(element, content) {
      element.innerHTML = content;
    },
    removeNode(element) {
      element.parentNode.removeChild(element);
    },
    exists(selector) {
      return doc.querySelectorAll(selector).length > 0;
    },
    isBoolean(obj) {
      return toString.call(obj) === '[object Boolean]';
    },
    isNodeList(obj)  {
      return toString.call(obj) === '[object RadioNodeList]';
    },
    isObject(obj) {
      return toString.call(obj) === '[object Object]';
    },
    isFunction(obj) {
      return toString.call(obj) === '[object Function]';
    },
    isString(obj) {
      return toString.call(obj) === '[object String]';
    },
    getCheckedValues(nodeList) {
      return [...nodeList].filter((item) => item.checked).map((item) => item.value);
    },
    first(obj) {
      return obj.length > 0 ? obj[0] : obj;
    },
    flatten(array) {
      return [].concat(...array);
    },
    removeClass(element, className) {
      if (element.className.indexOf(className) != -1) {
        var rxp = new RegExp('(\\s|^)' + className + '(\\s|$)');
        element.className = element.className.replace(rxp,' ').trim();
      }
    },
    addClass(element, className) {
      if (element.className.indexOf(className) === -1) {
        if (element.className != '') className = ' ' + className;
        element.className += className;
      }
    },
    getValidationRulesFromDOM(formElements) {
      return [...formElements].reduce((result, formElement) => {
        var rule = this.parseAttributes(formElement);
        var validateObjHasRules = Object.keys(rule).length;
        if (validateObjHasRules) {
          if (!hasOwn.call(result, formElement.name)) {
            result[formElement.name] = rule;
            result[formElement.name].fieldName = formElement.name;
          }
        }
        return result;
      }, {});
    },
    camelCase(string, delimiter) {
      if (string.indexOf(delimiter) < 0) return string;
      var stringChunks = string.split(delimiter);
      return stringChunks.reduce((result, string, index) => {
        var string = index > 0 ? string.charAt(0).toUpperCase() + string.slice(1) : string;
        result.push(string);
        return result;
      }, []).join('');
    },
    parseAttributes(element) {
      var prefix = 'data-vm-';
      return [...element.attributes].reduce((result, attribute) => {
        if (attribute.name.indexOf(prefix) >= 0) {
          var strippedPrefix = attribute.name.replace(prefix, '');
          var method = this.camelCase(strippedPrefix, '-');
          try {
            var parsedValue = JSON.parse(attribute.value);
          } catch (error) {
            var parsedValue = attribute.value;
          }
          if (method === 'required') {
            result[method] = parsedValue;
          } else if (result.rules) {
            result.rules[method] = parsedValue;
          } else {
            result.rules = {};
            result.rules[method] = parsedValue;
          }
        }
        return result;
      }, {});
    },
    formatStringTemplate(string = '', ...values) {
      return string.replace(/{(.*?)}/g, (match, templateIndex) => {
        if (Array.isArray(values[templateIndex])) values = this.flatten(values);
        return values[templateIndex];
      });
    },
    mergeRules(validationRulesJs, validationRulesDOM) {
      var mergedRules = deepmerge(validationRulesDOM, validationRulesJs);
      var ruleNames = Object.keys(mergedRules);
      return ruleNames.map(ruleName => {
        return mergedRules[ruleName];
      });
    },
  };

  // =========================================================================================== //
  // Internal rule validation methods
  // =========================================================================================== //

  var ValidationMethods = Extend(Helpers, {
    required(value) {
      return this.isNodeList(value)
        ? [...value].some(element => element.checked)
        : !(value.length === 0 || value.trim() === '' || value === null);
    },
    range(value, range) {
      return parseInt(value) >= range[0] && parseInt(value) <= range[1];
    },
    digits(value) {
      return !isNaN(parseFloat(value)) && isFinite(value);
    },
    lettersOnly(value) {
      return /^[a-z]+$/i.test(value);
    },
    maxlength(value, maxLength) {
      return this.isNodeList(value)
        ? this.getCheckedValues(value).length <= maxLength
        : value.length <= maxLength;
    },
    minlength(value, minLength) {
      return this.isNodeList(value)
        ? this.getCheckedValues(value).length >= minLength
        : value.length >= minLength;
    },
    equalTo(value, elementName, mainForm) {
      if (mainForm[elementName]) {
        var element = mainForm[elementName];
        return (value === element.value);
      } else {
        throw new Error(`Could not find a form element with the name "${elementName}"`);
      }
    },
    email(email) {
      var emailRegEx = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return emailRegEx.test(email);
    }
  });

  // =========================================================================================== //
  // Methods to handle error collection
  // =========================================================================================== //

  var ErrorMethods = Extend(ValidationMethods, {
    isItemInErrorCollection(ruleName, validateItem, strictSearch = true) {
      var errorInCollection = this.form.errorCollection
        .filter((error) => {
          return strictSearch
            ? error.id === validateItem.id && ruleName === error.rule
            : error.id === validateItem.id
        });
      return errorInCollection.length > 0;
    },
    isErrorCollectionEmpty() {
      return this.form.errorCollection.length === 0;
    },
    addToErrorCollection(ruleName, validateItem) {
      if (!this.isItemInErrorCollection(ruleName, validateItem)) {
        this.form.errorCollection.push({
          id: validateItem.id,
          rule: ruleName,
          message: validateItem.error[ruleName]
        });
      }
    },
    removeFromErrorCollection(ruleName, validateItem) {
      if (this.isItemInErrorCollection(ruleName, validateItem)) {
        this.form.errorCollection = this.form.errorCollection.filter((error) => {
          return validateItem.id !== error.id && ruleName !== error.rule;
        });
      }
    }
  });

  // =========================================================================================== //
  // User interface setup
  // =========================================================================================== //

  var UserInterface = Extend(ErrorMethods, {
    init() {
      if (this.options.validateOnChange)
        this.options.formElement.addEventListener('change', this.boundOnChangeHandler, false);
      if (this.options.formElement)
        this.options.formElement.addEventListener('submit', this.boundOnSubmitHandler, false);
    },

    destroy() {
      if (this.options.validateOnChange)
        this.options.formElement.removeEventListener('change', this.boundOnChangeHandler, false);
      if (this.options.formElement)
        this.options.formElement.removeEventListener('submit', this.boundOnSubmitHandler, false);
    },

    onSubmitHandler(event) {
      event.preventDefault();
      this.validateRequiredFields((data) => {
        if (this.isFunction(this.options.onSubmitHandler)) {
          this.options.onSubmitHandler(event, data, this.options.formElement)
        } else {
          this.options.formElement.submit();
        }
        if (this.options.resetFormOnSubmit) this.options.formElement.reset();
      });
    },

    onChangeHandler(event) {
      event.preventDefault();
      this.validateField(event.target);
      if (this.isFunction(this.options.onChangeHandler)) {
        this.options.onChangeHandler(event, event.target, this.options.formElement);
      }
    },

    validateField(element) {
      // Get validation object
      var validateItem = this.form.validationList
        .filter((validateItem) => {
          var fieldName = this.isNodeList(element) ? this.first(element).name : element.name;
          return validateItem.fieldName === fieldName;
        });

      validateItem = this.first(validateItem);
      var ruleNameList = Object.keys(validateItem.rules);

      // Validate each rule
      ruleNameList.some((ruleName) => {
        var selectedValidateMethod = this[ruleName].bind(this);
        var value1 = this.isNodeList(validateItem.element) ? validateItem.element : validateItem.element.value;
        var value2 = !this.isBoolean(validateItem.rules[ruleName]) ? validateItem.rules[ruleName] : undefined;
        if (!this.isFunction(selectedValidateMethod)) throw new Error(`"${ruleName}" is not a valid rule.`);
        var validationPassed = validateItem.rules[ruleName] && selectedValidateMethod(value1, value2, this.options.formElement);

        validationPassed
          ? this.removeFromErrorCollection(ruleName, validateItem)
          : this.addToErrorCollection(ruleName, validateItem);

        if (this.isItemInErrorCollection(ruleName, validateItem)) {
          this.showError(validateItem.id, validateItem.error[ruleName]);
        } else if (!this.isItemInErrorCollection(ruleName, validateItem, false)) {
          this.hideError(validateItem.id);
        }
        return !validationPassed; // if true the loop stops to display one error at a time
      });
    },

    buildErrorPlaceholders() {
      this.form.validationList.forEach((validateItem) => {
        var errorDiv = doc.createElement('div');
        var formFieldElement = validateItem.element;
        errorDiv.className = 'error-message';
        errorDiv.id = `error-mgn-${validateItem.id}`;

        if (this.isNodeList(formFieldElement)) {
          var lastRadioButton = formFieldElement[formFieldElement.length - 1];
          lastRadioButton.parentNode.appendChild(errorDiv);
        } else {
          validateItem.element.parentNode.appendChild(errorDiv);
        }
      });
    },

    updateList(validationList) {
      return validationList
        .map((validateItem, index) => {

          // Add unique ids & HTML elements
          Object.assign(validateItem, {
            id: `${index}-${this.options.formName}`,
            element: this.options.formElement[validateItem.fieldName],
          });

          // Add extra rule for required field
          var hasRules = hasOwn.call(validateItem, 'rules');
          var isRequired = hasOwn.call(validateItem, 'required');
          if (!hasRules) validateItem.rules = {};
          if (isRequired) Object.assign(validateItem.rules, {required: validateItem.required});

          // Add error messages
          var ruleNames = Object.keys(validateItem.rules);
          validateItem.error = {};
          ruleNames.forEach((name) => {
            var ruleHasErrorMessage = hasOwn.call(validateItem.error, name);
            var ruleValue = validateItem.rules[name];

            // If rule value is not a boolean then it should contain a value(s) that
            // can be used as a template value in the error message for the current rule
            var isRuleValueBoolean = this.isBoolean(ruleValue);

            if (!ruleHasErrorMessage) {
              validateItem.error[name] = isRuleValueBoolean
                ? this.errorMessages[name]
                : this.formatStringTemplate(this.errorMessages[name], ruleValue);
            }
            // Overwrite the default error message with the custom one
            if (hasOwn.call(validateItem, 'message') && validateItem.message[name]) {
              validateItem.error[name] = isRuleValueBoolean
                ? validateItem.message[name]
                : this.formatStringTemplate(validateItem.message[name], ruleValue);
            }
          });

          // Remove unwanted properties
          delete validateItem.message;
          delete validateItem.required;

          return validateItem;
        });
    },

    showError(id, errorMessage) {
      var element = doc.querySelector(`#error-mgn-${id}`);
      this.html(element, errorMessage);
      this.addClass(element, 'error-message_show');
    },

    hideError(id) {
      var element = doc.querySelector(`#error-mgn-${id}`);
      this.removeClass(element, 'error-message_show');
    },

    getAllValues() {
      return this.form.validationList.reduce((results, validateItem) => {
        results[validateItem.fieldName] = this.isNodeList(validateItem.element)
          ? this.getCheckedValues(validateItem.element)
          : validateItem.element.value;
        return results;
      }, {});
    },

    getRequiredFields() {
      return this.form.validationList
        .filter((validateItem) => hasOwn.call(validateItem.rules, 'required'))
        .map((validateItem) => validateItem.element);
    },

    validateRequiredFields(callback) {
      this.getRequiredFields().forEach((element) => {
        this.validateField(element);
      });

      // verify that there are no errors before executing the callback
      if (this.isErrorCollectionEmpty() && this.isFunction(callback)) {
        callback(this.getAllValues());
      }
    },

  });

  // =========================================================================================== //
  // Validate Manager
  // =========================================================================================== //

  function setupValidateManager(config) {
    var instance = Object.create(ValidateManagers);

    // Set default options
    var defaults = {
      onSubmitHandler: null,
      onChangeHandler: null,
      formElement: null,
      validateOnChange: true,
      resetFormOnSubmit: true
    };

    // Set error messages
    instance.errorMessages = {
      lettersOnly: 'Please use letters only.',
      email: 'Please enter a valid email address.',
      equalTo: 'Please enter the same value.',
      digits: 'Please enter a valid digit.',
      range: 'Please enter a number between {0} and {1}',
      required: 'This field is required.',
      minlength: 'Please enter a minimum of {0} characters.',
      maxlength: 'Please enter a maximum of {0} characters.'
    };

    // Store form state
    instance.form = {
      validationList: [],
      errorCollection: []
    };

    // Setup event handlers
    instance.boundOnChangeHandler = instance.onChangeHandler.bind(instance);
    instance.boundOnSubmitHandler = instance.onSubmitHandler.bind(instance);

    // Setup and merge options
    if (instance.isObject(config)) {
      instance.options = Object.assign(defaults, config);
      instance.options.formName = instance.options.formElement;
      instance.options.formElement = doc.forms[instance.options.formElement];
    }

    return instance;
  }

  var ValidateManagers = Extend(UserInterface, {
    validate(validationRulesJs={}) {
      if (this.options.formElement) {
        var validationRulesDOM = this.getValidationRulesFromDOM(this.options.formElement);
        var validationRuleList = this.mergeRules(validationRulesJs, validationRulesDOM);
        this.form.validationList = this.updateList(validationRuleList);
        this.buildErrorPlaceholders();
        this.init();
      } else {
        throw new Error(`Could not find a form element with the name "${this.options.formName}"`);
      }
    },

    addMethod(ruleName, method, message='', overwrite=false) {
      if (overwrite || !hasOwn.call(this, ruleName)) {
        this[ruleName] = method;
        this.errorMessages[ruleName] = message;
      } else {
        throw new Error(`Method '${ruleName}' is already use.`);
      }
    }
  });

  // Expose ValidateManager
  global.ValidateManager = global.ValidateManager || setupValidateManager;

})(window, document);