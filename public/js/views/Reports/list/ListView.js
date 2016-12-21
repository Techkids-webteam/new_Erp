define([
    'text!templates/Reports/list/ListHeader.html',
    // 'views/Reports/CreateView',
    'views/Reports/list/ListItemView',
    'collections/Reports/filterCollection',
    'models/ReportModel',
    // 'views/Reports/EditView',
    'common',
    'dataService',
    'text!templates/stages.html',
    'populate'
],

       function (listTemplate, listItemView, contentCollection, currentModel, common, dataService, stagesTamplate, populate) {
           var ReportsListView = Backbone.View.extend({
               el: '#content-holder',
               defaultItemsNumber: null,
               listLength: null,
               sort: null,
               newCollection: null,
               page: null,
               contentType: 'Reports',
               viewType: 'list',

               initialize: function (options) {
                  var self = this;
                   this.startTime = options.startTime;
                   this.collection = options.collection;
                   _.bind(this.collection.showMore, this.collection);
                   this.defaultItemsNumber = this.collection.namberToShow || 50;
                   this.newCollection = options.newCollection;
                   this.deleteCounter = 0;
                   this.newCollection = options.newCollection;
                   this.page = options.collection.page;
                   this.render();
                  //  this.getTotalLength(null, this.defaultItemsNumber, this.filter);
                   this.contentCollection = contentCollection;
                   try{
                     this.collection.models[0].attributes.reports.forEach(function(report) {
                       var ops;
                       $("#instructors").append(ops = $("<option value='" + report.instructor._id + "'>" + report.instructor.name + "</option>"));
                     })
                   }catch(err) {};
                   $("#getReport").click(function() {
                        var option = {
                            viewType: 'list',
                            page: self.page,
                            count: self.defaultItemsNumber,
                            filter: self.filter,
                            parrentContentId: self.parrentContentId,
                            contentType: self.contentType,
                            newCollection: self.newCollection,
                            //TODO: fill options fields bellow
                            start_date: $("#start_date").val(),
                            stop_date: $("#stop_date").val(),
                            instructor_id: ($("#instructors").val())
                        };
                       self.collection = new contentCollection(option, function() {
                         self.collection.bind('reset', self.renderContent, self);
                         self.collection.bind('showmore', self.showMoreContent, self);
                         self.render();
                         console.log("call back");
                       });
                   });
               },

               events: {
                  //  "click .itemsNumber": "switchPageCounter",
                  //  "click .showPage": "showPage",
                  //  "change #currentShowPage": "showPage",
                  //  "click #previousPage": "previousPage",
                  //  "click #nextPage": "nextPage",
                  //  "click .checkbox": "checked",
                  //  "click  .list td:not(.notForm)": "goToEditDialog",
                  //  "click #itemsButton": "itemsNumber",
                  //  "click .currentPageList": "itemsNumber",
                  //  "click": "hideItemsNumber",
                  //  "click .oe_sortable": "goSort",
                  //  "click .stageSelect": "showNewSelect",
                  //  "click .newSelectList li": "chooseOption",
                  //  "click #firstShowPage": "firstPage",
                  //  "click #lastShowPage": "lastPage"
               },
               hideNewSelect: function (e) {
                   $(".newSelectList").hide();
               },
               showNewSelect: function (e) {
                   if ($(".newSelectList").is(":visible")) {
                       this.hideNewSelect();
                       return false;
                   } else {
                       $(e.target).parent().append(_.template(stagesTamplate, { stagesCollection: this.stages }));
                       return false;
                   }
               },

               chooseOption: function (e) {
                   var afterPage = '';
                   var location = window.location.hash;
                   var pageSplited = location.split('/p=')[1];
                   if (pageSplited) {
                       afterPage = pageSplited.split('/')[1];
                       location = location.split('/p=')[0] + '/p=1' + '/' + afterPage;
                   }
                   var targetElement = $(e.target).parents("td");
                   var id = targetElement.attr("id").replace("stages_", '');
                   var obj = this.collection.get(id);
                   obj.urlRoot = '/Reports';
                   obj.save({
                       workflow: $(e.target).attr("id"),
                       expectedRecruitment: obj.toJSON().expectedRecruitment,
                       totalForecastedEmployees: obj.toJSON().totalForecastedEmployees,
                       numberOfEmployees: obj.toJSON().numberOfEmployees
                   }, {
                       headers: {
                           mid: 39
                       },
                       patch: true,
                       success: function (err, model) {
                           Backbone.history.fragment = "";
                           Backbone.history.navigate(location, { trigger: true });
                       }
                   });
                   this.hideNewSelect();
                   return false;
               },

               pushStages: function (stages) {
                   this.stages = stages;
               },

               fetchSortCollection: function (sortObject) {
                   this.sort = sortObject;
                   this.collection = new contentCollection({
                       viewType: 'list',
                       sort: sortObject,
                       page: this.page,
                       count: this.defaultItemsNumber,
                       filter: this.filter,
                       parrentContentId: this.parrentContentId,
                       contentType: this.contentType,
                       newCollection: this.newCollection,
                       //TODO: fill options fields bellow
                       start_date: null,
                       stop_date: null,
                       instructor_id: null
                   });
                   this.collection.bind('reset', this.renderContent, this);
                   this.collection.bind('showmore', this.showMoreContent, this);
               },

               renderContent: function () {
                   var currentEl = this.$el;
                   var tBody = currentEl.find('#listTable');
                   $("#top-bar-deleteBtn").hide();
                   $('#check_all').prop('checked', false);
                   tBody.empty();
                   var itemView = new listItemView({ collection: this.collection, page: currentEl.find("#currentShowPage").val(), itemsNumber: currentEl.find("span#itemsNumber").text() });
                   tBody.append(itemView.render());
                   var pagenation = this.$el.find('.pagination');
                   if (this.collection.length === 0) {
                       pagenation.hide();
                   } else {
                       pagenation.show();
                   }
               },

               goSort: function (e) {
                   this.collection.unbind('reset');
                   this.collection.unbind('showmore');
                   var target$ = $(e.target);
                   var currentParrentSortReports = target$.attr('roles');
                   var sortReports = currentParrentSortReports.split(' ')[1];
                   var sortConst = 1;
                   var sortBy = target$.data('sort');
                   var sortObject = {};
                   if (!sortReports) {
                       target$.addReports('sortDn');
                       sortReports = "sortDn";
                   }
                   switch (sortReports) {
                   case "sortDn":
                       {
                           target$.parent().find("th").removeReports('sortDn').removeReports('sortUp');
                           target$.removeReports('sortDn').addReports('sortUp');
                           sortConst = 1;
                       }
                       break;
                   case "sortUp":
                       {
                           target$.parent().find("th").removeReports('sortDn').removeReports('sortUp');
                           target$.removeReports('sortUp').addReports('sortDn');
                           sortConst = -1;
                       }
                       break;
                   }
                   sortObject[sortBy] = sortConst;
                   this.fetchSortCollection(sortObject);
                   this.changeLocationHash(1, this.defaultItemsNumber);
                   this.getTotalLength(null, this.defaultItemsNumber, this.filter);
               },

               hideItemsNumber: function (e) {
                   $(".allNumberPerPage").hide();
                   $(".newSelectList").hide();
               },

               itemsNumber: function (e) {
                   $(e.target).closest("button").next("ul").toggle();
                   return false;
               },

               getTotalLength: function (currentNumber, itemsNumber) {
                   dataService.getData('/totalCollectionLength/Reports', {
                       currentNumber: currentNumber,
                       newCollection: this.newCollection
                   }, function (response, context) {
                       var page = context.page || 1;
                       var length = context.listLength = response.count || 0;
                       if (itemsNumber * (page - 1) > length) {
                           context.page = page = Math.ceil(length / itemsNumber);
                           context.fetchSortCollection(context.sort);
                           context.changeLocationHash(page, context.defaultItemsNumber);
                       }
                       context.pageElementRender(response.count, itemsNumber, page);//prototype in main.js
                   }, this);
               },

               render: function () {
                   $('.ui-dialog ').remove();
                   var self = this;
                   var currentEl = this.$el;
                   currentEl.html('');
                   currentEl.append(_.template(listTemplate));
                   var itemView = new listItemView({ collection: this.collection, page: this.page, itemsNumber: this.collection.namberToShow });
                   currentEl.append(itemView.render());
                   itemView.bind('incomingStages', itemView.pushStages, itemView);
                   $('#check_all').click(function () {
                       $(':checkbox').prop('checked', this.checked);
                       if ($("input.checkbox:checked").length > 0)
                           $("#top-bar-deleteBtn").show();
                       else
                           $("#top-bar-deleteBtn").hide();
                   });
                   $(document).on("click", function () {
                       self.hideItemsNumber();
                   });
                   var pagenation = this.$el.find('.pagination');
                   if (this.collection.length === 0) {
                       pagenation.hide();
                   } else {
                       pagenation.show();
                   }
                   currentEl.append("<div id='timeRecivingDataFromServer'>Created in " + (new Date() - this.startTime) + " ms</div>");
               },

               previousPage: function (event) {
                   event.preventDefault();
                   $("#top-bar-deleteBtn").hide();
                   $('#check_all').prop('checked', false);
                   this.prevP({
                       sort: this.sort,
                       newCollection: this.newCollection,
                   });
                   dataService.getData('/totalCollectionLength/Reports', {
                       newCollection: this.newCollection
                   }, function (response, context) {
                       context.listLength = response.count || 0;
                   }, this);
               },

               nextPage: function (event) {
                   event.preventDefault();
                   $("#top-bar-deleteBtn").hide();
                   $('#check_all').prop('checked', false);
                   this.nextP({
                       sort: this.sort,
                       newCollection: this.newCollection,
                   });
                   dataService.getData('/totalCollectionLength/Reports', {
                       newCollection: this.newCollection
                   }, function (response, context) {
                       context.listLength = response.count || 0;
                   }, this);
               },

               firstPage: function (event) {
                   event.preventDefault();
                   $("#top-bar-deleteBtn").hide();
                   $('#check_all').prop('checked', false);
                   this.firstP({
                       sort: this.sort,
                       newCollection: this.newCollection
                   });
                   dataService.getData('/totalCollectionLength/Reports', {
                       filter: this.filter,
                       newCollection: this.newCollection
                   }, function (response, context) {
                       context.listLength = response.count || 0;
                   }, this);
               },

               lastPage: function (event) {
                   $("#top-bar-deleteBtn").hide();
                   $('#check_all').prop('checked', false);
                   event.preventDefault();
                   this.lastP({
                       sort: this.sort,
                       filter: this.filter,
                       newCollection: this.newCollection
                   });
                   dataService.getData('/totalCollectionLength/Reports', {
                       sort: this.sort,
                       newCollection: this.newCollection
                   }, function (response, context) {
                       context.listLength = response.count || 0;
                   }, this);
               },

               switchPageCounter: function (event) {
                   event.preventDefault();
                   this.startTime = new Date();
                   var itemsNumber = event.target.textContent;
                   this.defaultItemsNumber = itemsNumber;
                   this.getTotalLength(null, itemsNumber);
                   this.collection.showMore({
                       count: itemsNumber,
                       page: 1,
                       newCollection: this.newCollection,
                   });
                   this.page = 1;
                   $("#top-bar-deleteBtn").hide();
                   $('#check_all').prop('checked', false);
                   this.changeLocationHash(1, itemsNumber)
               },

               showPage: function (event) {
                   event.preventDefault();
                   this.showP(event, { newCollection: this.newCollection, sort: this.sort });
               },

               showMoreContent: function (newModels) {
                   var holder = this.$el;
                   holder.find("#listTable").empty();
                   holder.append(new listItemView({ collection: newModels, page: holder.find("#currentShowPage").val(), itemsNumber: holder.find("span#itemsNumber").text() }).render());
                   var pagenation = holder.find('.pagination');
                   if (newModels.length !== 0) {
                       pagenation.show();
                   } else {
                       pagenation.hide();
                   }
                   $("#top-bar-deleteBtn").hide();
                   $('#check_all').prop('checked', false);
                   holder.find('#timeRecivingDataFromServer').remove();
                   holder.append("<div id='timeRecivingDataFromServer'>Created in " + (new Date() - this.startTime) + " ms</div>");
               },

               goToEditDialog: function (e) {
                   e.preventDefault();
                   var id = $(e.target).closest('tr').data("id");
                   var model = new currentModel({ validate: false });
                   model.urlRoot = '/Reports/form';
                   model.fetch({
                       data: { id: id },
                       success: function (model) {
                           new editView({ model: model });
                       },
                       error: function () { alert('Please refresh browser'); }
                   });
               },

               createItem: function () {
                   new createView();
               },

               checked: function () {
                   if (this.collection.length > 0) {
                       var checkLength = $("input.checkbox:checked").length;
                       if ($("input.checkbox:checked").length > 0) {
                           $("#top-bar-deleteBtn").show();
                           if (checkLength == this.collection.length) {
                               $('#check_all').prop('checked', true);
                           }
                       }
                       else {
                           $("#top-bar-deleteBtn").hide();
                           $('#check_all').prop('checked', false);
                       }
                   }
               },
               deleteItemsRender: function (deleteCounter, deletePage) {
                   dataService.getData('/totalCollectionLength/Reports', {
                       filter: this.filter,
                       newCollection: this.newCollection
                   }, function (response, context) {
                       context.listLength = response.count || 0;
                   }, this);
                   this.deleteRender(deleteCounter, deletePage, {
                       filter: this.filter,
                       newCollection: this.newCollection,
                       parrentContentId: this.parrentContentId
                   });
                   var pagenation = this.$el.find('.pagination');
                   if (this.collection.length === 0) {
                       pagenation.hide();
                   } else {
                       pagenation.show();
                   }
               },
               deleteItems: function () {
                   var that = this;
                   var mid = 39;
                   var model;
                   var localCounter = 0;
                   var count = $("#listTable input:checked").length;
                   this.collectionLength = this.collection.length;
                   $.each($("#listTable input:checked"), function (index, checkbox) {
                       model = that.collection.get(checkbox.value);
                       model.destroy({
                           headers: {
                               mid: mid
                           },
                           wait: true,
                           success: function () {
                               that.listLength--;
                               localCounter++;
                               count--;
                               if (count === 0) {
                                   that.deleteCounter = localCounter;
                                   that.deletePage = $("#currentShowPage").val();
                                   that.deleteItemsRender(that.deleteCounter, that.deletePage);
                               }
                           },
                           error: function (model, res) {
                               if (res.status === 403 && index === 0) {
                                   alert("You do not have permission to perform this action");
                               }
                               that.listLength--;
                               count--;
                               if (count === 0) {
                                   that.deleteCounter = localCounter;
                                   that.deletePage = $("#currentShowPage").val();
                                   that.deleteItemsRender(that.deleteCounter, that.deletePage);

                               }
                           }
                       });
                   });
               }
           });
           return ReportsListView;
       });
