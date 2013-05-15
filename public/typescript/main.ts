var mobile = isMobile();

interface SectionBinder{
    buildPage(rootNode:any);
    bind();
    unbind();
}

function run() {
    var sections = [];

    sections.push(buildSearchSection());
    sections.push(buildPlaylistSection());
    sections.push(buildRadioSection());
    if (!mobile) {
        sections.push(buildHistorySection());
        sections.push(buildTopSection());
    }

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
        new Song("077f4678-2eed-4e3e-bdbd-8476a9201b62", new SongInfo("Believe Me Natalie", "The Killers", null, null, 0, 0, 0), "http://userserve-ak.last.fm/serve/300x300/68101062.png"),
        new Song("812349b2-b115-4dc2-b90e-040a1eac3725", new SongInfo("I Believe in a Thing Called Love", "The Darkness", null, null, 0, 0, 0), "http://userserve-ak.last.fm/serve/300x300/87434825.png"),
        new Song("13194c93-89c6-4ab4-aaf2-15db5d73b74e", new SongInfo("Believe", "Cher", null, null, 0, 0, 0), "http://userserve-ak.last.fm/serve/300x300/71997588.png"),
        new Song("5750327d-09ba-43e5-bd75-a08ba29e22f5", new SongInfo("We Believe", "Red Hot Chili Peppers", null, null, 0, 0, 0), "http://userserve-ak.last.fm/serve/300x300/66662762.png"),
        new Song("0196b4cc-66ec-4ad4-acad-2fe852a4ccd5", new SongInfo("I'm a Believer", "The Monkees", null, null, 0, 0, 0), "http://userserve-ak.last.fm/serve/300x300/77468760.png"),
        new Song("076ed98f-f3e9-44c8-b9b7-66624de9b9f0", new SongInfo("Believe", "The Bravery", null, null, 0, 0, 0), "http://userserve-ak.last.fm/serve/300x300/9723711.jpg")
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

    private pagesBuild = 0;
    private firstSection = null;

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
        var td = $("<td></td>");
        section.rootNode = $("<tr></tr>");
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
        this.pagesBuild++;
        if (this.pagesBuild == this.sections.length) {
            this.initialize();
        }
    }

    private initialize() {
        this.changeSection(0);
        $("#mainLoader").fadeOut(500, function () {
            this.remove();
        })
    }

    private bindMenuSelector() {
        this.menuSelector
            .draggable({
                containment: "#menu",
                axis: "y",
                start: () => {
                    binders[this.currentSection.id].unbind();
                },
                drag: (event, ui) => {
                    this.menuSelectorBackground.css({
                        top: ui.position.top
                    });
                    this.sectionTable.css({
                        top: -ui.position.top * this.sections.length
                    });
                },
                stop: (event, ui) => {
                    this.changeSection(this.closestMenuItem(ui.position.top))
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

        if (this.firstSection == null) {
            this.firstSection = $("#" + this.sections[0].id + "Menu")
        }
    }

    resize() {
        dimensions.menuItemHeight = this.firstSection.height();
        dimensions.menuItemWidth = this.firstSection.width();
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
        this.sectionContainer.css({
            height: dimensions.windowHeight
        });
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
    private itemMap:{[key:string]:Item;} = {};
    private selectedItem:Item;

    onInput:(input:String) => any;

    private itemListQueue:{[key:string] : {itemList:Item[]; selectedItem:Item;};} = {};

    private itemListItemContainer = null;
    private itemListContainerTable = null;
    private itemListContainer = null;
    private sectionContainer = null;

    pushItemList(key:string) {
        this.itemListQueue[key] = {itemList: this.itemList, selectedItem: this.selectedItem};
        this.itemListItemContainer.empty();
    }

    popItemList(key:string) {
        var itemData = this.itemListQueue[key];

        if (itemData == null) {
            itemData = {itemList: [], selectedItem: null};
        }

        this.itemList = itemData.itemList;
        this.itemMap = {};
        this.selectedItem = itemData.selectedItem;

        this.itemList.forEach((item) => {
            this.itemMap[item.id] = item;
            this.itemListItemContainer.append(item.rootNode);
            this.bindItemNode(item);
        });
    }

    bind() {
        $(window).mousemove((event) => {
            if (this.isHidden) {
                return;
            }
            if (this.isCollapsed && event.clientX > (dimensions.windowWidth - 15)) {
                this.giveFocus();
            }

            if (!this.isCollapsed && event.clientX < (dimensions.windowWidth - 250)) {
                this.takeFocus();
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

        this.itemListItemContainer = $("#itemListItemContainer");
        this.itemListContainerTable = $("#itemListContainerTable");
        this.itemListContainer = $("#itemListContainer");
        this.sectionContainer = $("#sectionContainer");
    }

    show() {
        this.isHidden = false;
        this.itemListContainerTable.show(400);
    }

    hide() {
        this.isHidden = true;
        this.itemListContainerTable.hide(400);
    }

    giveFocus() {
        this.itemListContainer
            .show(0)
            .addClass("itemListContainerExpanded")
            .removeClass("itemListContainerContracted");

        this.sectionContainer
            .css("-webkit-transform-origin", "100% 50%")
            .css("transform-origin", "100% 50%")
            .addClass("sectionContainerContracted");
        this.isCollapsed = false;
    }

    takeFocus() {
        this.itemListContainer
            .removeClass("itemListContainerExpanded")
            .addClass("itemListContainerContracted")
            .delay(400)
            .hide(0);
        this.sectionContainer
            .removeClass("sectionContainerContracted");
        this.isCollapsed = true;
    }

    addItem(item:Item) {
        this.itemList.push(item);
        this.itemMap[item.id] = item;
        this.buildItemNode(item);
        this.bindItemNode(item);
    }

    deleteItem(id:string) {
        var item = this.itemMap[id];
        var indexOfItem = this.itemList.indexOf(item);
        this.itemList.splice(indexOfItem, 1);
        delete this.itemMap[id];

        var lItems = this.itemListItemContainer.find("li");
        lItems[indexOfItem].remove();
    }

    private bindItemNode(item:Item) {
        item.rootNode.click(() => {
            this.switchItem(item);
            this.takeFocus();
            if (item.onSelect != null) {
                item.onSelect();
            }
        });
    }

    public switchItem(item:Item) {
        this.giveItemFocus(item);
        this.selectedItem = item;
    }

    public giveItemFocus(item:Item) {
        if (this.selectedItem != null) {
            this.selectedItem.rootNode.removeClass("itemListFocused")
        }
        item.rootNode.addClass("itemListFocused");
    }

    public findItem(id:string):Item {
        return this.itemMap[id];
    }

    private buildItemNode(item:Item) {
        var li = document.createElement("li");
        item.rootNode = $(li);

        item.rootNode.append(item.title);
        $("#itemListItemContainer").append(li);
    }
}

class Item {
    constructor(public id:string, public title:string) {
    }

    onSelect:() => any;
    rootNode:any;
}

class PlayManager {
    public player = null;
    public onSongError:(song:Song) => any;
    public onFinish:(song:Song) => any;

    private playbackId = 0;
    private currentSong = null;
    private currentPlayer = null;

    private durationText = null;
    private seekSlider = null;

    public bind() {
        SC.initialize({
            client_id: soundCloudId
        });
        window.setInterval(() => {
            this.updateElapsed();
        }, 500);

        this.durationText = $("#durationText");
        this.seekSlider = $("#seekSlider");
    }

    private updateElapsed() {
        if (this.currentPlayer != null) {
            var seconds = Math.floor(this.currentPlayer.position / 1000);
            var minutes = Math.floor(seconds / 60);
            var clampedSeconds = seconds % 60;
            this.durationText.text(this.padZeros(minutes.toString()) + ":" + this.padZeros(clampedSeconds.toString()));
            this.seekSlider.slider("value", Math.floor((this.currentPlayer.position / this.currentPlayer.duration) * 1000));
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
            this.currentPlayer.resume();
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
        this.playbackId += 1;
        var currentId = this.playbackId;

        SC.get('/tracks', { q: song.info.title + " " + song.info.artist}, (tracks:any[]) => {
            if (tracks.length == 0) {
                this.onSongError(song);
            } else {
                if (currentId == this.playbackId) {
                    this.playResolved(this.bestTrack(tracks), song, currentId);
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

    private playResolved(trackInfo:any, song:Song, playbackId:number) {
        var trackId = trackInfo["id"];
        this.streamSong(trackId, song, playbackId);
        this.pushSongHistory(song);
    }

    private streamSong(trackId:any, song:Song, playbackId:number) {
        SC.stream("/tracks/" + trackId,
            {
                onfinish: () => {
                    this.onFinish(song);
                }
            },
            (sound)  => {
                this.switchActiveSong(sound, playbackId);
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

    private switchActiveSong(sound:any, playbackId:number) {
        if (playbackId == this.playbackId) {
            this.currentPlayer = sound;
            sound.play();
        }
    }
}

class GlobalPlaylistManager {
    private isCollapsed = true;
    private isVolumeVisible = false;

    private songQueue:Song[] = [];
    private playingSong:Song;
    private playing = false;

    private showSongMenu = true;

    private volumeSliderContainer = null;
    private globalPlaylistSongContainer = null;
    private globalPlaylistContainer = null;

    bind() {
        this.volumeSliderContainer = $("#volumeSliderContainer");
        this.globalPlaylistSongContainer = $("#globalPlaylistSongContainer");
        this.globalPlaylistContainer = $("#globalPlaylistContainer");

        $(window).mousemove((event) => {
            if (this.isCollapsed
                && event.clientY > (dimensions.windowHeight - 15)
                && (event.clientX < (dimensions.windowWidth / 2 - 185) || event.clientX > (dimensions.windowWidth / 2 + 235))) {
                this.giveFocus();
            }

            if (event.clientY < (dimensions.windowHeight - 155)) {
                if (!this.isCollapsed) {
                    this.takeFocus();
                }
                if (this.isVolumeVisible) {
                    this.volumeSliderContainer.hide();
                    this.isVolumeVisible = false;
                }
            }
        });

        this.volumeSliderContainer.slider({
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
            this.volumeSliderContainer.show();
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

        this.globalPlaylistSongContainer.sortable({
            axis: "x",
            start: (e, ui) => this.songStartDrag(ui.item),
            stop: (e, ui) => this.updateOrder(ui.item)
        });

        playManager.onSongError = (song) => {
            this.disableSong(song);
            this.playNext();
        };

        playManager.onFinish = (song) => {
            this.playNext();
        }
    }

    private songStartDrag(item) {
        this.showSongMenu = false;
    }

    private updateOrder(reorderedItem) {
        var changedSong = this.songQueue.filter(s => s.mbid == reorderedItem.attr("songId"))[0];
        var nextSong = this.songQueue.filter(s => s.mbid == reorderedItem.next().attr("songId"))[0];

        this.songQueue.splice(this.songQueue.indexOf(changedSong), 1);
        if (nextSong == null) {
            this.songQueue.push(changedSong);
        } else {
            this.songQueue.splice(this.songQueue.indexOf(nextSong), 0, changedSong);
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

    playSong(song:Song) {
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

    pushSongs(songs:Song[]) {
        songs.forEach((song) => {
            this.pushSong(song);
        });
    }

    pushSong(song:Song) {
        if (this.songQueue.filter(e => e.mbid == song.mbid).length == 0) {
            this.songQueue.push(song);
            this.addImageTemplate(song);
        }
    }

    private addImageTemplate(song:Song) {
        var template = buildSmallSong(song);
        $(template)
            .attr("id", "globalPlay" + song.mbid)
            .attr("songId", song.mbid)
            .click(() => {
                this.showSongMenu = false;
                this.playSong(song);
            })
            .mousedown((e) => this.startMenuTimer(song, e.clientX, e.clientY));
        this.globalPlaylistSongContainer.append(template);
    }

    private startMenuTimer(song:Song, x:number, y:number) {
        this.showSongMenu = true;

        var callBack = (option:number) => {
            if (option == 0) {
                this.deleteSong(song);
            } else if (option == 1) {
                this.clearSongs();
            }
        };

        window.setTimeout(() => {
            if (this.showSongMenu) {
                songMenu.show(["Delete", "Delete All"], {x: x, y: y}, callBack);
            }
        }, 1000);
    }

    deleteSong(song:Song) {
        this.songQueue.splice(this.songQueue.indexOf(song), 1);
        this.globalPlaylistSongContainer.find("#globalPlay" + song.mbid).remove();
    }

    clearSongs() {
        this.songQueue = [];
        this.playingSong = null;
        this.globalPlaylistSongContainer.empty();
    }

    giveFocus() {
        this.globalPlaylistContainer
            .transition({
                bottom: 120
            });
        this.globalPlaylistSongContainer
            .transition({
                perspective: "100px",
                transformOrigin: '50% 0%',
                rotateX: 0
            });
        $("#sectionContainer")
            .css("-webkit-transform-origin", "50% 100%")
            .css("transform-origin", "50% 100%")
            .addClass("sectionContainerContractedVertical");
        this.isCollapsed = false;
    }

    takeFocus() {
        this.globalPlaylistContainer
            .transition({
                bottom: 0
            });
        this.globalPlaylistSongContainer
            .transition({
                perspective: "100px",
                transformOrigin: '50% 0%',
                rotateX: -10
            });
        $("#sectionContainer")
            .removeClass("sectionContainerContractedVertical");
        this.isCollapsed = true;
    }
}

declare var $;
declare var soundCloudId;
declare var dimensions;
declare var SC;
declare var sectionManager;

var binders:{ [key: string]: SectionBinder; } = { };
var itemList = new ItemList();
var playManager = new PlayManager();
var globalPlaylistManager = new GlobalPlaylistManager();
