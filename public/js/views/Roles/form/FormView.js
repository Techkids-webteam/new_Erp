define([
    'text!templates/Roles/form/FormTemplate.html',
    'views/Roles/EditView'
],
    function (FormTemplate, EditView) {
        var FormView = Backbone.View.extend({
            el: '#content-holder',
            initialize: function (options) {
                this.formModel = options.model;
            },

            render: function () {
                var formModel = this.formModel.toJSON();
                this.$el.html(_.template(FormTemplate, formModel));
                return this;
            },

            editItem: function () {
                new EditView({ model: this.formModel });
            },
            deleteItems: function () {
                var mid = 56;
                this.formModel.destroy({
                    headers: {
                        mid: mid
                    },
                    success: function () {
                        Backbone.history.navigate("#easyErp/Roles/list", { trigger: true });
                    }
                });
            }
        });
        return FormView;
    });
