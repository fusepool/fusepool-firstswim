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
                    this.processGETParameters();
                },

                published: {
                    searchWord: '',
                    uncheckedEntities: []
                },

                components: [
                    { kind: 'Panels', name: 'panels', fit: true, arrangerKind: 'CollapsingArranger', components: [
                        {
                            kind: 'LeftPanel',
                            name: 'leftPanel',
                            classes: 'leftPanel',
                            entityFilterFunction: 'entityFilter',
                            bookmarkFunction: 'createBookmark',
                            popupBookmarkFunction: 'popupBookmark'
                        },
                        {
                            kind: 'MiddlePanel',
                            mainSearchFunction: 'search',
                            openDocFunction: 'openDoc'
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
                    this.searchWord = GetURLParameter('search')[0];
                    this.uncheckedEntities = GetURLParameter('entity');
                    if(!isEmpty(this.searchWord)){
                        this.$.middlePanel.updateInput(this.searchWord);
                        this.search(this.searchWord, this.uncheckedEntities);
                    }
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
                        var entities = this.$.leftPanel.getUncheckedEntities();
                        for(var i=0;i<entities.length;i++){
                            url += '&entity=' + entities[i];
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
                 * @param {Array} uncheckedEntities the unchecked entities on the left side
                 */
                search: function(searchWord, uncheckedEntities){
                    this.searchWord = searchWord;
                    if(isEmpty(uncheckedEntities)){
                        this.uncheckedEntities = [];
                    } else {
                        this.uncheckedEntities = uncheckedEntities;
                    }
                    if(!isEmpty(searchWord)){
                        this.ajaxSearch(searchWord, uncheckedEntities);
                    }
                },

                /**
                 * This function send an ajax request for searching
                 * @param {String} searchWord the search word
                 * @param {Array} uncheckedEntities the unchecked entities on the left side
                 */
                ajaxSearch: function(searchWord, uncheckedEntities){
                    var request = new enyo.Ajax({
                        method: 'GET',
                        url: 'http://platform.fusepool.info/ecs/',
                        handleAs: 'text',
                        headers: { Accept: 'application/rdf+xml' }
                    });
                    request.go({
                        search: searchWord,
                        xPropObj: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#first'
                    });
                    request.response(this, function(inSender, inResponse) {
                        this.processSearchResponse(inResponse, searchWord, uncheckedEntities);
                    });
                },

                /**
                 * This function runs after the ajax search's finish. This function call
                 * the entity list updater and the document updater functions
                 * @param {String} searchResponse the search response from the backend
                 * @param {String} searchWord the searched word
                 * @param {Array} uncheckedEntities the unchecked entities on the left side
                 */
                processSearchResponse: function(searchResponse, searchWord, uncheckedEntities){
                    var rdf = this.createRdfObject(searchResponse);
                    this.updateEntityList(rdf, searchWord, uncheckedEntities);
                    if(isEmpty(uncheckedEntities) || uncheckedEntities.length === 0){
                        this.updateDocumentList(rdf);
                    }
                },

                /**
                 * This function update the document list. It is called when the user
                 * check/uncheck an entity on the left side.
                 * @param {String} searchResponse the search response,
                 *  which contains the new document list
                 */
                entityFilter: function(searchResponse){
                    var rdf = this.createRdfObject(searchResponse);
                    this.updateDocumentList(rdf);
                },

                /**
                 * This funtion create an rdf object from the search response
                 * with the rdfquery lib
                 * @param {String} searchResponse search response from the backend
                 * @return {Object} the created rdf object
                 */
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

                /**
                 * This functions group and sort the entities update the entity list on the left side
                 * @param {Object} rdf the rdf object which contains the new entity list
                 * @param {String} searchWord the searched word
                 * @param {Array} uncheckedEntities unchecked entities
                 */
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
                    this.$.leftPanel.updateDictionaries(dictionaryObject);
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
                    var documents = [];
                    rdf.where('?s <http://fusepool.eu/ontologies/ecs#textPreview> ?o').each(function(){
                        documents.push({ url: this.s.value, shortContent:  this.o.value});
                    });
                    this.$.middlePanel.updateDocuments(documents);
                }

            });
        }
        new DocumentMobileApp().renderInto(document.body);
    }

    try {
        initialization();
    } catch(e) {
        console.log(e);
    }

});
