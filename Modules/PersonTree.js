var PersonTree = function (logWriter, mongoose, models){

    var ObjectId = mongoose.Schema.Types.ObjectId;
    var personTreeSchema = mongoose.Schema({
        _id: ObjectId,
        node: {
          type: String,
          unique: true
        },
        childs:[{type: ObjectId, ref: 'PersonTree'}]
    }, { collection: 'PersonTree' });

    // var autoPopulateChilds = function(next) {
    //   this.populate('childs');
    //   next();
    // }
    //
    // personTreeSchema.pre('findOne', autoPopulateChilds);

    mongoose.model('PersonTree', personTreeSchema);


    function getData(req, res, data){
        var model = models.get(req.session.lastDb - 1, 'PersonTree', personTreeSchema);
        if(data) {
          model.findOne({node: data})
            .lean()
            .populate('childs')
            .populate('childs.childs')
            .exec(function(err, root) {
              if(err) {
                res.json(500);
              } else if(!root) {
                res.json(400, {mess: 'Not found PersonTree Node: ' + data});
              } else {
                res.json(200, root);
              }
              // function deepPopulate(err, docs) {
              //   if(err) {
              //
              //   }
              // }
              // else {
              //   model.populate(doc.childs, {path: 'childs'}, function(err, docs){
              //     if(err) {
              //       console.log(err);
              //       res.json(500);
              //     } else {
              //       doc.childs = docs;
              //       res.json(200, doc);
              //     }
              //   });
              // }
            });
        } else {
          model.find()
            .lean()
            .populate('childs')
            .exec(function(err, docs){
                if(err) {
                  res.json(500);
                } else {
                  res.json(200, {item: docs});
                }
            });
        }
    };

    return {
        getData: getData,

        personTreeSchema: personTreeSchema
    };
};

module.exports = PersonTree;
