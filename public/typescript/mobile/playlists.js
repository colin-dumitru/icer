var PlaylistManager = (function () {
    function PlaylistManager() { }
    PlaylistManager.prototype.bind = function () {
    };
    PlaylistManager.prototype.onAddPlaylistInput = function (query) {
        itemManager.addItem(query, query);
    };
    PlaylistManager.prototype.onPlaylistSelected = function (id, title) {
        this.loadPlaylist(id, title);
    };
    PlaylistManager.prototype.loadPlaylist = function (id, title) {
        titleManager.setTitle(title);
        itemManager.loadContent("/mobile/playlist/" + encodeURIComponent(id), function () {
        });
    };
    return PlaylistManager;
})();
var mPlaylistManager = new PlaylistManager();
//@ sourceMappingURL=playlists.js.map
