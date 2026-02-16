
var ResourcePage = {
    selector: null,
    editor: null,
    previewer: null,
    resourceSubTypeName: '',
    resourceAdapterCount: 0,
    lookups: null,
    focusEditor: null,
    debug: true
};

var resourceDebug = function (message) {
    if (ResourcePage.debug) {
        safeconsole(message);
    }
};

var startsWith = function (string, start) {
    return string.slice(0, start.length) === start;
};

var startsWithAny = function (string, starts) {
    for (var index = 0; index < starts.length; index++) {
        if (startsWith(string, starts[index]))
            return true;
    }
    return false;
};

// Method that expands XML fields of regular JSON objects.
var expandXmlProperties = function (data) {
    for (var property in data) {
        var value = data[property];
        if (typeof value === 'string') {
            if (startsWithAny(value, ['<Properties', '<ListItem', '<Header']))
                data[property] = xmlToObject(value, 'ListItem');
        }
    }
    return data;
};

// Method that generates a (potential) Url slug.
function generateSlug(text) {
    return (text || '').
        replace(/[^\w+]/g, '-').
        replace(/-+/g, '-').
        toLowerCase();
}

function resourceAdapter(
    viewId,
    data,
    options
    ) {
    // Always save a pointer to 'this' for future reference.
    var _self = this;

    ResourcePage.resourceAdapterCount += 1;
    _self.id = ResourcePage.resourceAdapterCount;

    _self.options = $.extend({
        useLazyLoading: true
    }, options);

    _self.model = null;
    _self.cursor = {
        StartRowIndex: _self.options.StartRowIndex || 1,
        PageSize: _self.options.PageSize || 1048576
    };

    // Property for list adapters.
    _self.selectedId = null;

    // Helper method.
    _self.unwrap = function (koItem) {
        var item = ko.toJS(koItem);
        delete item.__ko_mapping__;
        delete item.ExtraData;
        delete item.adapter;
        delete item.createParams;
        delete item.errors;
        return item;
    };

    // Initialize the model with a Knockout observable of the initial data.
    if (_self.options.useLazyLoading && data.Items) {
        // Add lazy-loading properties.
        _self.lazyLoader = {
            isLoading: false,
            array: null,
            index: 0,
            chunkSize: 100,
            delay: 2000,
            createmapping: {
                create: function (obj) {
                    resourceDebug('mapping: create');

                    var itemsTemp = obj.data.Items;
                    obj.data.Items = [];

                    var mapped = ko.mapping.fromJS(obj.data);
                    obj.data.Items = itemsTemp;
                    mapped.Items = ko.observableArray([]);
                    _self.lazyLoader.lazyAppendChunk(mapped.Items, obj.data.Items);
                    return mapped;
                }
            },
            updatemapping: {
                update: function (obj) {
                    _self.lazyLoader.cancelLoad();

                    resourceDebug('mapping: update');

                    var newdata = obj.data,
                        target = obj.target;

                    for (var property in target) {
                        if (property !== 'Items') {
                            if (ko.isWriteableObservable(target[property])) {
                                target[property](newdata[property]);
                            }
                        }
                    }
                    _self.lazyLoader.lazyAppendChunk(obj.target.Items, obj.data.Items);
                }
            },
            getNextChunk: function (chunkSize) {
                var _this = this;

                //safeconsole('calling getNextChunk: index = ' + _this.index);
                var items = _this.array.slice(_this.index, _this.index += (chunkSize ? chunkSize : _this.chunkSize));
                for (var i = 0; i < items.length; i++) {
                    items[i] = ko.mapping.fromJS($.extend({ HighlightedTitle: items[i].Title }, items[i]));
                }
                return items;
            },
            cancelLoad: function () {
                // Cancel load.
                var _this = this;

                _this.isLoading = false;
                _this.index = 0;
                _this.array = null;
                //safeconsole('lazyAppendChunk.cancelLoad();');
            },
            lazyAppendChunk: function (koArray, jsArray, options) {
                var _this = this;

                //safeconsole('calling lazyAppendChunk(' + jsArray + ')');
                if (jsArray) {
                    // Initial load, (re)set _this properties.
                    //safeconsole('lazyAppendChunk: Initial load, (re)set _this properties.');
                    _this.array = jsArray;
                    _this.index = 0;
                    _this.isLoading = true;
                }

                var _options = $.extend({ chunkSize: _this.chunkSize, delay: _this.delay }, options);

                if (_this.isLoading) {
                    if (_this.index === 0) {
                        // Initial load - replace observable array with first chunk, advance cursor.
                        //safeconsole('lazyAppendChunk: Initial load - replace observable array with first chunk, advance cursor.');
                        koArray(_this.getNextChunk(_options.chunkSize));
                    }
                    else {
                        // Append next chunk, advance cursor.
                        //safeconsole('lazyAppendChunk: Append next chunk, advance cursor.');
                        koArray.push.apply(koArray, _this.getNextChunk(_options.chunkSize));
                    }
                }

                // If there is more data, schedule the next chunk append.
                if (_this.isLoading && _this.index < _this.array.length) {
                    //safeconsole('lazyAppendChunk: more data, next chunk scheduled for ' + _options.delay + 'ms');
                    setTimeout(function () { _this.lazyAppendChunk(koArray, null, options); }, _options.delay);
                }
                else {
                    // We're done, cancel load operation.
                    _this.cancelLoad();
                }
            }
        };

        _self.cancelLazyLoad = function () {
            _self.lazyLoader.cancelLoad();
        };
    }

    //model.dirtyFlag = new ko.dirtyFlag(model);

    // Semaphore to avoid web service call recursion.
    var inQuery = false;

    // Generic web service method delegate.
    _self.executeMethod = function (
        methodName,         // Web Method Name
        parms,              // Parameters object
        successCallback,    // Callback on success
        failureCallback     // Callback on failure
        ) {
        if (!inQuery) {
            inQuery = true;

            var _jsonData = $.toJSON(parms),
                _url = '/admin/resourceapi.asmx/' + methodName;

            resourceDebug('Calling ajax://:' + _url);
            resourceDebug(_jsonData);

            $.webService.post(
                _url,
                _jsonData,
                function (data) {
                    inQuery = false;
                    resourceDebug('ajax://:' + _url + ' complete - status = ' + data.Status);
                    if (data.Status === 0) {
                        successCallback && successCallback(data.Result);
                    }
                    else {
                        resourceDebug('ajax://:' + _url + ' server error: ' + data.Message);
                        alert(data.Message);
                    }
                },
                failureCallback || function (xhr) {
                    inQuery = false;
                    resourceDebug('ajax://:' + _url + ' error: ' + xhr.responseText);
                    alert(xhr.responseText);
                },
                function () {
                    inQuery = false;
                });
        }
    };

    // Query method delegate.
    _self.executeQueryMethod = function (
        methodName,         // Web Method Name
        successCallback,    // Callback on success
        failureCallback     // Callback on failure
        ) {
        _self.executeMethod(methodName,
            {
                query: _self.unwrap(_self.model.query),
                cursor: _self.cursor
            },
            successCallback, failureCallback);
    };

    // Getter for the view.
    _self.getView = function () {
        return _self.$view;
    };

    var getResourceHeaderName = function (resourceHeader) {
        return resourceHeader ? resourceHeader.Title() : '';
    };

    var getFirstArrayElement = function (array) {
        return array.length === 0 ? '' : array[0];
    };

    _self.updateModel = function (data, bindToDOM) {
        var xdata = $.extend(true, {}, expandXmlProperties(data));
        _self.options.beforeMapping && _self.options.beforeMapping(xdata);

        if (_self.model) {
            ko.mapping.fromJS($.extend({ HighlightedTitle: xdata.Title }, xdata, _self.options.updatemapping || {}),
                _self.lazyLoader ? _self.lazyLoader.updatemapping : _self.options.updatemapping || {},
                _self.model);
        }
        else {
            _self.model = _self.lazyLoader ?
                ko.mapping.fromJS(xdata, _self.lazyLoader.createmapping) :
                ko.mapping.fromJS($.extend({ HighlightedTitle: xdata.Title }, xdata, _self.options.createmapping || {}));
        }

        $(document).trigger('updateModel.' + viewId);
    };

    _self.updateItem = function (item) {
        var arrayItem = ko.utils.arrayFirst(_self.model.Items(), function (elem) {
            return (elem.Id && elem.Id() ? elem.Id() : elem.Url()) === (item.Id || item.Url);
        });

        if (arrayItem) {
            var itemCopy = $.extend({ HighlightedTitle: arrayItem.Title }, arrayItem);

            ko.mapping.fromJS(expandXmlProperties(item), { ignore: ['__type', 'Permissions'] }, itemCopy);
            _self.model.Items.replace(arrayItem, itemCopy);
        }
        else {
            //item.Permissions = 7;   // You made it, you own it.

            var koItem = ko.mapping.fromJS(expandXmlProperties($.extend({ HighlightedTitle: item.Title }, item)), { ignore: ['__type'] }),
                selectedIndex = _self.model.Items.firstIndexOf(function (elem) {
                    return (elem.Id ? elem.Id() : elem.Url()) === _self.selectedId;
                });

            if (selectedIndex >= 0) {
                _self.model.Items.splice(selectedIndex + 1, 0, koItem);
            }
            else {
                _self.model.Items.unshift(koItem);
            }
        }
        $(document).trigger('updateItem.' + viewId);
    };

    _self.addMethod = function (methodName, method) {
        _self.model[methodName] = method;
    };

    _self.resetCursor = function () {
        _self.cursor.StartRowIndex = 1;
    };

    // The initial ko mapping (NOT binding!) happens here.
    _self.updateModel(data);

    // Defer the UI binding until DOMReady.
    $(function () {
        // Save the view.
        _self.$view = $('#' + viewId);

        if (_self.options.hideOnStartup)
            _self.$view.hide();

        // Initialize any custom properties.
        _self.options.beforeInitialBinding && _self.options.beforeInitialBinding(_self.model);
        $(document).trigger('beforeInitialBinding.' + viewId);

        // Bind the KO model to the view (the DOM element with id=viewId).
        ko.applyBindings(_self.model, _self.$view[0]);

        // Execute methods after the initial binding.
        _self.options.afterInitialBinding && _self.options.afterInitialBinding(_self.model);
        $(document).trigger('afterInitialBinding.' + viewId);
    });
}

