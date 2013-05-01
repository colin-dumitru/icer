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
    sections.push(buildTopSection());

    sectionManager = new SectionManager(sections);
    sectionManager.build();
    sectionManager.resize();

    $(window).resize(() => {
        sectionManager.resize();
    });

    itemList.bind();
    playManager.bind();
    globalPlaylistManager.bind();
    songDetailManager.bind();

    //todo temp
    globalPlaylistManager.pushSongs([
        new Song("077f4678-2eed-4e3e-bdbd-8476a9201b62", new SongInfo("Believe Me Natalie", "The Killers", null, null), "http://userserve-ak.last.fm/serve/300x300/68101062.png"),
        new Song("812349b2-b115-4dc2-b90e-040a1eac3725", new SongInfo("I Believe in a Thing Called Love", "The Darkness", null, null), "http://userserve-ak.last.fm/serve/300x300/87434825.png"),
        new Song("13194c93-89c6-4ab4-aaf2-15db5d73b74e", new SongInfo("Believe", "Cher", null, null), "http://userserve-ak.last.fm/serve/300x300/71997588.png"),
        new Song("5750327d-09ba-43e5-bd75-a08ba29e22f5", new SongInfo("We Believe", "Red Hot Chili Peppers", null, null), "http://userserve-ak.last.fm/serve/300x300/66662762.png"),
        new Song("0196b4cc-66ec-4ad4-acad-2fe852a4ccd5", new SongInfo("I'm a Believer", "The Monkees", null, null), "http://userserve-ak.last.fm/serve/300x300/77468760.png"),
        new Song("076ed98f-f3e9-44c8-b9b7-66624de9b9f0", new SongInfo("Believe", "The Bravery", null, null), "http://userserve-ak.last.fm/serve/300x300/9723711.jpg")
    ])
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

function buildTopSection():Section {
    return new Section("Chart", "charts", "/assets/sections/charts.html");
}

class SectionManager {

    private currentSection:Section;
    private currentSectionIndex:number;

    private menuSelector:any;
    private menuSelectorBackground:any;
    private sectionTable:any;
    private sectionContainer:any;

    constructor(private sections:Section[]) {

    }

    build() {
        this.menuSelector = $("#menuSelector");
        this.menuSelectorBackground = $("#menuSelectorBackground");
        this.sectionTable = $("#sectionTable");
        this.sectionContainer = $("#sectionContainer");

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
        this.sectionTable.append(section.rootNode);
    }

    private onPageLoadComplete(section:Section) {
        binders[section.id].buildPage(section.rootNode);
        if (this.sections.indexOf(section) == 0) {
            this.changeSection(0);
        }
    }

    private bindMenuSelector() {
        var us = this;
        this.menuSelector
            .draggable({
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
                    us.changeSection(us.closestMenuItem(ui.position.top))
                }
            });
    }

    public changeSection(index:number) {
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
    }

    private closestMenuItem(top:number):number {
        var closestOffset = top / dimensions.menuItemHeight;
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
    }
}

class Section {
    constructor(public menuLabel:string, public id:string, public url:string) {
    }

    rootNode:any;
}

class ItemList {
    private isCollapsed:bool = true;
    private isHidden = true;
    private itemList:Item[] = [];
    private selectedItem:Item;

    onInput:(input:String) => any;

    private itemListQueue:{[key:string] : {itemList:Item[]; selectedItem:Item;};} = {};

    pushItemList(key:string) {
        this.itemListQueue[key] = {itemList: this.itemList, selectedItem: this.selectedItem};
        $("#itemListItemContainer").empty();
    }

    popItemList(key:string) {
        var itemData = this.itemListQueue[key];

        if (itemData == null) {
            itemData = {itemList: [], selectedItem: null};
        }

        this.itemList = itemData.itemList;
        this.selectedItem = itemData.selectedItem;

        this.itemList.forEach((item) => {
            $("#itemListItemContainer").append(item.rootNode);
            this.bindItemNode(item);
        });
    }

