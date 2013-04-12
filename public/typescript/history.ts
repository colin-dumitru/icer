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
                axis: "x",
                drag: (event, ui) => {
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
        this.historyPoints = this.mockHistory();

        this.buildHistoryChart();
        this.buildGenreChart();
        this.dataWidth = $("#historyContainer").width();

        this.slideReferencePoint(0);
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
                    color: '#DDD',
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
                    color: '#DDD',
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
        this.displayDataPoint(point);
    }

    displayDataPoint(point:HistoryPoint) {
        point.genres.forEach((item, index) => {
            this.genreData[index] = {x: index, y: item.volume, name: item.name};
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
    }

    mockHistory():HistoryPoint[] {
        var genres = ["rock", "pop", "country", "electronic", "trance", "hip-hop"];
        var artists = ["Colplay", "Mat Kearney", "Taylor Swift", "For Fighting Five", "John Groban", "Camo & Krooked", "Israel Kamakawiwo'ole"];

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
            points.push(
                new HistoryPoint(Math.random() * 50, [
                    {name: randomGenre(), volume: Math.random() * 50},
                    {name: randomGenre(), volume: Math.random() * 50},
                    {name: randomGenre(), volume: Math.random() * 50},
                    {name: randomGenre(), volume: Math.random() * 50}
                ],
                    [randomArtist(), randomArtist(), randomArtist(), randomArtist()])
            );
        }

        return points;
    }
}

class HistoryPoint {
    constructor(public listenVolume:number, public genres:{ name : String; volume:number; }[], public artists:string[]) {
    }

}