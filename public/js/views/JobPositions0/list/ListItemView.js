define([
    'text!templates/JobPositions0/list/ListTemplate.html'
],
function (ListTemplate) {
    var JobPositions0ListItemView = Backbone.View.extend({
        el: '#listTable',
        initialize: function(options) {
            this.collection = options.collection;
            this.startNumber = (options.page - 1 ) * options.itemsNumber;
        },
        render: function() {
            this.$el.append(_.template(ListTemplate, { jobPositions0Collection: this.collection.toJSON(), startNumber: this.startNumber }));
        }
    });
    return JobPositions0ListItemView;
});
