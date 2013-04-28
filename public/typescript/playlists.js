var PlaylistBinder = (function () {
    function PlaylistBinder() {
        this.firstDisplay = true;
    }
    PlaylistBinder.prototype.buildPage = function (rootNode) {
        this.playlistManager = new PlaylistManager(rootNode);
    };
    PlaylistBinder.prototype.bind = function () {
        var _this = this;
        itemList.popItemList("playlist");
        if(this.firstDisplay) {
            this.loadData();
        }
        itemList.onInput = function (input) {
            _this.playlistManager.addPlaylistServer(input);
        };
        itemList.show();
        $(window).bind("keydown", this.navigationHandler);
    };
    PlaylistBinder.prototype.loadData = function () {
        this.performLoadRequest();
        this.firstDisplay = false;
    };
    PlaylistBinder.prototype.performLoadRequest = function () {
        var _this = this;
        $.ajax("/playlist/load", {
            type: "POST",
            dataType: "json",
            success: function (data) {
                for(var i = 0; i < data.length; i++) {
                    _this.playlistManager.loadPlaylist(data[i].id, data[i].name);
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
                (binders["playlist"]).playlistManager.givePreviousPlaylistFocus();
                event.preventDefault();
                break;
            case 40:
                (binders["playlist"]).playlistManager.giveNextPlaylistFocus();
                event.preventDefault();
                break;
        }
    };
    return PlaylistBinder;
})();
var PlaylistManager = (function () {
    function PlaylistManager(rootNode) {
        this.rootNode = rootNode;
        this.playLists = [];
        this.playListsQueue = [];
    }
    PlaylistManager.prototype.addPlaylistServer = function (title) {
        var _this = this;
        $.ajax("/playlist/new/" + title, {
            type: "POST",
            dataType: "json",
            success: function (data) {
                _this.loadPlaylist(data.id, title);
            },
            error: function (reason) {
                alert(reason);
            }
        });
    };
    PlaylistManager.prototype.loadPlaylist = function (idPlaylist, title) {
        var id = "playlist" + idPlaylist;
        var playList = new Playlist(id, title);
        this.buildPage(playList);
        this.buildPlaylistItem(playList);
        this.pushPlaylist(playList);
    };
    PlaylistManager.prototype.buildPlaylistItem = function (playlist) {
        var _this = this;
        var item = new Item(playlist.id, playlist.title);
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
        var title = randomSongTitle();
        var image = template("#imageMock", title.title, title.artist);
        for(var i = 0; i < 30; i++) {
            playlist.pageManager.rootNode.find("#playlistSongContainer").append(this.buildMockImage(image));
        }
    };
    PlaylistManager.prototype.buildMockImage = function (template) {
        var imageContainer = $("<span></span>");
        imageContainer.append(template);
        imageContainer.addClass("inline");
        imageContainer.click(function (e) {
            songDetailManager.showDetails([
                "Play Now", 
                "Search From Here", 
                "Remove From Playlist"
            ], function (selectedItem) {
            }, "/assets/mock/bio.html", {
                x: e.pageX,
                y: e.pageY
            });
        });
        return imageContainer;
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
    };
    return PlaylistPageManager;
})();
var Playlist = (function () {
    function Playlist(id, title) {
        this.id = id;
        this.title = title;
    }
    return Playlist;
})();
//@ sourceMappingURL=playlists.js.map
