var SearchBinder = (function () {
    function SearchBinder() {
    }

    SearchBinder.prototype.buildPage = function (rootNode) {
        this.manager = new SearchManager(rootNode);
        this.manager.performSearch("Test");
    };
    SearchBinder.prototype.bind = function () {
        var _this = this;
        itemList.show();
        itemList.onInput = function (input) {
            _this.manager.performSearch(input);
        };
    };
    SearchBinder.prototype.unbind = function () {
        itemList.hide();
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
        var sessionId = "search" + Math.floor(Math.random() * 1000);
        var session = new SearchSession(sessionId, query);
        this.buildSession(session);
        this.buildSessionItem(session);
        this.pushSession(session);
    };
    SearchManager.prototype.pushSession = function (session) {
        this.searchSessionsQueue.push(session);
        this.giveSessionFocus(session);
    };
    SearchManager.prototype.giveSessionFocus = function (session) {
        var _this = this;
        this.currentIndex = this.searchSessionsQueue.indexOf(session);
        this.searchSessionsQueue.forEach(function (session, i) {
            session.rootNode().transition({
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
                if (index > _this.currentIndex) {
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
        var image = template("#imageMock");
        for (var i = 0; i < 30; i++) {
            session.rootNode().find("#searchPageSongsContainer").append(image);
            session.rootNode().find("#searchPageArtistContainer").append(image);
            session.rootNode().find("#searchPageAlbumsContainer").append(image);
            session.rootNode().find("#searchPageGenreContainer").append(image);
        }
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
