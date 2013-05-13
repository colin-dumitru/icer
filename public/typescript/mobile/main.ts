declare var $;

var sectionManager:SectionManager;
var titleManager:TitleManager;
var globalPlaylistManager:GlobalPlaylistManager;

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
    sectionManager.loadSection("/mobile/section/search", () => {
        itemsOnLoad();

        itemManager.itemAddCallback = (content) => mSearchManager.onSearchInput(content);
        itemManager.itemSelectedCallback = (id, title) => mSearchManager.onSearchSelected(id);
    });
}

function playlistCallback() {
    sectionManager.loadSection("/mobile/section/playlists", () => {
        itemsOnLoad();

        itemManager.itemAddCallback = (content) => mPlaylistManager.onAddPlaylistInput(content);
        itemManager.itemSelectedCallback = (id, title) => mPlaylistManager.onPlaylistSelected(id, title);
    });
}

function radioCallback() {
    //todo
}

class SectionManager {
    callback:{[key:string]: () => void;} = {};

    bind() {
        var _this = this;
        $("#menuSelect").change(function () {
            _this.callback[$(this).val()]();
        });
    }

    loadSection(url:string, callback:() => void) {
        $("#content").load(url, callback);
    }
}

class TitleManager {
    private title = null;
    private titleSpan = null;

    bind() {
        this.title = $("#title");
        this.titleSpan = $("#titleSpan");

        this.title.click(() => {
            itemManager.toggle();
        });
    }

    setTitle(title:string) {
        this.titleSpan.text(title);
    }
}

class GlobalPlaylistManager {
    private progressBar = null;
    private volumeSlider = null;
    private playbackArrow = null;
    private footer = null;
    private playbackContainer = null;

    private collapsed = true;


    bind() {
        this.progressBar = $("#progressBars");
        this.volumeSlider = $("#volumeSlider");
        this.playbackArrow = $("#playbackArrow");
        this.footer = $("#footer");
        this.playbackContainer = $("#playbackContainer");

        this.playbackArrow.click(() => {
            if (this.collapsed) {
                this.giveFocus();
            } else {
                this.takeFocus();
            }
        });

        this.progressBar.slider({
            orientation: "horizontal",
            min: 0,
            max: 1000,
            value: 0,
            slide: (event, ui) => {
                this.changePosition(ui.value);
            }
        });

        this.volumeSlider.slider({
            orientation: "horizontal",
            min: 0,
            max: 100,
            value: 100,
            slide: (event, ui) => {
                this.changeVolume(ui.value);
            }
        });

    }

    private giveFocus() {
        this.collapsed = false;
        this.footer.css({
            marginBottom: 200
        });
        this.playbackContainer
            .show(0);
    }


    private takeFocus() {
        this.collapsed = true;
        this.footer.css({
            marginBottom: 0
        });
        this.playbackContainer
            .delay(400)
            .hide(0);
    }

    private changePosition(position:number) {

    }

    private changeVolume(position:number) {

    }
}