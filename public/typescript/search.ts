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
    }
}

class SearchManager {
    constructor(private rootNode) {
    }

    private searchSessions:{ [key: string]: SearchSession; } = { };
    private searchSessionsQueue:SearchSession[] = [];
    private currentIndex:number;

    performSearch(query:string) {
        var sessionId = "search" + Math.floor(Math.random() * 100000);
        var session = new SearchSession(sessionId, query);

        this.buildSession(session);
        this.buildSessionItem(session);
        this.pushSession(session);
    }

    private pushSession(session:SearchSession) {
        this.searchSessionsQueue.push(session);

        this.giveSessionFocus(session);
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

        //todo temp
        var title = randomSongTitle();
        var image = template("#imageMock", title.title, title.artist);
        var imageLarge = template("#imageLargeMock");

        for (var i = 0; i < 5; i++) {
            session.rootNode().find("#searchPageSongsContainer").append(this.buildMockSongList(image, imageLarge));
            session.rootNode().find("#searchPageArtistContainer").append(this.buildMockSongList(image, imageLarge));
            session.rootNode().find("#searchPageAlbumsContainer").append(this.buildMockSongList(image, imageLarge));
            session.rootNode().find("#searchPageGenreContainer").append(this.buildMockSongList(image, imageLarge));
        }
    }

    private buildMockSongList(imageTemplate, largeImageTemplate) {
        var container = $("<div></div>");
        var listTemplate = this.buildMockImage(template("#searchSongListTemplate"));
        var songTitle = randomSongTitle();

        container.append(listTemplate);
        container.find("#searchLargeImageContainer").append(largeImageTemplate);
        container.find("#searchSongTitle").text(songTitle.title + " - " + songTitle.artist);
        var songListContainer = container.find("#searchSongListContainer");

        for (var i = 0; i < 7; i++) {
            songListContainer.append(this.buildMockImage(imageTemplate));
        }

        return container;
    }

    private buildMockImage(template) {
        var imageContainer = $("<div></div>");

        imageContainer.append(template);
        imageContainer.addClass("inline");
        imageContainer.click((e) => {
            songDetailManager.showDetails(["Play Now", "Search From Here", "Add To Playlist"],
                (selectedItem) => {
                }, "/assets/mock/bio.html", {x: e.pageX, y: e.pageY});
        });

        return imageContainer;
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

    constructor(public id:string, public title:string) {
    }

    rootNode():any {
        return $("#" + this.id);
    }
}