$(document).ready(function () {
    io.socket.on('connect', function () {
        var map, canvasMap, ctx, joueur;
        var modeChat = false;
        var canvasEntities, ctx2;
        var timeLoop = 40;
        var timeBeforeInitMap = 5000;
        var mapInitialised = false;

        var jsonMap = [];
        for (var l = 0; l < arrayMap.height; l++) {
            var line = [];
            for (var c = 0; c < arrayMap.width; c++) {
                line.push(arrayMap.defaultObject.numFirstImage);
            }
            jsonMap.push(line);
            if (l == (arrayMap.height - 1)) {

                for (var i = 0; i < arrayMap.objects.length; i++) {
                    var elm = arrayMap.objects[i];
                    var objectX = elm.coordX;
                    var objectY = elm.coordY;
                    for (var k = objectX; k <= elm.height + 1; k++) {
                        for (var m = objectY; m <= elm.width + 1; m++) {
                            jsonMap[k][m] = elm.numFirstImage + (m - objectX) + ((k - objectX) * 5);
                        }
                    }
                }
            }
        }


        var initialisationCanvas = function () {
            map = new Map("premiere", jsonMap);
            canvasMap = document.getElementById('canvasMap');
            ctx = canvasMap.getContext('2d');
            canvasMap.width = map.getLargeur() * 32;
            canvasMap.height = map.getHauteur() * 32;

            canvasEntities = document.getElementById('canvasEntities');
            ctx2 = canvasEntities.getContext('2d');
            canvasEntities.width = map.getLargeur() * 32;
            canvasEntities.height = map.getHauteur() * 32;

            setTimeout(function () {
                map.initMap(ctx);
                mapInitialised = true;
                console.log('init map');
            }, 5000);
        }

        var beginChat = function () {
            modeChat = true;
            $('#inputChat').removeClass('hidden');
            $('#inputChat').focus();
        }

        setInterval(function () {
            if (mapInitialised) {
                console.log('map initialised!')
                map.update(ctx2, canvasEntities);
            }
        }, timeLoop);

        initialisationCanvas();


        io.socket.get('/loadPlayers', null, function (players, jwres) {
            console.log('load players');
            players.forEach(function (elm, index) {
                if (index == 0) {
                    joueur = new Personnage("exemple.png", elm.coordX, elm.coordY, elm.direction, elm.name, elm.id);
                    map.addPersonnage(joueur);
                } else {
                    map.addPersonnage(new Personnage("exemple.png", elm.coordX, elm.coordY, elm.direction, elm.name, elm.id));
                }
            });
        });

        io.socket.on('playerMoved', function (user) {
            var player = map.personnages.find(function (elm) {
                return elm.id == user.id;
            });
            // player.x = user.coordX;
            // player.y = user.coordY;
            player.direction = user.direction;
            player.deplacer(user.direction, map);
        });

        io.socket.on('newPlayer', function (user) {
            alert('Bienvenue ' + user.name);
            map.addPersonnage(new Personnage("exemple.png", user.coordX, user.coordY, user.direction, user.name, user.id));
        });

        io.socket.on('receiveMessage', function (data) {
            map.personnages.forEach(function (elm, index) {
                if (elm.id == data.idUser) {
                    elm.message = data.message;

                }
            })
            setTimeout(function () {
                map.personnages.forEach(function (elm, index) {
                    if (elm.id == data.idUser) {
                        elm.message = '';
                    }
                })
            }, 3000);
        });

        io.socket.on('removePlayer', function (user) {
            alert('Aurevoir ' + user.name);
            var indexToRemove = null;
            map.personnages.forEach(function (elm, index) {
                if (elm.id == user.id) {
                    indexToRemove = index;
                }
            })
            map.personnages.splice(indexToRemove, 1);
        });

        // Gestion du clavier
        window.onkeydown = function (event) {
            // On récupère le code de la touche
            var e = event || window.event;
            var key = e.which || e.keyCode;

            if (modeChat) {
                return true;
            } else {
                switch (key) {
                    case 38 :
                    case 122 :
                    case 119 :
                    case 90 :
                    case 87 : // Flèche haut, z, w, Z, W
                        joueur.deplacer(DIRECTION.HAUT, map);
                        break;
                    case 40 :
                    case 115 :
                    case 83 : // Flèche bas, s, S
                        joueur.deplacer(DIRECTION.BAS, map);
                        break;
                    case 37 :
                    case 113 :
                    case 97 :
                    case 81 :
                    case 65 : // Flèche gauche, q, a, Q, A
                        joueur.deplacer(DIRECTION.GAUCHE, map);
                        break;
                    case 39 :
                    case 100 :
                    case 68 : // Flèche droite, d, D
                        joueur.deplacer(DIRECTION.DROITE, map);
                        break;
                    case 32 : //Espace
                        DUREE_DEPLACEMENT = 6;
                        break;
                    case 84 : //T
                        beginChat();
                        break;
                    default :
                        // Si la touche ne nous sert pas, nous n'avons aucune raison de bloquer son comportement normal.
                        return true;
                }
            }
            return false;
        }

        //sprint avec touche espace
        window.onkeyup = function (event) {
            var e = event || window.event;
            var key = e.which || e.keyCode;


            switch (key) {
                case 32 : //Espace
                    DUREE_DEPLACEMENT = 12;
                    break;
                default :
                    return true;
            }
            return false;
        }


        $('#formChat').submit(function (e) {
            e.preventDefault();
            var message = $('#inputChat').val();
            io.socket.get('/sendMessage', {message: message}, function (res, jwres) {
            });
            $('#inputChat').addClass('hidden');
            $('#inputChat').val('');
            modeChat = false;
        });

    })
});