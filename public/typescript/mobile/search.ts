declare var $;


class SearchManager {

    private optionsContainer = null;
    private searchPlaylistOptionContainer = null;
    private searchAddToPlaying = null;
    private searchPlaySong = null;
    private searchPlaylistItems = null;

    private selectedItem = null;
    private playlistsCollapsed = true;

    bind() {
        this.searchPlaylistOptionContainer = $("#searchPlaylistOptionContainer");
        this.searchAddToPlaying = $("#searchAddToPlaying");
        this.searchPlaySong = $("#searchPlaySong");
        this.searchPlaylistItems = $(".searchPlaylistItem");
    }

    private bindControlls() {
        var _this = this;

        this.searchAddToPlaying.click(() => {
            this.addCurrentSongToNowPlaying();
        });
        this.searchPlaySong.click(() => {
            this.playCurrentSong();
        });
        this.searchPlaylistItems.click(function () {
            _this.addCurrentSongToPlaylist($(this).attr("playlistId"));
        });
    }

    private playCurrentSong() {
        var item = this.selectedItem;
        var song = new Song(item.attr("songId"), item.attr("songTitle"), item.attr("songArtist"), item.attr("songImage"));
        globalPlaylistManager.pushSong(song);
        player.playSong(song);
    }

    private addCurrentSongToPlaylist(playlistId) {
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
    }

    private takePlaylistsFocus() {
        this.playlistsCollapsed = true;
        this.searchPlaylistOptionContainer.css({
            opacity: 0
        });
    }

    private addCurrentSongToNowPlaying() {
        if (this.selectedItem != null) {
            var item = $(this.selectedItem);
            var song = new Song(item.attr("songId"), item.attr("songTitle"), item.attr("songArtist"), item.attr("songImage"));
            globalPlaylistManager.pushSong(song);
        }
    }

    onSearchInput(query:string) {
        itemManager.addItem(query, query);
        this.performSearch(query);
    }

    onSearchSelected(id:string) {
        this.performSearch(id);
    }

    private performSearch(query:string) {
        titleManager.setTitle(query);
        itemManager.loadContent("/mobile/search/" + encodeURIComponent(query), () => {
            this.bindItems();
        });
    }

    private bindItems() {
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
    }

    private stopMoveOption(item) {
        if (item.position().left < -100) {
            this.moveOptionsToItem(item);
        } else {
            this.cancelMoveOptionsToItem(item);
        }
    }

    private cancelMoveOptionsToItem(item) {
        item.css({
            WebkitTransition: "-webkit-transform 0.4s ease",
            transition: "transform 0.4s ease",
            WebkitTransform: "translate3d(0,0,0)",
            transform: "translate3d(0,0,0)"
        });
    }

    private moveOptionsToItem(item) {
        this.selectedItem = item;
        this.bindControlls();
        item.css({
            WebkitTransition: "-webkit-transform 0.4s ease",
            transition: "transform 0.4s ease",
            WebkitTransform: "translate3d(-270,0,0)",
            transform: "translate3d(-270,0,0)"
        });
    }

    private hidePreviousOption(currentItem) {
        if (this.selectedItem != null && this.selectedItem != currentItem) {
            this.selectedItem.css({
                WebkitTransition: "",
                transition: "",
                WebkitTransform: "translate3d(-0,0,0)",
                transform: "translate3d(-0,0,0)"
            });
        }
    }

    private startMoveOption(item) {
        this.hidePreviousOption(item);
        item.css({
            WebkitTransition: "",
            transition: ""
        });
        this.optionsContainer.remove();
        item.parent().append(this.optionsContainer);
        this.giveOptionsFocus();
    }

    private giveOptionsFocus() {
        this.optionsContainer.show(0);
    }
}
var mSearchManager = new SearchManager();
