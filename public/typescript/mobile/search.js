var SearchManager = (function () {
    function SearchManager() {
        this.optionsContainer = null;
        this.searchPlaylistOptionContainer = null;
        this.searchAddToPlaying = null;
        this.searchPlaySong = null;
        this.searchPlaylistItems = null;
        this.selectedItem = null;
        this.playlistsCollapsed = true;
    }

    SearchManager.prototype.bind = function () {
        this.searchPlaylistOptionContainer = $("#searchPlaylistOptionContainer");
        this.searchAddToPlaying = $("#searchAddToPlaying");
        this.searchPlaySong = $("#searchPlaySong");
        this.searchPlaylistItems = $(".searchPlaylistItem");
    };
    SearchManager.prototype.bindControlls = function () {
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
    };
    SearchManager.prototype.playCurrentSong = function () {
        var item = this.selectedItem;
        var song = new Song(item.attr("songId"), item.attr("songTitle"), item.attr("songArtist"), item.attr("songImage"));
        globalPlaylistManager.pushSong(song);
        player.playSong(song);
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
    };
    SearchManager.prototype.takePlaylistsFocus = function () {
        this.playlistsCollapsed = true;
        this.searchPlaylistOptionContainer.css({
            opacity: 0
        });
    };
    SearchManager.prototype.addCurrentSongToNowPlaying = function () {
        if (this.selectedItem != null) {
            var item = $(this.selectedItem);
            var song = new Song(item.attr("songId"), item.attr("songTitle"), item.attr("songArtist"), item.attr("songImage"));
            globalPlaylistManager.pushSong(song);
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
        });
    };
    SearchManager.prototype.bindItems = function () {
        this.optionsContainer = $("#searchOptionContainer");
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
        this.bindControlls();
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
        item.parent().append(this.optionsContainer);
        this.giveOptionsFocus();
    };
    SearchManager.prototype.giveOptionsFocus = function () {
        this.optionsContainer.show(0);
    };
    return SearchManager;
})();
var mSearchManager = new SearchManager();
//@ sourceMappingURL=search.js.map
