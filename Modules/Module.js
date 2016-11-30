var Module = function (logWriter, mongoose, profile, models) {
    var moduleSchema = mongoose.Schema({
        _id: Number,
        mname: String,
        href: { type: String, default: '' },
        ancestors: [Number],
        users: {},
        parrent: Number,
        link: Boolean,
        visible: Boolean
    }, { collection: 'modules' });

    mongoose.model('modules', moduleSchema);

    return {
        get: function (req, id, response) {

            models.get(req.session.lastDb - 1, "Profile", profile.schema).aggregate(
                {
                    $project: {
                        profileAccess: 1
                    }
                },
                {
                    $match: {
                        _id: id
                    }
                },
                {
                    $unwind: "$profileAccess"
                },

                {
                    $match: {
                        'profileAccess.access.read': true
                    }
                },
                { $group: { _id: "$profileAccess.module" } },

                function (err, result) {
                    if (err) {
                        console.log(err);
                    } else {
                        models.get(req.session.lastDb - 1, "modules", moduleSchema).find().
                            where('_id').in(result).
                            where({ visible: true }).
                            sort({ sequence: 1 }).
                            exec(function (err, mod) {
                                if (mod) {
                                    response.send(mod);
                                } else {
                                    console.log("Node JS error " + err);
                                    response.send(401);
                                }
                            });
                    }
                }
            );
        },
     redirectToUrl: function (req, id, response, parentId) {
            models.get(req.session.lastDb - 1, "Profile", profile.schema).aggregate(
                {
                    $project: {
                        profileAccess: 1
                    }
                },
                {
                    $match: {
                        _id: id
                    }
                },
                {
                    $unwind: "$profileAccess"
                },

                {
                    $match: {
                        'profileAccess.access.read': true
                    }
                },
                { $group: { _id: "$profileAccess.module" } },

                function (err, result) {
                    if (err) {
                        console.log(err);
                    } else {
                        models.get(req.session.lastDb - 1, "modules", moduleSchema).find().
                            where('_id').in(result).
                            where({ visible: true, parrent: parentId }).
                            sort({ sequence: 1 }).
                            exec(function (err, mod) {
                                if (mod) {
                                    response.redirect("/#easyErp/"+mod[0].href);
                                } else {
                                    console.log("Node JS error " + err);
                                    response.send(401);
                                }
                            });
                    }
                }
            );
        },
        update: function(req, res, data) {
          if(data) {
            models.get(req.session.lastDb - 1, "modules", moduleSchema)
            .findOne({_id: data._id})
            .exec(function(err, doc){
              if(err) {
                res.json(500, {error: err});
              } else if(!doc) {
                res.json(400, {error: new Error("Not found Module with _id: " + data._id)});
              }else {
                doc.mname = data.mname || doc.mname;
                doc.href = data.href || doc.href;
                doc.save(function(err, result) {
                  if(err || !result) {
                    res.json(500, err || new Error("Something went wrong!"));
                  } else {
                    res.json(200);
                  }
                })
              }
            })
          } else {
            res.json(400, {error: new Error("Missing data!")});
          }
        }
    };
};

module.exports = Module;
