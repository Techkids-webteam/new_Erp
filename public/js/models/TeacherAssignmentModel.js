define(['Validation'], function (Validation) {
    var TeacherAssignmentModel = Backbone.Model.extend({
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
            name: "Instructor",
            class: {},
            role: {},
            rate: {}
        },
        urlRoot: function () {
            return "/TeacherAssignments";
        }
    });
    return TeacherAssignmentModel;
});
