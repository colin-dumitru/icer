declare var lastFmApiKey;
declare var globalPlaylistManager:GlobalPlaylistManager;
declare var playlistManager:PlaylistManager;

var searchManager:SearchManager = null;

class SearchBinder implements SectionBinder {

    buildPage(rootNode:any) {
        searchManager = new SearchManager(rootNode);
        itemList.popItemList("search");
        this.loadData();
        itemList.pushItemList("search");
    }

    bind() {
        itemList.popItemList("search");
        itemList.show();
        itemList.onInput = (input:string) => {
            searchManager.performSearch(input);
        };

        $(window).bind("keydown", this.navigationHandler);
    }

    navigationHandler(event) {
        switch (event.which) {
            case 37: //left
                searchManager.givePreviousPageFocus();
                event.preventDefault();
                break;
            case 38: //up
                searchManager.givePreviousSessionFocus();
                event.preventDefault();
                break;
            case 39: //right
                searchManager.giveNextPageFocus();
                event.preventDefault();
                break;
            case 40: //down
                searchManager.giveNextSessionFocus();
                event.preventDefault();
                break;
        }
    }

    loadData() {
        searchManager.performSearch("ColdPlay");
        searchManager.performSearch("Bridgit Mendler");
        searchManager.performSearch("John Mayer");
    }

    unbind() {
        itemList.hide();
        itemList.pushItemList("search");
        $(window).unbind("keydown", this.navigationHandler);
    }
}

class SearchManager {
    constructor(private rootNode) {
    }

    private searchSessions:{ [key: string]: SearchSession; } = { };
    private searchSessionsQueue:SearchSession[] = [];
    private currentIndex:number;
    private previousSessionId = 0;

    performSearch(query:string) {
        var sessionId = "search" + this.previousSessionId++;
        var session = new SearchSession(sessionId, query, query);

        this.buildSession(session);
        this.buildSessionItem(session);
        this.pushSession(session);
        this.registerSearchCallback(session);
    }

    private registerSearchCallback(session:SearchSession) {
        new SearchSongCallback(session).load();
        new SearchArtistCallback(session).load();
        new SearchAlbumCallback(session).load();
        new SearchGenreCallback(session).load();
    }

    private pushSession(session:SearchSession) {
        this.searchSessionsQueue.push(session);

        this.giveSessionFocus(session);
    }

    public givePreviousSessionFocus() {
        if (this.currentIndex <= 0) {
            return;
        }
        this.giveSessionFocus(this.searchSessionsQueue[this.currentIndex - 1]);
    }


    public giveNextSessionFocus() {
        if (this.currentIndex >= (this.searchSessionsQueue.length - 1)) {
            return;
        }
        this.giveSessionFocus(this.searchSessionsQueue[this.currentIndex + 1]);
    }

    public giveNextPageFocus() {
        var session = this.searchSessionsQueue[this.currentIndex];
        session.pageManager.nextPage();
    }

    public givePreviousPageFocus() {
        var session = this.searchSessionsQueue[this.currentIndex];
        session.pageManager.previousPage();
    }

    public giveSessionFocus(session:SearchSession) {
        this.currentIndex = this.searchSessionsQueue.indexOf(session);
        this.searchSessionsQueue.forEach((session, i) => {
            session.rootNode()
                .css({
                    WebkitTransform: "perspective(100px) translate3d(0px, 0px, " + 20 * (i - this.currentIndex) + "px)",
                    transform: "perspective(100px)  translate3d(0px, 0px, " + 20 * (i - this.currentIndex) + "px)",
                    opacity: (i > this.currentIndex) ? 0 : (i == this.currentIndex) ? 1 : 0.5
                })
                .removeClass("hidden");
        });

        window.setTimeout(() => {
            this.searchSessionsQueue.forEach((session, index) => {
                if (index > this.currentIndex) {
                    $(session.rootNode()).addClass("hidden")
                }
            })
        }, 400);
        itemList.switchItem(itemList.findItem(session.id));
    }

    private buildSessionItem(session:SearchSession) {
        var item:Item = new Item(session.id, session.title);
        itemList.addItem(item);

        item.onSelect = () => {
            this.changeSearchSession(session);
        };
        itemList.switchItem(item);
    }

