var RadioBinder = (function () {
    function RadioBinder() {
    }

    RadioBinder.prototype.buildPage = function (rootNode) {
        this.radioManager = new RadioManager(rootNode);
        this.criteriaSongs = new RadioCriteriaInput("radioRecentSongsCriteria", false, function () {
            return "Recent Songs";
        });
        this.criteriaAlbums = new RadioCriteriaInput("radioRecentAlbumsCriteria", false, function () {
            return "Recent Albums";
        });
        this.criteriaGenres = new RadioCriteriaInput("radioRecentGenresCriteria", false, function () {
            return "Recent Genres";
        });
        this.criteriaPastConcerts = new RadioCriteriaInput("radioPastConcertsCriteria", false, function () {
            return "Past Concerts";
        });
        this.customCriteria = new RadioCriteriaInput("radioCustomCriteria", true, function () {
            return $("#customCriteriaInput").val();
        });
        this.radioManager.addCriteriaInput(this.customCriteria);
        this.radioManager.addCriteriaInput(this.criteriaSongs);
        this.radioManager.addCriteriaInput(this.criteriaGenres);
        this.radioManager.addCriteriaInput(this.criteriaAlbums);
        this.radioManager.addCriteriaInput(this.criteriaPastConcerts);
        this.radioManager.bind();
    };
    RadioBinder.prototype.bind = function () {
        var _this = this;
        $("#radioManagerResetButton").click(function () {
            $("#radioCriteriaTableBody").empty();
            for (var i in _this.radioManager.selectedCriterias) {
                $("#" + _this.radioManager.selectedCriterias[i].id).show();
            }
            _this.radioManager.selectedCriterias = [];
            _this.radioManager.addCriteriaToReset(_this.criteriaSongs);
            _this.radioManager.addCriteriaToReset(_this.criteriaAlbums);
        });
    };
    RadioBinder.prototype.unbind = function () {
    };
    return RadioBinder;
})();
var RadioManager = (function () {
    function RadioManager(rootNode) {
        this.criterias = [];
        this.selectedCriterias = [];
        this.recentSongs = [];
        this.loadRecentSongs();
    }

    RadioManager.globalPlayer = [];
    RadioManager.prototype.loadRecentSongs = function () {
        var _this = this;
        $.ajax("/radio/songs/", {
            type: "POST",
            dataType: "json",
            success: function (data) {
                return _this.onSongResult(data);
            }
        });
    };
    RadioManager.prototype.onSongResult = function (data) {
        this.recentSongs = [];
        for (var i = 0; i < data.length; i++) {
            var songInfo = new SongInfo(data[i].title, data[i].artist, data[i].album, data[i].genre, 0, 0, 0);
            var song = new Song(data[i].mbid, songInfo, data[i].imageUrl);
            this.recentSongs.push(song);
        }
    };
    RadioManager.addToGlobalPlayer = function addToGlobalPlayer(song) {
        RadioManager.globalPlayer.push(song);
        RadioManager.globalPlayer = RadioManager.shuffle(RadioManager.globalPlayer);
        globalPlaylistManager.clearSongs();
        globalPlaylistManager.pushSongs(RadioManager.globalPlayer);
    }
    RadioManager.prototype.addCriteriaInput = function (criteria) {
        var _this = this;
        this.criterias.push(criteria);
        $("#" + criteria.id).click(function () {
            var criteriaTitle = criteria.labelFormatter();
            if (!criteria.repeatable) {
                $("#" + criteria.id).hide();
            }
            _this.addCriteria(criteriaTitle, criteria);
            $("#radioCriteriaContainer").hide(300);
        });
    };
    RadioManager.prototype.addCriteria = function (criteria, criteriaInput) {
        var _this = this;
        var criteriaTemplate = template("#radioCriteriaTemplate", criteria);
        var tr = $("<tr></tr>").addClass("radioCriteriaCell").append(criteriaTemplate);
        $("#radioCriteriaTableBody").append(tr);
        this.selectedCriterias.push(criteriaInput);
        tr.find("#radioCriteriaCloseButton").click(function () {
            tr.remove();
            $("#" + criteriaInput.id).show();
            _this.deleteCriteria(criteriaInput);
        });
    };
    RadioManager.prototype.addCriteriaToReset = function (criteria) {
        $("#" + criteria.id).hide();
        var criteriaTitle = criteria.labelFormatter();
        this.addCriteria(criteriaTitle, criteria);
    };
    RadioManager.prototype.deleteCriteria = function (criteriaInput) {
        var index = this.selectedCriterias.indexOf(criteriaInput, 0);
        if (index != undefined) {
            this.selectedCriterias.splice(index, 1);
        }
    };
    RadioManager.shuffle = function shuffle(o) {
        for (var j, x, i = o.length; i; j = Math.floor(Math.random() * i) , x = o[--i] , o[i] = o[j] , o[j] = x) {
            ;
            ;
        }
        return o;
    }
    RadioManager.prototype.bind = function () {
        var _this = this;
        $("#radioAddButtonCell").click(function () {
            $("#radioCriteriaContainer").slideToggle(300);
        });
        $("#radioManagerClearButton").click(function () {
            $("#radioCriteriaTableBody").empty();
            _this.criterias.forEach(function (criteria) {
                $("#" + criteria.id).show();
                for (var i in _this.selectedCriterias) {
                    _this.deleteCriteria(_this.selectedCriterias[i]);
                }
            });
        });
        $("#radioManagerPlayButton").click(function () {
            globalPlaylistManager.clearSongs();
            RadioManager.globalPlayer = [];
            if (_this.selectedCriterias.length == 0) {
                globalPlaylistManager.clearSongs();
            }
            for (var i in _this.selectedCriterias) {
                var selected = _this.selectedCriterias[i].id;
                switch (selected) {
                    case "radioCustomCriteria":
                    {
                        new SearchCustom().loadCustomSearchSongs();
                        break;
                    }

                    case "radioRecentSongsCriteria":
                    {
                        for (var j = 0; j < _this.recentSongs.length; j++) {
                            new SearchSimilarSongs().loadSimilarSongs(_this.recentSongs[j].info.title);
                        }
                        break;
                    }

                    case "radioRecentGenresCriteria":
                    {
                        for (var j = 0; j < _this.recentSongs.length; j++) {
                            if (_this.recentSongs[j].info.genre != null) {
                                new SearchSimilarGenre().loadSimilarGenreSongs(_this.recentSongs[j].info.genre);
                            }
                        }
                        break;
                    }

                    case "radioRecentAlbumsCriteria":
                    {
                        for (var j = 0; j < _this.recentSongs.length; j++) {
                            new SearchSimilarAlbum().loadSimilarAlbumSongs(_this.recentSongs[j].info.artist);
                        }
                        break;
                    }

                    default:
                    {
                        globalPlaylistManager.clearSongs();
                        break;
                    }

                }
            }
        });
    };
    return RadioManager;
})();
var RadioCriteriaInput = (function () {
    function RadioCriteriaInput(id, repeatable, labelFormatter) {
        this.id = id;
        this.repeatable = repeatable;
        this.labelFormatter = labelFormatter;
    }

    return RadioCriteriaInput;
})();
var SearchSimilarSongs = (function () {
    function SearchSimilarSongs() {
    }

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
        for (var i = 0; i < tracks.length; i++) {
            this.pushMainResult(tracks[i]);
        }
    };
    SearchSimilarSongs.prototype.pushMainResult = function (track) {
        var id = guid(track.mbid, track.name.trim() + track.artist.trim());
        var song = new Song(id, new SongInfo(track.name, track.artist, null, null, 0, 0, 0), getExtraLargeImage(track.image));
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
        if (res.error == null && res["similartracks"] != null && Array.isArray(res["similartracks"]["track"])) {
            this.addSimilarSongs(res["similartracks"]["track"], song);
        }
    };
    SearchSimilarSongs.prototype.addSimilarSongs = function (tracks, song) {
        for (var i = 0; i < tracks.length; i++) {
            this.addSimilarSong(tracks[i]);
        }
    };
    SearchSimilarSongs.prototype.addSimilarSong = function (track) {
        var id = guid(track.mbid, track.name.trim() + track.artist.name.trim());
        var song = new Song(id, new SongInfo(track.name, track.artist.name, null, null, 0, 0, 0), getLargeImage(track.image));
        RadioManager.addToGlobalPlayer(song);
    };
    SearchSimilarSongs.prototype.buildSimilarSongsSearchUrl = function (song) {
        return "http://ws.audioscrobbler.com/2.0/?method=track.getsimilar&artist=" + song.info.artist + "&track=" + song.info.title + "&api_key=" + lastFmApiKey + "&format=json&limit=3";
    };
    SearchSimilarSongs.prototype.buildSearchUrl = function (song) {
        return "http://ws.audioscrobbler.com/2.0/?method=track.search&track=" + song + "&api_key=" + lastFmApiKey + "&format=json&limit=2";
    };
    return SearchSimilarSongs;
})();
var SearchSimilarGenre = (function () {
    function SearchSimilarGenre() {
    }

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
        for (var i = 0; i < tags.length; i++) {
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
        for (var i = 0; i < tracks.length; i++) {
            this.addGenreSong(tracks[i]);
        }
    };
    SearchSimilarGenre.prototype.addGenreSong = function (track) {
        var id = guid(track.mbid, track.name.trim() + track.artist.name.trim());
        var song = new Song(id, new SongInfo(track.name, track.artist.name, null, null, 0, 0, 0), getLargeImage(track.image));
        RadioManager.addToGlobalPlayer(song);
    };
    SearchSimilarGenre.prototype.buildGenreSearchUrl = function (tag) {
        return "http://ws.audioscrobbler.com/2.0/?method=tag.gettoptracks&tag=" + tag.name + "&api_key=" + lastFmApiKey + "&format=json&limit=3";
    };
    SearchSimilarGenre.prototype.buildSearchUrl = function (genre) {
        return "http://ws.audioscrobbler.com/2.0/?method=tag.search&tag=" + genre + "&api_key=" + lastFmApiKey + "&format=json&limit=2";
    };
    return SearchSimilarGenre;
})();
var SearchSimilarAlbum = (function () {
    function SearchSimilarAlbum() {
    }

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
        for (var i = 0; i < albums.length; i++) {
            this.pushMainResult(albums[i], artist);
        }
    };
    SearchSimilarAlbum.prototype.pushMainResult = function (albumInfo, artist) {
        var id = guid(albumInfo.mbid, albumInfo.name.trim());
        var album = new Album(id, new AlbumInfo(albumInfo.name, artist), getExtraLargeImage(albumInfo.image));
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
        if (res.error == null && res["album"]["tracks"]["track"] != null) {
            var image = getLargeImage(res["album"]["image"]);
            this.addAlbumSongs(res["album"]["tracks"]["track"], image);
        }
    };
    SearchSimilarAlbum.prototype.addAlbumSongs = function (tracks, image) {
        for (var i = 0; i < 3; i++) {
            this.addAlbumSong(tracks[Math.floor(Math.random() * tracks.length)], image);
        }
    };
    SearchSimilarAlbum.prototype.addAlbumSong = function (track, image) {
        var id = guid(track.mbid, track.name.trim() + track.artist.name.trim());
        var song = new Song(id, new SongInfo(track.name, track.artist.name, null, null, 0, 0, 0), image);
        RadioManager.addToGlobalPlayer(song);
    };
    SearchSimilarAlbum.prototype.buildAlbumSearchUrl = function (album) {
        return "http://ws.audioscrobbler.com/2.0/?method=album.getinfo&artist=" + album.info.artist + "&album=" + album.info.name + "&api_key=" + lastFmApiKey + "&format=json";
    };
    SearchSimilarAlbum.prototype.buildSearchUrl = function (artist) {
        return "http://ws.audioscrobbler.com/2.0/?method=artist.getTopAlbums&artist=" + artist + "&api_key=" + lastFmApiKey + "&format=json&limit=2";
    };
    return SearchSimilarAlbum;
})();
var SearchCustom = (function () {
    function SearchCustom() {
    }

    SearchCustom.prototype.loadCustomSearchSongs = function () {
        var _this = this;
        $.ajax({
            url: this.buildSearchUrl($("#customCriteriaInput").val()),
            dataType: "json",
            method: "POST",
            success: function (res) {
                return _this.onMainResult(res["results"]["trackmatches"]["track"]);
            }
        });
    };
    SearchCustom.prototype.buildSearchUrl = function (tag) {
        return "http://ws.audioscrobbler.com/2.0/?method=track.search&track=" + tag + "&api_key=" + lastFmApiKey + "&format=json&limit=15";
    };
    SearchCustom.prototype.onMainResult = function (tracks) {
        for (var i = 0; i < tracks.length; i++) {
            this.pushMainResult(tracks[i]);
        }
    };
    SearchCustom.prototype.pushMainResult = function (track) {
        var id = guid(track.mbid, track.name.trim() + track.artist.trim());
        var song = new Song(id, new SongInfo(track.name, track.artist, null, null, 0, 0, 0), getLargeImage(track.image));
        RadioManager.addToGlobalPlayer(song);
    };
    return SearchCustom;
})();
//@ sourceMappingURL=radio.js.map
