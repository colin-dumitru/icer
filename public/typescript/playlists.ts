declare var searchManager;

var playlistManager:PlaylistManager = null;

class PlaylistBinder implements SectionBinder {

    buildPage(rootNode:any) {
        playlistManager = new PlaylistManager(rootNode);

        itemList.popItemList("playlist");
        this.loadData();
        itemList.pushItemList("playlist");
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
    }

    private performLoadRequest() {
        $.ajax("/playlist/load", {
            type: "POST",
            dataType: "json",
            async: false,
            success: data => {
                for (var i = 0; i < data.length; i++)
                    playlistManager.loadPlaylist(data[i].id, data[i].name);
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

    public getPlaylistMap():{[key:string] : Playlist;}[] {
        return this.playLists;
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
                this.processResultsSongs(data, playlist);
            }
        });
    }

    private processResultsSongs(data, playlist) {
        for (var i = 0; i < data.length; i++) {
            var songInfo = new SongInfo(data[i].title, data[i].artist, data[i].album, data[i].genre, data[i].peek, data[i].weeksOnTop, data[i].positionChange)
            var song = new Song(data[i].mbid, songInfo, data[i].imageUrl)
            this.addSongToPlaylist(song, playlist);
        }
    }

    addSongToPlaylist(song:Song, playlist:Playlist) {
        var image = buildSmallSong(song)
        this.bindSong(song, image);
        playlist.pageManager.rootNode.find("#playlistSongContainer").append(image)
        playlist.songs.push(song);
    }

    private bindSong(song:Song, template) {
        var detailCallback = (option:number, subOption:number) => {
            if (option == 0) {
                this.playSong(song)
            } else if (option == 1) {
                this.changeToSearchSection()
                this.searchFromSong(song)
            } else if (option == 2) {
                this.removeSong(song, template);
            }
        };

        template.click((e) => {
            songDetailManager.showDetails([
                {label: "Play Now", subOptions: null},
                {label: "Search From Here", subOptions: null},
                {label: "Remove From Playlist", subOptions: null}
            ],
                detailCallback, song, {x: e.pageX, y: e.pageY});
        });
    }

    private searchFromSong(song:Song) {
        searchManager.performSearch(song.info.title + " " + song.info.artist);
    }

    private changeToSearchSection() {
        binders["playlist"].unbind();
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

        var newURL = 'http%3A%2F%2Fuplayed.herokuapp.com%2Fget%2F' + this.playlist.id;

        $(this.rootNode).find("#playPlaylistButton").click(() => {
            this.playPlaylist();
        });

        $(this.rootNode).find("#deletePlaylistButton").click(() => {
            this.deletePlaylist();
        });
        $(this.rootNode).find("#sharePlaylistButton").click((e) => {
            e.stopPropagation();
            $(this.rootNode).find('#box').fadeIn('fast');

        });

        $(this.rootNode).find("#facebookButton").click(() => {
            this.shareOnFacebook(newURL);
        });
        $(this.rootNode).find("#twitterButton").click(() => {
            this.shareOnTwitter(newURL);
        });
        $(this.rootNode).find("#googleButton").click(() => {
            this.shareOnGooglePlus(newURL);
        });


        this.closeOverlay();
    }

    private playPlaylist() {
        globalPlaylistManager.clearSongs();
        globalPlaylistManager.pushSongs(this.playlist.songs);
        globalPlaylistManager.playSong(this.playlist.songs[0]);
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
            type: "POST"
        });
    }

    private closeOverlay() {
        var _this = this;
        $(document).click(function (e) {
            if (e.target.id != "#box") {
                _this.closeBox();
            }
        });
    }

    public closeBox() {
        $(this.rootNode).find('#box').fadeOut('fast');
    }

    private shareOnFacebook(urlPlaylist:String) {
        window.open('https://www.facebook.com/sharer/sharer.php?u=' + urlPlaylist, 'win1', 'width=500,height=400,menubar,left=100,top=100');

    }

    private shareOnTwitter(urlPlaylist:String) {
        window.open('https://twitter.com/intent/tweet?text=Currently+listening+to&url=' + urlPlaylist, 'winTwitter', 'width=500,height=400,menubar,left=100,top=100')
    }

    private shareOnGooglePlus(urlPlaylist:String) {
        window.open('https://plus.google.com/share?url=' + urlPlaylist + '&text=%7C+UPlay3D+%7C+Currently+listening+to', 'winTwitter', 'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=400,width=500,left=100,top=100');
    }
}

class Playlist {
    constructor(public id:string, public title:string) {
    }

    pageManager:PlaylistPageManager;
    songs:Song[] = [];
}