define([
    "text!templates/TeacherAssignments/CreateTemplate.html",
    "collections/Departments/DepartmentsCollection",
    "collections/Workflows/WorkflowsCollection",
    "models/TeacherAssignmentModel",
    'views/Assignees/AssigneesView',
    "common",
    "populate"
],
    function (CreateTemplate, DepartmentsCollection, WorkflowsCollection, TeacherAssignmentModel, AssigneesView, common, populate) {
        var CreateView = Backbone.View.extend({
            el: "#content-holder",
            contentType: "TeacherAssignments",
            template: _.template(CreateTemplate),
            initialize: function () {
                _.bindAll(this, "saveItem", "render");
                this.model = new TeacherAssignmentModel();
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
                holder.closest(".dialog-tabs").find("a.active").removeTeacherAssignments("active");
                holder.addTeacherAssignments("active");
                var n = holder.parents(".dialog-tabs").find("li").index(holder.parent());
                var dialog_holder = $(".dialog-tabs-items");
                dialog_holder.find(".dialog-tabs-item.active").removeTeacherAssignments("active");
                dialog_holder.find(".dialog-tabs-item").eq(n).addTeacherAssignments("active");
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
                var mid = 57;

                var instructor = $("#instructorDd").attr("data-id");
                var cl = $("#classesDd").attr("data-id");
                var role = $("#rolesDd").attr("data-id");
                var rate = $.trim($("#rate").val());

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
                var cacheModel = this.model;
                this.model.save({
                    _id: instructor,
                    role: role,
                    class: cl,
                    rate: rate,
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
                    dialogTeacherAssignments:"create-dialog",
                    title: "Create TeacherAssignments",
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
                // populate.get("#departmentDd", "/DepartmentsForDd", {}, "departmentName", this, true, true);
                populate.get("#instructorDd", "/InstructorForDd", {}, "name", this, true, true);
                populate.get("#classesDd", "/CLASSForDd", {}, "title", this, true, true);
                populate.get("#rolesDd", "/RolesforDd", {}, "title", this, true, true);
                // populate.getWorkflow("#workflowsDd", "#workflowNamesDd", "/WorkflowsForDd", { id: "Job positions" }, "name", this, true);
                this.delegateEvents(this.events);
                return this;
            }
        });
        return CreateView;
    });
