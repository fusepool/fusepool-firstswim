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
                    { kind: 'DictionaryList', name: 'dictionaries' }
//                    { kind: 'DocumentList' },
//                    { kind: 'Document' }
                ],

                updateUI: function(){
                    var list = this.createFakeData();
                    this.$.dictionaries.updateList(list);
                },

                createFakeData: function(){
                    var list = [];

                    var object = {};
                    object.name = 'LTE';
                    object.entities = ['4G', 'mobile', 'wireless'];
                    list.push(object);

                    var object2 = {};
                    object2.name = 'Diseases';
                    object2.entities = ['Multiple Sclerosis', 'Scleroderma'];
                    list.push(object2);

                    return list;
                }
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