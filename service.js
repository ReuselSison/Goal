//declaring dependencies
const express = require('express');
const bodyParser = require("body-parser");
const mysql = require('mysql');
const { json } = require('body-parser');
const  request = require('request');

//Initializing variables
var app = express();

//Here we are configuring express to use body-parser as middle-ware.
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    next();
});

var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : '',
    database : 'waterdb',
    multipleStatements: true,
  });
   
  connection.connect(function(err) {
    if (err) {
      console.error('error connecting: ' + err.stack);
      return;
    }
   
    console.log('connected as id ' + connection.threadId);
  });


//Routing url access
app.get('/', function(req, res) {
    res.sendFile(__dirname + "/html/loginpage.html");
});

app.get('/login', function(req, res) {
    res.sendFile(__dirname + "/html/loginpage.html");
});

app.post('/login', function(req, res) {
    var uname = req.body.username;
    var pass = req.body.password;

    connection.query("SELECT userid, firstname, lastname, middlename, birthdate, email FROM `user` WHERE username = ? AND password = ?", [uname, pass] , function(error, result) {
        if (error) {
            console.log(error.message);
            res.json(error);
            res.end();
        }

        if (result.length > 0) {
           res.redirect('/main');
            
        } else {
            res.end('User not found!');
        }
    });
});

app.get('/main', function(req, res){
    res.sendFile(__dirname + '/html/mainpage.html');
});

app.get('/consumerlist', function(req, res) {
   connection.query("SELECT * FROM consumer", function(error, result) {
       if (error) {
           console.log(error.message);
           res.end('Query error');
       }

       if (result.length > 0) {
           res.send(JSON.stringify(result));
           res.sendFile(__dirname + '/html/ConsumerList.html');
       } else {
           console.log('No data found!');
           res.end('No data found');
       }
   }) 
});
app.get('/update', function(req, res){
    res.sendFile(__dirname + '/html/UpdateConsumer.html');
});
app.get('/consumer/detail/:id', function(req, res) {
    var consumerID = req.params.id;

    connection.query("SELECT * FROM consumer WHERE consumerid = ?", [consumerID], function(error, result) {
        if (error) {
            console.log(error.message);
            res.send('Query error');
        }

        if (result.length > 0) {
            res.send(JSON.stringify(result));
        } else {
            console.log('No data found');
            res.send('No data found');
        }
    })
});

app.put('/consumer/edit/:id', function(req, res) {
    var consumerID = req.params.id;
    var firstname = req.body.firstname;
    var lastname = req.body.lastname;
    var middlename = req.body.middlename;
    var email = req.body.email;
    var contactno = req.body.contactno;
    var birthdate = req. body.birthdate;
    var gender = req.body.gender;
    var status = req.body.maritalstatus;
    var address = req.body.address;

    connection.query("UPDATE consumer SET firstname = ?, middlename = ?, lastname = ?, email = ?, contactno = ?, birthdate = ?, gender = ?, maritalstatus = ?, address = ? WHERE consumerid = ?", [firstname, middlename, lastname, email, contactno, birthdate, gender, status, address, consumerID], function(error, result) {
        if (error) {
            console.log(error.message);
            res.send('Query error');
        }

        res.send(JSON.stringify('Successfully updated'));
    })
});

app.delete('/consumer/delete/:id', function(req, res) {
    var consumerID = req.params.id;
    connection.query("DELETE FROM consumer WHERE consumerid = ?", [consumerID]);
    res.send('Successfully deleted data');
})

app.get('/register', function(req, res) {
    res.sendFile(__dirname + '/html/customerregistration.html');
});

app.post('/register', function(req, res) {
    var firstname = req.body.firstname;
    var middlename = req.body.middlename;
    var lastname = req.body.lastname;
    var email = req.body.email;
    var birthdate = req.body.birthdate;
    var contactno = req.body.contactno;
    var gender = req.body.gender;
    var status = req.body.status;
    var address =req.body.address;
    

    connection.query("INSERT INTO `consumer`(`firstname`, `middlename`, `lastname`, `email`, `contactno`, `birthdate`, `gender`, `maritalstatus`, `connectiontype`, `createddate`, `createdby`,`address`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?, ?)", [firstname, middlename, lastname, email, contactno, birthdate, gender, status, 1, 1, address], function(error, result) {
        if (error) {
            console.log(error.message);
            res.end('Query error');
        }
        res.redirect('/main');
    });
});

