/**
 * Created by Hassan on 6/6/2016.
 */

var submitButton = document.getElementById('submit_button');

submitButton.addEventListener('click', function() {
    var name = document.getElementById('name'),
        age = document.getElementById('age'),
        car = document.getElementById('car');

    validateManager.validate([
        {
            validateFn: validate.hasValue,
            input: name,
            error: 'Please fill in your name'
        },
        {
            validateFn: validate.isNumber,
            input: age,
            error: 'Age has to be a number'
        },
        {
            validateFn: validate.hasSelection,
            input: car,
            error: 'Please select a car'
        }
    ], function(data) {
        //success
        var successDiv = document.getElementById('success');
        if (successDiv.innerHTML == '') {
            data.forEach(function(obj) {
                var value = obj.value,
                    category = obj.input.id;
                successDiv.innerHTML += category.toUpperCase() + ': '  + value + '<br/>';
            });
        }
    });

});
