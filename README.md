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

REST backend services
---------------------
* each user has his own container
* a WebID is automatically provided by the container
* the container is the user's feed

* list of recent resources (timeline)
    * `/all` with `{ order: 'date' }`
* list of comments on resource
    * `/comments/:id`
        * params: `{ sort: 'date' }`
* list of resources a user follows
    * `/following/:id`
        * parameters: { sort: 'date' }
* list of users that follow a resource
    * `/followers/:id`
* details for given resource (description)
    * `GET /questions/:id`
    * `GET /users/:id`
    * `GET /comments/:id`
* comment on a resource
    * `PUT /comments` with `{ creator: 'me', about: 'resource', content: 'ttt' }`
    * `POST /comment/:id` with `{ creator: 'me', content: 'ttt' }`
* vote on resource
    * `POST /vote/:id` with `{ dir: 'up|down' }`
* follow a resource
    * `POST /follow/:id` with `{ who: 'me' }`
* register, login, logout

JSON structure
--------------
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
            type: "Comment",
            title: "Comment title",
            created: "2013-04-16T10:19",
            modified: "2013-04-18T11:31"
            content: "Comment text",
            creator: "<user name>",
            replies: ["<array of Posts>"]
        }

* users have the following format:

        {
            @id: "http://ns.bioasq.org/users/halo123",
            @context: "...",
            email: "halo123@example.com",
            type: "User",
            first_name: "Frank",
            last_name: "Foster"
        }

* questions have the following format:

        {
            @id: "http://ns.bioasq.org/questions/123abc",
            @context: "...",
            type: "Question",
            body: "Question body",
            creator: "not shown",
            modified: "2013-03-12T08:46",
            qtype: "list|textual",
            answer: {
                @id: "_:b5678",
                body: "Answer body",
                annotations: ["<not shure if annotations are shown in SN>"]
            }
        }

