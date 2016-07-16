
validateManager.config([
    {
        input: '#name',
        required: true,
        rules: [
            { 
                validateFn: validateManager.fn.hasValue,
                error: 'Please fill in your name' 
            },
            { 
                validateFn: validateManager.fn.isAlpha,
                error: 'Letters only'
            }
        ]
    },
    {
        input: '#initial',
        maxLength: 2,
        rules: [
            {
                validateFn: validateManager.fn.maxLength,
                error: 'Max length is 2 characters'
            }
        ]
    },
    {
        name: 'operatingSystem',
        rules: [
            {
                validateFn: validateManager.fn.radio,
                error: 'Please select an operating system'
            }
        ]
    },
    {
        input: '#age',
        rules: [
            {
                validateFn: validateManager.fn.isNumber,
                error: 'Age has to be a number'
            }
        ]
        
    },
    {
        input: '#car',
        required: true,
        rules: [
            {
                validateFn: validateManager.fn.hasValue,
                error: 'Please select a car',
            }
        ]
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

