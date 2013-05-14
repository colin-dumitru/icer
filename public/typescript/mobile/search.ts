declare var $;


class SearchManager {

    private optionsContainer = null;

    private selectedItem = null;
    private optionsCollapsed = true;

    bind() {
        $("#searchAddToPlaying").click(() => {
            this.addCurrentSongToNowPlaying();
        })

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
        $(".searchItemOptionContainer").on("click", function (e) {
            _this.searchItemClicked(this);
        });
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
        this.optionsContainer.fadeIn(400);
    }

    private takeOptionsFocus(item) {
        $(item).removeClass("searchItemOptionContainerFocused");
        this.optionsCollapsed = true;
        this.optionsContainer.fadeOut(400);
    }
}
var mSearchManager = new SearchManager();
