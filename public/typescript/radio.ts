var customSearchValues:string[] = [];

class RadioBinder implements SectionBinder {
    private radioManager:RadioManager;

    private criteriaSongs:RadioCriteriaInput;
    private criteriaAlbums:RadioCriteriaInput;
    private criteriaGenres:RadioCriteriaInput;
    private criteriaCustom:RadioCriteriaInput;

    buildPage(rootNode:any) {
        this.radioManager = new RadioManager(rootNode);


        this.criteriaSongs = new RadioCriteriaInput("recent_songs", false, () => {
            return "Recent Songs";
        });
        this.criteriaAlbums = new RadioCriteriaInput("recent_albums", false, () => {
            return "Recent Albums";
        });
        this.criteriaGenres = new RadioCriteriaInput("recent_genres", false, () => {
            return "Recent Genres";
        });
        this.criteriaCustom = new RadioCriteriaInput("custom", true, () => {
            return $("#customCriteriaInput").val();
        });

        this.radioManager.addCriteriaInput(this.criteriaCustom);
        this.radioManager.addCriteriaInput(this.criteriaSongs);
        this.radioManager.addCriteriaInput(this.criteriaGenres);
        this.radioManager.addCriteriaInput(this.criteriaAlbums);

        this.radioManager.bind();
    }

    bind() {
        var _this = this;

        $("#radioManagerResetButton").click(() => {

            $("#radioCriteriaTableBody").empty();
            this.radioManager.addCriteriaToReset(this.criteriaSongs);
            this.radioManager.addCriteriaToReset(this.criteriaAlbums);
        });

        $("#customCriteriaInput").keypress(function (event) {
            if (event.which == 13) {
                $("#radioCriteriaContainer").hide(300);
                _this.radioManager.addCriteria(_this.criteriaCustom.labelFormatter(), _this.criteriaCustom);
            }
        });
    }

    unbind() {
    }
}

class RadioManager {
    private criteria:RadioCriteriaInput[] = [];
    private selectedCriteria:{id:string; content:string;}[] = [];


    constructor(rootNode:any) {
    }

    addCriteriaInput(criteria:RadioCriteriaInput) {

        this.criteria.push(criteria);
        $("#radio_" + criteria.id).click(() => {
            var criteriaTitle = criteria.labelFormatter();
            if (!criteria.repeatable) {
                $("#radio_" + criteria.id).hide();
            }
            this.addCriteria(criteriaTitle, criteria);
            $("#radioCriteriaContainer").hide(300);
        });
    }


    addCriteria(criteria:string, criteriaInput:RadioCriteriaInput) {

        var criteriaTemplate = template("#radioCriteriaTemplate", criteria);
        var tr = $("<tr></tr>")
            .addClass("radioCriteriaCell")
            .append(criteriaTemplate);
        $("#radioCriteriaTableBody").append(tr);

        tr.find("#radioCriteriaCloseButton").click(() => {
            tr.remove();
            $("#radio_" + criteriaInput.id).show();
            this.deleteCriteria(criteriaInput);
        });
        this.selectedCriteria.push({id:criteriaInput.id, content:criteria});
    }

    addCriteriaToReset(criteria:RadioCriteriaInput) {
        $("#radio_" + criteria.id).hide();
        var criteriaTitle = criteria.labelFormatter();
        this.addCriteria(criteriaTitle, criteria);
    }

    deleteCriteria(criteriaInput:RadioCriteriaInput) {
        var toRemove = this.selectedCriteria.filter((c) => { return c.id == criteriaInput.id})[0];
        this.selectedCriteria.splice(this.selectedCriteria.indexOf(toRemove), 1);
    }

    bind() {
        $("#radioAddButtonCell").click(() => {
            $("#radioCriteriaContainer").slideToggle(300);
        });

        $("#radioManagerClearButton").click(() => {
            $("#radioCriteriaTableBody").empty();
            this.criteria.forEach((criteria) => {
                $("#radio_" + criteria.id).show();
                this.selectedCriteria = [];
            });
        });

        $("#radioManagerPlayButton").click(() => {
            globalPlaylistManager.clearSongs();
            this.loadRadio();
        });
    }

    public loadRadio() {
        $.ajax({
            url: "/mobile/radio/build",
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            data: JSON.stringify(this.selectedCriteria),
            type: "POST",
            success: (data) => {
                this.pushSongs(data);
            }
        });
    }

    private pushSongs(songs:any[]) {
        globalPlaylistManager.pushSongs(songs.map((item) => {
            return new Song(item["mbid"], new SongInfo(item["title"], item["artist"], null, null, 0, 0, 0), item["imageUrl"]);
        }));
        globalPlaylistManager.play();
    }
}

class RadioCriteriaInput {
    constructor(public id:string, public repeatable:bool, public labelFormatter:() => string) {

    }
}
