(function(validateMethod) {

    validateMethod.hasValue = function(value) {
        return !(value.length === 0 || value.trim() == "" || value == null);
    };

    validateMethod.isNumber = function(n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    };

    validateMethod.isAlpha = function(value) {
        var regExNumber = /[0-9]+/;
        return !(regExNumber.test(value));
    };

})(validateManager.fn);




