/*

Web Services / Web API jQuery Plugin
Author: Ken Granderson, 2012
Description: This jQuery plugin centralizes and manages web service calls and 
implements a hack for crosss-domain POST / PUT / DELETEs for Web API via custom headers
(must be supported on the server!)

*/
(function ($) {
    $.support.cors = true;  // ALWAYS enable cross-domain calls - and this must be done BEFORE any AJAX calls are made!

    // Define the webService singleton object in the jQuery namespace.
    $.webService = {
        baseUrl: '',    // Optional base Url that can be iniitalized from an AS?X via a config file setting.
        exec: function (functions, data) {
            if ($.isArray(functions))
                return $.each(functions, function (index, func) {
                    $.webService.exec(func, data);
                });
            else if ($.isFunction(functions))
                return functions(data);
        },
        // The call method actually makes the AJAX call.
        call: function (
            url,                // Full Url of the AJAX call.
            data,               // Data to send to the server.
            successCallback,    // Callback if call is successful.
            failureCallback,    // Callback if call fails.
            alwaysCallback,     // Callback that is always called when the call completes.
            options,            // Object to override default options.
            beforeCallback      // Callback to call before the AJAX call (loading...)
            ) {
            //alert('11111111------------' + data);
            var result,         // Return value for synchronous calls.
                ajaxOptions = { // Default options.
                    type: "INVALID",    // Force calling methods to set the HTTP method.
                    url: url,
                    data: (typeof data !== 'string' ? $.toJSON(data) : data) || {},
                    async: true,
                    contentType: "application/json; charset=utf-8",
                    beforeSend: function () {
                        document.body.style.cursor = 'wait';
                        if (beforeCallback)
                            $.webService.exec(beforeCallback);
                    }
                };

            $.extend(ajaxOptions, options); // Override any default options.

            $.ajax(ajaxOptions) // Make the AJAX call.
                .done(function (data, status, jqXHR) {
                    result = 'success';
                    var jsonResult = typeof data.d !== 'undefined' ? data.d : data;    // Get the JSON result.
                    if (successCallback)
                        result = $.webService.exec(successCallback, jsonResult);   // Call the success callback.
                })
                .fail(function (jqXHR, status, error) {
                    result = 'failure';
                    if (failureCallback)
                        failureCallback(jqXHR, status, error);  // Call the failure callback.
                    else {
                        if (jqXHR.responseText) {
                            var responseText = jqXHR.responseText,
                                header = 'url:' + url + '\r\n' +
                                'data:' + data + '\r\n';

                            if (responseText.indexOf('ExceptionType')) {
                                var err = eval('(' + responseText + ')');
                                alert(header + err.ExceptionType + '\r\n' +
                                    err.Message + '\r\n' +
                                    err.StackTrace);
                            }
                            else {
                                alert(header + responseText);
                            }
                        }
                        else
                            alert('ERROR: ' + error);
                    }
                })
                .always(function () {
                    document.body.style.cursor = 'default';
                    if (alwaysCallback)
                        alwaysCallback();   // Call the always callback.
                });

            return result;  // Return the result (only useful for synchronous calls).
        },
        // Same domain JSON call.
        callJSON: function (url, method, data, successCallback, failureCallback, alwaysCallback, options) {
            var ajaxOptions = $.extend({ type: method, dataType: 'json' }, options);
            return $.webService.call(url, data, successCallback, failureCallback, alwaysCallback, ajaxOptions);
        },
        // Same domain GET with JSON.
        get: function (url, successCallback, failureCallback, alwaysCallback, options) {
            return $.webService.callJSON(url, 'GET', null, successCallback, failureCallback, alwaysCallback, options);
        },
        // Same domain GET with JSONP.
        getJSONP: function (url, successCallback, failureCallback, alwaysCallback, options) {
            var ajaxOptions = $.extend({ dataType: 'jsonp' }, options);
            return $.webService.get(url, successCallback, failureCallback, alwaysCallback, ajaxOptions);
        },
        // Same domain POST with JSON.
        post: function (url, data, successCallback, failureCallback, alwaysCallback, options) {
            return $.webService.callJSON(url, 'POST', data, successCallback, failureCallback, alwaysCallback, options);
        },
        // Same domain PUT with JSON.
        put: function (url, data, successCallback, failureCallback, alwaysCallback, options) {
            return $.webService.callJSON(url, 'PUT', data, successCallback, failureCallback, alwaysCallback, options);
        },
        // Same domain DELETE with JSON.
        httpDelete: function (url, data, successCallback, failureCallback, alwaysCallback, options) {
            return $.webService.callJSON(url, 'DELETE', data, successCallback, failureCallback, alwaysCallback, options);
        },
        // Cross domain JSONP call with custom headers.
        callXDR: function (url, method, data, successCallback, failureCallback, alwaysCallback, options) {
            var ajaxOptions = $.extend({ headers: { 'X-HTTP-Method-Override': method } }, options);
            // Move the headers to the query string.
            for (var header in ajaxOptions.headers) {
                url += (/\?/.test(url) ? "&" : "?") + 'Header-' + header + '=' + ajaxOptions.headers[header];
            }
            delete ajaxOptions.headers;
            return $.webService.getJSONP(url, successCallback, failureCallback, alwaysCallback, ajaxOptions);
        },
        // Cross domain POST with custom headers.
        postXDR: function (url, data, successCallback, failureCallback, alwaysCallback, options) {
            return $.webService.callXDR(url, 'POST', data, successCallback, failureCallback, alwaysCallback, options);
        },
        // Cross domain PUT with custom headers.
        putXDR: function (url, data, successCallback, failureCallback, alwaysCallback, options) {
            return $.webService.callXDR(url, 'PUT', data, successCallback, failureCallback, alwaysCallback, options);
        },
        // Cross domain DELETE with custom headers.
        deleteXDR: function (url, data, successCallback, failureCallback, alwaysCallback, options) {
            return $.webService.callXDR(url, 'DELETE', data, successCallback, failureCallback, alwaysCallback, options);
        }
    };
})(jQuery);
