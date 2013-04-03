window.onload = function () {

    function initialization(){

        createUI();

        function createUI(){
            enyo.kind({
                name: 'DocumentApp',
                id: 'docApp',
                fit: false,
                components: [
                    { kind: 'SearchBox' },
                    { kind: 'Bookmark' },
                    { kind: 'DictionaryList' }
//                    { kind: 'DocumentList' },
//                    { kind: 'Document' }
                ]
            });
            new DocumentApp().renderInto(document.body);
        }
    }

    try {
        initialization();
    } catch(e) {
        console.log(e);
    }
};