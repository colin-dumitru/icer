declare var $;

interface SectionBinder{
    buildPage(rootNode:any);
    bind();
    unbind();
}

function run() {
    var sections = [];

    sections.push(buildSearchSection());
    sections.push(buildPlaylistSection());
    sections.push(buildHistorySection());
    sections.push(buildRadioSection());
    sections.push(buildTopSection());

    var sectionManager = new SectionManager(sections);
    sectionManager.build();
    sectionManager.resize();

    $(window).resize(() => {
        sectionManager.resize();
    });

    itemList.bind();
    playManager.bind();
    globalPlaylistManager.bind();
    songDetailManager.bind();

    //todo temp
    globalPlaylistManager.pushSongs([
        new Song("077f4678-2eed-4e3e-bdbd-8476a9201b62", new SongInfo("Believe Me Natalie", "The Killers", "http://userserve-ak.last.fm/serve/300x300/68101062.png")),
        new Song("812349b2-b115-4dc2-b90e-040a1eac3725", new SongInfo("I Believe in a Thing Called Love", "The Darkness", "http://userserve-ak.last.fm/serve/300x300/87434825.png")),
        new Song("077f4678-2eed-4e3e-bdbd-8476a9201b62", new SongInfo("Believe Me Natalie", "The Killers", "http://userserve-ak.last.fm/serve/300x300/68101062.png")),
        new Song("077f4678-2eed-4e3e-bdbd-8476a9201b62", new SongInfo("Believe Me Natalie", "The Killers", "http://userserve-ak.last.fm/serve/300x300/68101062.png")),
        new Song("077f4678-2eed-4e3e-bdbd-8476a9201b62", new SongInfo("Believe Me Natalie", "The Killers", "http://userserve-ak.last.fm/serve/300x300/68101062.png")),
        new Song("077f4678-2eed-4e3e-bdbd-8476a9201b62", new SongInfo("Believe Me Natalie", "The Killers", "http://userserve-ak.last.fm/serve/300x300/68101062.png"))
    ])
}

function buildSearchSection():Section {
    return new Section("Search", "search", "/assets/sections/search.html");
}

function buildPlaylistSection():Section {
    return new Section("Playlist", "playlist", "/assets/sections/playlists.html");
}

function buildHistorySection():Section {
    return new Section("History", "history", "/assets/sections/history.html");
}

function buildRadioSection():Section {
    return new Section("Radio", "radio", "/assets/sections/radio.html");
}

function buildTopSection():Section {
    return new Section("Chart", "charts", "/assets/sections/charts.html");
}

class SectionManager {

    private currentSection:Section;
    private currentSectionIndex:number;

    private menuSelector:any;
    private menuSelectorBackground:any;
    private sectionTable:any;
    private sectionContainer:any;

    constructor(private sections:Section[]) {

    }

    build() {
        this.menuSelector = $("#menuSelector");
        this.menuSelectorBackground = $("#menuSelectorBackground");
        this.sectionTable = $("#sectionTable");
        this.sectionContainer = $("#sectionContainer");

        this.bindMenuSelector();
        this.buildMenu();
        this.buildSectionPages();
    }

    private buildSectionPages() {
        this.sections.forEach((section) => {
            this.buildSectionPage(section);
        });
    }

    private buildSectionPage(section:Section) {
        var td = $(document.createElement("td"));
        section.rootNode = $(document.createElement("tr"));
        section.rootNode.addClass("section");
        section.rootNode.css("id", section.id + "Section");
        section.rootNode.append(td);

        td.load(section.url, () => {
            this.onPageLoadComplete(section);
        });
        td.css("height", Math.round(100 / this.sections.length) + "%");
        this.sectionTable.append(section.rootNode);
    }

    private onPageLoadComplete(section:Section) {
        binders[section.id].buildPage(section.rootNode);
        if (this.sections.indexOf(section) == 0) {
            this.changeSection(0);
        }
    }

    private bindMenuSelector() {
        var us = this;
        this.menuSelector
            .draggable({
                containment: "#menu",
                axis: "y",
                start: function () {
                    binders[us.currentSection.id].unbind();
                },
                drag: function (event, ui) {
                    us.menuSelectorBackground.css({
                        top: ui.position.top
                    });
                    us.sectionTable.css({
                        top: -ui.position.top * us.sections.length
                    });
                },
                stop: function (event, ui) {
                    us.changeSection(us.closestMenuItem(ui.position.top))
                }
            });
    }

