define([
    'models/TeacherAssignmentModel'
],
function (TeacherAssignmentModel) {
        var TeacherAssignmentsCollection = Backbone.Collection.extend({
            model: TeacherAssignmentModel,
            url: function () {
                return "/TeacherAssignments";
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
        return TeacherAssignmentsCollection;
});
