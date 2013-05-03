var __extends = this.__extends || function (d, b) {
    function __() {
        this.constructor = d;
    }

    __.prototype = b.prototype;
    d.prototype = new __();
}
var searchManager = null;
var SearchBinder = (function () {
    function SearchBinder() {
    }

    SearchBinder.prototype.buildPage = function (rootNode) {
        searchManager = new SearchManager(rootNode);
        itemList.popItemList("search");
        this.loadData();
        itemList.pushItemList("search");
    };
    SearchBinder.prototype.bind = function () {
        itemList.popItemList("search");
        itemList.show();
        itemList.onInput = function (input) {
            searchManager.performSearch(input);
        };
        $(window).bind("keydown", this.navigationHandler);
    };
    SearchBinder.prototype.navigationHandler = function (event) {
        switch (event.which) {
            case 37:
            {
                searchManager.givePreviousPageFocus();
                event.preventDefault();
                break;

            }
            case 38:
            {
                searchManager.givePreviousSessionFocus();
                event.preventDefault();
                break;

            }
            case 39:
            {
                searchManager.giveNextPageFocus();
                event.preventDefault();
                break;

            }
            case 40:
            {
                searchManager.giveNextSessionFocus();
                event.preventDefault();
                break;

            }
        }
    };
    SearchBinder.prototype.loadData = function () {
        searchManager.performSearch("ColdPlay");
        searchManager.performSearch("Bridgit Mendler");
        searchManager.performSearch("John Mayer");
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
        if (this.currentIndex <= 0) {
            return;
        }
        this.giveSessionFocus(this.searchSessionsQueue[this.currentIndex - 1]);
    };
    SearchManager.prototype.giveNextSessionFocus = function () {
        if (this.currentIndex >= (this.searchSessionsQueue.length - 1)) {
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
            session.rootNode().css({
                WebkitTransform: "perspective(100x) translateZ(" + 20 * (i - _this.currentIndex) + "px)",
                transform: "perspective(100px)  translateZ(" + 20 * (i - _this.currentIndex) + "px)",
                opacity: (i > _this.currentIndex) ? 0 : (i == _this.currentIndex) ? 1 : 0.5
            }).removeClass("hidden");
        });
        window.setTimeout(function () {
            _this.searchSessionsQueue.forEach(function (session, index) {
                if (index > _this.currentIndex) {
                    $(session.rootNode()).addClass("hidden");
                }
            });
        }, 400);
        itemList.switchItem(itemList.findItem(session.id));
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
        var _this = this;
        var htmlTemplate = template("#searchPageTemplate", session.id);
        $("#searchTableContainer").append(htmlTemplate);
        session.rootNode().find("#searchPageDelete").click(function () {
            _this.deleteSession(session);
        });
    };
    SearchManager.prototype.deleteSession = function (session) {
        $(session.rootNode()).fadeOut(400, function () {
            this.remove();
        });
        delete this.searchSessions[session.id];
        this.searchSessionsQueue.splice(this.searchSessionsQueue.indexOf(session), 1);
        if (this.currentIndex > (this.searchSessionsQueue.length - 1)) {
            this.currentIndex = this.searchSessionsQueue.length - 1;
        }
        this.giveSessionFocus(this.searchSessionsQueue[this.currentIndex]);
        itemList.deleteItem(session.id);
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
        var detailCallback = function (selectedOption, selectedSubOption) {
            if (selectedOption == 0) {
                _this.playSong(song);
            } else {
                if (selectedOption == 2) {
                    _this.pushSong(song);
                } else {
                    if (selectedOption == 3) {
                        _this.searchFromSong(song);
                    } else {
                        if (selectedOption == 1) {
                            _this.addSongToPlaylist(song, selectedSubOption);
                        }
                    }
                }
            }
        };
        template.click(function (e) {
            songDetailManager.showDetails([
                {
                    label: "Play Now",
                    subOptions: []
                },
                {
                    label: "Add To Playlist",
                    subOptions: _this.buildPlaylistList()
                },
                {
                    label: "Add to Now Playing",
                    subOptions: []
                },
                {
                    label: "Search From Here",
                    subOptions: []
                }
            ], detailCallback, song, {
                x: e.pageX,
                y: e.pageY
            });
        });
    };
    SearchCallback.prototype.addSongToPlaylist = function (song, playlistIndex) {
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
        });
    };
    SearchCallback.prototype.buildPlaylistList = function () {
        return playlistManager.getPlaylist().map(function (p) {
            return p.title;
        });
    };
    SearchCallback.prototype.searchFromSong = function (song) {
        searchManager.performSearch(song.info.title + " " + song.info.artist);
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
        this.loadPage(1);
    };
    SearchSongCallback.prototype.loadPage = function (page) {
        var _this = this;
        $.ajax({
            url: this.buildMainSearchUrl(page),
            dataType: "json",
            method: "GET",
            success: function (res) {
                return _this.onMainResult(res["results"]["trackmatches"]["track"], page);
            }
        });
    };
    SearchSongCallback.prototype.onMainResult = function (tracks, page) {
        for (var i = 0; i < tracks.length; i++) {
            this.pushMainResult(tracks[i]);
        }
        this.session.rootNode().find("#searchPageSongsContainer").find("#loadMoreHorizontal").remove();
        if (tracks.length == 5) {
            var loadMoreTemplate = this.buildLoadMoreHorizontal(page + 1);
            this.session.rootNode().find("#searchPageSongsContainer").append(loadMoreTemplate);
        }
        this.removeLoadingScreen("#searchPageLoadingContainer");
    };
    SearchSongCallback.prototype.pushMainResult = function (track) {
        var id = guid(track.mbid, track.name.trim() + track.artist.trim());
        var song = new Song(id, new SongInfo(track.name, track.artist, null, null, 0, 0), getExtraLargeImage(track.image));
        var itemTemplate = this.buildItemList(song);
        this.session.rootNode().find("#searchPageSongsContainer").append(itemTemplate);
        this.bindSongMenu(song, itemTemplate.find("#searchLargeImageContainer"));
        this.loadSimilarSongs(song, itemTemplate, true);
    };
    SearchSongCallback.prototype.buildLoadMoreHorizontal = function (page) {
        var container = $("<div></div>");
        container.attr("id", "loadMoreHorizontal").append("See More");
        this.bindLoadMoreHorizontal(container, page);
        return container;
    };
    SearchSongCallback.prototype.bindLoadMoreHorizontal = function (container, page) {
        var _this = this;
        container.click(function () {
            container.text("Loading..");
            _this.loadPage(page);
        });
    };
    SearchSongCallback.prototype.loadSimilarSongs = function (song, itemTemplate, firstLoad) {
        var _this = this;
        $.ajax({
            url: this.buildSimilarSearchUrl(song, firstLoad ? 5 : 30),
            dataType: "json",
            method: "GET",
            success: function (res) {
                return _this.onSimilarResults(res, song, itemTemplate, firstLoad);
            }
        });
    };
    SearchSongCallback.prototype.onSimilarResults = function (res, song, itemTemplate, firstDisplay) {
        if (res.error == null && res["similartracks"] != null && Array.isArray(res["similartracks"]["track"])) {
            this.addSimilarSongs(res["similartracks"]["track"], song, itemTemplate, firstDisplay);
        } else {
            this.addNoSimilarSongsTemplate(itemTemplate);
        }
        this.removeSimilarLoader(itemTemplate, "#searchSimilarLoadingContainer");
    };
    SearchSongCallback.prototype.addSimilarSongs = function (tracks, song, itemTemplate, firstDisplay) {
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
    };
    SearchSongCallback.prototype.buildLoadMoreVertical = function (song, itemTemplate) {
        var container = $("<div></div>");
        container.attr("id", "loadMoreVertical").append("<div class='loadMoreVerticalText'>+</div>");
        this.bindLoadMoreVertical(container, song, itemTemplate);
        return container;
    };
    SearchSongCallback.prototype.bindLoadMoreVertical = function (container, song, itemTemplate) {
        var _this = this;
        container.click(function () {
            _this.loadSimilarSongs(song, itemTemplate, false);
        });
    };
    SearchSongCallback.prototype.addSimilarSong = function (track, itemTemplate) {
        var id = guid(track.mbid, track.name.trim() + track.artist.name.trim());
        var song = new Song(id, new SongInfo(track.name, track.artist.name, null, null, 0, 0), getLargeImage(track.image));
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
    SearchSongCallback.prototype.buildSimilarSearchUrl = function (song, count) {
        if (isMbid(song.mbid)) {
            return "http://ws.audioscrobbler.com/2.0/?method=track.getsimilar&mbid=" + song.mbid + "&api_key=" + lastFmApiKey + "&format=json&limit=" + count;
        } else {
            return "http://ws.audioscrobbler.com/2.0/?method=track.getsimilar&artist=" + song.info.artist + "&track=" + song.info.title + "&api_key=" + lastFmApiKey + "&format=json&limit=" + count;
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
    SearchSongCallback.prototype.buildMainSearchUrl = function (page) {
        return "http://ws.audioscrobbler.com/2.0/?method=track.search&track=" + this.session.query + "&api_key=" + lastFmApiKey + "&format=json&limit=5&page=" + page;
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
        this.loadPage(1);
    };
    SearchArtistCallback.prototype.loadPage = function (page) {
        var _this = this;
        $.ajax({
            url: this.buildMainSearchUrl(page),
            dataType: "json",
            method: "GET",
            success: function (res) {
                return _this.onMainResult(res["results"]["artistmatches"]["artist"], page);
            }
        });
    };
    SearchArtistCallback.prototype.buildLoadMoreHorizontal = function (page) {
        var container = $("<div></div>");
        container.attr("id", "loadMoreHorizontal").append("See More");
        this.bindLoadMoreHorizontal(container, page);
        return container;
    };
    SearchArtistCallback.prototype.bindLoadMoreHorizontal = function (container, page) {
        var _this = this;
        container.click(function () {
            container.text("Loading..");
            _this.loadPage(page);
        });
    };
    SearchArtistCallback.prototype.onMainResult = function (artists, page) {
        for (var i = 0; i < artists.length; i++) {
            this.pushMainResult(artists[i]);
        }
        this.session.rootNode().find("#searchPageArtistContainer").find("#loadMoreHorizontal").remove();
        if (artists.length == 5) {
            var loadMoreTemplate = this.buildLoadMoreHorizontal(page + 1);
            this.session.rootNode().find("#searchPageArtistContainer").append(loadMoreTemplate);
        }
        this.removeLoadingScreen("#searchArtistLoadingContainer");
    };
    SearchArtistCallback.prototype.pushMainResult = function (artist) {
        var id = guid(artist.mbid, artist.name.trim());
        var artistInfo = new Artist(id, new ArtistInfo(artist.name), getExtraLargeImage(artist.image));
        var itemTemplate = this.buildItemList(artistInfo);
        this.session.rootNode().find("#searchPageArtistContainer").append(itemTemplate);
        this.loadArtistSongs(artistInfo, itemTemplate, 1);
    };
    SearchArtistCallback.prototype.loadArtistSongs = function (artist, itemTemplate, page) {
        var _this = this;
        $.ajax({
            url: this.buildArtistSearchUrl(artist, page),
            dataType: "json",
            method: "GET",
            success: function (res) {
                return _this.onArtistResults(res, itemTemplate, artist, page);
            }
        });
    };
    SearchArtistCallback.prototype.onArtistResults = function (res, itemTemplate, artist, page) {
        if (res.error == null && res["toptracks"]["track"] != null) {
            this.addArtistSongs(res["toptracks"]["track"], itemTemplate, artist, page);
        } else {
            this.addNoArtistSongsTemplate(itemTemplate);
        }
        this.removeSimilarLoader(itemTemplate, "#searchSimilarLoadingContainer");
    };
    SearchArtistCallback.prototype.addArtistSongs = function (tracks, itemTemplate, artist, page) {
        for (var i = 0; i < tracks.length; i++) {
            this.addArtistSong(tracks[i], itemTemplate);
        }
        itemTemplate.find("#loadMoreVertical").remove();
        if (tracks.length == 5) {
            var loadMoreTemplate = this.buildLoadMoreVertical(page + 1, artist, itemTemplate);
            itemTemplate.find("#searchSongListContainer").append(loadMoreTemplate);
        }
    };
    SearchArtistCallback.prototype.buildLoadMoreVertical = function (page, artist, itemTemplate) {
        var container = $("<div></div>");
        container.attr("id", "loadMoreVertical").append("<div class='loadMoreVerticalText'>+</div>");
        this.bindLoadMoreVertical(container, page, artist, itemTemplate);
        return container;
    };
    SearchArtistCallback.prototype.bindLoadMoreVertical = function (container, page, artist, itemTemplate) {
        var _this = this;
        container.click(function () {
            _this.loadArtistSongs(artist, itemTemplate, page);
        });
    };
    SearchArtistCallback.prototype.addArtistSong = function (track, itemTemplate) {
        var id = guid(track.mbid, track.name.trim() + track.artist.name.trim());
        var song = new Song(id, new SongInfo(track.name, track.artist.name, null, null, 0, 0), getLargeImage(track.image));
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
    SearchArtistCallback.prototype.buildArtistSearchUrl = function (artist, page) {
        if (isMbid(artist.mbid)) {
            return "http://ws.audioscrobbler.com/2.0/?method=artist.gettoptracks&mbid=" + artist.mbid + "&api_key=" + lastFmApiKey + "&format=json&limit=5&page=" + page;
        } else {
            return "http://ws.audioscrobbler.com/2.0/?method=artist.gettoptracks&artist=" + artist.info.name + "&api_key=" + lastFmApiKey + "&format=json&limit=5&page=" + page;
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
    SearchArtistCallback.prototype.buildMainSearchUrl = function (page) {
        return "http://ws.audioscrobbler.com/2.0/?method=artist.search&artist=" + this.session.query + "&api_key=" + lastFmApiKey + "&format=json&limit=5&page=" + page;
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
        this.loadPage(1);
    };
    SearchAlbumCallback.prototype.loadPage = function (page) {
        var _this = this;
        $.ajax({
            url: this.buildMainSearchUrl(page),
            dataType: "json",
            method: "GET",
            success: function (res) {
                return _this.onMainResult(res["results"]["albummatches"]["album"], page);
            }
        });
    };
    SearchAlbumCallback.prototype.onMainResult = function (albums, page) {
        for (var i = 0; i < albums.length; i++) {
            this.pushMainResult(albums[i]);
        }
        this.session.rootNode().find("#searchPageAlbumsContainer").find("#loadMoreHorizontal").remove();
        if (albums.length == 5) {
            var loadMoreTemplate = this.buildLoadMoreHorizontal(page + 1);
            this.session.rootNode().find("#searchPageAlbumsContainer").append(loadMoreTemplate);
        }
        this.removeLoadingScreen("#searchAlbumLoadingContainer");
    };
    SearchAlbumCallback.prototype.pushMainResult = function (albumInfo) {
        var id = guid(albumInfo.mbid, albumInfo.name.trim() + albumInfo.artist.trim());
        var album = new Album(id, new AlbumInfo(albumInfo.name, albumInfo.artist), getExtraLargeImage(albumInfo.image));
        var itemTemplate = this.buildItemList(album);
        this.session.rootNode().find("#searchPageAlbumsContainer").append(itemTemplate);
        this.loadAlbumSongs(album, itemTemplate);
    };
    SearchAlbumCallback.prototype.buildLoadMoreHorizontal = function (page) {
        var container = $("<div></div>");
        container.attr("id", "loadMoreHorizontal").append("See More");
        this.bindLoadMoreHorizontal(container, page);
        return container;
    };
    SearchAlbumCallback.prototype.bindLoadMoreHorizontal = function (container, page) {
        var _this = this;
        container.click(function () {
            container.text("Loading..");
            _this.loadPage(page);
        });
    };
    SearchAlbumCallback.prototype.loadAlbumSongs = function (album, itemTemplate) {
        var _this = this;
        $.ajax({
            url: this.buildAlbumSearchUrl(album),
            dataType: "json",
            method: "GET",
            success: function (res) {
                return _this.onAlbumResults(res, itemTemplate);
            }
        });
    };
    SearchAlbumCallback.prototype.onAlbumResults = function (res, itemTemplate) {
        if (res.error == null && res["album"]["tracks"]["track"] != null) {
            var image = getLargeImage(res["album"]["image"]);
            this.addAlbumSongs(res["album"]["tracks"]["track"], image, itemTemplate);
        } else {
            this.addNoArtistSongsTemplate(itemTemplate);
        }
        this.removeSimilarLoader(itemTemplate, "#searchSimilarLoadingContainer");
    };
    SearchAlbumCallback.prototype.addAlbumSongs = function (tracks, image, itemTemplate) {
        for (var i = 0; i < tracks.length; i++) {
            this.addAlbumSong(tracks[i], image, itemTemplate);
        }
    };
    SearchAlbumCallback.prototype.addAlbumSong = function (track, image, itemTemplate) {
        var id = guid(track.mbid, track.name.trim() + track.artist.name.trim());
        var song = new Song(id, new SongInfo(track.name, track.artist.name, null, null, 0, 0), image);
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
        if (isMbid(album.mbid)) {
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
    SearchAlbumCallback.prototype.buildMainSearchUrl = function (page) {
        return "http://ws.audioscrobbler.com/2.0/?method=album.search&album=" + this.session.query + "&api_key=" + lastFmApiKey + "&format=json&limit=5&page=" + page;
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
        this.loadPage(1);
    };
    SearchGenreCallback.prototype.loadPage = function (page) {
        var _this = this;
        $.ajax({
            url: this.buildMainSearchUrl(page),
            dataType: "json",
            method: "GET",
            success: function (res) {
                return _this.onMainResult(res["results"]["tagmatches"]["tag"], page);
            }
        });
    };
    SearchGenreCallback.prototype.onMainResult = function (tags, page) {
        for (var i = 0; i < tags.length; i++) {
            this.pushMainResult(tags[i]);
        }
        this.session.rootNode().find("#searchPageGenreContainer").find("#loadMoreHorizontal").remove();
        if (tags.length == 5) {
            var loadMoreTemplate = this.buildLoadMoreHorizontal(page + 1);
            this.session.rootNode().find("#searchPageGenreContainer").append(loadMoreTemplate);
        }
        this.removeLoadingScreen("#searchGenreLoadingContainer");
    };
    SearchGenreCallback.prototype.buildLoadMoreHorizontal = function (page) {
        var container = $("<div></div>");
        container.attr("id", "loadMoreHorizontal").append("See More");
        this.bindLoadMoreHorizontal(container, page);
        return container;
    };
    SearchGenreCallback.prototype.bindLoadMoreHorizontal = function (container, page) {
        var _this = this;
        container.click(function () {
            container.text("Loading..");
            _this.loadPage(page);
        });
    };
    SearchGenreCallback.prototype.pushMainResult = function (tagInfo) {
        var tag = new Tag(tagInfo.name);
        var itemTemplate = this.buildItemList(tag);
        this.session.rootNode().find("#searchPageGenreContainer").append(itemTemplate);
        this.loadGenreSongs(tag, itemTemplate, 1);
    };
    SearchGenreCallback.prototype.loadGenreSongs = function (tag, itemTemplate, page) {
        var _this = this;
        $.ajax({
            url: this.buildGenreSearchUrl(tag, page),
            dataType: "json",
            method: "GET",
            success: function (res) {
                return _this.onGenreResults(res, itemTemplate, page, tag);
            }
        });
    };
    SearchGenreCallback.prototype.onGenreResults = function (res, itemTemplate, page, tag) {
        if (res.error == null && res["toptracks"]["track"] != null) {
            this.addGenreSongs(res["toptracks"]["track"], itemTemplate, page, tag);
        } else {
            this.addNoGenreSongsTemplate(itemTemplate);
        }
        this.removeSimilarLoader(itemTemplate, "#searchGenreSimilarLoadingContainer");
    };
    SearchGenreCallback.prototype.addGenreSongs = function (tracks, itemTemplate, page, tag) {
        for (var i = 0; i < tracks.length; i++) {
            this.addGenreSong(tracks[i], itemTemplate);
        }
        itemTemplate.find("#loadMoreVertical").remove();
        if (tracks.length == 5) {
            var loadMoreTemplate = this.buildLoadMoreVertical(page + 1, tag, itemTemplate);
            itemTemplate.find("#searchGenreListContainer").append(loadMoreTemplate);
        }
    };
    SearchGenreCallback.prototype.buildLoadMoreVertical = function (page, tag, itemTemplate) {
        var container = $("<div></div>");
        container.attr("id", "loadMoreVertical").append("<div class='loadMoreVerticalText'>+</div>");
        this.bindLoadMoreVertical(container, page, tag, itemTemplate);
        return container;
    };
    SearchGenreCallback.prototype.bindLoadMoreVertical = function (container, page, tag, itemTemplate) {
        var _this = this;
        container.click(function () {
            _this.loadGenreSongs(tag, itemTemplate, page);
        });
    };
    SearchGenreCallback.prototype.addGenreSong = function (track, itemTemplate) {
        var id = guid(track.mbid, track.name.trim() + track.artist.name.trim());
        var song = new Song(id, new SongInfo(track.name, track.artist.name, null, null, 0, 0), getLargeImage(track.image));
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
    SearchGenreCallback.prototype.buildGenreSearchUrl = function (tag, page) {
        return "http://ws.audioscrobbler.com/2.0/?method=tag.gettoptracks&tag=" + tag.name + "&api_key=" + lastFmApiKey + "&format=json&limit=5&page=" + page;
    };
    SearchGenreCallback.prototype.buildItemList = function (tag) {
        var listContainer = $("<div></div>");
        var listTemplate = template("#searchGenreListTemplate");
        listContainer.append(listTemplate);
        listContainer.find("#searchGenreTitle").text(tag.name);
        return listContainer;
    };
    SearchGenreCallback.prototype.buildMainSearchUrl = function (page) {
        return "http://ws.audioscrobbler.com/2.0/?method=tag.search&tag=" + this.session.query + "&api_key=" + lastFmApiKey + "&format=json&limit=5&page=" + page;
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
        if (this.pageIndex > 2) {
            return;
        }
        this.switchToPage(this.pageIndex + 1);
    };
    SearchPageManager.prototype.previousPage = function () {
        if (this.pageIndex < 1) {
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
        switch (index) {
            case 0:
            {
                return $(this.session.rootNode()).find("#searchMenuSongs");

            }
            case 1:
            {
                return $(this.session.rootNode()).find("#searchMenuArtist");

            }
            case 2:
            {
                return $(this.session.rootNode()).find("#searchMenuAlbums");

            }
            case 3:
            {
                return $(this.session.rootNode()).find("#searchMenuGenre");

            }
        }
    };
    SearchPageManager.prototype.getPage = function (index) {
        switch (index) {
            case 0:
            {
                return $(this.session.rootNode()).find("#searchPageSongs");

            }
            case 1:
            {
                return $(this.session.rootNode()).find("#searchPageArtist");

            }
            case 2:
            {
                return $(this.session.rootNode()).find("#searchPageAlbums");

            }
            case 3:
            {
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
