/**
 * Created by Hassan on 6/6/2016.
 */


var validateManager = (function() {

    var validationStatus,

        // module API
        publicAPI,

        // error handling options
        errorHandling = {
            singleDiv: null,
            highlightInput: true,
            insertAfter: true
        },

        // collection of form values
        formValues = [];

    publicAPI = {
        validate: validate,
        config: config
    };

    return publicAPI;

    /**
     * Configure error options
     * @param obj
     *
     * Example:
     * validateManager.config({
     *     highlightInput: true,
     *     insertAfter: true,
     *     singleErrorDiv: document.getElementById('error')
     * });
     *
     */
    function config(obj) {
        errorHandling.singleDiv = obj.error.singleErrorDiv;
        errorHandling.highlightInput = obj.error.highlightInput;
        errorHandling.insertAfter = obj.error.insertAfterInput;
    }

    function validate(inputFields, callback) {
        errorHandling.messages = [];
        
        if (errorHandling.singleDiv) {
            errorHandling.singleDiv.innerHTML = '';
        }

        validationStatus = true;

        if (helperFn.exists('.error-message')) {
            helperFn.removeElement('.error-message');
        }

        inputFields.forEach(function(obj) {
            if (obj.validateFn(obj.input.value)) {
                helperFn.removeClass(obj.input, 'error-highlight');
                formValues.push({input: obj.input, value: obj.input.value});
            } else {
                errorHandling.messages.push(obj.error);
                validationStatus = false;

                if(errorHandling.insertAfter) {
                    errorHandling.multiDiv = helperFn.createNode({
                        type: 'div',
                        attr: {'class': 'error-message'},
                        content: [obj.error]
                    });
                    helperFn.insertAfter(errorHandling.multiDiv, obj.input);
                }

                if (errorHandling.highlightInput) {
                    helperFn.addClass(obj.input, 'error-highlight');
                }
            }
        });

        if (validationStatus) {
            callback(formValues);
        } else {
            if (errorHandling.singleDiv) {
                errorHandling.singleDiv.innerHTML = errorHandling.messages[0];
            }
            formValues = [];
        }
    }

})();



