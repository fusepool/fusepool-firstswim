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
                    if(!isEmpty(searchWord)){
                        this.search(searchWord);
                    }
                },

                openDoc: function(url){
                    this.$.documentOpen.openDoc(url);
                },

                search: function(searchWord){
                    var request = new enyo.Ajax({
                        method: 'GET',
                        url: 'http://platform.fusepool.info/ecs/',
                        handleAs: 'text',
                        headers: { Accept: 'application/rdf+xml' }
                    });
                    request.go({
                        search: searchWord
                    });
                    request.response(this, function(inSender, inResponse) {
                        this.processSearchResponse(inResponse, searchWord);
                    });
                },

                processSearchResponse: function(searchResponse, searchWord){
                    var rdf = this.createRdfObject(searchResponse);
                    this.updateEntityList(rdf, searchWord);
                    this.updateDocumentList(rdf);
                },

                entityFilter: function(searchResponse){
                    var rdf = this.createRdfObject(searchResponse);
                    this.updateDocumentList(rdf);
                },

                createRdfObject: function(searchResponse){
                    // Delete rows, which contains long type (it causes error)
                    var textArray = searchResponse.split('\n');
                    var newText = '';
                    for(var i=0;i<textArray.length;i++){
                        if(textArray[i].indexOf('http://www.w3.org/2001/XMLSchema#long') === -1){
                            newText += textArray[i] + '\n';
                        }
                    }
                    // Convert rdf text to rdf object
                    var parsedData = new DOMParser().parseFromString(newText, 'text/xml' );

                    var rdf = jQuery.rdf();
                    rdf.load(parsedData, {});
                    return rdf;
                },

                updateEntityList: function(rdf, searchWord){
                    // entities
                    var entities = [];
                    rdf.where('?s <http://www.w3.org/2000/01/rdf-schema#label> ?o').each(function(){
                        if(this.o.lang === 'en'){
                            var entity = this.o.value.substring(1, this.o.value.length-1);
                            entities.push(entity);
                        }
                    });
                    var obj = [ { searchWord: searchWord, name: '', entities: entities} ];
                    this.$.dictionaries.updateList(obj);
                },

                updateDocumentList: function(rdf){
                    // documents :)
                    var documents = [];
                    rdf.where('?s <http://fusepool.eu/ontologies/ecs#textPreview> ?o').each(function(){
                        documents.push({ url: this.s.value, shortContent:  this.o.value});
                    });
                    this.$.documents.updateList(documents);
                }

            });
            new DocumentApp().renderInto(document.getElementById('main'));
        }
    }

    try {
        initialization();
    } catch(e) {
        console.log(e);
    }
};