var Classes = function (logWriter, mongoose, employee, models){
    var classesSchema = mongoose.Schema({
        title: {
          type: String,
          require: true,
          unique: true
        },
        code: {
          type: String,
          require: true,
          unique: true
        }
    }, { collection: 'Classes' });

    mongoose.model('Classes', classesSchema);

    function getTotalCount(req, res) {
        var query = models.get(req.session.lastDb - 1, "Classes", classesSchema)
          .find()
          .select("_id");
        query.exec(function(err, data) {
          if(err) {
            res.json(500, {error: err});
          } else {
            var result = {};
            result["count"] = data ? (data.length || 0) : 0;
            res.json(200, result);
          }
        });
    }


    function getClasses(req, res){
        var query = models.get(req.session.lastDb - 1, "Classes", classesSchema).find();
        query.exec(function(err,docs){
            res.json(200, {data: docs});
        });
    };

    function getCLASSById(req, res, data) {
        models.get(req.session.lastDb - 1, "Classes", classesSchema)
          .findOne({_id: data})
          .exec(function(err, doc) {
            if(err) {
              res.json(500, err);
            } else if(!doc) {
              res.json(400, "Not found CLASS with _id : " + data);
            } else {
              res.json(200, doc);
            }
          });
    }

    function create(req, res, data) {
        if(data) {
          var model = models.get(req.session.lastDb - 1, "Classes", classesSchema);
          var newClass = new model({
            title: data.title,
            code: data.code
          });
          newClass.save(function(err, result) {
            if(err || !result) {
              res.json(500, err || new Error("Something went wrong!"));
            } else {
              res.json(200);
            }
          })
        } else {
          logWriter.log("Classes.js create Bad request missing data!");
          res.json(400, {error: new Error("Missing data")});
        }
    }

    function remove(req, res, id) {
      if(id) {
        var model = models.get(req.session.lastDb - 1, "Classes", classesSchema);
        model.findOne({_id: id})
          .exec(function(err, doc) {
            if(err) {
              res.json(500, {error: err});
            } else if(!doc) {
              logWriter.log("Classes.js remove error Bad request not found Class with _id" + id);
              res.json(400, {error: new Error("Can not found Classes _id " + id)});
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
        logWriter.log("Classes.js remove error missing data._id ");
        res.json(400, {error: new Error("Missing data _id")});
      }
    }

    function update(req, res, data) {
      data = data || {};
      console.log("all");
      console.log(data);
      if(data._id) {
        var model = models.get(req.session.lastDb - 1, "Classes", classesSchema);
        model.findOne({_id: data._id}).exec(function(err, doc) {
          if(err) {
            res.json(500, {error: err});
          } else if(!doc) {
            logWriter.log("Classes.js update error Bad request not found Class with data._id" + id);
            res.json(400, {error: new Error("Can not found Classes data._id " + id)});
          } else {
            doc.code = data.code;
            doc.title = data.title;
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
        logWriter.log("Classes.js update error missing data._id ");
        res.json(400, {error: new Error("Missing data _id")});
      }
    }

    function updateOnlySelectedFields(req, res, id) {
      data = data || {};
      console.log("selectedFields");
      console.log(data);
      if(data._id) {
        var model = models.get(req.session.lastDb - 1, "Classes", classesSchema);
        model.findOne({_id: data._id}).exec(function(err, doc) {
          if(err) {
            res.json(500, {error: err});
          } else if(!doc) {
            logWriter.log("Classes.js updateOnlySelectedFields error Bad request not found Class with data._id" + id);
            res.json(400, {error: new Error("Can not found Classes data._id " + id)});
          } else {
            doc.code = data.code || doc.code;
            doc.title = data.title || doc.title;
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
        logWriter.log("Classes.js updateOnlySelectedFields error missing data._id ");
        res.json(400, {error: new Error("Missing data _id")});
      }
    }

    //olds
    function getData(req, res){
        var query = models.get(req.session.lastDb - 1, "Classes", classesSchema).find();
        query.exec(function(err,data){
            res.json({items: data});
        });
    };

    function getData(req, res){
        var query = models.get(req.session.lastDb - 1, "Classes", classesSchema).find();
        query.exec(function(err,data){
            res.json({items: data});
        });
    };

    function createData(req, res, data) {
        var new_class = new models.get(req.session.lastDb - 1, 'Classes', classesSchema)();
        new_class.title = data.title;
        new_class.code = data.code;
        new_class.save(function (err, result) {
            if (err) {
                console.log(err);
                res.json({result_code: 0, result_message: err});
            } else {
                res.json({id: result._id, result_code: 1, result_message: "success" });
            }
        });
    }

    function updateData(req, res, data) {
        models.get(req.session.lastDb - 1, "Classes", classesSchema).update({ _id: data._id }, data, function (err, result) {
            if(err) {
                res.json({result_code: 0, result_message: err});
            } else {
                res.json({result_code: 1, result_message: "success"});
            }
        });
    }

    function deleteData(req, res, data) {
        models.get(req.session.lastDb - 1, 'Classes', classesSchema).remove({ _id: data._id }, function (err, result) {
            if (err) {
                res.json({result_code: 0, result_message: err});
            } else {
                res.json({result_code: 1, result_message: "success"});
            }
        });
    }

    return {
        getTotalCount: getTotalCount,
        getClasses: getClasses,
        getCLASSById: getCLASSById,
        create: create,
        update: update,
        updateOnlySelectedFields: updateOnlySelectedFields,
        remove: remove,

        getData: getData,
        createData: createData,
        updateData: updateData,
        deleteData: deleteData,

        classesSchema: classesSchema
    };
};

module.exports = Classes;
