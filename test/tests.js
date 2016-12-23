QUnit.module('ValidateManager');

QUnit.test("Instantiating Constructor", function (assert) {
  var form1 = new ValidateManager({ formElement: 'form1' });
  var instanceType = Object.prototype.toString.call(form1);
  var validationConfig = [
    { fieldName: 'firstName', required: true },
    { fieldName: 'lastName' }
  ];

  form1.validate(validationConfig);
  assert.equal(instanceType, '[object Object]', 'The instance should return an object');
  assert.equal(form1.form.validationList.length, 2, 'Validation list should have a length of');
});

QUnit.test("valid() Method", function (assert) {
  var $firstName = $('[name=firstName]');
  var form1 = new ValidateManager({ formElement: 'form1' });
  var validationConfig = [
    { fieldName: 'firstName', required: true },
    { fieldName: 'lastName'}
  ];

  form1.validate(validationConfig);

  assert.ok(!form1.valid(), 'Form is not valid');
  $firstName.val('Hassan');
  assert.ok(form1.valid(), 'Form should be valid now');
});

QUnit.test("getInvalidCount() Method", function (assert) {
  var $username = $('[name=username]');
  var $password = $('[name=password]');
  var form2 = new ValidateManager({ formElement: 'form2' });

  form2.validate({
    fieldName: 'username',
    required: true
  }, {
    fieldName: 'password',
    required: true
  });

  assert.equal(form2.getInvalidCount(), 2, 'Invalid count should equal 2');
  $username.val('hhibbert');
  $password.val('password');
  assert.equal(form2.getInvalidCount(), 0, 'Invalid count should equal 0')
});

QUnit.test("getInvalidList() Method", function (assert) {
  var $email = $('[name=username]');
  var $hobby = $('[name=password]');
  var form3 = new ValidateManager({ formElement: 'form3' });

  form3.validate({
    fieldName: 'email',
    required: true,
    rules: { email: true }
  }, {
    fieldName: 'hobby',
    required: true,
    rules: { minLength: 2 }
  }, {
    fieldName: 'car',
    required: true
  });

  assert.equal(form3.getInvalidList().length, 3, 'Invalid list should equal 3');
  assert.equal($.isArray(form3.getInvalidList()), $.isArray([]), 'Invalid list should equal to an array');
});

