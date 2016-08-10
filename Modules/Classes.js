var Classes = function (logWriter, mongoose, employee, models){
    var classesSchema = mongoose.Schema({
        title: String,
        code: String
    }, { collection: 'Classes' });

    mongoose.model('Classes', classesSchema);

    function getData(req, res){
        var query = models.get(req.session.lastDb - 1, "Classes", classesSchema).find();
        query.exec(function(err,data){
            res.json({item: data});
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
        getData: getData,
        createData: createData,
        updateData: updateData,
        deleteData: deleteData,

        classesSchema: classesSchema
    };
};

module.exports = Classes;
