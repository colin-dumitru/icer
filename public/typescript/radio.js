var RadioBinder = (function () {
    function RadioBinder() {
    }

    RadioBinder.prototype.buildPage = function (rootNode) {
        this.radioManager = new RadioManager(rootNode);
        this.radioManager.addCriteriaInput(new RadioCriteriaInput("radioCustomCriteria", true, function () {
            return $("#customCriteriaInput").val();
        }));
        this.radioManager.addCriteriaInput(new RadioCriteriaInput("radioRecentSongsCriteria", false, function () {
            return "Recent Songs";
        }));
        this.radioManager.addCriteriaInput(new RadioCriteriaInput("radioRecentGenresCriteria", false, function () {
            return "Recent Genres";
        }));
        this.radioManager.addCriteriaInput(new RadioCriteriaInput("radioRecentAlbumsCriteria", false, function () {
            return "Recent Albums";
        }));
        this.radioManager.addCriteriaInput(new RadioCriteriaInput("radioPastConcertsCriteria", false, function () {
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

    RadioManager.prototype.addCriteriaInput = function (criteria) {
        var _this = this;
        this.criterias.push(criteria);
        $("#" + criteria.id).click(function () {
            var criteriaTitle = criteria.labelFormatter();
            if (!criteria.repeatable) {
                $("#" + criteria.id).hide();
            }
            _this.addCriteria(criteriaTitle, criteria);
            $("#radioCriteriaContainer").hide(300);
        });
    };
    RadioManager.prototype.addCriteria = function (criteria, criteriaInput) {
        var criteriaTemplate = template("#radioCriteriaTemplate", criteria);
        var tr = $("<tr></tr>").addClass("radioCriteriaCell").append(criteriaTemplate);
        $("#radioCriteriaTableBody").append(tr);
        tr.find("#radioCriteriaCloseButton").click(function () {
            tr.remove();
            $("#" + criteriaInput.id).show();
        });
    };
    RadioManager.prototype.bind = function () {
        var _this = this;
        $("#radioAddButtonCell").click(function () {
            $("#radioCriteriaContainer").slideToggle(300);
        });
        $("#radioManagerClearButton").click(function () {
            $("#radioCriteriaTableBody").empty();
            _this.criterias.forEach(function (criteria) {
                $("#" + criteria.id).show();
            });
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
