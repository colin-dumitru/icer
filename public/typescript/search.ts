declare var lastFmApiKey;
declare var globalPlaylistManager:GlobalPlaylistManager;

var globalSearchManager:SearchManager = null;

class SearchBinder implements SectionBinder {
    private firstDisplay = true;


    buildPage(rootNode:any) {
        globalSearchManager = new SearchManager(rootNode);
    }

    bind() {
        itemList.popItemList("search");
        itemList.show();
        if (this.firstDisplay) {
            this.loadData();
        }
        itemList.onInput = (input:string) => {
            globalSearchManager.performSearch(input);
        };

        $(window).bind("keydown", this.navigationHandler);
    }

    navigationHandler(event) {
        switch (event.which) {
            case 37: //left
                globalSearchManager.givePreviousPageFocus();
                event.preventDefault();
                break;
            case 38: //up
                globalSearchManager.givePreviousSessionFocus();
                event.preventDefault();
                break;
            case 39: //right
                globalSearchManager.giveNextPageFocus();
                event.preventDefault();
                break;
            case 40: //down
                globalSearchManager.giveNextSessionFocus();
                event.preventDefault();
                break;
        }
    }

    loadData() {
        globalSearchManager.performSearch("ColdPlay");
        globalSearchManager.performSearch("Bridgit Mendler");
        globalSearchManager.performSearch("John Mayer");
        this.firstDisplay = false;
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
        if (this.currentIndex == 0) {
            return;
        }
        this.giveSessionFocus(this.searchSessionsQueue[this.currentIndex - 1]);
    }


    public giveNextSessionFocus() {
        if (this.currentIndex == (this.searchSessionsQueue.length - 1)) {
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
                    WebkitTransform: "perspective(100x) translateZ(" + 20 * (i - this.currentIndex) + "px)",
                    transform: "perspective(100px)  translateZ(" + 20 * (i - this.currentIndex) + "px)",
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
        $("#searchTableContainer").append(htmlTemplate);
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
            .attr("width", 150)
            .attr("height", 150);
        return img;
    }

    bindSongMenu(song:Song, template) {
        var detailCallback = (selectedItem) => {
            if (selectedItem == "Play Now") {
                this.playSong(song);
            } else if (selectedItem == "Add to Now Playing") {
                this.pushSong(song);
            } else if (selectedItem == "Search From Here") {
                this.searchFromSong(song);
            }
        };

        template.click((e) => {
            songDetailManager.showDetails(["Play Now", "Add to Now Playing", "Search From Here", "Add To Playlist"],
                detailCallback, "/assets/mock/bio.html", {x: e.pageX, y: e.pageY});
        });
    }

    private searchFromSong(song:Song) {
        globalSearchManager.performSearch(song.info.title + " " + song.info.artist);
    }

    private playSong(song:Song) {
        globalPlaylistManager.pushSong(song);
        globalPlaylistManager.playSong(song);
    }

    private pushSong(song:Song) {
        globalPlaylistManager.pushSong(song);

    }
}

class SearchSongCallback extends SearchCallback {
    constructor(public session:SearchSession) {
        super(session);
    }

    load() {
        $.ajax({
            url: this.buildMainSearchUrl(),
            dataType: "json",
            method: "POST",
            success: (res:any) => this.onMainResult(res["results"]["trackmatches"]["track"])
        })
    }

    private onMainResult(tracks:any[]) {
        for (var i = 0; i < tracks.length; i++) {
            this.pushMainResult(tracks[i]);
        }
        this.removeLoadingScreen("#searchPageLoadingContainer");
    }

    private pushMainResult(track:any) {
        var id = guid(track.mbid, track.name.trim() + track.artist.trim());
        var song = new Song(id, new SongInfo(track.name, track.artist, null, null), getExtraLargeImage(track.image));

        var itemTemplate = this.buildItemList(song);
        this.session.rootNode().find("#searchPageSongsContainer").append(itemTemplate);

        this.bindSongMenu(song, itemTemplate.find("#searchLargeImageContainer"));
        this.loadSimilarSongs(song, itemTemplate);
    }

    private loadSimilarSongs(song:Song, itemTemplate:any) {
        $.ajax({
            url: this.buildSimilarSearchUrl(song),
            dataType: "json",
            method: "POST",
            success: (res:any) => this.onSimilarResults(res, itemTemplate)
        })
    }

    private onSimilarResults(res, itemTemplate) {
        if (res.error == null && Array.isArray(res["similartracks"]["track"])) {
            this.addSimilarSongs(res["similartracks"]["track"], itemTemplate);
        } else {
            this.addNoSimilarSongsTemplate(itemTemplate);
        }
        this.removeSimilarLoader(itemTemplate, "#searchSimilarLoadingContainer");
    }

