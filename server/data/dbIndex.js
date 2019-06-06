db.getCollection('authorities').createIndex({'code':1},{'unique':true});
db.getCollection('roles').createIndex({'code':1},{'unique':true});
db.getCollection('users').createIndex({'account':1},{'unique':true});
