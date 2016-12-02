define([
    'models/RoleModel'
],
function (RoleModel) {
        var RolesCollection = Backbone.Collection.extend({
            model: RoleModel,
            url: function () {
                return "/Roles";
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
        return RolesCollection;
});
