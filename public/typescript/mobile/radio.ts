declare var $;

class MobileRadioManager {

    public recentMSongs:MSong[] = [];
    public playingMSongs:MSong[] = [];

    public static getLargeImage(images):string {
        if (images == null) {
            return "/assets/images/logo.gif";
        }
        for (var i = 0; i < images.length; i++) {
            if (images[i].size == "medium") {
                return images[i]["#text"];
            }
        }
        return "/assets/images/logo.gif";
    }

    public static getExtraLargeImage(images):string {
        if (images == null) {
            return "/assets/images/logo.gif";
        }
        for (var i = 0; i < images.length; i++) {
            if (images[i].size == "extralarge") {
                return images[i]["#text"];
            }
        }
        return "/assets/images/logo.gif";
    }

    public static guid(mbid:string, seed:string):string {
        if (mbid == null || mbid.length != 36) {
            return md5(seed);
        } else {
            return mbid;
        }
    }

    public loadRecentSongs(id:string) {
        $.ajax("/radio/songs/", {
            type: "POST",
            dataType: "json",
            success: data => {
                this.onSongResult(data)
                this.loadRadio(id);
            }
        });
    }

    public onSongResult(data) {
        this.recentMSongs = [];
        for (var i = 0; i < data.length; i++) {
            var song = new MSong(data[i].mbid, data[i].title, data[i].artist, data[i].genre, data[i].imageUrl);
            this.recentMSongs.push(song);
        }
    }


    loadRadio(id:string)
    {
        globalPlaylistManager.clearSongs();
        this.playingMSongs = [];
        switch (id) {

            case "RecentGenres": {
                titleManager.setTitle("Recent Genres");
                for (var j = 0; j < this.recentMSongs.length; j++) {
                    if (this.recentMSongs[j].genre != null) {
                        new SearchSimilarGenre().loadSimilarGenreSongs(this.recentMSongs[j].genre);
                    }
                }
                break;
            }

            case "RecentSongs": {
                titleManager.setTitle("Recent Songs");
                for (var j = 0; j < this.recentMSongs.length; j++) {
                    new SearchSimilarSongs().loadSimilarSongs(this.recentMSongs[j].title);
                }
                break;
            }

            case "RecentAlbums": {
                titleManager.setTitle("Recent Albums");
                for (var j = 0; j < this.recentMSongs.length; j++) {
                    new SearchSimilarAlbum().loadSimilarAlbumSongs(this.recentMSongs[j].artist);
                }
                break;
            }

            default:  {
                new SearchCustom().loadCustomSearchSongs(id);
                break;
            }
        }

    }

    addSongToGlobalPlayer(song:MSong)
    {
        if (this.playingMSongs.filter(e => e.mbid == song.mbid).length == 0) {
            globalPlaylistManager.pushSong(song);
            this.playingMSongs.push(song);
        }
    }

    onSearchSelected(id:string) {
        this.loadRecentSongs(id);
    }

}
var mRadioManager = new MobileRadioManager();


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

    private addGenreSongs(tracks:any[], tag:Tag) {
        for (var i = 0; i < 3; i++) {
            this.addGenreSong(tracks[i]);
        }
    }

    private addGenreSong(track:any) {
        var id = MobileRadioManager.guid(track.mbid, track.name.trim() + track.artist.name.trim());
        var song = new MSong(id, track.name, track.artist.name, null, MobileRadioManager.getLargeImage(track.image));
        mRadioManager.addSongToGlobalPlayer(song);

    }

    private buildGenreSearchUrl(tag:Tag):string {
        return "http://ws.audioscrobbler.com/2.0/?method=tag.gettoptracks&tag="
            + tag.name + "&api_key=" + lastFmApiKey + "&format=json&limit=5";
    }

    private buildSearchUrl(genre:string):string {
        return "http://ws.audioscrobbler.com/2.0/?method=tag.search&tag="
            + genre + "&api_key=" + lastFmApiKey + "&format=json&limit=2";
    }
}


