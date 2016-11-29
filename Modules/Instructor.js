var Instructor = function (logWriter, mongoose, employee, role, models, record, classes){
    var async = require('async');
    var instructorSchema = mongoose.Schema({
        employee_id: {
            type: String,
            unique: true
        },
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
                    models.get(req.session.lastDb - 1, "Teaching_Record", record.recordSchema).find({"instructor_code": instructor.code, "date" : {"$gte": today, "$lt": tomorow }}, function (err, recordData) {
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



    return {
        getData: getData,
        getData1: getData1,
        instructorSchema: instructorSchema,
        getDataByCode: getDataByCode,
        createData: createData,
        deleteInstructor: deleteInstructor,
        update: updateInstructor
    };
};

module.exports = Instructor;
