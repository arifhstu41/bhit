$.extend({
    alert: function (message, title) {
        $('<div></div>').dialog({
            buttons: { 'Ok': function () { $(this).dialog('close'); } },
            close: function (event, ui) { $(this).remove(); },
            resizable: false,
            title: title,
            modal: true
        }).html(message);
    }
});

// Create a jquery style modal confirm dialog
// Usage:
//    $.confirm(
//        'message',
//        'title',
//        function() { /* Ok action here*/
//        });
$.extend({
    confirm: function (message, title, okAction) {
        $('<div></div>').dialog({
            // Remove the closing 'X' from the dialog
            open: function (event, ui) { $('.ui-dialog-titlebar-close').hide(); },
            buttons: {
                'Ok': function () {
                    $(this).dialog('close');
                    okAction();
                },
                'Cancel': function () {
                    $(this).dialog('close');
                }
            },
            close: function (event, ui) { $(this).remove(); },
            resizable: false,
            title: title,
            modal: true
        }).html(message);
    }
});

// This method is used in the Resource Selection widget 
// to get the value of the currently selected sibling radio button.
function getSelectedSiblingValue(element) {
    var value = $(element).parent().find('input[type="radio"]:checked').val();
    return value;
}

function redirectToResourceList(element) {
    var folder = getSelectedSiblingValue(element);
    window.location = '/' + folder;
}

function redirectToSortedResourceList(element) {
    var folder = getSelectedSiblingValue(element),
        search = getSortSearch($('*[role=sorter]'));

    window.location = '/' + folder + search;
}

function getSortSearch(element) {
    var search = location.search,
        $element = element instanceof jQuery ? element : $(element),
        sort = $element.val().toLowerCase();

    if ((search || '') == '') {
        search = '?sort=' + sort;
    }
    else if (!search.match(/[\?\&]sort\=/)) {
        search += '&sort=' + sort;
    }
    else {
        search = search.replace(/(^.*[\?\&]sort\=)([^\&]*)(.*$)/, '$1' + sort + '$3');
    }
    return search;
}

function redirectToSortedPage(element) {
    location.search = getSortSearch(element);
}
