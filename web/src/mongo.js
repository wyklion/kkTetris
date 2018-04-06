/**
 * Created by kk on 2016/4/27.
 */

var MongoClient = require('mongodb').MongoClient;
var url = 'mongodb://localhost:27017/tetris';

var Mongo = function(callback){
    var _this = this;
    MongoClient.connect(url, function(err, db) {
        console.log("连接成功！");
        _this.db = db;
        if(callback)
            callback();
    });
};
Mongo.prototype = {
    constructor: Mongo,
    onOpen: function(){

    },
    findOption: function(collection, query, options, callback){
        var c = this.db.collection(collection);
        c.find(query,options).toArray(function(err, result) {
            if(err)
            {
                console.log('Error:'+ err);
                return;
            }
            else
                callback(result);
        });
    },
    find: function(collection, query, callback){
        var c = this.db.collection(collection);
        var sort;
        if(query.sort){
            sort = {sort:query.sort};
            delete query.sort;
        }
        else
            sort = {sort:{}};
        c.find(query,sort).toArray(function(err, result) {
            if(err)
            {
                console.log('Error:'+ err);
                return;
            }
            else
                callback(result);
        });
    },
    createNewUser: function(userId, password, callback){
        this.insertOne("users", {
            id:userId, nick:userId, password: password,
            level:0, score:0,
            win:0, lose:0, disconnect: 0,
            single40Times:0, single40Best:999,
            keyboard: {
                left:37,right:39,down:70,drop:40,rotate:82,rotateRight:69,rotate180:87,hold:84,dasDelay:150,moveDelay:30,
            },
            setting: {
                theme:0,
            }
        }, function(err, result){
            if(callback) callback(err, result);
        })
    },
    insertOne: function(collection, doc, callback){
        var c = this.db.collection(collection);
        c.insertMany([doc], function(err, result) {
            if(callback) callback(err, result);
        });
    },
    insert: function(collection, docs, callback){
        var c = this.db.collection(collection);
        c.insertMany(docs, function(err, result) {
            if(callback) callback(err, result);
        });
    },
    updateOne: function(collection, query, doc, callback){
        var c = this.db.collection(collection);
        c.updateOne(query, {$set: doc}, function(err, result) {
            if(callback) callback(err, result);
        });
    },
    updateAddValue: function(collection, query, doc, callback){
        var c = this.db.collection(collection);
        c.updateOne(query, {$inc: doc}, function(err, result) {
            if(callback) callback(err, result);
        });
    },
}

module.exports = Mongo;
