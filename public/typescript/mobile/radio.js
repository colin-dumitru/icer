var MobileRadioManager = (function () {
    function MobileRadioManager() {
        this.recentMSongs = [];
        this.playingMSongs = [];
    }
    MobileRadioManager.getLargeImage = function getLargeImage(images) {
        if(images == null) {
            return "/assets/images/logo.gif";
        }
        for(var i = 0; i < images.length; i++) {
            if(images[i].size == "medium") {
                return images[i]["#text"];
            }
        }
        return "/assets/images/logo.gif";
    };
    MobileRadioManager.getExtraLargeImage = function getExtraLargeImage(images) {
        if(images == null) {
            return "/assets/images/logo.gif";
        }
        for(var i = 0; i < images.length; i++) {
            if(images[i].size == "extralarge") {
                return images[i]["#text"];
            }
        }
        return "/assets/images/logo.gif";
    };
    MobileRadioManager.guid = function guid(mbid, seed) {
        if(mbid == null || mbid.length != 36) {
            return md5(seed);
        } else {
            return mbid;
        }
    };
    MobileRadioManager.prototype.loadRecentSongs = function (id) {
        var _this = this;
        $.ajax("/radio/songs/", {
            type: "POST",
            dataType: "json",
            success: function (data) {
                _this.onSongResult(data);
                _this.loadRadio(id);
            }
        });
    };
    MobileRadioManager.prototype.onSongResult = function (data) {
        this.recentMSongs = [];
        for(var i = 0; i < data.length; i++) {
            var song = new MSong(data[i].mbid, data[i].title, data[i].artist, data[i].genre, data[i].imageUrl);
            this.recentMSongs.push(song);
        }
    };
    MobileRadioManager.prototype.loadRadio = function (id) {
        globalPlaylistManager.clearSongs();
        this.playingMSongs = [];
        switch(id) {
            case "RecentGenres": {
                titleManager.setTitle("Recent Genres");
                for(var j = 0; j < this.recentMSongs.length; j++) {
                    if(this.recentMSongs[j].genre != null) {
                        new SearchSimilarGenre().loadSimilarGenreSongs(this.recentMSongs[j].genre);
                    }
                }
                break;
            }
            case "RecentSongs": {
                titleManager.setTitle("Recent Songs");
                for(var j = 0; j < this.recentMSongs.length; j++) {
                    new SearchSimilarSongs().loadSimilarSongs(this.recentMSongs[j].title);
                }
                break;
            }
            case "RecentAlbums": {
                titleManager.setTitle("Recent Albums");
                for(var j = 0; j < this.recentMSongs.length; j++) {
                    new SearchSimilarAlbum().loadSimilarAlbumSongs(this.recentMSongs[j].artist);
                }
                break;
            }
            default: {
                new SearchCustom().loadCustomSearchSongs(id);
                break;
            }
        }
    };
    MobileRadioManager.prototype.addSongToGlobalPlayer = function (song) {
        if(this.playingMSongs.filter(function (e) {
            return e.mbid == song.mbid;
        }).length == 0) {
            globalPlaylistManager.pushSong(song);
            this.playingMSongs.push(song);
        }
    };
    MobileRadioManager.prototype.onSearchSelected = function (id) {
        this.loadRecentSongs(id);
    };
    return MobileRadioManager;
})();
var mRadioManager = new MobileRadioManager();
var SearchSimilarGenre = (function () {
    function SearchSimilarGenre() { }
    SearchSimilarGenre.prototype.loadSimilarGenreSongs = function (genre) {
        var _this = this;
        $.ajax({
            url: this.buildSearchUrl(genre),
            dataType: "json",
            method: "GET",
            success: function (res) {
                return _this.onMainResult(res["results"]["tagmatches"]["tag"]);
            }
        });
    };
    SearchSimilarGenre.prototype.onMainResult = function (tags) {
        for(var i = 0; i < tags.length; i++) {
            this.pushMainResult(tags[i]);
        }
    };
    SearchSimilarGenre.prototype.pushMainResult = function (tagInfo) {
        var tag = new Tag(tagInfo.name);
        this.loadGenreSongs(tag);
    };
    SearchSimilarGenre.prototype.loadGenreSongs = function (tag) {
        var _this = this;
        $.ajax({
            url: this.buildGenreSearchUrl(tag),
            dataType: "json",
            method: "GET",
            success: function (res) {
                return _this.onGenreResults(res, tag);
            }
        });
    };
    SearchSimilarGenre.prototype.onGenreResults = function (res, tag) {
        this.addGenreSongs(res["toptracks"]["track"], tag);
    };
    SearchSimilarGenre.prototype.addGenreSongs = function (tracks, tag) {
        for(var i = 0; i < 3; i++) {
            this.addGenreSong(tracks[i]);
        }
    };
    SearchSimilarGenre.prototype.addGenreSong = function (track) {
        var id = MobileRadioManager.guid(track.mbid, track.name.trim() + track.artist.name.trim());
        var song = new MSong(id, track.name, track.artist.name, null, MobileRadioManager.getLargeImage(track.image));
        mRadioManager.addSongToGlobalPlayer(song);
    };
    SearchSimilarGenre.prototype.buildGenreSearchUrl = function (tag) {
        return "http://ws.audioscrobbler.com/2.0/?method=tag.gettoptracks&tag=" + tag.name + "&api_key=" + lastFmApiKey + "&format=json&limit=5";
    };
    SearchSimilarGenre.prototype.buildSearchUrl = function (genre) {
        return "http://ws.audioscrobbler.com/2.0/?method=tag.search&tag=" + genre + "&api_key=" + lastFmApiKey + "&format=json&limit=2";
    };
    return SearchSimilarGenre;
})();
var SearchSimilarAlbum = (function () {
    function SearchSimilarAlbum() { }
    SearchSimilarAlbum.prototype.loadSimilarAlbumSongs = function (artist) {
        var _this = this;
        $.ajax({
            url: this.buildSearchUrl(artist),
            dataType: "json",
            method: "GET",
            success: function (res) {
                return _this.onMainResult(res["topalbums"]["album"], artist);
            }
        });
    };
    SearchSimilarAlbum.prototype.onMainResult = function (albums, artist) {
        for(var i = 0; i < albums.length; i++) {
            this.pushMainResult(albums[i], artist);
        }
    };
    SearchSimilarAlbum.prototype.pushMainResult = function (albumInfo, artist) {
        var id = MobileRadioManager.guid(albumInfo.mbid, albumInfo.name.trim());
        var album = new Album(id, new AlbumInfo(albumInfo.name, artist), MobileRadioManager.getExtraLargeImage(albumInfo.image));
        this.loadAlbumSongs(album);
    };
    SearchSimilarAlbum.prototype.loadAlbumSongs = function (album) {
        var _this = this;
        $.ajax({
            url: this.buildAlbumSearchUrl(album),
            dataType: "json",
            method: "GET",
            success: function (res) {
                _this.onAlbumResults(res);
            }
        });
    };
    SearchSimilarAlbum.prototype.onAlbumResults = function (res) {
        if(res.error == null && res["album"]["tracks"]["track"] != null) {
            var image = MobileRadioManager.getLargeImage(res["album"]["image"]);
            this.addAlbumSongs(res["album"]["tracks"]["track"], image);
        }
    };
    SearchSimilarAlbum.prototype.addAlbumSongs = function (tracks, image) {
        for(var i = 0; i < 3; i++) {
            this.addAlbumSong(tracks[Math.floor(Math.random() * tracks.length)], image);
        }
    };
    SearchSimilarAlbum.prototype.addAlbumSong = function (track, image) {
        var id = MobileRadioManager.guid(track.mbid, track.name.trim() + track.artist.name.trim());
        var song = new MSong(id, track.name, track.artist.name, null, image);
        mRadioManager.addSongToGlobalPlayer(song);
    };
    SearchSimilarAlbum.prototype.buildAlbumSearchUrl = function (album) {
        return "http://ws.audioscrobbler.com/2.0/?method=album.getinfo&artist=" + album.info.artist + "&album=" + album.info.name + "&api_key=" + lastFmApiKey + "&format=json";
    };
    SearchSimilarAlbum.prototype.buildSearchUrl = function (artist) {
        return "http://ws.audioscrobbler.com/2.0/?method=artist.getTopAlbums&artist=" + artist + "&api_key=" + lastFmApiKey + "&format=json&limit=2";
    };
    return SearchSimilarAlbum;
})();
var SearchSimilarSongs = (function () {
    function SearchSimilarSongs() { }
    SearchSimilarSongs.prototype.loadSimilarSongs = function (song) {
        var _this = this;
        $.ajax({
            url: this.buildSearchUrl(song),
            dataType: "json",
            method: "GET",
            success: function (res) {
                return _this.onMainResult(res["results"]["trackmatches"]["track"]);
            }
        });
    };
    SearchSimilarSongs.prototype.onMainResult = function (tracks) {
        for(var i = 0; i < tracks.length; i++) {
            this.pushMainResult(tracks[i]);
        }
    };
    SearchSimilarSongs.prototype.pushMainResult = function (track) {
        var id = MobileRadioManager.guid(track.mbid, track.name.trim() + track.artist.trim());
        var song = new Song(id, new SongInfo(track.name, track.artist, null, null, 0, 0, 0), MobileRadioManager.getExtraLargeImage(track.image));
        this.loadSimilar(song);
    };
    SearchSimilarSongs.prototype.loadSimilar = function (song) {
        var _this = this;
        $.ajax({
            url: this.buildSimilarSongsSearchUrl(song),
            dataType: "json",
            method: "GET",
            success: function (res) {
                _this.onSimilarResults(res, song);
            }
        });
    };
    SearchSimilarSongs.prototype.onSimilarResults = function (res, song) {
        if(res.error == null && res["similartracks"] != null && Array.isArray(res["similartracks"]["track"])) {
            this.addSimilarSongs(res["similartracks"]["track"], song);
        }
    };
    SearchSimilarSongs.prototype.addSimilarSongs = function (tracks, song) {
        for(var i = 0; i < tracks.length; i++) {
            this.addSimilarSong(tracks[i]);
        }
    };
    SearchSimilarSongs.prototype.addSimilarSong = function (track) {
        var id = MobileRadioManager.guid(track.mbid, track.name.trim() + track.artist.name.trim());
        var song = new MSong(id, track.name, track.artist.name, null, MobileRadioManager.getLargeImage(track.image));
        mRadioManager.addSongToGlobalPlayer(song);
    };
    SearchSimilarSongs.prototype.buildSimilarSongsSearchUrl = function (song) {
        return "http://ws.audioscrobbler.com/2.0/?method=track.getsimilar&artist=" + song.info.artist + "&track=" + song.info.title + "&api_key=" + lastFmApiKey + "&format=json&limit=5";
    };
    SearchSimilarSongs.prototype.buildSearchUrl = function (song) {
        return "http://ws.audioscrobbler.com/2.0/?method=track.search&track=" + song + "&api_key=" + lastFmApiKey + "&format=json&limit=2";
    };
    return SearchSimilarSongs;
})();
var SearchCustom = (function () {
    function SearchCustom() { }
    SearchCustom.prototype.loadCustomSearchSongs = function (inputCustom) {
        var _this = this;
        $.ajax({
            url: this.buildSearchUrl(inputCustom),
            dataType: "json",
            method: "POST",
            success: function (res) {
                globalPlaylistManager.clearSongs();
                _this.onMainResult(res["results"]["trackmatches"]["track"]);
            }
        });
    };
    SearchCustom.prototype.buildSearchUrl = function (tag) {
        return "http://ws.audioscrobbler.com/2.0/?method=track.search&track=" + tag + "&api_key=" + lastFmApiKey + "&format=json&limit=20";
    };
    SearchCustom.prototype.onMainResult = function (tracks) {
        for(var i = 0; i < tracks.length; i++) {
            this.pushMainResult(tracks[i]);
        }
    };
    SearchCustom.prototype.pushMainResult = function (track) {
        var id = MobileRadioManager.guid(track.mbid, track.name.trim() + track.artist.trim());
        var song = new MSong(id, track.name, track.artist, null, MobileRadioManager.getLargeImage(track.image));
        mRadioManager.addSongToGlobalPlayer(song);
    };
    return SearchCustom;
})();
var Song = (function () {
    function Song(mbid, info, imageUrl) {
        this.mbid = mbid;
        this.info = info;
        this.imageUrl = imageUrl;
    }
    return Song;
})();
var SongInfo = (function () {
    function SongInfo(title, artist, album, genre, peek, weeksOnTop, positionChange) {
        this.title = title;
        this.artist = artist;
        this.album = album;
        this.genre = genre;
        this.peek = peek;
        this.weeksOnTop = weeksOnTop;
        this.positionChange = positionChange;
    }
    return SongInfo;
})();
var Artist = (function () {
    function Artist(mbid, info, imageUrl) {
        this.mbid = mbid;
        this.info = info;
        this.imageUrl = imageUrl;
    }
    return Artist;
})();
var ArtistInfo = (function () {
    function ArtistInfo(name) {
        this.name = name;
    }
    return ArtistInfo;
})();
var Album = (function () {
    function Album(mbid, info, imageUrl) {
        this.mbid = mbid;
        this.info = info;
        this.imageUrl = imageUrl;
    }
    return Album;
})();
var AlbumInfo = (function () {
    function AlbumInfo(name, artist) {
        this.name = name;
        this.artist = artist;
    }
    return AlbumInfo;
})();
var Tag = (function () {
    function Tag(name) {
        this.name = name;
    }
    return Tag;
})();
//@ sourceMappingURL=radio.js.map
