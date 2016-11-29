define([
    'models/JobPositions0Model'
],
function (JobPositions0Model) {
        var JobPositions0Collection = Backbone.Collection.extend({
            model: JobPositions0Model,
            url: function () {
                return "/JobPosition";
            },
            initialize: function () {
                console.log("JobPosition Collection Init");
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
        return JobPositions0Collection;
});