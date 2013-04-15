window.onload = function () {

    function initialization(){

        createUI();

        function createUI(){
            enyo.kind({
                name: 'DocumentApp',
                id: 'docApp',
                fit: false,
                components: [
                    {
                        kind: 'SearchBox',
                        placeholder: 'Search in documents',
                        inputFrameClass: 'categoryLabel',
                        buttonClass: 'searchButton',
                        buttonContent: 'OK',
                        searchIconClass: 'searchImage',
                        parentSeachFunction: 'updateUI'
                    },
                    { kind: 'Bookmark' },
                    { kind: 'DictionaryList', name: 'dictionaries' },
                    { kind: 'DocumentList', name: 'documents' },
                    { kind: 'DocumentInOpen', name: 'documentOpen' }
                ],

                updateUI: function(){
                    this.$.dictionaries.updateList(this.createFakeDictionaries());
                    this.$.documents.updateList(this.createFakeDocuments());
                },

                openDoc: function(documentId){
                    this.$.documentOpen.openDoc(documentId);
                },

                createFakeDictionaries: function(){
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
                },

                createFakeDocuments: function(){
                    var list = [];

                    var object = {};
                    object.id = 'AAAAAA1';
                    object.shortContent = 'This is the sort content of document1';
                    list.push(object);

                    var object2 = {};
                    object2.id = 'BBBBBB2';
                    object2.shortContent = 'This is the other short content of another document';
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