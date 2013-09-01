jQuery(document).ready(function () {

    function initialization(){

        createUI();
        enyo.Scroller.touchScrolling=true;

        /*
         * This function create the user interface with the all components
         */
        function createUI(){

           /**
            * @class DocumentMobileApp
            */
            enyo.kind(
            /** @lends DocumentMobileApp.prototype */
            {
                name: 'DocumentMobileApp',
                kind: enyo.Control,
                layoutKind: 'FittableRowsLayout',

                create: function(){
                    this.inherited(arguments);
                    renderTemplateDiv();
                    this.processGETParameters();
                },

                published: {
                    searchWord: '',
                    checkedEntities: [],
                    lang: 'en'
                },

                components: [
                    { kind: 'Panels', name: 'panels', fit: true, arrangerKind: 'CollapsingArranger', components: [
                        {
                            kind: 'LeftPanel',
                            name: 'leftPanel',
                            classes: 'leftPanel',
                            searchFunction: 'search',
                            bookmarkFunction: 'createBookmark',
                            popupBookmarkFunction: 'popupBookmark'
                        },
                        {
                            kind: 'MiddlePanel',
                            name: 'middlePanel',
                            mainSearchFunction: 'search',
                            openDocFunction: 'openDoc',
                            documentsCountClass: 'documentsMobileCount',
                            moreDocumentsFunction: 'moreDocuments'
                        },
                        {
                            kind: 'RightPanel',
                            name: 'rightPanel',
                            closeParentFunction: 'searchShow'
                        }
                    ]},
                    { kind: 'ClosablePopup', name: 'bookmarkPopup', classes: 'bookmarkMobilePopup', closeButtonClasses: 'popupCloseButton' }
                ],

                /**
                 * This function process the get parameters. If there is search word,
                 * starts a search with the unchecked entitites and if there is
                 * previewed document, opens that.
                 */
                processGETParameters: function(){
                    // Search
                    this.search(GetURLParameter('search')[0], GetURLParameter('entity'));
                    // Open Document
                    var openPreview = GetURLParameter('openPreview')[0];
                    if(!isEmpty(openPreview)){
                        this.openDoc(openPreview);
                    }
                },

                /**
                 * This function check that the window width is a mobile size
                 * @return {Boolean} true, if the screen size is maximum 800 pixels, otherwise false
                 */
                isMobileSize: function(){
                    return jQuery(window).width() <= 800;
                },

                /** This function shows the middle panel */
                searchShow: function(){
                    this.$.panels.setIndex(1);
                },

                /** This function shows the left panel */
                entityShow: function(){
                    this.$.panels.setIndex(0);
                },

                /**
                 * This function open a document on the preview on the right side.
                 * If the screen is little, shows only the right panel.
                 * @param {String} documentURL the document what user want to see
                 */
                openDoc: function(documentURL){
                    if(this.isMobileSize()){
                        this.$.panels.setIndex(2);
                    }
                    this.$.rightPanel.openDoc(documentURL);
                },

                /**
                 * This function update the "open" buttons, like the
                 * "entities button" on the middle
                 */
                updateButtons: function(){
                    if(!this.isMobileSize()){
                        this.$.leftPanel.hideDocsButton();
                        this.$.middlePanel.hideEntitiesButton();
                        this.$.rightPanel.hideBackButton();
                    } else {
                        this.$.leftPanel.showDocsButton();
                        this.$.middlePanel.showEntitiesButton();
                        this.$.rightPanel.showBackButton();
                    }
                },

                /**
                 * This function is called when the screen size is changing or
                 * the user rotate his/her mobile device. This function set the
                 * actual panel depends on the screen size and update the buttons,
                 * and change the bookmark popup's position.
                 */
                reflow: function() {
                    this.inherited(arguments);
                    if(!isEmpty(this.$.bookmarkPopup.getContent())){
                        this.changeBMPopupPosition();
                    }
                    if(this.isMobileSize()){
                        // If the 3. panel is the active, it means that the user's
                        // keyboard appears on the mobile device -> we have to do nothing
                        if(this.$.panels.getIndex() !== 2){
                            this.$.panels.setIndex(1);   
                        }
                    } else {
                        this.$.panels.setIndex(0);
                    }
                    this.updateButtons();
                },

                /**
                 * This function create and save a bookmark, which contains the
                 * search word, the unchecked entities and the opened document
                 */
                createBookmark: function(){
                    if(!isEmpty(this.searchWord)){
                        // Cut characters after '?'
                        var location = window.location.href;
                        var parametersIndex = location.indexOf('?');
                        if(parametersIndex !== -1){
                            location = location.substr(0, parametersIndex);
                        }
                        // Search word
                        var url = location + '?search=' + this.searchWord;
                        // Unchecked entities
                        var entities = this.getCheckedEntities();
                        for(var i=0;i<entities.length;i++){
                            if(!isEmpty(entities[i].id)){
                                url += '&entity=' + entities[i].id;
                            } else {
                                url += '&entity=' + entities[i];
                            }
                        }
                        // Preview document
                        var documentURL = this.$.rightPanel.getDocumentURL();
                        if(!isEmpty(documentURL)){
                            url += '&openPreview=' + documentURL;
                        }

                        var title = 'Fusepool';
                        this.$.middlePanel.saveBookmark(url, title);
                    } else {
                        this.$.middlePanel.saveBookmark();
                    }
                },

                /**
                 * Show a bookmark message in a popup
                 * @param {String} message the message what the function shows
                 */
                popupBookmark: function(message){
                    this.$.bookmarkPopup.show();
                    this.$.bookmarkPopup.setContent(message);
                    this.changeBMPopupPosition();
                },

                /**
                 * This function calculate the popup position to the 
                 * middle of the screen
                 */
                changeBMPopupPosition: function(){
                    var margin = 30;
                    var newWidth = jQuery('#' + this.$.middlePanel.getId()).width() - margin;
                    var windowWidth = jQuery(document).width();
                    var newLeft = (windowWidth - newWidth) / 2;
                    
                    this.$.bookmarkPopup.updateWidth(newWidth, margin);
                    this.$.bookmarkPopup.applyStyle('left', newLeft + 'px');
                },

                /**
                 * This function call the ajax search if the search word is not empty
                 * @param {String} searchWord the search word
                 * @param {Array} checkedEntities the unchecked entities on the left side
                 */
                search: function(searchWord, checkedEntities){
                    this.searchWord = searchWord;
                    this.checkedEntities = checkedEntities;
                    if(!isEmpty(searchWord)){
                        this.$.middlePanel.startSearching();
                        this.$.middlePanel.updateInput(this.searchWord);

                        var request = this.createSearchRequest(searchWord, checkedEntities);
                        request.response(this, function(inSender, inResponse) {
                            this.processSearchResponse(inResponse, searchWord);
                        });
                    }
                },
                /**
                 * This function create an ajax request for searching
                 * @param {String} searchWord the search word
                 * @param {String} checkedEntities the checked entities on the left side
                 * @param {Number} offset the offset of the documents (e.g. offset = 10 --> documents in 10-20)
                 */
                createSearchRequest: function(searchWord, checkedEntities, offset){
                    if(isEmpty(offset)){
                        offset = 0;
                    }
                    var request = new enyo.Ajax({
                        method: 'GET',
                        url: CONSTANTS.SEARCH_URL,
                        handleAs: 'text',
                        headers: { Accept: 'application/rdf+xml' }
                    });
                    request.go({
                        search: searchWord,
                        subject: this.getCheckedEntitesID(checkedEntities),
                        offset: offset,
                        maxFacets: GLOBAL.maxFacets,
                        items: GLOBAL.items
                    });
                    return request;
                },

                /**
                 * This function send a request for more documents.
                 * @param {Number} offset the offset of the document (offset = 10 --> document in 10-20)
                 */
                moreDocuments: function(offset){
                    var request = this.createSearchRequest(this.searchWord, this.checkedEntities, offset);
                    request.response(this, function(inSender, inResponse) {
                        var rdf = this.createRdfObject(inResponse);
                        var documents = this.createDocumentList(rdf);
                        this.$.middlePanel.addMoreDocuments(documents);
                    });
                },

                /**
                 * This function create an array from the id-s of the checked
                 * entites for the search query
                 * @param {Array} checkedEntities the original checked entities
                 * @returns {Array} the id-s of the checked entities
                 */
                getCheckedEntitesID: function(checkedEntities){
                    var result = [];
                    for(var i=0;i<checkedEntities.length;i++){
                        if(!isEmpty(checkedEntities[i].id)){
                            result.push(checkedEntities[i].id);
                        } else {
                            result.push(checkedEntities[i]);
                        }
                    }
                    return result;
                },

                /**
                 * This function runs after the ajax search's finish. This function call
                 * the entity list updater and the document updater functions
                 * @param {String} searchResponse the search response from the backend
                 * @param {String} searchWord the searched word
                 */
                processSearchResponse: function(searchResponse, searchWord){
                    var rdf = this.createRdfObject(searchResponse);
                    this.updateEntityList(rdf, searchWord);
                    this.updateDocumentList(rdf);
                },

                /**
                 * This funtion create an rdf object from the search response. The rdf query can't parse text, if any property
                 * contains " mark. We have to modify response: replace " marks to '' in every property.
                 * @param {String} searchResponse search response from the backend
                 * @return {Object} the created rdf object
                 */
                createRdfObject: function(searchResponse){
                    var rdf = null;
                    try {
                        var textArray = searchResponse.split('\n');
                        var newText = '';
                        for(var i=0;i<textArray.length;i++){
                            newText += replaceAllInTags(textArray[i], '"', '\'\'', '>', '<') + '\n';
                        }
                        var parsedData = new DOMParser().parseFromString(newText, 'text/xml');
                        rdf = jQuery.rdf();
                        rdf.load(parsedData, {});
                    } catch(e){
                        console.log('There was an error in RDF object parsing: ' + e);
                    }
                    return rdf;
                },

                /**
                 * This functions group and sort the entities update the entity list on the left side
                 * @param {Object} rdf the rdf object which contains the new entity list
                 * @param {String} searchWord the searched word
                 */
                updateEntityList: function(rdf, searchWord){
                    var checkedEntities = this.checkedEntitiesFromRdf(rdf);
                    var categories = this.getCategories(rdf);

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
                                var entityId = category[j].entityId;
                                var entityText = replaceAll(category[j].entity + '', '_', ' ');
                                var entityName = entityText.substr(entityText.lastIndexOf('/')+1);

                                var entity = {id: entityId, text:entityName };
                                if(!this.containsEntity(entities, entity)){
                                    entities.push(entity);
                                }
                            }
                            dictionaries.push({ name: categoryName, entities: entities });
                        }
                    }
                    var dictionaryObject = { searchWord: searchWord, checkedEntities: checkedEntities, dictionaries: dictionaries };
                    this.$.leftPanel.updateDictionaries(dictionaryObject);
                },

                /**
                 * This function search the dictionary categories in an rdf object.
                 * @param {Object} rdf the rdf object, which conatins the categories
                 * @returns {Array} the categories array with the entities
                 */
                getCategories: function(rdf){
                    // categories
                    var main = this;
                    var categories = [];
                    rdf.where('?s <http://www.w3.org/2000/01/rdf-schema#label> ?o').each(function(){
                        var entity = this.o.value + '';
                        var entityId = this.s.value + '';
                        var type = main.getTypeForEntity(rdf, entityId);
                        categories.push({entityId: entityId, entity: entity , value: type});
                    });
                    return categories;
                },

                /**
                 * This function search the type of an exist entity in and rdf object.
                 * @param {Object} rdf the rdf object, which contains the type
                 * @param {String} entityId id of the entity
                 * @returns {String} the type of the entity
                 */
                getTypeForEntity: function(rdf, entityId){
                    var result = '';
                    rdf.where('<'+entityId+'> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> ?o').each(function(){
                        var type = this.o.value + '';
                        if(type.indexOf('#') === -1){
                            result = this.o.value + '';
                        }
                    });
                    return result;
                },

                /**
                 * This function search the checked entities in an rdf object
                 * @param {Object} rdf the rdf object
                 * @returns {Array} the checked entity list
                 */
                checkedEntitiesFromRdf: function(rdf){
                    var main = this;
                    var checkedEntities = [];
                    var ids = [];
                    rdf.where('?s <http://fusepool.eu/ontologies/ecs#subject> ?o').each(function(){
                        ids.push(this.o.value + '');
                    });
                    for(var i=0;i<ids.length;i++){
                        rdf.where('<'+ ids[i] +'> <http://www.w3.org/2000/01/rdf-schema#label> ?o').each(function(){
                            var entity = {id: ids[i], text: this.o.value};
                            if(!main.containsEntity(checkedEntities, entity)){
                                checkedEntities.push(entity);   
                            }
                        });
                    }
                    return checkedEntities;
                },

                 /**
                 * This function decide that an entity list contains an entity or not
                 * @param {Array} entities the array of the entitites
                 * @param {String} entity the entity
                 * @returns {Boolean} true, if the list contains the entity, false otherwise
                 */
                containsEntity: function(entities, entity){
                    for(var i=0;i<entities.length;i++){
                        if(entities[i].id === entity.id || entities[i].text.toUpperCase() === entity.text.toUpperCase()){
                            return true;
                        }
                    }
                    return false;
                },

                /**
                 * This function delete all entites in an array which are equal
                 * with an entity after an index
                 * @param {Array} array the array
                 * @param {String} entity the checked entity
                 * @param {Number} fromIndex the start index in the array
                 */
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

                /**
                 * This function update the document list on the middle
                 * @param {Object} rdf the rdf object which contains the new document list
                 */
                updateDocumentList: function(rdf){
                    var documents = this.createDocumentList(rdf);
                    this.$.middlePanel.updateDocuments(documents);
                    var count = this.getDocumentsCount(rdf);
                    this.$.middlePanel.updateCounts(count);
                },

                /**
                 * This functions search the count of documents in an rdf object.
                 * @param {Object} rdf the rdf object, which contains the count of documents.
                 * @returns {Number} the count of documents
                 */
                getDocumentsCount: function(rdf){
                    var result = 0;
                    rdf.where('?s <http://fusepool.eu/ontologies/ecs#contentsCount> ?o').each(function(){
                        result = this.o.value;
                    });
                    return result;
                },

                /**
                 * This function create the document list from the rdf object.
                 * @param {Object} rdf the rdf object, which contains the documents
                 * @returns {Array} the document list
                 */
                createDocumentList: function(rdf){
                    var documents = [];
                    var main = this;
                    rdf.where('?s <http://fusepool.eu/ontologies/ecs#textPreview> ?preview')
                        .optional('?s <http://purl.org/dc/terms/title> ?title').each(function(){
                            var url = this.s.value + '';
                            var content = main.getContentForDocumentId(rdf, url);
                            var title = deleteSpeechMarks(this.title.value + '');
                            if(!main.containsDocument(documents, content, title)){
                                if(this.title.lang + '' === main.lang || isEmpty(this.title.lang)){
                                    documents.push({url: url, shortContent: content, title: title});
                                }
                            }
                    });
                    return documents;
                },

                /**
                 * This function search content for a document in an rdf object.
                 * @param {Object} rdf the rdf object
                 * @param {String} url of the document
                 * @returns {String} content of the document (might be empty)
                 */
                getContentForDocumentId: function(rdf, url){
                    var main = this;
                    var content = '';
                    rdf.where('<'+url+'> <http://purl.org/dc/terms/abstract> ?o').each(function(){
                        if(this.o.lang + '' === main.lang){
                            content = deleteSpeechMarks(this.o.value + '');
                        }
                    });
                    if(isEmpty(content)){
                        rdf.where('<'+url+'> <http://purl.org/dc/terms/abstract> ?o').each(function(){
                            content = deleteSpeechMarks(this.o.value + '');
                        });
                    }
                    return content;
                },

                /**
                 * This function decide that a document list contains a document,
                 * which has a same content and same title with another.
                 * @param {Array} documents the list of documents
                 * @param {String} content content of the other document
                 * @param {String} title title of the other document
                 * @returns {Boolean} true, if the list contains, false otherwise
                 */
                containsDocument: function(documents, content, title){
                    for(var i=0;i<documents.length;i++){
                        if(documents[i].shortContent === content && documents[i].title === title){
                            return true;
                        }
                    }
                    return false;
                }

            });
        }
        new DocumentMobileApp().renderInto(document.body);
        renderTemplateDiv();
        
        function renderTemplateDiv(){
            var innerDiv = document.createElement('div');
            innerDiv.id = 'templates';
            document.body.appendChild(innerDiv);
            // load the preview templates
            jQuery("#templates").load(CONSTANTS.TEMPLATES_URL);
        }

    }

    try {
        initialization();
    } catch(e) {
        console.log(e);
    }

});