app.get('/usagesearch', function(req,res){
    var consumerID = req.body.consumerid;
    console.log(consumerID);
    
    connection.query("SELECT `consumerid`, `firstname`, `middlename`, `lastname`, `latestwaterusage` FROM `consumer` WHERE `consumerid` = ? ", [consumerID], function(error, result){
        if (error) {
            console.log(error.message);
            res.end('Query error');
        }
        if (result.length > 0) {
            res.send(JSON.stringify(result));
        } else {
            console.log('No data found');
            res.send('No data found');
        }
    })
});
app.get('/entry', function(req, res) {
    res.sendFile(__dirname + '/html/usageentry.html');
});
app.post('/usageEntry', function(req, res){
    var consumerID = req.body.consumerid;
    var consumptiondate = req.body.consumptiondate;
    var lastwaterusage = req.body.pastwaterusage;
    var currentusage =  req.body.waterusage;
    
   
    connection.query("INSERT INTO `consumption`(`consumerid`, `consumptiondate`, `pastwaterusage`, `consumptionrate`, `ispaid`, `createdby`, `createddate`, `waterusage`) VALUES (?, ?, ?, ?, ?, ?, now(), ?)", 
    [consumerID, consumptiondate, lastwaterusage, 3, 0, 1, currentusage], function(error, result){
        if (error) {
            console.log(error.message);
            res.end('Query error');
        }
        connection.query("UPDATE consumer SET latestwaterusage = ? WHERE consumerid = ?", [currentusage, consumerID], function(error,result){
            if (error) {
                console.log(error.message);
                res.end('Query error');
            }
        })
        console.log('Success');
        res.send(JSON.stringify('Successfully saved data!'));
    });
});
app.get('/searchpayment', function(req,res){
    var consumerID = req.query.consumerid;

    connection.query("select consumptionid, consumerid, consumptiondate as past, waterusage as pastusage from consumption where consumerid = ? and ispaid = 1 order by consumptionid desc limit 1; select consumptionid, consumptiondate as current, waterusage as currentusage from consumption where consumerid = ? and ispaid != 1 order by consumptionid desc limit 1", 
    [consumerID, consumerID], function(error,result){
        if (error) {
            console.log(error.message);
            res.end();
        }
        if (result.length > 0 ){
            var result1 = result[0];
            var result2 = result[1];
            var cid = result1[0].consumerid; 
            var lastid = result1[0].consumptionid;
            var pastdate = result1[0].past;
            var pastusage = result1[0].pastusage;
            var currentdate = result2[0].current;
            var currentusage = result2[0].currentusage;
            var currentid = result2[0].consumptionid;
            var amounttopay = ((currentusage - pastusage) * 3); // 3 is just a static cubic meter value.

            var data = Array({
                consumerid: cid,
                lastdatepaid: pastdate,
                lastusage: pastusage,
                currentdatetopay: currentdate,
                currentusagetopay: currentusage,
                amounttopay: amounttopay,
                currentid: currentid,
            });
            res.send(JSON.stringify(data));
        }else {
            console.log('No data found!');
            res.end('No data found');
        }

    });
});
app.get('/payment', function(req, res) {
    res.sendFile(__dirname + '/html/Payment.html');
});
app.post('/payment', function(req, res){
    var consumerID = req.body.consumerid;
    var lastwaterusage = req.body.lastwaterusage;
    var currentusage =  req.body.currentwaterusage;
    var totalamount = req.body.totalamount;
    var amountreceive = req.body.amountreceive;
    var paymentchange = req.body.paymentchange;
    var currentid = req.body.currentid;
    
    connection.query("INSERT INTO `payment`(`consumerid`, `lastwaterusage`, `currentwaterusage`, `totalamount`, `amountreceive`, `paymentchange`, `createdby`, `createddate`) VALUES (?, ?, ?, ?, ?, ?, ?, now())", 
    [consumerID, lastwaterusage, currentusage, totalamount, amountreceive, paymentchange, 1], function(error, result){
        if (error) {
            console.log(error.message);
            res.end('Query error');
        }
        connection.query("UPDATE consumption SET ispaid = 1 WHERE consumerid = ? AND consumptionid <= ?", [consumerID, currentid], function(error,result){
            if (error) {
                console.log(error.message);
                res.end('Query error');
            }
        })
        console.log('Success');
        res.send(JSON.stringify('Successfully saved data!'));
    });
});
//setting port to be used.
app.listen(3906, function(){
    console.log('Service running in port 3906');
})