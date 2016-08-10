var Rate = function (logWriter, mongoose, classes, models){
    var rateSchema = mongoose.Schema({
        code: String,
        class_title: String,
        role: String,
        rate: String
    },{ versionKey: false }, { collection: 'Rate' });

    mongoose.model('Rate', rateSchema);

    function getData(req, res){
        var query = models.get(req.session.lastDb - 1, "Rate", rateSchema).find();
        query.exec(function(err,data){
            res.json({items: data});
        });
    }

    function getByIntructorCode(req, res, data){
        var query = models.get(req.session.lastDb - 1, "Rate", rateSchema).find({code  : data});
        query.exec(function(err, rate){
            console.log(data);
            res.json({items: data});
        });
    }

    return {
        getData: getData,
        getByIntructorCode: getByIntructorCode,
        rateSchema: rateSchema
    };
};

module.exports = Rate;
