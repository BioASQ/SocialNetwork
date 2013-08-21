BioASQ Social Network
=====================

Social network for the BioASQ project.

Installation
------------
* `git clone` the repostitory
* install server dependencies: `npm install`
* ensure MongoDB is running
* import demo data (this will remove existing data!): `node ./server/scripts/import.js`
* `./bin/start` -- start the backend

Terms
-----
* resource can be:
    * User
    * Question
    * Comment
    * Activity
* do we need annotations in the social network

REST backend services
---------------------

* register, login, logout

* list of recent activity (timeline)
    * `GET /activities`

* array of questions
    * `GET /questions`
* a particular question
    * `GET /questions/:id`
* array of comments on a question
    * `GET /questions/:id/comments`
* array of followers to a question
    * `GET /questions/:id/followers`
* adding a comment to a question
    * `POST /questions/:id/comments`
    * JSON data: { creator: @userID, content: @content }
* follow a question
    * `POST /questions/:id/followers`
    * JSON data: { creator: @userID }
* unfollow a question
    * `DELETE /questions/:id/followers/:followerID`

* a particular user
    * `GET /users/:id`
* array of followers of a user
    * `GET /users/:id/followers`
* array of resources a user follows
    * `GET /users/:id/following`
* array of comments a user has written
    * `GET /users/:id/comments`
* follow a user
    * `POST /users/:id/followers`
    * JSON data: { creator: @followerID, about: userID }
* unfollow a user
    * `DELETE /users/:id/followers/:followerID`

* get array of all messages for current user
    * `GET /messages`
* get array of messages with a user (to and from)
    * `GET /messages/user/:id`
* write a message to a user
    * `POST /messages`
    * JSON data: see above
* post a message update (i.e. read state)
    * `POST /messages/:id`
    * JSON data: { read: true }, and/or other changed values

* vote on a Question
    * `POST /votes`
    * JSON data: { creator: @userID, about: @questionID, direction: 'up|down' }


JSON structure
--------------
* Mime type for `Accept` and `Content-Type` header: `application/json`

* Comments have the following format:

        {
            @id: "http://ns.bioasq.org/comments/123abc",
            @type: "Comment",
            about: "<resource URI>",
            title: "Comment title",
            created: "2013-04-16T10:19",
            content: "Comment text",
            creator: "<user name>",
            reply_of: "<parent comment>"
        }

* Users have the following format:

        {
            @id: "http://ns.bioasq.org/users/halo123",
            @type: "User",
            email: "halo123@example.com",
            first_name: "Frank",
            last_name: "Foster",
            container: <user container>
        }

* Messages have the following format:

        {
            @id: "http://ns.bioasq.org/comments/123abc",
            @type: "Message",
            creator: "<user ID>",
            to: "<receipient ID>",
            created: "2013-04-16T10:19",
            title: "Comment title",
            content: "Message text",
            reply_of: "<ID of parent message>",
            read: "true|false"
        }

* Questions have the following format:

        {
            @id: "http://ns.bioasq.org/questions/123abc",
            @type: "Question",
            body: "Question body",
            creator: "not shown",
            created: "2013-03-11T09:21",
            modified: "2013-03-12T08:46",
            qtype: "decisive|factoid|list|summary",
            answer: {
                body: "Answer body",
                annotations: ["<not shure if annotations are shown in SN>"]
            }
        }

* Follows have the following format:

        {
            type: "Follow",
            creator: "<user ID>",
            about: "<ID of resource followed>",
            created: "2013-04-16T10:19Z"
        }

* Votes have the following format:

        {
            type: "Vote",
            creator: "<user ID>",
            about: "<ID of resource followed>",
            created: "2013-04-16T10:19Z"
            direction: 'up|down'
        }
