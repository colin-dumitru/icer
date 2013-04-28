declare var lastFmApiKey;

class SearchBinder implements SectionBinder {
    private manager:SearchManager;
    private firstDisplay = true;


    buildPage(rootNode:any) {
        this.manager = new SearchManager(rootNode);
    }

    bind() {
        itemList.popItemList("search");
        itemList.show();
        if (this.firstDisplay) {
            this.loadData();
        }
        itemList.onInput = (input:string) => {
            this.manager.performSearch(input);
        };

        $(window).bind("keydown", this.navigationHandler);
    }

    navigationHandler(event) {
        switch (event.which) {
            case 37: //left
                (<SearchBinder>binders["search"]).manager.givePreviousPageFocus();
                event.preventDefault();
                break;
            case 38: //up
                (<SearchBinder>binders["search"]).manager.givePreviousSessionFocus();
                event.preventDefault();
                break;
            case 39: //right
                (<SearchBinder>binders["search"]).manager.giveNextPageFocus();
                event.preventDefault();
                break;
            case 40: //down
                (<SearchBinder>binders["search"]).manager.giveNextSessionFocus();
                event.preventDefault();
                break;
        }
    }

    loadData() {
        this.manager.performSearch("ColdPlay");
        this.manager.performSearch("Matt Kearney");
        this.manager.performSearch("John Mayer");
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
                .transition({
                    perspective: 100,
                    translate3d: [0, -100 * (i - this.currentIndex), 20 * (i - this.currentIndex)],
                    opacity: (i > this.currentIndex) ? 0 : (i == this.currentIndex) ? 1 : 0.5
                }, 400)
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

class SearchSongCallback {
    constructor(public session:SearchSession) {

    }

    load() {
        $.ajax({
            url: this.buildMainSearchUrl(),
            method: "POST",
            success: (res:any) => this.onMainResult(res["results"]["trackmatches"]["track"])
        })
    }

    private onMainResult(tracks:any[]) {
        for (var i = 0; i < tracks.length; i++) {
            this.pushMainResult(tracks[i]);
        }
        this.removeLoadingScreen();
    }

    private pushMainResult(track:any) {
        var song = new Song(track.mbid, new SongInfo(track.name, track.artist, null, null), getExtraLargeImage(track));
        loadSongInfo(song);

        var itemTemplate = this.buildItemList(song);
        this.session.rootNode().find("#searchPageSongsContainer").append(itemTemplate);

        this.loadSimilarSongs(song, itemTemplate);
    }

    private loadSimilarSongs(song:Song, itemTemplate:any) {
        $.ajax({
            url: this.buildSimilarSearchUrl(song),
            method: "POST",
            success: (res:any) => this.onSimilarResults(res, itemTemplate)
        })
    }

    private onSimilarResults(res, itemTemplate) {
        if (res.error == null) {
            this.addSimilarSongs(res.similartracks.track, itemTemplate);
        } else {
            this.addNoSimilarSongsTemplate(itemTemplate);
        }
        this.removeSimilarLoader(itemTemplate);
    }

    private removeSimilarLoader(itemTemplate) {
        itemTemplate.find("#searchSimilarLoadingContainer")
            .fadeOut(400, function () {
                this.remove();
            });
    }

    addSimilarSongs(tracks, itemTemplate) {
        for (var i = 0; i < tracks.length; i++) {
            this.addSimilarSong(tracks[i], itemTemplate);
        }
    }

    addSimilarSong(track, itemTemplate) {
        var song = new Song(track.mbid, new SongInfo(track.name, track.artist.name, null, null), getLargeImage(track));
        loadSongInfo(song);

        var songTemplate = buildSmallSong(song);
        songTemplate.addClass("searchSimilarSong");

        itemTemplate.find("#searchSongListContainer").append(songTemplate);
    }

    private addNoSimilarSongsTemplate(itemTemplate) {
        var container = $("<div></div>");
        var messageTemplate = template("#searchSongNoSimilarTemplate", "No similar songs found");

        container.append(messageTemplate);
        itemTemplate.find("#searchSongListContainer").append(container);
    }

    private buildSimilarSearchUrl(song:Song):string {
        return "http://ws.audioscrobbler.com/2.0/?method=track.getsimilar&mbid="
            + song.mbid + "&api_key=" + lastFmApiKey + "&format=json&limit=10";
    }

    private removeLoadingScreen() {
        this.session.rootNode().find("#searchPageLoadingContainer")
            .fadeOut(400, function () {
                this.remove()
            });
    }

    private buildItemList(song:Song):any {
        var listContainer = $("<div></div>");
        var listTemplate = template("#searchSongListTemplate");

        var imageTemplate = this.buildLargeImageTemplate(song);

        listContainer.append(listTemplate);
        listContainer.find("#searchSongTitle").text(song.info.title + " - " + song.info.artist);
        listContainer.find("#searchLargeImageContainer").append(imageTemplate);

        return listContainer;
    }

    buildLargeImageTemplate(song:Song) {
        var img = $("<img />");
        img
            .attr("src", song.imageUrl)
            .attr("width", 150)
            .attr("height", 150);
        return img;
    }

    buildMainSearchUrl():string {
        return "http://ws.audioscrobbler.com/2.0/?method=track.search&track="
            + this.session.query + "&api_key=" + lastFmApiKey + "&format=json&limit=10";
    }
}

class SearchArtistCallback {
    constructor(public session:SearchSession) {

    }

    load() {
        $.ajax({
            url: this.buildMainSearchUrl(),
            method: "POST",
            success: (res:any) => this.onMainResult(res["results"]["artistmatches"]["artist"])
        })
    }

    private onMainResult(artists:any[]) {
        for (var i = 0; i < artists.length; i++) {
            this.pushMainResult(artists[i]);
        }
        this.removeLoadingScreen();
    }

    private pushMainResult(artist:any) {
        var artist = new Artist(artist.mbid, new ArtistInfo(artist.name), getExtraLargeImage(artist));

        var itemTemplate = this.buildItemList(artist);
        this.session.rootNode().find("#searchPageArtistContainer").append(itemTemplate);

        this.loadArtistSongs(artist, itemTemplate);
    }

    private loadArtistSongs(artist:Artist, itemTemplate:any) {
        $.ajax({
            url: this.buildArtistSearchUrl(artist),
            method: "POST",
            success: (res:any) => this.onArtistResults(res, itemTemplate)
        })
    }

    private onArtistResults(res, itemTemplate) {
        if (res.error == null) {
            this.addArtistSongs(res["toptracks"]["track"], itemTemplate);
        } else {
            this.addNoArtistSongsTemplate(itemTemplate);
        }
        this.removeSimilarLoader(itemTemplate);
    }

    private removeSimilarLoader(itemTemplate) {
        itemTemplate.find("#searchSimilarLoadingContainer")
            .fadeOut(400, function () {
                this.remove();
            });
    }

    private addArtistSongs(tracks, itemTemplate) {
        if (tracks == null) {
            return;
        }
        for (var i = 0; i < tracks.length; i++) {
            this.addArtistSong(tracks[i], itemTemplate);
        }
    }

    private addArtistSong(track, itemTemplate) {
        var song = new Song(track.mbid, new SongInfo(track.name, track.artist.name, null, null), getLargeImage(track));
        loadSongInfo(song);

        var songTemplate = buildSmallSong(song);
        songTemplate.addClass("searchSimilarSong");

        itemTemplate.find("#searchSongListContainer").append(songTemplate);
    }

    private addNoArtistSongsTemplate(itemTemplate) {
        var container = $("<div></div>");
        var messageTemplate = template("#searchSongNoSimilarTemplate", "No songs were found for artist");

        container.append(messageTemplate);
        itemTemplate.find("#searchSongListContainer").append(container);
    }

    private buildArtistSearchUrl(artist:Artist):string {
        if (artist.mbid == null || artist.mbid.length == 0) {
            return "http://ws.audioscrobbler.com/2.0/?method=artist.gettoptracks&artist="
                + artist.info.name + "&api_key=" + lastFmApiKey + "&format=json&limit=10";
        } else {
            return "http://ws.audioscrobbler.com/2.0/?method=artist.gettoptracks&mbid="
                + artist.mbid + "&api_key=" + lastFmApiKey + "&format=json&limit=10";
        }
    }

    private removeLoadingScreen() {
        this.session.rootNode().find("#searchArtistLoadingContainer")
            .fadeOut(400, function () {
                this.remove()
            });
    }

    private buildItemList(artist:Artist):any {
        var listContainer = $("<div></div>");
        var listTemplate = template("#searchSongListTemplate");

        var imageTemplate = this.buildLargeImageTemplate(artist);

        listContainer.append(listTemplate);
        listContainer.find("#searchSongTitle").text(artist.info.name);
        listContainer.find("#searchLargeImageContainer").append(imageTemplate);

        return listContainer;
    }

    buildLargeImageTemplate(artist:Artist) {
        var img = $("<img />");
        img
            .attr("src", artist.imageUrl)
            .attr("width", 150)
            .attr("height", 150);
        return img;
    }

    buildMainSearchUrl():string {
        return "http://ws.audioscrobbler.com/2.0/?method=artist.search&artist="
            + this.session.query + "&api_key=" + lastFmApiKey + "&format=json&limit=10";
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
            })
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