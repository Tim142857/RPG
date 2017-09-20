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
                return res.view('homepage', {idPlayer: req.session.user.id, map: map});
            }
        })

    },
    loadPlayers: function (req, res) {
        var newSocket = sails.sockets.getId(req);
        User.update({id: req.session.user.id}, {socket: newSocket}).exec(function afterwards(err, updated) {
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
        user.coordX = req.param('coordX');
        user.coordY = req.param('coordY');
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
    },
    sendMessage: function (req, res) {
        var message = req.param('message');
        sails.sockets.blast('receiveMessage', {message: message, idUser: req.session.user.id});
    }
};