    public changeSection(index:number) {
        this.currentSection = this.sections[index];
        this.currentSectionIndex = index;

        this.menuSelector.animate({
            top: index * Dimensions.menuItemHeight
        });
        this.menuSelectorBackground.animate({
            top: index * Dimensions.menuItemHeight
        });
        this.sectionTable.animate({
            top: -index * Dimensions.windowHeight
        });
        binders[this.currentSection.id].bind();
    }

    private closestMenuItem(top:number):number {
        var closestOffset = top / Dimensions.menuItemHeight;
        return Math.round(closestOffset);
    }

    private buildMenu() {
        this.sections.forEach((section) => {
            this.buildMenuSection(section);
        });
    }

    private buildMenuSection(section:Section) {
        var sectionTemplate = template("#menuTemplate", section.id + "Menu", section.menuLabel);
        $("#menuTable").append(sectionTemplate);
        $("#menuTable #" + section.id + "Menu").click(() => {
            binders[this.currentSection.id].unbind();
            this.changeSection(this.sections.indexOf(section));
        });
    }

    resize() {
        var firstSection = $("#" + this.sections[0].id + "Menu");
        Dimensions.menuItemHeight = firstSection.height();
        Dimensions.menuItemWidth = firstSection.width();
        Dimensions.windowHeight = $(window).height();
        Dimensions.windowWidth = $(window).width();

        this.menuSelector.css({
            height: Dimensions.menuItemHeight,
            top: this.currentSectionIndex * Dimensions.windowHeight
        });
        this.menuSelectorBackground.css({
            height: Dimensions.menuItemHeight,
            top: this.currentSectionIndex * Dimensions.menuItemHeight
        });
        this.sectionContainer.css("height", Dimensions.windowHeight);
        this.sectionTable.css({
            height: Dimensions.windowHeight * this.sections.length,
            top: -this.currentSectionIndex * Dimensions.windowHeight
        });
    }
}

class Section {
    constructor(public menuLabel:string, public id:string, public url:string) {
    }

    rootNode:any;
}

class ItemList {
    private isCollapsed:bool = true;
    private isHidden = true;
    private itemList:Item[] = [];
    private selectedItem:Item;

    onInput:(input:String) => any;

    private itemListQueue:{[key:string] : {itemList:Item[]; selectedItem:Item;};} = {};

    pushItemList(key:string) {
        this.itemListQueue[key] = {itemList: this.itemList, selectedItem: this.selectedItem};
        $("#itemListItemContainer").empty();
    }

    popItemList(key:string) {
        var itemData = this.itemListQueue[key];

        if (itemData == null) {
            itemData = {itemList: [], selectedItem: null};
        }

        this.itemList = itemData.itemList;
        this.selectedItem = itemData.selectedItem;

        this.itemList.forEach((item) => {
            $("#itemListItemContainer").append(item.rootNode);
            this.bindItemNode(item);
        });
    }

    bind() {
        $(window).mousemove((event) => {
            if (this.isHidden) {
                return;
            }
            if (event.clientX > (Dimensions.windowWidth - 15)) {
                if (this.isCollapsed) {
                    this.giveFocus();
                }
            }

            if (event.clientX < (Dimensions.windowWidth - 250)) {
                if (!this.isCollapsed) {
                    this.takeFocus();
                }
            }
        });

        var input = $("#newItemInput");
        input.keypress((event) => {
            if (event.which == 13) {
                if (this.onInput == null) return;

                var text = input.val();
                input.val("");
                this.onInput(text);
            }
        });
    }

    show() {
        this.isHidden = false;
        $("#itemListContainerTable").show(400);
    }

    hide() {
        this.isHidden = true;
        $("#itemListContainerTable").hide(400);
    }

    giveFocus() {
        $("#itemListContainer")
            .addClass("itemListContainerExpanded")
            .removeClass("itemListContainerContracted");

        $("#sectionContainer")
            .transition({
                perspective: "100px",
                rotateY: '-5deg',
                transformOrigin: '100% 50%'
            });
        this.isCollapsed = false;
    }

    takeFocus() {
        $("#itemListContainer")
            .removeClass("itemListContainerExpanded")
            .addClass("itemListContainerContracted");
        $("#sectionContainer")
            .transition({
                perspective: "100px",
                rotateY: '0deg',
                transformOrigin: '100% 50%'
            });
        this.isCollapsed = true;
    }

