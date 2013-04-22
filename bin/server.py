import bottle
import json
from bottle import route, post, get, put, run, request, static_file
#################################
res = []

users = {}
users['1'] = json.loads(
'{"id" : "1",'+
'"email": "bar@foo.com",' +
'"type": "User",' +
'"first_name" : "Bio. med.",' +
'"last_name" : "expert 1",' +
'"img" : "http://placehold.it/100x100&text==(",'+
'"description" : "Maecenas posuere ipsum eget mauris ultricies consequat. Maecenas rhoncus commodo venenatis."' +
'}')
users['2'] = json.loads(
'{"id" : "2",'+
'"email": "bar@foo.com",' +
'"type": "User",' +
'"first_name" : "Bio. med.",' +
'"last_name" : "expert 2",' +
'"img" : "http://placehold.it/100x100&text==)",'+
'"description" : "Lorem ipsum dolor sit amet, consectetur adipiscing elit."' +
'}')

res.append(users['1'])
res.append(users['2'])
#################################
questions = {}
questions['3'] = json.loads(
'{"id" : "3",' +
'"type": "Question",' +
'"body": "Are CNEs particularly enriched in gene deserts?",' +
'"creator_first_name": "' + users['1']['first_name'] + '",' + 
'"creator_last_name": "' + users['1']['last_name'] + '",' + 
'"creator_id": "' + users['1']['id'] + '",' + 
'"questionType": "textual",' +
'"rank": 42, ' + 
'"created": "2013-04-16T11:19",' + 
'"answer":{'+
    '"id": "5678", ' +
    '"body": "Maecenas posuere ipsum eget mauris ultricies consequat. Maecenas rhoncus commodo venenatis.", ' +
    '"annotations":["<not sure if annotations are shown in SN>"]' + 
    '}' +
'}')
questions['4'] = json.loads(
'{"id" : "4",' +
'"type": "Question",' +
'"body": "Are CNEs particularly enriched in gene deserts?",' +
'"creator_first_name": "' + users['2']['first_name'] + '",' + 
'"creator_last_name": "' + users['2']['last_name'] + '",' + 
'"creator_id": "' + users['2']['id'] + '",' + 
'"questionType": "list",' +
'"rank": 1337, ' + 
'"created": "2012-04-16T11:19",' + 
'"answer":{'+
    '"id": "5678", ' +
    '"body": "yes", '+
    '"annotations":["<not sure if annotations are shown in SN>"]'+ 
    '}' +
'}')
res.append(questions['3'])
res.append(questions['4'])
#################################
comments = {}
comments['5'] = json.loads(
'{"id" : "5", ' +
'"type": "Comment",' +
'"title": "Comment title",' +
'"created": "2013-04-16T10:19",' + 
'"creator": ' + json.dumps(users['2']) + ', ' +
'"replies": ["<array of Posts>"],'
'"content": "Lorem ipsum dolor sit amet, consectetur adipiscing elit."}'
)
comments['6'] = json.loads(
'{"id" : "6", ' +
'"type": "Comment",' +
'"title": "Comment title",' +
'"created": "2012-03-16T10:19",' + 
'"creator": ' + json.dumps(users['2']) + ', ' +
'"replies": ["<array of Posts>"],'
'"content": "Maecenas posuere ipsum eget mauris ultricies consequat. Maecenas rhoncus commodo venenatis."}'
)
res.append(comments['5'])
res.append(comments['6'])

#################################
following = {}
following[users['1']['id']] = []
following[users['2']['id']] = []

#################################
followers = {}
followers[users['1']['id']] = []
followers[users['2']['id']] = []

#################################
userComments = {}
userComments['1'] = json.loads(
'[' +
json.dumps(res[4]) +
']')

userComments['2'] = json.loads(
'[' +
json.dumps(res[5]) +
']')
#################################
@post('/follow/:id')
def followRes(id):
    global following
    global followers

    me = str(request.query.get('who'))
    if me == 'None':
        me = str(request.forms.get('who'))
    id = int(id) - 1
    resID = res[id]['id']

    if not res[id] in following[me]:
        following[me].append(res[id])
        if len(followers) >= int(resID):
            followers[resID].append(res[int(me) - 1])
    else:
        following[me].remove(res[id])
        if len(followers) >= int(resID):
            followers[resID].remove(res[int(me) - 1])
    return json.dumps(following[me])

@get('/following/:id')
def userFollowingRes(id):
    global following
    return json.dumps(following[id])

@get('/followers/:id')
def userFollowersRes(id):
    global followers
    return json.dumps(followers[id])

@get('/comments/:id')
def userCommentsRes(id):
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

@post('/vote/:id')
def voteRes(id):
    global questions

    dir = str(request.query.get('dir'))
    if dir == 'None':
        dir = str(request.forms.get('dir'))

    if dir == 'up':
        questions[id]['rank'] =  int(questions[id]['rank']) + 1
    if dir == 'down':
        questions[id]['rank'] =  int(questions[id]['rank']) - 1

    return '[ { "rank" : ' + str(questions[id]['rank']) + ' } ]'

@get('/login')
def loginRes():
    global users
    return '[' + json.dumps(users['1']) + ']'
   
@route('/:filename#.*#')
def send_static(filename):
    return static_file(filename, root='./')

bottle.debug(True) 
run(host='localhost', port=8000)