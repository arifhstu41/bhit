// The code below is an enhanced version of the newsSlider 1.7 plugin.

(function ($) {
    $.fn.newsSlider = function (options) {
        var defaults = {
            prevId: 'prevBtn',
            prevText: 'Previous',
            nextId: 'nextBtn',
            nextText: 'Next',
            controlsShow: true,
            controlsBefore: '',
            controlsAfter: '',
            controlsFade: true,
            firstId: 'firstBtn',
            firstText: 'First',
            firstShow: false,
            lastId: 'lastBtn',
            lastText: 'Last',
            lastShow: false,
            vertical: false,
            speed: 800,
            auto: false,
            pause: 2000,
            continuous: false,
            numeric: false,
            numericId: 'controls'
        };

        var options = $.extend(defaults, options);

        this.each(function () {
            var clickable = true,
                container = $(this),
                isInitialized = !!container.data('isInitialized');

            $('[slideShowShim]', container).remove();

            var $li = $('li', container),
                slideCount = $li.length,
                slideWidth = $li.width(),
                slideHeight = $li.height(),
                maxIndex = slideCount - 1,
                currentIndex = 0,
                slideShowButton = function (buttonId) {
                    return $('a', '#' + buttonId);
                },
                $nextId = slideShowButton(options.nextId),
                $prevId = slideShowButton(options.prevId),
                $firstId = slideShowButton(options.firstId),
                $lastId = slideShowButton(options.lastId),
                horizontal = !options.vertical,
                slideNumbersId = options.numericId;

            container.width(slideWidth);
            container.height(slideHeight);
            container.css('overflow', 'hidden');

            if (isInitialized) {
                cancelTimer();
            }
            else {
                var frameWidth = options.ImageWidth,
                    frameHeight = options.ImageHeight,
                    containerAspect = frameWidth / frameHeight,
                    containerWide = containerAspect > 1;

                safeconsole('frame dimensions: ' + frameWidth + 'x' + frameHeight);

                // Resize the slide show images.
                $('img', container).each(function (index, element) {
                    safeconsole('resizing image ' + this.src);
                    var oldWidth = this.width, 
                        oldHeight = this.height;

                    safeconsole('original size: ' + oldWidth + 'x' + oldHeight);
                    if (oldWidth > 0 && oldHeight > 0) {
                        // Calculate resize ratios for resizing 
                        var ratioWidth = frameWidth / oldWidth,
                            ratioHeight = frameHeight / oldHeight,
                            // smaller ratio will ensure that the image fits in the view
                            useRatio = Math.min(ratioWidth, ratioHeight),
                            newWidth = oldWidth * useRatio,
                            newHeight = oldHeight * useRatio;

                        safeconsole('ratios: ' + ratioWidth + 'x' + ratioWidth);
                        safeconsole('using: ' + useRatio);
                        safeconsole('new size: ' + newWidth + 'x' + newHeight);

                        //this.width = newWidth;
                        this.height = newHeight;
                    }
                });
            }

            if (options.continuous) {
                $('ul', container).
                    prepend(
                        $('ul li:last-child', container).
                        clone().
                        attr('slideShowShim', '1').
                        css('margin-left', '-' + slideWidth + 'px')).
                    append(
                        $('ul li:nth-child(2)', container).
                        clone().
                        attr('slideShowShim', '1')).
                    css('width', (slideCount + 1) * slideWidth);
            }
            else {
                $('ul', container).css('width', slideCount * slideWidth);
            }

            if (horizontal)
                $('li', container).css('float', 'left');

            if (!isInitialized && options.controlsShow) {
                var html = options.controlsBefore;

                if (options.numeric) {
                    html += '<ol id="' + slideNumbersId + '"></ol>';
                }
                else {
                    var span = function (id, text) {
                        return '<span id="' + id + '"><a href=\"javascript:void(0);\">' + text + '</a></span>';
                    };

                    if (options.firstShow)
                        html += span(options.firstId, options.firstText);

                    html += span(options.prevId, options.prevText);
                    html += span(options.nextId, options.nextText);

                    if (options.lastShow)
                        html += span(options.lastId, options.lastText);
                };

                html += options.controlsAfter;
                $(container).after(html);
            };

            if (options.numeric) {
                if (isInitialized) {
                    $('#' + slideNumbersId).empty();
                }

                for (var i = 0; i < slideCount; i++) {
                    $(document.createElement('li')).
                        attr('id', slideNumbersId + (i + 1)).
                        html('<a rel=' + i + ' href=\"javascript:void(0);\">' + (i + 1) + '</a>').
                        appendTo($('#' + slideNumbersId)).
                        click(function () {
                            animate($('a', $(this)).attr('rel'), true);
                        });
                }
            }
            else {
                if (!isInitialized) {
                    $nextId.click(function () {
                        animate('next', true);
                    });

                    $prevId.click(function () {
                        animate('prev', true);
                    });

                    $firstId.click(function () {
                        animate('first', true);
                    });

                    $lastId.click(function () {
                        animate('last', true);
                    });
                }
            };

            function cancelTimer() {
                clearTimeout(container.data('timeout'));
                container.data('timeout', null);
            };

            function setCurrent(index) {
                if (currentIndex != index)
                    currentIndex = index;

                $('li', '#' + slideNumbersId).removeClass('current');
                $('li#' + slideNumbersId + ++index).addClass('current');
            };

            function adjust() {
                if (currentIndex > maxIndex)
                    currentIndex = 0;
                else if (currentIndex < 0)
                    currentIndex = maxIndex;

                $('ul', container).css('margin-left', (currentIndex * (horizontal ? slideWidth : slideHeight) * -1));

                clickable = true;

                if (options.numeric)
                    setCurrent(currentIndex);
            };

            function animate(dir, clicked) {
                if (clickable) {
                    clickable = false;
                    var _currentIndex = currentIndex;

                    switch (dir) {
                        case 'next':
                            currentIndex = (_currentIndex >= maxIndex) ? (options.continuous ? currentIndex + 1 : maxIndex) : currentIndex + 1;
                            break;

                        case 'prev':
                            currentIndex = (currentIndex <= 0) ? (options.continuous ? currentIndex - 1 : 0) : currentIndex - 1;
                            break;

                        case 'first':
                            currentIndex = 0;
                            break;

                        case 'last':
                            currentIndex = maxIndex;
                            break;

                        default:
                            currentIndex = dir;
                            break;
                    };

                    var diff = Math.abs(_currentIndex - currentIndex),
                        speed = diff * options.speed,
                        corner = currentIndex * (horizontal ? slideWidth : slideHeight) * -1;
                    
                    safeconsole('animate: originalIndex: ' + _currentIndex +
                        ' currentIndex: ' + currentIndex +
                        ' diff: ' + diff +
                        ' speed: ' + speed +
                        ' corner: ' + corner
                        );

                    $('ul', container).animate(
                        horizontal ? { marginLeft: corner } : { marginTop: corner },
                        { queue: false, duration: speed, complete: adjust });

                    if (!options.continuous && options.controlsFade) {
                        var atEnd = currentIndex == maxIndex;
                        $nextId.toggle(!atEnd);
                        $lastId.toggle(!atEnd);

                        var atStart = currentIndex == 0;
                        $prevId.toggle(!atStart);
                        $firstId.toggle(!atStart);
                    };

                    if (clicked) {
                        cancelTimer();
                    }

                    if (options.auto && dir == 'next' && !clicked) {
                        ;
                        container.data('timeout', setTimeout(function () {
                            animate('next', false);
                        }, diff * options.speed + options.pause));
                    };
                };
            };

            if (options.auto) {
                ;
                container.data('timeout', setTimeout(function () {
                    animate('next', false);
                }, options.pause));
            };

            if (options.numeric)
                setCurrent(0);

            if (!options.continuous && options.controlsFade) {
                $prevId.hide();
                $firstId.hide();
            };

            container.data('isInitialized', true);
        });
    };
})(jQuery);


