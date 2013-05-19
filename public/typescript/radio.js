var RadioBinder = (function () {
    function RadioBinder() { }
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
            for(var i in _this.radioManager.selectedCriterias) {
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
        this.globalPlayer = [];
        this.selectedCriterias = [];
    }
    RadioManager.prototype.buildSearchUrl = function (tag) {
        return "http://ws.audioscrobbler.com/2.0/?method=track.search&track=" + tag + "&api_key=" + lastFmApiKey + "&format=json&limit=20";
    };
    RadioManager.prototype.loadSimilarSongs = function (path) {
        var _this = this;
        $.ajax(path, {
            type: "POST",
            dataType: "json",
            success: function (data) {
                return _this.onSongResult(data);
            }
        });
    };
    RadioManager.prototype.onSongResult = function (data) {
        for(var i = 0; i < data.length; i++) {
            var songInfo = new SongInfo(data[i].title, data[i].artist, data[i].album, data[i].genre);
            var song = new Song(data[i].mbid, songInfo, data[i].imageUrl);
            this.globalPlayer.push(song);
        }
        this.globalPlayer = this.shuffle(this.globalPlayer);
        globalPlaylistManager.clearSongs();
        globalPlaylistManager.pushSongs(this.globalPlayer);
    };
    RadioManager.prototype.loadCustomSearchSongs = function () {
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
    RadioManager.prototype.onMainResult = function (tracks) {
        for(var i = 0; i < tracks.length; i++) {
            this.pushMainResult(tracks[i]);
        }
    };
    RadioManager.prototype.pushMainResult = function (track) {
        var id = guid(track.mbid, track.name.trim() + track.artist.trim());
        var song = new Song(id, new SongInfo(track.name, track.artist, null, null), track.imageUrl);
        this.globalPlayer.push(song);
        this.globalPlayer = this.shuffle(this.globalPlayer);
        globalPlaylistManager.clearSongs();
        globalPlaylistManager.pushSongs(this.globalPlayer);
    };
    RadioManager.prototype.addCriteriaInput = function (criteria) {
        var _this = this;
        this.criterias.push(criteria);
        $("#" + criteria.id).click(function () {
            var criteriaTitle = criteria.labelFormatter();
            if(!criteria.repeatable) {
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
        if(index != undefined) {
            this.selectedCriterias.splice(index, 1);
        }
    };
    RadioManager.prototype.shuffle = function (o) {
        for(var j, x, i = o.length; i; j = parseInt(Math.random() * i) , x = o[--i] , o[i] = o[j] , o[j] = x) {
            ;
        }
        return o;
    };
    RadioManager.prototype.bind = function () {
        var _this = this;
        $("#radioAddButtonCell").click(function () {
            $("#radioCriteriaContainer").slideToggle(300);
        });
        $("#radioManagerClearButton").click(function () {
            $("#radioCriteriaTableBody").empty();
            _this.criterias.forEach(function (criteria) {
                $("#" + criteria.id).show();
                for(var i in _this.selectedCriterias) {
                    _this.deleteCriteria(_this.selectedCriterias[i]);
                }
            });
        });
        $("#radioManagerPlayButton").click(function () {
            globalPlaylistManager.clearSongs();
            _this.globalPlayer = [];
            if(_this.selectedCriterias.length == 0) {
                globalPlaylistManager.clearSongs();
            }
            for(var i in _this.selectedCriterias) {
                var selected = _this.selectedCriterias[i].id;
                switch(selected) {
                    case "radioCustomCriteria": {
                        _this.loadCustomSearchSongs();
                        break;
                    }
                    case "radioRecentSongsCriteria": {
                        _this.loadSimilarSongs("/radio/songs/");
                        break;
                    }
                    case "radioRecentGenresCriteria": {
                        _this.loadSimilarSongs("/radio/genre/");
                        break;
                    }
                    case "radioRecentAlbumsCriteria": {
                        _this.loadSimilarSongs("/radio/album/");
                        break;
                    }
                    default: {
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
//@ sourceMappingURL=radio.js.map