    addItem(item:Item) {
        this.itemList.push(item);
        this.buildItemNode(item);
        this.bindItemNode(item);
    }

    private bindItemNode(item:Item) {
        item.rootNode.click(() => {
            this.switchItem(item);
            if (item.onSelect != null) {
                item.onSelect();
            }
        });
    }

    public switchItem(item:Item) {
        if (this.selectedItem != null) {
            this.selectedItem.rootNode.removeClass("itemListFocused")
        }
        item.rootNode.addClass("itemListFocused");

        this.selectedItem = item;
        this.takeFocus();
    }

    private buildItemNode(item:Item) {
        var li = document.createElement("li");
        item.rootNode = $(li);

        item.rootNode.append(item.title);
        $("#itemListItemContainer").append(li);
    }
}

class Item {
    constructor(public id:String, public title:String) {
    }

    onSelect:() => any;
    rootNode:any;
}

class PlayManager {
    bind() {
        $("#playButton").click(function () {
            $(this).toggleClass("playButtonPaused");
        });
    }
}

class GlobalPlaylistManager {
    private isCollapsed = true;
    private isVolumeVisible = false;

    private playerWidget = null;

    private songQueue:Song[] = [];
    private currentSongIndex = 0;
    private playing = false;

    bind() {
        $(window).mousemove((event) => {
            if (event.clientY > (Dimensions.windowHeight - 15)) {
                if (this.isCollapsed) {
                    this.giveFocus();
                }
            }

            if (event.clientY < (Dimensions.windowHeight - 155)) {
                if (!this.isCollapsed) {
                    this.takeFocus();
                }
                if (this.isVolumeVisible) {
                    $("#volumeSliderContainer").hide();
                    this.isVolumeVisible = false;
                }
            }
        });

        $("#volumeSliderContainer").slider({
            orientation: "vertical",
            range: "min",
            min: 0,
            max: 100,
            value: 60
        });

        $("#volumeButton").mouseenter(() => {
            $("#volumeSliderContainer").show();
            this.isVolumeVisible = true;
        });

        $("#playButton").click(() => {
            this.playToggle();
        });
    }

    private playToggle() {
        if (this.playing) {
            this.pause();
            this.playing = false;
        } else {
            this.play();
            this.playing = true;
        }
    }

    private play() {
        var currentSong = this.getCurrentSong();
        if (currentSong == null) {
            return;
        }
        this.playSong(currentSong);
    }

    private playSong(song:Song) {

    }

    private pause() {

    }

    private getCurrentSong():Song {
        if (this.currentSongIndex < 0 || this.currentSongIndex >= this.songQueue.length) {
            return null;
        }
        return this.songQueue[this.currentSongIndex];
    }

    public pushSongs(songs:Song[]) {
        songs.forEach((song) => {
            this.pushSong(song);
        });
    }

    public pushSong(song:Song) {
        this.songQueue.push(song);
        this.addImageTemplate(song);
    }

    private addImageTemplate(song:Song) {
        var template = buildSmallSong(song);
        $("#globalPlaylistSongContainer").append(template);
        //todo events for click
    }

    public clearSongs() {
        this.songQueue = [];
        this.currentSongIndex = 0;
    }

    giveFocus() {
        $("#globalPlaylistContainer")
            .transition({
                bottom: 120
            });
        $("#globalPlaylistSongContainer")
            .transition({
                perspective: "100px",
                transformOrigin: '50% 0%',
                rotateX: 0
            });
        $("#sectionContainer")
            .transition({
                perspective: "100px",
                rotateX: '5deg',
                y: -150,
                transformOrigin: '50% 100%'
            });
        this.isCollapsed = false;
    }

    takeFocus() {
        $("#globalPlaylistContainer")
            .transition({
                bottom: 0
            });
        $("#globalPlaylistSongContainer")
            .transition({
                perspective: "100px",
                transformOrigin: '50% 0%',
                rotateX: -10
            });
        $("#sectionContainer")
            .transition({
                perspective: "100px",
                rotateX: '0deg',
                y: 0,
                transformOrigin: '50% 100%'
            });
        this.isCollapsed = true;
    }
}

var binders:{ [key: string]: SectionBinder; } = { };
var itemList = new ItemList();
var playManager = new PlayManager();
var globalPlaylistManager = new GlobalPlaylistManager();
