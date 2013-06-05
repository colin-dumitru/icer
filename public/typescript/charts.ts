class ChartsBinder implements SectionBinder {
    private manager:ChartsManager;
    private firstDisplay = true;


    buildPage(rootNode:any) {
        this.manager = new ChartsManager(rootNode);

        this.manager.addPickerPage(new PickerPage($("#chartsSongListContainer")));
        this.manager.addPickerPage(new PickerPage($("#chartsYearContainer")));
        this.manager.addPickerPage(new PickerPage($("#chartsMonthContainer")));
        this.manager.addPickerPage(new PickerPage($("#chartsWeekContainer")));
        this.manager.addPickerPage(new PickerPage($("#chartsDayContainer")));

        this.manager.bind();
    }

    bind() {
        if (this.firstDisplay) {
            chartPlaylistManager.bind();
            this.loadData();
            this.firstDisplay = false;
        }
    }

    loadData() {
        var currentDate = new Date();
        var date = new ChartDate(currentDate.getFullYear(), (currentDate.getMonth() + 1), currentDate.getDate());
        this.manager.loadSongList(date.toString(), "1 day");
    }

    unbind() {
    }
}

class ChartsManager {
    private pickerPages:PickerPage[] = [];
    private currentIndex:number;
    private longMonths = [1, 3, 5, 7, 8, 10, 12];
    private shortMonths = [4, 6, 9, 11];
    private startDate:ChartDate;
    private interval:string;
    private week:number;

    private arrowUp:any;
    private arrowDown:any;
    private arrowNoChange:any;

    constructor(private rootNode) {
        this.arrowDown = template("#chartsDown");
        this.arrowUp = template("#chartsUp");
        this.arrowNoChange = template("#chartsNoChange");
    }

    //TODO: refactor
    bind() {
        $("#chartsWhenButton").click(() => {
            this.givePickerPageFocus(1);
        });
        $("#chartsYearContainer").find("td").each((index, elem) => {
            $(elem).click(() => {
                this.startDate = new ChartDate(parseInt(elem.innerHTML), 1, 1);
                this.interval = "1 year";

                this.givePickerPageFocus(2);
            });
        });
        $("#chartsMonthContainer").find("td").each((index, elem) => {
            $(elem).click(() => {
                var month = index + 1;
                this.startDate.month = month;
                this.interval = "1 month";

                if ($.inArray(month, this.longMonths) != -1) {
                    this.displayContainerValues("chartsWeekContainer", 0);
                } else if ($.inArray(month, this.shortMonths) != -1) {
                    this.displayContainerValues("chartsWeekContainer", 1);
                } else if (month == 2) {
                    if (this.startDate.year % 4 == 0) {
                        this.displayContainerValues("chartsWeekContainer", 2);
                    } else {
                        this.displayContainerValues("chartsWeekContainer", 3);
                    }
                }

                this.givePickerPageFocus(3);
            });
        });
        $("#chartsWeekContainer").find("td").each((index, elem) => {
            $(elem).click(() => {
                this.startDate.day = parseInt(elem.childNodes[1].innerHTML.substr(1, 2));
                this.interval = "1 week";

                if ($(elem).parent().index() == 0) {
                    this.week = $(elem).index() + 1;
                } else if ($(elem).parent().index() == 1) {
                    this.week = $(elem).index() + 3;
                } else {
                    this.week = 5;
                }

                if (this.week < 5) {
                    this.displayContainerValues("chartsDayContainer", (this.week - 1));
                } else if (this.week == 5) {
                    if ($.inArray(this.startDate.month, this.longMonths) != -1) {
                        this.displayContainerValues("chartsDayContainer", 4);
                    } else if ($.inArray(this.startDate.month, this.shortMonths) != -1) {
                        this.displayContainerValues("chartsDayContainer", 5);
                    } else {
                        if (this.startDate.year % 4 == 0) {
                            this.displayContainerValues("chartsDayContainer", 6);
                        }
                    }
                }

                this.givePickerPageFocus(4);
            });
        });

        $("#chartsDayContainer").find("td").each((index, elem) => {
            $(elem).click(() => {
                this.startDate.day = parseInt(elem.childNodes[1].innerHTML.substr(1, 2));
                this.interval = "1 day";

                if (this.week == 5 && this.startDate.day < 29) {
                    this.startDate.month += 1;
                }

                this.updateCharts(this.startDate.toString(), this.interval);
            });
        });
        $("#chartsDoneButton").click(() => {
            this.updateCharts(this.startDate.toString(), this.interval);
        });
        $("#chartsCancelButton").click(() => {
            this.givePickerPageFocus(0);
        });
    }

