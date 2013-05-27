var MobilePlaylistManager = (function () {
    function MobilePlaylistManager() {
        this.optionsContainer = null;
        this.selectedItem = null;
        this.selectedPlaylist = null;
        this.playNow = null;
        this.searchFromHere = null;
        this.deleteSong = null;
    }

    MobilePlaylistManager.prototype.bind = function () {
        this.optionsContainer = $("#playlistOptionContainer");
        this.playNow = $("#playNow");
        this.searchFromHere = $("#searchFromHere");
        this.deleteSong = $("#deleteSong");
    };
    MobilePlaylistManager.prototype.bindControls = function () {
        var _this = this;
        this.playNow.click(function () {
            _this.playNowMethod();
        });
        this.searchFromHere.click(function () {
            _this.searchFromHereMethod();
        });
        this.deleteSong.click(function () {
            _this.deleteSongMethod();
        });
    };
    MobilePlaylistManager.prototype.playNowMethod = function () {
        var item = $(this.selectedItem);
        var song = new MSong(item.attr("songId"), item.attr("songTitle"), item.attr("songArtist"), item.attr("songImage"));
        globalPlaylistManager.pushSongAndPlay(song);
        this.cancelMoveOptionsToItem(this.selectedItem);
    };
    MobilePlaylistManager.prototype.searchFromHereMethod = function () {
        var item = this.selectedItem;
        var query = item.attr("songtitle") + " " + item.attr("songartist");
        performSearch(query);
    };
    MobilePlaylistManager.prototype.deleteSongMethod = function () {
        var selectedSong = this.selectedItem;
        var songId = selectedSong.attr("songid");
        mPlaylistManager.deleteSongFromPlaylist(songId);
    };
    MobilePlaylistManager.prototype.deleteSongFromPlaylist = function (songId) {
        var _this = this;
        $.ajax("/mobile/playlist/song/delete/" + encodeURIComponent(this.selectedPlaylist) + "/" + encodeURIComponent(songId), {
            type: "GET",
            success: function () {
                _this.deleteSongFromTable();
            },
            error: function (reason) {
                alert(reason.toString());
            }
        });
    };
    MobilePlaylistManager.prototype.deleteSongFromTable = function () {
        this.optionsContainer.remove();
        this.selectedItem.remove();
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
        var _this = this;
        $(".playlistItemTable").draggable({
            axis: "x",
            handle: ".playlistItemOptionContainer",
            start: function () {
                _this.startMoveOption($(this));
            },
            stop: function () {
                _this.stopMoveOption($(this));
            }
        });
        $("#mobilePlayButton").click(function () {
            _this.playPlaylist();
        });
        $("#mobileShareButton").click(function (e) {
            e.stopPropagation();
            _this.sharePlaylist();
        });
        $("#mobileDeleteButton").click(function () {
            _this.deletePlaylist();
        });
        $("#facebookButton").click(function () {
            _this.shareOnFacebook(newURL);
        });
        $("#twitterButton").click(function () {
            _this.shareOnTwitter(newURL);
        });
        $("#googleButton").click(function () {
            _this.shareOnGooglePlus(newURL);
        });
        this.closeOverlay();
    };
    MobilePlaylistManager.prototype.playPlaylist = function () {
        var songs = $(".playlistItemTable");
        globalPlaylistManager.clearSongs();
        for (var i = 0; i < songs.length; i++) {
            var song = new MSong(songs[i].getAttribute("songId"), songs[i].getAttribute("songTitle"), songs[i].getAttribute("songArtist"), songs[i].getAttribute("songImage"));
            if (i == 0) {
                globalPlaylistManager.pushSongAndPlay(song);
            } else {
                globalPlaylistManager.pushSong(song);
            }
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
        titleManager.setTitle("Select An Item");
        itemManager.deleteItem(this.selectedPlaylist);
        $.ajax("/mobile/playlist/delete/" + encodeURIComponent(this.selectedPlaylist), {
            type: "GET",
            error: function (reason) {
                alert(reason.toString());
            }
        });
        itemManager.deleteItem(this.selectedPlaylist);
        $(".playlistOptions").remove();
        $(".playlistResult").remove();
    };
    MobilePlaylistManager.prototype.stopMoveOption = function (item) {
        if (item.position().left < -100) {
            this.moveOptionsToItem(item);
        } else {
            this.cancelMoveOptionsToItem(item);
        }
    };
    MobilePlaylistManager.prototype.cancelMoveOptionsToItem = function (item) {
        item.css({
            WebkitTransition: "-webkit-transform 0.4s ease",
            transition: "transform 0.4s ease",
            transform: "translate3d(0,0,0)"
        });
    };
    MobilePlaylistManager.prototype.moveOptionsToItem = function (item) {
        this.selectedItem = item;
        this.bindControls();
        item.css({
            WebkitTransition: "-webkit-transform 0.4s ease",
            transition: "transform 0.4s ease",
            transform: "translate3d(-270,0,0)"
        });
    };
    MobilePlaylistManager.prototype.hidePreviousOption = function (currentItem) {
        if (this.selectedItem != null && this.selectedItem != currentItem) {
            this.selectedItem.css({
                WebkitTransition: "",
                transition: "",
                WebkitTransform: "translate3d(-0,0,0)",
                transform: "translate3d(-0,0,0)"
            });
        }
    };
    MobilePlaylistManager.prototype.startMoveOption = function (item) {
        this.hidePreviousOption(item);
        item.css({
            WebkitTransition: "",
            transition: ""
        });
        this.optionsContainer.remove();
        item.parent().prepend(this.optionsContainer);
        this.giveOptionsFocus();
    };
    MobilePlaylistManager.prototype.giveOptionsFocus = function () {
        this.optionsContainer.show(0);
    };
    return MobilePlaylistManager;
})();
var mPlaylistManager = new MobilePlaylistManager();
//@ sourceMappingURL=playlists.js.map
