var cluster = require('cluster'),
    fs = require('fs'),
    multiparty = require('multiparty'),
    md5 = require('md5'),
    db = require('./db');

//db.init();

if(cluster.isMaster) {
    var numWorkers = require('os').cpus().length;

    console.log('Master cluster setting up ' + numWorkers + ' workers...');

    for(var i = 0; i < numWorkers; i++) {
        cluster.fork();
    }

    cluster.on('online', function(worker) {
        console.log('Worker ' + worker.process.pid + ' is online');
    });

    cluster.on('exit', function(worker, code, signal) {
        console.log('Worker ' + worker.process.pid + ' died with code: ' + code + ', and signal: ' + signal);
        console.log('Starting a new worker');
        cluster.fork();
    });
} else {

    var app = require('express')();

    function defaultContentTypeMiddleware (req, res, next) {
      req.headers['content-type'] = req.headers['content-type'] || 'multipart/form-data; boundary=------WebKitFormBoundaryD3KHhU1Bfd6hx1Ju';
      req.headers['boundary'] = req.headers['boundary'] || '------WebKitFormBoundaryD3KHhU1Bfd6hx1Ju';
      next();
    }
    app.use(defaultContentTypeMiddleware);

    app.all('/', function(req, res) {
      res.send('process ' + process.pid + ' says hello!').end();
    })


    app.all('/img', function(req, res) {
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader('Access-Control-Allow-Headers',
                'Authorization, Content-Type, Origin, api_key, X-Requested-With, ' +
                'X-Auth-Token, token, Accept, X-PINGOTHER, boundary');
      res.setHeader("Accept", "text/html, text/plain, application/xml, application/json, multipart/form-data, */*");


     var userIP = req.headers['x-forwarded-for'] ||
       req.connection.remoteAddress ||
       req.socket.remoteAddress ||
       req.connection.socket.remoteAddress;
    
      var form = new multiparty.Form();
      form.autoFields = true;

      //form.on('close', function() { console.log('Form close'); });

      form.on('error', function(err) {
        //res.send({'result':false, 'error': err.stack}).end();
        console.log('Error form: ' + err.stack);
      });


      form.on('file', function(name, file) {
        var newFile = {};
        console.log('Input file: ' + file.originalFilename);
        //получим имя файла, созданное при загрузке
        //вытасикиваем имя из path путём обрезания строки
        newFile.name =  file.path.substr(
          file.path.lastIndexOf('/') + 1,
          (file.path.length - file.path.lastIndexOf('/'))
        );
        //читаем формат файла
        var format =  file.path.substr(
          file.path.lastIndexOf('.'),
          (file.path.length - file.path.lastIndexOf('.'))
        );
        //результирующее имя файла будет состоять из ip пользователя
        // и имени файла, которое он получил при загрузке
        // и всё захешированное в md5
        newFile.name = md5(newFile.name + userIP) + format;
        newFile.userip = userIP;

        newFile.path = './public/uploads/' + newFile.name;
        // переместим файл в папку загрузок
        fs.rename(
            file.path, newFile.path,
            function( err ) {
              console.log(err);
            }
        );

      });

      form.parse(req, function(err, fields, files) {
        ///console.log( files.uploadFile[0].originalFilename + ': ' + files.uploadFile[0].path );
        //console.log({err:err, fields:fields, files:files});
        //res.writeHead(200, {'content-type': 'text/plain'});
        //res.write('received upload:\n\n');
        //res.end(util.inspect({fields: fields, files: files}));
      });
      
      
        res.send({
          'result':'success',
          //'file': newFile
        }).end();
      
      ////////////////////////
    });

    var server = app.listen(8000, function() {
        console.log('Process ' + process.pid + ' is listening to all incoming requests');
    });
}
