var myForm = validateManager({
  formName: 'myForm',
  onSuccess: function (data) {
    console.log('form complete');
  }
});

myForm.validate({
  input: 'name',
  required: true,
  rules: { isAlpha: true }
}, {
  input: 'initial',
  rules: { maxLength: 2, minLength: 2 }
}, {
  input: 'operatingSystem',
  rules: { radio: true }
}, {
  input: 'age',
  rules: { number: true }
}, {
  input: 'car',
  required: true
});

// validateManager.config([
//   {
//     input: '#name',
//     required: true,
//     rules: [
//       {
//         method: validateManager.method.hasValue,
//         error: 'Please fill in your name'
//       },
//       {
//         method: validateManager.method.isAlpha,
//         error: 'Letters only'
//       }
//     ]
//   },
//   {
//     input: '#initial',
//     maxLength: 2,
//     rules: [
//       {
//         method: validateManager.method.maxLength,
//         error: 'Max length is 2 characters'
//       }
//     ]
//   },
//   {
//     name: 'operatingSystem',
//     rules: [
//       {
//         method: validateManager.method.radio,
//         error: 'Please select an operating system'
//       }
//     ]
//   },
//   {
//     input: '#age',
//     rules: [
//       {
//         method: validateManager.method.isNumber,
//         error: 'Age has to be a number'
//       }
//     ]
//
//   },
//   {
//     input: '#car',
//     required: true,
//     rules: [
//       {
//         method: validateManager.method.hasValue,
//         error: 'Please select a car'
//       }
//     ]
//   }
// ]);

//
// validateManager.init({
//   formId: '#myForm',
//   submitButton: '#submit_button',
//   successCallback: processForm,
//   validateOnKeyUp: true
// });
//
// function processForm(data) {
//   //success
//   var successDiv = document.getElementById('success');
//   successDiv.innerHTML = JSON.stringify(data);
//   console.log(data);
// }

