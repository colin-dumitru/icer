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

    showDetails(options:string[], detailCallback:(string) => any, bioUrl, position:{x : number; y:number;}) {
        this.menuHidden = false;

        $("#songDetailMenuCell").empty();
        options.forEach((option) => {
            var optionTemplate = template("#songDetailOptionTemplate", option);
            $("#songDetailMenuCell").append(optionTemplate);
        });

        this.updateLayout(position);

        this.menuX = this.hasSpaceOnRight(position.x) ? position.x : position.x - this.menuWidth;
        this.menuY = this.hasSpaceOnBottom(position.y) ? position.y : position.y - this.menuHeight;

        this.loadBio(bioUrl);
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

            if (event.clientX < this.menuX
                || event.clientX > (this.menuX + this.menuWidth)
                || event.clientY < this.menuY
                || event.clientY > (this.menuY + this.menuHeight)) {
                $("#songDetailContainer").hide(300);
                this.menuHidden = true;
            }
        });
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

function loadSongInfo(song:Song) {
    //todo
}

function getLargeImage(track:any):string {
    if (track.image == null) {
        return "/assets/images/logo.gif";
    }
    for (var i = 0; i < track.image.length; i++) {
        if (track.image[i].size == "medium") {
            return track.image[i]["#text"];
        }
    }
    return "/assets/images/logo.gif";
}

function getExtraLargeImage(track:any):string {
    if (track.image == null) {
        return "/assets/images/logo.gif";
    }
    for (var i = 0; i < track.image.length; i++) {
        if (track.image[i].size == "extralarge") {
            return track.image[i]["#text"];
        }
    }
    return "/assets/images/logo.gif";
}

class Song {
    constructor(public mbid:string, public info:SongInfo, public imageUrl:string) {
    }
}

class SongInfo {
    constructor(public title:string, public artist:string, public album:string, public genre:string) {
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

var dimensions = new Dimensions();
var songDetailManager:SongDetailManager = new SongDetailManager();