    private buildSession(session:SearchSession) {
        this.searchSessions[session.id] = session;
        this.buildPage(session);

        session.pageManager = new SearchPageManager(session);
        session.pageManager.bind();
    }

    private changeSearchSession(session:SearchSession) {
        this.giveSessionFocus(session);
    }

    private buildPage(session:SearchSession) {
        var htmlTemplate = template("#searchPageTemplate", session.id);
        $("#searchTableContainer")
            .append(htmlTemplate);
        session.rootNode().find("#searchPageDelete").click(() => {
            this.deleteSession(session);
        });
    }

    private deleteSession(session:SearchSession) {
        $(session.rootNode())
            .fadeOut(400, function () {
                this.remove()
            });
        delete this.searchSessions[session.id];
        this.searchSessionsQueue.splice(this.searchSessionsQueue.indexOf(session), 1);

        if (this.currentIndex > (this.searchSessionsQueue.length - 1)) {
            this.currentIndex = this.searchSessionsQueue.length - 1;
        }
        this.giveSessionFocus(this.searchSessionsQueue[this.currentIndex]);
        itemList.deleteItem(session.id);
    }
}

class SearchCallback {
    constructor(public session:SearchSession) {

    }

    removeLoadingScreen(loadingContainer) {
        var container = this.session.rootNode().find(loadingContainer);
        container.fadeOut(400, function () {
            container.remove()
        });
    }

    removeSimilarLoader(itemTemplate, containerId:string) {
        var container = itemTemplate.find(containerId);
        container.fadeOut(400, function () {
            container.remove();
        });
    }

    buildLargeImageTemplate(url:string) {
        var img = $("<img />");
        img
            .attr("src", url)
            .attr("width", 120)
            .attr("height", 120);
        return img;
    }

    bindSongMenu(song:Song, template) {
        var detailCallback = (selectedOption:number, selectedSubOption:number) => {
            if (selectedOption == 0) {
                this.playSong(song);
            } else if (selectedOption == 2) {
                this.pushSong(song);
            } else if (selectedOption == 3) {
                this.searchFromSong(song);
            } else if (selectedOption == 1) {
                this.addSongToPlaylist(song, selectedSubOption);
            }
        };

        template.click((e) => {
            songDetailManager.showDetails([
                {label: "Play Now", subOptions: []},
                {label: "Add To Playlist", subOptions: this.buildPlaylistList()},
                {label: "Add to Now Playing", subOptions: []},
                {label: "Search From Here", subOptions: []}
            ],
                detailCallback,
                song,
                {x: e.pageX, y: e.pageY});
        });
    }

    private addSongToPlaylist(song:Song, playlistIndex) {
        if (playlistIndex == null) {
            return;
        }
        var selectedPlaylist = playlistManager.getPlaylist()[playlistIndex];
        playlistManager.addSongToPlaylist(song, selectedPlaylist);

        $.ajax({
            url: "/playlist/song/add/" + selectedPlaylist.id,
            type: "POST",
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(song)
        })
    }

    private buildPlaylistList():string[] {
        return playlistManager.getPlaylist().map(p => p.title);
    }

    private searchFromSong(song:Song) {
        searchManager.performSearch(song.info.title + " " + song.info.artist);
    }

    private playSong(song:Song) {
        globalPlaylistManager.pushSong(song);
        globalPlaylistManager.playSong(song);
    }

    private pushSong(song:Song) {
        globalPlaylistManager.pushSong(song);

    }

    bindItemList(item) {
        item
            .hover(() => {
                this.expandSimilarSongs(item);
            }, () => {
                this.collapseSimilarSongs(item);
            });
    }

    private expandSimilarSongs(item) {
        item.find("#searchSongTitle").css({
            transform: "translate3d(0, 0, 0)"
        });
        item.find("#searchSongListContainerWrapper").css({
            transform: "translate3d(0, 0, 0)"
        });
    }

    private collapseSimilarSongs(item) {
        item.find("#searchSongTitle").css({
            transform: "translate3d(0, 60px, 0)"
        });
        item.find("#searchSongListContainerWrapper").css({
            transform: "translate3d(0, 120px, 0)"
        });
    }
}

