// Custom utility methods.
ko.utils.htmlEscape = function (str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
};

ko.utils.htmlUnescape = function (value) {
    return String(value)
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&');
};

ko.utils.prepareInput = function (value) {
    return value.replace(/'/g, "\\'");
};

ko.utils.isEmptyId = function (id) {
    var _id = ko.unwrap(id);
    return !_id | _id === '00000000-0000-0000-0000-000000000000';
};

ko.utils.isBlank = function () {
    var isBlank = function (o) {
        var oo = ko.unwrap(o);
        return !oo || (oo.toString().trim() == '');
    };

    for (var i = 0; i < arguments.length; i++) {
        if (!isBlank(arguments[i]))
            return false;
    }

    return true;
};

function ensureId($element) {
    var id = $element.attr('id');

    if (!id) {
        var parentId = $element.closest('[id]').attr('id');

        do {
            id = parentId + '_' + String((new Date()).getTime() + Math.random());
        }
        while (!!document.getElementById(id))

        $element.attr('id', id);
    }

    return id;
}

var ieVersion = document && (function () {
    var version = 3, div = document.createElement('div'), iElems = div.getElementsByTagName('i');

    // Keep constructing conditional HTML blocks until we hit one that resolves to an empty fragment
    while (
        div.innerHTML = '<!--[if gt IE ' + (++version) + ']><i></i><![endif]-->',
        iElems[0]
    ) { }
    return version > 4 ? version : undefined;
}());

if (!ko.utils.forceRefresh) {
    ko.utils.forceRefresh = function(node) {
        // Workaround for an IE9 rendering bug - https://github.com/SteveSanderson/knockout/issues/209
        if (ieVersion >= 9) {
            // For text nodes and comment nodes (most likely virtual elements), we will have to refresh the container
            var elem = node.nodeType == 1 ? node : node.parentNode;
            if (elem.style)
                elem.style.zoom = elem.style.zoom;
        }
    };
}

if (!ko.utils.setTextContent) {
    ko.utils.setTextContent = function (element, textContent) {
        var value = ko.utils.unwrapObservable(textContent);
        if ((value === null) || (value === undefined))
            value = "";

        // We need there to be exactly one child: a text node.
        // If there are no children, more than one, or if it's not a text node,
        // we'll clear everything and create a single text node.
        var innerTextNode = ko.virtualElements.firstChild(element);
        if (!innerTextNode || innerTextNode.nodeType != 3 || ko.virtualElements.nextSibling(innerTextNode)) {
            ko.virtualElements.setDomNodeChildren(element, [document.createTextNode(value)]);
        } else {
            innerTextNode.data = value;
        }

        ko.utils.forceRefresh(element);
    };
}

ko.observableArray['fn'].wrapItems = function () {
    var underlyingArray = this.peek();
    this.valueWillMutate();
    $.each(underlyingArray, function (index, value) {
        underlyingArray[index] = ko.observable(value);
    });
    this.valueHasMutated();
};

var firstIndexOf = function (array, predicate, predicateOwner) {
    for (var index = 0; index < array.length; index++) {
        if (predicate.call(predicateOwner, array[index])) {
            return index;
        }
    }
    return -1;
};

ko.observableArray['fn'].firstIndexOf = function (predicate, predicateOwner) {
    var underlyingArray = this.peek();
    return firstIndexOf(underlyingArray, predicate, predicateOwner);
};

ko.observableArray['fn'].any = function (predicate, predicateOwner) {
    var underlyingArray = this.peek();
    return firstIndexOf(underlyingArray, predicate, predicateOwner) > -1;
};

ko.observableArray['fn'].getAt = function (index) {
    if (typeof index === 'function') {
        index = this.firstIndexOf(index);
    }

    return this()[index];
};

ko.observableArray['fn'].setAt = function (index, value) {
    if (typeof index === 'function') {
        index = this.firstIndexOf(index);
    }

    var underlyingArray = this.peek();
    this.valueWillMutate();

    if (index < underlyingArray.length) {
        underlyingArray[index] = ko.isObservable(underlyingArray[index]) ?
            ko.observable(ko.unwrap(value)) : value;
    }
    else if (underlyingArray.length === 0) {
        underlyingArray.push(value);
    }
    else {
        underlyingArray.push(ko.isObservable(underlyingArray[0]) ?
            ko.observable(ko.unwrap(value)) : value);
    }
    this.valueHasMutated();
};

var fillArray = function (array, capacity, value) {
    var length = array.length;

    var _value = ko.unwrap(value),
        getValue = function () {
            return typeof _value === 'function' ? _value() : _value;
        };

    for (var index = length; index < capacity; index++) {
        var _newValue = getValue();

        array.push(_newValue);
    }
};

ko.observableArray['fn'].fillArray = function (capacity, value) {
    var underlyingArray = this.peek(),
        length = underlyingArray.length;

    this.valueWillMutate();

    var _value = ko.unwrap(value),
        getValue = function () {
            return typeof _value === 'function' ? _value() : _value;
        };

    for (var index = length; index < capacity; index++) {
        var _newValue = getValue();

        if (underlyingArray.length === 0) {
            underlyingArray.push(_newValue);
        }
        else {
            underlyingArray.push(ko.isObservable(underlyingArray[0]) ?
                ko.observable(_newValue) : _newValue);
        }
    }

    this.valueHasMutated();
};

var arrayGetDistinct = function (array, valueMethod) {
    array = array || [];
    var result = [];
    for (var i = 0, j = array.length; i < j; i++) {
        var value = valueMethod ? valueMethod(array[i]) : array[i];
        if (ko.utils.arrayIndexOf(result, value) < 0)
            result.push(value);
    }
    return result;
};
ko.observableArray['fn'].arrayGetDistinct = arrayGetDistinct;

ko.isObservableArray = function (instance) {
    return ko.isObservable(instance) && !!instance.wrapItems;
};

ko.observableArray['fn'].destroyRange = function (start, end) {
    var underlyingArray = this.peek();
    this.valueWillMutate();
    for (var index = start; index <= end; index++)
        underlyingArray[index]['_destroy'] = true;
    this.valueHasMutated();
};

ko.observableArray['fn'].destroyAt = function (index) {
    this.destroyRange(index, index);
};

ko.observableArray['fn'].pushAll = function (array, mapItems) {
    mapItems = typeof mapItems === 'undefined' ? true : !!mapItems;

    var underlyingArray = this.peek();
    this.valueWillMutate();

    $.each(array, function (index, value) {
        underlyingArray.push(mapItems ? ko.mapping.fromJS(value) : value);
    });

    this.valueHasMutated();
};

//(function () {
//    var protoProperty = ko.observable.protoProperty || "__ko_proto__";

//    ko.hasPrototypeX = function (instance, prototype) {
//        if ((instance === null) || (instance === undefined) || (instance[protoProperty] === undefined)) return false;
//        if (typeof instance[protoProperty] === 'function') return true;
//        return ko.hasPrototypeX(instance[protoProperty], prototype); // Walk the prototype chain
//    };

//    ko.isObservableX = function (instance) {
//        return ko.hasPrototypeX(instance, ko.observable);
//    }

//    var maxNestedObservableDepth = 10; // Escape the (unlikely) pathalogical case where an observable's current value is itself (or similar reference cycle)

//    ko.toJSX = function (rootObject) {
//        if (arguments.length == 0)
//            throw new Error("When calling ko.toJS, pass the object you want to convert.");

//        // We just unwrap everything at every level in the object graph
//        return mapJsObjectGraph(rootObject, function (valueToMap) {
//            // Loop because an observable's value might in turn be another observable wrapper
//            for (var i = 0; ko.isObservableX(valueToMap) && (i < maxNestedObservableDepth) ; i++)
//                valueToMap = valueToMap();
//            return valueToMap;
//        });
//    };

//    function mapJsObjectGraph(rootObject, mapInputCallback, visitedObjects) {
//        visitedObjects = visitedObjects || new objectLookup();

//        rootObject = mapInputCallback(rootObject);
//        var canHaveProperties = (typeof rootObject == "object") && (rootObject !== null) && (rootObject !== undefined) && (!(rootObject instanceof Date)) && (!(rootObject instanceof String)) && (!(rootObject instanceof Number)) && (!(rootObject instanceof Boolean));
//        if (!canHaveProperties)
//            return rootObject;

//        var outputProperties = rootObject instanceof Array ? [] : {};
//        visitedObjects.save(rootObject, outputProperties);

//        visitPropertiesOrArrayEntries(rootObject, function (indexer) {
//            var propertyValue = mapInputCallback(rootObject[indexer]);

//            switch (typeof propertyValue) {
//                case "boolean":
//                case "number":
//                case "string":
//                case "function":
//                    outputProperties[indexer] = propertyValue;
//                    break;
//                case "object":
//                case "undefined":
//                    var previouslyMappedValue = visitedObjects.get(propertyValue);
//                    outputProperties[indexer] = (previouslyMappedValue !== undefined)
//                        ? previouslyMappedValue
//                        : mapJsObjectGraph(propertyValue, mapInputCallback, visitedObjects);
//                    break;
//            }
//        });

//        return outputProperties;
//    }

//    function visitPropertiesOrArrayEntries(rootObject, visitorCallback) {
//        if (rootObject instanceof Array) {
//            for (var i = 0; i < rootObject.length; i++)
//                visitorCallback(i);

//            // For arrays, also respect toJSON property for custom mappings (fixes #278)
//            if (typeof rootObject['toJSON'] == 'function')
//                visitorCallback('toJSON');
//        } else {
//            for (var propertyName in rootObject) {
//                visitorCallback(propertyName);
//            }
//        }
//    };

//    function objectLookup() {
//        this.keys = [];
//        this.values = [];
//    };

//    objectLookup.prototype = {
//        constructor: objectLookup,
//        save: function (key, value) {
//            var existingIndex = ko.utils.arrayIndexOf(this.keys, key);
//            if (existingIndex >= 0)
//                this.values[existingIndex] = value;
//            else {
//                this.keys.push(key);
//                this.values.push(value);
//            }
//        },
//        get: function (key) {
//            var existingIndex = ko.utils.arrayIndexOf(this.keys, key);
//            return (existingIndex >= 0) ? this.values[existingIndex] : undefined;
//        }
//    };
//})();

//ko.exportSymbol('toJSX', ko.toJSX);

function jQueryId($element) {
    if ($element === undefined)
        return 'undefined element!';

    var element = $element instanceof jQuery ?
        ($element.length ? $element[0] : null) :
        $element;

    if (element === null)
        return 'empty jQuery selector!';

    var id = element[$.expando];

    if (id === undefined)
        return 'no jQuery id!';
    else
        return id;
}

// Dump HTML of jQuery object.
jQuery.fn.extend({
    dump: function () {
        var id = jQueryId(this);

        var html = '[' + id + ']' +
            (this instanceof jQuery ?
            (this.length ? this[0].outerHTML : 'empty jQuery object!') :
            '!jQuery');

        html = html.replace(/\s+/g, ' ');
        html = html.replace(/\t/g, '');
        html = html.replace(/(\/\w+)\>/g, '$1>\n');
        html = html.replace(/\s*$/, '');

        return html;
    }
});

// Use this binding handler to dump the JSON object contents in the browser.
ko.bindingHandlers.dump = {
    init: function (element, valueAccessor, allBindingsAccessor, viewmodel, bindingContext) {
        var context = valueAccessor();
        var allBindings = allBindingsAccessor();
        var pre = document.createElement('pre');

        element.appendChild(pre);

        var dumpJSON = ko.computed({
            read: function () {
                var enable = allBindings.enable === undefined || allBindings.enable;
                return enable ? ko.toJSON(context,
                    function (key, value) {
                        if (key != '__ko_mapping__')
                            return value;
                    }, 2) : '';
            },
            disposeWhenNodeisRemoved: element
        });

        ko.applyBindingsToNode(pre, {
            text: dumpJSON,
            visible: dumpJSON
        });

        return { controlsDescendentBindings: true };
    }
};

// Property formatters

ko.bindingHandlers['invisible'] = {
    'update': function (element, valueAccessor) {
        var value = ko.utils.unwrapObservable(valueAccessor());
        var isCurrentlyVisible = !(element.style.display == "none");
        if (value && isCurrentlyVisible)
            element.style.display = "none";
        else if ((!value) && !isCurrentlyVisible)
            element.style.display = "";
    }
};

ko.bindingHandlers.trimString = {
    update: function (element, valueAccessor, allBindingsAccessor, viewModel) {
        var value = ko.unwrap(valueAccessor()),
            allBindings = allBindingsAccessor();

        if (value) {
            if (allBindings.trimStart) {
                var removeMe = ko.unwrap(allBindings.trimStart);
                if (value.slice(0, removeMe.length) == removeMe)
                    value = value.slice(removeMe.length);
            }
            if (allBindings.trimEnd) {
                var removeMe = ko.unwrap(allBindings.trimEnd);
                if (value.slice(0, -removeMe.length) == removeMe)
                    value = value.slice(0, removeMe.length);
            }

            if (value) {
                switch (allBindings.property || '') {
                    case '':
                        ko.utils.setTextContent(element, value);
                        break;

                    case 'value':
                        $(element).val(value);   // This will break if used on virtual elements, but virtuals don't have values anyway.
                        break;
                }
            }
        }
        else {
            switch (allBindings.property || '') {
                case '':
                    ko.utils.setTextContent(element, '');
                    break;

                case 'value':
                    $(element).val(''); // This will break if used on virtual elements, but virtuals don't have values anyway.
                    break;
            }
        }
    }
};
ko.virtualElements.allowedBindings['trimString'] = true;

ko.bindingHandlers.dateString = {
    update: function (element, valueAccessor, allBindingsAccessor, viewModel) {
        var value = valueAccessor(),
            allBindings = allBindingsAccessor();
        var valueUnwrapped = ko.unwrap(value);
        if (valueUnwrapped) {
            //var pattern = allBindings.datePattern || 'M/d/yyyy';
            var m = valueUnwrapped.match(/^(\d{4})-(\d{2})-(\d{2})/),
                date = new Date(m[1], m[2] - 1, m[3], 0, 0, 0);

            switch (allBindings.property || '') {
                case '':
                    $(element).text(date.toDateString());
                    break;

                case 'value':
                    $(element).val(date.toDateString());
                    break;
            }
        }
        else {
            switch (allBindings.property || '') {
                case '':
                    $(element).text('');
                    break;

                case 'value':
                    $(element).val('');
                    break;
            }
        }
    }
};

ko.bindingHandlers.moment = {
    update: function (element, valueAccessor, allBindingsAccessor, viewModel) {
        var value = valueAccessor(),
            allBindings = allBindingsAccessor();
        var valueUnwrapped = ko.unwrap(value);
        if (valueUnwrapped) {
            var pattern = allBindings.datePattern || 'MM/DD/YYYY';
            var m = moment(valueUnwrapped).format(pattern);

            switch (allBindings.property || '') {
                case '':
                    $(element).text(m);
                    break;

                case 'value':
                    $(element).val(m);
                    break;
            }
        }
        else {
            switch (allBindings.property || '') {
                case '':
                    $(element).text('');
                    break;

                case 'value':
                    $(element).val('');
                    break;
            }
        }
    }
};

ko.bindingHandlers.ifnull = {
    update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        ko.bindingHandlers.text.update(element,
            !!(valueAccessor()) ? valueAccessor :
            function () {
                var nullText = allBindingsAccessor().nullText || '';
                return ko.unwrap(nullText);
            },
            allBindingsAccessor, viewModel, bindingContext);
    }
};