// In the Admin pages, both the Editor and Preview panes are ResourceEditors.
// The only significant difference is that the HTML controls in the Preview pane are all read-only.
function ResourceEditor(
    resourceSubTypeName,
    newResource,
    viewId,
    options,
    initData
    ) {
    resourceDebug('Loading ResourceEditor bound to "' + viewId + '" for resource Type "' + resourceSubTypeName + '"');
    ResourcePage.resourceSubTypeName = resourceSubTypeName;

    // Always save a pointer to 'this' for future reference.
    var _self = this;

    // Save the options.
    _self.options = $.extend({
        hideOnStartup: true,
        closeAfterSave: false,
        validators: {
            showAllErrors: false,
            rules: {}
        }
    }, options);

    // Save the new resource object for the New method.
    _self.newResource = newResource;

    // If initData was supplied, attach it to the model.
    if (initData) {
        _self.newResource.initData = initData;
    }

    // Create and save a resource adapter.
    var adapter = new resourceAdapter(viewId, newResource, _self.options);

    _self.getModel = function () {
        return adapter.model;
    };

    _self.getViewId = function () {
        return viewId;
    };

    // Add methods requiring binding to the model.

    adapter.addMethod('save', function (
        resource             // Item to update
        ) {
        if (ResourcePage.focusEditor) {
            ResourcePage.focusEditor.focusManager.blur(true);
        }

        var validate = function (model, validators) {
            var messages = '',
                isValid = true,
                showAllErrors = validators.showAllErrors,
                rules = validators.rules;

            for (ruleName in rules) {
                if (showAllErrors || isValid) {
                    var rule = rules[ruleName],
                        message = rule(model);

                    isValid = isValid && (message == '');

                    if (message != '') {
                        messages += message + '\n';
                    }
                }
            }

            if (messages != '') {
                alert(messages);
            }

            return messages == '';
        };

        if (validate(resource, _self.options.validators)) {
            // Call before save method if provided.
            _self.options.beforeSave && _self.options.beforeSave(_self.model);

            // The Resource.ExtraData field is generated and readonly, so in reality
            // it can never be changed by the Editor.  So we override its use by 
            // using it during saves to pass serialized additional objects (i.e. menu reordering data).
            var editorData = _self.options.getEditorData ?
                _self.options.getEditorData(resource) :
                null;

            adapter.executeMethod(
                _self.options.saveMethod || 'SaveResource',
                {
                    resource: $.extend({ ExtraData: editorData }, adapter.unwrap(resource))
                },
                function (data) {
                    if (ResourcePage.selector)
                        ResourcePage.selector.updateItem(data);

                    // Call after success  save method if provided.
                    _self.options.afterSaveSuccess && _self.options.afterSaveSuccess(_self.model);

                    alert((resourceSubTypeName === 'Resource' ? 'Resource' : resourceSubTypeName.replace('Resource', '')) + ' saved.');

                    if (_self.options.closeAfterSave)
                        adapter.cancel();
                });
        }
    });

    _self.toggle = function (show) {
        adapter.getView().toggle(show);
    };

    adapter.addMethod('cancel', function () {
        adapter.getView().hide();
    });

    _self.addNew = function (newData) {
        var newItem = $.extend({}, _self.newResource, newData || {});
        newItem.Items && newItem.Items.removeAll();

        _self.options.onNew && _self.options.onNew(newItem);

        _self.updateModel(newItem);
    };

    _self.getById = function (id) {
        _self.options.onSelect && _self.options.onSelect(id);

        adapter.executeMethod(
            _self.options.selectMethod || 'GetResourceByTypeId',
            { resourceSubTypeName: resourceSubTypeName, id: id },
            function (data) {
                _self.updateModel(data, true);
            });
    };

    _self.updateModel = function (data, bindToDOM) {
        adapter.updateModel(data, bindToDOM);
        var view = adapter.getView();
        if (!!view)
            view.show();
    };
}

