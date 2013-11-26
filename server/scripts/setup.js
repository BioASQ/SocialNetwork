var mongodb  = require('mongodb'),
    config   = require(require('path').join(__dirname, '..', '..', 'config')).defaults,
    dbServer = new mongodb.Server(config.database.host, config.database.port, {}),
    dbConn   = new mongodb.Db(config.database.name, dbServer, { safe: false });

dbConn.open(function (err, db) {
    if (err) { return console.error(err); }
    db.collection('question', function (err, question) {
        if (err) { return console.error(err); }
        question.ensureIndex({ body: 'text' });
        question.ensureIndex({ created: 1 });
        question.ensureIndex({ updated: 1 });
        question.ensureIndex({ rank: 1 });
        process.exit(0);
    });
});