ko.bindingHandlers.durationString = {
    update: function (element, valueAccessor, allBindingsAccessor, viewModel) {
        var value = valueAccessor();
        if (value) {
            var valueUnwrapped = ko.unwrap(value);
            $(element).text(valueUnwrapped.toString() + ' min');
        }
    }
};

ko.bindingHandlers.regex = {
    update: function (element, valueAccessor, allBindingsAccessor, viewModel) {
        var value = ko.unwrap(valueAccessor()) || '',
            allBindings = allBindingsAccessor(),
            pattern = ko.unwrap(allBindings.pattern),
            options = ko.unwrap(allBindings.options),
            matchIndex = ko.unwrap(allBindings.matchIndex) || 1,
            rx = new RegExp(pattern, options),
            match = value.match(rx);

        $(element).text(match ? match[matchIndex] : value);
    }
};

ko.bindingHandlers.fileSizeString = {
    update: function (element, valueAccessor, allBindingsAccessor, viewModel) {
        var value = valueAccessor();
        if (value) {
            var label, valueUnwrapped = parseInt(ko.unwrap(value), 10);
            if (valueUnwrapped > 1073741824)
                label = (1073741824 / valueUnwrapped).toFixed(1) + ' GB';
            else if (valueUnwrapped > 1048576)
                label = (1048576 / valueUnwrapped).toFixed(1) + ' MB';
            else if (valueUnwrapped > 1024)
                label = (1024 / valueUnwrapped).toFixed(1) + ' KB';
            else 
                label = valueUnwrapped + ' bytes';

            $(element).text(label);
        }
    }
};

ko.bindingHandlers.percentValue = {
    init: function (element, valueAccessor, allBindingsAccessor, viewModel) {
        var $element = $(element);
        $element.change(function () {
            var elementValue = $element.val();
            var value = valueAccessor();
            if (elementValue) {
                value(Number(elementValue) / 100);
            }
            else {
                value(null);
            }
        });
    },
    update: function (element, valueAccessor, allBindingsAccessor, viewModel) {
        var value = valueAccessor();
        if (value) {
            var valueUnwrapped = ko.unwrap(value);
            $(element).val(Number(valueUnwrapped) * 100);
        }
        else {
            $(element).val('');
        }
    }
};

ko.bindingHandlers.currency = {
    init: function (element, valueAccessor, allBindingsAccessor, viewModel) {
        var value = valueAccessor(),
            allBindings = allBindingsAccessor(),
            property = allBindings.property || 'value';

        if (property == 'value') {
            $(element).blur(
                function () {
                    var newValue = $(element).val();
                    if (isNaN(newValue)) {
                        alert('Please enter a valid dollar value');
                        element.focus();
                    }
                    else
                        value(newValue);
                });
        }
    },
    update: function (element, valueAccessor, allBindingsAccessor, viewModel) {
        var value = valueAccessor(),
            allBindings = allBindingsAccessor();
        if (value) {
            var valueUnwrapped = ko.unwrap(value),
                display = Number(valueUnwrapped).toFixed(2),
                property = allBindings.property || 'value';

            switch (property) {
                case 'value':
                    $(element).val(display);
                    break;

                case 'text':
                    $(element).text(display);
                    break;

                case 'textDollars':
                    $(element).text('$' + display);
                    break;
            }
        }
    }
};

var urlBinding = function (valueAccessor, allBindingsAccessor) {
    var value = valueAccessor(),
        allBindings = allBindingsAccessor(),
        url;
    
    if (value) {
        var valueUnwrapped = ko.unwrap(value);
        if (valueUnwrapped && valueUnwrapped != '') {
            var siteIdentifier = ko.unwrap(allBindings.siteIdentifier || 'www'),
                uploadFolder = ko.unwrap(allBindings.folder || allBindings.uploadFolder);

            url = /^\/\//.test(valueUnwrapped) ?  // If the value starts with '//' then its already transformed
                valueUnwrapped :                // just return it.
                '//' + Settings.imageServer + '/' + siteIdentifier + '/' + uploadFolder + '/' + valueUnwrapped;
        }
    }
    return url;
};

ko.bindingHandlers.imageUrl = {
    update: function (element, valueAccessor, allBindingsAccessor, viewModel) {
        var url = urlBinding(valueAccessor, allBindingsAccessor);

        if (url) {
            var imageVisible = !(ko.unwrap(allBindingsAccessor().imageVisible) === false);

            if (imageVisible)
                $(element).attr('src', url);
        }
    }
};

