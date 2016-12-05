﻿define([
    'text!templates/TeacherAssignments/list/ListTemplate.html'
],
function (ListTemplate) {
    var TeacherAssignmentsListItemView = Backbone.View.extend({
        el: '#listTable',
        initialize: function(options) {
            this.collection = options.collection;
            this.startNumber = (options.page - 1 ) * options.itemsNumber;
        },
        render: function() {
            this.$el.append(_.template(ListTemplate, { TeacherAssignmentsCollection: this.collection.toJSON(), startNumber: this.startNumber }));
        }
    });
    return TeacherAssignmentsListItemView;
});