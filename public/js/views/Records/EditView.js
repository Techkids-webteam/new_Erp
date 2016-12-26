define([
    "text!templates/Records/EditTemplate.html",
    "collections/Records/RecordsCollection",
    "collections/Departments/DepartmentsCollection",
    "collections/Workflows/WorkflowsCollection",
    'views/Assignees/AssigneesView',
    "custom",
    'common',
    "populate",
    "dataService"
],
    function (EditTemplate, RecordsCollection, DepartmentsCollection, WorkflowsCollection, AssigneesView, Custom, common, populate, dataService) {
        var EditView = Backbone.View.extend({
            el: "#content-holder",
            contentType: "Records",
            template: _.template(EditTemplate),
            initialize: function (options) {
                _.bindAll(this, "render", "saveItem");
                _.bindAll(this, "render", "deleteItem");
				if (options.myModel){
					this.currentModel = options.myModel;
				}
				else{
					this.currentModel = (options.model) ? options.model : options.collection.getElement();
				}
				this.currentModel.urlRoot = "/Records";
                this.responseObj = {};
                this.render();
            },

            events: {
                "click .breadcrumb a": "changeWorkflow",
                'keydown': 'keydownHandler',
                'click .dialog-tabs a': 'changeTab',
				"click .current-selected": "showNewSelect",
                "click .newSelectList li:not(.miniStylePagination)": "chooseOption",
                "click .newSelectList li.miniStylePagination": "notHide",
                "click .newSelectList li.miniStylePagination .next:not(.disabled)": "nextSelect",
                "click .newSelectList li.miniStylePagination .prev:not(.disabled)": "prevSelect",
                "click": "hideNewSelect",
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
            changeTab:function(e){
                var holder = $(e.target);
                holder.closest(".dialog-tabs").find("a.active").removeRecords("active");
                holder.addRecords("active");
                var n= holder.parents(".dialog-tabs").find("li").index(holder.parent());
                var dialog_holder = $(".dialog-tabs-items");
                dialog_holder.find(".dialog-tabs-item.active").removeRecords("active");
                dialog_holder.find(".dialog-tabs-item").eq(n).addRecords("active");
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
                var workflow = this.$("#workflowsDd").data("id");
                var currentWorkflow = this.currentModel.get('workflow');
                var data = {
                    assignment: assignment,
                    record_time: record_time,

                    groups: {
						owner: $("#allUsersSelect").data("id"),
                        users: usersId,
                        group: groupsId
                    },
                    whoCanRW: whoCanRW
                };
                if (!currentWorkflow ||( currentWorkflow && currentWorkflow._id && (currentWorkflow._id != workflow)))
                    data['workflow'] = workflow||null;
                this.currentModel.save(data, {
                    headers: {
                        mid: mid
                    },
                    wait: true,
                    patch: true,
                    success: function (model) {
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
                $(".edit-dialog").remove();
                $(".add-group-dialog").remove();
                $(".add-user-dialog").remove();
            },
            deleteItem: function(event) {
                var mid = 39;
                event.preventDefault();
                var self = this;
                    var answer = confirm("Realy DELETE items ?!");
                    if (answer == true) {
                        this.currentModel.destroy({
                            headers: {
                                mid: mid
                            },
                            success: function () {
                                $('.edit-dialog').remove();
                                Backbone.history.navigate("easyErp/" + self.contentType, { trigger: true });
                            },
                            error: function (model, xhr) {
    							self.errorNotification(xhr);
                            }
                        });
                }
            },
            render: function () {
				var self = this;
                var formString = this.template({
                    model: this.currentModel.toJSON()
                });
                this.$el = $(formString).dialog({
                    autoOpen: true,
                    resizable: false,
                    dialogRecords: "edit-dialog",
                    width: "900",
                    title: "Edit Job Position",
                    buttons: [
						{
                            text: "Save",
                            click: function () { self.saveItem(); }
                        },

						{
							text: "Cancel",
							click: function () { $(this).dialog().remove();
						}
						},
						{
							text: "Delete",
							click:self.deleteItem }

                    ]
                });
				var notDiv = this.$el.find('.assignees-container');
                notDiv.append(
                    new AssigneesView({
                        model: this.currentModel,
                    }).render().el
                );
                //for input type number
                this.$el.find("#expectedRecruitment").spinner({
                    min: 0,
                    max: 9999
                });
                var model = this.currentModel.toJSON();

                if (model.groups)
                    if (model.groups.users.length>0||model.groups.group.length){
                        $(".groupsAndUser").show();
                        model.groups.group.forEach(function(item){
                            $(".groupsAndUser").append("<tr data-type='targetGroups' data-id='"+ item._id+"'><td>"+item.departmentName+"</td><td class='text-right'></td></tr>");
                            $("#targetGroups").append("<li id='"+item._id+"'>"+item.departmentName+"</li>");
                        });
                        model.groups.users.forEach(function(item){
                            $(".groupsAndUser").append("<tr data-type='targetUsers' data-id='"+ item._id+"'><td>"+item.login+"</td><td class='text-right'></td></tr>");
                            $("#targetUsers").append("<li id='"+item._id+"'>"+item.login+"</li>");
                        });

                    }

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
                  self.instructors.forEach(function(instructor, index) {
                    if(instructor._id == model.assignment.instructor._id) {
                      $("#instructorDd").attr("data-id", instructor._id).text(instructor.name);
                      $("#instructorImg").attr("src", instructor.imageSrc);
                    }
                  });
                  $("#instructorDd").click(function(evt) {
                    // if(!self.firstClick) {
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
                             }, 10);
                           });
                         });
                       }, 10);
                    // }
                  });
                };

                dataService.getData('/TeacherAssignmentsForDd', {}, function(res) {
                  self.assignments = res.data;
                  populate.getInstructorRecord('#instructorDd', '/InstructorForDd', {}, "name", self, true, true, null, cb);
                  populate.populateFromData('#assignmentDd', findAssignmentByInstructorId(self.assignments, model.assignment.instructor._id), "show", self, true, true);
                  $("#assignmentDd").attr("data-id", model.assignment._id).text(model.assignment.role.title + " | " + model.assignment.class.title);
                });

		            // populate.getAssignments("#assignmentDd", "/TeacherAssignmentsForDd", {}, "show", this, true, true, null, model.assignment);
                // $("#assignmentDd").attr("data-id", model.assignment._id);
                return this;
            }

        });

        return EditView;
    });