ko.bindingHandlers.siteUrl = {
    update: function (element, valueAccessor, allBindingsAccessor, viewModel) {
        var value = valueAccessor(),
            allBindings = allBindingsAccessor();
        if (value) {
            var valueUnwrapped = ko.unwrap(value);
            if (valueUnwrapped && valueUnwrapped != '') {
                var url = location.protocol + '//' + location.host + (valueUnwrapped.slice(0, 1) == '/' ? '' : '/') + valueUnwrapped;
                if (element.tagName == 'A')
                    $(element).attr('href', url);
                else {
                    var maxLength = allBindings.maxLength || 255;
                    if (url.length <= maxLength) {
                        $(element).text(url);
                    }
                    else {
                        var delta = url.length - maxLength,
                            midpoint = url.length / 2,
                            trimmedUrl = url.slice(0, midpoint - delta / 2) + '...' + url.slice(-midpoint + delta / 2);
                        $(element).text(trimmedUrl);
                    }
                }
            }
        }
    }
};

ko.bindingHandlers.contentUrl = {
    update: function (element, valueAccessor, allBindingsAccessor, viewModel) {
        var value = valueAccessor(),
            allBindings = allBindingsAccessor();
        if (value) {
            var valueUnwrapped = ko.unwrap(value);
            if (valueUnwrapped && valueUnwrapped != '') {
                var url = 'http://[' + valueUnwrapped.split('/')[0] + ']/';
                $(element).text(url);
            }
        }
    }
};

ko.bindingHandlers.hostedHref = {
    update: function (element, valueAccessor, allBindingsAccessor, viewModel) {
        var url = urlBinding(valueAccessor, allBindingsAccessor);

        if (url) {
                $(element).attr('href', url);
            }
        }
};

ko.bindingHandlers.dynamicImageUrl = {
    update: function (element, valueAccessor, allBindingsAccessor, viewModel) {
        var value = valueAccessor(),
            allBindings = allBindingsAccessor();
        if (value) {
            var valueUnwrapped = ko.unwrap(value);
            if (valueUnwrapped && valueUnwrapped != '') {
                var imageCategory = allBindings.imageCategory || '0',
                    imageSize = allBindings.imageSize || '0';
                $(element).attr('src', '/imagehandler/' + imageCategory + '/' + valueUnwrapped + '/' + imageSize + '?r=' + (new Date()).getTime());
            }
        }
    }
};

ko.bindingHandlers.dateDropDown = {
    init: function (element, valueAccessor, allBindingsAccessor, viewModel) {
        $(element).change(function () {
            // When any of the elements change, update the underlying value
            // to a string in the form 'YYYY-MM-DDT00:00:00'
            var baseId, id = element.id;

            if (/_Day$/.test(id)) {
                baseId = id.replace('_Day', '');
            }
            else if (/_Year$/.test(id)) {
                baseId = id.replace('_Year', '');
            }
            else {
                baseId = id;
            }

            var value = valueAccessor();
            value(
                $('#' + baseId + '_Year').val() + '-' +
                $('#' + baseId).val() + '-' +
                $('#' + baseId + '_Day').val() + 'T00:00:00'
                );
        });
    },
    update: function (element, valueAccessor, allBindingsAccessor, viewModel) {
        var value = valueAccessor(),
            allBindings = allBindingsAccessor();
        if (value) {
            var valueUnwrapped = ko.unwrap(value);
            var baseId, id = element.id;

            if (/_Day$/.test(id)) {
                baseId = id.replace('_Day', '');
            }
            else if (/_Year$/.test(id)) {
                baseId = id.replace('_Year', '');
            }
            else {
                baseId = id;
            }

            if (valueUnwrapped || '' != '') {
                var dateParts = valueUnwrapped.split('-');
                $('#' + baseId + '_Year').val(dateParts[0]);
                $('#' + baseId).val(dateParts[1]);
                $('#' + baseId + '_Day').val(dateParts[2].split('T')[0]);
            }
            else {
                $('#' + baseId + '_Year').val('0');
                $('#' + baseId).val('0');
                $('#' + baseId + '_Day').val('0');
            }
        }
    }
};

//ko.bindingHandlers.dateDropDown = {
//    init: function (element, valueAccessor, allBindingsAccessor, viewModel) {
//        $(element).change(function () {
//            // When any of the elements change, update the underlying value
//            // to a string in the form 'YYYY-MM-DDT00:00:00'
//            var baseId, id = element.id;

//            if (/_Day$/.test(id)) {
//                baseId = id.replace('_Day', '');
//            }
//            else if (/_Year$/.test(id)) {
//                baseId = id.replace('_Year', '');
//            }
//            else {
//                baseId = id;
//            }

//            var value = valueAccessor(),
//                _baseId = '#' + baseId;
//            value($(_baseId + '_Year').val() + '-' +
//                $(_baseId).val() + '-' +
//                $(_baseId + '_Day').val() + 'T00:00:00');
//        });
//    },
//    update: function (element, valueAccessor, allBindingsAccessor, viewModel) {
//        var value = valueAccessor(),
//            allBindings = allBindingsAccessor();
//        if (value) {
//            var valueUnwrapped = ko.unwrap(value);
//            var baseId, id = element.id;

//            if (/_Day$/.test(id)) {
//                baseId = id.replace('_Day', '');
//            }
//            else if (/_Year$/.test(id)) {
//                baseId = id.replace('_Year', '');
//            }
//            else {
//                baseId = id;
//            }

//            var _baseId = '#' + baseId;

//            if (valueUnwrapped || '' != '') {
//                var dateParts = valueUnwrapped.split('-');
//                $(_baseId + '_Year').val(parseInt(dateParts[0]).toString());
//                $(_baseId).val(parseInt(dateParts[1]).toString());
//                $(_baseId + '_Day').val(parseInt(dateParts[2]).toString());
//            }
//            else {
//                $(_baseId + '_Year').val('0');
//                $(_baseId).val('0');
//                $(_baseId + '_Day').val('0');
//            }
//        }
//    }
//};

ko.bindingHandlers.rawhtml = {
    update: function (element, valueAccessor) {
        var value = valueAccessor();
        if (value) {
            var valueUnwrapped = ko.unwrap(value);
            $(element).html(valueUnwrapped);
        }
    }
};

ko.bindingHandlers.bitFieldChecked = {
    init: function (element, valueAccessor, allBindingsAccessor, viewModel) {
        $(element).change(function () {
            var value = valueAccessor(),
                valueUnwrapped = parseInt(ko.unwrap(value), 10),
                elementValue = parseInt(element.value, 10);

            value(valueUnwrapped ^ elementValue);
        });
    },
    update: function (element, valueAccessor, allBindingsAccessor, viewModel) {
        var value = valueAccessor(),
            valueUnwrapped = parseInt(ko.unwrap(value), 10),
            elementValue = parseInt(element.value, 10);

        element.checked = (valueUnwrapped & elementValue) > 0;
    }
};

ko.bindingHandlers.editButton = {
    update: function (element, valueAccessor, allBindingsAccessor, viewModel) {
        var value = valueAccessor(),
            valueUnwrapped = ko.unwrap(value),
            allBindings = allBindingsAccessor(),
            src = allBindings.src,
            requiredPermissions = allBindings.requiredPermissions,
            buttonStatus = allBindings.buttonStatus,
            editButtonEnabled =
                valueUnwrapped.Permissions ? (valueUnwrapped.Permissions() & requiredPermissions) > 0 : true &&
                valueUnwrapped.Status ? (valueUnwrapped.Status() != buttonStatus) : true,
            gray = editButtonEnabled ? '' : '-gray',
            ext = src.lastIndexOf('.');

        element.disabled = !editButtonEnabled;
        element.src = src.slice(0, ext) + gray + src.slice(ext);
    }
};

ko.bindingHandlers.imageButton = {
    update: function (element, valueAccessor, allBindingsAccessor, viewModel) {
        var item = ko.unwrap(valueAccessor()),
            $element = $(element),
            allBindings = allBindingsAccessor(),
            toggleClass = allBindings.toggleClass,
            requiredPermissions = allBindings.requiredPermissions,
            userPermissions = item.Permissions() | parseInt($element.attr('permissions'));

        $element.attr('permissions', userPermissions);
        var buttonStatus = allBindings.buttonStatus,
            enabled =
                ((userPermissions & requiredPermissions) > 0) &&
                (item.Status() != buttonStatus),
            disabledSuffix = '-disabled',
            disabledClass = toggleClass + disabledSuffix,
            currentClass = toggleClass + (enabled ? '' : disabledSuffix);

        // element.disabled = !enabled;
        $element.
            removeClass(toggleClass).
            removeClass(disabledClass).
            addClass(currentClass).
            prop('disabled', !enabled);
    }
};

ko.bindingHandlers.bootstrapButton = {
    update: function (element, valueAccessor, allBindingsAccessor, viewModel) {
        var item = ko.unwrap(valueAccessor()),
            $element = $(element),
            allBindings = allBindingsAccessor(),
            toggleClass = allBindings.toggleClass,
            requiredPermissions = allBindings.requiredPermissions,
            userPermissions = $element.attr('permissions'),
            buttonStatus = allBindings.buttonStatus,
            enabled =
                ((userPermissions & requiredPermissions) > 0) &&
                (item.Status() != buttonStatus),
            disabledSuffix = '-disabled',
            disabledClass = toggleClass + disabledSuffix,
            currentClass = toggleClass + (enabled ? '' : disabledSuffix);

        element.disabled = !enabled;
        $element.
            removeClass(toggleClass).
            removeClass(disabledClass).
            addClass(currentClass);
    }
};

ko.bindingHandlers.ellipsisText = {
    update: function (element, valueAccessor, allBindingsAccessor, viewModel) {
        var value = valueAccessor(),
            valueUnwrapped = ko.unwrap(value),
            allBindings = allBindingsAccessor(),
            maxLength = allBindings.maxLength;

        $(element).text(
            !!valueUnwrapped ?
            (valueUnwrapped.length < maxLength ? valueUnwrapped : valueUnwrapped.slice(0, maxLength) + '...') :
            ''
            );
    }
};

ko.bindingHandlers.statusCssClass = {
    update: function (element, valueAccessor, allBindingsAccessor, viewModel) {
        var value = valueAccessor(),
            valueUnwrapped = ko.unwrap(value),
            allBindings = allBindingsAccessor(),
            addClass = allBindings.addClass,
            statusClasses = 'Undefined Pending Approved Rejected Inactive',
            index = 1 + Math.log(valueUnwrapped) / Math.LN2;

        $(element).
            removeClass(statusClasses).
            addClass(addClass + ' ' + statusClasses.split(' ')[index]);
    }
};

