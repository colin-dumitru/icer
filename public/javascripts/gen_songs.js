var queries = [];

$.ajax({
    //url: "http://ws.audioscrobbler.com/2.0/?method=track.getsimilar&artist=metallica&track=nothing%20else%20matters&api_key=ccb7bf48e8055843e17952fbeb6bfabd&format=json&limit=1000",
    url: "http://ws.audioscrobbler.com/2.0/?method=track.getsimilar&artist=passenger&track=let%20her%20go&api_key=ccb7bf48e8055843e17952fbeb6bfabd&format=json&limit=1000",
    success: function (res) {
        parse(res);
    }
});

function parse(res) {
    console.log(res);
    for (var i = 0; i < res.similartracks.track.length; i++)
        parseTrack(res.similartracks.track[i]);

}

function parseTrack(obj) {
    if (obj.mbid == null || obj.mbid.length != 36)
        return;
    getTrackInfo(obj);
}

function getTrackInfo(obj) {
    $.ajax({
        url: "http://ws.audioscrobbler.com/2.0/?method=track.getInfo&api_key=ccb7bf48e8055843e17952fbeb6bfabd&format=json&mbid=" + obj.mbid,
        success: function (track) {
            var q = "INSERT INTO songs (mbid, title, artist, album, genre, imageurl, peek, weeks_on_top) SELECT"
                + "'" + track.track.mbid + "',"
                + "'" + track.track.name.replace("'", "''") + "',"
                + "'" + track.track.artist.name.replace("'", "''") + "',"
                + "'" + track.track.album.title.replace("'", "''") + "',"
                + "'" + track.track.toptags.tag[0].name.replace("'", "''") + "',"
                + "'" + getImageUrl(track.track.image) + "', 0, 0 where not exists (select 1 from songs where mbid = '"
                + track.track.mbid + "' );";
            queries.push(q);
        }
    });
}

function getImageUrl(images) {
    if (images == null) {
        return "assets/images/logo.gif";
    }
    for (var i = 0; i < images.length; i++) {
        if (images[i].size == "large") {
            return images[i]["#text"];
        }
    }
    return "assets/images/logo.gif";
}