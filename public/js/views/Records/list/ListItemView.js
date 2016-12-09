define([
    'text!templates/Records/list/ListTemplate.html'
],
function (ListTemplate) {
    var RecordsListItemView = Backbone.View.extend({
        el: '#listTable',
        initialize: function(options) {
            this.collection = options.collection;
            this.startNumber = (options.page - 1 ) * options.itemsNumber;
        },
        render: function() {
            this.$el.append(_.template(ListTemplate, { RecordsCollection: this.collection.toJSON(), startNumber: this.startNumber }));
        }
    });
    return RecordsListItemView;
});
