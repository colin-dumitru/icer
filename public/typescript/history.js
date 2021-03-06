var HistoryBinder = (function () {
    function HistoryBinder() { }
    HistoryBinder.prototype.buildPage = function (rootNode) {
        this.historyManager = new HistoryManager(rootNode);
        this.historyManager.loadHistory();
    };
    HistoryBinder.prototype.bind = function () {
        var _this = this;
        $("#historySlider").draggable({
            containment: "#historyContainer",
            scroll: false,
            axis: "x",
            stop: function (event, ui) {
                _this.historyManager.slideReferencePoint(ui.position.left);
            }
        });
    };
    HistoryBinder.prototype.unbind = function () {
    };
    return HistoryBinder;
})();
var HistoryManager = (function () {
    function HistoryManager(rootNode) {
        this.rootNode = rootNode;
        this.genreData = [
            {
                x: 0,
                y: 0
            }, 
            {
                x: 1,
                y: 10
            }, 
            {
                x: 2,
                y: 0
            }, 
            {
                x: 3,
                y: 10
            }
        ];
    }
    HistoryManager.prototype.loadHistory = function () {
        this.historyPoints = this.initializeHistory();
        this.getPlayback();
        this.buildGenreChart();
        this.dataWidth = 800;
        this.slideReferencePoint(0);
    };
    HistoryManager.prototype.getGenres = function (week) {
        var _this = this;
        $.ajax("/history/genres/" + week, {
            type: "POST",
            dataType: "json",
            success: function (data) {
                for(var i = 0, len = data.length; i < len; i++) {
                    _this.historyPoints[week].genres[i].name = data[i].item;
                    _this.historyPoints[week].genres[i].volume = data[i].plays;
                }
                _this.historyPoints[week].updatedGenres = true;
                _this.displayDataPointGenres(_this.historyPoints[week]);
                _this.displayWeekInterval(week);
            }
        });
    };
    HistoryManager.prototype.getArtists = function (week) {
        var _this = this;
        $.ajax("/history/artists/" + week, {
            type: "POST",
            dataType: "json",
            success: function (data) {
                for(var i = 0, len = data.length; i < len; i++) {
                    _this.historyPoints[week].artists[i] = data[i].item.toString();
                }
                _this.historyPoints[week].updatedArtists = true;
                _this.displayDataPointArtists(_this.historyPoints[week]);
                _this.displayWeekInterval(week);
            }
        });
    };
    HistoryManager.prototype.getPlayback = function () {
        var _this = this;
        $.ajax("/history/playback", {
            type: "POST",
            dataType: "json",
            success: function (data) {
                for(var i = 0, len = data.length; i < len; i++) {
                    if(_this.historyPoints[data[i].item - 1] != null) {
                        _this.historyPoints[data[i].item - 1].listenVolume = data[i].plays;
                    }
                }
                _this.buildHistoryChart();
            }
        });
    };
    HistoryManager.prototype.buildGenreChart = function () {
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
    };
    HistoryManager.prototype.buildHistoryChart = function () {
        var container = $("#historyContainer");
        var data = [];
        this.historyPoints.forEach(function (point, index) {
            data.push({
                x: index,
                y: point.listenVolume
            });
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
    };
    HistoryManager.prototype.slideReferencePoint = function (position) {
        var dataSetIndex = Math.floor(position / (this.dataWidth / this.historyPoints.length));
        var point = this.historyPoints[dataSetIndex];
        if(!point.updatedArtists && !point.updatedGenres) {
            if(!point.updatedGenres) {
                this.getGenres(dataSetIndex);
            }
            if(!point.updatedArtists) {
                this.getArtists(dataSetIndex);
            }
        } else {
            this.displayDataPointArtists(point);
            this.displayDataPointGenres(point);
            this.displayWeekInterval(dataSetIndex);
        }
    };
    HistoryManager.prototype.getWeekNumber = function () {
        var date = new Date();
        var day = date.getDay();
        if(day == 0) {
            day = 7;
        }
        date.setDate(date.getDate() + (4 - day));
        var year = date.getFullYear();
        var ZBDoCY = Math.floor((date.getTime() - new Date(year, 0, 1, -6).getTime()) / 86400000);
        return Math.floor(ZBDoCY / 7) + 1;
    };
    HistoryManager.prototype.displayDataPointGenres = function (point) {
        var _this = this;
        point.genres.forEach(function (item, index) {
            _this.genreData[index] = {
                x: index,
                y: item.volume,
                name: item.name
            };
        });
        this.genreChart.render();
        for(var i = 0; i < 4; i++) {
            if(point.genres[i].name === "") {
                $("#historyGenreLabel" + (i + 1)).css("display", "none");
            } else {
                var historyGenreLabel = $("#historyGenreLabel" + (i + 1));
                historyGenreLabel.css("display", "inline");
                historyGenreLabel.text(point.genres[i].name);
            }
        }
    };
    HistoryManager.prototype.displayDataPointArtists = function (point) {
        for(var i = 0; i < 4; i++) {
            if(point.artists[i] === "") {
                $("#historyArtist" + (i + 1)).css("display", "none");
            } else {
                var historyArtist = $("#historyArtist" + (i + 1));
                historyArtist.css("display", "list-item");
                historyArtist.text(point.artists[i]);
            }
        }
    };
    HistoryManager.prototype.displayWeekInterval = function (week) {
        var starDate = this.firstDayOfWeek(week + 1);
        var endDate = this.firstDayOfWeek(week + 2);
        endDate.setDate(endDate.getDate() - 1);
        $("#historyStartDate").text(starDate.getDate() + "/" + (starDate.getMonth() + 1) + "/" + starDate.getFullYear());
        $("#historyEndDate").text(endDate.getDate() + "/" + (endDate.getMonth() + 1) + "/" + endDate.getFullYear());
    };
    HistoryManager.prototype.initializeHistory = function () {
        var points = [];
        var currentWeek = this.getWeekNumber();
        for(var i = 0; i < currentWeek; i++) {
            points.push(new HistoryPoint(0, [
                {
                    name: "",
                    volume: 0
                }, 
                {
                    name: "",
                    volume: 0
                }, 
                {
                    name: "",
                    volume: 0
                }, 
                {
                    name: "",
                    volume: 0
                }
            ], [
                "", 
                "", 
                "", 
                ""
            ], false, false));
        }
        return points;
    };
    HistoryManager.prototype.firstDayOfWeek = function (week) {
        var date = this.firstWeekOfYear((new Date()).getFullYear());
        var weekTime = this.weeksToMilliseconds(week);
        var targetTime = date.getTime() + weekTime;

        return new Date(targetTime);
    };
    HistoryManager.prototype.weeksToMilliseconds = function (weeks) {
        return 1000 * 60 * 60 * 24 * 7 * (weeks - 1);
    };
    HistoryManager.prototype.firstWeekOfYear = function (year) {
        var date = new Date();
        date = this.firstDayOfYear(date, year);
        date = this.firstWeekday(date);
        return date;
    };
    HistoryManager.prototype.firstDayOfYear = function (date, year) {
        date.setYear(year);
        date.setDate(1);
        date.setMonth(0);
        date.setHours(0);
        date.setMinutes(0);
        date.setSeconds(0);
        date.setMilliseconds(0);
        return date;
    };
    HistoryManager.prototype.firstWeekday = function (firstOfJanuaryDate) {
        var firstDayOfWeek = 1;
        var weekLength = 7;
        var day = firstOfJanuaryDate.getDay();
        day = (day === 0) ? 7 : day;
        var dayOffset = -day + firstDayOfWeek;
        if(weekLength - day + 1 < 4) {
            dayOffset += weekLength;
        }
        return new Date(firstOfJanuaryDate.getTime() + dayOffset * 24 * 60 * 60 * 1000);
    };
    return HistoryManager;
})();
var HistoryPoint = (function () {
    function HistoryPoint(listenVolume, genres, artists, updatedGenres, updatedArtists) {
        this.listenVolume = listenVolume;
        this.genres = genres;
        this.artists = artists;
        this.updatedGenres = updatedGenres;
        this.updatedArtists = updatedArtists;
    }
    return HistoryPoint;
})();
//@ sourceMappingURL=history.js.map
