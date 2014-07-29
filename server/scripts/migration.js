function makeID(tempID) {
    if (typeof tempID !== 'string') {
        return tempID;
    }
    if (tempID.length === 24) {
        return new ObjectId(tempID);
    }
    var numberID = parseInt(tempID, 10);
    if (numberID.toString(10) === tempID) {
        return numberID;
    }
    return tempID;
}

function convertToIDs(object, properties) {
    var self = this;
    properties.forEach(function (propertyName) {
        if (object.hasOwnProperty(propertyName)) {
            object[propertyName] = self.makeID(object[propertyName]);
        }
    });
    return object;
}

db.activity.find().forEach(function (a) {
    a = convertToIDs(a, ['creator', 'about', 'reply_of']);
    if (a.type === 'Question') a.type = 'Import';
    db.activity.save(a);
});

db.message.find().forEach(function (m) {
    db.message.save(convertToIDs(m, ['creator', 'to', 'reply_of']));
});

db.question.find().forEach(function (q) {
    if (q.answer && q.answer.annotations) {
        q.concepts   = q.answer.annotations.filter(function (a) { return (a.type === 'concept'); });
        q.documents  = q.answer.annotations.filter(function (a) { return (a.type === 'document'); });
        q.snippets   = q.answer.annotations.filter(function (a) { return (a.type === 'snippet'); });
        q.statements = q.answer.annotations.filter(function (a) { return (a.type === 'statement'); });
        delete q.answer.annotations;
    }

    if (q.question_type === 'decisive') {
        q.question_type = 'yesno';
    }

    delete q.creator;
    db.question.save(q);
});

db.question.find().forEach(function (q) {
    q.statements.forEach(function (s) {
        s.triples = [{ s: s.s, p: s.p, o: s.o }];
        delete s.s;
        delete s.p;
        delete s.o;
    });
    db.question.save(q);
});

// add roles key (default: User)
db.user.find().forEach(function (u) {
    u.roles = 1;
    db.user.save(u);
});

// copy questions from one account to another
db.questions.count({"creator":"christoforos.nikolaou@gmail.com"}).forEach(function (question) {
    var copy = JSON.parse(JSON.stringify(question));
    delete copy._id;
    copy.creator = "test@bioasq.org";
    db.questions.save(copy);
});
