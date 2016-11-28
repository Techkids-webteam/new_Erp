var PersonTree = function (logWriter, mongoose, models){

    var ObjectId = mongoose.Schema.Types.ObjectId;
    var personTreeSchema = mongoose.Schema({
        _id: ObjectId,
        name: {
          type: String,
          unique: true
        },
        childs:[{type: ObjectId, ref: 'PersonTree'}],
        parent: {
          type: ObjectId,
          ref: 'PersonTree'
        }
    }, { collection: 'PersonTree' });

    // var autoPopulateChilds = function(next) {
    //   this.populate('childs');
    //   next();
    // }
    //
    // personTreeSchema.pre('findOne', autoPopulateChilds);

    mongoose.model('PersonTree', personTreeSchema);

    var rootName = "Person";

    var root;

    //------------Tree function----------
    function build(docs) {
      function findChildById(id, docs) {
        for(var i = 0; i < docs.length; i++) {
          if(docs[i]._id.toString() == id.toString()) {
            return docs.splice(i, 1)[0];
          }
        }
      }

      function findChild(node, docs) {
        if(node.childs instanceof Array) {
          for(var i = node.childs.length - 1; i >= 0; i--) {
            node.childs[i] = findChildById(node.childs[i], docs);
            console.log(node.childs[i]);
            node.childs[i]["parent"] = {_id:node._id, name: node.name};
            console.log("after");
            console.log(node.childs[i]["parent"]);
            if(!node.childs[i]) {
              docs.splice(i, 1);
            }
          };
          node.childs.forEach(function(child, i) {
            if(child)
              findChild(child, docs);
          });
        }
      }

      for(var i = 0; i < docs.length; i++){
        if(docs[i].name == rootName) {
          root = docs[i];
          findChild(root, docs);
          return root;
        }
      }
    }

    function findNode() {

    }

    //------------Services----------
    function getData(req, res, data){
        if(root) {
        } else {
          var model = models.get(req.session.lastDb - 1, 'PersonTree', personTreeSchema);
          model.find({})
            .exec(function(err, docs) {
              if(err) {
                res.json(500, err);
              } else {
                build(docs);
                if(data) {
                  res.end("find tree node");
                } else {
                  res.json(root || build(docs));
                }
              }
            });

        }
    };

    function getParent(req, res, data) {
      console.log("in get parent API");
      if(data) {
        var model = models.get(req.session.lastDb - 1, 'PersonTree', personTreeSchema);
        var x = req.session.lastDb - 1;
        console.log("_________");
        console.log(x);
        console.log(req.session.lastDb);
        console.log("_________");
        res.end(x);
      } else {
        res.json(200, "Missing data on '/getPersonTreeParent' api!");
      }
    };

    return {

        getData: getData,
        getParent: getParent,

        personTreeSchema: personTreeSchema
    };
};

module.exports = PersonTree;
