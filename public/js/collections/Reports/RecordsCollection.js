define([
    'models/ReportModel'
],
function (ReportModel) {
        var ReportsCollection = Backbone.Collection.extend({
            model: ReportModel,
            url: function () {
                return "/Reports";
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
        return ReportsCollection;
});
