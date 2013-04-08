var HistoryBinder = (function () {
    function HistoryBinder() {
    }

    HistoryBinder.prototype.buildPage = function (rootNode) {
        this.historyManager = new HistoryManager(rootNode);
        this.historyManager.loadHistory();
    };
    HistoryBinder.prototype.bind = function () {
        var _this = this;
        $("#historySlider").draggable({
            containment: "#historyContainer",
            axis: "x",
            drag: function (event, ui) {
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
        this.historyPoints = this.mockHistory();
        this.buildHistoryChart();
        this.buildGenreChart();
        this.slideReferencePoint(0);
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
                    color: '#DDD',
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
                    color: '#DDD',
                    data: data
                }
            ],
            interpolation: "linear"
        });
        graph.render();
        this.historyChart = graph;
    };
    HistoryManager.prototype.slideReferencePoint = function (position) {
        var dataWidth = $("#historyContainer").width();
        var dataSetIndex = Math.floor(position / (dataWidth / this.historyPoints.length));
        var point = this.historyPoints[dataSetIndex];
        this.displayDataPoint(point);
    };
    HistoryManager.prototype.displayDataPoint = function (point) {
        var _this = this;
        point.genres.forEach(function (item, index) {
            _this.genreData[index] = {
                x: index,
                y: item.volume,
                name: item.name
            };
        });
        this.genreChart.render();
        $("#historyGenreLabel1").text(point.genres[0].name);
        $("#historyGenreLabel2").text(point.genres[1].name);
        $("#historyGenreLabel3").text(point.genres[2].name);
        $("#historyGenreLabel4").text(point.genres[3].name);
        $("#historyArtist1").text(point.artists[0]);
        $("#historyArtist2").text(point.artists[1]);
        $("#historyArtist3").text(point.artists[2]);
        $("#historyArtist4").text(point.artists[3]);
    };
    HistoryManager.prototype.mockHistory = function () {
        var genres = [
            "rock",
            "pop",
            "country",
            "electronic",
            "trance",
            "hip-hop"
        ];
        var artists = [
            "Colplay",
            "Mat Kearney",
            "Taylor Swift",
            "For Fighting Five",
            "John Groban",
            "Camo & Krooked",
            "Israel Kamakawiwo'ole"
        ];
        var points = [];

        function randomGenre() {
            var index = Math.floor(Math.random() * genres.length);
            return genres[index];
        }

        function randomArtist() {
            var index = Math.floor(Math.random() * artists.length);
            return genres[index];
        }

        for (var i = 0; i < 25; i++) {
            points.push(new HistoryPoint(Math.random() * 50, [
                {
                    name: randomGenre(),
                    volume: Math.random() * 50
                },
                {
                    name: randomGenre(),
                    volume: Math.random() * 50
                },
                {
                    name: randomGenre(),
                    volume: Math.random() * 50
                },
                {
                    name: randomGenre(),
                    volume: Math.random() * 50
                }
            ], [
                randomArtist(),
                randomArtist(),
                randomArtist(),
                randomArtist()
            ]));
        }
        return points;
    };
    return HistoryManager;
})();
var HistoryPoint = (function () {
    function HistoryPoint(listenVolume, genres, artists) {
        this.listenVolume = listenVolume;
        this.genres = genres;
        this.artists = artists;
    }

    return HistoryPoint;
})();
//@ sourceMappingURL=history.js.map
