var nodemailer = require('nodemailer'),
    ejs        = require('ejs'),
    path       = require('path'),
    fs         = require('fs'),
    config     = require(path.join('..', '..', 'config'));

var Mail = exports.Mail = function () {
    this.transport = nodemailer.createTransport('SMTP', {
        service: 'Gmail',
        auth: {
            user: config.defaults.mail.user,
            pass: config.defaults.mail.pass
        }
    });

    var templatePathParts = [ __dirname,  '..', 'etc', 'templates' ],
        templatePaths = {
            activation: path.join.apply(this, templatePathParts.concat('activation.ejs')),
            reset:      path.join.apply(this, templatePathParts.concat('reset.ejs')),
            followers:  path.join.apply(this, templatePathParts.concat('followers.ejs')),
            message:    path.join.apply(this, templatePathParts.concat('message.ejs'))
    };
    this.templates = {
        activation: ejs.compile(String(fs.readFileSync(templatePaths.activation))),
        reset:      ejs.compile(String(fs.readFileSync(templatePaths.reset))),
        followers:  ejs.compile(String(fs.readFileSync(templatePaths.followers))),
        message:    ejs.compile(String(fs.readFileSync(templatePaths.message)))
    };

    this.sender = 'BioASQ Social Network <bioasqat@gmail.com>';
    this.projectName = 'BioASQ Social Network';
};

Mail.prototype._mailOptions = function (receipient, sender, subject, contentHTML) {
    return {
        from:    sender,
        to:      receipient,
        subject: subject,
        html:    contentHTML,
        generateTextFromHTML: true
    };
};

Mail.prototype.close = function () {
    this.transport.close();
};

Mail.prototype.sendActivationMail = function (user, activationURL, cb) {
    var htmlMail = this.templates.activation({
        userName:      user.first_name,
        projectName:   this.projectName,
        activationURL: activationURL
    });

    var subject = 'Account Activation',
        options = this._mailOptions(user.email, this.sender, subject, htmlMail);
    this.transport.sendMail(options, cb);
};

Mail.prototype.sendResetMail = function (user, resetURL, cb) {
    var htmlMail = this.templates.reset({
        userName:     user.first_name,
        projectName:   this.projectName,
        resetURL:     resetURL
    });

    var subject = 'Password Reset Request';
    this.transport.sendMail(this._mailOptions(user.email, this.sender, subject, htmlMail), cb);
};

Mail.prototype.sendFollowerNotification = function (user, follower, URL, cb) {
    var htmlMail = this.templates.followers({
        userName:    user.first_name,
        follower:    [ follower.first_name, follower.last_name ].join(' '),
        projectName: this.projectName,
        signInURL:   URL
    });

    var subject = 'New Followers';
    this.transport.sendMail(this._mailOptions(user.email, this.sender, subject, htmlMail), cb);
};

Mail.prototype.sendMessageNotification = function (receipient, sender, URL, cb) {
    var htmlMail = this.templates.message({
        userName:    receipient.first_name,
        sender:      [ sender.first_name, sender.last_name ].join(' '),
        projectName: this.projectName,
        signInURL:   URL
    });

    var subject = 'New Messages';
    this.transport.sendMail(this._mailOptions(receipient.email, this.sender, subject, htmlMail), cb);
};
