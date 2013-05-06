BioASQ Social Network
=====================

Social network for the BioASQ project.

Terms
-----
* resource can be:
    * user
    * question
    * comment
* do we need annotations in the social network
* namespace: [http://ns.bioasq.org/](http://ns.bioasq.org/)
    * node_ldp will run under the same NS

LDP-based backend services
--------------------------
Each user has his/her own container to which comments, votes and follows for this user are posted.
The membership subject of a user container is the user's WebID, the membership predicates differ.

Each resource has an aggretational containers for following, commenting and voting.
Such containers have disctinct membership predicates and their URI is formed by appending `followers/`, `comments/`, and `votes/` to the resource URI, respectively.
The membership subject of such a container is the resource URI (not the container URI).
A list of all members can be retrieved with a `GET` request to the container URI, new mebers can be added by posting a membership triple to the container URI.

### Resources (Users, Comments, Questions)
* details for a resource with `@id`
    * `GET <@id>`

### Comments
* list of comments on resource with `@id`
    * `<@id>/comments/`
* post a comment on a resource with `@id` by user `@uid`
    * `POST <@user container>` with
        * `{ about: <@id>, creator: <@uid>, ... }`
    * `POST <@id>/comments/` with comment description (below)
    * `PUT <@id>/comments/` with comment description (below)

### Followers
* for follower containers the membership predicate is `http://ns.bioasq.org/follower` (`follower`)
* list of users that follow a resource with `@id`
    * `<@id>/followers/`
* follow a resource with `@id`
    * `POST <@id>/followers/` with
        * `{ @id: <@id>, follower: <user ID> }`

### Voting
* vote on question with `@id`
    * `POST <@id>/votes/` with
        * `{ @id: <user ID>, }`
* get all votes for a question with `@id`
    * `GET <@id>/votes/`

REST backend services
---------------------
* each user has his own container
* a WebID is automatically provided by the container
* the container is the user's feed

* list of recent resources (timeline)
    * `GET /all` with `{ order: 'date' }`
* list of resources a user follows
    * `/following/:id`
        * parameters: { sort: 'date' }
* register, login, logout

JSON structure
--------------
* Mime type for `Accept` and `Content-Type` header: `application/ld+json`
* [JSON-LD](http://json-ld.org) @context (will be passed with all objects, later via reference)

        {   @context: {   
                type: "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
                title: "http://purl.org/dc/terms/title",
                created: "http://purl.org/dc/terms/created",
                modified: "http://purl.org/dc/terms/modified",
                content: "http://rdfs.org/sioc/ns#content",
                creator: "http://purl.org/dc/terms/creator",
                replies: "http://rdfs.org/sioc/ns#has_reply",
                Comment: "http://ns.bioasq.org/Comment",
                User: "http://ns.bioasq.org/User",
                Question: "http://ns.bioasq.org/Question"
            }
        }

* comments have the following format:

        {
            @id: "http://ns.bioasq.org/comments/123abc",
            @context: "...",
            @type: "Comment",
            about: "<resource URI>",
            title: "Comment title",
            created: "2013-04-16T10:19",
            modified: "2013-04-18T11:31"
            content: "Comment text",
            creator: "<user name>",
            reply_of: "<parent comment>"
        }

* users have the following format:

        {
            @id: "http://ns.bioasq.org/users/halo123",
            @context: "...",
            @type: "User",
            email: "halo123@example.com",
            first_name: "Frank",
            last_name: "Foster",
            container: <user container>
        }

* questions have the following format:

        {
            @id: "http://ns.bioasq.org/questions/123abc",
            @context: "...",
            @type: "Question",
            body: "Question body",
            creator: "not shown",
            modified: "2013-03-12T08:46",
            qtype: "decisive|factoid|list|summary",
            answer: {
                @id: "_:b5678",
                body: "Answer body",
                annotations: ["<not shure if annotations are shown in SN>"]
            }
        }

