var sectionManager;
var titleManager;
var globalPlaylistManager;
function run() {
    titleManager = new TitleManager();
    titleManager.bind();
    globalPlaylistManager = new GlobalPlaylistManager();
    globalPlaylistManager.bind();
    sectionManager = new SectionManager();
    sectionManager.callback["Search"] = searchCallback;
    sectionManager.callback["Playlists"] = playlistCallback;
    sectionManager.callback["Radio"] = radioCallback;
    sectionManager.bind();
    searchCallback();
}
function searchCallback() {
    sectionManager.loadSection("/mobile/section/search", function () {
        itemsOnLoad();
        itemManager.itemAddCallback = function (content) {
            return mSearchManager.onSearchInput(content);
        };
        itemManager.itemSelectedCallback = function (id, title) {
            return mSearchManager.onSearchSelected(id);
        };
    });
}
function playlistCallback() {
    sectionManager.loadSection("/mobile/section/playlists", function () {
        itemsOnLoad();
        itemManager.itemAddCallback = function (content) {
            return mPlaylistManager.onAddPlaylistInput(content);
        };
        itemManager.itemSelectedCallback = function (id, title) {
            return mPlaylistManager.onPlaylistSelected(id, title);
        };
    });
}
function radioCallback() {
}
var SectionManager = (function () {
    function SectionManager() {
        this.callback = {
        };
    }

    SectionManager.prototype.bind = function () {
        var _this = this;
        $("#menuSelect").change(function () {
            _this.callback[$(this).val()]();
        });
    };
    SectionManager.prototype.loadSection = function (url, callback) {
        $("#content").load(url, callback);
    };
    return SectionManager;
})();
var TitleManager = (function () {
    function TitleManager() {
        this.title = null;
        this.titleSpan = null;
    }

    TitleManager.prototype.bind = function () {
        this.title = $("#title");
        this.titleSpan = $("#titleSpan");
        this.title.click(function () {
            itemManager.toggle();
        });
    };
    TitleManager.prototype.setTitle = function (title) {
        this.titleSpan.text(title);
    };
    return TitleManager;
})();
var GlobalPlaylistManager = (function () {
    function GlobalPlaylistManager() {
        this.progressBar = null;
        this.volumeSlider = null;
        this.playbackArrow = null;
        this.footer = null;
        this.playbackContainer = null;
        this.collapsed = true;
    }

    GlobalPlaylistManager.prototype.bind = function () {
        var _this = this;
        this.progressBar = $("#progressBars");
        this.volumeSlider = $("#volumeSlider");
        this.playbackArrow = $("#playbackArrow");
        this.footer = $("#footer");
        this.playbackContainer = $("#playbackContainer");
        this.playbackArrow.click(function () {
            if (_this.collapsed) {
                _this.giveFocus();
            } else {
                _this.takeFocus();
            }
        });
        this.progressBar.slider({
            orientation: "horizontal",
            min: 0,
            max: 1000,
            value: 0,
            slide: function (event, ui) {
                _this.changePosition(ui.value);
            }
        });
        this.volumeSlider.slider({
            orientation: "horizontal",
            min: 0,
            max: 100,
            value: 100,
            slide: function (event, ui) {
                _this.changeVolume(ui.value);
            }
        });
    };
    GlobalPlaylistManager.prototype.giveFocus = function () {
        this.collapsed = false;
        this.footer.css({
            marginBottom: 200
        });
        this.playbackContainer.show(0);
    };
    GlobalPlaylistManager.prototype.takeFocus = function () {
        this.collapsed = true;
        this.footer.css({
            marginBottom: 0
        });
        this.playbackContainer.delay(400).hide(0);
    };
    GlobalPlaylistManager.prototype.changePosition = function (position) {
    };
    GlobalPlaylistManager.prototype.changeVolume = function (position) {
    };
    return GlobalPlaylistManager;
})();
//@ sourceMappingURL=main.js.map
