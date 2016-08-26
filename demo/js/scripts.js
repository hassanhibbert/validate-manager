var myForm = validateManager({
  formElement: 'myForm',
  preventSubmit: true,
  onSuccess: function (data) {
    console.log('data: ', data);
    document.querySelector('#success').innerHTML = JSON.stringify(data);
  }
});

myForm.addMethod('isFive', function(value) {
  return parseInt(value) === 5;
}, 'Not equal to 5!');

myForm.validate({
  input: 'name',
  required: true,
  rules: { lettersOnly: true },
}, {
  input: 'initial',
  rules: { maxLength: 2, minLength: 2 }
}, {
  input: 'operatingSystem',
  required: true
}, {
  input: 'age',
  rules: { isFive: true }
}, {
  input: 'car',
  required: true,
  message: {
    required: 'custom message: please fill out this field',
  },
}, {
  input: 'newsletter',
  required: true,
  rules: {
    minLength: 2
  },
  message: {
    minLength: 'Please select at least 2 newsletters.'
  }
});







