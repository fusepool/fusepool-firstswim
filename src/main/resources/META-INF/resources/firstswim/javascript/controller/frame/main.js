jQuery(document).ready(function () {

    function initialization(){

        createUI();

        function createUI(){
            enyo.kind({
                name: 'DocumentApp',
                id: 'docApp',
                fit: false,

                create: function(){
                    this.inherited(arguments);
                    this.processGETParameters();
                },

                processGETParameters: function(){
                    // Search
                    var searchWord = GetURLParameter('search')[0];
                    var uncheckedEntities = GetURLParameter('entity');
                    if(!isEmpty(searchWord)){
                        this.$.searchBox.updateInput(searchWord);
                        this.updateUI(searchWord, uncheckedEntities);
                    }
                    // Open Document
                    var openPreview = GetURLParameter('openPreview')[0];
                    if(!isEmpty(openPreview)){
                        this.openDoc(openPreview);
                    }
                },

                components: [
                    {
                        kind: 'SearchBox',
                        name: 'searchBox',
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
                        noBrowserSupportText: 'Please press CTRL + D to save bookmark'
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
                    var searchWord = this.$.dictionaries.getSearchWord();
                    if(!isEmpty(searchWord)){
                        var location = window.location.href;
                        var parametersIndex = location.indexOf('?');
                        if(parametersIndex !== -1){
                            location = location.substr(0, parametersIndex);
                        }
                        
                        var url = location + '?search=' + searchWord;

                        var entities = this.$.dictionaries.getUncheckedEntities();
                        for(var i=0;i<entities.length;i++){
                            url += '&entity=' + entities[i];
                        }

                        var documentURL = this.$.documentOpen.getDocumentURL();
                        if(!isEmpty(documentURL)){
                            url += '&openPreview=' + documentURL;
                        }

                        var title = 'Fusepool';
                        this.$.bookmark.saveBookmark(url, title);
                    } else {
                        this.$.bookmark.saveBookmark();
                    }
                },

                updateUI: function(searchWord, uncheckedEntities){
                    if(!isEmpty(searchWord)){
                        this.search(searchWord, uncheckedEntities);
                    }
                },

                openDoc: function(url){
                    this.$.documentOpen.openDoc(url);
                },

                search: function(searchWord, uncheckedEntities){
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
                        this.processSearchResponse(inResponse, searchWord, uncheckedEntities);
                    });
                },

                processSearchResponse: function(searchResponse, searchWord, uncheckedEntities){
                    var rdf = this.createRdfObject(searchResponse);
                    this.updateEntityList(rdf, searchWord, uncheckedEntities);
                    if(isEmpty(uncheckedEntities) || uncheckedEntities.length === 0){
                        this.updateDocumentList(rdf);
                    }
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

                updateEntityList: function(rdf, searchWord, uncheckedEntities){
                    // categories
                    var categories = [];
                    rdf.where('?s <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> ?o').each(function(){
                        var value = this.o.value + '';
                        if(value.indexOf('#') === -1){
                            categories.push({ entity: this.s.value, value: value });
                        }
                    });

                    var groupVars = _.groupBy(categories, function(val){ return val.value; });
                    var sortedGroup = _.sortBy(groupVars, function(val){ return -val.length; });

                    var dictionaries = [];
                    for(var i=0;i<sortedGroup.length;i++){
                        // One category
                        var category = sortedGroup[i];
                        if(category.length > 0){
                            var categoryText = replaceAll(category[0].value, '_', ' ');
                            var categoryName = categoryText.substr(categoryText.lastIndexOf('/')+1);

                            var entities = [];
                            for(var j=0;j<category.length;j++){
                                this.deteleLaterEntities(sortedGroup, category[j].entity, i);
                                // Entity
                                var entityText = replaceAll(category[j].entity + '', '_', ' ');
                                var entityName = entityText.substr(entityText.lastIndexOf('/')+1);

                                entities.push(entityName);
                            }
                            dictionaries.push({ name: categoryName, entities: entities });
                        }
                    }
                    var dictionaryObject = { searchWord: searchWord, uncheckedEntities: uncheckedEntities, dictionaries: dictionaries };
                    this.$.dictionaries.updateList(dictionaryObject);
                },

                deteleLaterEntities: function(array, entity, fromIndex){
                    for(var i=fromIndex+1;i<array.length;i++){
                        var category = array[i];
                        for(var j=0;j<category.length;j++){
                            if(category[j].entity === entity){
                                array[i].splice(j, 1);
                                j--;
                            }
                        }
                    }
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
});