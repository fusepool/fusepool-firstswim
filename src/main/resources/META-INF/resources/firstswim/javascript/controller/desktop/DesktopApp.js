jQuery(document).ready(function () {

    function initialization(){

        createUI();
        enyo.Scroller.touchScrolling=false;

        /** This function create the user interface with the all components */
        function createUI(){
            /**
            * @class DocumentApp
            */
            enyo.kind(
            /** @lends DocumentApp.prototype */
            {
                name: 'DocumentApp',
                kind: enyo.Control,

                create: function(){
                    this.inherited(arguments);
                    renderTemplateDiv();
                    this.processGETParameters();
                },

                /**
                 * After the rendering, the program calculate and set the
                 * bookmark popup position and the preview box size.
                 */
                rendered: function(){
                    this.inherited(arguments);
                    this.previewOriginHeight = jQuery('#' + this.$.previewBox.getOpenDocId()).height();
                    this.changeBMPopupPosition();
                /*  this.changePreviewBoxSize();		// we don't need this currently */
                },

                published: {
                    searchWord: '',
                    checkedEntities: [],
                    lang: 'en'
                },

                components: [
                    {
                        kind: 'TopMessageBox',
                        name: 'topMessageBox',
                        classes: 'topMessageBox'
                    },
                    {
                        tag: 'div',
                        classes: 'docApp',
                        components: [
                            { name: 'Toolbar', classes: 'toolbar', components: [
                                { name: 'ToolbarCenter', classes: 'toolbarCenter', components: [
                                        {
                                                name: 'mainLogo',
                                                classes: 'mainLogo',
                                                ontap: 'clickLogo'
                                        },
                                        {
                                                kind: 'SearchBox',
                                                name: 'searchBox',
                                                placeholder: 'Search in documents',
                                                buttonClass: 'searchButton',
                                                buttonContent: 'OK',
                                                searchIconClass: 'searchImage',
                                                parentSeachFunction: 'search'
                                        }
                                ]},
                                {
                                        content: 'Login',
                                        ontap: 'login',
                                        classes: 'loginButton'
                                },
                                { kind: 'LoginPopup', name: 'loginPopup', classes: 'loginPopup' },
                                {
                                        name: 'bookmark',
                                        kind: 'Bookmark',
                                        buttonClass: 'bookmarkButton',
                                        parentTapFunction: 'createBookmark',
                                        parentPopupFunction: 'popupBookmark',
                                        warningPopupClass: 'bookmarkPopup',
                                        warningPopupContent: '<br/>Your browser doesn\'t support add bookmark via Javascript.<br/><br/>Please insert manually this URL:<br/><br/>'
                                }
                            ]},
                            { kind: 'ClosablePopup', name: 'bookmarkPopup', classes: 'bookmarkPopup', popupClasses: 'bookmarkPopupDiv', closeButtonClasses: 'popupCloseButton' },
                            {
                                classes: 'leftDesktopCol',
                                components: [
                                    {
                                            kind: 'DictionaryController',
                                            openClasses: 'dictionaryListOpen',
                                            closeClasses: 'dictionaryListClose',
                                            openScrollerClass: 'dictionaryListScrollOpen',
                                            closeScrollerClass: 'dictionaryListScrollClose',
                                            entityCheckboxClass: 'dictionaryCheckbox',
                                            searchFunction: 'search',
                                            name: 'dictionaries',
                                            dictionaryTitle: 'Entities',
                                            titleClass: 'dictionariesMainTitle',
                                            showDetailsFunction: 'updateDetails'
                                    },
                                    {
                                            kind: 'DetailsBox',
                                            name: 'detailsBox',
                                            classes: 'detailsBox enyo-unselectable',
                                            detailsMainTitle: 'Details',
                                            mainTitleClass: 'detailsMainTitle',
                                            scrollerClass: 'detailsScroll',
                                            titleClass: 'detailsTitle'
                                    }
                                ]
                            },
                            {
                                kind: 'DocumentList',
                                name: 'documents',
                                openDocFunction: 'openDoc',
                                openDocEvent: 'ontap',
                                classes: 'documentList',
                                loaderClass: 'loader',
                                scrollerClass: 'documentListScroll',
                                titleClass: 'documentsMainTitle',
                                classifyFinishFunction: 'processSearchResponse',
                                titleContent: 'Documents:',
                                documentsCountClass: 'documentsCount',
                                noDataLabel: 'No data available',
                                moreButtonClass: 'moreButton',
                                moreDocumentsFunction: 'moreDocuments'
                            },
                            {
                                kind: 'PreviewBox',
                                name: 'previewBox',
                                classes: 'previewBox',
                                previewBoxMainTitle: 'Preview',
                                previewBoxMainTitleClass: 'previewBoxMainTitle'
                            }
                        ]
                    }
                ],

                /**
                 * This function is called, when the user click the login button.
                 * It shows the login popup window.
                 */
                login: function(){
                    this.$.loginPopup.showLogin();
                },

                /**
                 * This function is called when the user click on the logo.
                 * It navigates to the fusepool main site
                 */
                clickLogo: function(){
                    window.open(CONSTANTS.FUSEPOOL_MAIN_URL);
                },

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
                 * This function calculate the position of the previwed document
                 * and open the document on the right side.
                 * @param {Object} previewDoc the document what user want to see
                 * @param {Object} inEvent mouse over on a short document event
                 */
                openDoc: function(previewDoc, inEvent){
                    if(!isEmpty(inEvent)){
                        var topMessage = jQuery('#' + this.$.topMessageBox.getId());
                        var topMessageVisible = topMessage.is(':visible');
                        var topMessageHeight = 0;
                        if(topMessageVisible){
                            topMessageHeight = topMessage.outerHeight();
                            alert(topMessageHeight);
                        }
                    }
                    this.$.previewBox.openDoc(previewDoc);
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
                        var documentURL = this.$.previewBox.getDocumentURL();
                        if(!isEmpty(documentURL)){
                            url += '&openPreview=' + documentURL;
                        }

                        var title = 'Fusepool';
                        this.$.bookmark.saveBookmark(url, title);
                    } else {
                        this.$.bookmark.saveBookmark(url, title);
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
                 * This function change the bookmark popup's position to the middle
                 * of horizontal and a little distance from the top
                 */
                changeBMPopupPosition: function(){
                    if(!isEmpty(this.$.bookmarkPopup.getContent())){
                        var jQBookmark = jQuery('#' + this.$.bookmarkPopup.getId());
                        var popupWidth = jQBookmark.outerWidth();
                        var windowWidth = jQuery('#' + this.getId()).width();
                        var newLeft = (windowWidth - popupWidth) / 2;
                        this.$.bookmarkPopup.applyStyle('left', newLeft + 'px');
                    }
                },

               /**
                 * This function is called when the screen size is changing.
                 * This function calls the bookmark popup changer function and the
                 * preview box size changer function.
                 */
                resizeHandler: function() {
                    this.inherited(arguments);
                    this.changeBMPopupPosition();
                },

                /**
                 * This function reduct the preview box height if there is'nt enough
                 * place for that. Otherwise set the default height for the box.
                 */
                changePreviewBoxSize: function(){
                    var windowHeight = jQuery(window).height();
                    var newHeight = windowHeight - 110;

                    if(newHeight < this.previewOriginHeight){
                        this.$.previewBox.changeHeight(newHeight);
                    } else {
                        this.$.previewBox.changeHeight(this.previewOriginHeight);
                    }
                },

                /**
                 * This function call the ajax search if the search word is not empty
                 * @param {String} searchWord the search word
                 * @param {Array} checkedEntities the checked entities on the left side
                 */
                search: function(searchWord, checkedEntities){
                    this.searchWord = searchWord;
                    this.checkedEntities = checkedEntities;
                    if(!isEmpty(searchWord)){
                        this.$.documents.startLoading();
                        this.$.searchBox.updateInput(this.searchWord);

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
                        this.$.documents.addMoreDocuments(documents);
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
                 * @param {Object} searchResponse the search response from the backend
                 * @param {String} searchWord the searched word
                 */
                processSearchResponse: function(searchResponse, searchWord){
                    var rdf = this.createRdfObject(searchResponse);
                    this.updateEntityList(rdf, searchWord);
                    this.updateDocumentList(rdf);
                    this.cleanPreviewBox();
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
                            var row = textArray[i];
                            newText += replaceAllInTags(row, '"', '\'\'', '>', '<');
                            if(row.indexOf('<') === -1 && row.indexOf('>') === -1 && row.indexOf('xmlns') === -1){
                                newText += '|';
                            } else {
                                newText += ' ';
                            }
                        }
                        var parsedData = new DOMParser().parseFromString(newText, 'text/xml');
                        rdf = jQuery.rdf();
                        rdf.load(parsedData, {});
                    } catch(e){
                        console.log('There was an error in RDF object parsing: ');
                        console.log(e);
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
                    this.$.dictionaries.updateLists(dictionaryObject);
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
                 * This function search the checked entities in an rdf object and
                 * return with it
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
                    this.$.documents.updateList(documents, this.searchWord);
                    var count = this.getDocumentsCount(rdf);
                    this.$.documents.updateCounts(count);
                },

                cleanPreviewBox: function(){
                    this.$.previewBox.clean();
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

                            var title = '';
                            if(!isEmpty(this.title)){
                                title = deleteSpeechMarks(this.title.value + '');
                            }

//                            if(!main.containsDocument(documents, content, title)){
                                if(isEmpty(this.title) || isEmpty(this.title.lang) || this.title.lang + '' === main.lang){
                                    documents.push({url: url, shortContent: content, title: title});
                                }
//                            }

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
                },

                /**
                 * This function calls the details box content update function.
                 * @param {String} title the title of the details
                 * @param {Object} addressObject the address object
                 */
                updateDetails: function(title, addressObject){
                    this.$.detailsBox.updateDetails(title, addressObject);
                }
            });
        }
        new DocumentApp().renderInto(document.getElementById('main'));
        renderTemplateDiv();
        
        function renderTemplateDiv(){
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