function ResourceSummaryList(
    resourceSubTypeName,
    query,
    items,
    listId,
    options
    ) {
    resourceDebug('Loading ResourceSummaryList bound to "' + listId + '" for resource Type "' + resourceSubTypeName + '": ' + (items || []).length + ' items');
    // Always save a pointer to 'this' for future reference.
    var _self = this;

    _self.resourceSubTypeName = resourceSubTypeName;

    // Save the options.
    _self.options = $.extend({}, options);

    // Create and save a resource adapter.
    var data = {
        query: query,
        Items: items,
        TotalRecords: _self.options.TotalRecords || items.length
    },
        adapter = new resourceAdapter(listId, data, _self.options);

    _self.getModel = function () {
        return adapter.model;
    };

    // The getSummaries method makes an AJAX call to populate the Resource Summary list.
    // This method name can be overridden to call a custom web service method.
    adapter.addMethod('getSummaries', function () {
        adapter.executeQueryMethod(
            _self.options.summaryMethod || 'GetResourceSummaries',
            function (data) {
                if (ResourcePage.editor)
                    ResourcePage.editor.toggle(false);

                if (ResourcePage.previewer)
                    ResourcePage.previewer.toggle(false);

                adapter.updateModel(data, true);
            });
    });

    adapter.addMethod('select', function (item) {
        var parms = _self.options.selectParms ?
            _self.options.selectParms instanceof Function ?
                _self.options.selectParms(item) :
                _self.options.selectParms :
                null;

        adapter.selectedId = ko.unwrap(item.Id) || ko.unwrap(item.Url);

        adapter.executeMethod(
            _self.options.selectMethod || 'GetResourceByTypeId',
            parms || { resourceSubTypeName: ko.unwrap(item.ResourceSubTypeName), id: adapter.selectedId },
            function (data) {
                updateViewModel(ResourcePage.editor, data);
                updateViewModel(ResourcePage.previewer, data);
            });
        });

    _self.indexOf = function (item) {
        var index = adapter.model.Items.firstIndexOf(
            function (elem) {
                return elem.Id() === item.Id();
            });
        return index;
    };

    var addActionMethod = function (action) {
        adapter.addMethod(action, function (item) {
            adapter.executeMethod(action, { id: item.Id() || item.Url() },
                function (data) {
                    item.Status(data);
                    adapter.model.Items()[_self.indexOf(item)].Status(data);

                    if (action == 'archive') {
                        if (confirm('This item has been Archived, and can be DELETED now if you wish.\nClick OK to PERMANENTLY DELETE this item, or Cancel to leave the item in the Archived state, where it will not appear in the Public sites, but can be reactivated at a future date if needed.')) {
                            adapter.executeMethod('delete', { id: item.Id() || item.Url() },
                                function (data) {
                                    if (data == 16) {
                                        alert('This item has been DELETED.');

                                        var index = _self.indexOf(item);

                                        if (index >= 0) {
                                            adapter.model.Items.splice(index, 1);
                                        }
                                    }
                                    else {
                                        alert('We ran into an error deleting this item.');
                                    }

                                });
                        }
                    }
                });
            });
        },
        updateViewModel = function (view, modelData) {
            if (view) {
                view.updateModel(modelData, true);
            }
        };

    addActionMethod('approve');
    addActionMethod('reject');
    addActionMethod('archive');
    addActionMethod('delete');

    _self.updateItem = function (item) {
        adapter.updateItem(item);

        updateViewModel(ResourcePage.editor, item);
        updateViewModel(ResourcePage.previewer, item);
    };

    _self.deleteItem = function (item) {
        var items = ResourceEditor.selector.getModel().Items,
            itemIndex = items.firstIndexOf(
            function (elem) {
                return elem.Id() === item.Id();
            });

        if (itemIndex >= 0) {
            items.splice(itemIndex, 1);
        }

        var blankItem = ResourcePage.editor.newResource;
        updateViewModel(ResourcePage.editor, blankItem);
        updateViewModel(ResourcePage.previewer, blankItem);
    };
}


