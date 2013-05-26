var customSearchValues:string[] = [];

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
            customSearchValues.push($("#customCriteriaInput").val());
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
            for (var i in RadioManager.selectedCriterias) {
                $("#" + RadioManager.selectedCriterias[i].id).show();
            }
            RadioManager.selectedCriterias = [];

            this.radioManager.addCriteriaToReset(this.criteriaSongs);
            this.radioManager.addCriteriaToReset(this.criteriaAlbums);
        })

    }

    unbind() {

    }
}

class RadioManager {
    private criterias:RadioCriteriaInput[] = [];
    public static selectedCriterias:RadioCriteriaInput[] = [];

    private recentSongs:Song[] = [];
    public static globalPlayer:Song[] = [];


    constructor(rootNode:any) {
        this.loadRecentSongs();
    }

    public loadRecentSongs() {
        $.ajax("/radio/songs/", {
            type: "POST",
            dataType: "json",
            success: data =>{
                this.onSongResult(data)
                this.loadRadio();
            }
        });
    }

    public onSongResult(data) {
        this.recentSongs = [];
        for (var i = 0; i < data.length; i++) {
            var songInfo = new SongInfo(data[i].title, data[i].artist, data[i].album, data[i].genre, 0, 0, 0);
            var song = new Song(data[i].mbid, songInfo, data[i].imageUrl);
            this.recentSongs.push(song);
        }
    }

    public static addSongToGlobalPlayer(song:Song) {

        RadioManager.globalPlayer.push(song);
        RadioManager.globalPlayer = RadioManager.shuffle(RadioManager.globalPlayer);
        globalPlaylistManager.clearSongs();
        globalPlaylistManager.pushSongs(RadioManager.globalPlayer);

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
        RadioManager.selectedCriterias.push(criteriaInput);
        tr.find("#radioCriteriaCloseButton").click(() => {
            for (var i in customSearchValues) {
                if (customSearchValues[i] == criteria)
                {
                    var index = customSearchValues.indexOf(criteria);
                    customSearchValues.splice(index, 1);
                }
            }
            tr.remove();
            $("#" + criteriaInput.id).show();
            this.deleteCriteria(criteriaInput);
        })
    }

    addCriteriaToReset(criteria:RadioCriteriaInput) {
        $("#" + criteria.id).hide();
        var criteriaTitle = criteria.labelFormatter();
        this.addCriteria(criteriaTitle, criteria);
    }

    deleteCriteria(criteriaInput:RadioCriteriaInput) {
        var index = RadioManager.selectedCriterias.indexOf(criteriaInput, 0);
        if (index != undefined) {
            RadioManager.selectedCriterias.splice(index, 1);
        }
    }

    public static shuffle(o) {
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
                for (var i in RadioManager.selectedCriterias) {
                    this.deleteCriteria(RadioManager.selectedCriterias[i]);
                }
            });
        });


        $("#radioManagerPlayButton").click(() => {
            globalPlaylistManager.clearSongs();
            RadioManager.globalPlayer = [];

            if (RadioManager.selectedCriterias.length == 0)
                globalPlaylistManager.clearSongs();
            this.loadRecentSongs();
        });
    }

    public loadRadio()
    {
        for (var i in RadioManager.selectedCriterias) {
            var selected = RadioManager.selectedCriterias[i].id;
            switch (selected) {
                case "radioCustomCriteria":
                {
                    for (var i = 0; i < customSearchValues.length; i++) {
                        new SearchCustom().loadCustomSearchSongs(customSearchValues[i]);
                    }
                    break;
                }
                case "radioRecentSongsCriteria":
                {
                    for (var i = 0; i < this.recentSongs.length; i++) {
                        new SearchSimilarSongs().loadSimilarSongs(this.recentSongs[i].info.title);
                    }
                    break;
                }
                case  "radioRecentGenresCriteria":
                {
                    for (var i = 0; i < this.recentSongs.length; i++) {
                        if (this.recentSongs[i].info.genre!=null)
                            new SearchSimilarGenre().loadSimilarGenreSongs(this.recentSongs[i].info.genre);
                    }

                    break;
                }
                case  "radioRecentAlbumsCriteria":
                {
                    for (var i = 0; i < this.recentSongs.length; i++) {
                        if (this.recentSongs[i].info.album!=null)
                            new SearchSimilarAlbum().loadSimilarAlbumSongs(this.recentSongs[i].info.artist);
                    }
                    break;
                }
                default:
                {
                    globalPlaylistManager.clearSongs();
                    break;
                }
            }
        }
    }
}

