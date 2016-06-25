/**
 * Created by Hassan on 6/6/2016.
 */


validateManager.config([
    {
        input: '#name',
        multiValidation: [
            {
                validateFn: inputValidate.hasValue,
                error: 'Please fill in your name'
            },
            {
                validateFn: inputValidate.isAlpha,
                error: 'Please do not use special characters or numbers'
            }

        ],
        required: true
    },
    {
        validateFn: inputValidate.isNumber,
        input: '#age',
        error: 'Age has to be a number',
        required: true
    },
    {
        validateFn: inputValidate.hasSelection,
        input: '#car',
        error: 'Please select a car'
    }
]);

validateManager.init({
    formId: '#myForm',
    submitButton: '#submit_button',
    successCallback: processForm,
    validateOnSubmit: false
});

function processForm(data) {

    //success
    var successDiv = document.getElementById('success');
    successDiv.innerHTML = '';

    data.forEach(function(obj) {
        var value = obj.value,
            category = obj.input.id;
        successDiv.innerHTML += category.toUpperCase() + ': '  + value + '<br/>';
    });

}

