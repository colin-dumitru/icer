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
    }
    SearchManager.prototype.performSearch = function (query) {
        var sessionId = "search" + Math.floor(Math.random() * 100000);
        var session = new SearchSession(sessionId, query);
        this.buildSession(session);
        this.buildSessionItem(session);
        this.pushSession(session);
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
        var title = randomSongTitle();
        var image = template("#imageMock", title.title, title.artist);
        var imageLarge = template("#imageLargeMock");
        for(var i = 0; i < 5; i++) {
            session.rootNode().find("#searchPageSongsContainer").append(this.buildMockSongList(image, imageLarge));
            session.rootNode().find("#searchPageArtistContainer").append(this.buildMockSongList(image, imageLarge));
            session.rootNode().find("#searchPageAlbumsContainer").append(this.buildMockSongList(image, imageLarge));
            session.rootNode().find("#searchPageGenreContainer").append(this.buildMockSongList(image, imageLarge));
        }
    };
    SearchManager.prototype.buildMockSongList = function (imageTemplate, largeImageTemplate) {
        var container = $("<div></div>");
        var listTemplate = this.buildMockImage(template("#searchSongListTemplate"));
        var songTitle = randomSongTitle();
        container.append(listTemplate);
        container.find("#searchLargeImageContainer").append(largeImageTemplate);
        container.find("#searchSongTitle").text(songTitle.title + " - " + songTitle.artist);
        var songListContainer = container.find("#searchSongListContainer");
        for(var i = 0; i < 7; i++) {
            songListContainer.append(this.buildMockImage(imageTemplate));
        }
        return container;
    };
    SearchManager.prototype.buildMockImage = function (template) {
        var imageContainer = $("<div></div>");
        imageContainer.append(template);
        imageContainer.addClass("inline");
        imageContainer.click(function (e) {
            songDetailManager.showDetails([
                "Play Now", 
                "Search From Here", 
                "Add To Playlist"
            ], function (selectedItem) {
            }, "/assets/mock/bio.html", {
                x: e.pageX,
                y: e.pageY
            });
        });
        return imageContainer;
    };
    return SearchManager;
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
    function SearchSession(id, title) {
        this.id = id;
        this.title = title;
    }
    SearchSession.prototype.rootNode = function () {
        return $("#" + this.id);
    };
    return SearchSession;
})();
//@ sourceMappingURL=search.js.map