class SearchSongCallback extends SearchCallback {
    constructor(public session:SearchSession) {
        super(session);
    }

    load() {
        this.loadPage(1);
    }

    private loadPage(page:number) {
        $.ajax({
            url: this.buildMainSearchUrl(page),
            dataType: "json",
            method: "GET",
            success: (res:any) => this.onMainResult(res["results"]["trackmatches"]["track"], page)
        });
    }

    private onMainResult(tracks:any[], page:number) {
        console.log(tracks);
        for (var i = 0; i < tracks.length; i++) {
            this.pushMainResult(tracks[i]);
        }
        this.session.rootNode().find("#searchPageSongsContainer").find("#loadMoreHorizontal").remove();

        if (tracks.length == 5) {
            var loadMoreTemplate = this.buildLoadMoreHorizontal(page + 1);
            this.session.rootNode().find("#searchPageSongsContainer").append(loadMoreTemplate);
        }

        this.removeLoadingScreen("#searchPageLoadingContainer");
    }

    private pushMainResult(track:any) {
        var id = guid(track.mbid, track.name.trim() + track.artist.trim());
        var song = new Song(id, new SongInfo(track.name, track.artist, null, null, 0, 0, 0), getExtraLargeImage(track.image));

        var itemTemplate = this.buildItemList(song);
        this.session.rootNode().find("#searchPageSongsContainer")
            .append(itemTemplate);

        this.bindSongMenu(song, itemTemplate.find("#searchLargeImageContainer"));
        this.loadSimilarSongs(song, itemTemplate, true);
    }

    private buildLoadMoreHorizontal(page:number) {
        var container = $("<div></div>");
        container
            .attr("id", "loadMoreHorizontal")
            .append("See More");

        this.bindLoadMoreHorizontal(container, page);

        return container;
    }

    private bindLoadMoreHorizontal(container, page:number) {
        container.click(() => {
            container.text("Loading..");
            this.loadPage(page);
        });
    }

    private loadSimilarSongs(song:Song, itemTemplate:any, firstLoad:bool) {
        $.ajax({
            url: this.buildSimilarSearchUrl(song, firstLoad ? 5 : 30),
            dataType: "json",
            method: "GET",
            success: (res:any) => this.onSimilarResults(res, song, itemTemplate, firstLoad)
        })
    }

    private onSimilarResults(res, song:Song, itemTemplate, firstDisplay:bool) {
        if (res.error == null && res["similartracks"] != null && Array.isArray(res["similartracks"]["track"])) {
            this.addSimilarSongs(res["similartracks"]["track"], song, itemTemplate, firstDisplay);
        } else {
            this.addNoSimilarSongsTemplate(itemTemplate);
        }
        this.removeSimilarLoader(itemTemplate, "#searchSimilarLoadingContainer");
    }

    addSimilarSongs(tracks, song:Song, itemTemplate, firstDisplay:bool) {
        itemTemplate.find("#searchSongListContainer").empty();
        for (var i = 0; i < tracks.length; i++) {
            this.addSimilarSong(tracks[i], itemTemplate);
        }

        if (firstDisplay) {
            var loadMoreTemplate = this.buildLoadMoreVertical(song, itemTemplate);
            itemTemplate.find("#searchSongListContainer").append(loadMoreTemplate);
        } else {
            itemTemplate.find("#loadMoreVertical").remove();
        }
    }

    private buildLoadMoreVertical(song:Song, itemTemplate) {
        var container = $("<div></div>");
        container
            .attr("id", "loadMoreVertical")
            .append("<div class='loadMoreVerticalText'>+</div>");

        this.bindLoadMoreVertical(container, song, itemTemplate);

        return container;
    }

    private bindLoadMoreVertical(container, song:Song, itemTemplate) {
        container.click(() => {
            this.loadSimilarSongs(song, itemTemplate, false);
        });
    }

