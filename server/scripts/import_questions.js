var program = require('commander');

program
    .option('-f, --question-file <file name>', 'JSON file with questions to import')
    .option('-d, --database-name <name>', 'Database to import to')
    .option('-c, --collection-name <name>', 'Collection to import to')
    .parse(process.argv);

var mongodb     = require('mongodb'),
    server      = new mongodb.Server('127.0.0.1', '27017', {}),
    connection  = new mongodb.Db(program.databaseName, server, { safe: false }),
    ObjectID    = require('mongodb').ObjectID,
    querystring = require('querystring'),
    util        = require('util'),
    fs          = require('fs'),
    step        = require('step');

connection.open(function (err, conn) {
    if (err) {
        process.stdout.write('Could not open connection.');
        process.exit(-1);
    }

    // var importerID = new ObjectID('522ed42a1c744faf3e4c73e1');
    var importerID = '522ed42a1c744faf3e4c73e1';

    conn.collection(program.collectionName, function (err, questions) {
        if (err) {
            process.stdout.write('Could not open `question` collection.');
            process.exit(-1);
        }

        conn.collection('activity', function (err, activityCollection) {
            if (err) {
                process.stdout.write('Could not open `activity` collection.');
                process.exit(-1);
            }

            fs.readFile(program.questionFile, function (err, data) {
                if (err) {
                    process.stdout.write('Could not open file.');
                    process.exit(-1);
                }

                var docs = JSON.parse(data);
                step(
                    function () {
                    var callbackFactory = this;
                        docs.forEach(function (doc) {
                            // instantiate ObjectID
                            doc._id = ObjectID(doc.id);
                            delete doc.id;

                            // perform social network specific restructuring
                            doc.question_type = doc.type;
                            doc.type          = 'Question';
                            doc.created       = doc._id.getTimestamp();
                            doc.modified      = doc._id.getTimestamp();
                            doc.rank          = 0;
                            doc.comment_count = 0;
                            doc.creator       = importerID;

                            var activity = {
                                type:       'Import',
                                about:      doc._id,
                                about_type: 'Question',
                                created:    new Date()
                            };

                            questions.insert(doc, { safe: true }, function (err) {
                                if (err) {
                                    callbackFactory.parallel()(err);
                                } else {
                                    activityCollection.insert(activity, { safe: true }, callbackFactory.parallel());
                                }
                            });
                        });

                    },
                    function (err) {
                        if (err) {
                            console.trace(err);
                            process.exit(-1);
                        }
                        process.exit(0);
                    }
                );
            });
        });
    });
});

