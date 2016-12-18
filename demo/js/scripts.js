var myForm = new ValidateManager({
  formElement: 'myForm',
  onSubmitHandler: function (event, data, form) {
    // form.submit();
    console.log('data: ', data);
    document.querySelector('#success').innerHTML = JSON.stringify(data);
  }
});

myForm.addMethod('isFive', function(value) {
  return parseInt(value) === 5;
}, 'Not equal to 5!');

myForm.validate({
  fieldName: 'name',
  required: true,
  rules: { lettersOnly: true },
}, {
  fieldName: 'initial',
  rules: { maxLength: 2, minLength: 2 }
}, {
  fieldName: 'operatingSystem',
  required: true
}, {
  fieldName: 'age',
  rules: { isFive: true }
}, {
  fieldName: 'car',
  required: true,
  message: {
    required: 'custom message: please fill out this field',
  },
}, {
  fieldName: 'newsletter',
  required: true,
  rules: {
    minLength: 2
  },
  message: {
    minLength: 'Please select at least 2 newsletters.'
  }
});







