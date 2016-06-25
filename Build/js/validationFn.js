/**
 * Created by Hassan on 6/6/2016.
 */
var inputValidate = (function() {
    return {
        hasValue: function(value) {
            return !(value.length === 0 || value.trim() == "" || value == null);
        },
        isNumber: function(n) {
            return !isNaN(parseFloat(n)) && isFinite(n);
        },
        isAlpha: function(value) {
            var regExNumber = /[0-9]+/;
            return !(regExNumber.test(value));
        }
    };
})();

