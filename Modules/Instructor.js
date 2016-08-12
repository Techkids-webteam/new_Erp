var Instructor = function (logWriter, mongoose, employee, classes, models, record){
    var instructorSchema = mongoose.Schema({
        employee_id: String,
        image: String,
        team: String,
        code: String,
        classes: [],
        name: String,
        record_count : Number,
        contact : {}
    }, { collection: 'Instructor' });

    mongoose.model('Instructor', instructorSchema);

    function getData(req, res){
        var instructors = [];
        // Get all instructors from Instrcutor collectiona
        var query = models.get(req.session.lastDb - 1, "Instructor", instructorSchema).find();

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
                    models.get(req.session.lastDb - 1, "Teaching_Record", record.recordSchema).find({"instructor_code": instructor.code, "record_time" : {"$gte": today, "$lt": tomorow }}, function (err, recordData) {
                        instructor.record_count = recordData.length;
                    });
                    models.get(req.session.lastDb - 1,
                        "Employees",
                        employee.employeeSchema)
                        .findById(instructor.employee_id, function (err, empData) {
                            instrucorFecthCount++;
                            instructor.name = empData.name.last + " " + empData.name.first;
                            instructor.image = empData.imageSrc;
                            instructor.contact = {
                                "phone": empData.workPhones.mobile,
                                "email": empData.personalEmail
                            };
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
        //
        // promis.then(function (doc) {
        //     console.log("response");
        //
        // });
    }

    function getDataByCode(req,res,data){
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

    return {
        getData: getData,
        instructorSchema: instructorSchema,
        getDataByCode: getDataByCode
    };
};

module.exports = Instructor;