jQuery.browser = {}; (function () {
    jQuery.browser.msie = false;
    jQuery.browser.version = 0; if (navigator.userAgent.match(/MSIE ([0-9]+)\./)) {
        jQuery.browser.msie = true; jQuery.browser.version = RegExp.$1;
    }
})();

function tinymceInsertImage(editor, image, imageFolder, imageHeight, observableProperty) {
    var ed = editor;

    //ed.focus();

    ed.selection.collapse();

    var range = ed.selection.getRng(),                 
        newNode = ed.getDoc().createElement('img');

    newNode.src = imageFolder + image.FileName();
    newNode.align = 'left';
    newNode.hspace = 4;
    newNode.vspace = 4;
    newNode.height = imageHeight;
    if (image.Description()) {
        newNode.alt = ko.utils.htmlEscape(image.Description());
    }

    if (range.insertNode) {
        range.insertNode(newNode);
    }
    else {
        range.pasteHTML(newNode.outerHTML);
    }

    if (observableProperty) {
        observableProperty(editor.getContent({ format: 'raw' }));
    }
}

//var tinymceData = {};

(function ($) {
    var instances_by_id = {}; // needed for referencing instances during updates.
    var init_queue = $.Deferred(), // jQuery deferred object used for creating TinyMCE instances synchronously
        init_queue_next = init_queue;
        init_queue.resolve();

    var imageHeader = {
        Width: 0,
        Height: 0,
        EditData: {
            Crop: {
                Left: 0,
                Top: 0,
                Width: 0,
                Height: 0
            },
            Rect: {
                Left: 0,
                Top: 0,
                Width: 0,
                Height: 0
            },
            Rotation: 0,
            OriginalSize: {
                Width: 0,
                Height: 0
            }
        },
        FileName: '',
        FileSize: 0,
        EditAction: 0,
        Description: '',
        Id: '',
        Title: '',
        ResourceTypeName: 'Image',
        ResourceSubTypeName: 'Image',
        Status: 0
    };

    ko.bindingHandlers.tinymce = {
        init: function (element, valueAccessor, allBindingsAccessor, context) {
            var tinymceOptions = allBindingsAccessor().tinymceOptions || {},
                options = $.extend({
                    forced_root_block: false,
                    force_p_newlines: false,
                    menubar: false,
                    statusbar: false,
                    toolbar: 'undo | bold italic underline | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | print code ' +
                        (tinymceOptions.images ? ' | itimages' : ''),
                    plugins: [
                        'lists image print',
                        'searchreplace code',
                        'table contextmenu paste' +
                            (tinymceOptions.images ? ' itimages' : '')
                    ],
                    relative_urls: false
                },
                modelValue = valueAccessor(),
                value = ko.utils.unwrapObservable(modelValue),
                keyhandler = function (ed) {
                    if (ko.isWriteableObservable(modelValue)) {
                        safeconsole('mce:keyhandler[' + ed.id + ']');
                        modelValue(ed.getContent({ format: 'raw' }));
                    }
                }, tinymceOptions),
                $element = $(element);

            if (!element.id) {
                element.id = tinymce.DOM.uniqueId();
            }

            safeconsole('mce:init[' + element.id + ']');

            var imageUploadDialog;
            if (tinymceOptions.imageEditorId) {
                imageUploadDialog = new ImageUploadDialog(
                    tinymceOptions.imageEditorId,
                    element.id,
                    tinymceOptions.fileSubmitCallback,
                    tinymceOptions.imagesFolder,
                    tinymceOptions.imageHeight,
                    context.$data || context,
                    imageHeader
                    );
            }

            options.setup = function (ed) {
                safeconsole('mce:setup[' + ed.id + ']');
                ed.settings.imageUploadDialog = imageUploadDialog;

                ed.on('change', function (e) {
                    keyhandler(this);
                });

                ed.on('keyup', function (e) {
                    keyhandler(this);
                });

                ed.on('beforeSetContent', function (e, l) {
                    safeconsole('mce:beforeSetContent[' + e.target.id + ']');
                    if (ko.isWriteableObservable(modelValue)) {
                        if (typeof (e.content) != 'undefined') {
                            modelValue(e.content);
                        }
                    }
                });
            };

            //handle destroying an editor 
            ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
                $(element).parent().find("span.mceEditor,div.mceEditor").each(function (i, node) {
                    var tid = node.id.replace(/_parent$/, ''),
                        ed = tinymce.get(tid);

                    if (ed) {
                        ed.remove();
                        // remove referenced instance if possible.
                        if (instances_by_id[tid]) {
                            delete instances_by_id[tid];
                        }
                    }
                });
            });

/*
            // create each tinyMCE instance synchronously. This addresses an issue when working with foreach bindings
            init_queue_next = init_queue_next.pipe(function () {
                var defer = $.Deferred();
                var init_options = $.extend({}, options, {
                    mode: 'none',
                    init_instance_callback: function (instance) {
                        instances_by_id[element.id] = instance;
                        safeconsole('mce:init_instance_callback[' + element.id + ']');
                        ko.bindingHandlers.tinymce.update.apply(undefined, init_arguments);
                        defer.resolve(element.id);
                        if (options.hasOwnProperty("init_instance_callback")) {
                            options.init_instance_callback(instance);
                        }
                    }
                });
                setTimeout(function () {
                    tinyMCE.init(init_options);
                    setTimeout(function () {
                        tinyMCE.execCommand("mceAddControl", true, element.id);
                        safeconsole('mce:mceAddEditor-complete[' + element.id + ']');
                    }, 0);
                }, 0);
                return defer.promise();
            });
            $element.val(value);
*/

            safeconsole('mce:setTimeout[' + element.id + ']');
            setTimeout(function () {
                tinyMCE.init(options);
                safeconsole('mce:init-complete[' + element.id + ']');
                tinymce.execCommand('mceAddEditor', true, element.id);
                safeconsole('mce:mceAddEditor-complete[' + element.id + ']');
                // bootstrap.
                //modelValue(modelValue());
                //tinymceData[element.id] = $.extend({ imagesFolder: '', imageHeight: 80 }, tinymceOptions);
            }, 0);
        },
        update: function (element, valueAccessor, allBindingsAccessor, context) {
            var $element = $(element),
                value = ko.utils.unwrapObservable(valueAccessor()),
                id = $element.attr('id');

            safeconsole('mce:update[' + id + ']');

            // handle programmatic updates to the observable
            // also makes sure it doesn't update it if it's the same. 
            // otherwise, it will reload the instance, causing the cursor to jump.
            if (id !== undefined) {
                var tinymceInstance = tinyMCE.get(id);
                if (tinymceInstance) {
                    var content = tinymceInstance.getContent({ format: 'raw' });
                    if (content !== value) {
                        tinymceInstance.setContent(value || '');
                        safeconsole('mce:setContent[' + id + ']');
                    }
                }
            }
            else {
                safeconsole('tinyMCE.get called before init complete!');
            }
        }
    };
}(jQuery));

ko.dirtyFlag = function (root, isInitiallyDirty) {
    var result = function () { },
        _initialState = ko.observable(ko.toJSON(root)),
        _isInitiallyDirty = ko.observable(isInitiallyDirty);

    result.isDirty = ko.dependentObservable(function () {
        return _isInitiallyDirty() || _initialState() !== ko.toJSON(root);
    });

    result.reset = function () {
        _initialState(ko.toJSON(root));
        _isInitiallyDirty(false);
    };

    return result;
};

ko.bindingHandlers.dynaTree = {
    init: function (element, valueAccessor, allBindingsAccessor, viewModel) {
        var valueArray = valueAccessor(),
            allBindings = allBindingsAccessor(),
            tree = $(element).dynatree("getTree");

        tree.options.onSelect = function (flag, node) {
            var key = node.data.key,
                keyIndex = valueArray.indexOf(key);

            if (!allBindings.readOnly) {
                if (flag) {
                    if (keyIndex == -1) {
                        valueArray.push(key);
                    }
                }
                else {
                    if (keyIndex != -1) {
                        valueArray.splice(keyIndex, 1);
                    }
                }
            }
        };
    },
    update: function (element, valueAccessor, allBindingsAccessor, viewModel) {
        var valueArray = valueAccessor(),
            allBindings = allBindingsAccessor();

        if (valueArray) {
            var tree = $(element).dynatree("getTree");
            
            tree.enableUpdate(false);
            tree.getRoot().expand(false);

            tree.visit(function (node) {
                var select = valueArray.indexOf(node.data.key) >= 0;
                node.select(select);
                node.expand(select);
                if (select)
                    node.makeVisible();
                return true;
            });

            tree.enableUpdate(true);
        }
    }
};

var headerText = function (element, valueAccessor, allBindingsAccessor, viewModel, propertyName) {
    var value = valueAccessor(),
        valueUnwrapped = ko.unwrap(value),
        allBindings = allBindingsAccessor();

    if (valueUnwrapped) {
        var propertyValue = valueUnwrapped[propertyName]();
        $(element).text(
            propertyValue ?
            (allBindings.format ? allBindings.format.replace('{0}', propertyValue) : propertyValue) :
            ''
            );
    }
    else {
        $(element).text('');
    }
};

ko.bindingHandlers['formatString'] = {
    'update': function (element, valueAccessor, allBindingsAccessor) {
        var value = ko.unwrap(valueAccessor()),
            allBindings = allBindingsAccessor(),
            visible = typeof allBindings.isVisible == 'undefined' ? true : ko.unwrap(allBindings.isVisible),
            format = ko.unwrap(allBindings.format) || '{0}';

        ko.utils.setTextContent(element, (!value || !visible) ? '' : format.replace('{0}', value));
    }
};
ko.virtualElements.allowedBindings['formatString'] = true;

ko.bindingHandlers.resourceHeader = {
    update: function (element, valueAccessor, allBindingsAccessor, viewModel) {
        headerText(element, valueAccessor, allBindingsAccessor, viewModel, 'Title');
    }
};

ko.bindingHandlers.employeeHeader = {
    update: function (element, valueAccessor, allBindingsAccessor, viewModel) {
        headerText(element, valueAccessor, allBindingsAccessor, viewModel, 'EmployeeName');
    }
};

