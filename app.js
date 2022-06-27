var http = require('http');
var url = require('url');
var fs = require('fs');

var express = require('express');
var bodyParser = require('body-parser')
var app = express();
var jsonParser = bodyParser.json()
app.use(bodyParser.urlencoded({ extended: true }));
var path = require('path');
var router = express.Router();
var moment = require('moment');

var users_details = JSON.parse(fs.readFileSync('./data/users.json', 'utf8'));

const products = JSON.parse(fs.readFileSync('./data/products.json', 'utf8'));
const orders = JSON.parse(fs.readFileSync('./data/orders.json', 'utf8'));
const customers = JSON.parse(fs.readFileSync('./data/customers.json', 'utf8'));

var processed_orders = [];
orders.forEach(function (order) {
    var shippingAddress;
    customers.forEach(function (customer){
        if(order.buyer == customer.name){
            shippingAddress = customer.address;
        }
            })
    order.items.forEach(function (item) {
          let product_id;
          products.forEach(function (product){
                if(product.name == item.item) {
                    product_id = product.productId
                }
             })
          var obj = {
              buyer: order.buyer,
              productId: product_id,
              quantity: item.quantity,
              shippingAddress: shippingAddress,
              shippingTarget: moment(order.shippingDate + ' ' +order.shippingTime, "YYYY/MM/DD HH:mm")
          }
          processed_orders.push(obj)
    })
})

router.get(['/', '/login'], function(req, res) {
    res.sendFile(path.join(__dirname+'/static/login.html'));
})

router.post('/auth', jsonParser, function(req, res){

    const user_id = req.body.username
    const password = req.body.password

    if (user_id === "" || password === "") {
        console.log(`Error: empty fields found`);
        res.status(404).json({
            Error: {
                message: `empty fields found`
            }
        });
    } else {
        let flag = false;
        for (let users of users_details) {
            if (users.username == user_id) {
                if (users.password == password) {
                    flag = true ;
                }
            }
        }
        if (flag ==  true) {
            res.sendFile(path.join(__dirname+'/static/home.html'));
        } else {
            res.sendFile(path.join(__dirname+'/static/login.html'));
        }

    }
})

router.get('/show', function(req, res) {
    res.sendFile(path.join(__dirname+'/static/show.html'))
})

router.get('/upload', function(req, res) {
    res.sendFile(path.join(__dirname+'/static/upload.html'))
})

router.get('/showjson', function(req, res) {
    res.json(processed_orders);
})

router.get('/search', function(req, res) {
    if ( req.query.productId) {
        var orders = []
        processed_orders.forEach(function(order){
            if (order.productId == req.query.productId) {
                orders.push(order);
            }
        })
        res.result = orders;
    }
    res.sendFile(path.join(__dirname+'/static/search.html'))
})

app.use('/', router);
app.listen(process.env.port || 8080);
console.log("Running on port 8080");