declare var $;


class SearchManager {

    private optionsContainer = null;
    private searchPlaylistOptionContainer = null;

    private selectedItem = null;
    private optionsCollapsed = true;
    private playlistsCollapsed = true;

    bind() {
        this.searchPlaylistOptionContainer = $("#searchPlaylistOptionContainer");

        this.bindPlaylists();

        $("#searchAddToPlaying").click(() => {
            this.addCurrentSongToNowPlaying();
        });
        $("#searchPlaySong").click(() => {
            this.playCurrentSong();
        });
        $("#searchAddToPlaylist").click(() => {
            this.togglePlaylist();
        });
    }

    private bindPlaylists() {
        var _this = this;
        $(".searchPlaylistItem").click(function () {
            _this.addCurrentSongToPlaylist($(this).attr("playlistId"));
            _this.takeOptionsFocus(_this.selectedItem);
        });
    }

    private playCurrentSong() {
        var item = $(this.selectedItem);
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

    private togglePlaylist() {
        if (this.playlistsCollapsed) {
            this.givePlaylistFocus();
        } else {
            this.takePlaylistsFocus();
        }
    }

    private takePlaylistsFocus() {
        this.playlistsCollapsed = true;
        this.searchPlaylistOptionContainer.css({
            opacity: 0
        });
    }

    private givePlaylistFocus() {
        this.playlistsCollapsed = false;
        this.searchPlaylistOptionContainer.css({
            opacity: 1
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
            item.css({
                WebkitTransition: "-webkit-transform 0.4s ease",
                transition: "transform 0.4s ease",
                WebkitTransform: "translate3d(-270,0,0)",
                transform: "translate3d(-270,0,0)"
            });
        } else {
            item.css({
                WebkitTransition: "-webkit-transform 0.4s ease",
                transition: "transform 0.4s ease",
                WebkitTransform: "translate3d(0,0,0)",
                transform: "translate3d(0,0,0)"
            });
        }

    }

    private startMoveOption(item) {
        item.css({
            WebkitTransition: "",
            transition: ""
        });
        this.optionsContainer.remove();
        item.parent().append(this.optionsContainer);
        this.giveOptionsFocus();
    }

    private searchItemClicked(item) {
        if (item == this.selectedItem) {
            this.refocusOptions(item);
        } else {
            this.changeOptionsFocus(item);
        }
    }

    private refocusOptions(item) {
        if (this.optionsCollapsed) {
            this.giveOptionsFocus();
        } else {
            this.takeOptionsFocus(item);
        }
    }

    private changeOptionsFocus(item) {
        $(item).addClass("searchItemOptionContainerFocused");
        if (this.selectedItem != null) {
            $(this.selectedItem).removeClass("searchItemOptionContainerFocused");
        }

        this.selectedItem = item;
        if (this.optionsCollapsed) {
            this.giveOptionsFocus();
        }
    }

    private giveOptionsFocus() {
        this.optionsCollapsed = false;
        this.optionsContainer.show(0);
    }

    private takeOptionsFocus(item) {
        $(item).removeClass("searchItemOptionContainerFocused");
        this.optionsCollapsed = true;
        this.optionsContainer.css({
            opacity: 0
        });
        this.takePlaylistsFocus();
    }
}
var mSearchManager = new SearchManager();
