var myForm = validateManager({
  formElement: 'myForm',
  preventSubmit: true,
  onSuccess: function (data) {
    console.log('form complete');
    console.log('data from form: ', data);
  }
});

myForm.addMethod('isFive', function(value) {
  return parseInt(value) === 5;
}, 'Not equal to 5!');

myForm.validate({
  input: 'name',
  required: true,
  rules: { lettersOnly: true },
  message: {
    required: 'my custom message required',
    lettersOnly: 'my custom letters only'
  }
}, {
  input: 'initial',
  rules: { maxLength: 2, minLength: 2 }
}, {
  input: 'operatingSystem',
  rules: { radio: true }
}, {
  input: 'age',
  rules: { isFive: true }
}, {
  input: 'car',
  required: true
});







