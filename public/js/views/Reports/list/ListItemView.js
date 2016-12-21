﻿define([
    'text!templates/Reports/list/ListTemplate.html'
],
function (ListTemplate) {
    var ReportsListItemView = Backbone.View.extend({
        el: '#listTable',
        initialize: function(options) {
            this.collection = options.collection;
            this.startNumber = (options.page - 1 ) * options.itemsNumber;
        },
        render: function() {
            this.$el.append(_.template(ListTemplate, { ReportsCollection: this.collection.toJSON(), startNumber: this.startNumber }));
        }
    });
    return ReportsListItemView;
});
