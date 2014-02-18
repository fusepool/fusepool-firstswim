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
                openDoc: function(documentURL,type){
                    if(this.isMobileSize()){
                        this.$.panels.setIndex(2);
                    }
                    this.$.rightPanel.openDoc(documentURL);
                    this.$.middlePanel.$.documents.sendDocListAnnotation(documentURL,type,'true');
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
                    this.cleanPreviewBox();
                    this.searchWord = searchWord;
                    this.checkedEntities = checkedEntities;
                    if(!isEmpty(searchWord)){
                        this.$.middlePanel.startSearching();
                        this.$.middlePanel.updateInput(this.searchWord);

                        this.sendSearchRequest(searchWord, checkedEntities, 'processSearchResponse');
                    }
                },

                /**
                 * This function sends an ajax request for searching
                 * @param {String} searchWord the search word
                 * @param {String} checkedEntities the checked entities on the left side
                 * @param {String} responseFunction the name of the response function
                 * @param {Number} offset the offset of the documents (e.g. offset = 10 --> documents in 10-20)
                 */
                sendSearchRequest: function(searchWord, checkedEntities, responseFunction, offset){
                    var main = this;
                    var url = this.createSearchURL(searchWord, checkedEntities, offset);
                    var store = rdfstore.create();
                    store.load('remote', url, function(success) {
                        main[responseFunction](success, store);
                    });
                },

                /**
                 * This function creates the search URL for the query
                 * @param {String} searchWord the search word
                 * @param {Array} checkedEntities the checked entities
                 * @param {Number} offset offset of the query
                 * @returns {String} the search url
                 */
                createSearchURL: function(searchWord, checkedEntities, offset){
                    var url = CONSTANTS.SEARCH_URL;
                    if(isEmpty(offset)){
                        offset = 0;
                    }
                    url += '?search='+searchWord;
                    if(checkedEntities.length > 0){
                        url += this.getCheckedEntitesURL(checkedEntities);
                    }
                    url += '&offset='+offset+'&maxFacets='+GLOBAL.maxFacets+'&items='+GLOBAL.items;
                    return url;
                },

                /**
                 * This function send a request for more documents.
                 * @param {Number} offset the offset of the document (offset = 10 --> document in 10-20)
                 */
                moreDocuments: function(offset){
                    this.sendSearchRequest(this.searchWord, this.checkedEntities, 'processMoreResponse', offset);
                },

                /**
                 * This function runs after the ajax more search's finish.
                 * This function calls the document updater function
                 * @param {Boolean} success the search query was success or not
                 * @param {Object} rdf the response rdf object
                 */
                processMoreResponse: function(success, rdf){
                    var documents = this.createDocumentList(rdf);
                    this.$.middlePanel.addMoreDocuments(documents);
                },

                /**
                 * This function creates the checked entites part of the search URL
                 * @param {Array} checkedEntities the original checked entities
                 * @returns {String} the URL part of the checked entities
                 */
                getCheckedEntitesURL: function(checkedEntities){
                    var result = '';
                    for(var i=0;i<checkedEntities.length;i++){
                        if(!isEmpty(checkedEntities[i].id)){
                            result += '&subject=' + checkedEntities[i].id;
                        } else {
                            result += '&subject=' + checkedEntities[i];
                        }
                    }
                    return result;
                },

                /**
                 * This function runs after the ajax search's finish. This function calls
                 * the entity list updater and the document updater functions
                 * @param {Boolean} success the search query was success or not
                 * @param {Object} rdf the response rdf object
                 */
                processSearchResponse: function(success, rdf){
                    this.updateEntityList(rdf, this.searchWord);
                    this.updateDocumentList(rdf);
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
                    var categories = [];
                    var query = 'SELECT * { ?id <http://www.w3.org/2000/01/rdf-schema#label> ?entity';
                    query += '      OPTIONAL { ?id <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> ?type }';
                    query += '}';
                    rdf.execute(query, function(success, results) {
                        if (success) {
                            for(var i=0;i<results.length;i++){
                                var row = results[i];
								if(!isEmpty(row.type)) {
									if(row.type.value.indexOf('#') === -1){
										categories.push({entityId: row.id.value, entity: row.entity.value, value: row.type.value});
									}
								}
                            }
                        }
                    });
                    return categories;
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
                    var query = 'SELECT * { ?s <http://fusepool.eu/ontologies/ecs#subject> ?id';
                    query += '      OPTIONAL { ?id <http://www.w3.org/2000/01/rdf-schema#label> ?entity }';
                    query += '}';
                    rdf.execute(query, function(success, results) {
                        if (success) {
                            for(var i=0;i<results.length;i++){
                                var row = results[i];
                                if(!isEmpty(row.entity)){   
                                    var entity = {id: row.id.value, text: row.entity.value};
                                    if(!main.containsEntity(checkedEntities, entity)){
                                        checkedEntities.push(entity);
                                    }
                                }
                            }
                        }
                    });
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
                 * This function delete the preview's content
                 */
                cleanPreviewBox: function(){
                    this.$.rightPanel.clean();
                },

                /**
                 * This functions search the count of documents in an rdf object.
                 * @param {Object} rdf the rdf object, which contains the count of documents.
                 * @returns {Number} the count of documents
                 */
                getDocumentsCount: function(rdf){
                    var result = 0;
                    var query = 'SELECT * { ?s <http://fusepool.eu/ontologies/ecs#contentsCount> ?o }';
                    rdf.execute(query, function(success, results) {
                        if (success) {
                            result = results[0].o.value;
                        }
                    });
                    return result;
                },

                /**
				 * This function creates ordered document list from the rdf object.
                 * @param {Object} rdf the rdf object, which contains the documents
                 * @returns {Array} the document list
                 */
                createDocumentList: function(rdf){
					var documents = [];
					var main = this;
					var hits = [];

					rdf.rdf.setPrefix("ecs","http://fusepool.eu/ontologies/ecs#");
					rdf.rdf.setPrefix("rdf","http://www.w3.org/1999/02/22-rdf-syntax-ns#");
					var graph;
					rdf.graph(function(success, things){graph = things;});
					var triples = graph.match(null, rdf.rdf.createNamedNode(rdf.rdf.resolve("ecs:contents")), null).toArray();
					var current = triples[0].object;

					while(!current.equals(rdf.rdf.createNamedNode(rdf.rdf.resolve("rdf:nil")))){
						var hit = graph.match(current, rdf.rdf.createNamedNode(rdf.rdf.resolve("rdf:first")), null).toArray()[0].object;
						hits.push(hit.nominalValue);
						current = graph.match(current, rdf.rdf.createNamedNode(rdf.rdf.resolve("rdf:rest")), null).toArray()[0].object;
					}

					var querylist = 'PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> ';
					querylist += 'SELECT * {';
					querylist += '      ?url <http://purl.org/dc/terms/abstract> ?content .';
					querylist += '      { ?url <http://purl.org/dc/terms/title> ?title .';
					querylist += '        filter ( lang(?title) = "en")';
					querylist += '      } UNION {  ';
					querylist += '        ?url <http://purl.org/dc/terms/title> ?title .';
					querylist += '        filter ( lang(?title) = "")';
					querylist += '      }'
					querylist += '      ?url <http://fusepool.eu/ontologies/ecs#textPreview> ?preview .';
					// querylist += '    ?url <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> ?dtype .';	// X branch
					querylist += '      OPTIONAL { ?url <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> ?dtype }';
					querylist += '}';

					/* This is the tentative to iterate the list at the API level to have it in ORDER 
						var triples = graph.match(null, rdf.rdf.createNamedNode(rdf.rdf.resolve("ecs:contents")), null).toArray();
						var hit = graph.match(triples[0].object, store.rdf.createNamedNode(store.rdf.resolve("rdf:rest")), null).toArray();
					*/

					rdf.execute(querylist, function(success, results) {
						if (success) {
							for(var rank=0; rank<hits.length; rank++){
								for(var i=0; i<results.length; i++){
									var row = results[i];
									if(row.url.value!=hits[rank]) {
										/*if(row.url.value!=hits[rank] || 
										row.dtype.value.indexOf("ecs") != -1 || 
										row.dtype.value.indexOf("owl#A") != -1 ){ */
										continue;
									}
									// if(!isEmpty(row.content) && (isEmpty(row.title) || isEmpty(row.title.lang) || row.title.lang + '' === main.lang)){
									// var content = row.content.value;
									var content;
									if(isEmpty(row.content)) {
										content = row.preview.value;
									}
									else {
										content = row.content.value;
									}
									var title = 'Title not found';
									if(!isEmpty(row.title)){
										title = row.title.value;
									}
									var dtype = 'Type not found';
									if(!isEmpty(row.dtype)){
										dtype = row.dtype.value;
									}
									if(!main.containsDocument(documents, content, title, row.url.value)){
										documents.push({url: row.url.value, shortContent: content, title: title, type: dtype});
									}
								}
							}
						}
					});
					return documents;
                },

                /**
                 * This function decide that a document list contains a document,
                 * which has a same content and same title with another.
                 * @param {Array} documents the list of documents
                 * @param {String} content content of the other document
                 * @param {String} title title of the other document
                 * @returns {Boolean} true, if the list contains, false otherwise
                 */
                containsDocument: function(documents, content, title, url){
                    for(var i=0;i<documents.length;i++){
                        if(documents[i].url === url || (documents[i].shortContent === content && documents[i].title === title)){
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
            innerDiv.id = 'visualizer';
            document.body.appendChild(innerDiv);
            // load the preview templates
            jQuery("#visualizer").load(CONSTANTS.VISUALIZER_URL);
        }

    }

    try {
        initialization();
    } catch(e) {
        console.log(e);
    }

});
