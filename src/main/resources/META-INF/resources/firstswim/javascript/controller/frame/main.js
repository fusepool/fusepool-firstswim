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
                    {
                        name: 'bookmark',
                        kind: 'Bookmark',
                        buttonClass: 'bookmarkButton',
                        parentTapFunction: 'generateBMUrl',
                        noBrowserSupportText: 'This browser not support bookmarks!'
                    },
                    {
                        kind: 'DictionaryList',
                        classes: 'dictionaryList',
                        name: 'dictionaries',
                        dictionaryTitle: 'Dictionaries',
                        noContentLabel: 'No data available',
                        titleClass: 'dictionariesMainTitle'
                    },
                    {
                        kind: 'DocumentList',
                        name: 'documents',
                        classes: 'documentList',
                        titleClass: 'documentsMainTitle',
                        titleContent: 'Documents',
                        noDataLabel: 'No data available'
                    },
                    {
                        kind: 'DocumentInOpen',
                        name: 'documentOpen',
                        classes: 'documentInOpen'
                    }
                ],

                generateBMUrl: function(){
                    this.$.bookmark.saveBookmark('test.com', 'This is test');
                },

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