    addSimilarSongs(tracks, itemTemplate) {
        for (var i = 0; i < tracks.length; i++) {
            this.addSimilarSong(tracks[i], itemTemplate);
        }
    }

    addSimilarSong(track, itemTemplate) {
        var id = guid(track.mbid, track.name.trim() + track.artist.name.trim());
        var song = new Song(id, new SongInfo(track.name, track.artist.name, null, null), getLargeImage(track.image));

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

    private buildSimilarSearchUrl(song:Song):string {
        if (isMbid(song.mbid)) {
            return "http://ws.audioscrobbler.com/2.0/?method=track.getsimilar&mbid="
                + song.mbid + "&api_key=" + lastFmApiKey + "&format=json&limit=5";
        } else {
            return "http://ws.audioscrobbler.com/2.0/?method=track.getsimilar&artist="
                + song.info.artist + "&track=" + song.info.title + "&api_key=" + lastFmApiKey + "&format=json&limit=5";
        }
    }

    private buildItemList(song:Song):any {
        var listContainer = $("<div></div>");
        var listTemplate = template("#searchSongListTemplate");

        var imageTemplate = this.buildLargeImageTemplate(song.imageUrl);
        imageTemplate.addClass("clickable");

        listContainer.append(listTemplate);
        listContainer.find("#searchSongTitle").text(song.info.title + " - " + song.info.artist);
        listContainer.find("#searchLargeImageContainer").append(imageTemplate);

        return listContainer;
    }

    buildMainSearchUrl():string {
        return "http://ws.audioscrobbler.com/2.0/?method=track.search&track="
            + this.session.query + "&api_key=" + lastFmApiKey + "&format=json&limit=5";
    }
}

class SearchArtistCallback extends SearchCallback {
    constructor(public session:SearchSession) {
        super(session);
    }

    load() {
        $.ajax({
            url: this.buildMainSearchUrl(),
            dataType: "json",
            method: "POST",
            success: (res:any) => this.onMainResult(res["results"]["artistmatches"]["artist"])
        })
    }

    private onMainResult(artists:any[]) {
        for (var i = 0; i < artists.length; i++) {
            this.pushMainResult(artists[i]);
        }
        this.removeLoadingScreen("#searchArtistLoadingContainer");
    }

    private pushMainResult(artist:any) {
        var id = guid(artist.mbid, artist.name.trim());
        var artistInfo = new Artist(id, new ArtistInfo(artist.name), getExtraLargeImage(artist.image));

        var itemTemplate = this.buildItemList(artistInfo);
        this.session.rootNode().find("#searchPageArtistContainer").append(itemTemplate);

        this.loadArtistSongs(artistInfo, itemTemplate);
    }

    private loadArtistSongs(artist:Artist, itemTemplate:any) {
        $.ajax({
            url: this.buildArtistSearchUrl(artist),
            dataType: "json",
            method: "POST",
            success: (res:any) => this.onArtistResults(res, itemTemplate)
        })
    }

    private onArtistResults(res, itemTemplate) {
        if (res.error == null && res["toptracks"]["track"] != null) {
            this.addArtistSongs(res["toptracks"]["track"], itemTemplate);
        } else {
            this.addNoArtistSongsTemplate(itemTemplate);
        }
        this.removeSimilarLoader(itemTemplate, "#searchSimilarLoadingContainer");
    }

    private addArtistSongs(tracks, itemTemplate) {
        for (var i = 0; i < tracks.length; i++) {
            this.addArtistSong(tracks[i], itemTemplate);
        }
    }

    private addArtistSong(track, itemTemplate) {
        var id = guid(track.mbid, track.name.trim() + track.artist.name.trim());
        var song = new Song(id, new SongInfo(track.name, track.artist.name, null, null), getLargeImage(track.image));

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

    private buildArtistSearchUrl(artist:Artist):string {
        if (isMbid(artist.mbid)) {
            return "http://ws.audioscrobbler.com/2.0/?method=artist.gettoptracks&mbid="
                + artist.mbid + "&api_key=" + lastFmApiKey + "&format=json&limit=5";
        } else {
            return "http://ws.audioscrobbler.com/2.0/?method=artist.gettoptracks&artist="
                + artist.info.name + "&api_key=" + lastFmApiKey + "&format=json&limit=5";
        }
    }

    private buildItemList(artist:Artist):any {
        var listContainer = $("<div></div>");
        var listTemplate = template("#searchSongListTemplate");

        var imageTemplate = this.buildLargeImageTemplate(artist.imageUrl);

        listContainer.append(listTemplate);
        listContainer.find("#searchSongTitle").text(artist.info.name);
        listContainer.find("#searchLargeImageContainer").append(imageTemplate);

        return listContainer;
    }

    buildMainSearchUrl():string {
        return "http://ws.audioscrobbler.com/2.0/?method=artist.search&artist="
            + this.session.query + "&api_key=" + lastFmApiKey + "&format=json&limit=5";
    }
}

class SearchAlbumCallback extends SearchCallback {
    constructor(public session:SearchSession) {
        super(session);
    }

