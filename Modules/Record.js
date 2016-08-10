var Record = function (logWriter, mongoose, models){

    var recordSchema = mongoose.Schema({
        instructor_code: String,
        class_code: String,
        role_code: String,
        date: String,
        user_name: String,
        record_time: String
    }, { collection: 'Teaching_Record' }, { __v: { type: Number, select: false}});

    mongoose.model('Teaching_Record', recordSchema);

    var moment = require('moment');

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

    return {
        recordSchema: recordSchema,
        getData: getData,
        getDataByCode: getDataByCode,
        getDataByMonth: getDataByMonth,
        createData: createData,
        updateData: updateData,
        deleteData: deleteData,
        getDataByDateRange: getDataByDateRange
    };
};

module.exports = Record;
