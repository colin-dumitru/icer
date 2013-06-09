declare var Rickshaw;

class HistoryBinder implements SectionBinder {
    private historyManager:HistoryManager;

    buildPage(rootNode:any) {
        this.historyManager = new HistoryManager(rootNode);
        this.historyManager.loadHistory();
    }

    bind() {
        $("#historySlider")
            .draggable({
                containment: "#historyContainer",
                scroll: false,
                axis: "x",
                stop: (event, ui) => {
                    this.historyManager.slideReferencePoint(ui.position.left)
                }
            });
    }

    unbind() {

    }
}

class HistoryManager {
    private historyPoints:HistoryPoint[];
    private dataWidth:number;

    private historyChart;
    private genreChart;
    private genreData = [
        {x: 0, y: 0},
        {x: 1, y: 10},
        {x: 2, y: 0},
        {x: 3, y: 10}
    ];

    constructor(private rootNode) {
    }

    loadHistory() {
        this.historyPoints = this.initializeHistory();
        this.getPlayback();
        this.buildGenreChart();
        this.dataWidth = 800;

        this.slideReferencePoint(0);
    }

    getGenres(week:number) {
        $.ajax("/history/genres/" + week, {
            type: "POST",
            dataType: "json",
            success: data => {
                for (var i = 0, len = data.length; i < len; i++) {
                    this.historyPoints[week].genres[i].name = data[i].item;
                    this.historyPoints[week].genres[i].volume = data[i].plays;
                }

                this.historyPoints[week].updatedGenres = true;
                this.displayDataPointGenres(this.historyPoints[week]);
                this.displayWeekInterval(week);
            }
        });
    }

    getArtists(week:number) {
        $.ajax("/history/artists/" + week, {
            type: "POST",
            dataType: "json",
            success: data => {
                for (var i = 0, len = data.length; i < len; i++) {
                    this.historyPoints[week].artists[i] = data[i].item.toString();
                }

                this.historyPoints[week].updatedArtists = true;
                this.displayDataPointArtists(this.historyPoints[week]);
                this.displayWeekInterval(week);
            }
        });
    }

    getPlayback() {
        $.ajax("/history/playback", {
            type: "POST",
            dataType: "json",
            success: data => {
                for (var i = 0, len = data.length; i < len; i++) {
                    if (this.historyPoints[data[i].item - 1] != null) {
                        this.historyPoints[data[i].item - 1].listenVolume = data[i].plays;
                    }
                }

                this.buildHistoryChart();
            }
        });
    }

    private buildGenreChart() {
        var data = this.genreData;

        var graph = new Rickshaw.Graph({
            element: document.querySelector("#historyGenreCellContainer"),
            renderer: 'bar',
            width: 250,
            height: 175,
            series: [
                {
                    color: '#e1f1ff',
                    data: data
                }
            ]
        });

        graph.render();
        this.genreChart = graph;
    }

    private buildHistoryChart() {
        var container = $("#historyContainer");

        var data = [];
        this.historyPoints.forEach((point:HistoryPoint, index:number) => {
            data.push({x: index, y: point.listenVolume})
        });

        var graph = new Rickshaw.Graph({
            element: document.querySelector("#historyContainer"),
            width: 800,
            height: 200,
            series: [
                {
                    color: '#e1f1ff',
                    data: data
                }
            ],
            interpolation: "linear"
        });

        graph.render();
        this.historyChart = graph;
    }

    slideReferencePoint(position:number) {
        var dataSetIndex = Math.floor(position / (this.dataWidth / this.historyPoints.length));
        var point = this.historyPoints[dataSetIndex];

        if (!point.updatedArtists && !point.updatedGenres) {
            if (!point.updatedGenres) {
                this.getGenres(dataSetIndex);
            }

            if (!point.updatedArtists) {
                this.getArtists(dataSetIndex);
            }
        } else {
            this.displayDataPointArtists(point);
            this.displayDataPointGenres(point);
            this.displayWeekInterval(dataSetIndex);
        }
    }

