# Validate Manager - Form Validation
A JavaScript tool for form validation.
### Setup
Load the script into your page. Set the `formElement` property to the forms name property. Then call the `validate` method. 

Note: Form element names are required.

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

### Validation Methods
The below table displays all of the default validation methods built into `ValidateManager`. Custom methods can be added as well; explained below.

| Attribute        | Type     | Description | Internal Method Used
|:------------- |:------------- |:------------ |:--------------
| `data-vm-letters-only="true"` | `Boolean` | Checks for valid alphabetic characters | `lettersOnly`
| `data-vm-required="true"` | `Boolean` | Checks if the form field has a value | `required`
| `data-vm-email="true"`| `Boolean` | Checks for a valid email | `email`
| `data-vm-minlength="2"`  | `Number` |  Checks if value is at a minimum length | `minlength`
| `data-vm-maxlength="2"`  | `Number` |  Checks if value is at a maximum length | `maxlength`
| `data-vm-range="[5,10]"`  | `Array` |  Checks if value is between a range two numbers | `range`
| `data-vm-equal-to="elementName"`  | `String` |  Checks if value is equal to the value of the form element name provided | `equalTo`
| `data-vm-digits="true"`  | `Boolean` |  Checks if value is a valid digit | `digits`

#### Example Usage

##### - Input (lettersOnly and required)
Using the attribute `data-vm-required="true"` and `data-vm-letters-only="true">` will make the input field required and the value to be validated for alphabetic letters only.
```
<input name="fullname" 
       type="text" 
       data-vm-required="true" 
       data-vm-letters-only="true">
```
##### - Input (email)
Using the attribute `data-vm-email="true"` will validate input for a valid email address.
```
<input name="email" type="text" data-vm-email="true" >
```

### Custom Validation Methods
Here is an example of how you would add your own custom method

`.addMethod(methodName, callback, errorMessage)`
1. **methodName**
  - The name of your custom method
2. **callback**
  - Function used to test a value, taking three arguments:
    - **value1**
      - The value from the form field
    - **value2**
      - The value to test against. Usually used for `minlength`,`maxlength`, `range`, and `equalTo`.
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
  }, 'Note equal to 5.');
  
  myform.validate();
</script>

```

### Custom Error Messages
Here is an example of how you would add your own custom error messaging

```html
<form name="myform">
  <input type="text" name="fullname" data-vm-required="true" data-vm-minlength="2">
</form>

<script>
  var myform = ValidateManager({ formElement: 'myform' });
  
  myform.validate({
    'fullname': {
      message: { 
        required: 'Please enter your full name. It is required.' ,
        minlength: 'Please enter a name that is 2 or more characters'
      }
    }
  });
</script>
```

### Submit Handler
Here is an example of how to use the submit handler callback option

```html
<form name="sample">
  <input type="text" name="zipcode"  data-vm-digits="true">
</form>
<script>
var sampleForm = ValidateManager({
    formElement: 'sample',
    onSubmitHandler: function (event, data, form) {
      // This is where you can handle your form submit
      // form.submit();
      // {data} form values
      // {event} on submit event object
      // {form} form element
    }
  });

sampleForm.validate();
</script>

```

