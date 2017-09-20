/**
 * Map.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

    attributes: {
        name: {
            type: 'string',
            required: true,
            defaultsTo: 'map'
        },
        objects: {
            collection: 'objectMap',
            via: 'map'
        },
        width: {
            type: 'integer',
            required: true
        },
        height: {
            type: 'integer',
            required: true
        },
        defaultObject: {
            model: 'objectMap'
        }
    }
};

