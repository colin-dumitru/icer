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

class SectionManager {

    private currentSection:Section;

    constructor(private sections:Section[]) {

    }

    build() {
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
        $("#sectionTable").append(section.rootNode);
    }

    private onPageLoadComplete(section:Section) {
        binders[section.id].buildPage(section.rootNode);
        if (this.sections.indexOf(section) == 0) {
            this.changeSection(0);
        }
    }

    private bindMenuSelector() {
        var us = this;

        $("#menuSelector")
            .draggable({
                containment: "#menu",
                axis: "y",
                start: function () {
                    binders[us.currentSection.id].unbind();
                },
                drag: function (event, ui) {
                    $("#menuSelectorBackground").css({
                        top: ui.position.top
                    })
                    $("#sectionTable").css({
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
        $("#menuSelector").animate({
            top: index * Dimensions.menuItemHeight
        });
        $("#menuSelectorBackground").animate({
            top: index * Dimensions.menuItemHeight
        });
        $("#sectionTable").animate({
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
        Dimensions.menuItemHeight = $("#" + this.sections[0].id + "Menu").height();
        Dimensions.menuItemWidth = $("#" + this.sections[0].id + "Menu").width();
        Dimensions.windowHeight = $(window).height();
        Dimensions.windowWidth = $(window).width();

        $("#menuSelector").css("height", Dimensions.menuItemHeight);
        $("#menuSelectorBackground").css("height", Dimensions.menuItemHeight);
        $("#sectionContainer").css("height", Dimensions.windowHeight);
        $("#sectionTable").css("height", Dimensions.windowHeight * this.sections.length);
    }
}

class Section {
    constructor(public menuLabel:string, public id:string, public url:string) {
    }

    rootNode:any;
}

class ItemList {
    private isCollapsed:bool = true;
    private itemList:Item[] = [];
    private selectedItem:Item;

    onInput:(input:String) => any;

    bind() {
        $(window).mousemove((event) => {
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
        $("#itemListContainerTable").show(400);
    }

    hide() {
        $("#itemListContainerTable").hide(400);
    }

    giveFocus() {
        $("#itemListContainer")
            .transition({
                width: 250,
                perspective: "100px",
                rotateY: '0deg',
                transformOrigin: '0% 50%'
            });
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
            .transition({
                width: 0,
                perspective: "100px",
                rotateY: '10deg',
                transformOrigin: '0% 50%'
            });
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

        //todo temp
        var imageTemplate = template("#imageMock");
        for (var i = 0; i < 25; i++) {
            $("#globalPlaylistSongContainer").append(imageTemplate);
        }
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