    getWeekNumber() {
        var date = new Date();
        var day = date.getDay();
        if (day == 0) {
            day = 7;
        }
        date.setDate(date.getDate() + (4 - day));
        var year = date.getFullYear();
        var ZBDoCY = Math.floor((date.getTime() - new Date(year, 0, 1, -6).getTime()) / 86400000);
        return Math.floor(ZBDoCY / 7) + 1;
    }

    displayDataPointGenres(point:HistoryPoint) {
        point.genres.forEach((item, index) => {
            this.genreData[index] = {x: index, y: item.volume, name: item.name};
        });
        this.genreChart.render();

        for (var i = 0; i < 4; i++) {
            if (point.genres[i].name === "") {
                $("#historyGenreLabel" + (i + 1)).css("display", "none");
            } else {
                var historyGenreLabel = $("#historyGenreLabel" + (i + 1))
                historyGenreLabel.css("display", "inline");
                historyGenreLabel.text(point.genres[i].name);
            }
        }
    }

    displayDataPointArtists(point:HistoryPoint) {
        for (var i = 0; i < 4; i++) {
            if (point.artists[i] === "") {
                $("#historyArtist" + (i + 1)).css("display", "none");
            } else {
                var historyArtist = $("#historyArtist" + (i + 1))
                historyArtist.css("display", "list-item");
                historyArtist.text(point.artists[i]);
            }
        }
    }

    private displayWeekInterval(week:number) {
        var starDate = this.firstDayOfWeek(week + 1);
        var endDate = this.firstDayOfWeek(week + 2);
        endDate.setDate(endDate.getDate() - 1);

        $("#historyStartDate").text(starDate.getDate() + "/" + (starDate.getMonth() + 1) + "/" + starDate.getFullYear());
        $("#historyEndDate").text(endDate.getDate() + "/" + (endDate.getMonth() + 1) + "/" + endDate.getFullYear());
    }

    initializeHistory():HistoryPoint[] {
        var points = [];

        var currentWeek = this.getWeekNumber();
        for (var i = 0; i < currentWeek; i++) {
            points.push(
                new HistoryPoint(0, [
                    {name: "", volume: 0},
                    {name: "", volume: 0},
                    {name: "", volume: 0},
                    {name: "", volume: 0}
                ],
                    ["", "", "", ""], false, false)
            );
        }

        return points;
    }

    private firstDayOfWeek(week) {
        var date = this.firstWeekOfYear((new Date()).getFullYear()),
            weekTime = this.weeksToMilliseconds(week),
            targetTime = date.getTime() + weekTime;

        return new Date(targetTime)

    }

    private weeksToMilliseconds(weeks) {
        return 1000 * 60 * 60 * 24 * 7 * (weeks - 1);
    }

    private firstWeekOfYear(year) {
        var date = new Date();
        date = this.firstDayOfYear(date, year);
        date = this.firstWeekday(date);
        return date;
    }

    private firstDayOfYear(date, year) {
        date.setYear(year);
        date.setDate(1);
        date.setMonth(0);
        date.setHours(0);
        date.setMinutes(0);
        date.setSeconds(0);
        date.setMilliseconds(0);
        return date;
    }


    private firstWeekday(firstOfJanuaryDate) {
        var firstDayOfWeek = 1;
        var weekLength = 7;
        var day = firstOfJanuaryDate.getDay();
        day = (day === 0) ? 7 : day;
        var dayOffset = -day + firstDayOfWeek;
        if (weekLength - day + 1 < 4) {
            dayOffset += weekLength;
        }

        return new Date(firstOfJanuaryDate.getTime() + dayOffset * 24 * 60 * 60 * 1000);
    }
}

class HistoryPoint {
    constructor(public listenVolume:number, public genres:{ name : String; volume:number; }[], public artists:string[], public updatedGenres:bool, public updatedArtists:bool) {
    }

}