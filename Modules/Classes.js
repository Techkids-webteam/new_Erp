var Classes = function (logWriter, mongoose, employee, models){
    var classesSchema = mongoose.Schema({
        title: {
          type: String,
          unique: true
        },
        code: {
          type: String,
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

    function getData(req, res){
        var query = models.get(req.session.lastDb - 1, "Classes", classesSchema).find();
        query.exec(function(err,data){
            res.json({items: data});
        });
    };

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

        getData: getData,
        createData: createData,
        updateData: updateData,
        deleteData: deleteData,

        classesSchema: classesSchema
    };
};

module.exports = Classes;
