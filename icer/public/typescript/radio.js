var RadioBinder = (function () {
    function RadioBinder() {
    }

    RadioBinder.prototype.buildPage = function (rootNode) {
        this.radioManager = new RadioManager(rootNode);
        this.radioManager.addCriteria(new RadioCriteriaInput("radioCustomCriteria", true, function () {
            return $("#customCriteriaInput").val();
        }));
        this.radioManager.addCriteria(new RadioCriteriaInput("radioRecentSongsCriteria", false, function () {
            return "Recent Songs";
        }));
        this.radioManager.addCriteria(new RadioCriteriaInput("radioRecentGenresCriteria", false, function () {
            return "Recent Genres";
        }));
        this.radioManager.addCriteria(new RadioCriteriaInput("radioRecentAlbumsCriteria", false, function () {
            return "Recent Albums";
        }));
        this.radioManager.addCriteria(new RadioCriteriaInput("radioPastConcertsCriteria", false, function () {
            return "Past Concerts";
        }));
        this.radioManager.bind();
    };
    RadioBinder.prototype.bind = function () {
    };
    RadioBinder.prototype.unbind = function () {
    };
    return RadioBinder;
})();
var RadioManager = (function () {
    function RadioManager(rootNode) {
        this.criterias = [];
    }

    RadioManager.prototype.addCriteria = function (criteria) {
        this.criterias.push(criteria);
    };
    RadioManager.prototype.bind = function () {
        var _this = this;
        $("#radioAddButtonCell").click(function () {
            _this.toggleCriteriasInput();
        });
    };
    RadioManager.prototype.toggleCriteriasInput = function () {
        this.criterias.forEach(function (criteria) {
            $("#" + criteria.id).toggle(300);
        });
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
