define([
    'models/TeacherAssignmentModel',
    'common'
],
function (TeacherAssignmentModel, common) {
        var TeacherAssignmentsCollection = Backbone.Collection.extend({
            model: TeacherAssignmentModel,
            url: "/TeacherAssignments/",
            page:null,
            namberToShow: null,
            viewType: null,
            contentType: null,
            initialize: function (options) {
				this.startTime = new Date();
                this.namberToShow = options.count;
                this.page = options.page || 1;
                var that = this;
                if (options && options.viewType) {
                    this.url += options.viewType;
                }
                if (options && options.count) {
                    this.namberToShow = options.count;
                    this.page = options.page || 1;
                }
                this.fetch({
                    data: options,
                    reset: true,
                    success: function() {
                        that.page ++;
                    },
                    error: function (models, xhr) {
                        if (xhr.status == 401) Backbone.history.navigate('#login', { trigger: true });
                    }
                });
            },
            showMore: function (options) {
                var that = this;
                var filterObject = options || {};
                filterObject['page'] = (options && options.page) ? options.page : this.page;
                filterObject['count'] = (options && options.count) ? options.count : this.namberToShow;
                this.fetch({
                    data: filterObject,
                    waite: true,
                    success: function (models) {
                        that.page ++;
                        that.trigger('showmore', models);
                    },
                    error: function() {
                        alert('Some Error');
                    }
                });
            },
            parse: true,
            parse: function (response) {
                if (response.data) {
                    _.map(response.data, function (instructor) {
						if (instructor.createdBy)
							instructor.createdBy.date = common.utcDateToLocaleDateTime(instructor.createdBy.date);
						if (instructor.editedBy)
							instructor.editedBy.date = common.utcDateToLocaleDateTime(instructor.editedBy.date);
                        return instructor;
                    });
                }
                return response.data;
            }
        });
        return TeacherAssignmentsCollection;
});
