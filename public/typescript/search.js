var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
}
var globalSearchManager = null;
var SearchBinder = (function () {
    function SearchBinder() {
        this.firstDisplay = true;
    }
    SearchBinder.prototype.buildPage = function (rootNode) {
        globalSearchManager = new SearchManager(rootNode);
    };
    SearchBinder.prototype.bind = function () {
        itemList.popItemList("search");
        itemList.show();
        if(this.firstDisplay) {
            this.loadData();
        }
        itemList.onInput = function (input) {
            globalSearchManager.performSearch(input);
        };
        $(window).bind("keydown", this.navigationHandler);
    };
    SearchBinder.prototype.navigationHandler = function (event) {
        switch(event.which) {
            case 37: {
                globalSearchManager.givePreviousPageFocus();
                event.preventDefault();
                break;

            }
            case 38: {
                globalSearchManager.givePreviousSessionFocus();
                event.preventDefault();
                break;

            }
            case 39: {
                globalSearchManager.giveNextPageFocus();
                event.preventDefault();
                break;

            }
            case 40: {
                globalSearchManager.giveNextSessionFocus();
                event.preventDefault();
                break;

            }
        }
    };
    SearchBinder.prototype.loadData = function () {
        globalSearchManager.performSearch("ColdPlay");
        globalSearchManager.performSearch("Bridgit Mendler");
        globalSearchManager.performSearch("John Mayer");
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
        new SearchAlbumCallback(session).load();
        new SearchGenreCallback(session).load();
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
var SearchCallback = (function () {
    function SearchCallback(session) {
        this.session = session;
    }
    SearchCallback.prototype.removeLoadingScreen = function (loadingContainer) {
        var container = this.session.rootNode().find(loadingContainer);
        container.fadeOut(400, function () {
            container.remove();
        });
    };
    SearchCallback.prototype.removeSimilarLoader = function (itemTemplate, containerId) {
        var container = itemTemplate.find(containerId);
        container.fadeOut(400, function () {
            container.remove();
        });
    };
    SearchCallback.prototype.buildLargeImageTemplate = function (url) {
        var img = $("<img />");
        img.attr("src", url).attr("width", 150).attr("height", 150);
        return img;
    };
    SearchCallback.prototype.bindSongMenu = function (song, template) {
        var _this = this;
        var detailCallback = function (selectedItem) {
            if(selectedItem == "Play Now") {
                _this.playSong(song);
            } else {
                if(selectedItem == "Add to Now Playing") {
                    _this.pushSong(song);
                } else {
                    if(selectedItem == "Search From Here") {
                        _this.searchFromSong(song);
                    }
                }
            }
        };
        template.click(function (e) {
            songDetailManager.showDetails([
                "Play Now", 
                "Add to Now Playing", 
                "Search From Here", 
                "Add To Playlist"
            ], detailCallback, "/assets/mock/bio.html", {
                x: e.pageX,
                y: e.pageY
            });
        });
    };
    SearchCallback.prototype.searchFromSong = function (song) {
        globalSearchManager.performSearch(song.info.title + " " + song.info.artist);
    };
    SearchCallback.prototype.playSong = function (song) {
        globalPlaylistManager.pushSong(song);
        globalPlaylistManager.playSong(song);
    };
    SearchCallback.prototype.pushSong = function (song) {
        globalPlaylistManager.pushSong(song);
    };
    return SearchCallback;
})();
var SearchSongCallback = (function (_super) {
    __extends(SearchSongCallback, _super);
    function SearchSongCallback(session) {
        _super.call(this, session);
        this.session = session;
    }
    SearchSongCallback.prototype.load = function () {
        var _this = this;
        $.ajax({
            url: this.buildMainSearchUrl(),
            dataType: "json",
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
        this.removeLoadingScreen("#searchPageLoadingContainer");
    };
    SearchSongCallback.prototype.pushMainResult = function (track) {
        var id = guid(track.mbid, track.name.trim() + track.artist.trim());
        var song = new Song(id, new SongInfo(track.name, track.artist, null, null), getExtraLargeImage(track.image));
        var itemTemplate = this.buildItemList(song);
        this.session.rootNode().find("#searchPageSongsContainer").append(itemTemplate);
        this.bindSongMenu(song, itemTemplate.find("#searchLargeImageContainer"));
        this.loadSimilarSongs(song, itemTemplate);
    };
    SearchSongCallback.prototype.loadSimilarSongs = function (song, itemTemplate) {
        var _this = this;
        $.ajax({
            url: this.buildSimilarSearchUrl(song),
            dataType: "json",
            method: "POST",
            success: function (res) {
                return _this.onSimilarResults(res, itemTemplate);
            }
        });
    };
    SearchSongCallback.prototype.onSimilarResults = function (res, itemTemplate) {
        if(res.error == null && Array.isArray(res["similartracks"]["track"])) {
            this.addSimilarSongs(res["similartracks"]["track"], itemTemplate);
        } else {
            this.addNoSimilarSongsTemplate(itemTemplate);
        }
        this.removeSimilarLoader(itemTemplate, "#searchSimilarLoadingContainer");
    };
    SearchSongCallback.prototype.addSimilarSongs = function (tracks, itemTemplate) {
        for(var i = 0; i < tracks.length; i++) {
            this.addSimilarSong(tracks[i], itemTemplate);
        }
    };
    SearchSongCallback.prototype.addSimilarSong = function (track, itemTemplate) {
        var id = guid(track.mbid, track.name.trim() + track.artist.name.trim());
        var song = new Song(id, new SongInfo(track.name, track.artist.name, null, null), getLargeImage(track.image));
        var songTemplate = buildSmallSong(song);
        songTemplate.addClass("searchSimilarSong");
        itemTemplate.find("#searchSongListContainer").append(songTemplate);
        this.bindSongMenu(song, songTemplate);
    };
    SearchSongCallback.prototype.addNoSimilarSongsTemplate = function (itemTemplate) {
        var container = $("<div></div>");
        var messageTemplate = template("#searchSongNoSimilarTemplate", "No similar songs found");
        container.append(messageTemplate);
        itemTemplate.find("#searchSongListContainer").append(container);
    };
    SearchSongCallback.prototype.buildSimilarSearchUrl = function (song) {
        if(isMbid(song.mbid)) {
            return "http://ws.audioscrobbler.com/2.0/?method=track.getsimilar&mbid=" + song.mbid + "&api_key=" + lastFmApiKey + "&format=json&limit=5";
        } else {
            return "http://ws.audioscrobbler.com/2.0/?method=track.getsimilar&artist=" + song.info.artist + "&track=" + song.info.title + "&api_key=" + lastFmApiKey + "&format=json&limit=5";
        }
    };
    SearchSongCallback.prototype.buildItemList = function (song) {
        var listContainer = $("<div></div>");
        var listTemplate = template("#searchSongListTemplate");
        var imageTemplate = this.buildLargeImageTemplate(song.imageUrl);
        imageTemplate.addClass("clickable");
        listContainer.append(listTemplate);
        listContainer.find("#searchSongTitle").text(song.info.title + " - " + song.info.artist);
        listContainer.find("#searchLargeImageContainer").append(imageTemplate);
        return listContainer;
    };
    SearchSongCallback.prototype.buildMainSearchUrl = function () {
        return "http://ws.audioscrobbler.com/2.0/?method=track.search&track=" + this.session.query + "&api_key=" + lastFmApiKey + "&format=json&limit=5";
    };
    return SearchSongCallback;
})(SearchCallback);
var SearchArtistCallback = (function (_super) {
    __extends(SearchArtistCallback, _super);
    function SearchArtistCallback(session) {
        _super.call(this, session);
        this.session = session;
    }
    SearchArtistCallback.prototype.load = function () {
        var _this = this;
        $.ajax({
            url: this.buildMainSearchUrl(),
            dataType: "json",
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
        this.removeLoadingScreen("#searchArtistLoadingContainer");
    };
    SearchArtistCallback.prototype.pushMainResult = function (artist) {
        var id = guid(artist.mbid, artist.name.trim());
        var artistInfo = new Artist(id, new ArtistInfo(artist.name), getExtraLargeImage(artist.image));
        var itemTemplate = this.buildItemList(artistInfo);
        this.session.rootNode().find("#searchPageArtistContainer").append(itemTemplate);
        this.loadArtistSongs(artistInfo, itemTemplate);
    };
    SearchArtistCallback.prototype.loadArtistSongs = function (artist, itemTemplate) {
        var _this = this;
        $.ajax({
            url: this.buildArtistSearchUrl(artist),
            dataType: "json",
            method: "POST",
            success: function (res) {
                return _this.onArtistResults(res, itemTemplate);
            }
        });
    };
    SearchArtistCallback.prototype.onArtistResults = function (res, itemTemplate) {
        if(res.error == null && res["toptracks"]["track"] != null) {
            this.addArtistSongs(res["toptracks"]["track"], itemTemplate);
        } else {
            this.addNoArtistSongsTemplate(itemTemplate);
        }
        this.removeSimilarLoader(itemTemplate, "#searchSimilarLoadingContainer");
    };
    SearchArtistCallback.prototype.addArtistSongs = function (tracks, itemTemplate) {
        for(var i = 0; i < tracks.length; i++) {
            this.addArtistSong(tracks[i], itemTemplate);
        }
    };
    SearchArtistCallback.prototype.addArtistSong = function (track, itemTemplate) {
        var id = guid(track.mbid, track.name.trim() + track.artist.name.trim());
        var song = new Song(id, new SongInfo(track.name, track.artist.name, null, null), getLargeImage(track.image));
        var songTemplate = buildSmallSong(song);
        songTemplate.addClass("searchSimilarSong");
        this.bindSongMenu(song, songTemplate);
        itemTemplate.find("#searchSongListContainer").append(songTemplate);
    };
    SearchArtistCallback.prototype.addNoArtistSongsTemplate = function (itemTemplate) {
        var container = $("<div></div>");
        var messageTemplate = template("#searchSongNoSimilarTemplate", "No songs were found for artist");
        container.append(messageTemplate);
        itemTemplate.find("#searchSongListContainer").append(container);
    };
    SearchArtistCallback.prototype.buildArtistSearchUrl = function (artist) {
        if(isMbid(artist.mbid)) {
            return "http://ws.audioscrobbler.com/2.0/?method=artist.gettoptracks&mbid=" + artist.mbid + "&api_key=" + lastFmApiKey + "&format=json&limit=5";
        } else {
            return "http://ws.audioscrobbler.com/2.0/?method=artist.gettoptracks&artist=" + artist.info.name + "&api_key=" + lastFmApiKey + "&format=json&limit=5";
        }
    };
    SearchArtistCallback.prototype.buildItemList = function (artist) {
        var listContainer = $("<div></div>");
        var listTemplate = template("#searchSongListTemplate");
        var imageTemplate = this.buildLargeImageTemplate(artist.imageUrl);
        listContainer.append(listTemplate);
        listContainer.find("#searchSongTitle").text(artist.info.name);
        listContainer.find("#searchLargeImageContainer").append(imageTemplate);
        return listContainer;
    };
    SearchArtistCallback.prototype.buildMainSearchUrl = function () {
        return "http://ws.audioscrobbler.com/2.0/?method=artist.search&artist=" + this.session.query + "&api_key=" + lastFmApiKey + "&format=json&limit=5";
    };
    return SearchArtistCallback;
})(SearchCallback);
var SearchAlbumCallback = (function (_super) {
    __extends(SearchAlbumCallback, _super);
    function SearchAlbumCallback(session) {
        _super.call(this, session);
        this.session = session;
    }
    SearchAlbumCallback.prototype.load = function () {
        var _this = this;
        $.ajax({
            url: this.buildMainSearchUrl(),
            dataType: "json",
            method: "POST",
            success: function (res) {
                return _this.onMainResult(res["results"]["albummatches"]["album"]);
            }
        });
    };
    SearchAlbumCallback.prototype.onMainResult = function (albums) {
        for(var i = 0; i < albums.length; i++) {
            this.pushMainResult(albums[i]);
        }
        this.removeLoadingScreen("#searchAlbumLoadingContainer");
    };
    SearchAlbumCallback.prototype.pushMainResult = function (albumInfo) {
        var id = guid(albumInfo.mbid, albumInfo.name.trim() + albumInfo.artist.trim());
        var album = new Album(albumInfo.mbid, new AlbumInfo(albumInfo.name, albumInfo.artist), getExtraLargeImage(albumInfo.image));
        var itemTemplate = this.buildItemList(album);
        this.session.rootNode().find("#searchPageAlbumsContainer").append(itemTemplate);
        this.loadAlbumSongs(album, itemTemplate);
    };
    SearchAlbumCallback.prototype.loadAlbumSongs = function (album, itemTemplate) {
        var _this = this;
        $.ajax({
            url: this.buildAlbumSearchUrl(album),
            dataType: "json",
            method: "POST",
            success: function (res) {
                return _this.onAlbumResults(res, itemTemplate);
            }
        });
    };
    SearchAlbumCallback.prototype.onAlbumResults = function (res, itemTemplate) {
        if(res.error == null && res["album"]["tracks"]["track"] != null) {
            var image = getLargeImage(res["album"]["image"]);
            this.addAlbumSongs(res["album"]["tracks"]["track"], image, itemTemplate);
        } else {
            this.addNoArtistSongsTemplate(itemTemplate);
        }
        this.removeSimilarLoader(itemTemplate, "#searchSimilarLoadingContainer");
    };
    SearchAlbumCallback.prototype.addAlbumSongs = function (tracks, image, itemTemplate) {
        for(var i = 0; i < tracks.length; i++) {
            this.addAlbumSong(tracks[i], image, itemTemplate);
        }
    };
    SearchAlbumCallback.prototype.addAlbumSong = function (track, image, itemTemplate) {
        var id = guid(track.mbid, track.name.trim() + track.artist.name.trim());
        var song = new Song(id, new SongInfo(track.name, track.artist.name, null, null), image);
        var songTemplate = buildSmallSong(song);
        songTemplate.addClass("searchSimilarSong");
        this.bindSongMenu(song, songTemplate);
        itemTemplate.find("#searchSongListContainer").append(songTemplate);
    };
    SearchAlbumCallback.prototype.addNoArtistSongsTemplate = function (itemTemplate) {
        var container = $("<div></div>");
        var messageTemplate = template("#searchSongNoSimilarTemplate", "No songs were found for album");
        container.append(messageTemplate);
        itemTemplate.find("#searchSongListContainer").append(container);
    };
    SearchAlbumCallback.prototype.buildAlbumSearchUrl = function (album) {
        if(isMbid(album.mbid)) {
            "&api_key=ccb7bf48e8055843e17952fbeb6bfabd&artist=Cher&album=Believe&format=json";
            return "http://ws.audioscrobbler.com/2.0/?method=album.getinfo&mbid=" + album.mbid + "&api_key=" + lastFmApiKey + "&format=json";
        } else {
            return "http://ws.audioscrobbler.com/2.0/?method=album.getinfo&artist=" + album.info.artist + "&album=" + album.info.name + "&api_key=" + lastFmApiKey + "&format=json";
        }
    };
    SearchAlbumCallback.prototype.buildItemList = function (album) {
        var listContainer = $("<div></div>");
        var listTemplate = template("#searchSongListTemplate");
        var imageTemplate = this.buildLargeImageTemplate(album.imageUrl);
        listContainer.append(listTemplate);
        listContainer.find("#searchSongTitle").text(album.info.artist + "-" + album.info.name);
        listContainer.find("#searchLargeImageContainer").append(imageTemplate);
        return listContainer;
    };
    SearchAlbumCallback.prototype.buildMainSearchUrl = function () {
        return "http://ws.audioscrobbler.com/2.0/?method=album.search&album=" + this.session.query + "&api_key=" + lastFmApiKey + "&format=json&limit=5";
    };
    return SearchAlbumCallback;
})(SearchCallback);
var SearchGenreCallback = (function (_super) {
    __extends(SearchGenreCallback, _super);
    function SearchGenreCallback(session) {
        _super.call(this, session);
        this.session = session;
    }
    SearchGenreCallback.prototype.load = function () {
        var _this = this;
        $.ajax({
            url: this.buildMainSearchUrl(),
            dataType: "json",
            method: "POST",
            success: function (res) {
                return _this.onMainResult(res["results"]["tagmatches"]["tag"]);
            }
        });
    };
    SearchGenreCallback.prototype.onMainResult = function (tags) {
        for(var i = 0; i < tags.length; i++) {
            this.pushMainResult(tags[i]);
        }
        this.removeLoadingScreen("#searchGenreLoadingContainer");
    };
    SearchGenreCallback.prototype.pushMainResult = function (tagInfo) {
        var tag = new Tag(tagInfo.name);
        var itemTemplate = this.buildItemList(tag);
        this.session.rootNode().find("#searchPageGenreContainer").append(itemTemplate);
        this.loadGenreSongs(tag, itemTemplate);
    };
    SearchGenreCallback.prototype.loadGenreSongs = function (tag, itemTemplate) {
        var _this = this;
        $.ajax({
            url: this.buildGenreSearchUrl(tag),
            dataType: "json",
            method: "POST",
            success: function (res) {
                return _this.onGenreResults(res, itemTemplate);
            }
        });
    };
    SearchGenreCallback.prototype.onGenreResults = function (res, itemTemplate) {
        if(res.error == null && res["toptracks"]["track"] != null) {
            this.addGenreSongs(res["toptracks"]["track"], itemTemplate);
        } else {
            this.addNoGenreSongsTemplate(itemTemplate);
        }
        this.removeSimilarLoader(itemTemplate, "#searchGenreSimilarLoadingContainer");
    };
    SearchGenreCallback.prototype.addGenreSongs = function (tracks, itemTemplate) {
        for(var i = 0; i < tracks.length; i++) {
            this.addGenreSong(tracks[i], itemTemplate);
        }
    };
    SearchGenreCallback.prototype.addGenreSong = function (track, itemTemplate) {
        var id = guid(track.mbid, track.name.trim() + track.artist.name.trim());
        var song = new Song(id, new SongInfo(track.name, track.artist.name, null, null), getLargeImage(track.image));
        var songTemplate = buildSmallSong(song);
        songTemplate.addClass("searchSimilarSong");
        this.bindSongMenu(song, songTemplate);
        itemTemplate.find("#searchGenreListContainer").append(songTemplate);
    };
    SearchGenreCallback.prototype.addNoGenreSongsTemplate = function (itemTemplate) {
        var container = $("<div></div>");
        var messageTemplate = template("#searchSongNoSimilarTemplate", "No songs were found for genre");
        container.append(messageTemplate);
        itemTemplate.find("#searchSongListContainer").append(container);
    };
    SearchGenreCallback.prototype.buildGenreSearchUrl = function (tag) {
        return "http://ws.audioscrobbler.com/2.0/?method=tag.gettoptracks&tag=" + tag.name + "&api_key=" + lastFmApiKey + "&format=json&limit=5";
    };
    SearchGenreCallback.prototype.buildItemList = function (tag) {
        var listContainer = $("<div></div>");
        var listTemplate = template("#searchGenreListTemplate");
        listContainer.append(listTemplate);
        listContainer.find("#searchGenreTitle").text(tag.name);
        return listContainer;
    };
    SearchGenreCallback.prototype.buildMainSearchUrl = function () {
        return "http://ws.audioscrobbler.com/2.0/?method=tag.search&tag=" + this.session.query + "&api_key=" + lastFmApiKey + "&format=json&limit=5";
    };
    return SearchGenreCallback;
})(SearchCallback);
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
            case 0: {
                return $(this.session.rootNode()).find("#searchMenuSongs");

            }
            case 1: {
                return $(this.session.rootNode()).find("#searchMenuArtist");

            }
            case 2: {
                return $(this.session.rootNode()).find("#searchMenuAlbums");

            }
            case 3: {
                return $(this.session.rootNode()).find("#searchMenuGenre");

            }
        }
    };
    SearchPageManager.prototype.getPage = function (index) {
        switch(index) {
            case 0: {
                return $(this.session.rootNode()).find("#searchPageSongs");

            }
            case 1: {
                return $(this.session.rootNode()).find("#searchPageArtist");

            }
            case 2: {
                return $(this.session.rootNode()).find("#searchPageAlbums");

            }
            case 3: {
                return $(this.session.rootNode()).find("#searchPageGenre");

            }
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
