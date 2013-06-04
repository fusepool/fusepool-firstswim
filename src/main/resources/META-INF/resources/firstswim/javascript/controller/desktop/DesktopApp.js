jQuery(document).ready(function () {

    function initialization(){

        createUI();

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
                    this.changePreviewBoxSize();
                },

                published: {
                    searchWord: '',
                    uncheckedEntities: []
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
                            {
                                kind: 'SearchBox',
                                name: 'searchBox',
                                placeholder: 'Search in documents',
                                buttonClass: 'searchButton',
                                buttonContent: 'OK',
                                searchIconClass: 'searchImage',
                                parentSeachFunction: 'search'
                            },
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
                            },
                            { kind: 'ClosablePopup', name: 'bookmarkPopup', classes: 'bookmarkPopup', popupClasses: 'bookmarkPopupDiv', closeButtonClasses: 'popupCloseButton' },
                            {
                                classes: 'leftDesktopCol',
                                components: [
                                    {
                                        kind: 'DetailsBox',
                                        name: 'detailsBox',
                                        classes: 'detailsBox enyo-unselectable',
                                        scrollerClass: 'detailsScroll',
                                        titleClass: 'detailsTitle',
                                        imageClass: 'detailsImage',
                                        contentClass: 'detailsContent'
                                    },
                                    {
                                        kind: 'DictionaryList',
                                        classes: 'dictionaryList',
                                        entityFilterFunction: 'entityFilter',
                                        name: 'dictionaries',
                                        dictionaryTitle: 'Dictionaries',
                                        noContentLabel: 'No data available',
                                        titleClass: 'dictionariesMainTitle',
                                        showDetailsFunction: 'updateDetails'
                                    }
                                ]
                            },
                            {
                                kind: 'DocumentList',
                                name: 'documents',
                                openDocFunction: 'openDoc',
                                openDocEvent: 'onenter',
                                classes: 'documentList',
                                titleClass: 'documentsMainTitle',
                                titleContent: 'Documents',
                                noDataLabel: 'No data available'
                            },
                            {
                                kind: 'PreviewBox',
                                name: 'previewBox',
                                classes: 'previewBox'
                            }
                        ]
                    }
                ],

                login: function(){
                    this.$.loginPopup.showLogin();
                },

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
                        this.$.searchBox.updateInput(this.searchWord);
                        this.search(this.searchWord, this.uncheckedEntities);
                    }
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
                    // After mouse hovering
                    if(!isEmpty(inEvent)){
                        var mainFrame = jQuery('#' + this.getId());
                        var jQueryDoc = jQuery('#' + this.$.previewBox.getOpenDocId());
                        var previewHeight = jQueryDoc.outerHeight();
                        var clickTop = inEvent.pageY;

                        var topMessage = jQuery('#' + this.$.topMessageBox.getId());
                        var topMessageVisible = topMessage.is(':visible');
                        var topMessageHeight = 0;
                        if(topMessageVisible){
                            topMessageHeight = topMessage.outerHeight();
                            alert(topMessageHeight);
                        }

                        var newTop = clickTop - topMessageHeight - previewHeight / 2;
                        // If there isn't enough place on the bottom
                        if(mainFrame.height() < clickTop + previewHeight / 2 + 30){
                            newTop = mainFrame.height() - topMessageHeight - previewHeight - 30;
                        }
                        // If there isn't enough place on the top
                        if(newTop < 50){
                            newTop = 50;
                        }
                        this.$.previewBox.applyStyle('top', newTop + 'px');                        
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
                        var entities = this.$.dictionaries.getUncheckedEntities();
                        for(var i=0;i<entities.length;i++){
                            url += '&entity=' + entities[i];
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
                    this.changePreviewBoxSize();
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
                 * @param {String} uncheckedEntities the unchecked entities on the left side
                 */
                ajaxSearch: function(searchWord, uncheckedEntities){
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

                /**
                 * This function runs after the ajax search's finish. This function call
                 * the entity list updater and the document updater functions
                 * @param {Object} searchResponse the search response from the backend
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
                    this.$.dictionaries.updateList(dictionaryObject);
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
                    this.$.documents.updateList(documents);
                },

                /**
                 * This function calls the details box content update function.
                 * @param {Object} details the new details object.
                 */
                updateDetails: function(details){
                    this.$.detailsBox.updateDetails(details);
                }
            });
        }
        new DocumentApp().renderInto(document.getElementById('main'));
    }

    try {
        initialization();
    } catch(e) {
        console.log(e);
    }

});