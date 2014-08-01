var nodeunit = require('nodeunit'),
    Mail     = require('../lib/mail').Mail;

exports.testSendActivationMail = nodeunit.testCase({
    setUp: function (done) {
        this.fixture = new Mail();
        done();
    },
    tearDown: function (done) {
        this.fixture.close();
        done();
    },
    'test mail sent': function (test) {
        test.expect(2);
        this.fixture.sendActivationMail({
            first_name: 'BioASQ',
            email:      'bioasqat@gmail.com'
        }, 'http://example.com/activate', function (err, status) {
            test.equals(null, err);
            test.ok(status);
            test.done();
        });
    }
});
