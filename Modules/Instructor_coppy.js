/**
 * Created by Admin on 10/08/2016.
 */
var Instructor = function (logWriter, mongoose, employee, classes, models) {
    var instructorSchema = mongoose.Schema({
        employee_id: String,
        image: String,
        team: String,
        code: String,
        classes: [],
        name: String,
        contact: {}
    }, {collection: 'Instructor_copy'});

    mongoose.model('Instructor_copy', instructorSchema);


    function getData(req, res) {
        var instructors = [];
        // Get all instructors from Instrcutor collection
        var query = models.get(req.session.lastDb - 1, "Instructor", instructorSchema).find();

        // For each instructor, get his/her info fom Employee collection

        var promis = query.exec(function (err, data) {
            var instrucorFecthCount = 0;
            for (var i = 0; i < data.length; i++) {
                var instructor = data[i];

                (function (instructor) {
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
                            if (instrucorFecthCount == data.length) {
                                res.json({items: instructors});
                            }
                        });
                })(data[i]);


            }
        });
        //
        // promis.then(function (doc) {
        //     console.log("response");
        //
        // });
    }

    return {
        getData: getData,
        instructorSchema: instructorSchema
    };
}

module.exports = Instructor;


