class RadioBinder implements SectionBinder {
    private radioManager:RadioManager;

    buildPage(rootNode:any) {
        this.radioManager = new RadioManager(rootNode);

        this.radioManager.addCriteriaInput(new RadioCriteriaInput("radioCustomCriteria", true, () => {
            return $("#customCriteriaInput").val();
        }));
        this.radioManager.addCriteriaInput(new RadioCriteriaInput("radioRecentSongsCriteria", false, () => {
            return "Recent Songs";
        }));
        this.radioManager.addCriteriaInput(new RadioCriteriaInput("radioRecentGenresCriteria", false, () => {
            return "Recent Genres";
        }));
        this.radioManager.addCriteriaInput(new RadioCriteriaInput("radioRecentAlbumsCriteria", false, () => {
            return "Recent Albums";
        }));
        this.radioManager.addCriteriaInput(new RadioCriteriaInput("radioPastConcertsCriteria", false, () => {
            return "Past Concerts";
        }));

        this.radioManager.bind();
    }

    bind() {
    }

    unbind() {

    }
}

class RadioManager {
    private criterias:RadioCriteriaInput[] = [];

    constructor(rootNode:any) {

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

        tr.find("#radioCriteriaCloseButton").click(() => {
            tr.remove();
            $("#" + criteriaInput.id).show();
        })
    }

    bind() {
        $("#radioAddButtonCell").click(() => {
            $("#radioCriteriaContainer").slideToggle(300);
        })
        $("#radioManagerClearButton").click(() => {
            $("#radioCriteriaTableBody").empty();
            this.criterias.forEach((criteria) => {
                $("#" + criteria.id).show();
            });
        });
    }

}

class RadioCriteriaInput {
    constructor(public id:string, public repeatable:bool, public labelFormatter:() => string) {

    }
}