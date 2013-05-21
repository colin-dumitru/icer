var SearchManager = (function () {
    function SearchManager() {
        this.optionsContainer = null;
        this.searchPlaylistOptionContainer = null;
        this.selectedItem = null;
        this.optionsCollapsed = true;
        this.playlistsCollapsed = true;
    }

    SearchManager.prototype.bind = function () {
        var _this = this;
        this.searchPlaylistOptionContainer = $("#searchPlaylistOptionContainer");
        this.bindPlaylists();
        $("#searchAddToPlaying").click(function () {
            _this.addCurrentSongToNowPlaying();
        });
        $("#searchPlaySong").click(function () {
            _this.playCurrentSong();
        });
        $("#searchAddToPlaylist").click(function () {
            _this.togglePlaylist();
        });
    };
    SearchManager.prototype.bindPlaylists = function () {
        var _this = this;
        $(".searchPlaylistItem").click(function () {
            _this.addCurrentSongToPlaylist($(this).attr("playlistId"));
            _this.takeOptionsFocus(_this.selectedItem);
        });
    };
    SearchManager.prototype.playCurrentSong = function () {
        var item = $(this.selectedItem);
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
    SearchManager.prototype.togglePlaylist = function () {
        if (this.playlistsCollapsed) {
            this.givePlaylistFocus();
        } else {
            this.takePlaylistsFocus();
        }
    };
    SearchManager.prototype.takePlaylistsFocus = function () {
        this.playlistsCollapsed = true;
        this.searchPlaylistOptionContainer.css({
            opacity: 0
        });
    };
    SearchManager.prototype.givePlaylistFocus = function () {
        this.playlistsCollapsed = false;
        this.searchPlaylistOptionContainer.css({
            opacity: 1
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
        $(".searchItemOptionContainer").on("click", function (e) {
            _this.searchItemClicked(this);
        });
    };
    SearchManager.prototype.searchItemClicked = function (item) {
        if (item == this.selectedItem) {
            this.refocusOptions(item);
        } else {
            this.changeOptionsFocus(item);
        }
    };
    SearchManager.prototype.refocusOptions = function (item) {
        if (this.optionsCollapsed) {
            this.giveOptionsFocus();
        } else {
            this.takeOptionsFocus(item);
        }
    };
    SearchManager.prototype.changeOptionsFocus = function (item) {
        $(item).addClass("searchItemOptionContainerFocused");
        if (this.selectedItem != null) {
            $(this.selectedItem).removeClass("searchItemOptionContainerFocused");
        }
        this.selectedItem = item;
        if (this.optionsCollapsed) {
            this.giveOptionsFocus();
        }
    };
    SearchManager.prototype.giveOptionsFocus = function () {
        this.optionsCollapsed = false;
        this.optionsContainer.css({
            opacity: 1
        });
    };
    SearchManager.prototype.takeOptionsFocus = function (item) {
        $(item).removeClass("searchItemOptionContainerFocused");
        this.optionsCollapsed = true;
        this.optionsContainer.css({
            opacity: 0
        });
        this.takePlaylistsFocus();
    };
    return SearchManager;
})();
var mSearchManager = new SearchManager();
//@ sourceMappingURL=search.js.map
