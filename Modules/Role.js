/**
 * Created by Admin on 28/06/2016.
 */
var Role = function (logWriter, mongoose, models){
    var roleSchema = mongoose.Schema({
        code: String,
        title: String
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

    return {
        getData: getData,
        createData: createData,
        updateData: updateData,
        deleteData: deleteData,

        roleSchema: roleSchema
    };
};

module.exports = Role;
