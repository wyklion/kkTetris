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
    find: function(collection, query, callback){
        var c = this.db.collection(collection);
        c.find(query).toArray(function(err, result) {
            if(err)
            {
                console.log('Error:'+ err);
                return;
            }
            else
                callback(result);
        });
    },
    insertOne: function(collection, doc, callback){
        var c = this.db.collection(collection);
        c.insertMany([doc], function(err, result) {
            callback(err, result);
        });
    },
    insert: function(collection, docs, callback){
        var c = this.db.collection(collection);
        c.insertMany(docs, function(err, result) {
            callback(err, result);
        });
    }
}

module.exports = Mongo;
