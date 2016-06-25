/**
 * Created by Hassan on 6/6/2016.
 */


validateManager.config([
    {
        input: '#name',
        multiValidation: [
            { 
                validateFn: validateManager.fn.hasValue, 
                error: 'Please fill in your name' 
            },
            { 
                validateFn: validateManager.fn.isAlpha, 
                error: 'Please do not use special characters or numbers' 
            }
        ],
        required: true
    },
    {
        validateFn: validateManager.fn.isNumber,
        input: '#age',
        error: 'Age has to be a number'
    },
    {
        validateFn: validateManager.fn.hasValue,
        input: '#car',
        error: 'Please select a car',
        required: true
    }
]);


validateManager.init({
    formId: '#myForm',
    submitButton: '#submit_button',
    successCallback: processForm,
    validateOnKeyUp: true
});

function processForm(data) {

    //success
    var successDiv = document.getElementById('success');
    successDiv.innerHTML = JSON.stringify(data);
    console.log(data);
}