    private displayContainerValues(container:string, index:number) {
        var children = document.getElementById(container).children;
        var length = children.length;

        for (var i = 0; i < length; i++) {
            if (i != index) {
                $(children[i]).css("display", "none");
            } else {
                $(children[index]).css("display", "table");
            }
        }
    }

    private updateCharts(startDate:string, interval:string) {
        this.givePickerPageFocus(0);
        this.loadSongList(startDate, interval);
    }

    public givePickerPageFocus(index:number) {
        this.currentIndex = index;
        this.pickerPages.forEach((page:PickerPage, i) => {
            page.rootNode
                .transition({
                    perspective: 100,
                    translate3d: [0, -100 * (i - this.currentIndex), 20 * (i - this.currentIndex)],
                    opacity: (i > this.currentIndex) ? 0 : (i == this.currentIndex) ? 1 : 0.5
                }, 400)
                .removeClass("hidden");
        });

        window.setTimeout(() => {
            this.pickerPages.forEach((page:PickerPage, index) => {
                if (index > this.currentIndex) {
                    $(page.rootNode).addClass("hidden")
                }
            })
        }, 400);
        if (index > 1) {
            $("#chartsDoneButton").show("slide", { direction: "left" }, 200);
        } else {
            $("#chartsDoneButton").hide("slide", { direction: "left" }, 200);
        }
        if (index > 0) {
            $("#chartsCancelButton").show("slide", { direction: "left" }, 200);
        } else {
            $("#chartsCancelButton").hide("slide", { direction: "left" }, 200);
        }
    }

    addPickerPage(pickerPage:PickerPage) {
        this.pickerPages.push(pickerPage);
    }

    loadSongList(startDate:string, endDate:string) {
        $.ajax("/chart/generate/" + startDate + '/' + endDate, {
            type: "POST",
            dataType: "json",
            success: data => {
                var songs:Song[] = [data.length];
                for (var i = 0, len = data.length; i < len; i++) {
                    var songInfo = new SongInfo(data[i].title, data[i].artist, data[i].album, data[i].genre, data[i].peek, data[i].weeksOnTop, data[i].positionChange);
                    songs[i] = new Song(data[i].mbid, songInfo, data[i].imageUrl);
                }
                this.setSongList(songs);
            }
        });
    }

    setSongList(songList:Song[]) {
        $("#chartsSongListContainer").empty();
        songList.forEach((song:Song, index:number) => {
            var rootNode = this.buildSongTemplate(song, index + 1);
            var manager = new ChartSongManager(song, rootNode, index);
            manager.bind();
            $("#chartsSongListContainer").append(manager.rootNode);
        })
    }

    buildSongTemplate(song:Song, index:number):any {
        var positionChange = Math.abs(song.info.positionChange).toString();
        var positionIcon = this.buildPositionIcon(song.info.positionChange);
        var positionClass = this.buildPositionClass(song.info.positionChange);

        var songTemplate = template("#chartsSongTemplate", song.info.title, song.info.artist, positionChange.toString(), positionClass,
            index.toString(), song.imageUrl, song.info.peek.toString(), song.info.weeksOnTop.toString());
        var rootDiv = $("<div></div>");
        rootDiv.append(songTemplate);

        rootDiv.find("#chartChangeArrowContainer").append(positionIcon);
        rootDiv.attr("id", song.mbid);

        return rootDiv;
    }

    buildPositionIcon(change:number) {
        if (change < 0) {
            return this.arrowDown;
        }
        if (change > 0) {
            return this.arrowUp;
        }
        return this.arrowNoChange;
    }


    buildPositionClass(change:number) {
        if (change < 0) {
            return "chartChangeArrowDown";
        }
        if (change > 0) {
            return "chartChangeArrowUp";
        }
        return "chartChangeArrowEqual";
    }
}

class PickerPage {
    constructor(public rootNode:any) {

    }
}

class ChartSongManager {
    constructor(public song:Song, public rootNode:any, index:number) {

    }

    bind() {
        $(this.rootNode).find("#chartPlayNow").click(() => {
            this.playSong(this.song);
        });

        $(this.rootNode).find("#chartSearchFromHere").click(() => {
            this.changeToSearchSection()
            this.searchFromSong(this.song);
        });

        $(this.rootNode).find("#chartAddToPlaylist").click((e) => {
            var chartPlaylistCallback = (selectedPlaylist:number, playlistTitle:string) => {
                this.addSongToPlaylist(this.song, selectedPlaylist, playlistTitle);
            };

            chartPlaylistManager.showPlaylists(
                this.buildPlaylistList(),
                chartPlaylistCallback,
                {x: $("#chartAddToPlaylist").offset().left,
                    y: e.pageY});
        });
    }

