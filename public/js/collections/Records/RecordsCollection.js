define([
    'models/RecordModel'
],
function (RecordModel) {
        var RecordsCollection = Backbone.Collection.extend({
            model: RecordModel,
            url: function () {
                return "/Records";
            },
            initialize: function () {
                var mid = 39;
                this.fetch({
                    data: $.param({
                        mid: mid
                    }),
                    type: 'GET',
                    reset: true,
                    success: this.fetchSuccess,
                    error: this.fetchError
                });
            },
            parse: true,
            parse: function (response) {
                return response.data;
            },
        });
        return RecordsCollection;
});
