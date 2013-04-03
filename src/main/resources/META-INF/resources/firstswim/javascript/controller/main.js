window.onload = function () {

    function initialization(){

        createUI();

        function createUI(){
            enyo.kind({
                name: 'DocumentApp',
                id: 'docApp',
                components: [
                    { kind: 'SearchBox' }
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