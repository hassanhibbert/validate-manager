// Helpers
function block(func) {
  var args = Array.prototype.slice.call(arguments, 1);
  return function () {
    return func.apply(null, args);
  };
}

function expected(prop, value) {
  return function (obj) {
    var objValue = obj[prop] || obj;
    return objValue === value;
  };
}

// ====================================================================== //
// Validate Manager
// ====================================================================== //

QUnit.module('ValidateManager');

QUnit.test("Call with a valid form name", function (assert) {
  var form1 = ValidateManager('form1');
  var instanceType = Object.prototype.toString.call(form1);
  assert.equal(instanceType, '[object Object]', 'ValidateManager instance should return an object');
  form1.destroy();
});

QUnit.test("Error Handling: Call with a form name that does not exists", function (assert) {
  assert.throws(
    block(ValidateManager, 'formNameThatDoesNotExist'),
    expected('message', 'Could not find a form element'),
    'Raised error when ValidateManager is called a form name that doesn\'t exist'
  );
});

QUnit.test("Error Handling: Call with an array", function (assert) {
  assert.throws(
    block(ValidateManager, [[]]),
    expected('message', 'Not a valid string or an object.'),
    'Raised error when ValidateManager is called with an array'
  );
});

QUnit.test("Error Handling: Call with no arguments", function (assert) {
  assert.throws(
    block(ValidateManager),
    expected('message','Form name or config object is required'),
    'Raised error when ValidateManager is called with no arguments'
  );
});

QUnit.test("Error Handling: Call with undefined", function (assert) {
  assert.throws(
    block(ValidateManager, undefined),
    expected('message', 'Not a valid string or an object.'),
    'Raised error when ValidateManager is called with undefined'
  );
});

QUnit.test("Error Handling: Call with an empty object", function (assert) {
  assert.throws(
    block(ValidateManager, {}),
    expected('message', 'Could not find a form element'),
    'Raised error when ValidateManager is called with an empty object'
  );
});

QUnit.test("Error Handling: Call with a number", function (assert) {
  assert.throws(
    block(ValidateManager, 5),
    expected('message', 'Not a valid string or an object.'),
    'Raised error when ValidateManager is called with a number'
  );
});

// ====================================================================== //
// Validate Manager - Options
// ====================================================================== //

QUnit.module('ValidateManager - Options');

QUnit.test("Call with a valid form name and empty options", function (assert) {
  var form1 = ValidateManager('form1', {});
  var instanceType = Object.prototype.toString.call(form1);
  assert.equal(instanceType, '[object Object]', 'ValidateManager instance should return an object');
  form1.destroy();
});

QUnit.test("Set debug option to true", function (assert) {
  var form1 = ValidateManager('form1', { debug: true });
  var instanceType = Object.prototype.toString.call(form1);
  assert.equal(instanceType, '[object Object]', 'ValidateManager instance should return an object');
  assert.equal(form1.options.debug, true, 'Debug option is set to true');
  form1.destroy();
});

QUnit.test("Set validateOnChange option to false", function (assert) {
  var form1 = ValidateManager('form1', { validateOnChange: false });
  var instanceType = Object.prototype.toString.call(form1);
  assert.equal(instanceType, '[object Object]', 'ValidateManager instance should return an object');
  assert.equal(form1.options.validateOnChange, false, 'validateOnChange option is set to false');
  form1.destroy();
});

QUnit.test("Call with a valid form name and options with incorrect form name assigned to formName property", function (assert) {
  var form1 = ValidateManager('form1', { formName: 'incorrectFormName' });
  var instanceType = Object.prototype.toString.call(form1);
  assert.equal(instanceType, '[object Object]', 'ValidateManager instance should return an object. It assigns the correct form name');
  form1.destroy();
});

QUnit.test("Call with an object that has a valid form name assigned to the property formName", function (assert) {
  var form1 = ValidateManager({ formName: 'form1' });
  var instanceType = Object.prototype.toString.call(form1);
  assert.equal(instanceType, '[object Object]', 'ValidateManager instance should return an object');
  form1.destroy();
});

QUnit.test("Error Handling: Call with an object that form name that does not exists assigned to the property formName", function (assert) {
  assert.throws(
    block(ValidateManager, { formName: 'formNameThatDoesNotExist' }),
    expected('message', 'Could not find a form element'),
    'Raised error when ValidateManager is called a form name that doesn\'t exist'
  );
});

QUnit.test("Error Handling: Call with an object that has an incorrect property name", function (assert) {
  assert.throws(
    block(ValidateManager, { formNamee: 'formNameThatDoesNotExist' }),
    expected('message', 'Could not find a form element'),
    'Raised error when ValidateManager is called a form name that doesn\'t exist'
  );
});

QUnit.test("Error Handling: Call with two arguments and when the second argument is an array", function (assert) {
  assert.throws(
    block(ValidateManager, 'form1', []),
    expected('message', 'Second argument should be an object.'),
    'Raised error when ValidateManager is called with a second argument of array');
});

QUnit.test("Error Handling: Call with two arguments and when the first argument is an array", function (assert) {
  assert.throws(
    block(ValidateManager, [], []),
    expected('message', 'First argument should be a string.'),
    'Raised error when ValidateManager is called with a first argument of array'
  );
});

// ====================================================================== //
// Validate Manager - Methods
// ====================================================================== //

QUnit.module('ValidateManager - Methods');

QUnit.test("validate() with proper attributes in form", function (assert) {
  var form1 = ValidateManager('form1');
  form1.validate();
  assert.equal(form1.form.validationList.length, 2, 'Validation list length should equal 2');
  form1.destroy();
});

QUnit.test("validate() with proper attributes not applied in form", function (assert) {
  var form2 = ValidateManager('form2');
  form2.validate();
  assert.equal(form2.form.validationList.length, 0, 'Validation list length should equal 0');
  form2.destroy();
});

QUnit.test("Error Handling: validate() called with argument that is not an object", function (assert) {
  var form1 = ValidateManager('form1');
  assert.throws(
    block(form1.validate.bind(form1), 'ohhnooo'),
    expected('message', 'The argument passed to the validate method is not an object.'),
    'Raised error when ValidateManager is called with a first argument of array'
  );
  form1.destroy();
});


