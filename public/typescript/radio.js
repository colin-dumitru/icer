var customSearchValues = [];
var RadioBinder = (function () {
    function RadioBinder() { }
    RadioBinder.prototype.buildPage = function (rootNode) {
        this.radioManager = new RadioManager(rootNode);
        this.criteriaSongs = new RadioCriteriaInput("recent_songs", false, function () {
            return "Recent Songs";
        });
        this.criteriaAlbums = new RadioCriteriaInput("recent_albums", false, function () {
            return "Recent Albums";
        });
        this.criteriaGenres = new RadioCriteriaInput("recent_genres", false, function () {
            return "Recent Genres";
        });
        this.criteriaCustom = new RadioCriteriaInput("custom", true, function () {
            return $("#customCriteriaInput").val();
        });
        this.radioManager.addCriteriaInput(this.criteriaCustom);
        this.radioManager.addCriteriaInput(this.criteriaSongs);
        this.radioManager.addCriteriaInput(this.criteriaGenres);
        this.radioManager.addCriteriaInput(this.criteriaAlbums);
        this.radioManager.bind();
    };
    RadioBinder.prototype.bind = function () {
        var _this = this;
        var _this = this;
        $("#radioManagerResetButton").click(function () {
            $("#radioCriteriaTableBody").empty();
            _this.radioManager.addCriteriaToReset(_this.criteriaSongs);
            _this.radioManager.addCriteriaToReset(_this.criteriaAlbums);
        });
        $("#customCriteriaInput").keypress(function (event) {
            if(event.which == 13) {
                $("#radioCriteriaContainer").hide(300);
                _this.radioManager.addCriteria(_this.criteriaCustom.labelFormatter(), _this.criteriaCustom);
            }
        });
    };
    RadioBinder.prototype.unbind = function () {
    };
    return RadioBinder;
})();
var RadioManager = (function () {
    function RadioManager(rootNode) {
        this.criteria = [];
        this.selectedCriteria = [];
    }
    RadioManager.prototype.addCriteriaInput = function (criteria) {
        var _this = this;
        this.criteria.push(criteria);
        $("#radio_" + criteria.id).click(function () {
            var criteriaTitle = criteria.labelFormatter();
            if(!criteria.repeatable) {
                $("#radio_" + criteria.id).hide();
            }
            _this.addCriteria(criteriaTitle, criteria);
            $("#radioCriteriaContainer").hide(300);
        });
    };
    RadioManager.prototype.addCriteria = function (criteria, criteriaInput) {
        var _this = this;
        var criteriaTemplate = template("#radioCriteriaTemplate", criteria);
        var tr = $("<tr></tr>").addClass("radioCriteriaCell").append(criteriaTemplate);
        $("#radioCriteriaTableBody").append(tr);
        tr.find("#radioCriteriaCloseButton").click(function () {
            tr.remove();
            $("#radio_" + criteriaInput.id).show();
            _this.deleteCriteria(criteriaInput);
        });
        this.selectedCriteria.push({
            id: criteriaInput.id,
            content: criteria
        });
    };
    RadioManager.prototype.addCriteriaToReset = function (criteria) {
        $("#radio_" + criteria.id).hide();
        var criteriaTitle = criteria.labelFormatter();
        this.addCriteria(criteriaTitle, criteria);
    };
    RadioManager.prototype.deleteCriteria = function (criteriaInput) {
        var toRemove = this.selectedCriteria.filter(function (c) {
            return c.id == criteriaInput.id;
        })[0];
        this.selectedCriteria.splice(this.selectedCriteria.indexOf(toRemove), 1);
    };
    RadioManager.prototype.bind = function () {
        var _this = this;
        $("#radioAddButtonCell").click(function () {
            $("#radioCriteriaContainer").slideToggle(300);
        });
        $("#radioManagerClearButton").click(function () {
            $("#radioCriteriaTableBody").empty();
            _this.criteria.forEach(function (criteria) {
                $("#radio_" + criteria.id).show();
                _this.selectedCriteria = [];
            });
        });
        $("#radioManagerPlayButton").click(function () {
            globalPlaylistManager.clearSongs();
            _this.loadRadio();
        });
    };
    RadioManager.prototype.loadRadio = function () {
        var _this = this;
        $.ajax({
            url: "/mobile/radio/build",
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            data: JSON.stringify(this.selectedCriteria),
            type: "POST",
            success: function (data) {
                _this.pushSongs(data);
            }
        });
    };
    RadioManager.prototype.pushSongs = function (songs) {
        globalPlaylistManager.pushSongs(songs.map(function (item) {
            return new Song(item["mbid"], new SongInfo(item["title"], item["artist"], null, null, 0, 0, 0), item["imageUrl"]);
        }));
        globalPlaylistManager.play();
    };
    return RadioManager;
})();
var RadioCriteriaInput = (function () {
    function RadioCriteriaInput(id, repeatable, labelFormatter) {
        this.id = id;
        this.repeatable = repeatable;
        this.labelFormatter = labelFormatter;
    }
    return RadioCriteriaInput;
})();
//@ sourceMappingURL=radio.js.map
