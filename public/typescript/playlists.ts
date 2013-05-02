declare var searchManager;

var playlistManager:PlaylistManager = null;

class PlaylistBinder implements SectionBinder {
    //todo CHECK
    private firstDisplay:bool = true;

    buildPage(rootNode:any) {
        playlistManager = new PlaylistManager(rootNode);
        this.loadData();
    }

    bind() {
        itemList.popItemList("playlist");
        itemList.onInput = (input:string) => {
            playlistManager.addPlaylistServer(input);
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
                    playlistManager.loadPlaylist(data[i].id, data[i].name);
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
                playlistManager.givePreviousPlaylistFocus();
                event.preventDefault();
                break;
            case 40: //down
                playlistManager.giveNextPlaylistFocus();
                event.preventDefault();
                break;
        }
    }
}

class PlaylistManager {
    SEARCH_SECTION = 0;
    private playLists:{[key:string] : Playlist;}[] = [];
    private playListsQueue:Playlist[] = [];

    private currentIndex:number;

    constructor(private rootNode:any) {
    }

    public getPlaylist():Playlist[] {
        return this.playListsQueue;
    }

    public deleteCurrentPlaylist() {

        this.playLists.splice(this.currentIndex, 1);
        this.playListsQueue.splice(this.currentIndex, 1);
        if (this.playListsQueue.length != 0) {
            if (this.currentIndex == 0) {
                this.givePlaylistFocus(this.playListsQueue[this.currentIndex]);
            }
            else
                this.givePreviousPlaylistFocus();
        }
    }

    addPlaylistServer(title:string) {
        $.ajax("/playlist/new/" + title, {
            type: "POST",
            dataType: "json",
            success: data => {
                this.loadPlaylist(<string>data.id, title)
            },
            error: function (reason) {
                alert(reason.toString())
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

        this.requestSongsForPlaylist(playlist);
    }

    private requestSongsForPlaylist(playlist:Playlist) {
        $.ajax("/playlist/songs/" + playlist.id, {
            type: "POST",
            dataType: "json",
            success: data => {

                for (var i = 0; i < data.length; i++) {
                    var songInfo = new SongInfo(data[i].title, data[i].artist, data[i].album, data[i].genre)
                    var song = new Song(data[i].mbid, songInfo, null)
                    var image = buildSmallSong(song)
                    playlist.pageManager.rootNode.find("#playlistSongContainer").append(this.buildMockImage(song, image))
                    playlist.songs.push(song);
                }
            },
            error: function (reason) {
                alert(reason)
            }
        });
    }

    private buildMockImage(song:Song, template) {
        var detailCallback = (option:number, subOption:number) => {
            if (option == 0) {
                this.playSong(song)
            } else if (option == 1) {
                this.searchFromSong(song)
                this.changeToSearchSection()
            } else if (option == 2) {
                this.removeSong(song, imageContainer);
            }
        };

        var imageContainer = $("<span></span>");
        imageContainer.append(template);

        imageContainer.addClass("inline");
        imageContainer.click((e) => {
            songDetailManager.showDetails([
                {label: "Play Now", subOptions: []},
                {label: "Search From Here", subOptions: []},
                {label: "Remove From Playlist", subOptions: []}
            ],
                detailCallback, "/assets/mock/bio.html", {x: e.pageX, y: e.pageY});
        });

        return imageContainer;
    }

    private searchFromSong(song:Song) {
        searchManager.performSearch(song.info.title + " " + song.info.artist);
    }

    private changeToSearchSection() {
        sectionManager.changeSection(this.SEARCH_SECTION);
    }

    private playSong(song:Song) {
        globalPlaylistManager.pushSong(song);
        globalPlaylistManager.playSong(song);
    }

    private removeSong(song:Song, imageContainer) {
        var currentPlaylist = this.playListsQueue[this.currentIndex];
        var indexOfSong = currentPlaylist.songs.indexOf(song);
        currentPlaylist.songs.splice(indexOfSong, 1);
        imageContainer.remove();
        this.deleteSongFromPlaylist(currentPlaylist.id, song.mbid);
    }

    private deleteSongFromPlaylist(idPlaylist:String, idSong:String) {
        $.ajax("/playlist/song/delete/" + idPlaylist + "/" + idSong, {
            type: "POST"
        });
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

        $(this.rootNode).find("#deletePlaylistButton").click(() => {
            this.deletePlaylist();
        });
    }

    private playPlaylist() {
        globalPlaylistManager.clearSongs();
        globalPlaylistManager.pushSongs(this.playlist.songs);
    }

    private deletePlaylist() {
        this.deletePlaylistPage();
        this.deletePlaylistItem();
        this.deletePlaylistServer();
    }

    private deletePlaylistPage() {
        var pageTemplate = template("#playlistPageTemplate", this.playlist.id, this.playlist.title);
        var toDelete = $("#playListsContainer").find("#" + this.playlist.id);
        toDelete.remove();

        //todo CHECK
        playlistManager.deleteCurrentPlaylist();
    }

    private deletePlaylistItem() {
        itemList.deleteItem("playlist" + this.playlist.id);
    }

    private deletePlaylistServer() {
        $.ajax("/playlist/delete/" + this.playlist.id, {
            type: "POST",
            error: function (reason) {
                alert(reason)
            }
        });
    }
}

class Playlist {
    constructor(public id:string, public title:string) {
    }

    pageManager:PlaylistPageManager;
    songs:Song[] = [];
}