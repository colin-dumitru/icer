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
        this.playingSongOptionContainer = null;
        this.playButton = null;
        this.previousButton = null;
        this.nextButton = null;
        this.upButton = null;
        this.downButton = null;
        this.deletePlayingSong = null;
        this.deletePlayingSongs = null;
        this.playCurrentSong = null;
        this.collapsed = true;
        this.playing = false;
        this.selectedSongItem = null;
        this.playingSongItem = null;
    }

    GlobalPlaylistManager.prototype.bind = function () {
        var _this = this;
        this.progressBar = $("#progressBars");
        this.volumeSlider = $("#volumeSlider");
        this.playbackArrow = $("#playbackArrow");
        this.footer = $("#footer");
        this.playbackContainer = $("#playbackContainer");
        this.playingSongs = $("#playingSongs");
        this.playButton = $("#playButton");
        this.nextButton = $("#nextButton");
        this.previousButton = $("#previousButton");
        this.playingSongOptionContainer = $("#playingSongOptionContainer");
        this.upButton = $("#upButton");
        this.downButton = $("#downButton");
        this.deletePlayingSong = $("#deletePlayingSong");
        this.deletePlayingSongs = $("#deletePlayingSongs");
        this.playCurrentSong = $("#playCurrentSong");
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
        this.playButton.click(function () {
            _this.playToggle();
        });
        this.upButton.click(function () {
            _this.moveUp();
        });
        this.downButton.click(function () {
            _this.moveDown();
        });
        this.deletePlayingSong.click(function () {
            _this.deleteCurrentSong();
        });
        this.deletePlayingSongs.click(function () {
            _this.clearSongs();
        });
        this.playCurrentSong.click(function () {
            _this.playSelectedSong();
        });
        this.nextButton.click(function () {
            _this.playNext();
        });
        this.previousButton.click(function () {
            _this.playPrevious();
        });
    };
    GlobalPlaylistManager.prototype.playNext = function () {
        var nextItem = $(this.playingSongItem).next().get();
        this.resumePlayingSong(nextItem);
    };
    GlobalPlaylistManager.prototype.playPrevious = function () {
        var prevItem = $(this.playingSongItem).prev().get();
        this.resumePlayingSong(prevItem);
    };
    GlobalPlaylistManager.prototype.playSelectedSong = function () {
        this.playingSongItem = this.selectedSongItem;
        this.resumePlayingSong();
    };
    GlobalPlaylistManager.prototype.deleteCurrentSong = function () {
        $(this.selectedSongItem).remove();
    };
    GlobalPlaylistManager.prototype.moveUp = function () {
        var qitem = $(this.selectedSongItem);
        qitem.insertBefore(qitem.prev());
    };
    GlobalPlaylistManager.prototype.moveDown = function () {
        var qitem = $(this.selectedSongItem);
        qitem.insertAfter(qitem.next());
    };
    GlobalPlaylistManager.prototype.playToggle = function () {
        if (this.playing) {
            this.pausePlayingSong();
        } else {
            this.resumePlayingSong();
        }
    };
    GlobalPlaylistManager.prototype.pausePlayingSong = function () {
        this.playing = false;
        this.playButton.attr("src", "assets/images/paused.png");
        player.pause();
    };
    GlobalPlaylistManager.prototype.resumePlayingSong = function (item) {
        if (typeof item === "undefined") {
            item = this.playingSongItem;
        }
        this.playing = true;
        this.playButton.attr("src", "assets/images/play.png");
        if (item == null) {
            this.playSong(this.getFirstSongItem().get());
        } else {
            this.playSong(item);
        }
    };
    GlobalPlaylistManager.prototype.playSong = function (item) {
        $(this.playingSongItem).removeClass("playingSongPlaying");
        this.playingSongItem = item;
        $(this.playingSongItem).addClass("playingSongPlaying");
        var selectedSong = this.convertItemToSong($(item));
        player.playSong(selectedSong);
    };
    GlobalPlaylistManager.prototype.getFirstSongItem = function () {
        return this.playingSongs.children().first();
    };
    GlobalPlaylistManager.prototype.giveFocus = function () {
        this.collapsed = false;
        this.footer.css({
            transform: "translate3d(0, -200px, 0)"
        });
        this.playbackContainer.show(0);
    };
    GlobalPlaylistManager.prototype.takeFocus = function () {
        this.collapsed = true;
        this.footer.css({
            transform: "translate3d(0, 0px, 0)"
        });
        this.playbackContainer.delay(400).hide(0);
    };
    GlobalPlaylistManager.prototype.changePosition = function (position) {
        player.seek(position);
    };
    GlobalPlaylistManager.prototype.changeVolume = function (position) {
        player.changeVolume(position);
    };
    GlobalPlaylistManager.prototype.pushSong = function (song) {
        var item = this.convertSongToItem(song);
        this.bindItemClick(item, song);
        this.playingSongs.append(item);
    };
    GlobalPlaylistManager.prototype.pushSongAndPlay = function (song) {
        var item = this.convertSongToItem(song);
        this.bindItemClick(item, song);
        this.playingSongs.append(item);
        this.resumePlayingSong(item.get());
    };
    GlobalPlaylistManager.prototype.clearSongs = function () {
        this.playingSongs.empty();
    };
    GlobalPlaylistManager.prototype.bindItemClick = function (item, song) {
        var _this = this;
        $(item).click(function () {
            _this.toggleOptions(item, song);
        });
    };
    GlobalPlaylistManager.prototype.toggleOptions = function (item, song) {
        if (item == this.selectedSongItem) {
            this.hideOptions();
        } else {
            this.showOptions(item);
        }
    };
    GlobalPlaylistManager.prototype.showOptions = function (item) {
        $(this.selectedSongItem).removeClass("playingSongSelected");
        this.selectedSongItem = item;
        $(this.selectedSongItem).addClass("playingSongSelected");
        this.playingSongOptionContainer.css({
            transform: "translate3d(-38px, 0, 0)"
        });
    };
    GlobalPlaylistManager.prototype.hideOptions = function () {
        $(this.selectedSongItem).removeClass("playingSongSelected");
        this.selectedSongItem = null;
        this.playingSongOptionContainer.css({
            transform: "translate3d(0, 0, 0)"
        });
    };
    GlobalPlaylistManager.prototype.convertSongToItem = function (song) {
        var container = $("<div></div>");
        container.addClass("playingSong");
        container.attr("songId", song.mbid);
        container.attr("songTitle", song.title);
        container.attr("songArtist", song.artist);
        container.attr("songImageUrl", song.imageUrl);
        container.text(song.title + "-" + song.artist);
        return container;
    };
    GlobalPlaylistManager.prototype.convertItemToSong = function (item) {
        return new MSong(item.attr("songId"), item.attr("songTitle"), item.attr("songArtist"), item.attr("songImageUrl"));
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
        this.playingSongTitle = null;
        this.playingSongArtist = null;
        this.playingSongImage = null;
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
        this.playingSongTitle = $("#playingSongTitle");
        this.playingSongArtist = $("#playingSongArtist");
        this.playingSongImage = $("#playingSongImage");
    };
    Player.prototype.updateElapsed = function () {
        if (this.currentPlayer != null) {
            this.seekSlider.slider("value", Math.floor((this.currentPlayer.position / this.currentPlayer.duration) * 1000));
        }
    };
    Player.prototype.playSong = function (song) {
        if (song.mbid != null && song.mbid == this.currentSongMbid()) {
            this.currentPlayer.resume();
        } else {
            this.stopCurrentSong();
            this.resolveSoundUrl(song);
            this.updateSongInfo(song);
        }
    };
    Player.prototype.currentSongMbid = function () {
        if (this.currentSong == null) {
            return null;
        } else {
            return this.currentSong.mbid;
        }
    };
    Player.prototype.updateSongInfo = function (song) {
        this.playingSongTitle.text(song.title);
        this.playingSongArtist.text(song.artist);
        this.playingSongImage.attr("src", song.imageUrl);
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
var MSong = (function () {
    function MSong(mbid, title, artist, imageUrl) {
        this.mbid = mbid;
        this.title = title;
        this.artist = artist;
        this.imageUrl = imageUrl;
    }

    return MSong;
})();
//@ sourceMappingURL=main.js.map
