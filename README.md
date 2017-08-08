# Validate Manager - Form validation

A JavaScript tool for form validation.

### Setup
Load the script into your page. Set the `formElement` property to the forms name property. Then call the `validate` method. 

Note: Form element names are required.

```
<form name="myform">
  <input name="field1" data-vm-required="true">
</form>
<script src="validate.manager.js"></script>
<script>
  var myform = ValidateManager({ formElement: 'myform' });
  myform.validate();
</script>
```

### Internal Validation Methods
The below table displays all of the default validation methods built into `ValidateManager`. Custom methods can be added as well; explained below.

| Method        | Attribute     | Description  |
|:------------- |:------------- |:------------ |
| `lettersOnly` | `data-vm-letters-only` | checks for valid alphabetic characters |
| `email`      | `data-vm-email` | checks for a valid email |
| `minlength` | `data-vm-minlength` |  validates if value is at a minimum length |

### HTML Usage
Here are some examples of how to setup your form fields for validation using the `data-vm` html attribute.

#### - Input (lettersOnly and required)
Using the attribute `data-vm-required="true"` and `data-vm-letters-only="true">` will make the input field required and the value to be validated for alphabetic letters only.
```
<input name="fullname" 
       type="text" 
       data-vm-required="true" 
       data-vm-letters-only="true">
```
#### - Input (email)
Using the attribute `data-vm-email="true"` will validate input for a valid email address.
```
<input name="email" type="text" data-vm-email="true" >
```