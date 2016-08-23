var validateManager = function validateManager(configOptions) {
  'use strict';

  var utils = helperUtils(),
    defaultOptions = {
      onSuccess: null,
      formElement: null,
      preventSubmit: false,
      validateOnChange: true,
      resetFormOnSubmit: true,
    },
    validateMethod = {
      radio: radio,
      email: email,
      number: number,
      equalTo: equalTo,
      isAlpha: isAlpha,
      required: required,
      maxLength: maxLength,
      minLength: minLength,
    },
    options = {},
    formData = {
      validateObjects: null,
      errorQueue: []
    },
    publicAPI = {
      validate: validate
    };

  extendDefaultOptions(configOptions); // extend options

  return publicAPI;


  /*
   * helper methods
   */

  function helperUtils(){return{hasClass:function(e,t){return e.className&&new RegExp("(^|\\s)"+t+"(\\s|$)").test(e.className)},addClass:function(e,t){e.className.indexOf(t)===-1&&(""!=e.className&&(t=" "+t),e.className+=t)},removeClass:function(e,t){if(e.className.indexOf(t)!=-1){var n=new RegExp("(\\s|^)"+t+"(\\s|$)");e.className=e.className.replace(n," ").trim()}},getElementList:function(e){return"string"==typeof e?Array.prototype.slice.call(document.querySelectorAll(e)):"undefined"==typeof e||e instanceof Array?e:[e]},createNode:function(e){var t=e.type,n=e.attr,o=e.content,r=document.createElement(t);return n&&Object.keys(n).forEach(function(e){r.setAttribute(e,n[e])}),o&&o.forEach(function(e){"string"==typeof e?r.appendChild(document.createTextNode(e)):r.appendChild(e)}),r},insertAfter:function(e,t){var n=t.parentNode;n.insertBefore(e,t.nextSibling)},html:function(e,t){e.innerHTML=t},exists:function(e){return document.querySelectorAll(e).length>0},removeNode:function(e){e.parentNode.removeChild(e)},extend:function(e,t){var n;for(n in t)t.hasOwnProperty(n)&&(e[n]=t[n]);return e},isBoolean:function(e){return"boolean"==typeof e},isRadioList:function(e){return"[object RadioNodeList]"===Object.prototype.toString.call(e)},isObject:function(e){return"[object Object]"===Object.prototype.toString.call(e)},isFunction:function(e){return"function"==typeof e}}}

  //////////////////////

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

  function setupValidationObjects(validationObjects) {
    var objWithIds = createIdForEach(validationObjects),
        objWithElements = addDomElementsForEach(objWithIds),
        objWithRequiredRules = addRequiredRules(objWithElements),
        objWithErrorMessages = addErrorMessages(objWithRequiredRules);

    // final validation object with unique ids, html elements, require rules, and error messages
    return objWithErrorMessages;
  }

  function init() {
    options.validateOnChange && options.formElement.addEventListener('change', onChangeHandler, false);
    options.formElement.addEventListener('submit', onSubmitHandler, false);
  }

  function onChangeHandler(event) {
    event.preventDefault();
    validateInput(event.target);
  }

  function onSubmitHandler(event) {
    event.preventDefault();
    var requiredFields = getRequiredFields(formData.validateObjects),
        requiredFieldsCompleted = getRequiredFieldsCompleted(requiredFields);

    if (isRequiredFieldsCompleted(requiredFields, requiredFieldsCompleted) && formData.errorQueue.length === 0) {
      var inputValuesAndNames = getInputValuesAndNames(formData.validateObjects);
      utils.isFunction(options.onSuccess) && options.onSuccess(inputValuesAndNames);
      options.resetFormOnSubmit && options.formElement.reset();
      !options.preventSubmit && options.formElement.submit();
    } else {
      validateAllRequiredFields(requiredFields);
    }
  }

  function getInputValuesAndNames(validateObjects) {
    return validateObjects.map((validateObject) => ({

      // if input is a node list then get first element name
      id: validateObject.input.name || validateObject.input[0].name,
      value: validateObject.input.value
    }));
  }

  function defaultErrorMessages() {
    var errors = {},
        template = {};
    return {
      set: function (key, value) {
        template[key] = value;
      },
      get: function(key) {
        errors.isAlpha = 'Please use letters only';
        errors.radio = 'Please select an option';
        errors.email = 'Please enter a valid email address';
        errors.equalTo = `This field is not the same as ${template['equalTo']}`;
        errors.minLength = `Please enter a minimum of ${template['minLength']} characters`;
        errors.maxLength = `Please enter a maximum of ${template['maxLength']} characters`;
        errors.number = 'Please enter a valid number';
        errors.required = 'Please fill out the required field';
        return errors[key];
      }
    }
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
        errorMessages = defaultErrorMessages();

    validateObjectsCopy.forEach((validateObject) => {
      var ruleKeys = Object.keys(validateObject.rules);

      validateObject.error = validateObject.error || {};
      ruleKeys.forEach((ruleKey) => {

        // protect custom error messages if there's one present
        if (!validateObject.error.hasOwnProperty(ruleKey) && utils.isBoolean(validateObject.rules[ruleKey])) {

          // add default error messages
          validateObject.error[ruleKey] = {
            isValid: null,
            message: errorMessages.get(ruleKey)
          };
        } else if (!validateObject.error.hasOwnProperty(ruleKey)) {

          // add default error messages with dynamic values
          errorMessages.set(ruleKey, validateObject.rules[ruleKey]);
          validateObject.error[ruleKey] = {
            isValid: null,
            message: errorMessages.get(ruleKey)
          };
        } else {
          validateObject.error[ruleKey].isValid = null;
        }
      });
      validateObjectsErrors.push(validateObject);
    });
    return validateObjectsErrors;
  }

  function addDomElementsForEach(validateObjects) {
    return validateObjects.map((validateObject) => {
      return utils.extend(validateObject, { input: options.formElement[validateObject.input] });
    });
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

  function number(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
  }

  function isAlpha(value) {
    var regExNumber = /[0-9]+/;
    return !(regExNumber.test(value));
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


};