ko.bindingHandlers.officeHeader = {
    update: function (element, valueAccessor, allBindingsAccessor, viewModel) {
        headerText(element, valueAccessor, allBindingsAccessor, viewModel, 'OfficeName');
    }
};

ko.bindingHandlers.officeName = {
    update: function (element, valueAccessor, allBindingsAccessor, viewModel) {
        var value = ko.unwrap(valueAccessor()),
            text = !value ? '' : value.replace('Ministries/', '').replace(/\//g, ' - ');
        $(element).text(text);
    }
};

var mapBitFieldArray = function (element, valueAccessor, allBindingsAccessor, lookupArrayName) {
    var values = ko.unwrap(valueAccessor()),
        _bitValues = new bitValues(values),
        allBindings = allBindingsAccessor(),
        getText = function() { 
            // console.log('values.toString() = ' + values.toString());
            var getArray = function (selector) {
                    var items = [];

                    $.each($(selector).find(':checkbox'), function (index, childElement) {
                        var $childElement = $(childElement);
                        items.push({ value: $childElement.val(), text: $childElement.next().text() });
                    });

                    return items;
                },
                lookupArray = allBindings.textSource ? getArray(allBindings.textSource) : ResourcePage.lookups[lookupArrayName],
                labels = _bitValues.arrayText(lookupArray, 'value', allBindings.property || 'text');

            return labels.join(allBindings.separator) || allBindings.emptyText || '';
        },
        text = !_bitValues.isZero() ? getText() : allBindings.emptyText || '';

    ko.utils.setTextContent(element, text);
};

var mapStringArray = function (element, valueAccessor, allBindingsAccessor, lookupArrayName) {
    var values = ko.unwrap(valueAccessor()),
        arrValues = typeof values === 'string' ? (values == '' ? [] : values.split(',')) : values,
        allBindings = allBindingsAccessor(),
        getText = function () {
            // console.log('values.toString() = ' + values.toString());
            var getArray = function (selector) {
                var items = [];

                $.each($(selector).find(':checkbox'), function (index, childElement) {
                    var $childElement = $(childElement);
                    items.push({ value: $childElement.val(), text: $childElement.next().text() });
                });

                return items;
            },
                lookupArray = allBindings.textSource ? getArray(allBindings.textSource) : ResourcePage.lookups[lookupArrayName],
                mappedArray = $.map(lookupArray, function(value, index) {
                    var _index = $.inArray(value.value, arrValues);
                    
                    if (_index == -1) {
                        return null;
                    }
                    else {
                        return value[allBindings.property || 'text'];
                    }
                });

            return mappedArray.join(allBindings.separator);
        },
        text = !!values ? getText() : allBindings.emptyText || '';

    ko.utils.setTextContent(element, text);
};

ko.bindingHandlers.resources = {
    update: function (element, valueAccessor, allBindingsAccessor, viewModel) {
        mapStringArray(element, valueAccessor, allBindingsAccessor);
    }
};
ko.virtualElements.allowedBindings['resources'] = true;

ko.bindingHandlers.ministry = {
    update: function (element, valueAccessor, allBindingsAccessor, viewModel) {
        var value = (ko.unwrap(valueAccessor()) || '').toUpperCase(),
            allBindings = allBindingsAccessor(),
            ministries = ResourcePage.lookups.ministries,
            index = firstIndexOf(ministries, function (m) { return m.Id.toUpperCase() == value; }),
            ministryName = index == -1 ? '' : ministries[index].OfficeName,
            visible = typeof allBindings.isVisible == 'undefined' ? true : ko.unwrap(allBindings.isVisible),
            format = ko.unwrap(allBindings.format) || '{0}';

        var text = (!ministryName || !visible) ? '' : format.replace('{0}', ministryName);
        ko.utils.setTextContent(element, text);
    }
};

ko.bindingHandlers.site = {
    update: function (element, valueAccessor, allBindingsAccessor, viewModel) {
        var value = (ko.unwrap(valueAccessor()) || '').toUpperCase(),
            allBindings = allBindingsAccessor(),
            sites = ResourcePage.lookups.sites,
            index = firstIndexOf(sites, function (m) { return m.SiteId.toUpperCase() == value; }),
            siteName = index == -1 ? '' : sites[index].SiteName,
            visible = typeof allBindings.isVisible == 'undefined' ? true : ko.unwrap(allBindings.isVisible),
            format = ko.unwrap(allBindings.format) || '{0}';

        var text = (!siteName || !visible) ? '' : format.replace('{0}', siteName);
        ko.utils.setTextContent(element, text);
    }
};

ko.bindingHandlers.audiences = {
    update: function (element, valueAccessor, allBindingsAccessor, viewModel) {
        mapBitFieldArray(element, valueAccessor, allBindingsAccessor, 'audiencetypes');
    }
};
ko.virtualElements.allowedBindings['audiences'] = true;

ko.bindingHandlers.topics = {
    update: function (element, valueAccessor, allBindingsAccessor, viewModel) {
        mapBitFieldArray(element, valueAccessor, allBindingsAccessor, 'topics');
    }
};
ko.virtualElements.allowedBindings['topics'] = true;

ko.bindingHandlers.jurisdictions = {
    update: function (element, valueAccessor, allBindingsAccessor, viewModel) {
        mapBitFieldArray(element, valueAccessor, allBindingsAccessor, 'jurisdictions');
    }
};
ko.virtualElements.allowedBindings['jurisdictions'] = true;

ko.bindingHandlers.spatialvalues = {
    update: function (element, valueAccessor, allBindingsAccessor, viewModel) {
        mapBitFieldArray(element, valueAccessor, allBindingsAccessor, 'spatialValues');
    }
};
ko.virtualElements.allowedBindings['spatialvalues'] = true;

ko.bindingHandlers.join = {
    update: function (element, valueAccessor, allBindingsAccessor, viewModel) {
        var value = valueAccessor(),
            valueUnwrapped = ko.unwrap(value),
            text = '';

        if (valueUnwrapped) {
            if ($.isArray(valueUnwrapped) && valueUnwrapped.length > 0 && typeof valueUnwrapped[0] !== 'string') {
                var allBindings = allBindingsAccessor(),
                    items = [];

                $.each(valueUnwrapped, function(index, item) {
                    var obj = ko.unwrap(item),
                        propertyValue = obj[allBindings.property || 'text'];

                    items.push(typeof propertyValue === 'function' ? propertyValue() : propertyValue);
                });

                text = items.join();
            }
            else {
                text = valueUnwrapped.join();
            }
        }
        //$(element).text(text);
        ko.utils.setTextContent(element, text);
    }
};
ko.virtualElements.allowedBindings['join'] = true;

ko.bindingHandlers.listItemCollection = {
    update: function (element, valueAccessor, allBindingsAccessor, viewModel) {
        var value = valueAccessor(),
            valueUnwrapped = ko.unwrap(value);

        if (valueUnwrapped) {
            var text = '',
                commaSpace = ', ',
                len = commaSpace.length;

            for (var index = 0; index < valueUnwrapped.length; index++) {
                text += (valueUnwrapped[index].Text() + commaSpace);
            }

            if (text.length > len) {
                if (text.slice(text.length - len) == commaSpace)
                    text = text.slice(0, -len);
            }

            //$(element).text(text);
            ko.utils.setTextContent(element, text);
        }
        else {
            //$(element).text('');
            ko.utils.setTextContent(element, '');
        }
    }
};
ko.virtualElements.allowedBindings['listItemCollection'] = true;

// TODO: Refactor the different checkbox list bindings into a core binding called by specific ones.
ko.bindingHandlers.checkOptions = {
    init: function (element, valueAccessor, allBindingsAccessor, viewModel) {
        var valueArray = ko.unwrap(valueAccessor()),
            allBindings = allBindingsAccessor(),
            selectedCheckOptions = allBindings.selectedCheckOptions,
            valueProperty = allBindings.valueProperty || 'value',
            textProperty = allBindings.textProperty || 'text',
            textFormatter = allBindings.textFormatter || function (value) { return value; },
            getValue = function (obj, isArray, isString) {
                return isArray ? obj[0] :
                    isString ? obj :
                    obj[valueProperty];
            },
            getText = function (obj, isArray, isString) {
                return textFormatter(isArray ? obj[1] :
                    isString ? obj :
                    obj[textProperty]);
            },
            $element = $(element),  // Get jQuery reference to element.
            elementId = $element.attr('id') || (new Date()).getTime();

        // Set event handler for future checkboxes.
        $element.on('change', 'input', function () {
            var checked = this.checked,
                value = this.value,
                arrayItemIndex = selectedCheckOptions.indexOf(value);

            if (checked && arrayItemIndex == -1)
                selectedCheckOptions.push(value);

            if (!checked && arrayItemIndex > -1)
                selectedCheckOptions.remove(value);
        });

        // Subscription for array changes.
        selectedCheckOptions.subscribe(function (newValue) {
            syncDOMWithData();
        });

        // Add checkboxes for each array element.
        $.each(valueArray, function (index, value) {
            var isArray = $.isArray(value),
                isString = typeof value === 'string',
                itemId = elementId.toString() + '_' + index.toString(),
                html = '<input type="checkbox" id="' + itemId + '" ' +
                    'value="' + getValue(value, isArray, isString) + '"/>' +
                    '<label for="' + itemId + '">' + getText(value, isArray, isString) + '</label><br/>';

            $element.append(html);
        });

        // Sync the DOM with the data.
        var syncDOMWithData = function () {
            $.each($element.children(':checkbox'), function (index, childElement) {
                childElement.checked = selectedCheckOptions.indexOf(childElement.value) > -1;
            });
        };

        syncDOMWithData();
    },
    update: function (element, valueAccessor, allBindingsAccessor, viewModel) {
        //var valueArray = valueAccessor(),
        //    allBindings = allBindingsAccessor();

        //if (valueArray) {
        //}
    }
};

ko.bindingHandlers.officeHeaderCheckOptions = {
    init: function (element, valueAccessor, allBindingsAccessor, viewModel) {
        var valueArray = ko.unwrap(valueAccessor()),
            allBindings = allBindingsAccessor(),
            selectedCheckOptions = allBindings.selectedCheckOptions,
            getIndexOf = function (value) {
                return selectedCheckOptions.firstIndexOf(
                    function (item) { return ko.unwrap(item.Id) == value; }
                    );
            },
            textFormatter = allBindings.textFormatter || function (value) { return value; },
            $element = $(element),  // Get jQuery reference to element.
            elementId = $element.attr('id') || (new Date()).getTime();

        // Set event handler for future checkboxes.
        $element.on('change', 'input', function () {
            var checked = this.checked,
                value = this.value,
                arrayItemIndex = getIndexOf(value);

            if (checked && arrayItemIndex == -1)
                selectedCheckOptions.push({ Id: value });

            if (!checked && arrayItemIndex > -1)
                selectedCheckOptions.splice(arrayItemIndex, 1);
        });

        // Subscription for array changes.
        selectedCheckOptions.subscribe(function (newValue) {
            syncDOMWithData();
        });

        // Add checkboxes for each array element.
        $.each(valueArray, function (index, value) {
            var itemId = elementId.toString() + '_' + index.toString(),
                html = '<input type="checkbox" id="' + itemId + '" ' +
                    'value="' + value['Id'] + '"/>' +
                    '<label for="' + itemId + '">' + textFormatter(value['OfficeName']) + '</label><br/>';

            $element.append(html);
        });

        // Sync the DOM with the data.
        var syncDOMWithData = function () {
            $.each($element.children(':checkbox'), function (index, childElement) {
                childElement.checked = getIndexOf(childElement.value) > -1;
            });
        };

        syncDOMWithData();
    },
    update: function (element, valueAccessor, allBindingsAccessor, viewModel) {
        //var valueArray = valueAccessor(),
        //    allBindings = allBindingsAccessor();

        //if (valueArray) {
        //}
    }
};

ko.bindingHandlers.bitValueCheckOptions = {
    init: function (element, valueAccessor, allBindingsAccessor, viewModel) {
        var allOptions = ko.unwrap(valueAccessor()),
            allBindings = allBindingsAccessor(),
            selectedCheckOptions = allBindings.selectedCheckOptions,
            textFormatter = allBindings.textFormatter || function (value) { return value; },
            getText = function (obj) {
                return textFormatter(obj);
            },
            $element = $(element),  // Get jQuery reference to element.
            elementId = $element.attr('id') || (new Date()).getTime();

        // Set event handler for future checkboxes.
        $element.on('change', 'input', function () {
            var checked = this.checked,
                value = new bitValues(this.value),
                selectedValues = new bitValues(selectedCheckOptions());

            //safeconsole('entering bitValueCheckOptions.change: checked=' + checked + ' value=' + value + ' selectedValues=' + selectedValues.value());

            if (checked) {
                //safeconsole('selectedValues.setBit(' + value + ')');
                selectedValues.setBit(value);
            }
            else {
                //safeconsole('selectedValues.unsetBit(' + value + ')');
                selectedValues.unsetBit(value);
            }

            selectedCheckOptions(selectedValues.value());
            //safeconsole('exiting bitValueCheckOptions.change: checked=' + checked + ' value=' + value + ' selectedValues=' + selectedValues.value());
        });

        // Add checkboxes for each array element.
        $.each(allOptions, function (index, option) {
            var itemId = elementId.toString() + '_' + index.toString(),
                html = '<input type="checkbox" id="' + itemId + '" ' +
                    'value="' + option.value + '"/>' +
                    '<label for="' + itemId + '">' +
                    getText(option.text) + '</label><br/>';
            // console.log(option.value + ' ' + option.text);
            $element.append(html);
        });
    },
    update: function (element, valueAccessor, allBindingsAccessor, viewModel) {
        var selectedCheckOptions = ko.unwrap(allBindingsAccessor().selectedCheckOptions),
            bitValue = new bitValues(selectedCheckOptions),
            $element = $(element);  // Get jQuery reference to element.

        //safeconsole('bitValueCheckOptions:update - selectedCheckOptions=' + selectedCheckOptions + ' : bitValue=' + bitValue);
        $.each($element.children(':checkbox'), function (index, childElement) {
            //safeconsole('childElement.value=' + childElement.value);
            childElement.checked = bitValue.isBitSet(childElement.value);
            //safeconsole('childElement.checked=' + childElement.checked);
        });
    }
};

ko.bindingHandlers.checkBoxListValues = {
    init: function (element, valueAccessor, allBindingsAccessor, viewModel) {
        var allBindings = allBindingsAccessor(),
            isFlags = allBindings.valuetype == 'flags',
            $element = $(element);  // Get jQuery reference to element.

        // Set event handler for future checkboxes.
        $element.on('change', 'input', function () {
            var checked = this.checked,
                boundValue = valueAccessor();

            if (isFlags) {
                var modelValue = new bitValues(boundValue());

                if (checked) {
                    modelValue.setBit(this.value);
                }
                else {
                    modelValue.unsetBit(this.value);
                }
                boundValue(modelValue.value());
            }
            else {
                var addItem = function (value, arrayMethod) {
                    var rawValue = ko.unwrap(arrayMethod);

                    if (typeof rawValue === 'string') {
                        var arrValue = rawValue == '' ? [] : rawValue.split(',');
                        addItem(value, arrValue);
                        arrayMethod(arrValue.join(','));
                    }
                    else {
                        var index = $.inArray(value, rawValue);
                        if (index == -1)
                            arrayMethod.push(value);
                    }
                },
                removeItem = function (value, arrayMethod) {
                    var rawValue = ko.unwrap(arrayMethod);

                    if (typeof rawValue === 'string') {
                        var arrValue = rawValue.split(',');
                        removeItem(value, arrValue);
                        arrayMethod(arrValue.join(','));
                    }
                    else {
                        var index = $.inArray(value, rawValue);
                        if (index > -1)
                            rawValue.splice(index, 1);
                    }
                };

                if (checked) {
                    addItem(this.value, boundValue);
                }
                else {
                    removeItem(this.value, boundValue);
                }
            }
        });
    },
    update: function (element, valueAccessor, allBindingsAccessor, viewModel) {
        var allBindings = allBindingsAccessor(),
            isFlags = allBindings.valuetype == 'flags',
            rawValue = ko.unwrap(valueAccessor()),
            modelValue = isFlags ? new bitValues(rawValue) : rawValue,
            $element = $(element),
            inSerializedArray = function (value, serializedArray) {
                return $.inArray(value, serializedArray == '' ? [] : serializedArray.split(','));
            },
            inArray = function (value, array) {
                return (typeof array === 'string' ? inSerializedArray(value, array) : $.inArray(value, array)) > -1;
            }

        $.each($element.find(':checkbox'), function (index, childElement) {
            childElement.checked = isFlags ? 
                modelValue.isBitSet(childElement.value) :
                inArray(childElement.value, modelValue);
        });
    }
};

var safeBindingValue = function (element, valueAccessor, allBindingsAccessor, viewModel) {
    var value = valueAccessor(),
        valueUnwrapped = ko.unwrap(value),
        allBindings = allBindingsAccessor(),
        text = '';

    if (value && allBindings.property) {
        text = valueUnwrapped[allBindings.property];
    }

    return text;
};

ko.bindingHandlers.safetext = {
    update: function (element, valueAccessor, allBindingsAccessor, viewModel) {
        $(element).text(safeBindingValue(element, valueAccessor, allBindingsAccessor, viewModel));
    }
};

ko.bindingHandlers.safevalue = {
    update: function (element, valueAccessor, allBindingsAccessor, viewModel) {
        $(element).val(safeBindingValue(element, valueAccessor, allBindingsAccessor, viewModel));
    }
};

// This bindinghandler is used for uploading files.
ko.bindingHandlers.uploader = {
    init: function (element, valueAccessor, allBindingsAccessor, viewModel) {
        var bindingTarget = valueAccessor(),        // The target of the binding can be an observable, method or array etc
            allBindings = allBindingsAccessor(),    // Provide access to all of the properties passed to the binding
            getSetId = function ($jQElement) {      // Method that assigns a random Id if necessary to the DOM element and returns the id
                return $jQElement.attr('id') ||
                    $jQElement.attr('id', $jQElement.closest('[id]').attr('id') + '_auto_' + String((new Date()).getTime() + Math.random()).replace('.', '_')).attr('id');
            },
            getProgressBar = function (progressBarId, progressBarOver) {
                if (progressBarId) {
                    var $progressBar = $('#' + progressBarId),
                        $progressLabel = $progressBar.find('div');

                    if (progressBarOver) {
                        $progressBar.position({
                            my: "left top",
                            at: "left top",
                            of: '#' + progressBarOver,
                            collision: 'none'
                        });
                    }

                    $progressLabel.text('Uploading...');
                    $progressBar.progressbar({
                        value: false,
                        change: function () {
                            $progressLabel.text($progressBar.progressbar('value') + '%');
                        },
                        complete: function () {
                            $progressLabel.text('Complete!');
                        }
                    });
                    $progressBar.hide();
                    return $progressBar;
                }
                else {
                    return null;
                }
            },
            $element = $(element),                  // Get jQuery reference to element.
            elementId = getSetId($element),         // Get the DOM id of the element
            browse_button = ko.unwrap(allBindings.browse_button),
            browseButtonId = browse_button.indexOf(' ') === -1 ? // Get the DOM id of the browse button
                browse_button :
                getSetId($element.find(browse_button)),
            $browseButton = $('#' + browseButtonId),
            $container = $browseButton.parent(),
            $trigger = $('<button type="button" style="display: none;" id="' + browseButtonId + '-trigger"></button>').appendTo($container);

        // Define the extensions for the uploader dialog based on the resource type.
        var extensions = ko.unwrap(allBindings.isResourceEditor) ?
            [
                { title: 'Documents', extensions: 'pdf,doc,docx,xls,xlsx,csv' },
                { title: 'Presentations', extensions: 'ppt,pptx,pps,ppsx' },
                { title: 'Audio Files', extensions: 'mp3,m4a,wav' },
                { title: 'Video Files', extensions: 'mpg,mpeg,mp4' }
            ] :
            [
                { title: 'Images', extensions: 'gif,png,jpg,jpeg' }
            ];

        // Instantiate the uploader object.
        var uploader = new plupload.Uploader({
            runtimes: 'html5,html4,silverlight',
            flash_swf_url: '/scripts/plupload/js/Moxie.swf',
            silverlight_xap_url: '/scripts/plupload/js/Moxie.xap',
            //browse_button: browseButtonId,
            browse_button: $trigger.attr('id'),
            container: elementId,
            filters: {
                mime_types: ko.unwrap(allBindings.filters) || extensions
            },
            url: '/pupload.ashx?serverFolder=' // This will be set for real just-in-time.
        });

        //console.log(uploader.settings.filters);
        uploader.init();    // Initialize the uploader object.

        $browseButton.on('click', function (event) {
            uploader.setOption('filters', {
                mime_types: ko.toJS(allBindings.filters) || extensions
            });

            //uploader.settings.filters = {
            //    mime_types: ko.toJS(allBindings.filters) || extensions
            //};
            event.preventDefault();
            $trigger.click();
        });

        // Initialize the progress bar if specified.
        uploader.progressbar = getProgressBar(ko.unwrap(allBindings.progressBarId), ko.unwrap(allBindings.progressBarOver));

        // Link uploader instance to element object.
        element.uploader = uploader;

        // Add custom properties to the Uploader object so that we are ensured to get back the same objects in multi-instance scenarios.
        uploader.instanceProperties = {
            owner: elementId,
            viewModel: viewModel,
            bindingTarget: bindingTarget,
            arrayIndex: ko.unwrap(allBindings.arrayIndex)
        };
        safeconsole('set instanceProperties for uploader[' + uploader.id + ']: owner: ' + elementId);

        // Bind event handlers.

        // Bind the handler that gets fired when the file selection dialog is OKed.
        uploader.bind('FilesAdded', function (up, files) {
            var props = up.instanceProperties;
            safeconsole('FilesAdded fired for uploader[' + up.id + ']: owner: ' + props.owner);

            // Set the uploader Url now.
            up.settings.url = '/pupload.ashx?siteIdentifier=' + ko.unwrap(allBindings.siteIdentifier) +
                '&uploadFolder=' + (!!allBindings.uploadFolder ? ko.unwrap(allBindings.uploadFolder) : '') +
                '&resourceSubTypeName=' + (!!allBindings.resourceSubTypeName ? ko.unwrap(allBindings.resourceSubTypeName) : '');

            if (up.progressbar) {
                up.progressbar.show();
            }

            // Start the upload immediately.
            up.start();
        });

        // Bind the handler that gets fired during the upload process.
        uploader.bind('UploadProgress', function (up, file) {
            safeconsole('UploadProgress fired for uploader[' + up.id + ']: ' + file.percent + '% complete');
            var props = up.instanceProperties;

            // If a progress bar was defined, update it.
            if (up.progressbar) {
                up.progressbar.progressbar('value', file.percent);
            }
        });

        // Plupload does not do a good job saving error state data, so in most cases this event will NOT get triggered.
        uploader.bind('Error', function (up, args) {
            safeconsole('Error fired for uploader[' + up.id + ']: message: ' + args.message);

            var message = args.code + ': ' + args.message;

            switch (args.code) {
                case -601:  // File extension error
                    var extensions = uploader.settings.filters.mime_types[0].extensions;
                    message = 'Please upload files in one of the following formats: ' + extensions;
                    break;
            }

            var props = up.instanceProperties;
            alert(message);
        });

        // Bind the handler that gets fired when the upload is complete.
        uploader.bind('FileUploaded', function (up, file, info) {
            var response = $.parseJSON(info.response);

            if (response.Status == 0) {
                var resource = $.extend({}, response.Result, response.ExtraProperties);

                safeconsole('FileUploaded fired for uploader[' + up.id + ']: FileName: ' + resource.Identifier);

                var props = up.instanceProperties,
                    viewModel = props.viewModel,
                    bindingTarget = props.bindingTarget;

                // If a progress bar was defined, update it.
                if (up.progressbar) {
                    up.progressbar.hide();
                }

                // Depending on how the parameters were defined, bind the object.

                if (typeof props.arrayIndex != 'undefined') {
                    // If there is an arrayIndex defined, the target is an array.
                    var index = ko.unwrap(props.arrayIndex);

                    if (typeof bindingTarget === 'string') {
                        // If the binding target is a string, the string represents the name of a model property.
                        viewModel[bindingTarget][index](resource.FileName);
                    }
                    else if (typeof bindingTarget === 'function') {
                        // If the binding target is a function, execute the function with the file as its parameter.
                        bindingTarget(resource, index, viewModel, allBindings);
                    }
                    else {
                        // Otherwise, the binding target is an observable.
                        ko.mapping.fromJS($.extend({}, resource, {}), {}, bindingTarget[index]);
                    }
                }
                else {
                    if (typeof bindingTarget === 'string') {
                        // If the binding target is a string, the string represents the name of a model property.
                        viewModel[bindingTarget](resource.FileName);
                    }
                    else if (typeof bindingTarget === 'function') {
                        // If the binding target is a function, execute the function with the file as its parameter.
                        bindingTarget(resource, viewModel, allBindings);
                    }
                    else {
                        // Otherwise, the binding target is an observable.
                        ko.mapping.fromJS($.extend({}, resource, {}), {}, bindingTarget);
                    }
                }
            }
            else {
                safeconsole('FileUploaded fired for uploader[' + up.id + ']: Message: ' + response.Message);
                alert(response.Message);
            }
        });

        setTimeout(function () {
            uploader.refresh();
        }, 250);
        guploader = uploader;
    }
};

ko.bindingHandlers.multiuploader = {
    init: function (element, valueAccessor, allBindingsAccessor, viewModel) {
        var bindingTarget = valueAccessor(),
            allBindings = allBindingsAccessor(),
            fileList = allBindings.fileList,
            newItem = allBindings.newItem,
            fileArray = viewModel[bindingTarget],
            getSetId = function ($jQElement) {
                return $jQElement.attr('id') ||
                    $jQElement.attr('id', $jQElement.closest('[id]').attr('id') + '_auto_' + String((new Date()).getTime() + Math.random()).replace('.', '_')).attr('id');
            },
            $element = $(element),  // Get jQuery reference to element.
            elementId = getSetId($element),
            browse_button = allBindings.browse_button.indexOf(' ') === -1 ?
                allBindings.browse_button :
                getSetId($element.find(allBindings.browse_button));

        var extensions = allBindings.isResourceEditor ?
            [
                { title: 'Documents', extensions: 'pdf,doc,docx,xls,xlsx,csv' },
                { title: 'Presentations', extensions: 'ppt,pptx,pps,ppsx' },
                { title: 'Audio Files', extensions: 'mp3,wma,wav' },
                { title: 'Video Files', extensions: 'mpg,mpeg,mp4' }
            ] :
            [
                { title: 'Images', extensions: 'gif,png,jpg,jpeg' }
            ];

        var uploader = new plupload.Uploader({
            runtimes: 'html5,html4,silverlight',
            flash_swf_url: '/scripts/plupload/js/Moxie.swf',
            silverlight_xap_url: '/scripts/plupload/js/Moxie.xap',
            browse_button: browse_button,
            container: elementId,
            //filters: extensions,
            //filters: (!!allBindings.filterTitle | !!allBindings.filterExtensions) ? [{ title: ko.unwrap(allBindings.filterTitle), extensions: ko.unwrap(allBindings.filterExtensions) }] : null,
            filters: {
                mime_types: ko.unwrap(allBindings.filters) || extensions
            },
            url: '/pupload.ashx?serverFolder=' // This will be set for real JIT.
        });

        uploader.init();

        // Link uploader instance to element object.
        element.uploader = uploader;

        // Add custom properties to the Uploader object so that we are ensured to get back the same objects in multi-instance scenarios.
        uploader.instanceProperties = {
            owner: elementId,
            viewModel: viewModel,
            bindingTarget: bindingTarget,
            fileList: fileList,
            $fileList: fileList ? $('#' + fileList) : null,
            arrayIndex: allBindings.arrayIndex
        };
        safeconsole('set instanceProperties for uploader[' + uploader.id + ']: owner: ' + elementId);

        uploader.bind('FilesAdded', function (up, files) {
            // Set the uploader Url now.
            up.settings.url = '/pupload.ashx?siteIdentifier=' + ko.unwrap(allBindings.siteIdentifier) +
                '&uploadFolder=' + ko.unwrap(allBindings.uploadFolder) + (!!ko.unwrap(allBindings.uploadSubFolder) ? '/' + ko.unwrap(allBindings.uploadSubFolder) : '') +
                '&resourceSubTypeName=' + ko.unwrap(allBindings.resourceSubTypeName);

            var props = up.instanceProperties;
            safeconsole('FilesAdded fired for uploader[' + up.id + ']: owner: ' + props.owner);

            // props.$fileList.show();
            var newFiles = [];
            // loop through the files array
            $.each(files, function (index, file) {
                newFiles.push(newItem(file.id, file.name, file.size));
            });

            fileArray.pushAll(newFiles);

            // Upload immediately.
            up.start();
        });

        uploader.bind('UploadProgress', function (up, file) {
            var fileItem = fileArray.getAt(function (f) { return f.Id() == file.id; });
            fileItem.PercentUploaded(file.percent);
            safeconsole('UploadProgress fired for uploader[' + up.id + ']: ' + file.percent + '% complete');
        });

        // Plupload does not do a good job saving error state data, so in most cases this event will NOT get triggered.
        uploader.bind('Error', function (up, args) {
            safeconsole('Error fired for uploader[' + up.id + ']: message: ' + args.message);

            var message = args.code + ': ' + args.message;

            switch (args.code) {
                case -601:  // File extension error
                    var extensions = uploader.settings.filters.mime_types[0].extensions;
                    message = 'Please upload files in one of the following formats: ' + extensions;
                    break;
            }

            var props = up.instanceProperties;
            alert(message);
        });

        uploader.bind('FileUploaded', function (up, file, info) {
            var response = $.parseJSON(info.response);

            if (response.Status == 0) {
                var resource = $.extend({}, response.Result, response.ExtraProperties);

                safeconsole('FileUploaded fired for uploader[' + up.id + ']: Identifier: ' + resource.Identifier);

                //var fileItem = fileArray.getAt(function (f) { return f.Id() == file.id; });

                //fileItem.Id(resource.Id);
                //fileItem.Title(resource.Title);
                //fileItem.Disposal(resource.Disposal);
                //fileItem.PercentUploaded(100);

                var arrayItem = ko.utils.arrayFirst(fileArray(), function (elem) {
                    return elem.Id() === file.id;
                });

                if (arrayItem) {
                    ko.mapping.fromJS(resource, arrayItem);
                }
            }
            else {
                safeconsole('FileUploaded fired for uploader[' + up.id + ']: Message: ' + response.Message);
                alert(response.Message);
            }
        });

        setTimeout(function () {
            uploader.refresh();
        }, 250);

        //$(function () {
        //    uploader.refresh();
        //});
    }
};

ko.bindingHandlers.uploadedfile = {
    update: function (element, valueAccessor, allBindingsAccessor, viewModel) {
        var file = ko.unwrap(valueAccessor()),
            allBindings = allBindingsAccessor(),
            fileNameProperty = allBindings.fileNameProperty,
            fileSizeProperty = allBindings.fileSizeProperty,
            useProperties = !!fileNameProperty && !!fileSizeProperty,
            getFileName = function (fullFileName) {
                if (!fullFileName) {
                    return '';
                }
                else {
                    var segs = fullFileName.split('/'),
                        fileName = segs[segs.length - 1];

                    return fileName;
                }
            },
            textFunc = function (fileName, fileSize) {
                return (!fileName | !fileSize) ? '' : getFileName(fileName) + ' (' + fileSize + ' bytes)';
            },
            text = (!file ? '' : (
                typeof file === 'string' ? getFileName(file) :
                (useProperties ? textFunc(file[fileNameProperty](), file[fileSizeProperty]()) :
                    textFunc(ko.unwrap(file.name || file.Identifier), ko.unwrap(file.size || file.Disposal)))));

        $(element).text(text || '');
    }
};

ko.bindingHandlers.themeswatch = {
    update: function (element, valueAccessor, allBindingsAccessor, viewModel) {
        var theme = ko.unwrap(valueAccessor()),
            allBindings = allBindingsAccessor(),
            themes = allBindings.themes,
            themeItem = ko.utils.arrayFirst(themes, function (item) {
                return item.themeName === theme;
            });

        if (!!themeItem)
            $(element).attr('style', 'background-color: ' + themeItem.backgroundColor);
    }
};

/*
ko.virtualElements.allowedBindings.emitStyles = true;
ko.bindingHandlers.emitStyles = {
    init: function (elem, valueAccessor) {
        var value = valueAccessor(),
            valueUnwrapped = ko.unwrap(value),
            markup = '<style type="text/css">' + valueUnwrapped + '</style>';

        markup = '<style type="text/css"> body {  background-color: #3366FF; } </style>';

        //$('head').append(markup);
        //ko.virtualElements.prepend(elem, markup[0]);

        $("<style>")
            .prop("type", "text/css")
            .html("\
    td {\
        font-size: 20pt;\
    }\
    body {\
        background-color: #3366FF;\
    }")
          .appendTo("head");

    }
};
*/

ko.bindingHandlers.datapager = {
    init: function (element, valueAccessor, allBindingsAccessor, viewModel) {
        var $element = $(element),  // Get jQuery reference to element.
            items = valueAccessor(),
            allBindings = allBindingsAccessor(),
            query = ko.mapping.toJS(ko.unwrap(allBindings.query)),
            getPage = ko.unwrap(allBindings.getPage),
            webServiceMethodName = ko.unwrap(allBindings.webServiceMethodName),
            numberedListId = allBindings.numberedListId,
            totalRecords = ko.unwrap(allBindings.totalRecords || items().length),
            isPageInCache = function (pageIndex, pageSize) {
                return pageIndex * pageSize < items().length;
            },
            setDestroy = function (array, index, value) {
                if (array.length > index)
                    array[index]['_destroy'] = value;
            },
            pager,
            mergeDataCallback = function (dstArray, srcArray) {
                var underlyingArray = dstArray.peek();
                dstArray.valueWillMutate();

                if (srcArray) {
                    $.each(srcArray, function (index, value) {
                        underlyingArray.push($.extend({ '_destroy': true }, ko.mapping.fromJS(value)));
                    });
                }

                var pageSize = pager.items_per_page,
                    oldFirstIndex = pageSize * pager.prev_page,
                    oldLastIndex = pageSize * (pager.prev_page + 1) - 1,
                    newFirstIndex = pageSize * pager.current_page,
                    newLastIndex = pageSize * (pager.current_page + 1) - 1;

                for (var index = oldFirstIndex; index <= oldLastIndex; index++)
                    setDestroy(underlyingArray, index, true);

                for (var index = newFirstIndex; index <= newLastIndex; index++)
                    setDestroy(underlyingArray, index, false);

                dstArray.valueHasMutated();

                if (numberedListId)
                    $('#' + numberedListId).attr('start', newFirstIndex + 1);
            },
            options = $.extend({
                callback: function (jq) {
                    pager = this;

                    var pageIndex = pager.current_page,
                        pageSize = pager.items_per_page;

                    if (!isPageInCache(pageIndex, pageSize)) {
                        var cursor = {
                            StartRowIndex: items().length + 1,
                            PageSize: pageSize * (pageIndex + 1 - items().length / pageSize)
                        };
                        getPage(query, cursor, webServiceMethodName, viewModel, mergeDataCallback);
                    }
                    else {
                        mergeDataCallback(items);
                    }
                }
            }, allBindings);

        $element.pagination(totalRecords, options);
    },

    update: function (element, valueAccessor, allBindingsAccessor, viewModel) {
        var value = ko.unwrap(valueAccessor()),
            allBindings = allBindingsAccessor();

        //if (!!themeItem)
        //    $(element).attr('style', 'background-color: ' + themeItem.backgroundColor);
    }
};

// XPath binding.

// Use Singleton XML parser to reduce memory footprint.
var _xparser;
function XParser() {
    var _self = this,
        isIE = (window.navigator && window.navigator.appName == 'Microsoft Internet Explorer' && !window.opera) | 
            (window.navigator && (window.navigator.userAgent.indexOf('rv:11') > -1) && !window.opera),
        result;

    _self.xquery = function (xml, xpath) {
        if (!_xparser) {
            if (isIE) {
                _xparser = new ActiveXObject("Microsoft.XMLDOM");
                _xparser.async = false;
                _xparser.setProperty("SelectionLanguage", "XPath");
            }
            else {
                _xparser = new DOMParser();
            }
        }

        if (isIE) {
            _xparser.loadXML(xml);
            var node = _xparser.selectSingleNode(xpath);
            result = node ? node.value : '';
        }
        else {
            var xdoc = _xparser.parseFromString(xml, "text/xml");
            var node = xdoc.evaluate(xpath, xdoc, null, XPathResult.STRING_TYPE, null);
            result = node ? node.stringValue : '';
        }

        return result;
    };
}

ko.bindingHandlers.xpath = {
    update: function (element, valueAccessor, allBindingsAccessor, viewModel) {
        var xml = ko.unwrap(valueAccessor()),
            allBindings = allBindingsAccessor(),
            formats = $.extend({ text: ko.unwrap(allBindings.format) || '{0}' }, ko.unwrap(allBindings.formats)),
            $element = $(element),
            parser = new XParser(),
            applyTransforms = function () {
                var xquery = ko.unwrap(allBindings.query),
                    queries = typeof xquery === 'string' ? { text: xquery } : xquery;

                if (queries.text) {
                    var text = parser.xquery(xml, queries.text),
                        ftext = !!text ? formats['text'].replace('{0}', text) : '';

                    $element.text(ftext);
                    delete queries.text;
                }

                $.each(queries, function (key, query) {
                    var value = parser.xquery(xml, query),
                        fvalue = formats[key] ? formats[key].replace('{0}', value) : value;

                    queries[key] = fvalue;
                });
                $element.attr(queries);
            };

        applyTransforms();
    }
};

ko.bindingHandlers.downloadResource = {
    update: function (anchor, valueAccessor, allBindingsAccessor, resourceSummary) {
        var options = ko.unwrap(valueAccessor()),
            $anchor = $(anchor),
            fileName = resourceSummary.FileName(),
            href = '//' + Settings.imageServer +
                '/www/resources/' + resourceSummary.UrlFolder() +
                '/' + fileName,
            buildText = function () {
                return !options.showFileSize ? fileName :
                    (options.fileSizeFormat || '{0}').
                        replace('{0}', fileName).
                        replace('{1}', resourceSummary.FileSize());
            },
            text = buildText();

        if (!!text) {
            $anchor.text(text).attr({ href: href });

            if (options.showIcon) {
                $anchor.addClass(fileName.match(/\.([^\.]+)$/)[1].toLowerCase());
                }
            }
        }
};


//: $data, showIcon: true, showFileSize: true, fileSizeFormat: '{0} ({1} bytes)'


ko.bindingHandlers.secmatrix = {
    init: function (element, valueAccessor, allBindingsAccessor, viewModel) {
        var $table = $(element).closest('table');

        // Set event handler for checkboxes.
        if (!$table.data('handleractive')) {
            $table.on('change', 'input[type=checkbox]',
                function () {
                    var roles = allBindingsAccessor().roles,
                        value = this.value,
                        checked = this.checked;

                    if (checked) {
                        roles.push(value);
                    }
                    else {
                        roles.remove(value);
                    }
            });

            $table.data('handleractive', true);
        }

        var $element = $(element),
            $parent = $element.parent(),
            matrixvalue = ko.unwrap(valueAccessor());

        if (!matrixvalue) {
            $element.hide();
            $parent.addClass('noroles');
        }
        else {
            $parent.removeClass('noroles');

        }
    },
    update: function (element, valueAccessor, allBindingsAccessor, viewModel) {
        var $element = $(element),
            $parent = $element.parent(),
            matrixvalue = ko.unwrap(valueAccessor());

        if (!!matrixvalue) {
            var value = matrixvalue.split('|');
            $element.val(value[0]).prop('checked', value[1] == '1');
        }
    }
};