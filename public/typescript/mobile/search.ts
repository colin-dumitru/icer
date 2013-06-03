declare var $;


class SearchManager {

    private optionsContainer = null;
    private searchPlaylistOptionContainer = null;
    private searchAddToPlaying = null;
    private searchPlaySong = null;
    private searchPlaylistItems = null;
    private searchNewPlaylistInput = null;

    private selectedItem = null;

    bind() {
        this.searchPlaylistOptionContainer = $("#searchPlaylistOptionContainer");
        this.searchAddToPlaying = $("#searchAddToPlaying");
        this.searchPlaySong = $("#searchPlaySong");
        this.searchNewPlaylistInput = $("#searchNewPlaylistInput");
        this.searchPlaylistItems = $(".searchPlaylistItem");
        this.optionsContainer = $("#searchOptionContainer");
    }

    private bindControls() {
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
        this.searchNewPlaylistInput.keypress(function (e) {
            if (e.which == 13) {
                _this.addSongToNewPlaylist($(this).val());
            }
        });
    }

    private addSongToNewPlaylist(playlistLabel:string) {
        $.ajax("/playlist/new/" + playlistLabel, {
            type: "POST",
            dataType: "json",
            success: data => {
                this.addCurrentSongToPlaylist(<string>data.id);
                this.cancelMoveOptionsToItem(this.selectedItem);
            }
        });
    }

    private playCurrentSong() {
        var item = this.selectedItem;
        var song = new MSong(item.attr("songId"), item.attr("songTitle"), item.attr("songArtist"), item.attr("songGenre"), item.attr("songImage"));
        globalPlaylistManager.pushSongAndPlay(song);
        this.cancelMoveOptionsToItem(this.selectedItem);
    }

    private addCurrentSongToPlaylist(playlistId) {
        var item = $(this.selectedItem);
        var song = new MSong(item.attr("songId"), item.attr("songTitle"), item.attr("songArtist"), item.attr("songGenre"), item.attr("songImage"));
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
    }

    private addCurrentSongToNowPlaying() {
        if (this.selectedItem != null) {
            var item = $(this.selectedItem);
            var song = new MSong(item.attr("songId"), item.attr("songTitle"), item.attr("songArtist"), item.attr("songGenre"), item.attr("songImage"));
            globalPlaylistManager.pushSong(song);
            this.cancelMoveOptionsToItem(this.selectedItem);
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
            this.bind();
            this.bindControls();
        });
    }

    private bindItems() {
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
            transform: "translate3d(0,0,0)"
        });
    }

    private moveOptionsToItem(item) {
        this.selectedItem = item;
        this.bindControls();
        item.css({
            WebkitTransition: "-webkit-transform 0.4s ease",
            transition: "transform 0.4s ease",
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
        item.parent().prepend(this.optionsContainer);
        this.giveOptionsFocus();
    }

    private giveOptionsFocus() {
        this.optionsContainer.show(0);
    }
}
var mSearchManager = new SearchManager();
