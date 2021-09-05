const express = require('express');
const Promotion = require('../models/promotion');
const promotionRouter = express.Router();

promotionRouter.route('/promotions')
    .all((req, res, next) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/plain');
        next();
    })
    .get((req, res) => {
        Promotion.find()
        .then(partner => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(partner);
        })
    })
    .post((req, res) => {
        Promotion.create(req.body)
            .then()(partner => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(partner);
            })
            .catch(err => next(err))
    })
    .put((req, res) => {
        res.statusCode = 403;
        res.end('PUT operation not supported on /promotions');
    })
    .delete((req, res) => {
        Promotion.deleteMany()
        .then(response => {
            res.statusCode = 200; 
            res.setHeader('Content-Type', 'application/json'); 
            res.json(response); 
        })
        .catch(err => next(err)); 
    });

module.exports = promotionRouter ;
