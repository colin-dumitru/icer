class RadioBinder implements SectionBinder {
    private radioManager:RadioManager;

    buildPage(rootNode:any) {
        this.radioManager = new RadioManager(rootNode);

        this.radioManager.addCriteria(new RadioCriteriaInput("radioCustomCriteria", true, () => {
            return $("#customCriteriaInput").val();
        }));
        this.radioManager.addCriteria(new RadioCriteriaInput("radioRecentSongsCriteria", false, () => {
            return "Recent Songs";
        }));
        this.radioManager.addCriteria(new RadioCriteriaInput("radioRecentGenresCriteria", false, () => {
            return "Recent Genres";
        }));
        this.radioManager.addCriteria(new RadioCriteriaInput("radioRecentAlbumsCriteria", false, () => {
            return "Recent Albums";
        }));
        this.radioManager.addCriteria(new RadioCriteriaInput("radioPastConcertsCriteria", false, () => {
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

    addCriteria(criteria:RadioCriteriaInput) {
        this.criterias.push(criteria);
    }

    bind() {
        $("#radioAddButtonCell").click(() => {
            this.toggleCriteriasInput();
        })

    }

    private toggleCriteriasInput() {
        this.criterias.forEach((criteria) => {
            $("#" + criteria.id).toggle(300);
        });
    }

}

class RadioCriteriaInput {
    constructor(public id:string, public repeatable:bool, public labelFormatter:() => string) {

    }
}