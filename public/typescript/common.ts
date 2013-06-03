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
    (optionIndex:number, subOptionIndex:number, subOptionText:string): void;
}

class SongMenu {
    show(options:string[], position:{x:number;y:number;}, callback:(number) => void) {
        var container = $("#songMenuContainer");

        container.empty();
        options.forEach((option, index) => container.append(this.buildOption(option, index, callback)));

        container
            .css({
                left: position.x - 40,
                top: position.y - 20
            })
            .mouseleave(function () {
                $("#songMenuContainer").fadeOut(200);
            })
            .fadeIn(200);
    }

    private buildOption(option:string, index:number, callback:(number) => void) {
        var container = $("<div></div>");

        container
            .append(option)
            .addClass("songMenuItem")
            .click(() => {
                callback(index);
            });

        return container;
    }

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

    showDetails(options:{label:string; subOptions:string[];}[], detailCallback:DetailCallback, song:Song, position:{x : number; y:number;}) {
        this.menuHidden = false;

        $("#songDetailMenuCell").empty();
        options.forEach((option, index) => {
            this.buildOption(option, index, detailCallback)
        });

        this.updateLayout(position);

        this.menuX = this.hasSpaceOnRight(position.x) ? position.x : position.x - this.menuWidth;
        this.menuY = this.hasSpaceOnBottom(position.y) ? position.y : position.y - this.menuHeight;

        this.loadBio(song);
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
        var _this = this;

        parentTemplate.find("#songDetailMenuItem").click(() => {
            listContainer.slideToggle(400);
        });

        listContainer.find("#songDetailPlaylistInput").keypress(function (event) {
            if (event.which == 13) {
                var text = this.value;
                this.value = "";
                detailCallback(optionIndex, null, text);
                _this.hide();
            }
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
            detailCallback(option, subOption, null);
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

    private loadBio(song:Song) {
        $("#songDetailBioCell").empty();

        $.ajax({
            type: "POST",
            dataType: "json",
            url: this.buildArtistUrl(song),
            success: (data) => this.onArtistLoad(data, song)
        })
    }

    private onArtistLoad(data, song:Song) {
        var container = $("<div></div>");
        var detailTemplate = template("#songDetailArtistTemplate", getExtraLargeImage(data["artist"]["image"]),
            song.info.title, song.info.artist, data["artist"]["bio"]["content"], this.getTourInfo(data));

        container.append(detailTemplate);

        $("#songDetailBioCell").empty().append(container);
    }

    private getTourInfo(data):string {
        if (data["artist"]["ontour"] == "1") {
            return "On tour";
        } else {
            return "Not on tour";
        }
    }

    private buildArtistUrl(song:Song):string {
        return "http://ws.audioscrobbler.com/2.0/?method=artist.getinfo&artist=" + song.info.artist
            + "&format=json&api_key=" + lastFmApiKey;

    }

    private bindHover() {

        $(window).mousemove((event) => {
            if (disableUserAction) return;
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

function isMobile() {
    if (navigator.userAgent.match(/Android/i)
        || navigator.userAgent.match(/webOS/i)
        || navigator.userAgent.match(/iPhone/i)
        || navigator.userAgent.match(/iPad/i)
        || navigator.userAgent.match(/iPod/i)
        || navigator.userAgent.match(/BlackBerry/i)
        || navigator.userAgent.match(/Windows Phone/i)
        ) {
        return true;
    }
    else {
        return false;
    }
}

function createCookie(name, value, days) {
    var expires = "";

    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date["toGMTString()"];
    }
    document.cookie = name + "=" + value + expires + "; path=/";
}

function readCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

function eraseCookie(name) {
    createCookie(name, "", -1);
}

class Song {
    constructor(public mbid:string, public info:SongInfo, public imageUrl:string) {
    }
}

class SongInfo {
    constructor(public title:string, public artist:string, public album:string, public genre:string, public peek:number, public weeksOnTop:number, public positionChange:number) {
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
var songMenu:SongMenu = new SongMenu();