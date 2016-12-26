define([
    'text!templates/Employees/TopBarTemplate.html',
    'custom',
    'common',
    'dataService'
],
    function (ContentTopBarTemplate, Custom, Common, dataService) {
        var TopBarView = Backbone.View.extend({
            el:'#top-bar',
            contentType: "Employees",
            actionType: null, //Content, Edit, Create
            template: _.template(ContentTopBarTemplate),

            events:{
              "click .parentLink" : "changeParentLink",
            	"click a.changeContentView": 'changeContentViewType',
            	"click ul.changeContentIndex a": 'changeItemIndex',
            	"click #top-bar-deleteBtn": "deleteEvent",
            	"click #top-bar-saveBtn": "saveEvent",
            	"click #top-bar-discardBtn": "discardEvent",
                "click #top-bar-editBtn": "editEvent",
                "click #top-bar-createBtn": "createEvent"
            },

            parentLink: ["Employees"],

            changeParentLink: function(event) {
              event.preventDefault();
      				dataService.getData("/getPersonTreeParent?node=" + event.target.text.substring(0, event.target.text.length - 3), {}, function (response) {
                console.log("__________");
                console.log(response);
                console.log("__________");
      			  });
              this.parentLink.push(Date.now());
              this.render();
            },

            changeContentViewType: function (e) {
                Custom.changeContentViewType(e, this.contentType, this.collection);
            },

            changeItemIndex: function (e) {
                var actionType = "Content";
                Custom.changeItemIndex(e, actionType, this.contentType, this.collection);
            },

            initialize: function(options) {
            	this.actionType = options.actionType;
            	if (this.actionType !== "Content")
            		Custom.setCurrentVT("form");
                if (options.collection) {
                    this.collection = options.collection;
                    this.collection.bind('reset', _.bind(this.render, this));
                }
                this.render();
            },

            render: function(){
                $('title').text(this.contentType);
                var viewType = Custom.getCurrentVT();

                this.$el.html(this.template({ viewType: viewType, contentType: this.contentType}));
                Common.displayControlBtnsByActionType(this.actionType, viewType);

                return this;
            },
            editEvent: function (event) {
                event.preventDefault();
                this.trigger('editEvent');
            },
            createEvent: function (event) {
                event.preventDefault();
                this.trigger('createEvent');
            },
            deleteEvent: function(event)
            {
            	event.preventDefault();
            	var answer=confirm("Realy DELETE items ?!");
            	if (answer==true) this.trigger('deleteEvent');
            },

            saveEvent: function(event)
            {
            	event.preventDefault();
            	this.trigger('saveEvent');
            },

            discardEvent: function(event)
            {
            	event.preventDefault();
            	Backbone.history.navigate("home/content-"+this.contentType, {trigger:true});
            }
        });

        return TopBarView;
    });
