
validateManager.config([
    {
        input: '#name',
        rules: [
            { 
                validateFn: validateManager.fn.hasValue,
                error: 'Please fill in your name' 
            },
            { 
                validateFn: validateManager.fn.isAlpha,
                error: 'Letters only'
            }
        ],
        required: true
    },
    {
        input: '#initial',
        validateFn: validateManager.fn.maxLength,
        maxLength: 2,
        error: 'Max length is 2 characters'
    },
    {
        name: 'operatingSystem',
        validateFn: validateManager.fn.radio,
        error: 'Please select an operating system'
    },
    {
        input: '#age',
        validateFn: validateManager.fn.isNumber,
        error: 'Age has to be a number'
    },
    {
        input: '#car',
        validateFn: validateManager.fn.hasValue,
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

