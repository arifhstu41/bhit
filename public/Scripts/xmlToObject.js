// Changes XML to JSON
function xmlToObject(xml, arrayItemElementNames) {

    var getElement = function (xml) {
        if (typeof xml == "string") {
            var xmlDoc;

            if (window.DOMParser) {
                var parser = new DOMParser();
                xmlDoc = parser.parseFromString(xml, "text/xml");
            }
            else // Internet Explorer
            {
                xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
                xmlDoc.async = false;
                xmlDoc.loadXML(xml);
                xmlDoc.setProperty("SelectionLanguage", "XPath");
            }
            return xmlDoc.childNodes.item(0);
        }
        else
            return xml;
    };

    var firstChildElement = function (element) {
        for (var child = element.firstChild; child && child.nodeType != 1; child = child.nextSibling)
            ;
        return child;
    };

    var nextElement = function (element) {
        for (element = element.nextSibling; element && element.nodeType != 1; element = element.nextSibling)
            ;
        return element;
    };

    var endsWith = function (str, suffix) {
        return str.indexOf(suffix, str.length - suffix.length) !== -1;
    };

    var removeFromEnd = function(str, suffix) {
        return str.slice(0, -suffix.length);
    };

    var hasChildrenNamed = function(element, arrayItemNames) {
        var rx = new RegExp(arrayItemNames.replace(/\,/g, '|'));

        for (var childElement = firstChildElement(element) ; childElement; childElement = nextElement(childElement)) {
            if (childElement.localName.match(rx))
                return true;
        };

        return false;
    };

    var prependItemName = function(arr, itemName) {
        return itemName + (itemName + arr ? ',' : '') + (arr || '');
    };

    var isArray = function (element, arrayItemNames) {
        var elementName = element.localName;

        ['es', 's'].forEach(function(suffix) {
            if (endsWith(elementName, suffix))
                arrayItemNames = prependItemName(arrayItemNames, removeFromEnd(elementName, suffix));
        });

        var _isArray = hasChildrenNamed(element, arrayItemNames);
        return _isArray;
    };

    var elementToObject = function (element, arrayItemElementNames) {
        var obj = null;

        if (element) {
            if (isArray(element, arrayItemElementNames)) {
                obj = [];

                // Map element children to array elements.
                for (var childElement = firstChildElement(element) ; childElement; childElement = nextElement(childElement)) {
                    obj.push(elementToObject(childElement, arrayItemElementNames));
                }
            }
            else {
                obj = {};

                // Map element attributes to object properties.
                if (element.attributes) {
                    for (var i = 0; i < element.attributes.length; i++) {
                        var attribute = element.attributes.item(i);
                        obj[attribute.nodeName] = attribute.nodeValue;
                    }
                }

                // Map element children to nested objects.
                for (var childElement = firstChildElement(element) ; childElement; childElement = nextElement(childElement)) {
                    obj[childElement.localName] = elementToObject(childElement, arrayItemElementNames);
                }
            }
        }

        return obj;
    };

    var element = getElement(xml);

    // Create the return object.
    var obj = elementToObject(element, arrayItemElementNames);
    return obj;
};
