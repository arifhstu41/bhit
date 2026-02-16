function galleriaWidget(
    elementId,
    theme,
    uploadFolder,
    photoAlbum
    ) {
    Galleria.loadTheme(theme);

    var _self = this,
        fixupItems = function (items) {
            return $.map(items, function (item, index) {
                var fixedItem = $.extend({}, item);
                fixedItem.image = getGalleriaImage(item);
                fixedItem.thumb = getGalleriaThumb(item);
                fixedItem.iframe = getGalleriaIframe(item);

                //console.log('<fixupItems[' + index + ']>');
                //console.log(item);
                //console.log(fixedItem);
                //console.log('</fixupItems[' +index + ']>');
                return fixedItem;
            });
        };

    _self.getModel = function () {
        return photoAlbum;
    };

    _self.refresh = function (data) {
        var fixedUpData = fixupItems(data);

        $('#' + elementId).
            data('galleria').
            load(fixedUpData);
    };

    $(function () {
        Galleria.on('image', function (e) {
            Galleria.log(this); // the gallery scope
            Galleria.log(e.imageTarget); // the currently active IMG element
        });

        var fixedUpAlbum = $.extend({}, photoAlbum, { dataSource: fixupItems(photoAlbum.dataSource) });
        Galleria.run('#' + elementId, fixedUpAlbum);
    });
}

function getGalleriaImage(mediaItem) {
    switch (mediaItem.mediaType) {
        case 'video':
        case 'audio':
            return '';

        default:
            return mediaItem.image;
            break;
    }
}

function getGalleriaThumb(mediaItem) {
    switch (mediaItem.mediaType) {
        case 'video':
            return '/images/kaboodle.png';

        case 'audio':
            return '/images/juk.png';

        default:
            return '';
    }
}

function getGalleriaIframe(mediaItem) {
    switch (mediaItem.mediaType) {
        case 'video':
            return mediaItem.iframe || ('/videoplayer.aspx?file=' + encodeURIComponent(mediaItem.image) +
                '&width=' + encodeURIComponent('100%') +
                '&height=' + encodeURIComponent('100%'));

        case 'audio':
            return mediaItem.iframe || ('/audioplayer.aspx?file=' + encodeURIComponent(mediaItem.image));

        default :
            return mediaItem.image;
    }
}

function galleriaWidgetManager(
    siteIdentifier,
    elementId,
    mediaPickerId,
    getGalleryFunc,
    options
    ) {
    var _self = this,
        $element = $('#' + elementId);

    _self.options = $.extend({
        imagePickerWidth: 600,
        imagePickerHeight: 500
    }, options);

    _self.mediaPicker = new MediaUploadDialog(mediaPickerId, {
        width: _self.options.imagePickerWidth,
        height: _self.options.imagePickerHeight
    });

    $(function () {
        var gallery = getGalleryFunc(),
            getResourceSubTypeName = function (mediaType) {
                return 'gallery' + mediaType;
            },
            addFile = function (mediaType) {
                _self.mediaPicker.openDialog(
                    function (mediaItem) {
                        var $$galleriaItem = ko.mapping.fromJS(mediaItem, {
                            image: {
                                create: function (options) {
                                    return getGalleriaImage(mediaItem);
                                }
                            },
                            thumb: {
                                create: function (options) {
                                    return getGalleriaThumb(mediaItem);
                                }
                            },
                            iframe: {
                                create: function (options) {
                                    return getGalleriaIframe(mediaItem);
                                }
                            }
                        });

                        $$galleryModel.dataSource.unshift(ko.mapping.fromJS($$galleriaItem));
                        $('.photoalbumthumbnailcontainer', $element).
                            animate({ scrollLeft: 99999 }, 800);
                        $$galleryModel.refresh();
                    }, getResourceSubTypeName, siteIdentifier, mediaType);
            },
            galleryModel = gallery.getModel(),
            $$galleryModel = ko.mapping.fromJS($.extend({}, {
                addImage: function () {
                    addFile('image');
                },
                addAudio: function () {
                    addFile('audio');
                },
                addVideo: function () {
                    addFile('video');
                },
                edit: function ($$model, index, $$mediaFile) {
                    _self.mediaPicker.openDialog(
                        function (mediaItem) {
                            var $$items = $$model.dataSource,
                                $$item = ko.utils.arrayFirst($$items(), function (item) {
                                    return item.id() == mediaItem.id;
                                });
                            $$items.replace($$item, ko.mapping.fromJS(mediaItem));
                            $$model.refresh();
                        }, getResourceSubTypeName, siteIdentifier, ko.unwrap($$mediaFile.mediaType), $$mediaFile);
                },
                delete: function ($$model, index, image) {
                    if (confirm('Are you SURE that you want to delete this item?')) {
                        $$model.dataSource.destroy(function (item) {
                            var deleteMe = item.id() == image.id();
                            if (deleteMe)
                                item.action('delete');

                            return deleteMe;
                        });
                        $$model.refresh();
                    }
                },
                refresh: function () {
                    var mediaItems = ko.toJS(this.dataSource()),
                        activeItems = $.map(mediaItems, function (i) { return i._destroy ? null : i; });
                    gallery.refresh(activeItems);
                },
                save: function (item) {
                    if (confirm('Save Media Gallery Changes?')) {
                        $.webService.post('/admin/resourceapi.asmx/SaveGallery',
                            {
                                siteIdentifier: siteIdentifier,
                                galleryId: galleryModel.galleryId,
                                photoAlbum: ko.mapping.toJS(this.dataSource())
                            },
                            function (data) {
                                if (data) {
                                    galleryModel.galleryId = data;
                                    $$galleryModel.galleryId(data);
                                    alert('Media Gallery saved.');
                                }
                                else
                                    alert('We had an error saving the Media Gallery.');
                            },
                            function (xhr) {
                                alert(xhr.responseText);
                            });
                    }
                },
                cancel: function (item) {
                    if (confirm('Cancel Media Gallery Changes?')) {
                        $.webService.post('/admin/resourceapi.asmx/GetGallery',
                            {
                                siteIdentifier: siteIdentifier
                            },
                            function (data) {
                                if (data) {
                                    ko.mapping.fromJS(data, {}, this);
                                }
                                else
                                    alert('We had an error retrieving the Media Gallery.');
                            },
                            function (xhr) {
                                alert(xhr.responseText);
                            });
                    }
                }
            }, galleryModel));

        ko.applyBindings($$galleryModel, $element[0]);
    });
}