// Hooks to a textbox to implement an incremental search.
ko.bindingHandlers.incrementalSearch = {
    init: function (element, valueAccessor, allBindingsAccessor, viewModel) {
        ko.bindingHandlers.textInput.init(element, valueAccessor, allBindingsAccessor, viewModel);
    },
    update: function (element, valueAccessor, allBindings, viewModel) {
        // console.log('incrementalSearch::update');

        var matchedItems = 0,
            startTime = new Date(),
            valueUnwrapped = ko.unwrap(valueAccessor()),
            searchPropertyName = allBindings.get('searchPropertyName'),
            displayPropertyName = allBindings.get('displayPropertyName'),
            setDisplayProperty = function (model, displaPropertyName, value) {
                if (!model[displayPropertyName])
                    model[displayPropertyName] = ko.observable(value);
                else
                    model[displayPropertyName](value);
            },
            observableArray = allBindings.get('searchArray') || ko.observableArray([]),
            underlyingArray = observableArray.peek();

        observableArray.valueWillMutate();

        if (!valueUnwrapped) {
            $.each(underlyingArray, function (index, value) {
                setDisplayProperty(value, displayPropertyName, value[searchPropertyName]());
                value._destroy = false;
                matchedItems += 1;
            });
        }
        else {
            valueUnwrapped = valueUnwrapped.toLowerCase();

            $.each(underlyingArray, function (index, value) {
                var searchProperty = value[searchPropertyName](),
                    match = searchProperty.toLowerCase().indexOf(valueUnwrapped) != -1;

                value._destroy = !match;
                if (match) {
                    setDisplayProperty(value, displayPropertyName, searchProperty.replace(new RegExp('(' + valueUnwrapped + '+)', 'ig'), '<span class="searchresults">$1</span>'));
                }
                else {
                    setDisplayProperty(value, displayPropertyName, searchProperty);
                }
                matchedItems += !match ? 0 : 1;
            });
        }

        observableArray.valueHasMutated();
        var endTime = new Date();
        // console.log('search for "' + valueUnwrapped + '" took ' + (endTime - startTime) + ' - ' + matchedItems + ' matched items');
    }
};


