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

    function findNode(data, node) {
      if(!data){
        return null;
      }

      if(!node) {
        node = root;
      }

      if(node.name == data.name || node._id.toString() == data._id) {
        return node;
      } else {
        var result = null;
        for(var i = 0; i < node.childs.length; i++) {
          if(node.childs[i] && (result = findNode(data, node.childs[i])) ){
            break;
          }
        }
        return result;
      }
    }

    function findParent(data, node, rootClone) {
      // var root = JSON.parse(JSON.stringify(this.root));
      // if(!rootClone) {
      //     rootClone = JSON.parse(JSON.stringify(root));
      // }
      // if(!node) {
      //     node = rootClone;
      // }
      //
      // if(node.name == data.name || node._id.toString() == data._id) {
      //   return rootClone;
      // } else (data.name == node.name || data._id == node._id) {
      //   var result = null;
      //   for(var i = 0; i < node.childs.length; i++) {
      //     if(node.childs[i] && (result = findNode(data, node.childs[i])) ){
      //       node.childs = childs[i];
      //       break;
      //     }
      //   }
      //   return rootClone;
      // }
      // return rootClone;
      // console.log(this.root);

    }

    //------------Services----------
    function getData(req, res, data){
        data = (data.name || data._id) ? data : null;
        function process(docs){
          root = root || build(docs);
          if(data) {
            res.json(findNode(data, root));
          } else {
            res.json(root);
          }
        }

        if(root) {
          process();
        } else {
          var model = models.get(req.session.lastDb - 1, 'PersonTree', personTreeSchema);
          model.find({})
            .exec(function(err, docs) {
              if(err) {
                res.json(500, err);
              } else {
                process(docs);
              }
            });
        }
    };

    function getParent(req, res, data) {
        data = (data.name || data._id) ? data : null;
        function process(docs){
          if(!root) build(docs);
          if(data) {
            res.json(findParent(data, root));
          } else {
            res.json(null);
          }
        }

        if(root) {
          process();
        } else {
          var model = models.get(req.session.lastDb - 1, 'PersonTree', personTreeSchema);
          model.find({})
            .exec(function(err, docs) {
              if(err) {
                res.json(500, err);
              } else {
                process(docs);
              }
            });
        }
    };

    return {

        getData: getData,
        getParent: getParent,

        personTreeSchema: personTreeSchema
    };
};

module.exports = PersonTree;
