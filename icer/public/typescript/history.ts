class HistoryBinder implements SectionBinder {
    private historyManager:HistoryManager;

    buildPage(rootNode:any) {
        this.historyManager = new HistoryManager(rootNode);
        this.historyManager.loadHistory();
    }

    bind() {
    }

    unbind() {

    }


}

class HistoryManager {
    constructor(private rootNode) {
    }

    loadHistory() {

    }

    mockHistory():HistoryPoint[] {

    }
}

class HistoryPoint {
    constructor(listenVolume:number, genres:{ string : SectionBinder; }[], artists:string[]) {
    }

}