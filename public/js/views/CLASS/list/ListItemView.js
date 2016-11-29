define([
    'text!templates/CLASS/list/ListTemplate.html'
],
function (ListTemplate) {
    var CLASSListItemView = Backbone.View.extend({
        el: '#listTable',
        initialize: function(options) {
            this.collection = options.collection;
            this.startNumber = (options.page - 1 ) * options.itemsNumber;
        },
        render: function() {
            this.$el.append(_.template(ListTemplate, { CLASSCollection: this.collection.toJSON(), startNumber: this.startNumber }));
        }
    });
    return CLASSListItemView;
});
