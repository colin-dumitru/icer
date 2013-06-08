declare var $;
declare var lastFmApiKey;

class MobileRadioManager {
    private itemContent;

    pushCriteria(criteria:{id:string; content:string;}) {
        var item = this.buildCriteriaItem(criteria);
        this.bindCriteriaItem(item);
        this.itemContent.append(item);

        if (criteria.id != "custom") {
            itemManager.deleteItem(criteria.id);
        }
    }

    private bindCriteriaItem(item) {
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
    }

    private startMoveOption(item) {
        item.css({
            WebkitTransition: "",
            transition: ""
        });
    }

    private stopMoveOption(item) {
        if (item.position().left <= 0 - 3 * window.innerWidth / 4) {
            item.remove();
            if (item.attr("criteriaId") != "custom") {
                itemManager.addItem(item.attr("criteriaId"), item.attr("criteriaContent"));
            }
        } else {
            this.cancelDelete(item);
        }
    }

    private cancelDelete(item) {
        item.css({
            WebkitTransition: "-webkit-transform 0.4s ease",
            transition: "transform 0.4s ease",
            transform: "translate3d(0,0,0)"
        });
    }

    private buildCriteriaItem(criteria:{id:string; content:string;}) {
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
    }

    private getImageForCriteria(id:string):string {
        return {
            "recent_songs": "assets/images/criteria_songs.png",
            "recent_albums": "assets/images/criteria_albums.png",
            "recent_genres": "assets/images/criteria_genre.png",
            "custom": "assets/images/criteria_custom.png"
        }[id];
    }

    bind() {
        this.itemContent = $("#itemContent");

        this.appendPlayButton();
    }

    private appendPlayButton() {
        var button = $("<div></div>");
        button.attr("id", "radioPlayButton");
        button.text("Play");

        this.bindPlayButton(button);

        this.itemContent.append(button);
    }

    private bindPlayButton(item) {
        item.click(() => {
            globalPlaylistManager.pausePlayingSong();
            this.buildRadio();
        });
    }

    private buildRadio() {
        var criteria:{id:string; content:string;}[] = [];
        $(".criteriaContainer").each(function () {
            criteria.push({id: $(this).attr("criteriaId"), content: $(this).attr("criteriaContent")});
        });
        $.ajax({
            url: "/mobile/radio/build",
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            data: JSON.stringify(criteria),
            type: "POST",
            success: (data) => {
                this.pushSongs(data);
            }
        });
    }

    private pushSongs(songs:any[]) {
        globalPlaylistManager.pushSongs(songs.map((item) => {
            return new MSong(item["mbid"], item["title"], item["artist"], item["genre"], item["imageUrl"])
        }));
        globalPlaylistManager.resumePlayingSong(null);
    }

}
var mRadioManager = new MobileRadioManager();



