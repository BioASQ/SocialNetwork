var nodemailer = require('nodemailer'),
    ejs        = require('ejs'),
    path       = require('path'),
    fs         = require('fs'),
    util       = require('util');

var Mail = exports.Mail = function (config) {
    this.config = config;

    this.transport = nodemailer.createTransport('SMTP', {
        service: 'Gmail',
        auth: {
            user: config.user,
            pass: config.pass
        }
    });

    var templatePathParts = [ __dirname,  '..', 'etc', 'templates' ],
        templatePaths = {
            activation: path.join.apply(this, templatePathParts.concat('activation.ejs')),
            reset:      path.join.apply(this, templatePathParts.concat('reset.ejs')),
            followers:  path.join.apply(this, templatePathParts.concat('followers.ejs')),
            comment:    path.join.apply(this, templatePathParts.concat('comment.ejs')),
            question:   path.join.apply(this, templatePathParts.concat('question.ejs')),
            invitation: path.join.apply(this, templatePathParts.concat('invitation.ejs')),
            message:    path.join.apply(this, templatePathParts.concat('message.ejs'))
    };
    this.templates = {
        activation: ejs.compile(String(fs.readFileSync(templatePaths.activation))),
        reset:      ejs.compile(String(fs.readFileSync(templatePaths.reset))),
        followers:  ejs.compile(String(fs.readFileSync(templatePaths.followers))),
        comment:    ejs.compile(String(fs.readFileSync(templatePaths.comment))),
        question:   ejs.compile(String(fs.readFileSync(templatePaths.question))),
        invitation: ejs.compile(String(fs.readFileSync(templatePaths.invitation))),
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
    if (!this.config.enabled) { return; }

    var htmlMail = this.templates.activation({
        userName:      user.first_name,
        projectName:   this.projectName,
        activationURL: activationURL
    });

    var subject = 'Account Activation',
        options = this._mailOptions(user.email, this.sender, subject, htmlMail);
    this.transport.sendMail(options, function () {
        util.log('notify: activation mail sent to ' + user.email);
        if (cb) { cb(); }
    });
};

Mail.prototype.sendResetMail = function (user, resetURL, cb) {
    if (!this.config.enabled) { return; }

    var htmlMail = this.templates.reset({
        userName:     user.first_name,
        projectName:  this.projectName,
        resetURL:     resetURL
    });

    var subject = 'Password Reset Request';
    this.transport.sendMail(this._mailOptions(user.email, this.sender, subject, htmlMail), function () {
        util.log('notify: password reset mail sent to ' + user.email);
        if (cb) { cb(); }
    });
};

Mail.prototype.sendFollowerNotification = function (user, follower, URL, cb) {
    if (!this.config.enabled) { return; }

    var htmlMail = this.templates.followers({
        userName:    user.first_name,
        follower:    [ follower.first_name, follower.last_name ].join(' '),
        projectName: this.projectName,
        signInURL:   URL
    });

    var subject = 'New Followers';
    this.transport.sendMail(this._mailOptions(user.email, this.sender, subject, htmlMail), function () {
        util.log('notify: new followers notification sent to ' + user.email);
        if (cb) { cb(); }
    });
};

Mail.prototype.sendMessageNotification = function (receipient, sender, URL, cb) {
    if (!this.config.enabled) { return; }

    var htmlMail = this.templates.message({
        userName:    receipient.first_name,
        sender:      [ sender.first_name, sender.last_name ].join(' '),
        projectName: this.projectName,
        signInURL:   URL
    });

    var subject = 'New Messages';
    this.transport.sendMail(this._mailOptions(receipient.email, this.sender, subject, htmlMail), function () {
        util.log('notify: new message notification sent to ' + receipient.email);
        if (cb) { cb(); }
    });
};

Mail.prototype.sendCommentReplyNotification = function (receipient, replier, URL, cb) {
    if (!this.config.enabled) { return; }

    var htmlMail = this.templates.comment({
        userName:    receipient.first_name,
        sender:      [ replier.first_name, replier.last_name ].join(' '),
        projectName: this.projectName,
        signInURL:   URL
    });

    var subject = 'New Replies';
    this.transport.sendMail(this._mailOptions(receipient.email, this.sender, subject, htmlMail), function () {
        util.log('notify: comment reply notification sent to ' + receipient.email);
        if (cb) { cb(); }
    });
};

Mail.prototype.sendQuestionUpdateNotification = function (receipient, URL, cb) {
    if (!this.config.enabled) { return; }

    var htmlMail = this.templates.question({
        userName:    receipient.first_name,
        projectName: this.projectName,
        signInURL:   URL
    });

    var subject = 'Question Updates';
    this.transport.sendMail(this._mailOptions(receipient.email, this.sender, subject, htmlMail), function () {
        util.log('notify: question update notification sent to ' + receipient.email);
        if (cb) { cb(); }
    });
};

Mail.prototype.sendInvitationNotification = function (name, address, URL, code, codeURL, cb) {
    var htmlMail = this.templates.invitation({
        userName:           name,
        projectName:        this.projectName,
        registrationPage:   URL,
        inviteCode:         code,
        registrationLink:   codeURL
    });

    var subject = this.projectName + ' Invitation';
    this.transport.sendMail(this._mailOptions(address, this.sender, subject, htmlMail), function () {
        util.log('notify: invitation email sent to ' + address);
        if (cb) { cb(); }
    });
};
