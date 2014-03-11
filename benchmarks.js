var MongoClient = require('mongodb').MongoClient,
	numberOfElements=10,
	redis = require("redis"), 
	client = redis.createClient(),
	mysql = require('mysql'),
	Memcached = require('memcached'), 
	stdio = require('stdio'),
	memcached = new Memcached('localhost:11211');

var options = stdio.getopt({
	query_count: {key: 'n', args: 1, description: 'le nombre de ligne a insere'}
});

numberOfElements = options.query_count;


memcached.del({}, function(err){
   memcachedWrite();
});

function memcachedWrite(){
   console.time('memcachedWrite'); 
   for (var i = 0; i < numberOfElements; i++) { 
      memcached.set(i, 'memcached value ' + i, 10, function (err) {
         if( --i === 0){
	    console.timeEnd('memcachedWrite');
	    memcachedRead();
	 }
      });
   }
}

function memcachedRead(){
   console.time('memcachedRead');
   for (var i = 0; i < numberOfElements; i++) { 
      memcached.get(i, function (err, data) {
         if(--i === 0){
	    console.timeEnd('memcachedRead');
	 }
      });
   }
}

var mysql_client =  mysql.createConnection({
	host: 'localhost',
	user: 'root',
	password: 'massilia',
	port: 3306,
	database: 'key_value'
});

mysql_client.connect();

mysql_client.query('truncate table my_table', function(err, results, fields){
  if(err){
    console.log('error with mysql');
  }
  mysqlWrite(mysql_client);
});

function mysqlWrite(mysql_client){
  console.time('mysqlWrite'); 
  for (var i = 0; i < numberOfElements; i++) {
    var  sql = "insert into my_table(cle, valeur) ('" + i + "','une valeur: " + i + "')";	
    mysql_client.query(sql,	function(err, results, fields) { 
      if(--i === 0){ 
	console.timeEnd('mysqlWrite'); 
        mysqlRead(mysql_client);
      }      
    }); 
  } 
}


function mysqlRead(mysql_client){
  console.time('mysqlRead'); 
  for (var i = 0; i < numberOfElements; i++) {
    var  sql = "select * from my_table where cle='" + i + "'";	
    mysql_client.query(sql, function(err, results, fields) { 
      if(--i === 0){ 
   	 console.timeEnd('mysqlRead'); 
      }      
    }); 
  }
}


MongoClient.connect('mongodb://127.0.0.1:27017/test', function(err, db) { 
  var collection = db.collection('perfomance'); 
  collection.remove({}, function(err) { 
    mongoWrite(collection,db); 
  }); 
}) 
 
 
function mongoWrite(collection,db){ 
  console.time('mongoWrite'); 
  for (var i = 0; i < numberOfElements; i++) { 
    collection.insert({id:i,value:"some fantastic value " + i}, function(err, docs) { 
      if(--i === 0){ 
        console.timeEnd('mongoWrite'); 
        mongoRead(collection,db); 
      }      
    }); 
  }; 
} 
 
 
function mongoRead(collection,db){ 
     console.time('mongoRead'); 
     for (var i = 0; i < numberOfElements; i++) { 
         collection.findOne({id:i},function(err, results) { 
         if(--i === 0){ 
             console.timeEnd('mongoRead'); 
             db.close(); 
         } 
         }); 
     } 
}



client.del({},function(err,reply){ 
    redisWrite(); 
}); 
 
function redisWrite () { 
    console.time('redisWrite'); 
    for (var i = 0; i < numberOfElements; i++) { 
        client.set(i, "redis value " + i,function(err,data){ 
            if (--i === 0) { 
                console.timeEnd('redisWrite'); 
                redisRead(); 
            } 
        }); 
    }; 
} 
 
function redisRead(){ 
    client = redis.createClient(); 
    console.time('redisRead'); 
    for (var i = 0; i < numberOfElements; i++) { 
        client.get(i, function (err, reply) { 
            if (--i === 0) { 
                console.timeEnd('redisRead'); 
            } 
        }); 
    } 
} 