class RadioCriteriaInput {
    constructor(public id:string, public repeatable:bool, public labelFormatter:() => string) {

    }
}

class SearchSimilarSongs {
    loadSimilarSongs(song:string) {
        $.ajax({
            url: this.buildSearchUrl(song),
            dataType: "json",
            method: "GET",
            success: (res:any) => this.onMainResult(res["results"]["trackmatches"]["track"])
        });
    }

    private onMainResult(tracks:any[]) {
        for (var i = 0; i < tracks.length; i++) {
            this.pushMainResult(tracks[i]);
        }

    }

    private pushMainResult(track:any) {
        var id = guid(track.mbid, track.name.trim() + track.artist.trim());
        var song = new Song(id, new SongInfo(track.name, track.artist, null, null, 0, 0, 0), getExtraLargeImage(track.image));
        this.loadSimilar(song);
    }


    private loadSimilar(song:Song) {
        $.ajax({
            url: this.buildSimilarSongsSearchUrl(song),
            dataType: "json",
            method: "GET",
            success: (res:any) => {
                this.onSimilarResults(res, song)
            }
        })
    }

    private onSimilarResults(res, song:Song) {
        if (res.error == null && res["similartracks"] != null && Array.isArray(res["similartracks"]["track"])) {
            this.addSimilarSongs(res["similartracks"]["track"], song);
        }
    }

    private addSimilarSongs(tracks, song:Song) {
        for (var i = 0; i < tracks.length; i++) {
            this.addSimilarSong(tracks[i]);
        }

    }

    private addSimilarSong(track) {
        var id = guid(track.mbid, track.name.trim() + track.artist.name.trim());
        var song = new Song(id, new SongInfo(track.name, track.artist.name, null, null, 0, 0, 0), getLargeImage(track.image));

        RadioManager.addSongToGlobalPlayer(song);
    }


    private buildSimilarSongsSearchUrl(song:Song):string {
        return "http://ws.audioscrobbler.com/2.0/?method=track.getsimilar&artist="
            + song.info.artist + "&track=" + song.info.title + "&api_key=" + lastFmApiKey
            + "&format=json&limit=3";

    }

    private buildSearchUrl(song:string):string {
        return "http://ws.audioscrobbler.com/2.0/?method=track.search&track="
            + song + "&api_key=" + lastFmApiKey + "&format=json&limit=2";
    }

}

class SearchSimilarGenre {

    loadSimilarGenreSongs(genre:string) {
        $.ajax({
            url: this.buildSearchUrl(genre),
            dataType: "json",
            method: "GET",
            success: (res:any) => this.onMainResult(res["results"]["tagmatches"]["tag"])
        })
    }

    private onMainResult(tags:any[]) {
        for (var i = 0; i < tags.length; i++) {
            this.pushMainResult(tags[i]);
        }
    }

    private pushMainResult(tagInfo:any) {
        var tag = new Tag(tagInfo.name);
        this.loadGenreSongs(tag);
    }

    private loadGenreSongs(tag:Tag) {
        $.ajax({
            url: this.buildGenreSearchUrl(tag),
            dataType: "json",
            method: "GET",
            success: (res:any) =>
                this.onGenreResults(res, tag)
        })
    }

    private onGenreResults(res, tag:Tag) {
        this.addGenreSongs(res["toptracks"]["track"], tag);
    }

    private addGenreSongs(tracks, tag:Tag) {
        for (var i = 0; i <  Math.round(20/RadioManager.selectedCriterias.length); i++) {
            this.addGenreSong(tracks[i]);
        }
    }

