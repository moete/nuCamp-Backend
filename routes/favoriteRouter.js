const express = require('express');
const authenticate = require('../middelwares/authentificate');
const cors = require('./cors');
const Favorite = require('../models/favorite');
const favoriteRouter = express.Router();


favoriteRouter.route('/')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({user: req.user._id})
    .then(favorite => {  //".then" chain modified for integration
        if (!favorite) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json({'exists': false}); 
        } else {
            Favorite.findById(favorite._id)
            .populate('campsites')
            .then(favorite => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json({'exists': true, 'campsites': favorite.campsites});
            })
            .catch(err => next(err));
        }
    })
    .catch(err => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({user: req.user._id })
    .then(favorite => { //result of the "findOne" is named "favorite"
        if (favorite) { //if there is a Favorite document for the user
           req.body.forEach( reqCampsite => { //Take each object in the req.body array and assign it to "reqCampsite" and perform the inner if statement on it
               if (!favorite.campsites.includes(reqCampsite._id)) { //Enter the "if" if the ".campsites" array in the "favorite" document for the user does NOT (!) include the "_id" property of the object in the "req.body" array (which has been renamed "reqCampsite") 
                   favorite.campsites.push(reqCampsite._id) //Add the "_id" to the "campsites" array in the "favorite" document.
                   favorite.save()//save updated array to MongoDB
                   .then(favorite => {
                        favorite.populate('campsites')
                        .then(favorite => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(favorite); //send the "favorite" back to the client
                        })
                        .catch(err => next(err));
                    })
                    .catch(err => next(err));
               } else { //return an error if all the campsites in the request body object are already in the array.
                    err = new Error(`All Campsites are already in list of favorites!`); 
                    err.status = 404;
                    return next(err);
               }
           })
        } else {//create a favorite document for the user & add campsite IDs from req body to campsites
            new Favorite({user: req.user._id, campsites: req.body})
            .save()
            .then(favorite => {
                favorite.populate('campsites')
                .then(favorite => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorite);
                })
                .catch(err => next(err));
            })
            .catch(err => next(err));
        }
    })
    .catch(err => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end(`PUT operation not supported on /favorites`);
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOneAndDelete({user: req.user._id})
    .then(favorite => {
        res.statusCode = 200;
        if (favorite) {
            res.setHeader('Content-Type', 'application/json');
            res.json(favorite);  
        } else {
            res.setHeader('Content-Type', 'text/plain');
            res.end('You do not have any favorites to delete.');
        }
    })
    .catch(err => next(err));
})


favoriteRouter.route('/:campsiteId')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end(`GET operation not supported on /favorites/${req.params.campsiteId}`);
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({user: req.user._id})
    .then(favorite => {
        if (favorite) {//if a favorite document for that user was found
            if (favorite.campsites.includes(req.params.campsiteId)) {//check the campsite array to see if it contains the campsiteId from the URL
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json({'exists': true, 'campsites': favorite.campsites}); //This response is formatted specifically to communicate with the React Client's code for favorites
            } else {//if URL is not in array, add it, save it, return it
                favorite.campsites.push({"_id": req.params.campsiteId});
                favorite.save()//save updated document with the updated array to MongoDB
                .then(favorite => {
                    Favorite.findById(favorite._id)
                    .populate("campsites")
                    .then(favorite => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json({'exists': true, 'campsites': favorite.campsites});
                    })
                    .catch(err => next(err));    
                })
                .catch(err => next(err));
            }
        } else {//If there is no favorite document create a new favorite & add the campsite
            Favorite.create({ user: req.user._id, campsites: [req.params.campsiteId] })
            .then(favorite => {
                Favorite.findById(favorite._id)
                .populate('campsites')
                .then(favorite => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json({'exists': true, 'campsites': favorite.campsites});
                })
                .catch(err => next(err));
            })
            .catch(err => next(err));
        }
    })
    .catch(err => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end(`PUT operation not supported on /favorites/${req.params.campsiteId}`);
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({user: req.user._id}) //look for a Favorite document for the particular user
    .then(favorite => { //If there is a Favorite document, it is passed into the "then" as "favorite" 
        if (favorite) {
            favorite.campsites = favorite.campsites.filter(fav => {
                return fav.toString() !== req.params.campsiteId;
            });
            if (favorite.campsites.length < 1) { // no more favorites
                Favorite.findByIdAndDelete(favorite._id)
                .then(favorite => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json({'exists': false});
                })
                .catch(err => next(err));
            } else {
                favorite.save()
                .then(favorite => {
                    Favorite.findById(favorite._id)
                    .populate('campsites')
                    .then(favorite => {
                        console.log('Favorite Campsite Deleted!', favorite);
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json({'exists': true, 'campsites': favorite.campsites});
                    }).catch(err => next(err));
                }).catch(err => next(err));
            }
        } else {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json({'exists': false});
        }
    }).catch(err => next(err))
});

module.exports = favoriteRouter