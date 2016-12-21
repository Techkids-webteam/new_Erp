define([
    "text!templates/Records/CreateTemplate.html",
    "collections/Departments/DepartmentsCollection",
    "collections/Workflows/WorkflowsCollection",
    "models/RecordModel",
    'views/Assignees/AssigneesView',
    "common",
    "populate",
    "dataService"
],
    function (CreateTemplate, DepartmentsCollection, WorkflowsCollection, RecordModel, AssigneesView, common, populate, dataService) {
        var CreateView = Backbone.View.extend({
            el: "#content-holder",
            contentType: "Records",
            template: _.template(CreateTemplate),
            initialize: function () {
                _.bindAll(this, "saveItem", "render");
                this.model = new RecordModel();
                this.responseObj = {};
                this.render();
            },
            events: {
                "change #workflowNames": "changeWorkflows",
                'keydown': 'keydownHandler',
                'click .dialog-tabs a': 'changeTab',
				"click .current-selected": "showNewSelect",
                "click .newSelectList li:not(.miniStylePagination)": "chooseOption",
                "click .newSelectList li.miniStylePagination": "notHide",
                "click .newSelectList li.miniStylePagination .next:not(.disabled)": "nextSelect",
                "click .newSelectList li.miniStylePagination .prev:not(.disabled)": "prevSelect",
                "click": "hideNewSelect"
            },
            notHide: function () {
                return false;
            },
            showNewSelect: function (e, prev, next) {
                populate.showSelect(e, prev, next, this);
                return false;
            },
            chooseOption: function (e) {
                $(e.target).parents("dd").find(".current-selected").text($(e.target).text()).attr("data-id", $(e.target).attr("id"));
                $(".newSelectList").hide();
            },
            nextSelect: function (e) {
                this.showNewSelect(e, false, true);
            },
            prevSelect: function (e) {
                this.showNewSelect(e, true, false);
            },
            hideNewSelect: function () {
                $(".newSelectList").hide();
            },
            keydownHandler: function(e){
                switch (e.which){
                    case 27:
                        this.hideDialog();
                        break;
                    default:
                        break;
                }
            },

            changeTab:function(e){
                var holder = $(e.target);
                holder.closest(".dialog-tabs").find("a.active").removeRecords("active");
                holder.addRecords("active");
                var n = holder.parents(".dialog-tabs").find("li").index(holder.parent());
                var dialog_holder = $(".dialog-tabs-items");
                dialog_holder.find(".dialog-tabs-item.active").removeRecords("active");
                dialog_holder.find(".dialog-tabs-item").eq(n).addRecords("active");
            },
            getWorkflowValue: function (value) {
                var workflows = [];
                for (var i = 0; i < value.length; i++) {
                    workflows.push({ name: value[i].name, status: value[i].status });
                }
                return workflows;
            },

            changeWorkflows: function () {
                var name = this.$("#workflowNames option:selected").val();
                var value = this.workflowsCollection.findWhere({ name: name }).toJSON().value;
            },

            saveItem: function () {
                var afterPage = '';
                var location = window.location.hash;
                var pageSplited = location.split('/p=')[1];
                if (pageSplited) {
                    afterPage = pageSplited.split('/')[1];
                    location = location.split('/p=')[0] + '/p=1' + '/' + afterPage;
                }
                var self = this;
                var mid = 39;

                var assignment = $("#assignmentDd").attr("data-id");
                var record_time = $.trim($("#recordTime").val());
                // var name = $.trim($("#name").val());
                // var expectedRecruitment = parseInt($.trim($("#expectedRecruitment").val()));
                // var description = $.trim($("#description").val());
                // var requirements = $.trim($("#requirements").val());
                // var workflow = this.$("#workflowsDd").data("id");
                // var department = this.$("#departmentDd").data("id")?this.$("#departmentDd").data("id"):null;

                var usersId=[];
                var groupsId=[];
                $(".groupsAndUser tr").each(function(){
                    if ($(this).data("type")=="targetUsers"){
                        usersId.push($(this).data("id"));
                    }
                    if ($(this).data("type")=="targetGroups"){
                        groupsId.push($(this).data("id"));
                    }
                });
                var whoCanRW = this.$el.find("[name='whoCanRW']:checked").val();
                this.model.save({
                    assignment: assignment,
                    record_time: record_time,

                    groups: {
						owner: $("#allUsersSelect").data("id"),
                        users: usersId,
                        group: groupsId
                    },
                    whoCanRW: whoCanRW
                },
                {
                    headers: {
                        mid: mid
                    },
                    wait: true,
                    success: function () {
						self.hideDialog();
						Backbone.history.fragment = "";
						Backbone.history.navigate(location, { trigger: true });
                    },
                    error: function (model, xhr) {
    					self.errorNotification(xhr);
                    }
                });
            },
            hideDialog: function () {
                $(".create-dialog").remove();
                $(".add-group-dialog").remove();
                $(".add-user-dialog").remove();
            },

            render: function () {
				          var self = this;
                var formString = this.template({});
                this.$el = $(formString).dialog({
					closeOnEscape: false,
                    autoOpen:true,
                    resizable:true,
                    dialogRecords:"edit-dialog",
                    title: "Edit Job position",
                    width:"900",
                    buttons: [
                        {
                            text: "Create",
                            click: function () { self.saveItem(); }
                        },

                        {
                            text: "Cancel",
                            click: function () { $(this).dialog().remove(); }
                        }]

                });
                this.$el.find("#expectedRecruitment").spinner({
                    min: 0,
                    max: 9999
                });
				var notDiv = this.$el.find('.assignees-container');
                notDiv.append(
                    new AssigneesView({
                        model: this.currentModel,
                    }).render().el
                );

                self.instructors = [];
                self.assignments = [];
                self.firstClick = false;

                var findAssignmentByInstructorId = function(assignments, id) {
                  var result = [];
                  assignments.forEach(function(assignment) {
                    if(assignment.instructor._id == id) {
                      result.push(assignment);
                    };
                  })
                  return result;
                }
                this.findAssignmentByInstructorId = findAssignmentByInstructorId;

                var cb = function() {
                  $("#instructorDd").click(function(evt) {
                    if(!self.firstClick) {
                       self.firstClick = true;
                       setTimeout(function(){
                         self.instructors.forEach(function(instructor, index){
                           $("#instructorDd+ul").children().click(function(evt) {
                             setTimeout(function(){
                               populate.populateFromData('#assignmentDd', findAssignmentByInstructorId(self.assignments, $("#instructorDd").attr("data-id")), "show", self, true, true);
                               self.instructors.forEach(function(instructor){
                                 if(instructor._id == $("#instructorDd").attr("data-id")) {
                                   $("#instructorImg").attr("src", instructor.imageSrc);
                                 }
                               })
                             }, 100);
                           });
                         });
                       }, 100);
                    }
                  });
                };

                populate.getInstructorRecord('#instructorDd', '/InstructorForDd', {}, "name", this, true, true, null, cb);
                dataService.getData('/TeacherAssignmentsForDd', {}, function(res) {
                  self.assignments = res.data;
                });

		            // populate.populateFromData("#assignmentDd", self.assignments, "show", this, true, true);
                // populate.getWorkflow("#workflowsDd", "#workflowNamesDd", "/WorkflowsForDd", { id: "Job positions" }, "name", this, true);
                this.delegateEvents(this.events);
                return this;
            }
        });
        return CreateView;
    });