    private addGenreSong(track) {
        var id = guid(track.mbid, track.name.trim() + track.artist.name.trim());
        var song = new Song(id, new SongInfo(track.name, track.artist.name, null, null, 0, 0, 0), getLargeImage(track.image));

        RadioManager.addSongToGlobalPlayer(song);
    }

    private buildGenreSearchUrl(tag:Tag):string {
        return "http://ws.audioscrobbler.com/2.0/?method=tag.gettoptracks&tag="
            + tag.name + "&api_key=" + lastFmApiKey + "&format=json&limit=3";
    }

    private buildSearchUrl(genre:string):string {
        return "http://ws.audioscrobbler.com/2.0/?method=tag.search&tag="
            + genre + "&api_key=" + lastFmApiKey + "&format=json&limit=2";
    }
}

class SearchSimilarAlbum {

    loadSimilarAlbumSongs(artist:string) {
        $.ajax({
            url: this.buildSearchUrl(artist),
            dataType: "json",
            method: "GET",
            success: (res:any) =>
                this.onMainResult(res["topalbums"]["album"], artist)
        })
    }

    private onMainResult(albums:any[], artist) {
        for (var i = 0; i < albums.length; i++) {
            this.pushMainResult(albums[i], artist);
        }

    }

    private pushMainResult(albumInfo:any, artist) {
        var id = guid(albumInfo.mbid, albumInfo.name.trim());
        var album = new Album(id, new AlbumInfo(albumInfo.name, artist), getExtraLargeImage(albumInfo.image));
        this.loadAlbumSongs(album);
    }


    private loadAlbumSongs(album:Album) {
        $.ajax({
            url: this.buildAlbumSearchUrl(album),
            dataType: "json",
            method: "GET",
            success: (res:any) => {
                this.onAlbumResults(res)
            }
        })
    }

    private onAlbumResults(res) {
        if (res.error == null && res["album"]["tracks"]["track"] != null) {
            var image = getLargeImage(res["album"]["image"]);
            this.addAlbumSongs(res["album"]["tracks"]["track"], image);
        }

    }

    private addAlbumSongs(tracks, image) {
        for (var i = 0; i < 3; i++) {
            this.addAlbumSong(tracks[Math.floor(Math.random() * tracks.length)], image);
        }
    }

    private addAlbumSong(track, image) {
        var id = guid(track.mbid, track.name.trim() + track.artist.name.trim());
        var song = new Song(id, new SongInfo(track.name, track.artist.name, null, null, 0, 0, 0), image);

        RadioManager.addSongToGlobalPlayer(song);
    }


    private buildAlbumSearchUrl(album:Album):string {
        return "http://ws.audioscrobbler.com/2.0/?method=album.getinfo&artist="
            + album.info.artist + "&album=" + album.info.name + "&api_key=" + lastFmApiKey + "&format=json";

    }

    private buildSearchUrl(artist:string):string {
        return "http://ws.audioscrobbler.com/2.0/?method=artist.getTopAlbums&artist="
            + artist + "&api_key=" + lastFmApiKey + "&format=json&limit=2";

    }

}

class SearchCustom {

    loadCustomSearchSongs(inputCustom:string) {
        $.ajax({
            url: this.buildSearchUrl(inputCustom),
            dataType: "json",
            method: "POST",
            success: (res:any) =>{
                this.onMainResult(res["results"]["trackmatches"]["track"])

            }
        })
    }

    buildSearchUrl(tag:string):string {
        return "http://ws.audioscrobbler.com/2.0/?method=track.search&track="
            + tag + "&api_key=" + lastFmApiKey + "&format=json&limit=15";
    }

    private onMainResult(tracks:any[]) {
        for (var i = 0; i < Math.round(20/RadioManager.selectedCriterias.length); i++) {
            this.pushMainResult(tracks[i]);
        }
    }

    private pushMainResult(track:any) {
        var id = guid(track.mbid, track.name.trim() + track.artist.trim());
        var song = new Song(id, new SongInfo(track.name, track.artist, null, null, 0, 0, 0), getLargeImage(track.image));

        RadioManager.addSongToGlobalPlayer(song);
    }
}