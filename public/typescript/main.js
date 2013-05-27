var disableUserAction = false;
var use3DAcceleration = true;
function run() {
    var sections = [];
    sections.push(buildSearchSection());
    sections.push(buildPlaylistSection());
    sections.push(buildRadioSection());
    sections.push(buildHistorySection());
    sections.push(buildTopSection());
    sectionManager = new SectionManager(sections);
    sectionManager.build();
    sectionManager.resize();
    $(window).resize(function () {
        sectionManager.resize();
    });
    itemList.bind();
    playManager.bind();
    globalPlaylistManager.bind();
    songDetailManager.bind();
    globalPlaylistManager.pushSongs([
        new Song("077f4678-2eed-4e3e-bdbd-8476a9201b62", new SongInfo("Believe Me Natalie", "The Killers", null, null, 0, 0, 0), "http://userserve-ak.last.fm/serve/300x300/68101062.png"),
        new Song("812349b2-b115-4dc2-b90e-040a1eac3725", new SongInfo("I Believe in a Thing Called Love", "The Darkness", null, null, 0, 0, 0), "http://userserve-ak.last.fm/serve/300x300/87434825.png"),
        new Song("13194c93-89c6-4ab4-aaf2-15db5d73b74e", new SongInfo("Believe", "Cher", null, null, 0, 0, 0), "http://userserve-ak.last.fm/serve/300x300/71997588.png"),
        new Song("5750327d-09ba-43e5-bd75-a08ba29e22f5", new SongInfo("We Believe", "Red Hot Chili Peppers", null, null, 0, 0, 0), "http://userserve-ak.last.fm/serve/300x300/66662762.png"),
        new Song("0196b4cc-66ec-4ad4-acad-2fe852a4ccd5", new SongInfo("I'm a Believer", "The Monkees", null, null, 0, 0, 0), "http://userserve-ak.last.fm/serve/300x300/77468760.png"),
        new Song("076ed98f-f3e9-44c8-b9b7-66624de9b9f0", new SongInfo("Believe", "The Bravery", null, null, 0, 0, 0), "http://userserve-ak.last.fm/serve/300x300/9723711.jpg")
    ]);
    checkForTutorial();
}
function checkForTutorial() {
    if (readCookie("tutorial") == null) {
        showTutorial();
        disableTutorial();
    } else {
        $("#tutorialContainer").remove();
    }
}
function disableTutorial() {
    createCookie("tutorial", "true", 365);
}
function showTutorial() {
    $("#tutorialContainer").load("/assets/sections/tutorial.html", function () {
        var tutorial = new Tutorial();
        tutorial.start();
    });
}
function buildSearchSection() {
    return new Section("Search", "search", "/assets/sections/search.html");
}
function buildPlaylistSection() {
    return new Section("Playlist", "playlist", "/assets/sections/playlists.html");
}
function buildHistorySection() {
    return new Section("History", "history", "/assets/sections/history.html");
}
function buildRadioSection() {
    return new Section("Radio", "radio", "/assets/sections/radio.html");
}
function buildTopSection() {
    return new Section("Chart", "charts", "/assets/sections/charts.html");
}
var SectionManager = (function () {
    function SectionManager(sections) {
        this.sections = sections;
        this.pagesBuild = 0;
        this.firstSection = null;
    }

    SectionManager.prototype.build = function () {
        this.menuSelector = $("#menuSelector");
        this.sectionTable = $("#sectionTable");
        this.sectionContainer = $("#sectionContainer");
        this.bindMenuSelector();
        this.buildMenu();
        this.buildSectionPages();
    };
    SectionManager.prototype.buildSectionPages = function () {
        var _this = this;
        this.sections.forEach(function (section) {
            _this.buildSectionPage(section);
        });
    };
    SectionManager.prototype.buildSectionPage = function (section) {
        var _this = this;
        var td = $("<td></td>");
        section.rootNode = $("<tr></tr>");
        section.rootNode.addClass("section");
        section.rootNode.css("id", section.id + "Section");
        section.rootNode.append(td);
        td.load(section.url, function () {
            _this.onPageLoadComplete(section);
        });
        td.css("height", Math.round(100 / this.sections.length) + "%");
        this.sectionTable.append(section.rootNode);
    };
    SectionManager.prototype.onPageLoadComplete = function (section) {
        binders[section.id].buildPage(section.rootNode);
        this.pagesBuild++;
        if (this.pagesBuild == this.sections.length) {
            this.initialize();
        }
    };
    SectionManager.prototype.initialize = function () {
        this.changeSection(0);
        $("#mainLoader").fadeOut(500, function () {
            this.remove();
        });
    };
    SectionManager.prototype.bindMenuSelector = function () {
        var _this = this;
        this.menuSelector.draggable({
            containment: "#menu",
            axis: "y",
            start: function () {
                binders[_this.currentSection.id].unbind();
                _this.sectionTable.css({
                    WebkitTransition: "",
                    transition: ""
                });
                _this.menuSelector.css({
                    WebkitTransition: "",
                    transition: ""
                });
            },
            drag: function (event, ui) {
                _this.sectionTable.css({
                    WebkitTransform: "translate3d(0, " + -ui.position.top * _this.sections.length + "px, 0)",
                    transform: "translate3d(0, " + -ui.position.top * _this.sections.length + "px, 0)"
                });
            },
            stop: function (event, ui) {
                _this.sectionTable.css({
                    WebkitTransition: "-webkit-transform 0.4s ease",
                    transition: "transform 0.4s ease"
                });
                _this.menuSelector.css({
                    WebkitTransition: "top 0.4s ease",
                    transition: "top 0.4s ease"
                });
                _this.changeSection(_this.closestMenuItem(ui.position.top));
            }
        });
    };
    SectionManager.prototype.changeSection = function (index) {
        this.currentSection = this.sections[index];
        this.currentSectionIndex = index;
        this.menuSelector.css({
            top: index * dimensions.menuItemHeight
        });
        this.sectionTable.css({
            WebkitTransform: "translate3d(0, " + -index * dimensions.windowHeight + "px, 0)",
            transform: "translate3d(0, " + -index * dimensions.windowHeight + "px, 0)"
        });
        binders[this.currentSection.id].bind();
    };
    SectionManager.prototype.closestMenuItem = function (top) {
        var closestOffset = top / dimensions.menuItemHeight;
        return Math.round(closestOffset);
    };
    SectionManager.prototype.buildMenu = function () {
        var _this = this;
        this.sections.forEach(function (section) {
            _this.buildMenuSection(section);
        });
    };
    SectionManager.prototype.buildMenuSection = function (section) {
        var _this = this;
        var sectionTemplate = template("#menuTemplate", section.id + "Menu", section.menuLabel);
        $("#menuTable").append(sectionTemplate);
        $("#menuTable #" + section.id + "Menu").click(function () {
            binders[_this.currentSection.id].unbind();
            _this.sectionTable.css({
                WebkitTransition: "-webkit-transform 0.4s ease",
                transition: "transform 0.4s ease"
            });
            _this.menuSelector.css({
                WebkitTransition: "top 0.4s ease",
                transition: "top 0.4s ease"
            });
            _this.changeSection(_this.sections.indexOf(section));
        });
        if (this.firstSection == null) {
            this.firstSection = $("#" + this.sections[0].id + "Menu");
        }
    };
    SectionManager.prototype.resize = function () {
        dimensions.windowHeight = $(window).height();
        dimensions.windowWidth = $(window).width();
        dimensions.menuItemHeight = Math.floor(dimensions.windowHeight / this.sections.length);
        dimensions.menuItemWidth = this.firstSection.width();
        this.menuSelector.css({
            height: dimensions.menuItemHeight,
            top: this.currentSectionIndex * dimensions.menuItemHeight
        });
        this.sectionContainer.css({
            height: dimensions.windowHeight
        });
        this.sectionTable.css({
            height: dimensions.windowHeight * this.sections.length,
            WebkitTransform: "translate3d(0, " + -this.currentSectionIndex * dimensions.windowHeight + "px, 0)",
            transform: "translate3d(0, " + -this.currentSectionIndex * dimensions.windowHeight + "px, 0)"
        });
    };
    return SectionManager;
})();
var Section = (function () {
    function Section(menuLabel, id, url) {
        this.menuLabel = menuLabel;
        this.id = id;
        this.url = url;
    }

    return Section;
})();
var ItemList = (function () {
    function ItemList() {
        this.isCollapsed = true;
        this.isHidden = true;
        this.itemList = [];
        this.itemMap = {
        };
        this.itemListQueue = {
        };
        this.itemListItemContainer = null;
        this.itemListContainerTable = null;
        this.itemListContainer = null;
        this.itemListCell = null;
        this.sectionContainer = null;
        this.itemListDivider = null;
    }

    ItemList.prototype.pushItemList = function (key) {
        this.itemListQueue[key] = {
            itemList: this.itemList,
            selectedItem: this.selectedItem
        };
        this.itemListItemContainer.empty();
    };
    ItemList.prototype.popItemList = function (key) {
        var _this = this;
        var itemData = this.itemListQueue[key];
        if (itemData == null) {
            itemData = {
                itemList: [],
                selectedItem: null
            };
        }
        this.itemList = itemData.itemList;
        this.itemMap = {
        };
        this.selectedItem = itemData.selectedItem;
        this.itemList.forEach(function (item) {
            _this.itemMap[item.id] = item;
            _this.itemListItemContainer.append(item.rootNode);
            _this.bindItemNode(item);
        });
    };
    ItemList.prototype.bind = function () {
        var _this = this;
        $(window).mousemove(function (event) {
            if (disableUserAction || _this.isHidden) {
                return;
            }
            if (_this.isCollapsed && event.clientX > (dimensions.windowWidth - 15)) {
                _this.giveFocus();
            }
            if (!_this.isCollapsed && event.clientX < (dimensions.windowWidth - 250)) {
                _this.takeFocus();
            }
        });
        var input = $("#newItemInput");
        input.keypress(function (event) {
            if (event.which == 13) {
                if (_this.onInput == null) {
                    return;
                }
                var text = input.val();
                input.val("");
                _this.onInput(text);
            }
        });
        this.itemListItemContainer = $("#itemListItemContainer");
        this.itemListContainerTable = $("#itemListContainerTable");
        this.itemListContainer = $("#itemListContainer");
        this.sectionContainer = $("#sectionContainer");
        this.itemListCell = $("#itemListCell");
        this.itemListDivider = $("#itemListDivider");
    };
    ItemList.prototype.show = function () {
        this.isHidden = false;
        this.itemListDivider.fadeIn(400);
    };
    ItemList.prototype.hide = function () {
        this.isHidden = true;
        this.itemListDivider.fadeOut(400);
    };
    ItemList.prototype.giveFocus = function () {
        this.itemListCell.addClass("itemListCellExpanded");
        this.itemListContainer.addClass("itemListContainerExpanded");
        this.sectionContainer.css("-webkit-transform-origin", "100% 50%").css("transform-origin", "100% 50%").addClass("sectionContainerContracted");
        this.isCollapsed = false;
    };
    ItemList.prototype.takeFocus = function () {
        this.itemListCell.removeClass("itemListCellExpanded");
        this.itemListContainer.removeClass("itemListContainerExpanded");
        this.sectionContainer.removeClass("sectionContainerContracted");
        this.isCollapsed = true;
    };
    ItemList.prototype.addItem = function (item) {
        this.itemList.push(item);
        this.itemMap[item.id] = item;
        this.buildItemNode(item);
        this.bindItemNode(item);
    };
    ItemList.prototype.deleteItem = function (id) {
        var item = this.itemMap[id];
        var indexOfItem = this.itemList.indexOf(item);
        this.itemList.splice(indexOfItem, 1);
        delete this.itemMap[id];
        var lItems = this.itemListItemContainer.find("li");
        lItems[indexOfItem].remove();
    };
    ItemList.prototype.bindItemNode = function (item) {
        var _this = this;
        item.rootNode.click(function () {
            _this.switchItem(item);
            _this.takeFocus();
            if (item.onSelect != null) {
                item.onSelect();
            }
        });
    };
    ItemList.prototype.switchItem = function (item) {
        this.giveItemFocus(item);
        this.selectedItem = item;
    };
    ItemList.prototype.giveItemFocus = function (item) {
        if (this.selectedItem != null) {
            this.selectedItem.rootNode.removeClass("itemListFocused");
        }
        item.rootNode.addClass("itemListFocused");
    };
    ItemList.prototype.findItem = function (id) {
        return this.itemMap[id];
    };
    ItemList.prototype.buildItemNode = function (item) {
        var li = document.createElement("li");
        item.rootNode = $(li);
        item.rootNode.append(item.title);
        $("#itemListItemContainer").append(li);
    };
    return ItemList;
})();
var Item = (function () {
    function Item(id, title) {
        this.id = id;
        this.title = title;
    }

    return Item;
})();
var PlayManager = (function () {
    function PlayManager() {
        this.player = null;
        this.playbackId = 0;
        this.currentSong = null;
        this.currentPlayer = null;
        this.durationText = null;
        this.seekSlider = null;
    }

    PlayManager.prototype.bind = function () {
        var _this = this;
        SC.initialize({
            client_id: soundCloudId
        });
        window.setInterval(function () {
            _this.updateElapsed();
        }, 500);
        this.durationText = $("#durationText");
        this.seekSlider = $("#seekSlider");
    };
    PlayManager.prototype.updateElapsed = function () {
        if (this.currentPlayer != null) {
            var seconds = Math.floor(this.currentPlayer.position / 1000);
            var minutes = Math.floor(seconds / 60);
            var clampedSeconds = seconds % 60;
            this.durationText.text(this.padZeros(minutes.toString()) + ":" + this.padZeros(clampedSeconds.toString()));
            this.seekSlider.slider("value", Math.floor((this.currentPlayer.position / this.currentPlayer.duration) * 1000));
        }
    };
    PlayManager.prototype.padZeros = function (text) {
        if (text.length == 1) {
            return "0" + text;
        }
        return text;
    };
    PlayManager.prototype.playSong = function (song) {
        if (song == this.currentSong) {
            this.currentPlayer.resume();
        } else {
            this.stopCurrentSong();
            this.resolveSoundUrl(song);
        }
    };
    PlayManager.prototype.stopCurrentSong = function () {
        if (this.currentPlayer != null) {
            this.currentPlayer.stop();
        }
    };
    PlayManager.prototype.pause = function () {
        if (this.currentSong != null) {
            this.currentPlayer.pause();
        }
    };
    PlayManager.prototype.seek = function (percentage) {
        if (this.currentPlayer != null) {
            this.currentPlayer.setPosition(Math.floor(this.currentPlayer.duration * (percentage / 1000)));
        }
    };
    PlayManager.prototype.changeVolume = function (value) {
        if (this.currentSong != null) {
            this.currentPlayer.setVolume(value);
        }
    };
    PlayManager.prototype.resolveSoundUrl = function (song) {
        var _this = this;
        this.currentSong = song;
        this.playbackId += 1;
        var currentId = this.playbackId;
        SC.get('/tracks', {
            q: song.info.title + " " + song.info.artist
        }, function (tracks) {
            if (tracks.length == 0) {
                _this.onSongError(song);
            } else {
                if (currentId == _this.playbackId) {
                    _this.playResolved(_this.bestTrack(tracks), song, currentId);
                }
            }
        });
    };
    PlayManager.prototype.bestTrack = function (tracks) {
        var maxPlays = tracks[0].playback_count;
        var maxTrack = tracks[0];
        for (var i = 1; i < tracks.length; i++) {
            if (tracks[i].playback_count > maxPlays) {
                maxPlays = tracks[i].playback_count;
                maxTrack = tracks[i];
            }
        }
        return maxTrack;
    };
    PlayManager.prototype.playResolved = function (trackInfo, song, playbackId) {
        var trackId = trackInfo["id"];
        this.streamSong(trackId, song, playbackId);
        this.pushSongHistory(song);
    };
    PlayManager.prototype.streamSong = function (trackId, song, playbackId) {
        var _this = this;
        SC.stream("/tracks/" + trackId, {
            onfinish: function () {
                _this.onFinish(song);
            }
        }, function (sound) {
            _this.switchActiveSong(sound, playbackId);
        });
    };
    PlayManager.prototype.pushSongHistory = function (song) {
        $.ajax({
            url: "/history/push",
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(song),
            type: "POST"
        });
    };
    PlayManager.prototype.switchActiveSong = function (sound, playbackId) {
        if (playbackId == this.playbackId) {
            this.currentPlayer = sound;
            sound.play();
        }
    };
    return PlayManager;
})();
var GlobalPlaylistManager = (function () {
    function GlobalPlaylistManager() {
        this.isCollapsed = true;
        this.isVolumeVisible = false;
        this.songQueue = [];
        this.playing = false;
        this.showSongMenu = true;
        this.volumeSliderContainer = null;
        this.globalPlaylistSongContainer = null;
        this.globalPlaylistContainer = null;
    }

    GlobalPlaylistManager.prototype.bind = function () {
        var _this = this;
        this.volumeSliderContainer = $("#volumeSliderContainer");
        this.globalPlaylistSongContainer = $("#globalPlaylistSongContainer");
        this.globalPlaylistContainer = $("#globalPlaylistContainer");
        $(window).mousemove(function (event) {
            if (disableUserAction) {
                return;
            }
            if (_this.isCollapsed && event.clientY > (dimensions.windowHeight - 15) && (event.clientX < (dimensions.windowWidth / 2 - 185) || event.clientX > (dimensions.windowWidth / 2 + 235))) {
                _this.giveFocus();
            }
            if (event.clientY < (dimensions.windowHeight - 155)) {
                if (!_this.isCollapsed) {
                    _this.takeFocus();
                }
                if (_this.isVolumeVisible) {
                    _this.volumeSliderContainer.hide();
                    _this.isVolumeVisible = false;
                }
            }
        });
        this.volumeSliderContainer.slider({
            orientation: "vertical",
            range: "min",
            min: 0,
            max: 100,
            value: 100,
            slide: function (event, ui) {
                _this.changeVolume(ui.value);
            }
        });
        $("#volumeButton").mouseenter(function () {
            _this.volumeSliderContainer.show();
            _this.isVolumeVisible = true;
        });
        $("#playButton").click(function () {
            _this.playToggle();
        });
        $("#nextButton").click(function () {
            if (_this.playing) {
                _this.playNext();
            }
        });
        $("#previousButton").click(function () {
            if (_this.playing) {
                _this.playPrevious();
            }
        });
        $("#seekSlider").slider({
            orientation: "horizontal",
            min: 0,
            max: 1000,
            value: 0,
            slide: function (event, ui) {
                _this.changePosition(ui.value);
            }
        });
        this.globalPlaylistSongContainer.sortable({
            axis: "x",
            start: function (e, ui) {
                return _this.songStartDrag(ui.item);
            },
            stop: function (e, ui) {
                return _this.updateOrder(ui.item);
            }
        });
        playManager.onSongError = function (song) {
            _this.disableSong(song);
            _this.playNext();
        };
        playManager.onFinish = function (song) {
            _this.playNext();
        };
    };
    GlobalPlaylistManager.prototype.songStartDrag = function (item) {
        this.showSongMenu = false;
    };
    GlobalPlaylistManager.prototype.updateOrder = function (reorderedItem) {
        var changedSong = this.songQueue.filter(function (s) {
            return s.mbid == reorderedItem.attr("songId");
        })[0];
        var nextSong = this.songQueue.filter(function (s) {
            return s.mbid == reorderedItem.next().attr("songId");
        })[0];
        this.songQueue.splice(this.songQueue.indexOf(changedSong), 1);
        if (nextSong == null) {
            this.songQueue.push(changedSong);
        } else {
            this.songQueue.splice(this.songQueue.indexOf(nextSong), 0, changedSong);
        }
    };
    GlobalPlaylistManager.prototype.changePosition = function (value) {
        if (this.playing) {
            playManager.seek(value);
        }
    };
    GlobalPlaylistManager.prototype.changeVolume = function (value) {
        playManager.changeVolume(value);
    };
    GlobalPlaylistManager.prototype.disableSong = function (song) {
        var songContainer = $("#globalPlay" + song.mbid);
        songContainer.addClass("disabledGlobalSong");
        songContainer.find(".imageTitle").text("Not Found");
        songContainer.find(".imageArtist").text(":(");
    };
    GlobalPlaylistManager.prototype.playToggle = function () {
        if (this.playing) {
            this.pause();
        } else {
            this.play();
        }
    };
    GlobalPlaylistManager.prototype.play = function () {
        var currentSong = this.getCurrentSong();
        if (currentSong == null) {
            return;
        }
        this.playSong(currentSong);
    };
    GlobalPlaylistManager.prototype.playNext = function () {
        var currentSongIndex = this.songQueue.indexOf(this.getCurrentSong()) + 1;
        if (currentSongIndex == this.songQueue.length) {
            currentSongIndex = 0;
        }
        var songToPlay = this.songQueue[currentSongIndex];
        this.playSong(songToPlay);
    };
    GlobalPlaylistManager.prototype.playPrevious = function () {
        var currentSongIndex = this.songQueue.indexOf(this.getCurrentSong()) - 1;
        if (currentSongIndex < 0) {
            currentSongIndex = this.songQueue.length - 1;
        }
        var songToPlay = this.songQueue[currentSongIndex];
        this.playSong(songToPlay);
    };
    GlobalPlaylistManager.prototype.playSong = function (song) {
        if (song == null) {
            return;
        }
        this.unDecorateSong(this.playingSong);
        this.decorateSong(song);
        this.playing = true;
        this.playingSong = song;
        playManager.playSong(song);
        $("#playButton").removeClass("playButtonPaused");
    };
    GlobalPlaylistManager.prototype.decorateSong = function (song) {
        var songContainer = $("#globalPlay" + song.mbid);
        songContainer.append(this.createOverlay());
    };
    GlobalPlaylistManager.prototype.unDecorateSong = function (song) {
        if (song == null) {
            return;
        }
        var songContainer = $("#globalPlay" + song.mbid).find(".playingSongOverlay");
        songContainer.remove();
    };
    GlobalPlaylistManager.prototype.createOverlay = function () {
        var elem = $("<div></div>");
        elem.addClass("playingSongOverlay");
        return elem;
    };
    GlobalPlaylistManager.prototype.pause = function () {
        this.playing = false;
        $("#playButton").addClass("playButtonPaused");
        playManager.pause();
    };
    GlobalPlaylistManager.prototype.getCurrentSong = function () {
        if (this.playingSong == null) {
            return this.songQueue[0];
        }
        return this.playingSong;
    };
    GlobalPlaylistManager.prototype.pushSongs = function (songs) {
        var _this = this;
        songs.forEach(function (song) {
            _this.pushSong(song);
        });
    };
    GlobalPlaylistManager.prototype.pushSong = function (song) {
        if (this.songQueue.filter(function (e) {
            return e.mbid == song.mbid;
        }).length == 0) {
            this.songQueue.push(song);
            this.addImageTemplate(song);
        }
    };
    GlobalPlaylistManager.prototype.addImageTemplate = function (song) {
        var _this = this;
        var template = buildSmallSong(song);
        $(template).attr("id", "globalPlay" + song.mbid).attr("songId", song.mbid).click(function () {
            _this.showSongMenu = false;
            _this.playSong(song);
        }).mousedown(function (e) {
                return _this.startMenuTimer(song, e.clientX, e.clientY);
            });
        this.globalPlaylistSongContainer.append(template);
    };
    GlobalPlaylistManager.prototype.startMenuTimer = function (song, x, y) {
        var _this = this;
        this.showSongMenu = true;
        var callBack = function (option) {
            if (option == 0) {
                _this.deleteSong(song);
            } else if (option == 1) {
                _this.clearSongs();
            }
        };
        window.setTimeout(function () {
            if (_this.showSongMenu) {
                songMenu.show([
                    "Delete",
                    "Delete All"
                ], {
                    x: x,
                    y: y
                }, callBack);
            }
        }, 1000);
    };
    GlobalPlaylistManager.prototype.deleteSong = function (song) {
        this.songQueue.splice(this.songQueue.indexOf(song), 1);
        this.globalPlaylistSongContainer.find("#globalPlay" + song.mbid).remove();
    };
    GlobalPlaylistManager.prototype.clearSongs = function () {
        this.songQueue = [];
        this.playingSong = null;
        this.globalPlaylistSongContainer.empty();
    };
    GlobalPlaylistManager.prototype.giveFocus = function () {
        this.globalPlaylistContainer.addClass("globalPlaylistContainerExpanded");
        this.globalPlaylistSongContainer.addClass("globalPlaylistSongContainerExpanded");
        $("#sectionContainer").css("-webkit-transform-origin", "50% 100%").css("transform-origin", "50% 100%").addClass("sectionContainerContractedVertical");
        this.isCollapsed = false;
    };
    GlobalPlaylistManager.prototype.takeFocus = function () {
        this.globalPlaylistContainer.removeClass("globalPlaylistContainerExpanded");
        this.globalPlaylistSongContainer.removeClass("globalPlaylistSongContainerExpanded");
        $("#sectionContainer").removeClass("sectionContainerContractedVertical");
        this.isCollapsed = true;
    };
    return GlobalPlaylistManager;
})();
var binders = {
};
var itemList = new ItemList();
var playManager = new PlayManager();
var globalPlaylistManager = new GlobalPlaylistManager();
//@ sourceMappingURL=main.js.map
