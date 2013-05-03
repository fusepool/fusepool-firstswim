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

                updateUI: function(searchWord){
                    if(searchWord != ''){
                        this.search(searchWord);
                        this.$.dictionaries.updateList(this.createFakeDictionaries());
                        this.$.documents.updateList(this.createFakeDocuments());
                    }
                },

                openDoc: function(documentId){
                    this.$.documentOpen.openDoc(documentId);
                },

                search: function(searchWord){
                    var request = new enyo.Ajax({
                        method: 'GET',
                        url: 'http://platform.fusepool.info/ecs/'
                    });
                    request.go({
                        header_Accept: 'application/rdf+xml',
                        search: searchWord
                    });
                    request.response(this, function(inSender, inResponse) {
                        this.processSearchResponse(inResponse);
                    });
                },

                processSearchResponse: function(searchResponse){
                    // Delete rows, which contains long type (it causes error)
                    var textArray = searchResponse.split("\n");
                    var newText = "";
                    for(var i=0;i<textArray.length;i++){
                        if(textArray[i].indexOf("http://www.w3.org/2001/XMLSchema#long") === -1){
                            newText += textArray[i] + "\n";
                        }
                    }
                    // Convert rdf text to rdf object
                    var parsedData = new DOMParser().parseFromString(newText, 'text/xml' );

                    var rdf = jQuery.rdf();
                    rdf.load(parsedData, {});
                    rdf.databank.namespaces = { 
                        dbpedia: 'http://dbpedia.org/resource/',
                        label: 'http://www.w3.org/2000/01/rdf-schema#label',
                        comment: 'http://www.w3.org/2000/01/rdf-schema#comment',
                        subject: 'http://purl.org/dc/terms/subject',
                        category: 'http://dbpedia.org/resource/Category'
                    };

                    // all data
//                    rdf.where('?p ?s ?o').each(function(){
//                        console.log(this.p.value + ' ' + this.s.value + ' ' + this.o.value);
//                    });

                    // only South Korea
//                    rdf.where('dbpedia:South_Korea ?s ?o').each(function(){
//                        console.log(this.s.value + ' ' + this.o.value);
//                    });

                    // only descriptions
                    rdf.where('?p comment: ?o').each(function(){
                        console.log(this.o.value);
                        console.log('---------------------------------');
                    });
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