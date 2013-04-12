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
        this.manager.loadSongList("day", 0);
    }

    unbind() {
    }
}

class ChartsManager {
    private pickerPages:PickerPage[] = [];
    private currentIndex:number;

    constructor(private rootNode) {
    }

    bind() {
        $("#chartsWhenButton").click(() =>{
            this.givePickerPageFocus(1);
        });
        $("#chartsYearContainer").find("td").each((index, elem) => {
            $(elem).click(() => {
                this.givePickerPageFocus(2);
            });
        });
        $("#chartsMonthContainer").find("td").each((index, elem) => {
            $(elem).click(() => {
                this.givePickerPageFocus(3);
            });
        });
        $("#chartsWeekContainer").find("td").each((index, elem) => {
            $(elem).click(() => {
                this.givePickerPageFocus(4);
            });
        });

        $("#chartsDayContainer").find("td").each((index, elem) => {
            $(elem).click(() => {
                this.updateCharts();
            });
        });
        $("#chartsDoneButton").click(() => {
            this.updateCharts();
        });
        $("#chartsCancelButton").click(() => {
            this.givePickerPageFocus(0);
        });
    }

    private updateCharts() {
        this.givePickerPageFocus(0);
        this.loadSongList("", 0);
    }

    public givePickerPageFocus(index:number) {
        this.currentIndex = index;
        this.pickerPages.forEach((page:PickerPage, i) => {
            page.rootNode
                .transition({
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
        if(index > 1) {
            $("#chartsDoneButton").show("slide", { direction: "left" }, 200);
        } else{
            $("#chartsDoneButton").hide("slide", { direction: "left" }, 200);
        }
        if(index > 0) {
            $("#chartsCancelButton").show("slide", { direction: "left" }, 200);
        } else{
            $("#chartsCancelButton").hide("slide", { direction: "left" }, 200);
        }
    }

    addPickerPage(pickerPage:PickerPage) {
        this.pickerPages.push(pickerPage);
    }

    loadSongList(timeUnit:string, period:number) {
        var songList = this.mockSongList();
        this.setSongList(songList);
    }

    mockSongList():ChartSong[] {
        var songList:ChartSong[] = [];

        for (var i = 0; i < 100; i++) {
            var id = "chartSong" + Math.floor(Math.random() * 100000);
            songList.push(this.mockSong(id));
        }
        return songList;
    }

    mockSong(id:string) {
        var songTitle = this.randomSongTitle();
        return new ChartSong(id, "", Math.floor(10 - Math.random() * 20), Math.floor(Math.random() * 100),
            songTitle.title, songTitle.artist);

    }

    randomSongTitle():{artist:string; title:string;} {
        var titles = [
            {artist: "Bruno Mars", title: "When I Was Your Man"},
            {artist: "Imagine Dragons", title: "Radioactive"},
            {artist: "Justin Timberlake", title: "Suit and tie"},
            {artist: "Jonas Brothers", title: "Pom Poms"},
            {artist: " Demi Lovato", title: "Heart attack"},
            {artist: "Justin Timberlake", title: "Mirrors"},
            {artist: " Fall Out Boy", title: "My Songs Know What You Did In The Dark"},
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
            return template("#chartsDown");
        }
        if (change > 0) {
            return template("#chartsUp");
        }
        return template("#chartsNoChange");
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

class PickerPage{
    constructor(public rootNode:any){

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