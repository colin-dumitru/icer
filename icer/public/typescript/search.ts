class SearchBinder implements SectionBinder {
    private rootNode:any;
    private searchSessions:SearchSession[];

    buildPage(rootNode:any) {
        this.rootNode = rootNode;
    }

    bind() {

    }

    unbind() {

    }

}

class SearchSession {
    constructor(public id:string, public title:string) {
    }
}