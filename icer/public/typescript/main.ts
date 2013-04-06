declare var $;

interface SectionBinder{
    buildPage(rootNode:any);
    bind();
    unbind();
}

class Dimensions {
    static menuItemHeight:number;
    static menuItemWidth:number;
    static windowHeight:number;
    static windowWidth:number;
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

    private previousSection:Section;

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
        $("#menuSelector").animate({
            top: index * Dimensions.menuItemHeight
        });
        $("#menuSelectorBackground").animate({
            top: index * Dimensions.menuItemHeight
        });
        $("#sectionTable").animate({
            top: -index * Dimensions.windowHeight
        });
        binders[this.sections[index].id].bind();
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

    bind() {
        $(window).mousemove((event) => {
            if (event.clientX > (Dimensions.windowWidth - 5)) {
                if (this.isCollapsed) {
                    this.giveFocus();
                }
            }

            if (event.clientX < (Dimensions.windowWidth - 250)) {
                if (!this.isCollapsed) {
                    this.takeFocus();
                }
            }
        })
    }

    show() {

    }

    hide() {

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
}

var binders:{ [key: string]: SectionBinder; } = { };
var itemList = new ItemList();
