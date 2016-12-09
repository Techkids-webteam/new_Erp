var Record = function (logWriter, mongoose, models){

    var ObjectId = mongoose.Schema.Types.ObjectId;
    var recordSchema = mongoose.Schema({
        assignment: {
          type: ObjectId,
          require: true
        },
        record_time: {
          type: Date,
          require: true
        },
        createdBy: {
            user: { type: String, default: null},
            date: { type: Date }
        },
        editedBy: {
            user: { type: String, default: null },
            date: { type: Date }
        }
    }, { collection: 'Teaching_Record' }, { __v: { type: Number, select: false}});

    mongoose.model('Teaching_Record', recordSchema);

    var moment = require('moment');
    //>> old
    function getData(req, res){
        var query = models.get(req.session.lastDb - 1, "Teaching_Record", recordSchema).find();
        query.exec(function(err,data){
            res.json({items: data});
        });
    }

    function getDataByDateRange(req, res, data) {
        var query = models.get(req.session.lastDb - 1, "Teaching_Record", recordSchema).find({"instructor_code": data.instructor_code, "record_time": {"$gte": data.start_date, "$lt": data.stop_date + 1}});
        query.exec(function (err, data) {
            if(err) res.send(err);
            else res.json({items: data});
        });
    }

    function getDataByMonth(req, res, data) {
        var start_date = data.year + "-" + data.month + "-" + "1";
        var stop_date = data.year + "-" + data.month +  "-" + "31";
        var query = models.get(req.session.lastDb - 1, "Teaching_Record", recordSchema).find({"instructor_code": data.instructor_code, "record_time": {"$gte": start_date, "$lt": stop_date }});
        query.exec(function (err, data) {
            if(err) res.send(err);
            else res.json({items: data});
        });
    }

    function getDataByCode(req, res, requestData){
        var response = [];
        var query = models.get(req.session.lastDb - 1, "Teaching_Record", recordSchema).find({'instructor_code': requestData.code});
        var promise  = query.exec(function(err, data){
            if(!err){
                var recordFetchCount = 0;
                for (var i=0;i<data.length; i++) {
                    var record = data[i].record_time;
                    (function(record) {
                        console.log(record);
                        recordFetchCount ++;
                        if(record.record_time.indexOf(requestData.date) != -1){
                            response.push(record);
                        }
                        if(recordFetchCount == data.length) {
                            res.json({items: response});
                        }

                    }) (data[i]);


                }
            }
            else{
                res.json({mess: "failed"});
            }
        });

    }

    function getDataDay(req, res, data) {
        var query = models.get(req.session.lastDb - 1, "Teaching_Record", recordSchema).find({'record_time': data.date, 'instructor_code': data.code});
        console.log(data);
        query.exec(function(err, record){
            res.json({number: record.length});
        });
    }

    function createData(req, res, data) {
        var ymd = data.record_time.slice(0, data.record_time.indexOf(" ")); //slice dyear month date
        var hms = data.record_time.slice(data.record_time.indexOf(" ")+1, data.record_time.length);
        if(moment(ymd, "YYYY-MM-DD").isValid() && moment(hms, "HH:mm").isValid() && hms.length != 0 &&  ymd.length != 0){
            var instructor_record = new models.get(req.session.lastDb - 1, 'Teaching_Record', recordSchema)();
            instructor_record.instructor_code = data.instructor_code;
            instructor_record.class_code = data.class_code;
            instructor_record.role_code = data.role_code;
            instructor_record.date = data.date;
            instructor_record.user_name = data.user_name;
            instructor_record.record_time = data.record_time;
            instructor_record.save(function (err, result) {
                if (err) {
                    console.log(err);
                    logWriter.log("Record.js saveRecordToDb _record.save" + err);
                    res.json({result_code: 0, result_message: "fail"});
                } else {
                    res.json({id: result._id, result_code: 1, result_message: "success" });
                }
            });
        }
        else {
            res.json({result_code: 2, result_message: "fail"});
        }
    }

    function updateData(req, res, data) {
        models.get(req.session.lastDb - 1, "Teaching_Record", recordSchema).update({ _id: data._id }, data, function (err, result) {
            if(err) {
                res.json({result_code: 0, result_message: "fail"});
            } else {
                res.json({result_code: 1, result_message: "success"});
            }
        });
    }

    function deleteData(req, res, data) {
        models.get(req.session.lastDb - 1, 'Teaching_Record', recordSchema).remove({ _id: data._id }, function (err, result) {
            if (err) {
                res.json({result_code: 0, result_message: "fail"});
            } else {
                res.json({result_code: 1, result_message: "success"});
            }
        });
    }

    //>>> new
    function getTotalCount(req, res) {
        var query = models.get(req.session.lastDb - 1, "Teaching_Record", recordSchema)
          .find().count(function(err, count) {
            if(err) {
              res.json(500, {error: err});
            } else {
              var result = {};
              result["count"] = count || 0;
              res.json(200, result);
            }
          });
    }

    function create(req, res, data) {
        if(data) {
          var model = models.get(req.session.lastDb - 1, "Teaching_Record", recordSchema);
          var newRecord = new model({
              assignment: data.assignment,
              record_time: data.record_time,
              createdBy: {
                  user: req.session.uName,
                  date: Date.now()
              }
          });
          newRecord.save(function(err, result) {
            if(err || !result) {
              res.json(500, err || new Error("Something went wrong!"));
            } else {
              res.json(200);
            }
          })
        } else {
          logWriter.log("Record.js create Bad request missing data!");
          res.json(400, {error: new Error("Missing data")});
        }
    }

    function getAssignment(req, cb) {
      var assignments = [];
      assignments.findById = function(id) {
        for(var i = 0; i < this.length; i++) {
          if(this[i]._id.toString() == (id || "").toString()) {
            return this[i];
          }
        }
      }
       models.get(req.session.lastDb - 1, 'Instructor')
        .find({})
        .lean().populate("employee_id", "_id name")
        .lean().populate("classes.class")
        .lean().populate("classes.role")
        .exec(function(err, docs) {
          if(err || !docs) {
            cb(err || new Error("Empty data"));
          } else {
            docs.forEach(function(doc, i){
              if(doc.classes instanceof Array) {
                doc.classes.forEach(function(assignment) {
                  assignment.instructor = {
                    _id: doc._id,
                    name: doc.employee_id ? doc.employee_id.name ? doc.employee_id.name.last + " " + doc.employee_id.name.first : "" : ""
                  }
                })
                Array.prototype.push.apply(assignments, doc.classes);
              }
            });
            cb(null, assignments);
          }
        });
    }

    function getRecordsForDd(req, res) {
        var query = models.get(req.session.lastDb - 1, 'Teaching_Record', recordSchema).find({})
          .exec(function(err, docs) {
            if(err || !docs) {
              res.json(500, err || new Error("Empty data"));
            } else {
              docs = JSON.parse(JSON.stringify(docs));
              getAssignment(req, function(err, assignments) {
                  docs.forEach(function(doc, i) {
                    doc.assignment = assignments.findById(doc.assignment);
                  })
                  res.json({data: docs});
              })
            }
          });
    }

    function getRecords(req, res) {
        var query = models.get(req.session.lastDb - 1, 'Teaching_Record', recordSchema).find({})
          .exec(function(err, docs) {
            if(err || !docs) {
              res.json(500, err || new Error("Empty data"));
            } else {
              docs = JSON.parse(JSON.stringify(docs));
              getAssignment(req, function(err, assignments) {
                  docs.forEach(function(doc, i) {
                    doc.assignment = assignments.findById(doc.assignment);
                  })
                  res.json({data: docs});
              })
            }
          });
    }

    function getRecordsById(req, res, data) {
        var query = models.get(req.session.lastDb - 1, 'Teaching_Record', recordSchema)
          .findOne({_id: data})
          .exec(function(err, doc) {
            if(err || !doc) {
              res.json(500, err || new Error("Empty data"));
            } else {
              doc = JSON.parse(JSON.stringify(doc));
              getAssignment(req, function(err, assignments) {
                  doc.assignment = assignments.findById(doc.assignment);
                  res.json(doc);
              })
            }
          });
    }


    function update(req, res, data) {
      data = data || {};
      if(data._id) {
        var model = models.get(req.session.lastDb - 1, "Teaching_Record", recordSchema);
        model.findOne({_id: data._id}).exec(function(err, doc) {
          if(err) {
            res.json(500, {error: err});
          } else if(!doc) {
            logWriter.log("Record.js update error Bad request not found Record with data._id" + id);
            res.json(400, {error: new Error("Can not found Record data._id " + id)});
          } else {
            doc.assignment = data.assignment;
            doc.record_time = data.record_time;
            doc.editedBy = {
              user: req.session.uName,
              date: Date.now()
            }
            doc.save(function(err, result) {
              if(err || !result) {
                res.json(500, {error: err});
              } else {
                res.json(200);
              }
            });
          }
        });
      }else{
        logWriter.log("Record.js update error missing data._id ");
        res.json(400, {error: new Error("Missing data _id")});
      }
    }


    function updateOnlySelectedFields(req, res, data) {
      data = data || {};
      if(data._id) {
        var model = models.get(req.session.lastDb - 1, "Teaching_Record", recordSchema);
        model.findOne({_id: data._id}).exec(function(err, doc) {
          if(err) {
            res.json(500, {error: err});
          } else if(!doc) {
            logWriter.log("Record.js updateOnlySelectedFields error Bad request not found Record with data._id" + id);
            res.json(400, {error: new Error("Can not found Record data._id " + id)});
          } else {
            doc.assignment = data.assignment || data.assignment;
            doc.record_time = data.record_time || data.assignment;
            doc.editedBy = {
              user: req.session.uName,
              date: Date.now()
            }
            doc.save(function(err, result) {
              if(err || !result) {
                res.json(500, {error: err});
              } else {
                res.json(200);
              }
            });
          }
        });
      }else{
        logWriter.log("Record.js updateOnlySelectedFields error missing data._id ");
        res.json(400, {error: new Error("Missing data _id")});
      }
    }

    function remove(req, res, id) {
      if(id) {
        var model = models.get(req.session.lastDb - 1, "Teaching_Record", recordSchema);
        model.findOne({_id: id})
          .exec(function(err, doc) {
            if(err) {
              res.json(500, {error: err});
            } else if(!doc) {
              logWriter.log("Record.js remove error Bad request not found Record with _id" + id);
              res.json(400, {error: new Error("Can not found Record _id " + id)});
            } else {
              doc.remove(function(err, result) {
                if(err || !result) {
                  res.json(500, {error: err || new Error("Something went wrong!")});
                } else {
                  res.json(200);
                }
              });
            }
          });
      }else{
        logWriter.log("Record.js remove error missing data._id ");
        res.json(400, {error: new Error("Missing data _id")});
      }
    }
    return {
      //old
        recordSchema: recordSchema,
        getData: getData,
        getDataByCode: getDataByCode,
        getDataByMonth: getDataByMonth,
        createData: createData,
        updateData: updateData,
        deleteData: deleteData,
        getDataByDateRange: getDataByDateRange,

        //new
        getTotalCount: getTotalCount,
        create: create,
        getRecordsForDd: getRecordsForDd,
        getRecords: getRecords,
        getRecordsById: getRecordsById,
        update: update,
        updateOnlySelectedFields: updateOnlySelectedFields,
        remove: remove

    };
};

module.exports = Record;
