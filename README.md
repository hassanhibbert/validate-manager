# Validate Manager - Form Validation
A JavaScript tool for form validation.

### DEMO
http://hassanhibbert.com/validate-manager/

### Setup

[Download Project Files Here](https://github.com/hassanhibbert/validate-manager/archive/master.zip])

Load the script into your page. Set the `formElement` property to the forms name property. Then call the `validate` method. 

Sample styles for error messages can be found in the demo/css directory of the project.

*Note: Form element names are required.*

```html
<form name="myform">
  <input name="field1" data-vm-required="true">
</form>
<script src="validate.manager.js"></script>
<script>
  var myform = ValidateManager({ formElement: 'myform' });
  myform.validate();
</script>
```

### Validation Methods - HTML Attributes
The below table displays all of the default validation methods built into `ValidateManager`. Custom methods can be added as well; explained below.

| Attribute        | Type     | Description |  Method Used
|:------------- |:------------- |:------------ |:--------------
| `data-vm-letters-only="true"` | `Boolean` | Checks for valid alphabetic characters | `lettersOnly`
| `data-vm-required="true"` | `Boolean` | Checks if the form field has a value | `required`
| `data-vm-email="true"`| `Boolean` | Checks for a valid email | `email`
| `data-vm-minlength="2"`  | `Number` |  Checks if value is at a minimum length | `minlength`
| `data-vm-maxlength="2"`  | `Number` |  Checks if value is at a maximum length | `maxlength`
| `data-vm-range="[5,10]"`  | `Array` |  Checks if value is between a range two numbers | `range`
| `data-vm-equal-to="elementName"`  | `String` |  Checks if the value is equal to another elements value  | `equalTo`
| `data-vm-digits="true"`  | `Boolean` |  Checks if value is a valid digit | `digits`

#### Example - HTML Attributes

##### - Input (lettersOnly and required)
Using the attribute `data-vm-required="true"` and `data-vm-letters-only="true">` will make the input field required and the value to be validated for alphabetic letters only.
```html
<input name="fullname" 
       type="text" 
       data-vm-required="true" 
       data-vm-letters-only="true">
```
##### - Input (email)
Using the attribute `data-vm-email="true"` will validate input for a valid email address.
```html
<input name="email" type="text" data-vm-email="true" >
```

##### - Input Checkbox (required and minlength)
When validating a group such as checkboxes or radio buttons. Only the first form element in the group needs the validation attributes. Error messages will be displayed after the last element in the group.

*Tip: using `data-vm-minlength` with checkboxes allows validation for that set amount to be selected*
```html
<input type="checkbox" name="newsletter" id="sports" value="sports" 
       data-vm-required="true" 
       data-vm-minlength="2"/>
<input type="checkbox" name="newsletter" id="computers" value="computers"/>
<input type="checkbox" name="newsletter" id="photography" value="photography"/>
```

### ValidateManager() - Configuration
`ValidateManager` accepts a config object with options.

Function signature: `ValidateManager(configObject)`

| Property | Type | Description |
|--------|------|------------|
| `formElement` | `String` | Name of the form. Required. | 
| `onSubmitHandler` | `Function` | Callback function for form submissions| 
| `validateOnChange` | `Boolean` | Flag for validating when onChange is triggered. Default `true`| 
| `resetFormOnSubmit` | `Boolean` | Flag for resetting the form when onSubmit is triggered and form  is valid. Default `true`| 

##### Example - ValidateManager(config)
```javascript
var config = {
  formElement: 'sampleFormName',
  onSubmitHandler: function (event, data, form) {},
  validateOnChange: true,
  resetFormOnSubmit: true
};

var sampleForm = ValidateManager(config);
sampleForm.validate();
```

#### Example - onSubmitHandler 

```javascript
var config = {
  onSubmitHandler: function (event, data, form) {
    // form.submit();
    // Submit form or process the `data` object
    // You can include your own Ajax calls within here as well
  }
};
````

**onSubmitHandler** callback function arguments
1. **event**
    - The onSubmit event object
2. **data**
    - An object containing the values of the form
3. **form**
    - The current HTML form element 

### Methods


#### .validate()
The `validate` method kicks off the initialization of the form. Validate options can be used to programmatically set validation rules or create custom error messaging.

Function signature: `.validate(options)`
##### Example - custom error message
```html
<form name="myform">
  <input type="text" name="email" 
         data-vm-required="true" 
         data-vm-email="true">
         
  <input type="text" name="confirm-email" 
         data-vm-required="true" 
         data-vm-equal-to="email">
</form>

<script>
  var myform = ValidateManager({ formElement: 'myform' });
  
  myform.validate({
    'confirm-email': {
      message: { 
        equalTo: 'Email address does not match',
        required: 'Please enter the same email as above.'
      }
    }
  });
</script>

```
##### Example - set rules programmatically
```html
<form name="myform">
  <input type="text" name="firstname">
  <input type="text" name="lastname">
  <input type="text" name="email">
</form>

<script>
  var myform = ValidateManager({ formElement: 'myform' });
  
  // set rules
  var options = {
    'firstname': {
      rules: { required: true, lettersOnly: true, minlength: 2 }
    },
    'lastname': {
      rules: { required: true, lettersOnly: true, minlength: 2 }
    },
    'email': {
      rules: { email: true, required: true }
    }
  };
  
  // pass to validate method
  myform.validate(options);
</script>

```

#### .destroy()
The `destroy` method would be useful for single page applications where the events would need to destroyed when it's not needed.

Function signature: `.destroy()`

#### Example
```html
<form name="myform">
  <input type="text" name="fullname" data-vm-required="true">
</form>

<script>
  var myform = ValidateManager({ formElement: 'myform' });
  myform.validate();
  
  // sometime later
  myform.destroy();
</script>

```

#### .addMethod()
With `addMethod()` you are able to add your own custom method for validation.

*Note: When creating a method name that is camel case `.addMethod('exampleMethod', function(){}, 'message')` use Kebab Case when implementing html attributes `data-vm-example-method="true"`*

Function signature: `.addMethod(methodName, callback, errorMessage);`
1. **methodName**
  - The name of your custom method
2. **callback**
  - Function used to test a value, taking three arguments:
    - **value1**
      - The value from the form field
    - **value2**
      - The value to test against. 
      - Example `data-vm-minlength="5"` or `rules: { minlength: 5 }`. `value2` will be **5**.
    - **formElement**
      - The main form element.
3. **errorMessage**
    - The error message what will be displayed when the method is triggered 

#### Example
```html
<form name="myform">
  <input type="text" name="number-five" data-vm-is-five="true">
</form>

<script>
  var myform = ValidateManager({ formElement: 'myform' });
  
  myform.addMethod('isFive', function (value1, value2, formElement) {
    return parseInt(value1) === 5;
  }, 'Not equal to 5.');
  
  myform.validate();
</script>

```