    addSimilarSong(track, itemTemplate) {
        var id = guid(track.mbid, track.name.trim() + track.artist.name.trim());
        var song = new Song(id, new SongInfo(track.name, track.artist.name, null, null, 0, 0, 0), getLargeImage(track.image));

        var songTemplate = buildSmallSong(song);
        songTemplate.addClass("searchSimilarSong");

        itemTemplate.find("#searchSongListContainer").append(songTemplate);
        this.bindSongMenu(song, songTemplate);
    }

    private addNoSimilarSongsTemplate(itemTemplate) {
        var container = $("<div></div>");
        var messageTemplate = template("#searchSongNoSimilarTemplate", "No similar songs found");

        container.append(messageTemplate);
        itemTemplate.find("#searchSongListContainer").append(container);
    }

    private buildSimilarSearchUrl(song:Song, count:number):string {
        if (isMbid(song.mbid)) {
            return "http://ws.audioscrobbler.com/2.0/?method=track.getsimilar&mbid="
                + song.mbid + "&api_key=" + lastFmApiKey + "&format=json&limit=" + count;
        } else {
            return "http://ws.audioscrobbler.com/2.0/?method=track.getsimilar&artist="
                + song.info.artist + "&track=" + song.info.title + "&api_key=" + lastFmApiKey
                + "&format=json&limit=" + count;
        }
    }

    private buildItemList(song:Song):any {
        var listContainer = $("<div></div>");
        var listTemplate = template("#searchSongListTemplate", "similar");

        var imageTemplate = this.buildLargeImageTemplate(song.imageUrl);
        imageTemplate.addClass("clickable");

        listContainer.append(listTemplate);
        listContainer.find("#searchSongTitle").text(song.info.title + " - " + song.info.artist);
        listContainer.find("#searchLargeImageContainer").append(imageTemplate);

        this.bindItemList(listContainer);

        return listContainer;
    }

    buildMainSearchUrl(page:number):string {
        return "http://ws.audioscrobbler.com/2.0/?method=track.search&track="
            + this.session.query + "&api_key=" + lastFmApiKey + "&format=json&limit=5&page=" + page;
    }
}

class SearchArtistCallback extends SearchCallback {
    constructor(public session:SearchSession) {
        super(session);
    }

    load() {
        this.loadPage(1);
    }

    private loadPage(page:number) {
        $.ajax({
            url: this.buildMainSearchUrl(page),
            dataType: "json",
            method: "GET",
            success: (res:any) => this.onMainResult(res["results"]["artistmatches"]["artist"], page)
        });
    }

    private buildLoadMoreHorizontal(page:number) {
        var container = $("<div></div>");
        container
            .attr("id", "loadMoreHorizontal")
            .append("See More");

        this.bindLoadMoreHorizontal(container, page);

        return container;
    }

    private bindLoadMoreHorizontal(container, page:number) {
        container.click(() => {
            container.text("Loading..");
            this.loadPage(page);
        });
    }

    private onMainResult(artists:any[], page:number) {
        for (var i = 0; i < artists.length; i++) {
            this.pushMainResult(artists[i]);
        }

        this.session.rootNode().find("#searchPageArtistContainer").find("#loadMoreHorizontal").remove();

        if (artists.length == 5) {
            var loadMoreTemplate = this.buildLoadMoreHorizontal(page + 1);
            this.session.rootNode().find("#searchPageArtistContainer").append(loadMoreTemplate);
        }

        this.removeLoadingScreen("#searchArtistLoadingContainer");
    }

    private pushMainResult(artist:any) {
        var id = guid(artist.mbid, artist.name.trim());
        var artistInfo = new Artist(id, new ArtistInfo(artist.name), getExtraLargeImage(artist.image));

        var itemTemplate = this.buildItemList(artistInfo);
        this.session.rootNode().find("#searchPageArtistContainer").append(itemTemplate);

        this.loadArtistSongs(artistInfo, itemTemplate, 1);
    }

    private loadArtistSongs(artist:Artist, itemTemplate:any, page:number) {
        $.ajax({
            url: this.buildArtistSearchUrl(artist, page),
            dataType: "json",
            method: "GET",
            success: (res:any) => this.onArtistResults(res, itemTemplate, artist, page)
        })
    }

