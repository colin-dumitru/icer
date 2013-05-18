declare var $;
declare var SC;
declare var soundCloudId;

var sectionManager:SectionManager;
var titleManager:TitleManager;
var globalPlaylistManager:GlobalPlaylistManager;
var player:Player;

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

    player = new Player();
    player.bind();

    searchCallback();
}

function searchCallback() {
    sectionManager.loadSection("/mobile/section/search", () => {
        itemsOnLoad();

        mSearchManager.bind();

        itemManager.itemAddCallback = (content) => mSearchManager.onSearchInput(content);
        itemManager.itemSelectedCallback = (id, title) => mSearchManager.onSearchSelected(id);
    });
}

function searchCallbackFromPlaylist(query:string) {
    sectionManager.loadSection("/mobile/section/search", () => {
        itemsOnLoad();

        mSearchManager.bind();

        itemManager.itemAddCallback = (content) => mSearchManager.onSearchInput(content);
        itemManager.itemSelectedCallback = (id, title) => mSearchManager.onSearchSelected(id);
        $("#menuSelect").val(0);
        mSearchManager.onSearchInput(query);
    });
}

function playlistCallback() {
    sectionManager.loadSection("/mobile/section/playlists", () => {
        itemsOnLoad();

        mPlaylistManager.bind();

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
    private playingSongs = null;

    private collapsed = true;


    bind() {
        this.progressBar = $("#progressBars");
        this.volumeSlider = $("#volumeSlider");
        this.playbackArrow = $("#playbackArrow");
        this.footer = $("#footer");
        this.playbackContainer = $("#playbackContainer");
        this.playingSongs = $("#playingSongs");

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

    public pushSong(song:Song) {
        var item = this.convertSongToItem(song);
        this.bindItemClick(item, song);
        this.playingSongs.append(item);
    }

    public clearSongs() {
        this.playingSongs.empty();
    }

    private bindItemClick(item, song:Song) {
        $(item).click(() => {
            player.playSong(song);
        });
    }

    private convertSongToItem(song:Song) {
        var container = $("<div></div>");

        container.addClass("playingSong");
        container.text(song.title + "-" + song.artist);

        return container;
    }
}

class Player {
    public player = null;
    public onSongError:(song:Song) => any;
    public onFinish:(song:Song) => any;

    private playbackId = 0;
    private currentSong = null;
    private currentPlayer = null;

    private durationText = null;
    private seekSlider = null;

    public bind() {
        SC.initialize({
            client_id: soundCloudId
        });
        window.setInterval(() => {
            this.updateElapsed();
        }, 500);

        this.durationText = $("#durationText");
        this.seekSlider = $("#progressBars");
    }

    private updateElapsed() {
        if (this.currentPlayer != null) {
            this.seekSlider.slider("value", Math.floor((this.currentPlayer.position / this.currentPlayer.duration) * 1000));
        }
    }

    public playSong(song:Song) {
        if (song == this.currentSong) {
            this.currentPlayer.resume();
        } else {
            this.stopCurrentSong()
            this.resolveSoundUrl(song);
        }
    }

    private stopCurrentSong() {
        if (this.currentPlayer != null) {
            this.currentPlayer.stop();
        }
    }

    public pause() {
        if (this.currentSong != null) {
            this.currentPlayer.pause();
        }
    }

    public seek(percentage:number) {
        if (this.currentPlayer != null) {
            this.currentPlayer.setPosition(Math.floor(this.currentPlayer.duration * (percentage / 1000)));
        }

    }

    public changeVolume(value:number) {
        if (this.currentSong != null) {
            this.currentPlayer.setVolume(value);
        }
    }

    private resolveSoundUrl(song:Song) {
        this.currentSong = song;
        this.playbackId += 1;
        var currentId = this.playbackId;

        SC.get('/tracks', { q: song.title + " " + song.artist}, (tracks:any[]) => {
            if (tracks.length == 0) {
                this.onSongError(song);
            } else {
                if (currentId == this.playbackId) {
                    this.playResolved(this.bestTrack(tracks), song, currentId);
                }
            }
        });
    }

    private bestTrack(tracks:any[]) {
        var maxPlays = tracks[0].playback_count;
        var maxTrack = tracks[0];

        for (var i = 1; i < tracks.length; i++) {
            if (tracks[i].playback_count > maxPlays) {
                maxPlays = tracks[i].playback_count;
                maxTrack = tracks[i];
            }
        }
        return maxTrack;
    }

    private playResolved(trackInfo:any, song:Song, playbackId:number) {
        var trackId = trackInfo["id"];
        this.streamSong(trackId, song, playbackId);
    }

    private streamSong(trackId:any, song:Song, playbackId:number) {
        SC.stream("/tracks/" + trackId,
            {
                onfinish: () => {
                    this.onFinish(song);
                }
            },
            (sound)  => {
                this.switchActiveSong(sound, playbackId);
            });
    }

    private switchActiveSong(sound:any, playbackId:number) {
        if (playbackId == this.playbackId) {
            this.currentPlayer = sound;
            sound.play();
        }
    }
}

class Song {
    constructor(public mbid:string, public title:string, public artist:string, public imageUrl:string) {
    }
}