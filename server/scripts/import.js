var mongodb    = require('mongodb'),
    server     = new mongodb.Server('127.0.0.1', '27017', {}),
    connection = new mongodb.Db('bioasq-sn', server, { safe: false }),
    fs         = require('fs'),
    path       = require('path'),
    step       = require('step');

var demoData = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'test', 'data.json')));

connection.open(function (err, conn) {
    if (err) {
        process.stdout.write('Could not open database connection.');
        process.exit(-1);
    }

    step(
        function () {
            var callbackFactory = this;

            ['question', 'user', 'message', 'activity'].forEach(function (collectionName) {
                conn.collection(collectionName, function (err, coll) {
                    if (err) {
                        process.stdout.write('Could not open `question` collection.');
                        process.exit(-1);
                    }

                    coll.remove({}, function (err) {
                        if (err) {
                            process.stdout.write('Could not remove docs from `question` collection.');
                            process.exit(-1);
                        }

                        demoData[collectionName].forEach(function (doc) {
                            if (doc.id) {
                                // doc._id = new mongodb.ObjectID(doc.id);
                                doc._id = doc.id;
                                delete doc.id;
                            }

                            if (doc.created) {
                                doc.created = new Date(doc.created);
                            }

                            if (doc.modified) {
                                doc.modified = new Date(doc.modified);
                            }

                            coll.insert(doc, { safe: true }, callbackFactory.parallel());
                        });
                    });

                });
            });
        },
        function (err) {
            if (err) {
                console.error(err);
                process.exit(-1);
            }
            process.exit(0);
        }
    );
});