    private onArtistResults(res, itemTemplate, artist:Artist, page:number) {
        if (res.error == null && res["toptracks"]["track"] != null) {
            this.addArtistSongs(res["toptracks"]["track"], itemTemplate, artist, page);
        } else {
            this.addNoArtistSongsTemplate(itemTemplate);
        }
        this.removeSimilarLoader(itemTemplate, "#searchSimilarLoadingContainer");
    }

    private addArtistSongs(tracks, itemTemplate, artist:Artist, page:number) {
        for (var i = 0; i < tracks.length; i++) {
            this.addArtistSong(tracks[i], itemTemplate);
        }

        itemTemplate.find("#loadMoreVertical").remove();

        if (tracks.length == 5) {
            var loadMoreTemplate = this.buildLoadMoreVertical(page + 1, artist, itemTemplate);
            itemTemplate.find("#searchSongListContainer").append(loadMoreTemplate);
        }
    }

    private buildLoadMoreVertical(page:number, artist:Artist, itemTemplate) {
        var container = $("<div></div>");
        container
            .attr("id", "loadMoreVertical")
            .append("<div class='loadMoreVerticalText'>+</div>");

        this.bindLoadMoreVertical(container, page, artist, itemTemplate);

        return container;
    }

    private bindLoadMoreVertical(container, page:number, artist:Artist, itemTemplate) {
        container.click(() => {
            this.loadArtistSongs(artist, itemTemplate, page);
        });
    }

    private addArtistSong(track, itemTemplate) {
        var id = guid(track.mbid, track.name.trim() + track.artist.name.trim());
        var song = new Song(id, new SongInfo(track.name, track.artist.name, null, null, 0, 0, 0), getLargeImage(track.image));

        var songTemplate = buildSmallSong(song);
        songTemplate.addClass("searchSimilarSong");

        this.bindSongMenu(song, songTemplate);
        itemTemplate.find("#searchSongListContainer").append(songTemplate);
    }

    private addNoArtistSongsTemplate(itemTemplate) {
        var container = $("<div></div>");
        var messageTemplate = template("#searchSongNoSimilarTemplate", "No songs were found for artist");

        container.append(messageTemplate);
        itemTemplate.find("#searchSongListContainer").append(container);
    }

    private buildArtistSearchUrl(artist:Artist, page:number):string {
        if (isMbid(artist.mbid)) {
            return "http://ws.audioscrobbler.com/2.0/?method=artist.gettoptracks&mbid="
                + artist.mbid + "&api_key=" + lastFmApiKey + "&format=json&limit=5&page=" + page;
        } else {
            return "http://ws.audioscrobbler.com/2.0/?method=artist.gettoptracks&artist="
                + artist.info.name + "&api_key=" + lastFmApiKey + "&format=json&limit=5&page=" + page;
        }
    }

    private buildItemList(artist:Artist):any {
        var listContainer = $("<div></div>");
        var listTemplate = template("#searchSongListTemplate", "tracks");

        var imageTemplate = this.buildLargeImageTemplate(artist.imageUrl);

        listContainer.append(listTemplate);
        listContainer.find("#searchSongTitle").text(artist.info.name);
        listContainer.find("#searchLargeImageContainer").append(imageTemplate);

        this.bindItemList(listContainer);

        return listContainer;
    }

    buildMainSearchUrl(page:number):string {
        return "http://ws.audioscrobbler.com/2.0/?method=artist.search&artist="
            + this.session.query + "&api_key=" + lastFmApiKey + "&format=json&limit=5&page=" + page;
    }
}

class SearchAlbumCallback extends SearchCallback {
    constructor(public session:SearchSession) {
        super(session);
    }

    load() {
        this.loadPage(1);
    }

    private loadPage(page:number) {
        $.ajax({
            url: this.buildMainSearchUrl(page),
            dataType: "json",
            method: "GET",
            success: (res:any) =>
                this.onMainResult(res["results"]["albummatches"]["album"], page)
        })
    }

    private onMainResult(albums:any[], page:number) {
        for (var i = 0; i < albums.length; i++) {
            this.pushMainResult(albums[i]);
        }

        this.session.rootNode().find("#searchPageAlbumsContainer").find("#loadMoreHorizontal").remove();

        if (albums.length == 5) {
            var loadMoreTemplate = this.buildLoadMoreHorizontal(page + 1);
            this.session.rootNode().find("#searchPageAlbumsContainer").append(loadMoreTemplate);
        }

        this.removeLoadingScreen("#searchAlbumLoadingContainer");
    }