    private searchFromSong(song:Song) {
        searchManager.performSearch(song.info.title + " " + song.info.artist);
    }

    private changeToSearchSection() {
        sectionManager.changeSection(0);
    }

    private playSong(song:Song) {
        globalPlaylistManager.pushSong(song);
        globalPlaylistManager.playSong(song);
    }

    private addSongToPlaylist(song:Song, playlistIndex, title:string) {
        if (playlistIndex == null) {
            this.addSongToNewPlaylist(song, title);
        } else {
            var selectedPlaylist = playlistManager.getPlaylist()[playlistIndex];
            playlistManager.addSongToPlaylist(song, selectedPlaylist);
            this.pushSongToPlaylist(song, selectedPlaylist.id);
        }
    }

    private pushSongToPlaylist(song:Song, playlistId:string) {
        $.ajax({
            url: "/playlist/song/add/" + playlistId,
            type: "POST",
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(song)
        })
    }

    private addSongToNewPlaylist(song:Song, title:string) {
        $.ajax("/playlist/new/" + title, {
            type: "POST",
            dataType: "json",
            success: data => {
                this.pushSongToPlaylist(song, <string>data.id);
                playlistManager.loadPlaylist(<string>data.id, title)
                playlistManager.addSongToPlaylist(song, playlistManager.getPlaylistMap()[<string>data.id]);
            }
        });
    }

    private buildPlaylistList():string[] {
        return playlistManager.getPlaylist().map(p => p.title);
    }
}

class ChartDate {
    constructor(public year:number, public month:number, public day:number) {

    }

    toString() {
        return "'" + this.year + '-' + this.month + '-' + this.day + "'";
    }
}

interface ChartPlaylistCallback {
    (playlistIndex:number, playlistText:string): void;
}

class ChartPlaylistManager {
    private menuWidth:number;
    private menuHeight:number;
    private menuHidden = true;
    private menuX:number;
    private menuY:number;

    bind() {
        //var container = $("<div></div>").appendTo('body');
        //container.attr('id', 'chartPlaylistContainer');

        var chartPlaylistContainer = $("#chartPlaylistContainer");
        this.menuWidth = chartPlaylistContainer.width();
        this.menuHeight = chartPlaylistContainer.height();
        this.bindHover();
    }

    showPlaylists(playlists:string[], chartPlaylistCallback:ChartPlaylistCallback, position:{x : number; y:number;}) {
        this.menuHidden = false;

        $("#chartPlaylistContainer").empty();
        var container = $("<div></div>");
        var optionTemplate = template("#chartPlaylistTemplate");
        container.append(optionTemplate);
        $("#chartPlaylistContainer").append(container);

        this.buildPlaylist(playlists, chartPlaylistCallback, container);
        this.updateLayout(position);

        this.menuX = this.hasSpaceOnRight(position.x) ? position.x : position.x - this.menuWidth;
        this.menuY = this.hasSpaceOnBottom(position.y) ? position.y : position.y - this.menuHeight;
    }

    private buildPlaylist(playlists:string[], chartPlaylistCallback:ChartPlaylistCallback, parentTemplate) {
        var listContainer = parentTemplate.find("#chartPlaylistOptionsContainer");
        var container = parentTemplate.find("#chartPlaylistOptionsList");
        var _this = this;

        listContainer.show();

        listContainer.find("#chartPlaylistInput").keypress(function (event) {
            if (event.which == 13) {
                var text = this.value;
                this.value = "";
                chartPlaylistCallback(null, text);
                _this.hide();
            }
        });

        playlists.forEach((playlist, index) => {
            var li = $("<li></li>");
            li.append(playlist);
            container.append(li);
            this.bindPlaylistClick(index, li, chartPlaylistCallback)
        });
    }

    private bindPlaylistClick(playlistIndex:number, template, chartPlaylistCallback:ChartPlaylistCallback) {
        template.click(() => {
            chartPlaylistCallback(playlistIndex, null);
            this.hide();
        });
    }

    private updateLayout(position:{x : number; y:number;}) {
        $("#chartPlaylistContainer")
            .css("left", position.x)
            .css("top", position.y + 15)
            .show(300);
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
        $("#chartPlaylistContainer").hide(300);
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

var chartPlaylistManager:ChartPlaylistManager = new ChartPlaylistManager();
