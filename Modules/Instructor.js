var Instructor = function (logWriter, mongoose, employee, role, models, record, classes, personTree, jobPosition, event){
    var async = require('async');

    var ObjectId = mongoose.Schema.Types.ObjectId;

    var assignmentSchema = mongoose.Schema({
        rate: Number,
        instructor: {
          type: ObjectId,
          ref: "Instructor"
        },
        role: {
          type: ObjectId,
          ref: "Role"
        },
        class: {
          type: ObjectId,
          ref: "Classes"
        }
    });

    var instructorSchema = mongoose.Schema({
        employee_id: {
            type: String,
            unique: true,
            ref: 'Employees'
        },
        image: String,
        team: String,
        code: String,
        classes: [assignmentSchema],
        //classes: [type: role_id, ref: 'Roles']
        name: String,
        record_count : Number,
        contact : {}
    }, { collection: 'Instructor' });

    var instructorModel = mongoose.model('Instructor', instructorSchema);


    //>>old


    function getData(req, res){
        // res.json(employee.employeeSchema);
        // models.get(req.session.lastDb - 1, "Instructor", instructorSchema)
        //   .find()
        //   .lean().populate('employee_id')
        //   .lean().populate('history.class')
        //   .exec(function(err, docs){
        //     if(err) {
        //       res.json(500, err);
        //     } else {
        //       if(docs) {
        //         docs.forEach(function(doc, i) {
        //           // this just for running old API
        //           doc.history = undefined;
        //
        //           if(doc.employee_id) {
        //               doc.name = doc.employee_id.name.last + " " + doc.employee_id.name.first;
        //               doc.image = doc.employee_id.imageSrc;
        //               doc.contact = {
        //                   "phone": doc.employee_id.workPhones.mobile,
        //                   "email": doc.employee_id.personalEmail
        //               };
        //               doc.employee_id = doc.employee_id._id;
        //           };
        //         });
        //       }
        //       res.json(200, {items: docs, date: Date.now()});
        //     }
        //   });

        var instructors = [];
        // Get all instructors from Instrcutor collectiona
        var query = models.get(req.session.lastDb - 1, "Instructor", instructorSchema).find()
          .lean().populate("classes.class")
          .lean().populate("classes.role");

        // For each instructor, get his/her info fom Employee collection

        var promis = query.exec(function(err,data){
            var today = new Date();
            var dd = today.getDate();
            var mm = today.getMonth()+1; //January is 0!
            var yyyy = today.getFullYear();

            if(dd<10) {
                dd='0'+dd
            }

            if(mm<10) {
                mm='0'+mm
            }
            today = yyyy + '-' + mm + '-'+ dd;

            var tomorow = new Date();
            dd = tomorow.getDate()+1;
            mm = tomorow.getMonth()+1; //January is 0!
            yyyy = tomorow.getFullYear();

            if(dd<10) {
                dd='0'+dd
            }

            if(mm<10) {
                mm='0'+mm
            }

            tomorow = yyyy + '-' + mm + '-'+ dd;
            var instrucorFecthCount = 0;
            for (var i=0;i<data.length; i++) {
                var instructor = data[i];
                (function(instructor) {
                    let assigmentIDs = [];
                    instructor.classes.forEach(function(assignment) {
                      assigmentIDs.push(assignment._id);
                    })
                    models.get(req.session.lastDb - 1, "Teaching_Record", record.recordSchema)
                      .find({"assignment": {$in: assigmentIDs}, "record_time" : {"$gte": today, "$lt": tomorow }})
                      .exec(function (err, recordData) {
                        instructor.record_count = recordData.length;
                      });
                    models.get(req.session.lastDb - 1,
                        "Employees",
                        employee.employeeSchema)
                        .findById(instructor.employee_id, function (err, empData) {
                            instrucorFecthCount++;
                            if(empData) {
                              instructor.name = empData.name.last + " " + empData.name.first;
                              instructor.image = empData.imageSrc;
                              instructor.contact = {
                                  "phone": empData.workPhones.mobile,
                                  "email": empData.personalEmail
                              };
                            }
                            instructors.push(instructor);
                            if(instrucorFecthCount == data.length) {
                                res.json({
                                    items: instructors,
                                    date: today
                                });
                            }
                        });
                }) (data[i]);

            }
        });
    }

    function getData1(req, res) {
        var today = new Date();
        var dd = today.getDate();
        var mm = today.getMonth()+1; //January is 0!
        var yyyy = today.getFullYear();

        if(dd<10) {
            dd='0'+dd
        }

        if(mm<10) {
            mm='0'+mm
        }
        today = yyyy + '-' + mm + '-'+ dd;

        var tomorow = new Date();
        dd = tomorow.getDate()+1;
        mm = tomorow.getMonth()+1; //January is 0!
        yyyy = tomorow.getFullYear();

        if(dd<10) {
            dd='0'+dd
        }

        if(mm<10) {
            mm='0'+mm
        }

        tomorow = yyyy + '-' + mm + '-'+ dd;
        var response = [] ; //list instructor response
        models.get(req.session.lastDb - 1, "Instructor", instructorSchema).find(function(err, instructors){
            if(err){
                console.log(err);
            } else {
                async.each(
                    instructors,
                    function (instructor, cb) {
                        var getInfo = function(cb1) {
                            async.waterfall([
                                function (callback) {
                                    models.get(req.session.lastDb - 1, "Teaching_Record", record.recordSchema).find({"instructor_code": instructor.code, "date" : {"$gte": today, "$lt": tomorow }}, function (err, recordData) {
                                        instructor.record_count = recordData.length;
                                    });
                                    models.get(req.session.lastDb - 1, "Employees", employee.employeeSchema).findById(instructor.employee_id, function(err, employeeData){
                                        instructor.name = employeeData.name.last + " " + employeeData.name.first;
                                        instructor.image = employeeData.imageSrc;
                                        instructor.contact = {
                                            "phone": employeeData.workPhones.mobile,
                                            "email": employeeData.personalEmail
                                        };
                                        callback();
                                    });
                                },
                                function (callback) {
                                    var classres = [];
                                    var classes = instructor.classes
                                    async.each(
                                        classes,
                                        function (class1, cb2) {
                                            models.get(req.session.lastDb - 1, "Classes", classes.classesSchema).findOne({'code' : class1.class}, function(err, classData){
                                                class1.class = {
                                                    code : classData.code,
                                                    title: classData.title
                                                };
                                            });
                                            models.get(req.session.lastDb - 1, "Role", role.roleSchema).findOne({'code' : class1.role}, function(err, roleData){
                                                class1.role = {
                                                    code : roleData.code,
                                                    title: roleData.title
                                                };
                                                classres.push(class1);
                                                cb2();
                                            });
                                        },
                                        function (err) {
                                            instructor.classes = classres;
                                            callback();
                                        }
                                    );
                                }
                            ], function (err) {
                                cb1(instructor);
                            });

                        }


                        getInfo(function (instructor) {
                            // do cb() after get Employee
                            response.push(instructor);
                            cb();
                        });


                    },

                    function (err) {
                        //when done
                        res.json({
                            items: response,
                            date: today
                        });
                    }
                );
            }
        });

    }

    function getDataByCode(req, res, data){
        models.get(req.session.lastDb - 1, "Instructor", instructorSchema).findOne({'code': data}, function(err, instructor){
            if(instructor){
                models.get(req.session.lastDb - 1, "Employees", employee.employeeSchema ).findById(instructor.employee_id, function(err, data1){
                    instructor.name = data1.name.first + " " + data1.name.last;
                    instructor.image = data1.imageSrc;
                    instructor.contact = {
                        "phone": data1.workPhones.mobile,
                        "email": data1.personalEmail
                    };
                    res.json({items: instructor});
                });
            } else {
                res.send(404);
            }
        });
    }

    function createData(req, res, data) {
        employee.createData(req, data, res, function (employee_id) {
            var newIns = models.get(req.session.lastDb - 1, 'Instructor', instructorSchema)();
            console.log(employee_id);
            newIns.employee_id = employee_id;
            newIns.team = data.team;
            newIns.code = data.code;
            newIns.classes = data.classes;

            newIns.save(function (err, result) {
                if(err) logWriter.log(err);
                else res.json({id: result._id, result_code: 1, result_message: "success" });
            })
        })
    }

    function deleteInstructor(req, res, data) {
        models.get(req.session.lastDb - 1, 'Instructor', instructorSchema).findById(data._id, function(err, ins){
            employee.removeData(req, res, ins, function(req, res, data) {
              models.get(req.session.lastDb - 1, 'Instructor', instructorSchema).remove({ _id: data._id }, function (err, result) {
                  if (err) {
                      res.json({result_code: 0, result_message: err});
                  } else {
                      res.json({result_code: 1, result_message: "success"});
                  }
              });
            });
        });
    }

    function updateInstructor(req, res, data) {
        models.get(req.session.lastDb - 1, 'Instructor', instructorSchema).findById(data._id, function(err, ins){
            ins.code = data.code;
            employee.updateData(req, res, ins.employee_id, data, function(req, res) {
              models.get(req.session.lastDb - 1, 'Instructor', instructorSchema).findByIdAndUpdate(_id, { $set: ins}, function (err, result) {
                  if (err) {
                      res.json({result_code: 0, result_message: err});
                  } else {
                      res.json({result_code: 1, result_message: "success"});
                  }
              });
            });
        });
    }

    function getInstructorForDd(req, res) {
        var model = models.get(req.session.lastDb - 1, 'Instructor', instructorSchema);
        model.find({})
          .lean().populate("employee_id")
          .exec(function(err, docs){
            var processData = [];
            docs.forEach(function(doc, i){
              if(doc.employee_id.name) {
                processData.push({_id:doc._id, name: doc.employee_id.name.first + " " + doc.employee_id.name.last, imageSrc: doc.employee_id.imageSrc});
              }
            });
            res.json(200, {data: processData});
          });
    }

    //-------------------------TeacherAssignment--------------------------------
    function getTeacherAssignmentsTotalCount(req, res) {
      var model = models.get(req.session.lastDb - 1, 'Instructor', instructorSchema);
      model.find({})
        .select("classes")
        .exec(function(err, docs) {
          if(err || !docs) {
            logWriter.log("Instructor.js getTeacherAssignmentsTotalCount > Error: " + err);
            res.json(500, err);
          } else {
            var count = 0;
            docs.forEach(function(doc, i) {
              count += doc.classes ? doc.classes.length : 0;
            });
            res.json(200, {count: count});
          }
        });
    }

    function createTeacherAssignments(req, res, data) {
      var model = models.get(req.session.lastDb - 1, 'Instructor', instructorSchema);
      if(data) {
        try{
          var ta = {
            rate: data.rate,
            role: ObjectId(data.role),
            class: ObjectId(data.class)
          }
          model.findOne({_id: data.instructor})
            .exec(function(err, doc) {
              if(err) {
                logWriter.log("Instructor.js createTeacherAssignments > Error: " + err || "Add failed!");
                res.json(500, {error: err});
              } else if(!doc) {
                logWriter.log("Instructor.js createTeacherAssignments > Error: " + "Not found instructor with _id: " + data._id);
                res.json(400, {error: "Not found!"});
              } else {
                doc.classes = doc.classes || [];
                ta.instructor = doc._id;
                doc.classes.push(ta);
                doc.save(function(err, result) {
                  if(err || !result) {
                    console.log(err);
                    logWriter.log("Instructor.js createTeacherAssignments > Error: " + err || "Add failed!");
                    res.json(400, {error: err || "Something went wrong!"});
                  } else {
                    res.json(200);
                  }
                })
              }
            });
        }catch(err) {
          logWriter.log("Instructor.js createTeacherAssignments > Error: " + err);
          res.json(400, {error: err});
        }
      } else {
        logWriter.log("Instructor.js createTeacherAssignments > Error: " + "Missing data!");
        res.json(400, {messages: "Missing data!"});
      }
    }

    function getTeacherAssignmentsForDd(req, res) {
      var model = models.get(req.session.lastDb - 1, 'Instructor', instructorSchema);
      model.find()
        .lean().populate("employee_id")
        .lean().populate("classes.class")
        .lean().populate("classes.role")
        .exec(function(err, docs) {
          if(err) {
            logWriter.log("Instructor.js getTeacherAssignmentsForDd > Error: " + err);
            res.json(400, {error: err});
          } else {

            var processData = [];
            docs.forEach(function(entry, index) {
              if(entry.classes) {
                entry.classes.forEach(function(cl, i){
                  cl.instructor = {
                    _id: entry._id,
                    name: entry.employee_id ? entry.employee_id.name.first + " " + entry.employee_id.name.last : ""
                  };
                  cl.show = (cl.class ? cl.class.title : "Missing class!") + " | " + (cl.role ? cl.role.title : "Missing role!");
                  processData.push(cl);
                })
              }
            })
            res.json(200, {data: processData});
          }
        })
    }

    function getTeacherAssignments(req, res) {
      var model = models.get(req.session.lastDb - 1, 'Instructor', instructorSchema);
      model.find()
        .lean().populate("employee_id")
        .lean().populate("classes.class")
        .lean().populate("classes.role")
        .exec(function(err, docs) {
          if(err) {
            logWriter.log("Instructor.js getTeacherAssignments > Error: " + err);
            res.json(400, {error: err});
          } else {

            var processData = [];
            docs.forEach(function(entry, index) {
              if(entry.classes) {
                entry.classes.forEach(function(cl, i){
                  cl.instructor = {
                    _id: entry._id,
                    name: entry.employee_id ? entry.employee_id.name.first + " " + entry.employee_id.name.last : ""
                  };
                  processData.push(cl);
                })
              }
            })
            res.json(200, {data: processData});
          }
        })
    }


    function getTeacherAssignmentsById(req, res, id) {
      var model = models.get(req.session.lastDb - 1, 'Instructor', instructorSchema);
      model.findOne({"classes._id": id})
        .lean().populate("employee_id")
        .lean().populate("classes.class")
        .lean().populate("classes.role")
        .exec(function(err, doc) {
          if(err || !doc) {
            logWriter.log("Instructor.js getTeacherAssignmentsById > Error: " + err);
            res.json(400, {error: err});
          } else {
            try{
              for(var i = 0; i < doc.classes.length; i++) {
                var cl = doc.classes[i];
                if(cl._id.toString() == id) {
                  var data = {
                    _id: cl._id,
                    instructor: {
                      _id: doc._id,
                      name: (doc.employee_id.name ? doc.employee_id.name.first + " " + doc.employee_id.name.last : "")
                    },
                    class: cl.class,
                    role: cl.role,
                    rate: cl.rate
                  };
                  res.json(200, data);
                  break;
                }
              }
            }catch(err) {
              res.json(500);
            }
          }
        })
    }


    function updateTeacherAssignments(req, res, data) {
      var model = models.get(req.session.lastDb - 1, 'Instructor', instructorSchema);
      model.findOne({"_id": data._id})
        .exec(function(err, doc) {
          if(err || !doc) {
            logWriter.log("Instructor.js updateTeacherAssignments > Error: " + err || "Not found instructor with _id: " + data._id);
            res.json(500, {error: err || "Not found instructor with _id: " + data._id});
          } else {
            try {
              doc.classes.push({
                instructor: doc._id,
                class: data.class,
                role: data.role,
                rate: data.rate
              });
              doc.save(function(err, result) {
                if(err || !result) {
                  logWriter.log("Instructor.js updateTeacherAssignments > Error: " + err || "Something went wrong!");
                  res.json(500, {error: err || "Something went wrong!"})
                } else {
                  res.json(200);
                }
              });
              // for(var i = 0; i < doc.classes.length; i++) {
              //   if(doc.classes[i]._id.toString() == data._id) {
              //     doc.classes[i].class = data.class;
              //     doc.classes[i].role = data.role;
              //     doc.classes[i].rate = data.rate;
              //     doc.save(function(err, result) {
              //       if(err || !result) {
              //         logWriter.log("Instructor.js getTeacherAssignmentsForDd > Error: " + err || "Something went wrong!");
              //         res.json(500, {error: err || "Something went wrong!"})
              //       } else {
              //         res.json(200);
              //       }
              //     });
              //     return;
              //   }
              // }
            }catch(err) {
              logWriter.log("Instructor.js updateTeacherAssignments > Error: " + err || "Something went wrong!");
              res.json(500, {error: err || "Something went wrong!"})
            }
          }
        });
    }


    function updateTeacherAssignmentsOnlySelectedFields(req, res, data) {
      var model = models.get(req.session.lastDb - 1, 'Instructor', instructorSchema);
      if(data._id) {
        model.findOne({"classes._id": data._id})
          .exec(function(err, doc) {
            if(err || !doc) {
              logWriter.log("Instructor.js updateTeacherAssignmentsOnlySelectedFields > Error: " + err || "Not found instructor with _id: " + data._id);
              res.json(500, {error: err || "Not found instructor with _id: " + data._id});
            } else {
              try {
                for(var i = 0; i < doc.classes.length; i++) {
                  if(doc.classes[i]._id.toString() == data._id) {
                    doc.classes[i].class = data.class || doc.classes[i].class;
                    doc.classes[i].role = data.role || doc.classes[i].role;
                    doc.classes[i].rate = data.rate || doc.classes[i].rate;
                    doc.save(function(err, result) {
                      if(err || !result) {
                        logWriter.log("Instructor.js updateTeacherAssignmentsOnlySelectedFields > Error: " + err || "Something went wrong!");
                        res.json(500, {error: err || "Something went wrong!"})
                      } else {
                        res.json(200);
                      }
                    });
                    return;
                  }
                }
              }catch(err) {
                logWriter.log("Instructor.js updateTeacherAssignmentsOnlySelectedFields > Error: " + err || "Something went wrong!");
                res.json(500, {error: err || "Something went wrong!"});
              }
            }
          });
      } else {
        logWriter.log("Instructor.js updateTeacherAssignmentsOnlySelectedFields > Error: " + "Missing data._id!");
        res.json(500, {error: "Missing data._id!"});
      }
    }


    function removeTeacherAssignments(req, res, id) {
        event.emit("deleteAssignment", req, res, id, function(err) {
          if(err) {
            res.json(500, {Error: err});
          } else {
            var model = models.get(req.session.lastDb - 1, 'Instructor', instructorSchema);
            model.findOne({"classes._id": id})
              .exec(function(err, doc) {
                if(err || !doc) {
                  logWriter.log("Instructor.js removeTeacherAssignments > Error: " + err || "Not found instructor with _id: " + id);
                  res.json(500, {error: err || "Not found instructor with _id: " + id});
                } else {
                  try {
                    for(var i = 0; i < doc.classes.length; i++) {
                      if(doc.classes[i]._id.toString() == id) {
                        doc.classes.splice(i, 1);
                        doc.save(function(err, result) {
                          if(err || !result) {
                            logWriter.log("Instructor.js removeTeacherAssignments > Error: " + err || "Something went wrong!");
                            res.json(500, {error: err || "Something went wrong!"})
                          } else {
                            res.json(200);
                          }
                        });
                        return;
                      }
                    }
                  }catch(err) {
                    logWriter.log("Instructor.js removeTeacherAssignments > Error: " + err || "Something went wrong!");
                    res.json(500, {error: err || "Something went wrong!"})
                  }
                }
              });
          }
        });
    }

    //clear class
    function clearClass(req, res) {
      var model = models.get(req.session.lastDb - 1, 'Instructor', instructorSchema);
      model.find()
        .exec(function(err, docs) {
          if(err) {
            logWriter.log("Instructor.js clearClass > Error: " + err);
            res.json(400, {error: err});
          } else {

            docs.forEach(function(doc, index) {
              doc.classes = [];
              doc.save(function(err, result) {console.log(err || result)});
            })
            res.json(200);
          }
        })
    }

    //----------------------Delete----------------------------------------------
    function deleteRoleHandler(req, res, role_id, cb) {
      var query = models.get(req.session.lastDb - 1, "Instructor", instructorSchema).find({"classes.role" : role_id})
        .exec(function(err, docs) {
          if(err || !docs) {
            cb(err || new Error("Something went wrong!"));
          } else {
            if(docs.length < 1) {
              cb();
            } else {
              cb(new Error("Can not remove this task! (linked)"));
            }
          }
        })
    }

    function deleteClassHandler(req, res, class_id, cb) {
      var query = models.get(req.session.lastDb - 1, "Instructor", instructorSchema).find({"classes.class" : class_id})
        .exec(function(err, docs) {
          if(err || !docs) {
            cb(err || new Error("Something went wrong!"));
          } else {
            if(docs.length < 1) {
              cb();
            } else {
              cb(new Error("Can not remove this task! (linked)"));
            }
          }
        })
    }

    function addInstructorHandler(req, res, employee_id) {
      models.get(req.session.lastDb - 1, "Employees", employee.employeeSchema)
        .findOne({_id: employee_id})
        .exec(function(err, employeeDoc) {
          if(!err && employeeDoc) {
            models.get(req.session.lastDb - 1, "JobPosition", jobPosition.jobPositionSchema)
              .findOne({_id: employeeDoc.jobPosition}).exec(function(err, jobDoc) {
                if(!err && jobDoc && jobDoc.name == "Teacher") {
                  models.get(req.session.lastDb - 1, "Instructor", instructorSchema)
                    .findOne({employee_id: employee_id})
                    .exec(function(err, doc) {
                      if(!err && !doc) {
                        var newIns = models.get(req.session.lastDb - 1, "Instructor", instructorSchema)();
                        newIns.employee_id = employee_id;
                        newIns.team = "TECHKIDS";
                        newIns.code = employeeDoc.code;
                        newIns.classes = [];
                        newIns.save(function(err, result) {
                          console.log(err || result);
                        });
                      }
                    })
                }
              });
          }
        })
    }

    function deleteInstructorHandler(req, res, employee_id, cb) {
      models.get(req.session.lastDb - 1, "Instructor", instructorSchema)
        .findOne({employee_id: employee_id})
        .exec(function(err, doc) {
          if(err) {
            cb(err);
          } else if(!doc) {
            cb();
          } else if(doc.classes && doc.classes.length > 0) {
           cb(new Error("Can not delete this task!(linked)"));
          } else {
           doc.remove(function(err) {
             if(err) {
               cb(err);
             } else {
               cb();
             }
           })
          }
        })
    }

    event.on("addInstructor", addInstructorHandler);
    event.on("deleteInstructor", deleteInstructorHandler);
    event.on("deleteRole", deleteRoleHandler);
    event.on("deleteClass", deleteClassHandler);

    return {
        getData: getData,
        getData1: getData1,
        instructorSchema: instructorSchema,
        getDataByCode: getDataByCode,
        createData: createData,
        deleteInstructor: deleteInstructor,
        update: updateInstructor,
        getInstructorForDd: getInstructorForDd,


        getTeacherAssignmentsTotalCount: getTeacherAssignmentsTotalCount,
        createTeacherAssignments: createTeacherAssignments,
        getTeacherAssignmentsForDd: getTeacherAssignmentsForDd,
        getTeacherAssignments: getTeacherAssignments,
        getTeacherAssignmentsById: getTeacherAssignmentsById,
        updateTeacherAssignments: updateTeacherAssignments,
        updateTeacherAssignmentsOnlySelectedFields: updateTeacherAssignmentsOnlySelectedFields,
        removeTeacherAssignments: removeTeacherAssignments,

        clearClass: clearClass
    };
};

module.exports = Instructor;
