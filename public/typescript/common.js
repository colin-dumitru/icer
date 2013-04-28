var Dimensions = (function () {
    function Dimensions() { }
    return Dimensions;
})();
function template(id) {
    var args = [];
    for (var _i = 0; _i < (arguments.length - 1); _i++) {
        args[_i] = arguments[_i + 1];
    }
    var html = $(id).html();
    return html.replace(/{(\d+)}/g, function (match, number) {
        return typeof args[number] != 'undefined' ? args[number] : match;
    });
}
var SongDetailManager = (function () {
    function SongDetailManager() {
        this.menuHidden = true;
    }
    SongDetailManager.prototype.bind = function () {
        var songDetailContainer = $("#songDetailContainer");
        this.menuWidth = songDetailContainer.width();
        this.menuHeight = songDetailContainer.height();
        this.bindHover();
    };
    SongDetailManager.prototype.showDetails = function (options, detailCallback, bioUrl, position) {
        this.menuHidden = false;
        $("#songDetailMenuCell").empty();
        options.forEach(function (option) {
            var optionTemplate = template("#songDetailOptionTemplate", option);
            $("#songDetailMenuCell").append(optionTemplate);
        });
        this.updateLayout(position);
        this.menuX = this.hasSpaceOnRight(position.x) ? position.x : position.x - this.menuWidth;
        this.menuY = this.hasSpaceOnBottom(position.y) ? position.y : position.y - this.menuHeight;
        this.loadBio(bioUrl);
    };
    SongDetailManager.prototype.updateLayout = function (position) {
        $("#songDetailContainer").css("left", this.hasSpaceOnRight(position.x) ? position.x : (position.x - this.menuWidth)).css("top", this.hasSpaceOnBottom(position.y) ? position.y : (position.y - this.menuHeight)).show(300);
        $("#songDetailMenuCell").css(this.hasSpaceOnBottom(position.y) ? "top" : "bottom", 0).css(this.hasSpaceOnBottom(position.y) ? "bottom" : "top", "auto").css(this.hasSpaceOnRight(position.x) ? "left" : "right", 0).css(this.hasSpaceOnRight(position.x) ? "right" : "left", "auto").css("float", this.hasSpaceOnRight(position.x) ? "left" : "right");
        $("#songDetailBioCell").css("float", this.hasSpaceOnRight(position.x) ? "right" : "left");
    };
    SongDetailManager.prototype.loadBio = function (url) {
        $("#songDetailBioCell").load(url);
    };
    SongDetailManager.prototype.bindHover = function () {
        var _this = this;
        $(window).mousemove(function (event) {
            if(_this.menuHidden) {
                return;
            }
            if(event.clientX < _this.menuX || event.clientX > (_this.menuX + _this.menuWidth) || event.clientY < _this.menuY || event.clientY > (_this.menuY + _this.menuHeight)) {
                $("#songDetailContainer").hide(300);
                _this.menuHidden = true;
            }
        });
    };
    SongDetailManager.prototype.hasSpaceOnRight = function (x) {
        return x + this.menuWidth < dimensions.windowWidth || x < this.menuWidth;
    };
    SongDetailManager.prototype.hasSpaceOnBottom = function (y) {
        return y + this.menuHeight < dimensions.windowHeight || y < this.menuHeight;
    };
    return SongDetailManager;
})();
function randomSongTitle() {
    var titles = [
        {
            artist: "Bruno Mars",
            title: "When I Was Your Man"
        }, 
        {
            artist: "Imagine Dragons",
            title: "Radioactive"
        }, 
        {
            artist: "Justin Timberlake",
            title: "Suit and tie"
        }, 
        {
            artist: "Jonas Brothers",
            title: "Pom Poms"
        }, 
        {
            artist: " Demi Lovato",
            title: "Heart attack"
        }, 
        {
            artist: "Justin Timberlake",
            title: "Mirrors"
        }, 
        {
            artist: "Fall Out Boy",
            title: "My Songs"
        }, 
        {
            artist: "Darius Rucker",
            title: "Wagon Wheel"
        }, 
        {
            artist: " Drake",
            title: "Started From The Bottom"
        }, 
        {
            artist: " Fun",
            title: "Carry On"
        }, 
        {
            artist: "Blake Shelton",
            title: "Sure Be Cool If You Did"
        }, 
        {
            artist: "Baauer",
            title: "Harlem Shake"
        }, 
        {
            artist: "Taylor Swift",
            title: "22"
        }, 
        {
            artist: "Chris Brown",
            title: "Fine China"
        }, 
        {
            artist: "Maroon 5",
            title: "Daylight"
        }
    ];
    return titles[Math.floor(Math.random() * titles.length)];
}
function buildSmallSong(song) {
    var parentDiv = $("<div></div>");
    var imageTemplate = template("#imageMock", song.info.title, song.info.artist);
    parentDiv.addClass("imageContainer");
    parentDiv.addClass("inline");
    parentDiv.append(imageTemplate);
    if(song.imageUrl != null) {
        parentDiv.find("#songImage").attr("src", song.imageUrl);
    }
    return parentDiv;
}
function loadSongInfo(song) {
}
function getLargeImage(track) {
    if(track.image == null) {
        return "/assets/images/logo.gif";
    }
    for(var i = 0; i < track.image.length; i++) {
        if(track.image[i].size == "medium") {
            return track.image[i]["#text"];
        }
    }
    return "/assets/images/logo.gif";
}
function getExtraLargeImage(track) {
    if(track.image == null) {
        return "/assets/images/logo.gif";
    }
    for(var i = 0; i < track.image.length; i++) {
        if(track.image[i].size == "extralarge") {
            return track.image[i]["#text"];
        }
    }
    return "/assets/images/logo.gif";
}
var Song = (function () {
    function Song(mbid, info, imageUrl) {
        this.mbid = mbid;
        this.info = info;
        this.imageUrl = imageUrl;
    }
    return Song;
})();
var SongInfo = (function () {
    function SongInfo(title, artist, album, genre) {
        this.title = title;
        this.artist = artist;
        this.album = album;
        this.genre = genre;
    }
    return SongInfo;
})();
var Artist = (function () {
    function Artist(mbid, info, imageUrl) {
        this.mbid = mbid;
        this.info = info;
        this.imageUrl = imageUrl;
    }
    return Artist;
})();
var ArtistInfo = (function () {
    function ArtistInfo(name) {
        this.name = name;
    }
    return ArtistInfo;
})();
var dimensions = new Dimensions();
var songDetailManager = new SongDetailManager();
//@ sourceMappingURL=common.js.map
