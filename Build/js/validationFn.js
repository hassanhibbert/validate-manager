/**
 * Created by Hassan on 6/6/2016.
 */
var validate = (function() {
    return {
        hasValue: function(value) {
            return !(value.length == 0 || value.trim() == "" || value == null);
        },
        hasSelection: function (value) {
            return !(value === 'blank');
        },
        isNumber: function(n) {
            return (!isNaN(parseFloat(n)) && isFinite(n));
        }
    };
})();

