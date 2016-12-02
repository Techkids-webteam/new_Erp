/**
 * Created by Admin on 28/06/2016.
 */
var Role = function (logWriter, mongoose, models){
    var roleSchema = mongoose.Schema({
        code: String,
        title: String
        //rate:
        //class_id
    }, { collection: 'Role' });

    var schema = mongoose.model('Role', roleSchema);

    function getData(req, res){
        var query = models.get(req.session.lastDb - 1, "Role", roleSchema).find();
        query.exec(function(err, data){
            if(err) {
                logWriter.log(err);
            }
            else res.json({items: data});
        });
    }

    function createData(req, res, data) {
        var new_role = new models.get(req.session.lastDb - 1, 'Role', roleSchema)();
        new_role.code = data.code;
        new_role.title = data.title;
        new_role.save(function (err, result) {
            if (err) {
                console.log(err);
                logWriter.log("Record.js saveRecordToDb _record.save" + err);
                res.json({result_code: 0, result_message: err});
            } else {
                res.json({id: result._id, result_code: 1, result_message: "success" });
            }
        });
    }

    function updateData(req, res, data) {
        models.get(req.session.lastDb - 1, "Role", roleSchema).update({ _id: data._id }, data, function (err, result) {
            if(err) {
                res.json({result_code: 0, result_message: err});
            } else {
                res.json({result_code: 1, result_message: "success"});
            }
        });
    }

    function deleteData(req, res, data) {
        models.get(req.session.lastDb - 1, 'Role', roleSchema).remove({ _id: data._id }, function (err, result) {
            if (err) {
                res.json({result_code: 0, result_message: err});
            } else {
                res.json({result_code: 1, result_message: "success"});
            }
        });
    }

    function getTotalCount(req, res) {
        var query = models.get(req.session.lastDb - 1, "Role", roleSchema)
          .find().count(function(err, count) {
            if(err) {
              res.json(500, {error: err});
            } else {
              var result = {};
              result["count"] = count || 0;
              res.json(200, result);
            }
          });
        //   .find();
        // query.exec(function(err, data) {
        //   if(err) {
        //     res.json(500, {error: err});
        //   } else {
        //     var result = {};
        //     result["count"] = data ? (data.length || 0) : 0;
        //     res.json(200, result);
        //   }
        // });
    }

    function create(req, res, data) {
        if(data) {
          var model = models.get(req.session.lastDb - 1, "Role", roleSchema);
          var newRole = new model({
            title: data.title,
            code: data.code
          });
          newRole.save(function(err, result) {
            if(err || !result) {
              res.json(500, err || new Error("Something went wrong!"));
            } else {
              res.json(200);
            }
          })
        } else {
          logWriter.log("Role.js create Bad request missing data!");
          res.json(400, {error: new Error("Missing data")});
        }
    }


    function getRolesForDd(req, res) {
        var res = {};
        res['data'] = [];
        var query = models.get(req.session.lastDb - 1, 'Role', roleSchema).find({});
        query.select('_id name');
        query.exec(function (err, doc) {
            if (err) {
                logWriter.log('Role.js get role.find' + err);
                response.send(500, { error: "Can't find Role" });
            } else {
                res['data'] = doc;
                response.send(res);
            }
        })
    }

    function getRoles(req, res) {
        var query = models.get(req.session.lastDb - 1, "Role", roleSchema).find();
        query.exec(function(err,docs){
            res.json(200, {data: docs});
        });
    }

    function getRolesById(req, res, data) {
        models.get(req.session.lastDb - 1, "Role", roleSchema)
          .findOne({_id: data})
          .exec(function(err, doc) {
            if(err) {
              res.json(500, err);
            } else if(!doc) {
              res.json(400, "Not found Role with _id : " + data);
            } else {
              res.json(200, doc);
            }
          });
    }


    function update(req, res, data) {
      data = data || {};
      console.log("all");
      console.log(data);
      if(data._id) {
        var model = models.get(req.session.lastDb - 1, "Role", roleSchema);
        model.findOne({_id: data._id}).exec(function(err, doc) {
          if(err) {
            res.json(500, {error: err});
          } else if(!doc) {
            logWriter.log("Role.js update error Bad request not found Role with data._id" + id);
            res.json(400, {error: new Error("Can not found Role data._id " + id)});
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
        logWriter.log("Role.js update error missing data._id ");
        res.json(400, {error: new Error("Missing data _id")});
      }
    }


    function updateOnlySelectedFields(req, res, data) {
      data = data || {};
      console.log("selectedFields");
      console.log(data);
      if(data._id) {
        var model = models.get(req.session.lastDb - 1, "Role", roleSchema);
        model.findOne({_id: data._id}).exec(function(err, doc) {
          if(err) {
            res.json(500, {error: err});
          } else if(!doc) {
            logWriter.log("Role.js updateOnlySelectedFields error Bad request not found Role with data._id" + id);
            res.json(400, {error: new Error("Can not found Role data._id " + id)});
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
        logWriter.log("Role.js updateOnlySelectedFields error missing data._id ");
        res.json(400, {error: new Error("Missing data _id")});
      }
    }


    function remove(req, res, id) {
      if(id) {
        var model = models.get(req.session.lastDb - 1, "Role", roleSchema);
        model.findOne({_id: id})
          .exec(function(err, doc) {
            if(err) {
              res.json(500, {error: err});
            } else if(!doc) {
              logWriter.log("Role.js remove error Bad request not found Role with _id" + id);
              res.json(400, {error: new Error("Can not found Role _id " + id)});
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
        logWriter.log("Role.js remove error missing data._id ");
        res.json(400, {error: new Error("Missing data _id")});
      }
    }


    return {
        //>>old
        getData: getData,
        createData: createData,
        updateData: updateData,
        deleteData: deleteData,

        roleSchema: roleSchema,

        //>> new
        getTotalCount: getTotalCount,
        create: create,
        getRolesForDd: getRolesForDd,
        getRoles: getRoles,
        getRolesById: getRolesById,
        update: update,
        updateOnlySelectedFields: updateOnlySelectedFields,
        remove: remove

    };
};

module.exports = Role;
