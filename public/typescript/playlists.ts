class PlaylistBinder implements SectionBinder {
    private playlistManager:PlaylistManager;
    private firstDisplay:bool = true;

    buildPage(rootNode:any) {
        this.playlistManager = new PlaylistManager(rootNode);
    }

    bind() {
        itemList.popItemList("playlist");
        if (this.firstDisplay) {
            this.loadData();
        }
        itemList.onInput = (input:string) => {
            this.playlistManager.addPlaylistServer(input);
        };
        itemList.show();

        $(window).bind("keydown", this.navigationHandler);
    }

    private loadData() {
        this.performLoadRequest();
        this.firstDisplay = false;
    }

    private performLoadRequest() {
        $.ajax("/playlist/load", {
            type: "POST",
            dataType: "json",
            success: data => {
                for (var i = 0; i < data.length; i++)
                    this.playlistManager.loadPlaylist(data[i].id, data[i].name);
            },
            error: function (reason) {
                alert(reason)
            }
        });
    }

    unbind() {
        itemList.pushItemList("playlist");
        itemList.hide();

        $(window).unbind("keydown", this.navigationHandler);
    }

    navigationHandler(event) {
        switch (event.which) {
            case 38: //up
                (<PlaylistBinder>binders["playlist"]).playlistManager.givePreviousPlaylistFocus();
                event.preventDefault();
                break;
            case 40: //down
                (<PlaylistBinder>binders["playlist"]).playlistManager.giveNextPlaylistFocus();
                event.preventDefault();
                break;
        }
    }
}

class PlaylistManager {
    private playLists:{[key:string] : Playlist;}[] = [];
    private playListsQueue:Playlist[] = [];

    private currentIndex:number;

    constructor(private rootNode:any) {
    }

    addPlaylistServer(title:String) {
        $.ajax("/playlist/new/" + title, {
            type: "POST",
            dataType: "json",
            success: data => {
                this.loadPlaylist(data.id, title)
            },
            error: function (reason) {
                alert(reason)
            }
        });
    }

    loadPlaylist(idPlaylist:string, title:string) {
        var playList = new Playlist(idPlaylist, title);

        this.buildPage(playList);
        this.buildPlaylistItem(playList);
        this.pushPlaylist(playList);
    }

    private buildPlaylistItem(playlist:Playlist) {
        var item:Item = new Item("playlist" + playlist.id, playlist.title);
        itemList.addItem(item);

        item.onSelect = () => {
            this.givePlaylistFocus(playlist);
        };
        itemList.switchItem(item);
    }

    private buildPage(playlist:Playlist) {
        var rootNode = this.buildPlaylistPage(playlist);

        playlist.pageManager = new PlaylistPageManager(playlist, rootNode);
        playlist.pageManager.bind();

        this.songsForPlaylistRequest(playlist);
    }

    private songsForPlaylistRequest(playlist:Playlist) {
        $.ajax("/playlist/songs/" + playlist.id, {
            type: "POST",
            dataType: "json",
            success: data => {

                for (var i = 0; i < data.length; i++) {
                    var songInfo = new SongInfo(data[i].title, data[i].artist, data[i].album, data[i].genre)
                    var song = new Song(data[i].mbid, songInfo, null)
                    var image = buildSmallSong(song)
                    playlist.pageManager.rootNode.find("#playlistSongContainer").append(this.buildMockImage(image))
                    playlist.songs.push(song);
                }
            },
            error: function (reason) {
                alert(reason)
            }
        });
    }

    private buildMockImage(template) {
        var imageContainer = $("<span></span>");
        imageContainer.append(template);

        imageContainer.addClass("inline");
        imageContainer.click((e) => {
            songDetailManager.showDetails(["Play Now", "Search From Here", "Remove From Playlist"],
                (selectedItem) => {
                }, "/assets/mock/bio.html", {x: e.pageX, y: e.pageY});
        });

        return imageContainer;
    }

    private buildPlaylistPage(playlist:Playlist):any {
        var pageTemplate = template("#playlistPageTemplate", playlist.id, playlist.title);
        return $("#playListsContainer").append(pageTemplate).find("#" + playlist.id);
    }

    private pushPlaylist(playlist:Playlist) {
        this.playListsQueue.push(playlist);
        this.playLists[playlist.id] = playlist;
        this.givePlaylistFocus(playlist);
    }

    public giveNextPlaylistFocus() {
        if (this.currentIndex > (this.playListsQueue.length - 2)) {
            return;
        }
        this.givePlaylistFocus(this.playListsQueue[this.currentIndex + 1]);
    }

    public givePreviousPlaylistFocus() {
        if (this.currentIndex < 1) {
            return;
        }
        this.givePlaylistFocus(this.playListsQueue[this.currentIndex - 1]);
    }

    public givePlaylistFocus(playlist:Playlist) {
        this.currentIndex = this.playListsQueue.indexOf(playlist);
        this.playListsQueue.forEach((playlist, i) => {
            playlist.pageManager.rootNode
                .transition({
                    perspective: 100,
                    translate3d: [0, -100 * (i - this.currentIndex), 20 * (i - this.currentIndex)],
                    opacity: (i > this.currentIndex) ? 0 : (i == this.currentIndex) ? 1 : 0.5
                }, 400)
                .removeClass("hidden");
        });

        window.setTimeout(() => {
            this.playListsQueue.forEach((session, index) => {
                if (index > this.currentIndex) {
                    $(session.pageManager.rootNode).addClass("hidden")
                }
            })
        }, 400);
    }
}

class PlaylistPageManager {
    constructor(public playlist:Playlist, public rootNode:any) {
    }

    bind() {
        $(this.rootNode).find("#playPlaylistButton").click(() => {
            this.playPlaylist();
        });
    }

    public playPlaylist() {
        globalPlaylistManager.clearSongs();
        globalPlaylistManager.pushSongs(this.playlist.songs);
    }
}

class Playlist {
    constructor(public id:string, public title:string) {
    }

    pageManager:PlaylistPageManager;
    songs:Song[] = [];
}