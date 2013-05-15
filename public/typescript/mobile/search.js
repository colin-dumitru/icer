var SearchManager = (function () {
    function SearchManager() {
        this.optionsContainer = null;
        this.selectedItem = null;
        this.optionsCollapsed = true;
    }
    SearchManager.prototype.bind = function () {
        var _this = this;
        $("#searchAddToPlaying").click(function () {
            _this.addCurrentSongToNowPlaying();
        });
    };
    SearchManager.prototype.addCurrentSongToNowPlaying = function () {
        if(this.selectedItem != null) {
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
        if(item == this.selectedItem) {
            this.refocusOptions(item);
        } else {
            this.changeOptionsFocus(item);
        }
    };
    SearchManager.prototype.refocusOptions = function (item) {
        if(this.optionsCollapsed) {
            this.giveOptionsFocus();
        } else {
            this.takeOptionsFocus(item);
        }
    };
    SearchManager.prototype.changeOptionsFocus = function (item) {
        $(item).addClass("searchItemOptionContainerFocused");
        if(this.selectedItem != null) {
            $(this.selectedItem).removeClass("searchItemOptionContainerFocused");
        }
        this.selectedItem = item;
        if(this.optionsCollapsed) {
            this.giveOptionsFocus();
        }
    };
    SearchManager.prototype.giveOptionsFocus = function () {
        this.optionsCollapsed = false;
        this.optionsContainer.fadeIn(400);
    };
    SearchManager.prototype.takeOptionsFocus = function (item) {
        $(item).removeClass("searchItemOptionContainerFocused");
        this.optionsCollapsed = true;
        this.optionsContainer.fadeOut(400);
    };
    return SearchManager;
})();
var mSearchManager = new SearchManager();
//@ sourceMappingURL=search.js.map
