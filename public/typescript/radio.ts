class RadioBinder implements SectionBinder {
    private radioManager:RadioManager;

    private criteriaSongs:RadioCriteriaInput;
    private criteriaAlbums:RadioCriteriaInput;
    private criteriaGenres:RadioCriteriaInput;
    private criteriaPastConcerts:RadioCriteriaInput;
    private customCriteria:RadioCriteriaInput;

    buildPage(rootNode:any) {
        this.radioManager = new RadioManager(rootNode);


        this.criteriaSongs = new RadioCriteriaInput("radioRecentSongsCriteria", false, () => {
            return "Recent Songs";
        });

        this.criteriaAlbums = new RadioCriteriaInput("radioRecentAlbumsCriteria", false, () => {
            return "Recent Albums";
        });

        this.criteriaGenres = new RadioCriteriaInput("radioRecentGenresCriteria", false, () => {
            return "Recent Genres";
        });

        this.criteriaPastConcerts = new RadioCriteriaInput("radioPastConcertsCriteria", false, () => {
            return "Past Concerts";
        });

        this.customCriteria = new RadioCriteriaInput("radioCustomCriteria", true, () => {
            return $("#customCriteriaInput").val();
        });

        this.radioManager.addCriteriaInput(this.customCriteria);
        this.radioManager.addCriteriaInput(this.criteriaSongs);
        this.radioManager.addCriteriaInput(this.criteriaGenres);
        this.radioManager.addCriteriaInput(this.criteriaAlbums);
        this.radioManager.addCriteriaInput(this.criteriaPastConcerts);

        this.radioManager.bind();
    }

    bind() {
        $("#radioManagerResetButton").click(() => {

            $("#radioCriteriaTableBody").empty();
            for (var i in this.radioManager.selectedCriterias) {
                $("#" + this.radioManager.selectedCriterias[i].id).show();
            }
            this.radioManager.selectedCriterias = [];

            this.radioManager.addCriteriaToReset(this.criteriaSongs);
            this.radioManager.addCriteriaToReset(this.criteriaAlbums);
        })

    }

    unbind() {

    }
}

class RadioManager {
    private criterias:RadioCriteriaInput[] = [];
    private globalPlayer:Song[] = [];
    public selectedCriterias:RadioCriteriaInput[] = [];

    constructor(rootNode:any) {

    }

    buildSearchUrl(tag:string):string {
        return "http://ws.audioscrobbler.com/2.0/?method=track.search&track="
            + tag + "&api_key=" + lastFmApiKey + "&format=json&limit=20";
    }

    public loadSimilarSongs(path:String) {
        $.ajax(path, {
            type: "POST",
            dataType: "json",
            success: data =>this.onSongResult(data)
        });
    }

    public onSongResult(data) {
        for (var i = 0; i < data.length; i++) {
            var songInfo = new SongInfo(data[i].title, data[i].artist, data[i].album, data[i].genre, 0, 0, 0);
            var song = new Song(data[i].mbid, songInfo, data[i].imageUrl);
            this.globalPlayer.push(song);
        }
        this.globalPlayer = this.shuffle(this.globalPlayer);
        globalPlaylistManager.clearSongs();
        globalPlaylistManager.pushSongs(this.globalPlayer);
    }

    loadCustomSearchSongs() {
        $.ajax({
            url: this.buildSearchUrl($("#customCriteriaInput").val()),
            dataType: "json",
            method: "POST",
            success: (res:any) => this.onMainResult(res["results"]["trackmatches"]["track"])
        })
    }

    private onMainResult(tracks:any[]) {
        for (var i = 0; i < tracks.length; i++) {
            this.pushMainResult(tracks[i]);
        }
    }

    private pushMainResult(track:any) {
        var id = guid(track.mbid, track.name.trim() + track.artist.trim());
        var song = new Song(id, new SongInfo(track.name, track.artist, null, null, 0, 0, 0), track.imageUrl);
        this.globalPlayer.push(song);
        this.globalPlayer = this.shuffle(this.globalPlayer);
        globalPlaylistManager.clearSongs();
        globalPlaylistManager.pushSongs(this.globalPlayer);
    }

    addCriteriaInput(criteria:RadioCriteriaInput) {

        this.criterias.push(criteria);
        $("#" + criteria.id).click(() => {
            var criteriaTitle = criteria.labelFormatter();
            if (!criteria.repeatable) {
                $("#" + criteria.id).hide();
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
        this.selectedCriterias.push(criteriaInput);
        tr.find("#radioCriteriaCloseButton").click(() => {
            tr.remove();
            $("#" + criteriaInput.id).show();
            this.deleteCriteria(criteriaInput);
        })
    }

    public addCriteriaToReset(criteria:RadioCriteriaInput) {
        $("#" + criteria.id).hide();
        var criteriaTitle = criteria.labelFormatter();
        this.addCriteria(criteriaTitle, criteria);
    }

    deleteCriteria(criteriaInput:RadioCriteriaInput) {
        var index = this.selectedCriterias.indexOf(criteriaInput, 0);
        if (index != undefined) {
            this.selectedCriterias.splice(index, 1);
        }
    }

    shuffle(o) {
        for (var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
        return o;
    }

;

    bind() {
        $("#radioAddButtonCell").click(() => {
            $("#radioCriteriaContainer").slideToggle(300);
        });
        $("#radioManagerClearButton").click(() => {
            $("#radioCriteriaTableBody").empty();
            this.criterias.forEach((criteria) => {
                $("#" + criteria.id).show();
                for (var i in this.selectedCriterias) {
                    this.deleteCriteria(this.selectedCriterias[i]);
                }
            });
        });


        $("#radioManagerPlayButton").click(() => {

            globalPlaylistManager.clearSongs();
            this.globalPlayer = [];

            if (this.selectedCriterias.length == 0)
                globalPlaylistManager.clearSongs();

            for (var i in this.selectedCriterias) {
                var selected = this.selectedCriterias[i].id;
                switch (selected) {
                    case "radioCustomCriteria":
                    {
                        this.loadCustomSearchSongs();
                        break;
                    }
                    case "radioRecentSongsCriteria":
                    {
                        this.loadSimilarSongs("/radio/songs/");
                        break;
                    }
                    case  "radioRecentGenresCriteria":
                    {
                        this.loadSimilarSongs("/radio/genre/");
                        break;
                    }
                    case  "radioRecentAlbumsCriteria":
                    {
                        this.loadSimilarSongs("/radio/album/");
                        break;
                    }
                    default:
                    {
                        globalPlaylistManager.clearSongs();
                        break;
                    }
                }
            }
        })
        ;
    }

}

class RadioCriteriaInput {
    constructor(public id:string, public repeatable:bool, public labelFormatter:() => string) {

    }
}