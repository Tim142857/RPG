var passport = require('passport');

module.exports = {

    _config: {
        actions: false,
        shortcuts: false,
        rest: false
    },

    login: function (req, res) {
        passport.authenticate('local', function (err, user, info) {
            if ((err) || (!user)) {
                res.redirect('/login');
            } else {
                req.logIn(user, function (err) {
                    if (err) res.send(err);
                    User.findOne({
                        email: user.email
                    }).exec(function (err, finn) {
                        if (err)console.log(err);
                        req.session.user = finn;
                    });

                    //redirection vers le jeu après avoir update son état de jeu
                    User.update({id: user.id}, {connected: true}).exec(function afterwars(err, updated) {
                        if (err)console.log(err);
                        res.redirect('/');
                    });

                });
            }
        })(req, res);
    },

    logout: function (req, res) {
        req.logout();
        res.redirect('/');
    }
};
