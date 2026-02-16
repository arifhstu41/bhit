/*

Int64 - A JavaScript Library for working with 
64-bit hex integers in JavaScript, which supports
only 32-bit bitwise operations.

*/

function bitValues(
    value  // The 64-bit value, as a 32-bit integer or a hex string.
    ) {
    var _self = this,
        _hidword = null,
        _lodword = null;

    var isBitValue = function (obj) {
        return obj.constructor.toString() === _self.constructor.toString();
    },
    fromWords = function (hdw, ldw) {
        var hex = ('00000000' + hdw.toString(16)).slice(-8) +
            ('00000000' + ldw.toString(16)).slice(-8);
        return new bitValues(hex);
    },
    bitAnd = function (bitValue) {
        var hdw = _hidword & bitValue.hidword(),
            ldw = _lodword & bitValue.lodword();
        return fromWords(hdw, ldw);
    },
    bitOr = function (bitValue) {
        var hdw = _hidword | bitValue.hidword(),
            ldw = _lodword | bitValue.lodword();
        return fromWords(hdw, ldw);
    },
    bitNot = function () {
        var hdw = ~_hidword,
            ldw = ~_lodword;
        return fromWords(hdw, ldw);
    };

    _self.hidword = function () {
        return _hidword;
    };

    _self.lodword = function () {
        return _lodword;
    };

    _self.value = function () {
        return _hidword === null ?
            null :
            (Number(_hidword).toString(16) + ('00000000' + Number(_lodword).toString(16)).slice(-8)).replace(/(^0+)/, '');
    };

    _self.isBitSet = function (value) {
        var _value = new bitValues(value),
            andResult = bitAnd(_value);
        return andResult.hidword() > 0 || andResult.lodword() > 0;
    };

    _self.setBit = function (value) {
        var _value = new bitValues(value);

        _hidword |= _value.hidword();
        _lodword |= _value.lodword();
        };

    _self.unsetBit = function (value) {
        var _value = new bitValues(value);

        _hidword &= ~_value.hidword();
        _lodword &= ~_value.lodword();
    };

    _self.isZero = function () {
        return _hidword === 0 && _lodword === 0;
    };

    _self.arrayText = function (array, valueProperty, textProperty) {
        var labels = [],
            unwrap = (ko && ko.unwrap) ? ko.unwrap : function (obj) { return obj; };

        valueProperty = valueProperty || 'value';
        textProperty = textProperty || 'text';

        $.each(array, function (index, item) {
            var _item = unwrap(item),
                propertyValue = _item[textProperty];

            if (_self.isBitSet(_item[valueProperty])) {
                labels.push(typeof propertyValue === 'function' ? propertyValue() : propertyValue);
            }
        });

        return labels;
    };

    if (value) {
        if (isBitValue(value)) {
            _hidword = value.hidword();
            _lodword = value.lodword();
        }
        else {
            if (typeof value != 'string')
                value = Number(value).toString(16);

            _lodword = parseInt(value.slice(-8), 16) || 0;
            _hidword = parseInt(value.slice(-16, -8), 16) || 0;
        }
    }
}

