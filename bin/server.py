import bottle
import json
import urlparse
import datetime

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
'"comments" : [],' +
'"img" : "http://placehold.it/100x100&text==(",'+
'"description" : "Maecenas posuere ipsum eget mauris ultricies consequat. Maecenas rhoncus commodo venenatis."' +
'}')
users['2'] = json.loads(
'{"id" : "2",'+
'"email": "bar@foo.com",' +
'"type": "User",' +
'"first_name" : "Bio. med.",' +
'"last_name" : "expert 2",' +
'"comments" : [],' +
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
'"questionType": "decisive",' +
'"rank": 42, ' + 
'"created":  "2013-04-16T11:19",' + 
'"modified": "2013-05-16T11:19",' + 
'"comments" : [],' +
'"answer":{'+
    '"id": "31", ' +
    '"body": "Yes, CNEs are most often found in gene-poor regions termed gene deserts. There, they often form dense clusters.\\n\\n\\n\\n\\n", ' +
    '"annotations":["<not sure if annotations are shown in SN>"]' + 
    '}' +
'}')
questions['4'] = json.loads(
'{"id" : "4",' +
'"type": "Question",' +
'"body": "What is currently the disease with the highest mortality rate in western countries?",' +
'"creator_first_name": "' + users['2']['first_name'] + '",' + 
'"creator_last_name": "' + users['2']['last_name'] + '",' + 
'"creator_id": "' + users['2']['id'] + '",' + 
'"questionType": "factoid",' +
'"rank": 1337, ' + 
'"created":  "2012-04-16T11:19",' + 
'"modified": "2012-05-16T12:49",' + 
'"comments" : [],' +
'"answer":{'+
    '"id": "41", ' +
    '"body": "The disease with the highest mortality rate.", '+
    '"annotations":["<not sure if annotations are shown in SN>"]'+
    '}' +
'}')
questions['5'] = json.loads(
'{"id" : "5",' +
'"type": "Question",' +
'"body": "What do you know about the H1N1 virus?",' +
'"creator_first_name": "' + users['2']['first_name'] + '",' +
'"creator_last_name": "' + users['2']['last_name'] + '",' +
'"creator_id": "' + users['2']['id'] + '",' +
'"questionType": "summary",' +
'"rank": -13, ' +
'"created":  "2012-04-16T11:19",' +
'"modified": "2012-05-16T12:49",' +
'"comments" : [],' +
'"answer":{'+
    '"id": "51", ' +
    '"body": "Is a subtype of influenza A virus.", '+
    '"annotations":["<not sure if annotations are shown in SN>"]'+ 
    '}' +
'}')
res.append(questions['3'])
res.append(questions['4'])
res.append(questions['5'])
#################################
comments = {}
comments['1'] = json.loads(
'{"id" : "6", ' +
'"type": "Comment",' +
'"title": "Comment title",' +
'"created": "2013-01-16T10:19",' + 
'"modified": "2013-02-16T10:19",' + 
'"creator": ' + json.dumps(users['1']) + ', ' +
'"comments" : [],' +
'"content": "Lorem ipsum dolor sit amet, consectetur adipiscing elit."}'
)
comments['2'] = json.loads(
'{"id" : "7", ' +
'"type": "Comment",' +
'"title": "Comment title",' +
'"created": "2012-03-16T10:19",' + 
'"modified": "2012-04-16T10:19",' + 
'"creator": ' + json.dumps(users['2']) + ', ' +
'"comments" : [],' +
'"content": "Maecenas posuere ipsum eget mauris ultricies consequat. Maecenas rhoncus commodo venenatis."}'
)
comments['3'] = json.loads(
'{"id" : "8", ' +
'"type": "Comment",' +
'"title": "Comment title",' +
'"created": "2012-03-16T10:19",' +
'"modified": "2012-03-18T10:19",' +
'"creator": ' + json.dumps(users['1']) + ', ' +
'"comments" : [],' +
'"content": "Maecenas posuere ipsum eget mauris ultricies consequat. Maecenas rhoncus commodo venenatis."}'
)

#res.append(comments['1'])
#res.append(comments['2'])
#res.append(comments['3'])

#################################
following = {}
following[users['1']['id']] = []
following[users['2']['id']] = []

#################################
followers = {}
followers[users['1']['id']] = []
followers[users['2']['id']] = []

@post('/comment/:id')
def commentRes(id):
    global comments
    global res

    creator = str(request.query.get('creator'))
    if creator == 'None':
        creator = str(request.forms.get('creator'))

    content = str(request.query.get('content'))
    if content == 'None':
        content = str(request.forms.get('content'))

    title = str(request.query.get('title'))
    if title == 'None':
        title = str(request.forms.get('title'))

    comment = json.loads(
        '{'+
        '"id" :"' + str(len(res) + 1) + '" , ' +
        '"type" : "Comment" , ' +
        '"title" : ' + title + ' , ' +
        '"created": "' + str(datetime.datetime.now()) + '" , ' +
        '"creator": ' + json.dumps(users['1']) + ' , ' +
        '"comments" : [ ],' +
        '"content": ' + content +
        '}')

    for r in res:
        if id == r['id']:
            r['comments'].append(comment)
    res.append(comment)

@post('/all')
def timelineRes():
    global res
    return json.dumps(res)

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
def commentsRes(id):
    global res
    for r in res:
        if id == r['id']:
            return json.dumps(r['comments'])
    return '[]'

@get('/users/:id')
def usersRes(id):
    global res
    for r in res:
        if id == r['id'] and 'User' == r['type']:
            return '[' + json.dumps(r) + ']'
    return '[]'

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