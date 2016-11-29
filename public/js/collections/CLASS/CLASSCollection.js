define([
    'models/CLASSModel'
],
function (CLASSModel) {
        var CLASSCollection = Backbone.Collection.extend({
            model: CLASSModel,
            url: function () {
                return "/CLASS";
            },
            initialize: function () {
                console.log("CLASS Collection Init");
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
        return CLASSCollection;
});
