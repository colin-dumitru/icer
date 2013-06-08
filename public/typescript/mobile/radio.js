var MobileRadioManager = (function () {
    function MobileRadioManager() { }
    MobileRadioManager.prototype.pushCriteria = function (criteria) {
        var item = this.buildCriteriaItem(criteria);
        this.bindCriteriaItem(item);
        this.itemContent.append(item);
        if(criteria.id != "custom") {
            itemManager.deleteItem(criteria.id);
        }
    };
    MobileRadioManager.prototype.bindCriteriaItem = function (item) {
        var _this = this;
        item.draggable({
            axis: "x",
            handle: ".criteriaOption",
            start: function () {
                _this.startMoveOption(item);
            },
            stop: function () {
                _this.stopMoveOption(item);
            }
        });
    };
    MobileRadioManager.prototype.startMoveOption = function (item) {
        item.css({
            WebkitTransition: "",
            transition: ""
        });
    };
    MobileRadioManager.prototype.stopMoveOption = function (item) {
        if(item.position().left <= 0 - 3 * window.innerWidth / 4) {
            item.remove();
            if(item.attr("criteriaId") != "custom") {
                itemManager.addItem(item.attr("criteriaId"), item.attr("criteriaContent"));
            }
        } else {
            this.cancelDelete(item);
        }
    };
    MobileRadioManager.prototype.cancelDelete = function (item) {
        item.css({
            WebkitTransition: "-webkit-transform 0.4s ease",
            transition: "transform 0.4s ease",
            transform: "translate3d(0,0,0)"
        });
    };
    MobileRadioManager.prototype.buildCriteriaItem = function (criteria) {
        var container = $("<div></div>");
        container.attr("criteriaId", criteria.id);
        container.attr("criteriaContent", criteria.content);
        container.addClass("criteriaContainer");
        var imageContainer = $("<img></img>");
        imageContainer.attr("src", this.getImageForCriteria(criteria.id));
        imageContainer.addClass("criteriaImage");
        container.append(imageContainer);
        var labelContainer = $("<div></div>");
        labelContainer.text(criteria.content);
        labelContainer.addClass("criteriaLabel");
        container.append(labelContainer);
        var optionContainer = $("<div></div>");
        optionContainer.addClass("criteriaOption");
        container.append(optionContainer);
        return container;
    };
    MobileRadioManager.prototype.getImageForCriteria = function (id) {
        return {
            "recent_songs": "assets/images/criteria_songs.png",
            "recent_albums": "assets/images/criteria_albums.png",
            "recent_genres": "assets/images/criteria_genre.png",
            "custom": "assets/images/criteria_custom.png"
        }[id];
    };
    MobileRadioManager.prototype.bind = function () {
        this.itemContent = $("#itemContent");
        this.appendPlayButton();
    };
    MobileRadioManager.prototype.appendPlayButton = function () {
        var button = $("<div></div>");
        button.attr("id", "radioPlayButton");
        button.text("Play");
        this.bindPlayButton(button);
        this.itemContent.append(button);
    };
    MobileRadioManager.prototype.bindPlayButton = function (item) {
        var _this = this;
        item.click(function () {
            globalPlaylistManager.pausePlayingSong();
            _this.buildRadio();
        });
    };
    MobileRadioManager.prototype.buildRadio = function () {
        var _this = this;
        var criteria = [];
        $(".criteriaContainer").each(function () {
            criteria.push({
                id: $(this).attr("criteriaId"),
                content: $(this).attr("criteriaContent")
            });
        });
        $.ajax({
            url: "/mobile/radio/build",
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            data: JSON.stringify(criteria),
            type: "POST",
            success: function (data) {
                _this.pushSongs(data);
            }
        });
    };
    MobileRadioManager.prototype.pushSongs = function (songs) {
        globalPlaylistManager.pushSongs(songs.map(function (item) {
            return new MSong(item["mbid"], item["title"], item["artist"], item["genre"], item["imageUrl"]);
        }));
        globalPlaylistManager.resumePlayingSong(null);
    };
    return MobileRadioManager;
})();
var mRadioManager = new MobileRadioManager();
//@ sourceMappingURL=radio.js.map
