Validate Manager - Form Validation
==================================

A JavaScript tool for form validation.

### DEMO
http://hassanhibbert.com/validate-manager/

Download project
---
If you wish to download the latest project you can use the link below.

[Download Project Files Here](https://github.com/hassanhibbert/validate-manager/archive/master.zip)

NPM Install
---
First make sure you have installed the latest version of [node.js](http://nodejs.org/)
(You may need to restart your computer after this step).

 Use the command line below to install

`npm install validate-manager`

Setup
---
 - Load the script into your page. 
 - Add a `data-vm` validate attribute to your form element (List of attribute methods below). 
 - Pass the form name to `ValidateManager('formname')`. 
 - Then call the `validate` method. 

Sample styles for error messages can be found in the demo/css directory of the project.

**Note**: Form element names are required.

```html
<form name="myform">
  <input name="field1" data-vm-required="true">
</form>
<script src="validate.manager.js"></script>
<script>
  ValidateManager('myform').validate();
</script>
```

HTML Attributes
---
The below table displays all of the default attribute validation rules.

| Attribute        | Type     | Description |  Method Used
|:------------- |:------------- |:------------ |:--------------
| `data-vm-letters-only="true"` | `Boolean` | Test for valid alphabetic characters | `lettersOnly`
| `data-vm-required="true"` | `Boolean` | Test if the form field has a value | `required`
| `data-vm-email="true"`| `Boolean` | Test for a valid email | `email`
| `data-vm-minlength="2"`  | `Number` |  Test if the value is at a minimum length | `minlength`
| `data-vm-maxlength="2"`  | `Number` |  Test if the value is at a maximum length | `maxlength`
| `data-vm-range="[5,10]"`  | `Array` |  Test if the value is between a range of two numbers | `range`
| `data-vm-equal-to="elementName"`  | `String` |  Test if the value is equal to another elements value  | `equalTo`
| `data-vm-digits="true"`  | `Boolean` |  Test if the value is a valid digit | `digits`

HTML Attributes - Usage
---
##### Input (lettersOnly and required)
Using the attribute `data-vm-required="true"` and `data-vm-letters-only="true">` will make the input field required and the value to be validated for alphabetic letters only.
```html
<input name="fullname" type="text" 
       data-vm-required="true" 
       data-vm-letters-only="true">
```
##### Input (email)
Using the attribute `data-vm-email="true"` will validate input for a valid email address.
```html
<input name="email" type="text" data-vm-email="true" >
```

##### Input Checkbox (required and minlength)
When validating a group such as checkboxes or radio buttons. Only the first form element in the group needs the validation attributes. Error messages will be displayed after the last element in the group.

**Tip**: using `data-vm-minlength` with checkboxes allows validation for that set amount to be selected
```html
<input type="checkbox" name="newsletter" id="sports" value="sports" 
       data-vm-required="true" 
       data-vm-minlength="2"/>
<input type="checkbox" name="newsletter" id="computers" value="computers"/>
<input type="checkbox" name="newsletter" id="photography" value="photography"/>
```

ValidateManager - config options
---

| Property | Type | Default | Description |
|--------|------|-----|-------|
| `formName` | `String` | `null` | Pass the name of the form to this property. | 
| `onSubmitHandler` | `Function` | `null`| Callback function for form submissions. | 
| `debug` | `Boolean` | `false` | This will prevent the form from being submitted.| 
| `validateOnChange` | `Boolean` | `true`|Flag for validating when onChange is triggered.| 
| `resetFormOnSubmit` | `Boolean` | `true`| Flag for resetting the form when onSubmit is triggered and form  is valid.| 

ValidateManager - config options structure
---
```javascript
{
  formName: 'formname',
  onSubmitHandler: function (event, data, form) {
    // code here..
  },
  debug: false,
  validateOnChange: true,
  resetFormOnSubmit: true
}
```

ValidateManager Usage
---
There are three ways you can use `ValidateManager()`.

##### Example - #1 ValidateManager(formName)
This the simplest way.
```javascript
ValidateManager('formname').validate();
```

##### Example - #2 ValidateManager(formName, options)
This is where you can add a second argument which would be the config options.

```javascript
var form = ValidateManager('formname', {
  // config options here...
});

form.validate();
```

##### Example - #3 ValidateManager(options)
This is where you can just pass in one config object. Make sure to assign the form name to the property `formName`.
```javascript
var form = ValidateManager({
  formName: 'formname', // <-- Required form name
  // config options here...
});

form.validate();
```

ValidateManager - config options `onSubmitHandler` 
---

```javascript
var form = ValidateManager('formname', {
  onSubmitHandler: function (event, data, form) {
    // form.submit();
    // Submit form or process the `data` object
    // You can include your own Ajax calls within here as well
  }
});

form.validate();
````

**onSubmitHandler** callback function arguments
1. **event**
    - The onSubmit event object
2. **data**
    - An object containing the values of the form
3. **form**
    - The main form element 

Methods
---


#### .validate(options)
The `validate` method kicks off the initialization of the form. Validate options can be used to programmatically set validation rules or create custom error messaging.

##### options structure
```javascript
{
  'form-element-name': {
    
    // Setting rules
    rules: {
      required: true,
      equalTo: 'email' // other form element name to compare
    },
    
    // Creating custom error messages
    message: { 
      equalTo: 'Email address does not match.',
      required: 'Please enter the same email.'
    }
  }
}
```

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
  var form = ValidateManager('myform');
  
  form.validate({
    'confirm-email': {
      message: { 
        equalTo: 'Email address does not match.',
        required: 'Please enter the same email.'
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
  var form = ValidateManager('myform');
  
  // set validation rules
  form.validate({
    'firstname': {
      rules: { required: true, lettersOnly: true, minlength: 2 }
    },
    'lastname': {
      rules: { required: true, lettersOnly: true, minlength: 2 }
    },
    'email': {
      rules: { email: true, required: true }
    }
  });
</script>

```

#### .destroy()
The `destroy` method would be useful for single page applications when the events would need to be cleaned up during the destroy phase of the app.

##### Example
```html
<form name="myform">
  <input type="text" name="fullname" data-vm-required="true">
</form>

<script>
  var form = ValidateManager('myform');
  form.validate();
  
  // Sometime later in the application when you need to
  // clean up some event handlers.
  form.destroy();
</script>

```

#### .addMethod(methodName, callback, errorMessage)
With `addMethod()` you are able to add your own custom method for validation.

**Note**: When creating a method name that is camel case `.addMethod('exampleMethod'...)` use Kebab Case when implementing html attributes `data-vm-example-method="true"`
##### Example
```html
<form name="myform">
  <input type="text" name="number-five" data-vm-is-five="true">
</form>

<script>
  var form = ValidateManager('myform');
  
  form.addMethod('isFive', function (value1, value2, formElement) {
    return parseInt(value1) === 5;
  }, 'Not equal to 5.');
  
  form.validate();
</script>
```

`.addMethod(methodName, callback, errorMessage)`
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
    - The error message what will be displayed when validation fails



