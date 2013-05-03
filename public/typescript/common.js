var Dimensions = (function () {
    function Dimensions() {
    }

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
var SongMenu = (function () {
    function SongMenu() {
    }

    SongMenu.prototype.show = function (options, position, callback) {
        var _this = this;
        var container = $("#songMenuContainer");
        container.empty();
        options.forEach(function (option, index) {
            return container.append(_this.buildOption(option, index, callback));
        });
        container.css({
            left: position.x - 40,
            top: position.y - 20
        }).mouseleave(function () {
                $("#songMenuContainer").fadeOut(200);
            }).fadeIn(200);
    };
    SongMenu.prototype.buildOption = function (option, index, callback) {
        var container = $("<div></div>");
        container.append(option).addClass("songMenuItem").click(function () {
            callback(index);
        });
        return container;
    };
    return SongMenu;
})();
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
    SongDetailManager.prototype.showDetails = function (options, detailCallback, song, position) {
        var _this = this;
        this.menuHidden = false;
        $("#songDetailMenuCell").empty();
        options.forEach(function (option, index) {
            _this.buildOption(option, index, detailCallback);
        });
        this.updateLayout(position);
        this.menuX = this.hasSpaceOnRight(position.x) ? position.x : position.x - this.menuWidth;
        this.menuY = this.hasSpaceOnBottom(position.y) ? position.y : position.y - this.menuHeight;
        this.loadBio(song);
    };
    SongDetailManager.prototype.buildOption = function (option, optionIndex, detailCallback) {
        var container = $("<div></div>");
        var optionTemplate = template("#songDetailOptionTemplate", option.label);
        container.append(optionTemplate);
        $("#songDetailMenuCell").append(container);
        if (option.subOptions.length == 0) {
            this.bindOptionClick(optionIndex, null, container, detailCallback);
        } else {
            this.buildSubOptions(option.subOptions, optionIndex, detailCallback, container);
        }
    };
    SongDetailManager.prototype.buildSubOptions = function (subOptions, optionIndex, detailCallback, parentTemplate) {
        var _this = this;
        var listContainer = parentTemplate.find("#songDetailSubOptionsContainer");
        var container = parentTemplate.find("#songDetailSubOptionsList");
        parentTemplate.find("#songDetailMenuItem").click(function () {
            listContainer.slideToggle(400);
        });
        subOptions.forEach(function (sopt, index) {
            var li = $("<li></li>");
            li.append(sopt);
            container.append(li);
            _this.bindOptionClick(optionIndex, index, li, detailCallback);
        });
    };
    SongDetailManager.prototype.bindOptionClick = function (option, subOption, template, detailCallback) {
        var _this = this;
        template.click(function () {
            detailCallback(option, subOption);
            _this.hide();
        });
    };
    SongDetailManager.prototype.updateLayout = function (position) {
        $("#songDetailContainer").css("left", this.hasSpaceOnRight(position.x) ? position.x : (position.x - this.menuWidth)).css("top", this.hasSpaceOnBottom(position.y) ? position.y : (position.y - this.menuHeight)).show(300);
        $("#songDetailMenuCell").css(this.hasSpaceOnBottom(position.y) ? "top" : "bottom", 0).css(this.hasSpaceOnBottom(position.y) ? "bottom" : "top", "auto").css(this.hasSpaceOnRight(position.x) ? "left" : "right", 0).css(this.hasSpaceOnRight(position.x) ? "right" : "left", "auto").css("float", this.hasSpaceOnRight(position.x) ? "left" : "right");
        $("#songDetailBioCell").css("float", this.hasSpaceOnRight(position.x) ? "right" : "left");
    };
    SongDetailManager.prototype.loadBio = function (song) {
        var _this = this;
        $("#songDetailBioCell").empty();
        $.ajax({
            type: "POST",
            dataType: "json",
            url: this.buildArtistUrl(song),
            success: function (data) {
                return _this.onArtistLoad(data, song);
            }
        });
    };
    SongDetailManager.prototype.onArtistLoad = function (data, song) {
        var container = $("<div></div>");
        var detailTemplate = template("#songDetailArtistTemplate", getExtraLargeImage(data["artist"]["image"]), song.info.title, song.info.artist, data["artist"]["bio"]["content"], this.getTourInfo(data));
        container.append(detailTemplate);
        $("#songDetailBioCell").empty().append(container);
    };
    SongDetailManager.prototype.getTourInfo = function (data) {
        if (data["artist"]["ontour"] == "1") {
            return "On tour";
        } else {
            return "Not on tour";
        }
    };
    SongDetailManager.prototype.buildArtistUrl = function (song) {
        return "http://ws.audioscrobbler.com/2.0/?method=artist.getinfo&artist=" + song.info.artist + "&format=json&api_key=" + lastFmApiKey;
    };
    SongDetailManager.prototype.bindHover = function () {
        var _this = this;
        $(window).mousemove(function (event) {
            if (_this.menuHidden) {
                return;
            }
            if (event.clientX < (_this.menuX - 10) || event.clientX > (_this.menuX + _this.menuWidth + 10) || event.clientY < (_this.menuY - 10) || event.clientY > (_this.menuY + _this.menuHeight + 10)) {
                _this.hide();
            }
        });
    };
    SongDetailManager.prototype.hide = function () {
        $("#songDetailContainer").hide(300);
        this.menuHidden = true;
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
    if (song.imageUrl != null) {
        parentDiv.find("#songImage").attr("src", song.imageUrl);
    }
    return parentDiv;
}
function getLargeImage(images) {
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
function getExtraLargeImage(images) {
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
function guid(mbid, seed) {
    if (mbid == null || mbid.length != 36) {
        return md5(seed);
    } else {
        return mbid;
    }
}
function isMbid(mbid) {
    return mbid.length == 36;
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
    function SongInfo(title, artist, album, genre, peek, weeksOnTop) {
        this.title = title;
        this.artist = artist;
        this.album = album;
        this.genre = genre;
        this.peek = peek;
        this.weeksOnTop = weeksOnTop;
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
var Album = (function () {
    function Album(mbid, info, imageUrl) {
        this.mbid = mbid;
        this.info = info;
        this.imageUrl = imageUrl;
    }

    return Album;
})();
var AlbumInfo = (function () {
    function AlbumInfo(name, artist) {
        this.name = name;
        this.artist = artist;
    }

    return AlbumInfo;
})();
var Tag = (function () {
    function Tag(name) {
        this.name = name;
    }

    return Tag;
})();
var dimensions = new Dimensions();
var songDetailManager = new SongDetailManager();
var songMenu = new SongMenu();
//@ sourceMappingURL=common.js.map
