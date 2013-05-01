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
            this.loadData();
            this.firstDisplay = false;
        }
    }

    loadData() {
        var currentDate = new Date();
        var date = new ChartDate(currentDate.getFullYear(), (currentDate.getMonth() + 1), currentDate.getDate());
        this.manager.loadSongList(date.toString(), date.toString());
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
    private endDate:ChartDate;

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
                this.endDate = new ChartDate(parseInt(elem.innerHTML), 12, 31);

                this.givePickerPageFocus(2);
            });
        });
        $("#chartsMonthContainer").find("td").each((index, elem) => {
            $(elem).click(() => {
                var month = index + 1;
                this.startDate.month = month;
                this.endDate.month = month;

                if ($.inArray(month, this.longMonths) != -1) {
                    this.displayContainerValues("chartsWeekContainer", 0);
                } else if ($.inArray(month, this.shortMonths) != -1) {
                    this.endDate.day = 30;
                    this.displayContainerValues("chartsWeekContainer", 1);
                } else if (month == 2) {
                    if (this.endDate.year % 4 == 0) {
                        this.endDate.day = 29;
                        this.displayContainerValues("chartsWeekContainer", 2);
                    } else {
                        this.endDate.day = 28;
                        this.displayContainerValues("chartsWeekContainer", 3);
                    }
                }

                this.givePickerPageFocus(3);
            });
        });
        $("#chartsWeekContainer").find("td").each((index, elem) => {
            $(elem).click(() => {
                var week;
                this.startDate.day = parseInt(elem.childNodes[1].innerHTML.substr(1, 2));
                this.endDate.day = parseInt(elem.childNodes[1].innerHTML.substr(4, 2));

                if ($(elem).parent().index() == 0) {
                    week = $(elem).index() + 1;
                } else if ($(elem).parent().index() == 1) {
                    week = $(elem).index() + 3;
                } else {
                    week = 5;
                }

                if (week < 5) {
                    this.displayContainerValues("chartsDayContainer", (week - 1));
                } else if (week == 5) {
                    if (this.endDate.month == 12) {
                        this.endDate.month = 1;
                        this.endDate.year += 1;
                    } else {
                        this.endDate.month += 1;
                    }

                    if ($.inArray(this.startDate.month, this.longMonths) != -1) {
                        this.displayContainerValues("chartsDayContainer", 4);
                    } else if ($.inArray(this.startDate.month, this.shortMonths) != -1) {
                        this.displayContainerValues("chartsDayContainer", 5);
                    } else {
                        if (this.endDate.year % 4 == 0) {
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
                this.endDate.day = parseInt(elem.childNodes[1].innerHTML.substr(1, 2));

                if (this.startDate.month != this.endDate.month) {
                    if (this.startDate.day < 29) {
                        if (this.startDate.month != 12) {
                            this.startDate.month += 1;
                        } else {
                            this.startDate.year += 1;
                            this.startDate.month = 1;
                        }
                    }

                    if (this.endDate.day >= 29) {
                        this.endDate.month -= 1
                    }
                }

                this.updateCharts(this.startDate.toString(), this.endDate.toString());
            });
        });
        $("#chartsDoneButton").click(() => {
            this.updateCharts(this.startDate.toString(), this.endDate.toString());
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
                children[i].style.display = "none";
            } else {
                children[index].style.display = "table";
            }
        }
    }

    private updateCharts(startDate:string, endDate:string) {
        this.givePickerPageFocus(0);
        //alert(this.startDate.toString());
        //alert(this.endDate.toString());
        this.loadSongList(startDate, endDate);
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
        $.ajax("/chart/generate/" + startDate + '/' + endDate,{
            type: "POST",
            dataType: "json",
            success:  data => {
                if (data.length == 0) {
                    //alert("No chart available for selected time span.")
                }
                this.setSongList(data);
            },
            error: function (reason){
                alert(reason)
            }
        });
    }

    mockSongList():ChartSong[] {
        var songList:ChartSong[] = [];

        for (var i = 0; i < 99; i++) {
            var id = "chartSong" + Math.floor(Math.random() * 100000);
            songList.push(this.mockSong(id));
        }
        return songList;
    }

    mockSong(id:string) {
        var songTitle = randomSongTitle();
        return new ChartSong(id, "", Math.floor(10 - Math.random() * 20), Math.floor(Math.random() * 100),
            songTitle.title, songTitle.artist);

    }

    setSongList(songList:ChartSong[]) {
        $("#chartsSongListContainer").empty();
        songList.forEach((song:ChartSong, index:number) => {
            var rootNode = this.buildSongTemplate(song, index + 1);
            var manager = new ChartSongManager(song, rootNode, index);
            $("#chartsSongListContainer").append(manager.rootNode);
        })
    }

    buildSongTemplate(song:ChartSong, index:number):any {
        var positionChange = Math.abs(song.positionChange).toString();
        var positionIcon = this.buildPositionIcon(song.positionChange);
        var positionClass = this.buildPositionClass(song.positionChange);

        var songTemplate = template("#chartsSongTemplate", song.title, song.artist, positionChange, positionClass, index.toString());
        var rootDiv = $("<div></div>");
        rootDiv.append(songTemplate);

        rootDiv.find("#chartChangeArrowContainer").append(positionIcon);
        rootDiv.attr("id", song.id);

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
    constructor(public chartSong:ChartSong, public rootNode:any, index:number) {

    }
}

class ChartSong {
    constructor(public id:string, public imageUrl:string, public positionChange:number, public peekPosition:number, public title:string, public artist:string) {

    }
}

class ChartDate {
    constructor(public year:number, public month:number, public day:number) {

    }

    toString() {
        return "'" + this.year + '-' + this.month + '-' + this.day + "'";
    }
}