    bind() {
        $(window).mousemove((event) => {
            if (this.isHidden) {
                return;
            }
            if (event.clientX > (dimensions.windowWidth - 15)) {
                if (this.isCollapsed) {
                    this.giveFocus();
                }
            }

            if (event.clientX < (dimensions.windowWidth - 250)) {
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
        this.isHidden = false;
        $("#itemListContainerTable").show(400);
    }

    hide() {
        this.isHidden = true;
        $("#itemListContainerTable").hide(400);
    }

    giveFocus() {
        $("#itemListContainer")
            .addClass("itemListContainerExpanded")
            .removeClass("itemListContainerContracted");

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
            .removeClass("itemListContainerExpanded")
            .addClass("itemListContainerContracted");
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

    public deleteItem(id:string) {
        var item = this.itemList.filter(item => item.id == id);
        var indexOfItem = this.itemList.indexOf(item[0]);
        this.itemList.splice(indexOfItem, 1);

        var lItems = $("#itemListItemContainer").find("li");
        lItems[indexOfItem].remove();
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
    public player = null;
    public onSongError:(song:Song) => any;
    public onFinish:(song:Song) => any;

    private currentSong = null;
    private currentPlayer = null;

    public bind() {
        SC.initialize({
            client_id: soundCloudId
        });
        window.setInterval(() => {
            this.updateElapsed();
        }, 500);
    }

    private updateElapsed() {
        if (this.currentPlayer != null) {
            var seconds = Math.floor(this.currentPlayer.position / 1000);
            var minutes = Math.floor(seconds / 60);
            var clampedSeconds = seconds % 60;
            $("#durationText").text(this.padZeros(minutes.toString()) + ":" + this.padZeros(clampedSeconds.toString()));
            $("#seekSlider").slider("value", Math.floor((this.currentPlayer.position / this.currentPlayer.duration) * 1000));
        }
    }

    private padZeros(text:String):String {
        if (text.length == 1) {
            return "0" + text;
        }
        return text;
    }

    public playSong(song:Song) {
        if (song == this.currentSong) {
            this.currentPlayer.play();
        } else {
            this.stopCurrentSong()
            this.resolveSoundUrl(song);
        }
    }

    private stopCurrentSong() {
        if (this.currentPlayer != null) {
            this.currentPlayer.stop();
        }
    }

    public pause() {
        if (this.currentSong != null) {
            this.currentPlayer.pause();
        }
    }

    public seek(percentage:number) {
        if (this.currentPlayer != null) {
            this.currentPlayer.setPosition(Math.floor(this.currentPlayer.duration * (percentage / 1000)));
        }

    }

    public changeVolume(value:number) {
        if (this.currentSong != null) {
            this.currentPlayer.setVolume(value);
        }
    }

    private resolveSoundUrl(song:Song) {
        this.currentSong = song;

        SC.get('/tracks', { q: song.info.title + " " + song.info.artist}, (tracks:any[]) => {
            if (tracks.length == 0) {
                this.onSongError(song);
            } else {
                if (this.currentSong == song) {
                    this.playResolved(this.bestTrack(tracks), song);
                }
            }
        });
    }

    private bestTrack(tracks:any[]) {
        var maxPlays = tracks[0].playback_count;
        var maxTrack = tracks[0];

        for (var i = 1; i < tracks.length; i++) {
            if (tracks[i].playback_count > maxPlays) {
                maxPlays = tracks[i].playback_count;
                maxTrack = tracks[i];
            }
        }
        return maxTrack;
    }

    private playResolved(trackInfo:any, song:Song) {
        var trackId = trackInfo["id"];
        this.streamSong(trackId, song);
        this.pushSongHistory(song);
    }

    private streamSong(trackId:any, song:Song) {
        SC.stream("/tracks/" + trackId,
            {
                onfinish: () => {
                    this.onFinish(song);
                }
            },
            (sound)  => {
                this.switchActiveSong(sound, song);
            });
    }

    private pushSongHistory(song:Song) {
        $.ajax({
            url: "/history/push",
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(song),
            type: "POST"
        });
    }

    private switchActiveSong(sound:any, song:Song) {
        this.currentPlayer = sound;
        sound.play();
    }
}

class GlobalPlaylistManager {
    private isCollapsed = true;
    private isVolumeVisible = false;

    private songQueue:Song[] = [];
    private playingSong:Song;
    private playing = false;

    bind() {
        $(window).mousemove((event) => {
            if (event.clientY > (dimensions.windowHeight - 15) &&
                (event.clientX < (dimensions.windowWidth / 2 - 200) || event.clientX > (dimensions.windowWidth / 2 + 200))) {
                if (this.isCollapsed) {
                    this.giveFocus();
                }
            }

            if (event.clientY < (dimensions.windowHeight - 155)) {
                if (!this.isCollapsed) {
                    this.takeFocus();
                }
                if (this.isVolumeVisible) {
                    $("#volumeSliderContainer").hide();
                    this.isVolumeVisible = false;
                }
            }
        });

        $("#volumeSliderContainer").slider({
            orientation: "vertical",
            range: "min",
            min: 0,
            max: 100,
            value: 100,
            slide: (event, ui) => {
                this.changeVolume(ui.value);
            }
        });

        $("#volumeButton").mouseenter(() => {
            $("#volumeSliderContainer").show();
            this.isVolumeVisible = true;
        });

        $("#playButton").click(() => {
            this.playToggle();
        });

        $("#nextButton").click(() => {
            if (this.playing) {
                this.playNext();
            }
        });

        $("#previousButton").click(() => {
            if (this.playing) {
                this.playPrevious();
            }
        });

        $("#seekSlider").slider({
            orientation: "horizontal",
            min: 0,
            max: 1000,
            value: 0,
            slide: (event, ui) => {
                this.changePosition(ui.value);
            }
        });

        playManager.onSongError = (song) => {
            this.disableSong(song);
            this.playNext();
        };

        playManager.onFinish = (song) => {
            this.playNext();
        }
    }

    private changePosition(value:number) {
        if (this.playing) {
            playManager.seek(value);
        }
    }

    private changeVolume(value:number) {
        playManager.changeVolume(value);
    }

    private disableSong(song:Song) {
        var songContainer = $("#globalPlay" + song.mbid);

        songContainer.addClass("disabledGlobalSong");
        songContainer.find(".imageTitle").text("Not Found");
        songContainer.find(".imageArtist").text(":(");
    }

    private playToggle() {
        if (this.playing) {
            this.pause();
        } else {
            this.play();
        }
    }

    private play() {
        var currentSong = this.getCurrentSong();
        if (currentSong == null) {
            return;
        }
        this.playSong(currentSong);
    }

    private playNext() {
        var currentSongIndex = this.songQueue.indexOf(this.getCurrentSong()) + 1;
        if (currentSongIndex == this.songQueue.length) {
            currentSongIndex = 0;
        }
        var songToPlay = this.songQueue[currentSongIndex];
        this.playSong(songToPlay);
    }

    private playPrevious() {
        var currentSongIndex = this.songQueue.indexOf(this.getCurrentSong()) - 1;
        if (currentSongIndex < 0) {
            currentSongIndex = this.songQueue.length - 1;
        }
        var songToPlay = this.songQueue[currentSongIndex];
        this.playSong(songToPlay);
    }

    public playSong(song:Song) {
        if (song == null) {
            return;
        }

        this.unDecorateSong(this.playingSong);
        this.decorateSong(song);

        this.playing = true;
        this.playingSong = song;
        playManager.playSong(song);
        $("#playButton").removeClass("playButtonPaused");
    }

    private decorateSong(song:Song) {
        var songContainer = $("#globalPlay" + song.mbid);
        songContainer.append(this.createOverlay());
    }

    private unDecorateSong(song:Song) {
        if (song == null) {
            return;
        }
        var songContainer = $("#globalPlay" + song.mbid)
            .find(".playingSongOverlay");
        songContainer.remove();
    }

    private createOverlay() {
        var elem = $("<div></div>");
        elem.addClass("playingSongOverlay");
        return elem;
    }

    private pause() {
        this.playing = false;
        $("#playButton").addClass("playButtonPaused");
        playManager.pause();
    }

    private getCurrentSong():Song {
        if (this.playingSong == null) {
            return this.songQueue[0];
        }
        return this.playingSong;
    }

    public pushSongs(songs:Song[]) {
        songs.forEach((song) => {
            this.pushSong(song);
        });
    }

    public pushSong(song:Song) {
        this.songQueue.push(song);
        this.addImageTemplate(song);
    }

    private addImageTemplate(song:Song) {
        var template = buildSmallSong(song);
        $(template)
            .attr("id", "globalPlay" + song.mbid)
            .click(() => {
                this.playSong(song);
            });
        $("#globalPlaylistSongContainer").append(template);
        //todo events for click
    }

    public clearSongs() {
        this.songQueue = [];
        this.playingSong = null;
        $("#globalPlaylistSongContainer").empty();
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

declare var $;
declare var soundCloudId;
declare var dimensions;
declare var SC;
//todo Catalin check this
declare var sectionManager;

var binders:{ [key: string]: SectionBinder; } = { };
var itemList = new ItemList();
var playManager = new PlayManager();
var globalPlaylistManager = new GlobalPlaylistManager();
