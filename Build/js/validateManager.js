var validateManager = (function() {

    var options,
        errorMessageDiv,
        formElement,
        submitButton,
        internalValidationMethods = {},
        helperFn = {},
        tabOnce,

        // Default options
        defaults = {
            formId: null,
            successCallback: null,
            resetFormOnSubmit: true,
            validateOnKeyUp: false
        },

        // get/set unique id
        uniqueId = {
            id: 0,
            get: function() {
                return this.id;
            },
            createNewId: function() {
                this.id += 1;
            }
        },

        // Collection of form values
        formData = {
            successValues: [],
            collection: [],
            errorMessage: []
        },

        publicAPI = {
            config: config,
            init: init,
            fn: internalValidationMethods,
            helperFn: helperFn
        };

    return publicAPI;

    //::::::::::::::::::::::::::::::://
    //:::: Initialize and config :::://
    //::::::::::::::::::::::::::::::://

    function init(obj) {

        // Extend defaults and assign it to options
        if (obj && typeof obj === "object") {
            options = extendDefaults(defaults, obj);
        }

        // Get form DOM elements
        formElement = helperFn.getElementList(options.formId)[0];
        submitButton = helperFn.getElementList(options.submitButton)[0];

        // Event listeners to handle form validation
        if (options.validateOnKeyUp) {
            tabOnce = helperFn.oncePerItem();
            formElement.addEventListener('keyup', onKeyUpHandler, false);
        }
        formElement.addEventListener('change', onChangeHandler, false);
        formElement.addEventListener('submit', onSubmitHandler, false);
        submitButton.disabled = true;
    }

    // Updates the 'formData.collection' array with validation objects
    function config(data) {
        data.forEach(function(obj) {
            if (obj.multiValidation) {
                createMultiValidationObjects(obj);
            } else {
                formData.collection.push(obj);
            }
        });
        formData.collection.forEach(mergeInputElements);
    }

    //:::::::::::::::::::::::://
    //:::: Event Handlers :::://
    //:::::::::::::::::::::::://

    function onSubmitHandler(evt) {
        evt.preventDefault();

        populateValues(function(successValues) {
            options.successCallback(successValues);
            submitButton.disabled = true;
            formData.successValues = [];
            if (options.resetFormOnSubmit) {
                formElement.reset();
            }
        });
    }

    function onKeyUpHandler(evt) {
        evt.preventDefault();
        var keyCode = evt.keyCode || evt.which;

        // skip validation on initial tab key press for each form field
        if (tabOnce(evt.target.id) && keyCode === 9) {
            return;
        }

        validateCurrentInput(evt.target.id);
        updateSubmitButton();
    }


    function onChangeHandler(evt) {
        evt.preventDefault();
        validateCurrentInput(evt.target.id);
        updateSubmitButton();
    }

    // Replace the input selector with an actual DOM element
    function mergeInputElements(obj) {
        uniqueId.createNewId();
        var inputElement = helperFn.getElementList(obj.input)[0];
        extendDefaults(obj, {input: inputElement, id: uniqueId.get()});
    }

    // extends an object with new properties
    function extendDefaults(source, properties) {
        var property;
        for (property in properties) {
            if (properties.hasOwnProperty(property)) {
                source[property] = properties[property];
            }
        }
        return source;
    }

    // returns an array of objects that's required
    function getRequiredFields() {
        return formData.collection.filter(function(inputObject) {
            return (inputObject.required);
        });
    }

    // returns an array of required objects that has been filled out
    function getRequiredFieldsCompleted() {
        return getRequiredFields().filter(function(inputObject) {
            return (helperFn.hasValue(inputObject.input.value));
        });
    }

    // verify if required fields are filled out
    function isRequiredFieldsCompleted() {
        return (getRequiredFieldsCompleted().length === getRequiredFields().length);
    }

    // Enable submit button if required fields are filled out and there are no errors.
    function updateSubmitButton() {
        submitButton.disabled = (isRequiredFieldsCompleted() && formData.errorMessage.length === 0) ? false : true;
    }

    // Populate 'formData.successValues' with input values that has been validated then invoke the callback function
    function populateValues(callback) {
        var currentInputId = '';
        formData.collection.forEach(function(inputObject) {
            if (currentInputId != inputObject.input.id) {
                formData.successValues.push({
                    id: inputObject.input.id,
                    value: inputObject.input.value
                });
                currentInputId = inputObject.input.id;
            }
        });
        callback(formData.successValues);
    }

    // Returns an array of validation objects that matches the input id provided
    function inputLookUp(id) {
        return formData.collection.filter(function(obj) {
            return (obj.input.id == id);
        });
    }

    // Validates the current input that matches the provided id
    function validateCurrentInput(id) {
        var inputObj = inputLookUp(id);
        if (inputObj.length > 1) {
            inputObj.forEach(function(currInputObj) {
                validateInput(currInputObj);
            });
        } else {
            validateInput(inputObj[0]);
        }
    }

    // Validation objects with 'multiValidation' property will be pushed to the 'formData.collection' array separately
    function createMultiValidationObjects(obj) {
        obj.multiValidation.forEach(function(inputObj) {
            if (obj.required) {
                formData.collection.push({
                    input: obj.input,
                    validateFn: inputObj.validateFn,
                    error: inputObj.error,
                    required: obj.required
                });
            } else {
                formData.collection.push({
                    input: obj.input,
                    validateFn: inputObj.validateFn,
                    error: inputObj.error
                });
            }

        });
    }

    // validates the input field
    function validateInput(obj) {
        if (obj.validateFn(obj.input.value)) {
            hideErrorMessage(obj);
        } else {
            insertErrorMessage(obj);
        }
    }

    function hideErrorMessage(obj) {
        if (formData.errorMessage.indexOf(obj.error) >= 0) {
            formData.errorMessage = formData.errorMessage.filter(function(errorMessage) {
                return errorMessage != obj.error;
            });
            document.querySelector('#error-mgn-' + obj.id).style.display = 'none';
            helperFn.removeClass(obj.input, 'error-highlight');
        } else {
            if (helperFn.exists('#error-mgn-' + obj.id)) {
                document.querySelector('#error-mgn-' + obj.id).style.display = 'none';
                helperFn.removeClass(obj.input, 'error-highlight');
            }
        }
    }

    function insertErrorMessage(obj) {
        if (formData.errorMessage.indexOf(obj.error) < 0 && !helperFn.exists('#error-mgn-' + obj.id)) {
            formData.errorMessage.push(obj.error);

            errorMessageDiv = helperFn.createNode({
                type: 'div',
                attr: {'class': 'error-message', 'id': 'error-mgn-' + obj.id},
                content: [obj.error]
            });

            helperFn.insertAfter(errorMessageDiv, obj.input);
            helperFn.addClass(obj.input, 'error-highlight');
        } else {
            document.querySelector('#error-mgn-' + obj.id).style.display = 'block';
        }
    }
})();