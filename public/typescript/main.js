function run() {
    var sections = [];
    sections.push(buildSearchSection());
    sections.push(buildPlaylistSection());
    sections.push(buildHistorySection());
    sections.push(buildRadioSection());
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
        new Song("077f4678-2eed-4e3e-bdbd-8476a9201b62", new SongInfo("Believe Me Natalie", "The Killers", null, null, 0, 0), "http://userserve-ak.last.fm/serve/300x300/68101062.png"),
        new Song("812349b2-b115-4dc2-b90e-040a1eac3725", new SongInfo("I Believe in a Thing Called Love", "The Darkness", null, null, 0, 0), "http://userserve-ak.last.fm/serve/300x300/87434825.png"),
        new Song("13194c93-89c6-4ab4-aaf2-15db5d73b74e", new SongInfo("Believe", "Cher", null, null, 0, 0), "http://userserve-ak.last.fm/serve/300x300/71997588.png"),
        new Song("5750327d-09ba-43e5-bd75-a08ba29e22f5", new SongInfo("We Believe", "Red Hot Chili Peppers", null, null, 0, 0), "http://userserve-ak.last.fm/serve/300x300/66662762.png"),
        new Song("0196b4cc-66ec-4ad4-acad-2fe852a4ccd5", new SongInfo("I'm a Believer", "The Monkees", null, null, 0, 0), "http://userserve-ak.last.fm/serve/300x300/77468760.png"),
        new Song("076ed98f-f3e9-44c8-b9b7-66624de9b9f0", new SongInfo("Believe", "The Bravery", null, null, 0, 0), "http://userserve-ak.last.fm/serve/300x300/9723711.jpg")
    ]);
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
    }

    SectionManager.prototype.build = function () {
        this.menuSelector = $("#menuSelector");
        this.menuSelectorBackground = $("#menuSelectorBackground");
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
        var td = $(document.createElement("td"));
        section.rootNode = $(document.createElement("tr"));
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
        var us = this;
        this.menuSelector.draggable({
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
                us.changeSection(us.closestMenuItem(ui.position.top));
            }
        });
    };
    SectionManager.prototype.changeSection = function (index) {
        this.currentSection = this.sections[index];
        this.currentSectionIndex = index;
        this.menuSelector.animate({
            top: index * dimensions.menuItemHeight
        });
        this.menuSelectorBackground.animate({
            top: index * dimensions.menuItemHeight
        });
        this.sectionTable.animate({
            top: -index * dimensions.windowHeight
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
            _this.changeSection(_this.sections.indexOf(section));
        });
    };
    SectionManager.prototype.resize = function () {
        var firstSection = $("#" + this.sections[0].id + "Menu");
        dimensions.menuItemHeight = firstSection.height();
        dimensions.menuItemWidth = firstSection.width();
        dimensions.windowHeight = $(window).height();
        dimensions.windowWidth = $(window).width();
        this.menuSelector.css({
            height: dimensions.menuItemHeight,
            top: this.currentSectionIndex * dimensions.windowHeight
        });
        this.menuSelectorBackground.css({
            height: dimensions.menuItemHeight,
            top: this.currentSectionIndex * dimensions.menuItemHeight
        });
        this.sectionContainer.css("height", dimensions.windowHeight);
        this.sectionTable.css({
            height: dimensions.windowHeight * this.sections.length,
            top: -this.currentSectionIndex * dimensions.windowHeight
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
        this.itemListQueue = {
        };
    }

    ItemList.prototype.pushItemList = function (key) {
        this.itemListQueue[key] = {
            itemList: this.itemList,
            selectedItem: this.selectedItem
        };
        $("#itemListItemContainer").empty();
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
        this.selectedItem = itemData.selectedItem;
        this.itemList.forEach(function (item) {
            $("#itemListItemContainer").append(item.rootNode);
            _this.bindItemNode(item);
        });
    };
    ItemList.prototype.bind = function () {
        var _this = this;
        $(window).mousemove(function (event) {
            if (_this.isHidden) {
                return;
            }
            if (event.clientX > (dimensions.windowWidth - 15)) {
                if (_this.isCollapsed) {
                    _this.giveFocus();
                }
            }
            if (event.clientX < (dimensions.windowWidth - 250)) {
                if (!_this.isCollapsed) {
                    _this.takeFocus();
                }
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
    };
    ItemList.prototype.show = function () {
        this.isHidden = false;
        $("#itemListContainerTable").show(400);
    };
    ItemList.prototype.hide = function () {
        this.isHidden = true;
        $("#itemListContainerTable").hide(400);
    };
    ItemList.prototype.giveFocus = function () {
        $("#itemListContainer").addClass("itemListContainerExpanded").removeClass("itemListContainerContracted");
        $("#sectionContainer").addClass("sectionContainerContracted");
        this.isCollapsed = false;
    };
    ItemList.prototype.takeFocus = function () {
        $("#itemListContainer").removeClass("itemListContainerExpanded").addClass("itemListContainerContracted");
        $("#sectionContainer").removeClass("sectionContainerContracted");
        this.isCollapsed = true;
    };
    ItemList.prototype.addItem = function (item) {
        this.itemList.push(item);
        this.buildItemNode(item);
        this.bindItemNode(item);
    };
    ItemList.prototype.deleteItem = function (id) {
        var item = this.itemList.filter(function (item) {
            return item.id == id;
        });
        var indexOfItem = this.itemList.indexOf(item[0]);
        this.itemList.splice(indexOfItem, 1);
        var lItems = $("#itemListItemContainer").find("li");
        lItems[indexOfItem].remove();
    };
    ItemList.prototype.bindItemNode = function (item) {
        var _this = this;
        item.rootNode.click(function () {
            _this.switchItem(item);
            if (item.onSelect != null) {
                item.onSelect();
            }
        });
    };
    ItemList.prototype.switchItem = function (item) {
        this.giveItemFocus(item);
        this.selectedItem = item;
        this.takeFocus();
    };
    ItemList.prototype.giveItemFocus = function (item) {
        if (this.selectedItem != null) {
            this.selectedItem.rootNode.removeClass("itemListFocused");
        }
        item.rootNode.addClass("itemListFocused");
    };
    ItemList.prototype.findItem = function (id) {
        return this.itemList.filter(function (item) {
            return item.id == id;
        })[0];
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
        this.currentSong = null;
        this.currentPlayer = null;
    }

    PlayManager.prototype.bind = function () {
        var _this = this;
        SC.initialize({
            client_id: soundCloudId
        });
        window.setInterval(function () {
            _this.updateElapsed();
        }, 500);
    };
    PlayManager.prototype.updateElapsed = function () {
        if (this.currentPlayer != null) {
            var seconds = Math.floor(this.currentPlayer.position / 1000);
            var minutes = Math.floor(seconds / 60);
            var clampedSeconds = seconds % 60;
            $("#durationText").text(this.padZeros(minutes.toString()) + ":" + this.padZeros(clampedSeconds.toString()));
            $("#seekSlider").slider("value", Math.floor((this.currentPlayer.position / this.currentPlayer.duration) * 1000));
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
            this.currentPlayer.play();
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
        SC.get('/tracks', {
            q: song.info.title + " " + song.info.artist
        }, function (tracks) {
            if (tracks.length == 0) {
                _this.onSongError(song);
            } else {
                if (_this.currentSong == song) {
                    _this.playResolved(_this.bestTrack(tracks), song);
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
    PlayManager.prototype.playResolved = function (trackInfo, song) {
        var trackId = trackInfo["id"];
        this.streamSong(trackId, song);
        this.pushSongHistory(song);
    };
    PlayManager.prototype.streamSong = function (trackId, song) {
        var _this = this;
        SC.stream("/tracks/" + trackId, {
            onfinish: function () {
                _this.onFinish(song);
            }
        }, function (sound) {
            _this.switchActiveSong(sound, song);
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
    PlayManager.prototype.switchActiveSong = function (sound, song) {
        this.currentPlayer = sound;
        sound.play();
    };
    return PlayManager;
})();
var GlobalPlaylistManager = (function () {
    function GlobalPlaylistManager() {
        this.isCollapsed = true;
        this.isVolumeVisible = false;
        this.songQueue = [];
        this.playing = false;
    }

    GlobalPlaylistManager.prototype.bind = function () {
        var _this = this;
        $(window).mousemove(function (event) {
            if (event.clientY > (dimensions.windowHeight - 15) && (event.clientX < (dimensions.windowWidth / 2 - 185) || event.clientX > (dimensions.windowWidth / 2 + 235))) {
                if (_this.isCollapsed) {
                    _this.giveFocus();
                }
            }
            if (event.clientY < (dimensions.windowHeight - 155)) {
                if (!_this.isCollapsed) {
                    _this.takeFocus();
                }
                if (_this.isVolumeVisible) {
                    $("#volumeSliderContainer").hide();
                    _this.isVolumeVisible = false;
                }
            }
        });
        $("#volumeSliderContainer").slider({
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
            $("#volumeSliderContainer").show();
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
        playManager.onSongError = function (song) {
            _this.disableSong(song);
            _this.playNext();
        };
        playManager.onFinish = function (song) {
            _this.playNext();
        };
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
        this.songQueue.push(song);
        this.addImageTemplate(song);
    };
    GlobalPlaylistManager.prototype.addImageTemplate = function (song) {
        var _this = this;
        var template = buildSmallSong(song);
        $(template).attr("id", "globalPlay" + song.mbid).click(function () {
            _this.playSong(song);
        });
        $("#globalPlaylistSongContainer").append(template);
    };
    GlobalPlaylistManager.prototype.clearSongs = function () {
        this.songQueue = [];
        this.playingSong = null;
        $("#globalPlaylistSongContainer").empty();
    };
    GlobalPlaylistManager.prototype.giveFocus = function () {
        $("#globalPlaylistContainer").transition({
            bottom: 120
        });
        $("#globalPlaylistSongContainer").transition({
            perspective: "100px",
            transformOrigin: '50% 0%',
            rotateX: 0
        });
        $("#sectionContainer").addClass("sectionContainerContractedVertical");
        this.isCollapsed = false;
    };
    GlobalPlaylistManager.prototype.takeFocus = function () {
        $("#globalPlaylistContainer").transition({
            bottom: 0
        });
        $("#globalPlaylistSongContainer").transition({
            perspective: "100px",
            transformOrigin: '50% 0%',
            rotateX: -10
        });
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
