import bottle
import json
from bottle import route, post, get, put, run, request, static_file
#################################
users = {}
users['1'] = json.loads(
'{"_id" : "1", "name" : "Bio. med. expert 1", "email": "bar@foo.com", "img" : "http://placehold.it/100x100&text==(", "description" : "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas posuere ipsum eget mauris ultricies consequat. Maecenas rhoncus commodo venenatis." }'
)
users['2'] = json.loads(
'{"_id" : "2", "name" : "Bio. med. expert 2", "email": "foo@bar.com", "img" : "http://placehold.it/100x100&text==)", "description" : "Lorem ipsum dolor sit amet..." }'
)
#################################
questions = {}
questions['1'] = json.loads(
'{"_id" : "1", "body": "Are CNEs particularly enriched in gene deserts?", "type": "yes/no", "creatorID": ' + users['1']['_id'] + ', "creator" : "' + users['1']['name'] + '", "date": "2013-02-26", "comments": [1,2] , "rank": 42 , "answer" : "yes", "ideal" : "more details"}'
)
questions['2'] = json.loads(
'{"_id" : "2", "body": "Are CNEs particularly enriched in gene deserts?", "type": "yes/no", "creatorID": ' + users['2']['_id'] + ', "creator" : "' + users['2']['name'] + '", "date": "2013-02-27", "comments": [3,4,5] , "rank": 13, "answer" : "no", "ideal" : "more details"}'
)
#################################
comments = {}
comments['1'] = json.loads(
'{"_id" : "1", "creator": '+json.dumps(users['2']) +', "comment": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas posuere ipsum eget mauris ultricies consequat. Maecenas rhoncus commodo venenatis."}'
)
comments['2'] = json.loads(
'{"_id" : "2", "creator": '+json.dumps(users['1']) +', "comment": "Lorem ipsum dolor sit amet..."}'
)

#################################
following = {}
following['1'] = json.loads(
'['+
json.dumps(users['2']) +','+
json.dumps(questions['2']) +
']')

following['2'] = json.loads(
'['+
json.dumps(users['1']) +','+
json.dumps(questions['1']) +','+ 
json.dumps(questions['2']) +
']')
#################################
followers = {}
followers['1'] = json.loads(
'['+
json.dumps(users['2']) +
']')

followers['2'] = json.loads(
'['+
json.dumps(users['1']) +
']')
#################################
userComments = {}
userComments['1'] = json.loads(
'['+
json.dumps(comments['1']) +
']')

userComments['2'] = json.loads(
'['+
json.dumps(comments['2']) +
']')
#################################
@get('/following/:id')
def userFollowing(id):
    global following
    return json.dumps(following[id])

@get('/followers/:id')
def userFollowers(id):
    global followers
    return json.dumps(followers[id])

@get('/comments/:id')
def userFollowers(id):
    global userComments
    return json.dumps(userComments[id])

@get('/users/:id')
def usersRes(id):
    global users
    return '[' + json.dumps(users[id]) + ']'

@get('/questions/:id')
def questionsRes(id):
    global questions
    return '[' + json.dumps(questions[id]) + ']'

@get('/questions')
def questionsRes():
    global questions
    return json.dumps(questions)

data = 0
@post('/vote/:id')
def voteRes(id):
    global data 
    global questions

    dir = str(request.forms.get('dir'))
    
    if dir == 'up':
        questions[id]['rank'] =  int(questions[id]['rank']) + 1
    if dir == 'down':
        questions[id]['rank'] =  int(questions[id]['rank']) - 1

    return str(data)
   
@route('/:filename#.*#')
def send_static(filename):
    return static_file(filename, root='./')


bottle.debug(True) 
run(host='localhost', port=8000)