class SearchSimilarAlbum {

    public loadSimilarAlbumSongs(artist:string) {
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
        var id = MobileRadioManager.guid(albumInfo.mbid, albumInfo.name.trim());
        var album = new Album(id, new AlbumInfo(albumInfo.name, artist), MobileRadioManager.getExtraLargeImage(albumInfo.image));
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
            var image = MobileRadioManager.getLargeImage(res["album"]["image"]);
            this.addAlbumSongs(res["album"]["tracks"]["track"], image);
        }

    }

    private addAlbumSongs(tracks, image) {
        for (var i = 0; i < 3; i++) {
            this.addAlbumSong(tracks[Math.floor(Math.random() * tracks.length)], image);
        }
    }

    private addAlbumSong(track, image) {
        var id = MobileRadioManager.guid(track.mbid, track.name.trim() + track.artist.name.trim());
        var song = new MSong(id, track.name, track.artist.name, null, image);
        mRadioManager.addSongToGlobalPlayer(song);
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
        var id = MobileRadioManager.guid(track.mbid, track.name.trim() + track.artist.trim());
        var song = new Song(id, new SongInfo(track.name, track.artist, null, null, 0, 0, 0), MobileRadioManager.getExtraLargeImage(track.image));
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
        var id = MobileRadioManager.guid(track.mbid, track.name.trim() + track.artist.name.trim());
        var song = new MSong(id, track.name, track.artist.name, null, MobileRadioManager.getLargeImage(track.image));
        mRadioManager.addSongToGlobalPlayer(song);
    }


    private buildSimilarSongsSearchUrl(song:Song):string {
        return "http://ws.audioscrobbler.com/2.0/?method=track.getsimilar&artist="
            + song.info.artist + "&track=" + song.info.title + "&api_key=" + lastFmApiKey
            + "&format=json&limit=5";

    }

    private buildSearchUrl(song:string):string {
        return "http://ws.audioscrobbler.com/2.0/?method=track.search&track="
            + song + "&api_key=" + lastFmApiKey + "&format=json&limit=2";
    }

}


class SearchCustom {

    loadCustomSearchSongs(inputCustom:string) {
        $.ajax({
            url: this.buildSearchUrl(inputCustom),
            dataType: "json",
            method: "POST",
            success: (res:any) => {
                globalPlaylistManager.clearSongs();
                this.onMainResult(res["results"]["trackmatches"]["track"])

            }
        })
    }

    buildSearchUrl(tag:string):string {
        return "http://ws.audioscrobbler.com/2.0/?method=track.search&track="
            + tag + "&api_key=" + lastFmApiKey + "&format=json&limit=20";
    }

    private onMainResult(tracks:any[]) {
        for (var i = 0; i < tracks.length; i++) {
            this.pushMainResult(tracks[i]);
        }
    }

    private pushMainResult(track:any) {
        var id = MobileRadioManager.guid(track.mbid, track.name.trim() + track.artist.trim());
        var song = new MSong(id, track.name, track.artist, null, MobileRadioManager.getLargeImage(track.image));
        mRadioManager.addSongToGlobalPlayer(song);
    }
}


class Song {
    constructor(public mbid:string, public info:SongInfo, public imageUrl:string) {
    }
}

class SongInfo {
    constructor(public title:string, public artist:string, public album:string, public genre:string, public peek:number, public weeksOnTop:number, public positionChange:number) {
    }
}

class Artist {
    constructor(public mbid:string, public info:ArtistInfo, public imageUrl:string) {
    }
}

class ArtistInfo {
    constructor(public name:string) {
    }
}

class Album {
    constructor(public mbid:string, public info:AlbumInfo, public imageUrl:string) {
    }
}

class AlbumInfo {
    constructor(public name:string, public artist:string) {
    }
}

class Tag {
    constructor(public name:string) {
    }
}




