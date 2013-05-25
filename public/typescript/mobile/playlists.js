var MobilePlaylistManager = (function () {
    function MobilePlaylistManager() {
        this.optionsContainer = null;
        this.selectedItem = null;
        this.optionsCollapsed = true;
        this.selectedPlaylist = null;
    }

    MobilePlaylistManager.prototype.bind = function () {
        $("#playNow").on("click", function (e) {
            var selectedSong = $(".playlistItemOptionContainerFocused");
            var songToPlay = new MSong(selectedSong.attr("songid"), selectedSong.attr("songtitle"), selectedSong.attr("songartist"), selectedSong.attr("songimage"));
            mPlaylistManager.playSong(songToPlay);
        });
        $("#searchFromHere").on("click", function (e) {
            var selectedSong = $(".playlistItemOptionContainerFocused");
            var query = selectedSong.attr("songtitle") + " " + selectedSong.attr("songartist");
            performSearch(query);
        });
        $("#deleteSong").on("click", function (e) {
            var selectedSong = $(".playlistItemOptionContainerFocused");
            var songId = selectedSong.attr("songid");
            mPlaylistManager.deleteSongFromPlaylist(songId);
        });
    };
    MobilePlaylistManager.prototype.onAddPlaylistInput = function (query) {
        this.addPlaylist(query);
    };
    MobilePlaylistManager.prototype.onPlaylistSelected = function (id, title) {
        this.selectedPlaylist = id;
        this.loadPlaylist(id, title);
    };
    MobilePlaylistManager.prototype.loadPlaylist = function (id, title) {
        var _this = this;
        titleManager.setTitle(title);
        itemManager.loadContent("/mobile/playlist/" + encodeURIComponent(id), function () {
            _this.bindItems();
        });
    };
    MobilePlaylistManager.prototype.addPlaylist = function (query) {
        var _this = this;
        $.ajax("/mobile/playlist/add/" + encodeURIComponent(query), {
            type: "GET",
            dataType: "json",
            success: function (data) {
                itemManager.addItem(data.id, query);
                _this.onPlaylistSelected(data.id, query);
            },
            error: function (reason) {
                alert(reason.toString());
            }
        });
    };
    MobilePlaylistManager.prototype.bindItems = function () {
        var _this = this;
        var newURL = 'http%3A%2F%2Fuplayed.herokuapp.com%2Fget%2F' + this.selectedPlaylist;
        this.optionsContainer = $("#playlistOptionContainer");
        var _this = this;
        $(".playlistItemOptionContainer").on("click", function (e) {
            _this.searchItemClicked(this);
        });
        $("#mobilePlayButton").on("click", function () {
            _this.playPlaylist();
        });
        $("#mobileShareButton").on("click", function (e) {
            e.stopPropagation();
            _this.sharePlaylist();
        });
        $("#mobileDeleteButton").on("click", function () {
            _this.deletePlaylist();
        });
        $("#facebookButton").on("click", function () {
            _this.shareOnFacebook(newURL);
        });
        $("#twitterButton").on("click", function () {
            _this.shareOnTwitter(newURL);
        });
        $("#googleButton").on("click", function () {
            _this.shareOnGooglePlus(newURL);
        });
        this.closeOverlay();
    };
    MobilePlaylistManager.prototype.playPlaylist = function () {
        var songs = $(".playlistItemOptionContainer");
        globalPlaylistManager.clearSongs();
        for (var i = 0; i < songs.length; i++) {
            var song = new MSong(songs[i].getAttribute("songId"), songs[i].getAttribute("songTitle"), songs[i].getAttribute("songArtist"), songs[i].getAttribute("songImage"));
            globalPlaylistManager.pushSong(song);
        }
    };
    MobilePlaylistManager.prototype.sharePlaylist = function () {
        $('#box').fadeIn('fast');
    };
    MobilePlaylistManager.prototype.shareOnFacebook = function (urlPlaylist) {
        window.open('https://www.facebook.com/sharer/sharer.php?u=' + urlPlaylist, 'win1', 'width=500,height=400,menubar,left=100,top=100');
    };
    MobilePlaylistManager.prototype.shareOnTwitter = function (urlPlaylist) {
        window.open('https://twitter.com/intent/tweet?text=Currently+listening+to&url=' + urlPlaylist, 'winTwitter', 'width=500,height=400,menubar,left=100,top=100');
    };
    MobilePlaylistManager.prototype.shareOnGooglePlus = function (urlPlaylist) {
        window.open('https://plus.google.com/share?url=' + urlPlaylist + '&text=%7C+UPlay3D+%7C+Currently+listening+to', 'winTwitter', 'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=400,width=500,left=100,top=100');
    };
    MobilePlaylistManager.prototype.closeOverlay = function () {
        $(document).click(function (e) {
            if (e.target.id != "#box") {
                $('#box').fadeOut('fast');
            }
        });
    };
    MobilePlaylistManager.prototype.deletePlaylist = function () {
        var _this = this;
        titleManager.setTitle("Select An Item");
        itemManager.deleteItem(this.selectedPlaylist);
        itemManager.loadContent("/mobile/playlist/delete/" + encodeURIComponent(this.selectedPlaylist), function () {
            _this.bindItems();
        });
    };
    MobilePlaylistManager.prototype.searchItemClicked = function (item) {
        if (item == this.selectedItem) {
            this.refocusOptions(item);
        } else {
            this.changeOptionsFocus(item);
        }
    };
    MobilePlaylistManager.prototype.refocusOptions = function (item) {
        if (this.optionsCollapsed) {
            this.giveOptionsFocus();
        } else {
            this.takeOptionsFocus(item);
        }
    };
    MobilePlaylistManager.prototype.changeOptionsFocus = function (item) {
        $(item).addClass("playlistItemOptionContainerFocused");
        if (this.selectedItem != null) {
            $(this.selectedItem).removeClass("playlistItemOptionContainerFocused");
        }
        this.selectedItem = item;
        if (this.optionsCollapsed) {
            this.giveOptionsFocus();
        }
    };
    MobilePlaylistManager.prototype.giveOptionsFocus = function () {
        this.optionsCollapsed = false;
        this.optionsContainer.fadeIn(400);
    };
    MobilePlaylistManager.prototype.takeOptionsFocus = function (item) {
        $(item).removeClass("playlistItemOptionContainerFocused");
        this.optionsCollapsed = true;
        this.optionsContainer.fadeOut(400);
    };
    MobilePlaylistManager.prototype.deleteSongFromPlaylist = function (songId) {
        var _this = this;
        this.optionsContainer.fadeOut(400);
        itemManager.loadContent("/mobile/playlist/song/delete/" + encodeURIComponent(this.selectedPlaylist) + "/" + encodeURIComponent(songId), function () {
            _this.bindItems();
        });
    };
    MobilePlaylistManager.prototype.playSong = function (song) {
        this.optionsContainer.fadeOut(400);
        globalPlaylistManager.pushSong(song);
    };
    return MobilePlaylistManager;
})();
var mPlaylistManager = new MobilePlaylistManager();
//@ sourceMappingURL=playlists.js.map
