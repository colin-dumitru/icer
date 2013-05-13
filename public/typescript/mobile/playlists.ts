declare var $;


class PlaylistManager {


    bind() {

    }

    onAddPlaylistInput(query:string) {
        itemManager.addItem(query, query);
        //add playlist
    }

    onPlaylistSelected(id:string, title:string) {
        this.loadPlaylist(id, title);
    }

    private loadPlaylist(id:string, title:string) {
        titleManager.setTitle(title);
        itemManager.loadContent("/mobile/playlist/" + encodeURIComponent(id), () => {
            //on playlist load
        });
    }
}
var mPlaylistManager = new PlaylistManager();
