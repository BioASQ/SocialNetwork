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
* comments have the following format:

        {
            "id": "123abc",
            "type": "Comment",
            "title": "Comment title",
            "created": "2013-04-16T10:19",
            "content": "Comment text",
            "creator": "<user name>",
            "replies": ["<array of Posts>"]
        }

* users have the following format:

        {
            "id": "halo123",
            "email": "halo123@example.com",
            "type": "User",
            "first_name": "Frank",
            "last_name": "Foster"
        }

* questions have the following format:

        {
            "id": "123abc",
            "type": "Question",
            "body": "Question body",
            "creator": "not shown",
            "type": "list|textual",
            "answer": {
                "id": "5678",
                "body": "Answer body",
                "annotations": ["<not shure if annotations are shown in SN>"]
            }
        }

