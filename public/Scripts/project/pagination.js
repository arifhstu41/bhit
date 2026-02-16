function getResourceSummaries(query, cursor, webServiceMethodName, model, dataMergeCallback) {
    var parms = {
        query: query,
        cursor: cursor
    };

    $.webService.post(
        '/api/services.asmx/' + webServiceMethodName,
        $.toJSON(parms),
        function (data) {
            if (data.Status === 0) {
                dataMergeCallback(model.Items, data.Result.Items);
            }
            else {
                alert(data.Message);
            }
        },
        function (xhr) {
            alert(xhr.responseText);
        });
}
