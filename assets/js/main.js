$(document).ready(function () {
    io.socket.get('/loadPlayers', null, function (resData, jwres) {
        console.log(resData);

    });
})