    private pushMainResult(albumInfo:any) {
        var id = guid(albumInfo.mbid, albumInfo.name.trim() + albumInfo.artist.trim());
        var album = new Album(id, new AlbumInfo(albumInfo.name, albumInfo.artist), getExtraLargeImage(albumInfo.image));

        var itemTemplate = this.buildItemList(album);
        this.session.rootNode().find("#searchPageAlbumsContainer").append(itemTemplate);

        this.loadAlbumSongs(album, itemTemplate);
    }

    private buildLoadMoreHorizontal(page:number) {
        var container = $("<div></div>");
        container
            .attr("id", "loadMoreHorizontal")
            .append("See More");

        this.bindLoadMoreHorizontal(container, page);

        return container;
    }

    private bindLoadMoreHorizontal(container, page:number) {
        container.click(() => {
            container.text("Loading..");
            this.loadPage(page);
        });
    }

    private loadAlbumSongs(album:Album, itemTemplate:any) {
        $.ajax({
            url: this.buildAlbumSearchUrl(album),
            dataType: "json",
            method: "GET",
            success: (res:any) => this.onAlbumResults(res, itemTemplate)
        })
    }

    private onAlbumResults(res, itemTemplate) {
        if (res.error == null && res["album"]["tracks"]["track"] != null) {
            var image = getLargeImage(res["album"]["image"]);
            this.addAlbumSongs(res["album"]["tracks"]["track"], image, itemTemplate);
        } else {
            this.addNoArtistSongsTemplate(itemTemplate);
        }
        this.removeSimilarLoader(itemTemplate, "#searchSimilarLoadingContainer");
    }

    private addAlbumSongs(tracks, image, itemTemplate) {
        for (var i = 0; i < tracks.length; i++) {
            this.addAlbumSong(tracks[i], image, itemTemplate);
        }
    }

    private addAlbumSong(track, image, itemTemplate) {
        var id = guid(track.mbid, track.name.trim() + track.artist.name.trim());
        var song = new Song(id, new SongInfo(track.name, track.artist.name, null, null, 0, 0, 0), image);

        var songTemplate = buildSmallSong(song);
        songTemplate.addClass("searchSimilarSong");

        this.bindSongMenu(song, songTemplate);
        itemTemplate.find("#searchSongListContainer").append(songTemplate);
    }

    private addNoArtistSongsTemplate(itemTemplate) {
        var container = $("<div></div>");
        var messageTemplate = template("#searchSongNoSimilarTemplate", "No songs were found for album");

        container.append(messageTemplate);
        itemTemplate.find("#searchSongListContainer").append(container);
    }

    private buildAlbumSearchUrl(album:Album):string {
        if (isMbid(album.mbid)) {
            "&api_key=ccb7bf48e8055843e17952fbeb6bfabd&artist=Cher&album=Believe&format=json"
            return "http://ws.audioscrobbler.com/2.0/?method=album.getinfo&mbid="
                + album.mbid + "&api_key=" + lastFmApiKey + "&format=json";
        } else {
            return "http://ws.audioscrobbler.com/2.0/?method=album.getinfo&artist="
                + album.info.artist + "&album=" + album.info.name + "&api_key=" + lastFmApiKey + "&format=json";
        }
    }


    private buildItemList(album:Album):any {
        var listContainer = $("<div></div>");
        var listTemplate = template("#searchSongListTemplate", "tracks");

        var imageTemplate = this.buildLargeImageTemplate(album.imageUrl);

        listContainer.append(listTemplate);
        listContainer.find("#searchSongTitle").text(album.info.artist + "-" + album.info.name);
        listContainer.find("#searchLargeImageContainer").append(imageTemplate);

        this.bindItemList(listContainer);

        return listContainer;
    }

    buildMainSearchUrl(page:number):string {
        return "http://ws.audioscrobbler.com/2.0/?method=album.search&album="
            + this.session.query + "&api_key=" + lastFmApiKey + "&format=json&limit=5&page=" + page;
    }
}

