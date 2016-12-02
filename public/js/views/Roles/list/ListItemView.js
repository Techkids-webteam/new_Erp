define([
    'text!templates/Roles/list/ListTemplate.html'
],
function (ListTemplate) {
    var RolesListItemView = Backbone.View.extend({
        el: '#listTable',
        initialize: function(options) {
            this.collection = options.collection;
            this.startNumber = (options.page - 1 ) * options.itemsNumber;
        },
        render: function() {
            this.$el.append(_.template(ListTemplate, { RolesCollection: this.collection.toJSON(), startNumber: this.startNumber }));
        }
    });
    return RolesListItemView;
});
