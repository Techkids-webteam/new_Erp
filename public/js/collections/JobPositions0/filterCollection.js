﻿define([
    'models/JobPositions0Model',
    'common'
],
function (JobPositions0Model, common) {
        var JobPositions0Collection = Backbone.Collection.extend({
            model: JobPositions0Model,
            url: "/JobPositions0/",
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
                    _.map(response.data, function (jopPosition) {
						if (jopPosition.createdBy)
							jopPosition.createdBy.date = common.utcDateToLocaleDateTime(jopPosition.createdBy.date);
						if (jopPosition.editedBy)
							jopPosition.editedBy.date = common.utcDateToLocaleDateTime(jopPosition.editedBy.date);
                        return jopPosition;
                    });
                }
                return response.data;
            }
        });
        return JobPositions0Collection;
});
