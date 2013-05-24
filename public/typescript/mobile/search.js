var SearchManager = (function () {
    function SearchManager() {
        this.optionsContainer = null;
        this.searchPlaylistOptionContainer = null;
        this.searchAddToPlaying = null;
        this.searchPlaySong = null;
        this.searchPlaylistItems = null;
        this.searchNewPlaylistInput = null;
        this.selectedItem = null;
    }

    SearchManager.prototype.bind = function () {
        this.searchPlaylistOptionContainer = $("#searchPlaylistOptionContainer");
        this.searchAddToPlaying = $("#searchAddToPlaying");
        this.searchPlaySong = $("#searchPlaySong");
        this.searchNewPlaylistInput = $("#searchNewPlaylistInput");
        this.searchPlaylistItems = $(".searchPlaylistItem");
        this.optionsContainer = $("#searchOptionContainer");
    };
    SearchManager.prototype.bindControls = function () {
        var _this = this;
        var _this = this;
        this.searchAddToPlaying.click(function () {
            _this.addCurrentSongToNowPlaying();
        });
        this.searchPlaySong.click(function () {
            _this.playCurrentSong();
        });
        this.searchPlaylistItems.click(function () {
            _this.addCurrentSongToPlaylist($(this).attr("playlistId"));
        });
        this.searchNewPlaylistInput.keypress(function (e) {
            if (e.which == 13) {
                _this.addSongToNewPlaylist($(this).val());
            }
        });
    };
    SearchManager.prototype.addSongToNewPlaylist = function (playlistLabel) {
        var _this = this;
        $.ajax("/playlist/new/" + playlistLabel, {
            type: "POST",
            dataType: "json",
            success: function (data) {
                _this.addCurrentSongToPlaylist(data.id);
                _this.cancelMoveOptionsToItem(_this.selectedItem);
            }
        });
    };
    SearchManager.prototype.playCurrentSong = function () {
        var item = this.selectedItem;
        var song = new Song(item.attr("songId"), item.attr("songTitle"), item.attr("songArtist"), item.attr("songImage"));
        globalPlaylistManager.pushSong(song);
        player.playSong(song);
        this.cancelMoveOptionsToItem(this.selectedItem);
    };
    SearchManager.prototype.addCurrentSongToPlaylist = function (playlistId) {
        var item = $(this.selectedItem);
        var song = new Song(item.attr("songId"), item.attr("songTitle"), item.attr("songArtist"), item.attr("songImage"));
        $.ajax({
            url: "/playlist/song/add/" + playlistId,
            type: "POST",
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify({
                mbid: song.mbid,
                info: {
                    title: song.title,
                    artist: song.artist
                },
                imageUrl: song.imageUrl
            })
        });
        this.cancelMoveOptionsToItem(this.selectedItem);
    };
    SearchManager.prototype.addCurrentSongToNowPlaying = function () {
        if (this.selectedItem != null) {
            var item = $(this.selectedItem);
            var song = new Song(item.attr("songId"), item.attr("songTitle"), item.attr("songArtist"), item.attr("songImage"));
            globalPlaylistManager.pushSong(song);
            this.cancelMoveOptionsToItem(this.selectedItem);
        }
    };
    SearchManager.prototype.onSearchInput = function (query) {
        itemManager.addItem(query, query);
        this.performSearch(query);
    };
    SearchManager.prototype.onSearchSelected = function (id) {
        this.performSearch(id);
    };
    SearchManager.prototype.performSearch = function (query) {
        var _this = this;
        titleManager.setTitle(query);
        itemManager.loadContent("/mobile/search/" + encodeURIComponent(query), function () {
            _this.bindItems();
            _this.bind();
            _this.bindControls();
        });
    };
    SearchManager.prototype.bindItems = function () {
        var _this = this;
        $(".searchItemTable").draggable({
            axis: "x",
            handle: ".searchItemOptionContainer",
            start: function () {
                _this.startMoveOption($(this));
            },
            stop: function () {
                _this.stopMoveOption($(this));
            }
        });
    };
    SearchManager.prototype.stopMoveOption = function (item) {
        if (item.position().left < -100) {
            this.moveOptionsToItem(item);
        } else {
            this.cancelMoveOptionsToItem(item);
        }
    };
    SearchManager.prototype.cancelMoveOptionsToItem = function (item) {
        item.css({
            WebkitTransition: "-webkit-transform 0.4s ease",
            transition: "transform 0.4s ease",
            WebkitTransform: "translate3d(0,0,0)",
            transform: "translate3d(0,0,0)"
        });
    };
    SearchManager.prototype.moveOptionsToItem = function (item) {
        this.selectedItem = item;
        this.bindControls();
        item.css({
            WebkitTransition: "-webkit-transform 0.4s ease",
            transition: "transform 0.4s ease",
            WebkitTransform: "translate3d(-270,0,0)",
            transform: "translate3d(-270,0,0)"
        });
    };
    SearchManager.prototype.hidePreviousOption = function (currentItem) {
        if (this.selectedItem != null && this.selectedItem != currentItem) {
            this.selectedItem.css({
                WebkitTransition: "",
                transition: "",
                WebkitTransform: "translate3d(-0,0,0)",
                transform: "translate3d(-0,0,0)"
            });
        }
    };
    SearchManager.prototype.startMoveOption = function (item) {
        this.hidePreviousOption(item);
        item.css({
            WebkitTransition: "",
            transition: ""
        });
        this.optionsContainer.remove();
        item.parent().prepend(this.optionsContainer);
        this.giveOptionsFocus();
    };
    SearchManager.prototype.giveOptionsFocus = function () {
        this.optionsContainer.show(0);
    };
    return SearchManager;
})();
var mSearchManager = new SearchManager();
//@ sourceMappingURL=search.js.map