function HeroSlideShow(elementId, images, options) {
    var $element = $('#' + elementId),
        _self = this,
        _options = _self.options = $.extend({}, options),
        _showData = $.extend({
            width: _options.width || 1024,
            height: _options.height || 800
        }, images),
        _itemModel = function (data) {
            ko.mapping.fromJS({ FileName: data }, {}, this);
        },
        _mapping = {
            Slides: {
                create: function (options) {
                    return new _itemModel(options.data);
                }
            }
        },
        _model = _self.model = ko.mapping.fromJS(_showData, _mapping);

    _model.reload = function () {
        $element.cycle({
            fx: _options.effect || 'fade' // choose your transition type, ex: fade, scrollUp, shuffle, etc...
        });
    };

    _self.load = function (images) {
        ko.mapping.fromJS({ Slides: images }, _mapping, _self.model);
        _self.model.reload();
    };

    $(function () {
        // Execute the Knockout binding.
        ko.applyBindings(_model, $element[0]);

        _model.reload();
    });
}

function HeroSlideShowManager(viewId, siteIdentifier, slideShow, options) {
    var maxSlides = 5,
        $element = $('#' + viewId);

    // Always save a pointer to 'this' for future reference.
    var _self = this;

    _self.options = $.extend({}, options);

    _self.model = { siteIdentifier: siteIdentifier };

    _self.newSlide = function (fileName) {
        return ko.mapping.fromJS({
            FileName: fileName
        });
    };

    _self.blankSlide = function () {
        return ko.mapping.fromJS({
            FileName: '',
            _destroy: true
        });
    };

    _self.model.removeSlideShowImageAt = function (index) {
        if (confirm('Are you SURE you want to remove this image?')) {
            //_self.model.Slides.destroyAt(index);
            _self.model.Slides.setAt(index, _self.blankSlide());
            _self.model.reload();
        }
    };

    _self.model.updateSlideShowImage = function (file, index) {
        _self.model.Slides.setAt(index, _self.newSlide(file.FileName));
        _self.model.reload();
    };

    _self.model.save = function (item) {
        if (confirm('Save Slide Show Changes?')) {
            var fileNames = [];

            ko.utils.arrayForEach(_self.model.Slides(),
                function (arrayElement) {
                    if (!arrayElement._destroy)
                        fileNames.push(arrayElement.FileName());
                });

            $.webService.post('/admin/resourceapi.asmx/SaveSiteSlideShow',
                {
                    siteIdentifier: siteIdentifier,
                    fileNames: fileNames
                },
                function (data) {
                    if (data)
                        alert('Slide Show saved.');
                    else
                        alert('We had an error saving the Slide Show.');
                },
                function (xhr) {
                    alert(xhr.responseText);
                });
        }
    };

    _self.model.cancel = function (item) {
        if (confirm('Cancel Slide Show Changes?')) {
            $.webService.post('/admin/resourceapi.asmx/GetSiteSlideShow',
                {
                    siteIdentifier: siteIdentifier
                },
                function (data) {
                    if (data) {
                        var _slideShow = getSlideShow();
                        _slideShow.load(data);

                        //ko.mapping.fromJS(data, {}, _slideShow.model);
                        //_self.model.Slides.fillArray(maxSlides, _self.blankSlide());
                        //_self.model.reload();
                    }
                    else
                        alert('We had an error retrieving the Slide Show.');
                },
                function (xhr) {
                    alert(xhr.responseText);
                });
        }
    };

    var getSlideShow = function () {
        return typeof slideShow === 'function' ? slideShow() : slideShow;
    };

    // Defer the UI binding until DOMReady.
    $(function () {
        var _slideShow = getSlideShow();
        $.extend(_self.model, _slideShow.model);

        // Fill the slide show if necessary.
        _self.model.Slides.fillArray(maxSlides, _self.blankSlide());

        // Initialize any custom properties.
        _self.options.beforeInitialBinding && _self.options.beforeInitialBinding(_self.model);

        // Bind the KO model to the view (the DOM element with id=viewId).
        ko.applyBindings(_self.model, $element[0]);

        // Execute methods after the initial binding.
        _self.options.afterInitialBinding && _self.options.afterInitialBinding(_self.model);
    });
}