    load() {
        $.ajax({
            url: this.buildMainSearchUrl(),
            dataType: "json",
            method: "POST",
            success: (res:any) =>
                this.onMainResult(res["results"]["albummatches"]["album"])
        })
    }

    private onMainResult(albums:any[]) {
        for (var i = 0; i < albums.length; i++) {
            this.pushMainResult(albums[i]);
        }
        this.removeLoadingScreen("#searchAlbumLoadingContainer");
    }

    private pushMainResult(albumInfo:any) {
        var id = guid(albumInfo.mbid, albumInfo.name.trim() + albumInfo.artist.trim());
        var album = new Album(albumInfo.mbid, new AlbumInfo(albumInfo.name, albumInfo.artist), getExtraLargeImage(albumInfo.image));

        var itemTemplate = this.buildItemList(album);
        this.session.rootNode().find("#searchPageAlbumsContainer").append(itemTemplate);

        this.loadAlbumSongs(album, itemTemplate);
    }

    private loadAlbumSongs(album:Album, itemTemplate:any) {
        $.ajax({
            url: this.buildAlbumSearchUrl(album),
            dataType: "json",
            method: "POST",
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
        var song = new Song(id, new SongInfo(track.name, track.artist.name, null, null), image);

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
        var listTemplate = template("#searchSongListTemplate");

        var imageTemplate = this.buildLargeImageTemplate(album.imageUrl);

        listContainer.append(listTemplate);
        listContainer.find("#searchSongTitle").text(album.info.artist + "-" + album.info.name);
        listContainer.find("#searchLargeImageContainer").append(imageTemplate);

        return listContainer;
    }

    buildMainSearchUrl():string {
        return "http://ws.audioscrobbler.com/2.0/?method=album.search&album="
            + this.session.query + "&api_key=" + lastFmApiKey + "&format=json&limit=5";
    }
}

class SearchGenreCallback extends SearchCallback {
    constructor(public session:SearchSession) {
        super(session);
    }

    load() {
        $.ajax({
            url: this.buildMainSearchUrl(),
            dataType: "json",
            method: "POST",
            success: (res:any) => this.onMainResult(res["results"]["tagmatches"]["tag"])
        })
    }

    private onMainResult(tags:any[]) {
        for (var i = 0; i < tags.length; i++) {
            this.pushMainResult(tags[i]);
        }
        this.removeLoadingScreen("#searchGenreLoadingContainer");
    }

    private pushMainResult(tagInfo:any) {
        var tag = new Tag(tagInfo.name);

        var itemTemplate = this.buildItemList(tag);
        this.session.rootNode().find("#searchPageGenreContainer").append(itemTemplate);

        this.loadGenreSongs(tag, itemTemplate);
    }

    private loadGenreSongs(tag:Tag, itemTemplate:any) {
        $.ajax({
            url: this.buildGenreSearchUrl(tag),
            dataType: "json",
            method: "POST",
            success: (res:any) => this.onGenreResults(res, itemTemplate)
        })
    }

    private onGenreResults(res, itemTemplate) {
        if (res.error == null && res["toptracks"]["track"] != null) {
            this.addGenreSongs(res["toptracks"]["track"], itemTemplate);
        } else {
            this.addNoGenreSongsTemplate(itemTemplate);
        }
        this.removeSimilarLoader(itemTemplate, "#searchGenreSimilarLoadingContainer");
    }

    private addGenreSongs(tracks, itemTemplate) {
        for (var i = 0; i < tracks.length; i++) {
            this.addGenreSong(tracks[i], itemTemplate);
        }
    }

    private addGenreSong(track, itemTemplate) {
        var id = guid(track.mbid, track.name.trim() + track.artist.name.trim());
        var song = new Song(id, new SongInfo(track.name, track.artist.name, null, null), getLargeImage(track.image));

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

    private buildGenreSearchUrl(tag:Tag):string {
        return "http://ws.audioscrobbler.com/2.0/?method=tag.gettoptracks&tag="
            + tag.name + "&api_key=" + lastFmApiKey + "&format=json&limit=5";
    }

    private buildItemList(tag:Tag):any {
        var listContainer = $("<div></div>");
        var listTemplate = template("#searchGenreListTemplate");

        listContainer.append(listTemplate);
        listContainer.find("#searchGenreTitle").text(tag.name);

        return listContainer;
    }

    buildMainSearchUrl():string {
        return "http://ws.audioscrobbler.com/2.0/?method=tag.search&tag="
            + this.session.query + "&api_key=" + lastFmApiKey + "&format=json&limit=5";
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

        $(this.session.rootNode()).find("#searchPageTable")
            .transition({
                left: -index * page.width()
            });
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