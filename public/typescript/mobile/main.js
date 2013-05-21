var sectionManager;
var titleManager;
var globalPlaylistManager;
var player;
function run() {
    titleManager = new TitleManager();
    titleManager.bind();
    globalPlaylistManager = new GlobalPlaylistManager();
    globalPlaylistManager.bind();
    sectionManager = new SectionManager();
    sectionManager.callback["Search"] = searchCallback;
    sectionManager.callback["Playlists"] = playlistCallback;
    sectionManager.callback["Radio"] = radioCallback;
    sectionManager.bind();
    player = new Player();
    player.bind();
    searchCallback();
}
function searchCallback() {
    sectionManager.loadSection("/mobile/section/search", function () {
        itemsOnLoad();
        mSearchManager.bind();
        itemManager.itemAddCallback = function (content) {
            return mSearchManager.onSearchInput(content);
        };
        itemManager.itemSelectedCallback = function (id, title) {
            return mSearchManager.onSearchSelected(id);
        };
    });
}
function playlistCallback() {
    sectionManager.loadSection("/mobile/section/playlists", function () {
        itemsOnLoad();
        mPlaylistManager.bind();
        itemManager.itemAddCallback = function (content) {
            return mPlaylistManager.onAddPlaylistInput(content);
        };
        itemManager.itemSelectedCallback = function (id, title) {
            return mPlaylistManager.onPlaylistSelected(id, title);
        };
    });
}
function radioCallback() {
}
function performSearch(query) {
    sectionManager.loadSection("/mobile/section/search", function () {
        itemsOnLoad();
        mSearchManager.bind();
        itemManager.itemAddCallback = function (content) {
            return mSearchManager.onSearchInput(content);
        };
        itemManager.itemSelectedCallback = function (id, title) {
            return mSearchManager.onSearchSelected(id);
        };
        $("#menuSelect").val(0);
        mSearchManager.onSearchInput(query);
    });
}
var SectionManager = (function () {
    function SectionManager() {
        this.callback = {
        };
    }

    SectionManager.prototype.bind = function () {
        var _this = this;
        $("#menuSelect").change(function () {
            _this.callback[$(this).val()]();
        });
    };
    SectionManager.prototype.loadSection = function (url, callback) {
        $("#content").load(url, callback);
    };
    return SectionManager;
})();
var TitleManager = (function () {
    function TitleManager() {
        this.title = null;
        this.titleSpan = null;
    }

    TitleManager.prototype.bind = function () {
        this.title = $("#title");
        this.titleSpan = $("#titleSpan");
        this.title.click(function () {
            itemManager.toggle();
        });
    };
    TitleManager.prototype.setTitle = function (title) {
        this.titleSpan.text(title);
    };
    return TitleManager;
})();
var GlobalPlaylistManager = (function () {
    function GlobalPlaylistManager() {
        this.progressBar = null;
        this.volumeSlider = null;
        this.playbackArrow = null;
        this.footer = null;
        this.playbackContainer = null;
        this.playingSongs = null;
        this.collapsed = true;
    }

    GlobalPlaylistManager.prototype.bind = function () {
        var _this = this;
        this.progressBar = $("#progressBars");
        this.volumeSlider = $("#volumeSlider");
        this.playbackArrow = $("#playbackArrow");
        this.footer = $("#footer");
        this.playbackContainer = $("#playbackContainer");
        this.playingSongs = $("#playingSongs");
        this.playbackArrow.click(function () {
            if (_this.collapsed) {
                _this.giveFocus();
            } else {
                _this.takeFocus();
            }
        });
        this.progressBar.slider({
            orientation: "horizontal",
            min: 0,
            max: 1000,
            value: 0,
            slide: function (event, ui) {
                _this.changePosition(ui.value);
            }
        });
        this.volumeSlider.slider({
            orientation: "horizontal",
            min: 0,
            max: 100,
            value: 100,
            slide: function (event, ui) {
                _this.changeVolume(ui.value);
            }
        });
    };
    GlobalPlaylistManager.prototype.giveFocus = function () {
        this.collapsed = false;
        this.footer.css({
            marginBottom: 200
        });
        this.playbackContainer.show(0);
    };
    GlobalPlaylistManager.prototype.takeFocus = function () {
        this.collapsed = true;
        this.footer.css({
            marginBottom: 0
        });
        this.playbackContainer.delay(400).hide(0);
    };
    GlobalPlaylistManager.prototype.changePosition = function (position) {
    };
    GlobalPlaylistManager.prototype.changeVolume = function (position) {
    };
    GlobalPlaylistManager.prototype.pushSong = function (song) {
        var item = this.convertSongToItem(song);
        this.bindItemClick(item, song);
        this.playingSongs.append(item);
    };
    GlobalPlaylistManager.prototype.clearSongs = function () {
        this.playingSongs.empty();
    };
    GlobalPlaylistManager.prototype.bindItemClick = function (item, song) {
        $(item).click(function () {
            player.playSong(song);
        });
    };
    GlobalPlaylistManager.prototype.convertSongToItem = function (song) {
        var container = $("<div></div>");
        container.addClass("playingSong");
        container.text(song.title + "-" + song.artist);
        return container;
    };
    return GlobalPlaylistManager;
})();
var Player = (function () {
    function Player() {
        this.player = null;
        this.playbackId = 0;
        this.currentSong = null;
        this.currentPlayer = null;
        this.durationText = null;
        this.seekSlider = null;
    }

    Player.prototype.bind = function () {
        var _this = this;
        SC.initialize({
            client_id: soundCloudId
        });
        window.setInterval(function () {
            _this.updateElapsed();
        }, 500);
        this.durationText = $("#durationText");
        this.seekSlider = $("#progressBars");
    };
    Player.prototype.updateElapsed = function () {
        if (this.currentPlayer != null) {
            this.seekSlider.slider("value", Math.floor((this.currentPlayer.position / this.currentPlayer.duration) * 1000));
        }
    };
    Player.prototype.playSong = function (song) {
        if (song == this.currentSong) {
            this.currentPlayer.resume();
        } else {
            this.stopCurrentSong();
            this.resolveSoundUrl(song);
        }
    };
    Player.prototype.stopCurrentSong = function () {
        if (this.currentPlayer != null) {
            this.currentPlayer.stop();
        }
    };
    Player.prototype.pause = function () {
        if (this.currentSong != null) {
            this.currentPlayer.pause();
        }
    };
    Player.prototype.seek = function (percentage) {
        if (this.currentPlayer != null) {
            this.currentPlayer.setPosition(Math.floor(this.currentPlayer.duration * (percentage / 1000)));
        }
    };
    Player.prototype.changeVolume = function (value) {
        if (this.currentSong != null) {
            this.currentPlayer.setVolume(value);
        }
    };
    Player.prototype.resolveSoundUrl = function (song) {
        var _this = this;
        this.currentSong = song;
        this.playbackId += 1;
        var currentId = this.playbackId;
        SC.get('/tracks', {
            q: song.title + " " + song.artist
        }, function (tracks) {
            if (tracks.length == 0) {
                _this.onSongError(song);
            } else {
                if (currentId == _this.playbackId) {
                    _this.playResolved(_this.bestTrack(tracks), song, currentId);
                }
            }
        });
    };
    Player.prototype.bestTrack = function (tracks) {
        var maxPlays = tracks[0].playback_count;
        var maxTrack = tracks[0];
        for (var i = 1; i < tracks.length; i++) {
            if (tracks[i].playback_count > maxPlays) {
                maxPlays = tracks[i].playback_count;
                maxTrack = tracks[i];
            }
        }
        return maxTrack;
    };
    Player.prototype.playResolved = function (trackInfo, song, playbackId) {
        var trackId = trackInfo["id"];
        this.streamSong(trackId, song, playbackId);
    };
    Player.prototype.streamSong = function (trackId, song, playbackId) {
        var _this = this;
        SC.stream("/tracks/" + trackId, {
            onfinish: function () {
                _this.onFinish(song);
            }
        }, function (sound) {
            _this.switchActiveSong(sound, playbackId);
        });
    };
    Player.prototype.switchActiveSong = function (sound, playbackId) {
        if (playbackId == this.playbackId) {
            this.currentPlayer = sound;
            sound.play();
        }
    };
    return Player;
})();
var Song = (function () {
    function Song(mbid, title, artist, imageUrl) {
        this.mbid = mbid;
        this.title = title;
        this.artist = artist;
        this.imageUrl = imageUrl;
    }

    return Song;
})();
//@ sourceMappingURL=main.js.map
