/**
 * Created by Hassan on 6/6/2016.
 */


validateManager.config([
    {
        input: '#name',
        multiValidation: [
            { validateFn: inputValidate.hasValue, error: 'Please fill in your name' },
            { validateFn: inputValidate.isAlpha, error: 'Please do not use special characters or numbers' }
        ],
        required: true
    },
    {
        validateFn: inputValidate.isNumber,
        input: '#age',
        error: 'Age has to be a number'
    },
    {
        validateFn: inputValidate.hasValue,
        input: '#car',
        error: 'Please select a car',
        required: true

    }
]);

validateManager.init({
    formId: '#myForm',
    submitButton: '#submit_button',
    successCallback: processForm
});

function processForm(data) {

    //success
    var successDiv = document.getElementById('success');
    successDiv.innerHTML = JSON.stringify(data);
    console.log(data);
}

