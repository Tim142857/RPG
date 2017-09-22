/**
 * DefaultController
 *
 * @description :: Server-side logic for managing defaults
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
    index: function (req, res) {

        Map.findOne({id: 1}).populate('objects').populate('defaultObject').exec(function (err, map) {
            if (err) {
                console.log(err);
            } else {
                User.findOne({id: req.session.user.id}).exec(function (err, user) {
                    if (err)console.log(err);

                    req.session.user = user;
                    return res.view('homepage', {idPlayer: req.session.user.id, map: map});
                });
            }
        })

    },
    loadPlayers: function (req, res) {
        var newSocket = sails.sockets.getId(req);
        User.update({id: req.session.user.id}, {
            connected: true,
            socket: newSocket
        }).exec(function afterwards(err, updated) {
            if (err)console.log(err);
        });

        //Envoi du nouveau joueurs aux autres
        sails.sockets.blast('newPlayer', req.session.user, req);

        var players = [];
        players.push(req.session.user);
        User.find({
            connected: true,
            id: {'not': req.session.user.id}
        }).exec(function (err, records) {
            if (err)console.log(err);
            if (records.length == 0) {
                // console.log('nbPlayers: ' + players.length);
                res.send(players);
            } else {
                for (var i = 0; i < records.length; i++) {
                    players.push(records[i]);
                    if (i == records.length - 1) {
                        // console.log('nbPlayers: ' + players.length);
                        res.send(players);
                    }
                }
            }
        });
    },
    move: function (req, res) {
        var user = req.session.user;
        var x = req.param('coordX');
        var y = req.param('coordY');

        Map.findOne({id: 1}).exec(function (err, map) {
            if (err)console.log(err);
            if (!sails.controllers.default.verifCoord(x, y, map)) {
                res.send({success: false});
            } else {
                user.coordX = x;
                user.coordY = y;
                user.direction = req.param('direction');
                req.session.user = user;
                User.update({id: req.session.user.id}, {
                    direction: user.direction,
                    coordX: user.coordX,
                    coordY: user.coordY
                }).exec(function afterwards(err, updated) {
                    if (err)console.log(err);
                });
                sails.sockets.blast('playerMoved', user);
                res.send({success: true});
            }
        });
    },
    sendMessage: function (req, res) {
        var message = req.param('message');
        sails.sockets.blast('receiveMessage', {message: message, idUser: req.session.user.id});
    },

    verifCoord: function (x, y, map) {
        var myBool = (x >= 0 && y >= 0 && x <= map.width && y <= map.height);
        return myBool;
    }
};

