var bcrypt = require('bcrypt');

module.exports = {
    attributes: {
        name: {
            type: 'string',
            minLength: 3,
            required: true
        },
        coordX: {
            type: 'integer',
            defaultsTo: 10
        },
        coordY: {
            type: 'integer',
            defaultsTo: 10
        },
        connected: {
            type: 'boolean',
            defaultsTo: false
        },
        socket: {
            type: 'string',
            required: false
        },
        direction: {
            type: 'integer',
            defaultsTo: 0
        },
        email: {
            type: 'email',
            required: true,
            unique: true
        },
        password: {
            type: 'string',
            minLength: 3,
            required: true
        },
        toJSON: function () {
            var obj = this.toObject();
            delete obj.password;
            return obj;
        }
    },
    beforeCreate: function (user, cb) {
        bcrypt.genSalt(10, function (err, salt) {
            bcrypt.hash(user.password, salt, function (err, hash) {
                if (err) {
                    console.log(err);
                    cb(err);
                } else {
                    user.password = hash;
                    cb();
                }
            });
        });
    }
};
