define(['Validation'], function (Validation) {
    var RecordModel = Backbone.Model.extend({
        idAttribute: "_id",
        initialize: function(){
            this.on('invalid', function(model, errors){
                if(errors.length > 0){
                    var msg = errors.join('\n');
                    alert(msg);
                }
            });
        },
        validate: function(attrs){
            var errors = [];
            // Validation.checkGroupsNameField(errors, true, attrs.name, "Job name");
            // Validation.checkNumberField(errors, true, attrs.expectedRecruitment, "Expected in Recruitment");
            if(errors.length > 0)
                return errors;
        },
        defaults: {
          assignment: {
            instructor: {
              _id: "",
              name: ""
            },
            class: {
              _id: "",
              title: "",
              code: ""
            },
            role: {
              _id: "",
              code: "",
              title: ""
            },
            _id: ""
          },
          record_time: null,
          editedBy: {
            user: "",
            date: null
          },
          createdBy: {
            user: "",
            date: null
          }
        },
        urlRoot: function () {
            return "/Records";
        }
    });
    return RecordModel;
});
