var playlistManager = null;
var PlaylistBinder = (function () {
    function PlaylistBinder() { }
    PlaylistBinder.prototype.buildPage = function (rootNode) {
        playlistManager = new PlaylistManager(rootNode);
        itemList.popItemList("playlist");
        this.loadData();
        itemList.pushItemList("playlist");
    };
    PlaylistBinder.prototype.bind = function () {
        itemList.popItemList("playlist");
        itemList.onInput = function (input) {
            playlistManager.addPlaylistServer(input);
        };
        itemList.show();
        $(window).bind("keydown", this.navigationHandler);
    };
    PlaylistBinder.prototype.loadData = function () {
        this.performLoadRequest();
    };
    PlaylistBinder.prototype.performLoadRequest = function () {
        $.ajax("/playlist/load", {
            type: "POST",
            dataType: "json",
            async: false,
            success: function (data) {
                for(var i = 0; i < data.length; i++) {
                    playlistManager.loadPlaylist(data[i].id, data[i].name);
                }
            },
            error: function (reason) {
                alert(reason);
            }
        });
    };
    PlaylistBinder.prototype.unbind = function () {
        itemList.pushItemList("playlist");
        itemList.hide();
        $(window).unbind("keydown", this.navigationHandler);
    };
    PlaylistBinder.prototype.navigationHandler = function (event) {
        switch(event.which) {
            case 38:
                playlistManager.givePreviousPlaylistFocus();
                event.preventDefault();
                break;
            case 40:
                playlistManager.giveNextPlaylistFocus();
                event.preventDefault();
                break;
        }
    };
    return PlaylistBinder;
})();
var PlaylistManager = (function () {
    function PlaylistManager(rootNode) {
        this.rootNode = rootNode;
        this.SEARCH_SECTION = 0;
        this.playLists = [];
        this.playListsQueue = [];
    }
    PlaylistManager.prototype.getPlaylist = function () {
        return this.playListsQueue;
    };
    PlaylistManager.prototype.deleteCurrentPlaylist = function () {
        this.playLists.splice(this.currentIndex, 1);
        this.playListsQueue.splice(this.currentIndex, 1);
        if(this.playListsQueue.length != 0) {
            if(this.currentIndex == 0) {
                this.givePlaylistFocus(this.playListsQueue[this.currentIndex]);
            } else {
                this.givePreviousPlaylistFocus();
            }
        }
    };
    PlaylistManager.prototype.addPlaylistServer = function (title) {
        var _this = this;
        $.ajax("/playlist/new/" + title, {
            type: "POST",
            dataType: "json",
            success: function (data) {
                _this.loadPlaylist(data.id, title);
            },
            error: function (reason) {
                alert(reason.toString());
            }
        });
    };
    PlaylistManager.prototype.loadPlaylist = function (idPlaylist, title) {
        var playList = new Playlist(idPlaylist, title);
        this.buildPage(playList);
        this.buildPlaylistItem(playList);
        this.pushPlaylist(playList);
    };
    PlaylistManager.prototype.buildPlaylistItem = function (playlist) {
        var _this = this;
        var item = new Item("playlist" + playlist.id, playlist.title);
        itemList.addItem(item);
        item.onSelect = function () {
            _this.givePlaylistFocus(playlist);
        };
        itemList.switchItem(item);
    };
    PlaylistManager.prototype.buildPage = function (playlist) {
        var rootNode = this.buildPlaylistPage(playlist);
        playlist.pageManager = new PlaylistPageManager(playlist, rootNode);
        playlist.pageManager.bind();
        this.requestSongsForPlaylist(playlist);
    };
    PlaylistManager.prototype.requestSongsForPlaylist = function (playlist) {
        var _this = this;
        $.ajax("/playlist/songs/" + playlist.id, {
            type: "POST",
            dataType: "json",
            success: function (data) {
                for(var i = 0; i < data.length; i++) {
                    var songInfo = new SongInfo(data[i].title, data[i].artist, data[i].album, data[i].genre, data[i].peek, data[i].weeksOnTop, data[i].positionChange);
                    var song = new Song(data[i].mbid, songInfo, data[i].imageUrl);
                    _this.addSongToPlaylist(song, playlist);
                }
            },
            error: function (reason) {
                alert(reason);
            }
        });
    };
    PlaylistManager.prototype.addSongToPlaylist = function (song, playlist) {
        var image = buildSmallSong(song);
        this.bindSong(song, image);
        playlist.pageManager.rootNode.find("#playlistSongContainer").append(image);
        playlist.songs.push(song);
    };
    PlaylistManager.prototype.bindSong = function (song, template) {
        var _this = this;
        var detailCallback = function (option, subOption) {
            if(option == 0) {
                _this.playSong(song);
            } else if(option == 1) {
                _this.changeToSearchSection();
                _this.searchFromSong(song);
            } else if(option == 2) {
                _this.removeSong(song, template);
            }
        };
        template.click(function (e) {
            songDetailManager.showDetails([
                {
                    label: "Play Now",
                    subOptions: []
                }, 
                {
                    label: "Search From Here",
                    subOptions: []
                }, 
                {
                    label: "Remove From Playlist",
                    subOptions: []
                }
            ], detailCallback, song, {
                x: e.pageX,
                y: e.pageY
            });
        });
    };
    PlaylistManager.prototype.searchFromSong = function (song) {
        searchManager.performSearch(song.info.title + " " + song.info.artist);
    };
    PlaylistManager.prototype.changeToSearchSection = function () {
        binders["playlist"].unbind();
        sectionManager.changeSection(this.SEARCH_SECTION);
    };
    PlaylistManager.prototype.playSong = function (song) {
        globalPlaylistManager.pushSong(song);
        globalPlaylistManager.playSong(song);
    };
    PlaylistManager.prototype.removeSong = function (song, imageContainer) {
        var currentPlaylist = this.playListsQueue[this.currentIndex];
        var indexOfSong = currentPlaylist.songs.indexOf(song);
        currentPlaylist.songs.splice(indexOfSong, 1);
        imageContainer.remove();
        this.deleteSongFromPlaylist(currentPlaylist.id, song.mbid);
    };
    PlaylistManager.prototype.deleteSongFromPlaylist = function (idPlaylist, idSong) {
        $.ajax("/playlist/song/delete/" + idPlaylist + "/" + idSong, {
            type: "POST"
        });
    };
    PlaylistManager.prototype.buildPlaylistPage = function (playlist) {
        var pageTemplate = template("#playlistPageTemplate", playlist.id, playlist.title);
        return $("#playListsContainer").append(pageTemplate).find("#" + playlist.id);
    };
    PlaylistManager.prototype.pushPlaylist = function (playlist) {
        this.playListsQueue.push(playlist);
        this.playLists[playlist.id] = playlist;
        this.givePlaylistFocus(playlist);
    };
    PlaylistManager.prototype.giveNextPlaylistFocus = function () {
        if(this.currentIndex > (this.playListsQueue.length - 2)) {
            return;
        }
        this.givePlaylistFocus(this.playListsQueue[this.currentIndex + 1]);
    };
    PlaylistManager.prototype.givePreviousPlaylistFocus = function () {
        if(this.currentIndex < 1) {
            return;
        }
        this.givePlaylistFocus(this.playListsQueue[this.currentIndex - 1]);
    };
    PlaylistManager.prototype.givePlaylistFocus = function (playlist) {
        var _this = this;
        this.currentIndex = this.playListsQueue.indexOf(playlist);
        this.playListsQueue.forEach(function (playlist, i) {
            playlist.pageManager.rootNode.transition({
                perspective: 100,
                translate3d: [
                    0, 
                    -100 * (i - _this.currentIndex), 
                    20 * (i - _this.currentIndex)
                ],
                opacity: (i > _this.currentIndex) ? 0 : (i == _this.currentIndex) ? 1 : 0.5
            }, 400).removeClass("hidden");
        });
        window.setTimeout(function () {
            _this.playListsQueue.forEach(function (session, index) {
                if(index > _this.currentIndex) {
                    $(session.pageManager.rootNode).addClass("hidden");
                }
            });
        }, 400);
    };
    return PlaylistManager;
})();
var PlaylistPageManager = (function () {
    function PlaylistPageManager(playlist, rootNode) {
        this.playlist = playlist;
        this.rootNode = rootNode;
    }
    PlaylistPageManager.prototype.bind = function () {
        var _this = this;
        $(this.rootNode).find("#playPlaylistButton").click(function () {
            _this.playPlaylist();
        });
        $(this.rootNode).find("#deletePlaylistButton").click(function () {
            _this.deletePlaylist();
        });
    };
    PlaylistPageManager.prototype.playPlaylist = function () {
        globalPlaylistManager.clearSongs();
        globalPlaylistManager.pushSongs(this.playlist.songs);
    };
    PlaylistPageManager.prototype.deletePlaylist = function () {
        this.deletePlaylistPage();
        this.deletePlaylistItem();
        this.deletePlaylistServer();
    };
    PlaylistPageManager.prototype.deletePlaylistPage = function () {
        var pageTemplate = template("#playlistPageTemplate", this.playlist.id, this.playlist.title);
        var toDelete = $("#playListsContainer").find("#" + this.playlist.id);
        toDelete.remove();
        playlistManager.deleteCurrentPlaylist();
    };
    PlaylistPageManager.prototype.deletePlaylistItem = function () {
        itemList.deleteItem("playlist" + this.playlist.id);
    };
    PlaylistPageManager.prototype.deletePlaylistServer = function () {
        $.ajax("/playlist/delete/" + this.playlist.id, {
            type: "POST",
            error: function (reason) {
                alert(reason);
            }
        });
    };
    return PlaylistPageManager;
})();
var Playlist = (function () {
    function Playlist(id, title) {
        this.id = id;
        this.title = title;
        this.songs = [];
    }
    return Playlist;
})();
//@ sourceMappingURL=playlists.js.map
