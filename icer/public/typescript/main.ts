declare var $;

interface SectionBinder{
    buildPage(rootNode:any);
    bind();
    unbind();
}

var binders:{ [key: string]: SectionBinder; } = { };

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
    private sectionHeight:number;
    private windowHeight:number;
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
                },
                stop: function (event, ui) {
                    us.changeSection(us.closestMenuItem(ui.position.top))
                }
            });
    }

    public changeSection(index:number) {
        var us = this;

        $("#menuSelector").animate({
            top: index * us.sectionHeight
        });
        $("#menuSelectorBackground").animate({
            top: index * us.sectionHeight
        });
        $("#sectionTable").animate({
            top: -index * us.windowHeight
        });
        binders[this.sections[index].id].bind();
    }

    private closestMenuItem(top:number):number {
        var closestOffset = top / this.sectionHeight;
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
        this.sectionHeight = $("#" + this.sections[0].id + "Menu").height();
        this.windowHeight = $(window).height();

        $("#menuSelector").css("height", this.sectionHeight);
        $("#menuSelectorBackground").css("height", this.sectionHeight);
        $("#sectionContainer").css("height", this.windowHeight);
        $("#sectionTable").css("height", this.windowHeight * this.sections.length);
    }
}

class Section {
    constructor(public menuLabel:string, public id:string, public url:string) {
    }

    rootNode:any;
}
