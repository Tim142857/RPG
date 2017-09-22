var DIRECTION = {
    "BAS": 0,
    "GAUCHE": 1,
    "DROITE": 2,
    "HAUT": 3
}

var DUREE_ANIMATION = 4;
var DUREE_DEPLACEMENT = 12;

function Personnage(url, x, y, direction, name, id) {
    this.x = x; // (en cases)
    this.y = y; // (en cases)
    this.direction = direction;
    this.etatAnimation = -1;
    this.name = name;
    this.id = id;
    this.message = '';

    // Chargement de l'image dans l'attribut image
    this.image = new Image();
    this.image.referenceDuPerso = this;
    this.image.onload = function () {
        if (!this.complete)
            throw "Erreur de chargement du sprite nommé \"" + url + "\".";

        // Taille du personnage
        this.referenceDuPerso.largeur = this.width / 4;
        this.referenceDuPerso.hauteur = this.height / 4;
    }
    this.image.src = "sprites/" + url;
}

Personnage.prototype.dessinerPersonnage = function (context) {
    var frame = 0; // Numéro de l'image à prendre pour l'animation
    var decalageX = 0, decalageY = 0; // Décalage à appliquer à la position du personnage
    if (this.etatAnimation >= DUREE_DEPLACEMENT) {
        // Si le déplacement a atteint ou dépassé le temps nécéssaire pour s'effectuer, on le termine
        this.etatAnimation = -1;
    } else if (this.etatAnimation >= 0) {
        // On calcule l'image (frame) de l'animation à afficher
        frame = Math.floor(this.etatAnimation / DUREE_ANIMATION);
        if (frame > 3) {
            frame %= 4;
        }

        // Nombre de pixels restant à parcourir entre les deux cases
        var pixelsAParcourir = 32 - (32 * (this.etatAnimation / DUREE_DEPLACEMENT));

        // À partir de ce nombre, on définit le décalage en x et y.
        if (this.direction == DIRECTION.HAUT) {
            decalageY = pixelsAParcourir;
        } else if (this.direction == DIRECTION.BAS) {
            decalageY = -pixelsAParcourir;
        } else if (this.direction == DIRECTION.GAUCHE) {
            decalageX = pixelsAParcourir;
        } else if (this.direction == DIRECTION.DROITE) {
            decalageX = -pixelsAParcourir;
        }

        // On incrémente d'une frame
        this.etatAnimation++;
    }
    /*
     * Si aucune des deux conditions n'est vraie, c'est qu'on est immobile,
     * donc il nous suffit de garder les valeurs 0 pour les variables
     * frame, decalageX et decalageY
     */

    context.drawImage(
        this.image,
        this.largeur * frame, this.direction * this.hauteur, // Point d'origine du rectangle source à prendre dans notre image
        this.largeur, this.hauteur, // Taille du rectangle source (c'est la taille du personnage)
        // Point de destination (dépend de la taille du personnage)
        (this.x * 32) - (this.largeur / 2) + 16 + decalageX, (this.y * 32) - this.hauteur + 24 + decalageY,
        this.largeur, this.hauteur // Taille du rectangle destination (c'est la taille du personnage)
    );
    //Ajout du pseudo au dessus
    context.font = "20px Arial";
    context.strokeText(this.name, (this.x * 32) - (this.largeur / 2) + 16 + decalageX, (this.y * 32) - this.hauteur + 24 + decalageY - 4);

    if (this.message != '') {
        var x = (this.x * 32) - (this.largeur / 2) + 16 + decalageX;
        var y = (this.y * 32) - this.hauteur + decalageY - 100;
        drawTextBG(context, this.message, "20px Georgia", x, y);
    }
}

Personnage.prototype.getCoordonneesAdjacentes = function (direction) {
    var coord = {'x': this.x, 'y': this.y};
    switch (direction) {
        case DIRECTION.BAS :
            coord.y++;
            break;
        case DIRECTION.GAUCHE :
            coord.x--;
            break;
        case DIRECTION.DROITE :
            coord.x++;
            break;
        case DIRECTION.HAUT :
            coord.y--;
            break;
    }
    return coord;
}

Personnage.prototype.deplacer = function (direction, map) {
    var oldX = this.x;
    var oldY = this.y;
    var oldDirection = this.direction;

    // On ne peut pas se déplacer si un mouvement est déjà en cours !
    if (this.etatAnimation >= 0) {
        return false;
    }

    // On change la direction du personnage
    this.direction = direction;
    var prochaineCase = this.getCoordonneesAdjacentes(direction);


    // On commence l'animation
    this.etatAnimation = 1;

    // On effectue le déplacement
    this.x = prochaineCase.x;
    this.y = prochaineCase.y;

    //envoi au serveur
    if (this.id == myId) {
        io.socket.get('/move', {
            coordX: prochaineCase.x,
            coordY: prochaineCase.y,
            direction: this.direction
        }, function (res, jwres) {
            if (!res.success) {
                //Annulation du deplacement
                map.personnages[0].x = oldX;
                map.personnages[0].y = oldY;
                map.personnages[0].direction = oldDirection;
            }
        });
    }
    return true;
}

function drawTextBG(ctx, txt, font, x, y) {

    /// lets save current state as we make a lot of changes
    ctx.save();

    /// set font
    ctx.font = font;

    /// draw text from top - makes life easier at the moment
    ctx.textBaseline = 'top';

    /// color for background
    ctx.fillStyle = '#fff';

    /// get width of text
    var width = ctx.measureText(txt).width;

    /// draw background rect assuming height of font
    ctx.fillRect(x, y, width, parseInt(font, 10));

    /// text color
    ctx.fillStyle = '#000';

    /// draw text on top
    ctx.fillText(txt, x, y);

    /// restore original state
    ctx.restore();
}