class SearchGenreCallback extends SearchCallback {
    constructor(public session:SearchSession) {
        super(session);
    }

    load() {
        this.loadPage(1);
    }

    private loadPage(page:number) {
        $.ajax({
            url: this.buildMainSearchUrl(page),
            dataType: "json",
            method: "GET",
            success: (res:any) => this.onMainResult(res["results"]["tagmatches"]["tag"], page)
        })
    }

    private onMainResult(tags:any[], page:number) {
        for (var i = 0; i < tags.length; i++) {
            this.pushMainResult(tags[i]);
        }

        this.session.rootNode().find("#searchPageGenreContainer").find("#loadMoreHorizontal").remove();

        if (tags.length == 5) {
            var loadMoreTemplate = this.buildLoadMoreHorizontal(page + 1);
            this.session.rootNode().find("#searchPageGenreContainer").append(loadMoreTemplate);
        }
        this.removeLoadingScreen("#searchGenreLoadingContainer");
    }

    private buildLoadMoreHorizontal(page:number) {
        var container = $("<div></div>");
        container
            .attr("id", "loadMoreHorizontal")
            .append("See More");

        this.bindLoadMoreHorizontal(container, page);

        return container;
    }

    private bindLoadMoreHorizontal(container, page:number) {
        container.click(() => {
            container.text("Loading..");
            this.loadPage(page);
        });
    }

    private pushMainResult(tagInfo:any) {
        var tag = new Tag(tagInfo.name);

        var itemTemplate = this.buildItemList(tag);
        this.session.rootNode().find("#searchPageGenreContainer").append(itemTemplate);

        this.loadGenreSongs(tag, itemTemplate, 1);
    }

    private loadGenreSongs(tag:Tag, itemTemplate:any, page:number) {
        $.ajax({
            url: this.buildGenreSearchUrl(tag, page),
            dataType: "json",
            method: "GET",
            success: (res:any) => this.onGenreResults(res, itemTemplate, page, tag)
        })
    }

    private onGenreResults(res, itemTemplate, page:number, tag:Tag) {
        if (res.error == null && res["toptracks"]["track"] != null) {
            this.addGenreSongs(res["toptracks"]["track"], itemTemplate, page, tag);
        } else {
            this.addNoGenreSongsTemplate(itemTemplate);
        }
        this.removeSimilarLoader(itemTemplate, "#searchGenreSimilarLoadingContainer");
    }

    private addGenreSongs(tracks, itemTemplate, page:number, tag:Tag) {
        for (var i = 0; i < tracks.length; i++) {
            this.addGenreSong(tracks[i], itemTemplate);
        }
        itemTemplate.find("#loadMoreVertical").remove();

        if (tracks.length == 5) {
            var loadMoreTemplate = this.buildLoadMoreVertical(page + 1, tag, itemTemplate);
            itemTemplate.find("#searchGenreListContainer").append(loadMoreTemplate);
        }
    }

    private buildLoadMoreVertical(page:number, tag:Tag, itemTemplate) {
        var container = $("<div></div>");
        container
            .attr("id", "loadMoreVertical")
            .append("<div class='loadMoreVerticalText'>+</div>");

        this.bindLoadMoreVertical(container, page, tag, itemTemplate);

        return container;
    }

    private bindLoadMoreVertical(container, page:number, tag:Tag, itemTemplate) {
        container.click(() => {
            this.loadGenreSongs(tag, itemTemplate, page);
        });
    }

    private addGenreSong(track, itemTemplate) {
        var id = guid(track.mbid, track.name.trim() + track.artist.name.trim());
        var song = new Song(id, new SongInfo(track.name, track.artist.name, null, null, 0, 0, 0), getLargeImage(track.image));

        var songTemplate = buildSmallSong(song);
        songTemplate.addClass("searchSimilarSong");

        this.bindSongMenu(song, songTemplate);
        itemTemplate.find("#searchGenreListContainer").append(songTemplate);
    }

