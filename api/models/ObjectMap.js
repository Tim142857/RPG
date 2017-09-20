/**
 * ObjectMap.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

    attributes: {
        name: {
            type: 'string',
            required: true
        },
        coordX: {
            type: 'integer'
        },
        coordY: {
            type: 'integer'
        },
        reachable: {
            type: 'boolean',
            required: true,
            defaultsTo: false
        },
        width: {
            type: 'integer',
            required: true,
            defaultsTo: 1
        },
        height: {
            type: 'integer',
            required: true,
            defaultsTo: 1
        },
        numFirstImage: {
            type: 'integer',
            required: true
        },
        map: {
            model: 'map'
        }

    }
};

