declare var md5:(string) => string;

class Dimensions {
    public menuItemHeight:number;
    public menuItemWidth:number;
    public windowHeight:number;
    public windowWidth:number;
}

function template(id, ...args:String[]):String {
    var html = $(id).html();
    return html.replace(/{(\d+)}/g, function (match, number) {
        return typeof args[number] != 'undefined'
            ? args[number]
            : match
            ;
    });
}

interface DetailCallback {
    (optionIndex:number, subOptionIndex:number): void;
}

class SongDetailManager {
    private menuWidth:number;
    private menuHeight:number;
    private menuHidden = true;
    private menuX:number;
    private menuY:number;

    bind() {
        var songDetailContainer = $("#songDetailContainer");
        this.menuWidth = songDetailContainer.width();
        this.menuHeight = songDetailContainer.height();
        this.bindHover();
    }

    showDetails(options:{label:string; subOptions:string[];}[], detailCallback:DetailCallback, bioUrl, position:{x : number; y:number;}) {
        this.menuHidden = false;

        $("#songDetailMenuCell").empty();
        options.forEach((option, index) => {
            this.buildOption(option, index, detailCallback)
        });

        this.updateLayout(position);

        this.menuX = this.hasSpaceOnRight(position.x) ? position.x : position.x - this.menuWidth;
        this.menuY = this.hasSpaceOnBottom(position.y) ? position.y : position.y - this.menuHeight;

        this.loadBio(bioUrl);
    }

    private buildOption(option:{label:string; subOptions:string[];}, optionIndex:number, detailCallback:DetailCallback) {
        var container = $("<div></div>");
        var optionTemplate = template("#songDetailOptionTemplate", option.label);
        container.append(optionTemplate);

        $("#songDetailMenuCell").append(container);
        if (option.subOptions.length == 0) {
            this.bindOptionClick(optionIndex, null, container, detailCallback);
        } else {
            this.buildSubOptions(option.subOptions, optionIndex, detailCallback, container);
        }
    }

    private buildSubOptions(subOptions:string[], optionIndex:number, detailCallback:DetailCallback, parentTemplate) {
        var listContainer = parentTemplate.find("#songDetailSubOptionsContainer");
        var container = parentTemplate.find("#songDetailSubOptionsList");

        parentTemplate.find("#songDetailMenuItem").click(() => {
            listContainer.slideToggle(400);
        });

        subOptions.forEach((sopt, index) => {
            var li = $("<li></li>");
            li.append(sopt);
            container.append(li);
            this.bindOptionClick(optionIndex, index, li, detailCallback)
        });
    }

    private bindOptionClick(option:number, subOption:number, template, detailCallback:DetailCallback) {
        template.click(() => {
            detailCallback(option, subOption);
            this.hide();
        });
    }

    private updateLayout(position:{x : number; y:number;}) {
        $("#songDetailContainer")
            .css("left", this.hasSpaceOnRight(position.x) ? position.x : (position.x - this.menuWidth))
            .css("top", this.hasSpaceOnBottom(position.y) ? position.y : (position.y - this.menuHeight))
            .show(300);
        $("#songDetailMenuCell")
            .css(this.hasSpaceOnBottom(position.y) ? "top" : "bottom", 0)
            .css(this.hasSpaceOnBottom(position.y) ? "bottom" : "top", "auto")
            .css(this.hasSpaceOnRight(position.x) ? "left" : "right", 0)
            .css(this.hasSpaceOnRight(position.x) ? "right" : "left", "auto")
            .css("float", this.hasSpaceOnRight(position.x) ? "left" : "right");

        $("#songDetailBioCell")
            .css("float", this.hasSpaceOnRight(position.x) ? "right" : "left");
    }

    private loadBio(url:string) {
        $("#songDetailBioCell").load(url);
    }

    private bindHover() {
        $(window).mousemove((event) => {
            if (this.menuHidden) return;

            if (event.clientX < (this.menuX - 10)
                || event.clientX > (this.menuX + this.menuWidth + 10)
                || event.clientY < (this.menuY - 10)
                || event.clientY > (this.menuY + this.menuHeight + 10)) {
                this.hide();
            }
        });
    }

    public hide() {
        $("#songDetailContainer").hide(300);
        this.menuHidden = true;
    }

    private hasSpaceOnRight(x:number):bool {
        return x + this.menuWidth < dimensions.windowWidth
            || x < this.menuWidth;
    }

    private hasSpaceOnBottom(y:number):bool {
        return y + this.menuHeight < dimensions.windowHeight
            || y < this.menuHeight;
    }
}

function randomSongTitle():{artist:string; title:string;} {
    var titles = [
        {artist: "Bruno Mars", title: "When I Was Your Man"},
        {artist: "Imagine Dragons", title: "Radioactive"},
        {artist: "Justin Timberlake", title: "Suit and tie"},
        {artist: "Jonas Brothers", title: "Pom Poms"},
        {artist: " Demi Lovato", title: "Heart attack"},
        {artist: "Justin Timberlake", title: "Mirrors"},
        {artist: "Fall Out Boy", title: "My Songs"},
        {artist: "Darius Rucker", title: "Wagon Wheel"},
        {artist: " Drake", title: "Started From The Bottom"},
        {artist: " Fun", title: "Carry On"},
        {artist: "Blake Shelton", title: "Sure Be Cool If You Did"},
        {artist: "Baauer", title: "Harlem Shake"},
        {artist: "Taylor Swift", title: "22"},
        {artist: "Chris Brown", title: "Fine China"},
        {artist: "Maroon 5", title: "Daylight"}
    ];
    return titles[Math.floor(Math.random() * titles.length)];
}

function buildSmallSong(song:Song) {
    var parentDiv = $("<div></div>");
    var imageTemplate = template("#imageMock", song.info.title, song.info.artist);
    parentDiv.addClass("imageContainer");
    parentDiv.addClass("inline");
    parentDiv.append(imageTemplate);

    if (song.imageUrl != null) {
        parentDiv.find("#songImage").attr("src", song.imageUrl);
    }
    return parentDiv;
}

function getLargeImage(images:any[]):string {
    if (images == null) {
        return "/assets/images/logo.gif";
    }
    for (var i = 0; i < images.length; i++) {
        if (images[i].size == "medium") {
            return images[i]["#text"];
        }
    }
    return "/assets/images/logo.gif";
}

function getExtraLargeImage(images:any[]):string {
    if (images == null) {
        return "/assets/images/logo.gif";
    }
    for (var i = 0; i < images.length; i++) {
        if (images[i].size == "extralarge") {
            return images[i]["#text"];
        }
    }
    return "/assets/images/logo.gif";
}

function guid(mbid:string, seed:string):string {
    if (mbid == null || mbid.length != 36) {
        return md5(seed);
    } else {
        return mbid;
    }
}

function isMbid(mbid:string) {
    return mbid.length == 36;
}

class Song {
    constructor(public mbid:string, public info:SongInfo, public imageUrl:string) {
    }
}

class SongInfo {
    constructor(public title:string, public artist:string, public album:string, public genre:string, public peek:number, public weeksOnTop:number) {
    }
}

class Artist {
    constructor(public mbid:string, public info:ArtistInfo, public imageUrl:string) {
    }
}

class ArtistInfo {
    constructor(public name:string) {
    }
}

class Album {
    constructor(public mbid:string, public info:AlbumInfo, public imageUrl:string) {
    }
}

class AlbumInfo {
    constructor(public name:string, public artist:string) {
    }
}

class Tag {
    constructor(public name:string) {
    }
}

var dimensions = new Dimensions();
var songDetailManager:SongDetailManager = new SongDetailManager();