    private addNoGenreSongsTemplate(itemTemplate) {
        var container = $("<div></div>");
        var messageTemplate = template("#searchSongNoSimilarTemplate", "No songs were found for genre");

        container.append(messageTemplate);
        itemTemplate.find("#searchSongListContainer").append(container);
    }

    private buildGenreSearchUrl(tag:Tag, page:number):string {
        return "http://ws.audioscrobbler.com/2.0/?method=tag.gettoptracks&tag="
            + tag.name + "&api_key=" + lastFmApiKey + "&format=json&limit=5&page=" + page;
    }

    private buildItemList(tag:Tag):any {
        var listContainer = $("<div></div>");
        var listTemplate = template("#searchGenreListTemplate");

        listContainer.append(listTemplate);
        listContainer.find("#searchGenreTitle").text(tag.name);

        return listContainer;
    }

    buildMainSearchUrl(page:number):string {
        return "http://ws.audioscrobbler.com/2.0/?method=tag.search&tag="
            + this.session.query + "&api_key=" + lastFmApiKey + "&format=json&limit=5&page=" + page;
    }
}

class SearchPageManager {
    private pageIndex = 0;

    constructor(private session:SearchSession) {
    }

    bind() {
        $(this.session.rootNode()).find("#searchMenuSongs").click(() => {
            this.switchToPage(0);
        });
        $(this.session.rootNode()).find("#searchMenuArtist").click(() => {
            this.switchToPage(1);
        });
        $(this.session.rootNode()).find("#searchMenuAlbums").click(() => {
            this.switchToPage(2);
        });
        $(this.session.rootNode()).find("#searchMenuGenre").click(() => {
            this.switchToPage(3);
        });

        this.switchToPage(0);
    }

    switchToPage(index:number) {
        this.takeFocusMenuItem(this.pageIndex);
        this.giveFocusMenuItem(index);

        this.takeFocusPage(this.pageIndex);
        this.giveFocusPage(index);

        this.pageIndex = index;
    }

    giveFocusMenuItem(index:number) {
        this.getMenuItem(index).addClass("searchMenuSelectorSelected");
    }

    takeFocusMenuItem(index:number) {
        this.getMenuItem(index).removeClass("searchMenuSelectorSelected");
    }

    nextPage() {
        if (this.pageIndex > 2) {
            return;
        }
        this.switchToPage(this.pageIndex + 1);
    }

    previousPage() {
        if (this.pageIndex < 1) {
            return;
        }
        this.switchToPage(this.pageIndex - 1);
    }

    giveFocusPage(index:number) {
        var page = this.getPage(index);

        if (use3DAcceleration) {
            $(this.session.rootNode()).find("#searchPageTable")
                .css({
                    WebkitTransform: "translate3d(" + -index * page.width() + "px, 0px, 0px)",
                    transform: "translate3d(" + -index * page.width() + "px, 0px, 0px)"
                });
        } else {
            $(this.session.rootNode()).find("#searchPageTable")
                .transition({
                    left: -index * page.width()
                });
        }

        page.find(".searchPageSongContainer").addClass("searchPageSongContainerFocused");
    }

    takeFocusPage(index:number) {
        var page = this.getPage(index);
        page.find(".searchPageSongContainer").removeClass("searchPageSongContainerFocused")
    }

    getMenuItem(index:number):any {
        switch (index) {
            case 0:
                return $(this.session.rootNode()).find("#searchMenuSongs");
            case 1:
                return $(this.session.rootNode()).find("#searchMenuArtist");
            case 2:
                return $(this.session.rootNode()).find("#searchMenuAlbums");
            case 3:
                return $(this.session.rootNode()).find("#searchMenuGenre");
        }
    }

    getPage(index:number):any {
        switch (index) {
            case 0:
                return $(this.session.rootNode()).find("#searchPageSongs");
            case 1:
                return $(this.session.rootNode()).find("#searchPageArtist");
            case 2:
                return $(this.session.rootNode()).find("#searchPageAlbums");
            case 3:
                return $(this.session.rootNode()).find("#searchPageGenre");
        }
    }
}

class SearchSession {
    pageManager:SearchPageManager;

    constructor(public id:string, public title:string, public query:string) {
    }

    rootNode():any {
        return $("#" + this.id);
    }
}