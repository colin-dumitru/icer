var SearchBinder = (function () {
    function SearchBinder() {
        this.firstDisplay = true;
    }
    SearchBinder.prototype.buildPage = function (rootNode) {
        this.manager = new SearchManager(rootNode);
    };
    SearchBinder.prototype.bind = function () {
        var _this = this;
        itemList.popItemList("search");
        itemList.show();
        if(this.firstDisplay) {
            this.loadData();
        }
        itemList.onInput = function (input) {
            _this.manager.performSearch(input);
        };
        $(window).bind("keydown", this.navigationHandler);
    };
    SearchBinder.prototype.navigationHandler = function (event) {
        switch(event.which) {
            case 37:
                (binders["search"]).manager.givePreviousPageFocus();
                event.preventDefault();
                break;
            case 38:
                (binders["search"]).manager.givePreviousSessionFocus();
                event.preventDefault();
                break;
            case 39:
                (binders["search"]).manager.giveNextPageFocus();
                event.preventDefault();
                break;
            case 40:
                (binders["search"]).manager.giveNextSessionFocus();
                event.preventDefault();
                break;
        }
    };
    SearchBinder.prototype.loadData = function () {
        this.manager.performSearch("ColdPlay");
        this.manager.performSearch("Matt Kearney");
        this.manager.performSearch("John Mayer");
        this.firstDisplay = false;
    };
    SearchBinder.prototype.unbind = function () {
        itemList.hide();
        itemList.pushItemList("search");
        $(window).unbind("keydown", this.navigationHandler);
    };
    return SearchBinder;
})();
var SearchManager = (function () {
    function SearchManager(rootNode) {
        this.rootNode = rootNode;
        this.searchSessions = {
        };
        this.searchSessionsQueue = [];
        this.previousSessionId = 0;
    }
    SearchManager.prototype.performSearch = function (query) {
        var sessionId = "search" + this.previousSessionId++;
        var session = new SearchSession(sessionId, query, query);
        this.buildSession(session);
        this.buildSessionItem(session);
        this.pushSession(session);
        this.registerSearchCallback(session);
    };
    SearchManager.prototype.registerSearchCallback = function (session) {
        new SearchSongCallback(session).load();
        new SearchArtistCallback(session).load();
    };
    SearchManager.prototype.pushSession = function (session) {
        this.searchSessionsQueue.push(session);
        this.giveSessionFocus(session);
    };
    SearchManager.prototype.givePreviousSessionFocus = function () {
        if(this.currentIndex == 0) {
            return;
        }
        this.giveSessionFocus(this.searchSessionsQueue[this.currentIndex - 1]);
    };
    SearchManager.prototype.giveNextSessionFocus = function () {
        if(this.currentIndex == (this.searchSessionsQueue.length - 1)) {
            return;
        }
        this.giveSessionFocus(this.searchSessionsQueue[this.currentIndex + 1]);
    };
    SearchManager.prototype.giveNextPageFocus = function () {
        var session = this.searchSessionsQueue[this.currentIndex];
        session.pageManager.nextPage();
    };
    SearchManager.prototype.givePreviousPageFocus = function () {
        var session = this.searchSessionsQueue[this.currentIndex];
        session.pageManager.previousPage();
    };
    SearchManager.prototype.giveSessionFocus = function (session) {
        var _this = this;
        this.currentIndex = this.searchSessionsQueue.indexOf(session);
        this.searchSessionsQueue.forEach(function (session, i) {
            session.rootNode().transition({
                perspective: 100,
                translate3d: [
                    0, 
                    -100 * (i - _this.currentIndex), 
                    20 * (i - _this.currentIndex)
                ],
                opacity: (i > _this.currentIndex) ? 0 : (i == _this.currentIndex) ? 1 : 0.5
            }, 400).removeClass("hidden");
        });
        window.setTimeout(function () {
            _this.searchSessionsQueue.forEach(function (session, index) {
                if(index > _this.currentIndex) {
                    $(session.rootNode()).addClass("hidden");
                }
            });
        }, 400);
    };
    SearchManager.prototype.buildSessionItem = function (session) {
        var _this = this;
        var item = new Item(session.id, session.title);
        itemList.addItem(item);
        item.onSelect = function () {
            _this.changeSearchSession(session);
        };
        itemList.switchItem(item);
    };
    SearchManager.prototype.buildSession = function (session) {
        this.searchSessions[session.id] = session;
        this.buildPage(session);
        session.pageManager = new SearchPageManager(session);
        session.pageManager.bind();
    };
    SearchManager.prototype.changeSearchSession = function (session) {
        this.giveSessionFocus(session);
    };
    SearchManager.prototype.buildPage = function (session) {
        var htmlTemplate = template("#searchPageTemplate", session.id);
        $("#searchTableContainer").append(htmlTemplate);
    };
    return SearchManager;
})();
var SearchSongCallback = (function () {
    function SearchSongCallback(session) {
        this.session = session;
    }
    SearchSongCallback.prototype.load = function () {
        var _this = this;
        $.ajax({
            url: this.buildMainSearchUrl(),
            method: "POST",
            success: function (res) {
                return _this.onMainResult(res["results"]["trackmatches"]["track"]);
            }
        });
    };
    SearchSongCallback.prototype.onMainResult = function (tracks) {
        for(var i = 0; i < tracks.length; i++) {
            this.pushMainResult(tracks[i]);
        }
        this.removeLoadingScreen();
    };
    SearchSongCallback.prototype.pushMainResult = function (track) {
        var song = new Song(track.mbid, new SongInfo(track.name, track.artist, null, null), getExtraLargeImage(track));
        loadSongInfo(song);
        var itemTemplate = this.buildItemList(song);
        this.session.rootNode().find("#searchPageSongsContainer").append(itemTemplate);
        this.loadSimilarSongs(song, itemTemplate);
    };
    SearchSongCallback.prototype.loadSimilarSongs = function (song, itemTemplate) {
        var _this = this;
        $.ajax({
            url: this.buildSimilarSearchUrl(song),
            method: "POST",
            success: function (res) {
                return _this.onSimilarResults(res, itemTemplate);
            }
        });
    };
    SearchSongCallback.prototype.onSimilarResults = function (res, itemTemplate) {
        if(res.error == null) {
            this.addSimilarSongs(res.similartracks.track, itemTemplate);
        } else {
            this.addNoSimilarSongsTemplate(itemTemplate);
        }
        this.removeSimilarLoader(itemTemplate);
    };
    SearchSongCallback.prototype.removeSimilarLoader = function (itemTemplate) {
        itemTemplate.find("#searchSimilarLoadingContainer").fadeOut(400, function () {
            this.remove();
        });
    };
    SearchSongCallback.prototype.addSimilarSongs = function (tracks, itemTemplate) {
        for(var i = 0; i < tracks.length; i++) {
            this.addSimilarSong(tracks[i], itemTemplate);
        }
    };
    SearchSongCallback.prototype.addSimilarSong = function (track, itemTemplate) {
        var song = new Song(track.mbid, new SongInfo(track.name, track.artist.name, null, null), getLargeImage(track));
        loadSongInfo(song);
        var songTemplate = buildSmallSong(song);
        songTemplate.addClass("searchSimilarSong");
        itemTemplate.find("#searchSongListContainer").append(songTemplate);
    };
    SearchSongCallback.prototype.addNoSimilarSongsTemplate = function (itemTemplate) {
        var container = $("<div></div>");
        var messageTemplate = template("#searchSongNoSimilarTemplate", "No similar songs found");
        container.append(messageTemplate);
        itemTemplate.find("#searchSongListContainer").append(container);
    };
    SearchSongCallback.prototype.buildSimilarSearchUrl = function (song) {
        return "http://ws.audioscrobbler.com/2.0/?method=track.getsimilar&mbid=" + song.mbid + "&api_key=" + lastFmApiKey + "&format=json&limit=10";
    };
    SearchSongCallback.prototype.removeLoadingScreen = function () {
        this.session.rootNode().find("#searchPageLoadingContainer").fadeOut(400, function () {
            this.remove();
        });
    };
    SearchSongCallback.prototype.buildItemList = function (song) {
        var listContainer = $("<div></div>");
        var listTemplate = template("#searchSongListTemplate");
        var imageTemplate = this.buildLargeImageTemplate(song);
        listContainer.append(listTemplate);
        listContainer.find("#searchSongTitle").text(song.info.title + " - " + song.info.artist);
        listContainer.find("#searchLargeImageContainer").append(imageTemplate);
        return listContainer;
    };
    SearchSongCallback.prototype.buildLargeImageTemplate = function (song) {
        var img = $("<img />");
        img.attr("src", song.imageUrl).attr("width", 150).attr("height", 150);
        return img;
    };
    SearchSongCallback.prototype.buildMainSearchUrl = function () {
        return "http://ws.audioscrobbler.com/2.0/?method=track.search&track=" + this.session.query + "&api_key=" + lastFmApiKey + "&format=json&limit=10";
    };
    return SearchSongCallback;
})();
var SearchArtistCallback = (function () {
    function SearchArtistCallback(session) {
        this.session = session;
    }
    SearchArtistCallback.prototype.load = function () {
        var _this = this;
        $.ajax({
            url: this.buildMainSearchUrl(),
            method: "POST",
            success: function (res) {
                return _this.onMainResult(res["results"]["artistmatches"]["artist"]);
            }
        });
    };
    SearchArtistCallback.prototype.onMainResult = function (artists) {
        for(var i = 0; i < artists.length; i++) {
            this.pushMainResult(artists[i]);
        }
        this.removeLoadingScreen();
    };
    SearchArtistCallback.prototype.pushMainResult = function (artist) {
        var artist = new Artist(artist.mbid, new ArtistInfo(artist.name), getExtraLargeImage(artist));
        var itemTemplate = this.buildItemList(artist);
        this.session.rootNode().find("#searchPageArtistContainer").append(itemTemplate);
        this.loadArtistSongs(artist, itemTemplate);
    };
    SearchArtistCallback.prototype.loadArtistSongs = function (artist, itemTemplate) {
        var _this = this;
        $.ajax({
            url: this.buildArtistSearchUrl(artist),
            method: "POST",
            success: function (res) {
                return _this.onArtistResults(res, itemTemplate);
            }
        });
    };
    SearchArtistCallback.prototype.onArtistResults = function (res, itemTemplate) {
        if(res.error == null) {
            this.addArtistSongs(res["toptracks"]["track"], itemTemplate);
        } else {
            this.addNoArtistSongsTemplate(itemTemplate);
        }
        this.removeSimilarLoader(itemTemplate);
    };
    SearchArtistCallback.prototype.removeSimilarLoader = function (itemTemplate) {
        itemTemplate.find("#searchSimilarLoadingContainer").fadeOut(400, function () {
            this.remove();
        });
    };
    SearchArtistCallback.prototype.addArtistSongs = function (tracks, itemTemplate) {
        if(tracks == null) {
            return;
        }
        for(var i = 0; i < tracks.length; i++) {
            this.addArtistSong(tracks[i], itemTemplate);
        }
    };
    SearchArtistCallback.prototype.addArtistSong = function (track, itemTemplate) {
        var song = new Song(track.mbid, new SongInfo(track.name, track.artist.name, null, null), getLargeImage(track));
        loadSongInfo(song);
        var songTemplate = buildSmallSong(song);
        songTemplate.addClass("searchSimilarSong");
        itemTemplate.find("#searchSongListContainer").append(songTemplate);
    };
    SearchArtistCallback.prototype.addNoArtistSongsTemplate = function (itemTemplate) {
        var container = $("<div></div>");
        var messageTemplate = template("#searchSongNoSimilarTemplate", "No songs were found for artist");
        container.append(messageTemplate);
        itemTemplate.find("#searchSongListContainer").append(container);
    };
    SearchArtistCallback.prototype.buildArtistSearchUrl = function (artist) {
        if(artist.mbid == null || artist.mbid.length == 0) {
            return "http://ws.audioscrobbler.com/2.0/?method=artist.gettoptracks&artist=" + artist.info.name + "&api_key=" + lastFmApiKey + "&format=json&limit=10";
        } else {
            return "http://ws.audioscrobbler.com/2.0/?method=artist.gettoptracks&mbid=" + artist.mbid + "&api_key=" + lastFmApiKey + "&format=json&limit=10";
        }
    };
    SearchArtistCallback.prototype.removeLoadingScreen = function () {
        this.session.rootNode().find("#searchArtistLoadingContainer").fadeOut(400, function () {
            this.remove();
        });
    };
    SearchArtistCallback.prototype.buildItemList = function (artist) {
        var listContainer = $("<div></div>");
        var listTemplate = template("#searchSongListTemplate");
        var imageTemplate = this.buildLargeImageTemplate(artist);
        listContainer.append(listTemplate);
        listContainer.find("#searchSongTitle").text(artist.info.name);
        listContainer.find("#searchLargeImageContainer").append(imageTemplate);
        return listContainer;
    };
    SearchArtistCallback.prototype.buildLargeImageTemplate = function (artist) {
        var img = $("<img />");
        img.attr("src", artist.imageUrl).attr("width", 150).attr("height", 150);
        return img;
    };
    SearchArtistCallback.prototype.buildMainSearchUrl = function () {
        return "http://ws.audioscrobbler.com/2.0/?method=artist.search&artist=" + this.session.query + "&api_key=" + lastFmApiKey + "&format=json&limit=10";
    };
    return SearchArtistCallback;
})();
var SearchPageManager = (function () {
    function SearchPageManager(session) {
        this.session = session;
        this.pageIndex = 0;
    }
    SearchPageManager.prototype.bind = function () {
        var _this = this;
        $(this.session.rootNode()).find("#searchMenuSongs").click(function () {
            _this.switchToPage(0);
        });
        $(this.session.rootNode()).find("#searchMenuArtist").click(function () {
            _this.switchToPage(1);
        });
        $(this.session.rootNode()).find("#searchMenuAlbums").click(function () {
            _this.switchToPage(2);
        });
        $(this.session.rootNode()).find("#searchMenuGenre").click(function () {
            _this.switchToPage(3);
        });
        this.switchToPage(0);
    };
    SearchPageManager.prototype.switchToPage = function (index) {
        this.takeFocusMenuItem(this.pageIndex);
        this.giveFocusMenuItem(index);
        this.takeFocusPage(this.pageIndex);
        this.giveFocusPage(index);
        this.pageIndex = index;
    };
    SearchPageManager.prototype.giveFocusMenuItem = function (index) {
        this.getMenuItem(index).addClass("searchMenuSelectorSelected");
    };
    SearchPageManager.prototype.takeFocusMenuItem = function (index) {
        this.getMenuItem(index).removeClass("searchMenuSelectorSelected");
    };
    SearchPageManager.prototype.nextPage = function () {
        if(this.pageIndex > 2) {
            return;
        }
        this.switchToPage(this.pageIndex + 1);
    };
    SearchPageManager.prototype.previousPage = function () {
        if(this.pageIndex < 1) {
            return;
        }
        this.switchToPage(this.pageIndex - 1);
    };
    SearchPageManager.prototype.giveFocusPage = function (index) {
        var page = this.getPage(index);
        $(this.session.rootNode()).find("#searchPageTable").transition({
            left: -index * page.width()
        });
        page.find(".searchPageSongContainer").addClass("searchPageSongContainerFocused");
    };
    SearchPageManager.prototype.takeFocusPage = function (index) {
        var page = this.getPage(index);
        page.find(".searchPageSongContainer").removeClass("searchPageSongContainerFocused");
    };
    SearchPageManager.prototype.getMenuItem = function (index) {
        switch(index) {
            case 0:
                return $(this.session.rootNode()).find("#searchMenuSongs");
            case 1:
                return $(this.session.rootNode()).find("#searchMenuArtist");
            case 2:
                return $(this.session.rootNode()).find("#searchMenuAlbums");
            case 3:
                return $(this.session.rootNode()).find("#searchMenuGenre");
        }
    };
    SearchPageManager.prototype.getPage = function (index) {
        switch(index) {
            case 0:
                return $(this.session.rootNode()).find("#searchPageSongs");
            case 1:
                return $(this.session.rootNode()).find("#searchPageArtist");
            case 2:
                return $(this.session.rootNode()).find("#searchPageAlbums");
            case 3:
                return $(this.session.rootNode()).find("#searchPageGenre");
        }
    };
    return SearchPageManager;
})();
var SearchSession = (function () {
    function SearchSession(id, title, query) {
        this.id = id;
        this.title = title;
        this.query = query;
    }
    SearchSession.prototype.rootNode = function () {
        return $("#" + this.id);
    };
    return SearchSession;
})();
//@ sourceMappingURL=search.js.map