function NewsSlideShow(viewId, options) {
    var $element = $('#' + viewId);

    $element.
        parent().
        width(options.SlideShowWidth).
        height(options.SlideShowHeight);

    // Always save a pointer to 'this' for future reference.
    var _self = this;

    _self.options = $.extend({}, {
        auto: true,
        continuous: true,
        speed: 1000,
        pause: 5000,
        numeric: true
    }, options);

    _self.reset = function() {
        $element.newsSlider(_self.options);
    };

    // Initialize the model with a Knockout observable of the initial data.
    _self.model = ko.mapping.fromJS(_self.options);

    // Defer the UI binding until DOMReady.
    $(function () {
        if (_self.options.hideOnStartup)
            $element.hide();

        // Initialize any custom properties.
        _self.options.beforeInitialBinding && _self.options.beforeInitialBinding(_self.model);

        // Bind the KO model to the view (the DOM element with id=viewId).
        ko.applyBindings(_self.model, $element[0]);

        // Execute methods after the initial binding.
        _self.options.afterInitialBinding && _self.options.afterInitialBinding(_self.model);

        $element.newsSlider(_self.options);
    });
}

function NewSlideShowManager(viewId, dialogId, siteIdentifier, slideShow, options) {
    var maxSlides = 5,
        $element = $('#' + viewId);

    // Always save a pointer to 'this' for future reference.
    var _self = this;

    _self.options = $.extend({}, options);

    _self.blankSlide = function () {
        return ko.mapping.fromJS({
            Title: '',
            ByLine: '',
            PublishDate: '',
            ArticleUrl: '',
            ThumbnailUrl: '',
            _destroy: true
        });
    };

    _self.findDialog = new NewsFindDialog(dialogId);

    _self.model = {};

    _self.model.blankSlideAt = function (index) {
        var _index = ko.unwrap(index);

        _self.model.Slides.setAt(_index, _self.blankSlide());
        getSlideShow().reset();
    };

    _self.model.setSlideAt = function (index) {
        var _index = ko.unwrap(index),
            findDialog = _self.findDialog;

        findDialog.openDialog(function (selectedStory) {
            _self.model.Slides.setAt(_index, selectedStory);
            getSlideShow().reset();
        });
    };

    _self.model.save = function (item) {
        if (confirm('Save Slide Show Changes?')) {
            var articleIds = [];

            ko.utils.arrayForEach(_self.model.Slides(),
                function (arrayElement) {
                    if (!arrayElement._destroy)
                        articleIds.push(arrayElement.Id());
            });

            $.webService.post('/admin/resourceapi.asmx/SaveNewsSlideShow',
                {
                    siteIdentifier: siteIdentifier,
                    articleIds: articleIds.join()
                },
                function (data) {
                    if (data)
                        alert('Slide Show saved.');
                    else
                        alert('We had an error saving the Slide Show.');
                },
                function (xhr) {
                    alert(xhr.responseText);
                });
        }
    };

    _self.model.cancel = function (item) {
        if (confirm('Cancel Slide Show Changes?')) {
            $.webService.post('/admin/resourceapi.asmx/GetNewsSlideShow',
                {
                    siteIdentifier: siteIdentifier
                },
                function (data) {
                    if (data) {
                        var _slideShow = getSlideShow();
                        ko.mapping.fromJS(data, {}, _slideShow.model);
                        _self.model.Slides.fillArray(maxSlides, _self.blankSlide());
                        _slideShow.reset();
                    }
                    else
                        alert('We had an error retrieving the Slide Show.');
                },
                function (xhr) {
                    alert(xhr.responseText);
                });
        }
    };

    var getSlideShow = function () {
        return typeof slideShow === 'function' ? slideShow() : slideShow;
    };

    // Defer the UI binding until DOMReady.
    $(function () {
        var _slideShow = getSlideShow();
        _self.model.Slides = _slideShow.model.Slides;

        // Fill the slide show if necessary.
        _self.model.Slides.fillArray(maxSlides, _self.blankSlide());

        // Initialize any custom properties.
        _self.options.beforeInitialBinding && _self.options.beforeInitialBinding(_self.model);

        // Bind the KO model to the view (the DOM element with id=viewId).
        ko.applyBindings(_self.model, $element[0]);

        // Execute methods after the initial binding.
        _self.options.afterInitialBinding && _self.options.afterInitialBinding(_self.model);
    });
}
