validateManager.extend(validateManager.fn, {
    hasValue: function(value) {
        console.log(value)
        return !(value.length === 0 || value.trim() == "" || value == null);
    },
    isNumber: function(n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    },
    isAlpha: function(value) {
        var regExNumber = /[0-9]+/;
        return !(regExNumber.test(value));
    },
    maxLength: function(value) {
        return (value.currLength <= value.maxLength);
    },
    minLength: function(value) {
        return (value.currLength >= value.minLength);
    },
    equalTo: function(value) {
        var element = document.querySelector(value.selector);
        return (value.currValue === element.value);
    },
    email: function(email) {
        var emailRegEx = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return emailRegEx.test(email);
    },
    radio: function(radioNodeList) {
        //console.log(radioNodeList);
        for (var i = 0; i < radioNodeList.length; ++ i) {
            if (radioNodeList[i].checked) {
                return true;
                //console.log(radioNodeList[i]);
            }
        }
        return false;
    }
});



