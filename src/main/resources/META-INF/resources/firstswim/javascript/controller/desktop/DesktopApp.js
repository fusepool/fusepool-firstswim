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
                        name: 'docApp',
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
                                        },
										{ 
											name: 'toolbarIcons',
											classes: 'toolbarIcons',
											components: [
												{kind: 'Group', classes: 'viewTypeToggleButtons', onActivate: 'onViewTypeToggle', components: [
													{kind: 'onyx.IconButton', name: 'docListViewButton', src: CONSTANTS.IMG_PATH + 'docListViewButton.png', active: true},
													{kind: 'onyx.IconButton', name: 'landscapeViewButton', src: CONSTANTS.IMG_PATH + 'landscapeViewButton.png'},
													{kind: 'onyx.IconButton', name: 'nGraphViewButton', src: CONSTANTS.IMG_PATH + 'nGraphViewButton.png'}
												]},
												{
													ontap: 'login',
													classes: 'loginButton'
												},
												{
													name: 'bookmark',
													kind: 'Bookmark',
													buttonClass: 'bookmarkButton',
													parentTapFunction: 'createBookmark',
													parentPopupFunction: 'popupBookmark',
													warningPopupClass: 'bookmarkPopup',
													warningPopupContent: '<br/>Your browser doesn\'t support add bookmark via Javascript.<br/><br/>Please insert this URL manually:<br/><br/>'
												}
											]
										},
										{
											kind: 'LoginPopup',
											name: 'loginPopup',
											classes: 'loginPopup'
										}
                                ]}
                            ]},
                            { kind: 'ClosablePopup', name: 'bookmarkPopup', classes: 'bookmarkPopup', popupClasses: 'bookmarkPopupDiv', closeButtonClasses: 'popupCloseButton' },
                            {
								name: 'leftDesktopCol',
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
                                classifyFinishFunction: 'processClassifyResponse',
                                titleContent: 'Documents ',
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
				
				/** */
				onViewTypeToggle:  function(inSender, inEvent) {
					if (inEvent.originator.getActive()) {
						//var selected = inEvent.originator.indexInContainer();
						switch(inEvent.originator.name) {
							case 'docListViewButton':
								this.destroyCurrentViewType(GLOBAL.viewType,'documentList');
								
								if(GLOBAL.viewType!='documentList') {									
									GLOBAL.viewType='documentList';
										
									this.createComponent({
														name: 'leftDesktopCol',
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
													});
									
									this.createComponent({
															kind: 'DocumentList',
															name: 'documents',
															openDocFunction: 'openDoc',
															openDocEvent: 'ontap',
															classes: 'documentList',
															loaderClass: 'loader',
															scrollerClass: 'documentListScroll',
															titleClass: 'documentsMainTitle',
															classifyFinishFunction: 'processClassifyResponse',
															titleContent: 'Documents ',
															documentsCountClass: 'documentsCount',
															noDataLabel: 'No data available',
															moreButtonClass: 'moreButton',
															moreDocumentsFunction: 'moreDocuments'
														});
									this.render();
									
									this.search(this.searchWord);
								}
							break;
							case 'nGraphViewButton':
								this.destroyCurrentViewType(GLOBAL.viewType,'nGraph');
								
								if(GLOBAL.viewType!='nGraph') {
									GLOBAL.viewType='nGraph';

									this.createComponent({
											kind: 'NGraph',
											name: 'nGraph',
											openDocFunction: 'openDoc',
											openDocEvent: 'ontap',
											classes: 'nGraphPanel',
											loaderClass: 'loader',
											titleClass: 'nGraphMainTitle',
											titleContent: 'Network graph ',
											noDataLabel: 'No data available'
										});
										
									this.render();
									
									this.search(this.searchWord);
									
								}
							break;
							case 'landscapeViewButton':
								this.destroyCurrentViewType(GLOBAL.viewType,'landscape');
								
								if(GLOBAL.viewType!='landscape') {
									GLOBAL.viewType='landscape';
									this.createComponent({
											kind: 'Landscape',
											name: 'landscape',
											classes: 'landscapePanel',
											loaderClass: 'loader',
											titleClass: 'landscapeMainTitle',
											titleContent: 'Landscape '
										});
										
									this.render();								
									this.search(this.searchWord);
								}
							break;
						}
					}
				},
				
				destroyCurrentViewType: function(currType,newType) {
					if(currType!=newType) {
						switch (currType) {
							case 'nGraph':
								this.$.nGraph.destroy();
							break;
							case 'documentList':									
								this.$.leftDesktopCol.destroy();
								this.$.documents.destroy();
							break;
							case 'landscape':									
								this.$.landscape.destroy();
							break;
						}
					}
				},
				
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
                 * This function calculates the position of the previewed document
                 * and opens the document on the right side.
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
                 * This function queries the annostore for a single annotation - only for testing purposes
                 * @param {String} annotationIRI identifier of the annotation
                 */
				getAnnotation: function(annotationIRI){
					var request = new enyo.Ajax({
						method: 'GET',
						url: CONSTANTS.ANNOTATION_URL+'?iri='+annotationIRI,
						handleAs: 'text',
						headers: { Accept : 'application/rdf+xml', 'Content-Type' : 'application/x-www-form-urlencoded'},
						published: { timeout: 60000 }
					});
					request.go();
					request.error(this, function(){
						console.log("error");
					});
					request.response(this, function(inSender, inResponse) {
						console.log("success: "+inResponse);
					});
                },

                /**
                 * This function creates and saves a bookmark, which contains the
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
					checkedEntities = typeof checkedEntities !== 'undefined' ? checkedEntities : [];					
                    this.cleanPreviewBox();
                    this.searchWord = searchWord;
                    this.checkedEntities = checkedEntities;
                    if(!isEmpty(searchWord)){
						switch(GLOBAL.viewType) {
							case 'documentList':
								this.$.documents.startLoading();
								this.sendSearchRequest(searchWord, checkedEntities, 'processSearchResponse');
							break;
							case 'nGraph':
								this.$.nGraph.startLoading();
								this.$.nGraph.newGraph(searchWord);
							break;
						}
                        this.$.searchBox.updateInput(this.searchWord);
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
                        url += this.getCheckedEntitiesURL(checkedEntities);
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
                     this.$.documents.addMoreDocuments(documents);
                },

                /**
                 * This function creates the checked entites part of the search URL
                 * @param {Array} checkedEntities the original checked entities
                 * @returns {String} the URL part of the checked entities
                 */
                getCheckedEntitiesURL: function(checkedEntities){
                    var result = '';
                    for(var i=0;i<checkedEntities.length;i++){
                        if(checkedEntities[i].typeFacet){   
                            result += '&type=' + replaceAll(checkedEntities[i].id, '#', '%23');
                        } else {
                            result += '&subject=' + checkedEntities[i].id;
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
					switch(GLOBAL.viewType) {
						case 'documentList':
							this.updateEntityList(rdf, this.searchWord);
							this.updateDocumentList(rdf);
						break;
						case 'nGraph':
							this.newNGraph(rdf);
						break;
						case 'landscape':
						break;
					}
				},

                /**
                 * This functions is called after a success classifying.
                 * @param {Object} rdf the rdf response of the request
                 * @param {String} searchWord the search word
                 */
                processClassifyResponse: function(rdf, searchWord){
                    this.updateEntityList(rdf, searchWord);
                    this.updateClassifiedDocList(rdf);
                },

                /**
                 * This functions updates the document list with ordering after the classifying
                 * @param {Object} rdf the RDF object
                 */
                updateClassifiedDocList: function(rdf){
                    var documents = this.createClassifiedDocList(rdf);
                    this.$.documents.updateList(documents, this.searchWord);
                    this.$.documents.documentCount = this.getDocumentsCount(rdf);
                    this.$.documents.updateCounts();
                },

                /**
                 * This function creates a document list after classifyin
                 * @param {Object} rdf the RDF object
                 * @returns {Array} the created document list
                 */
                createClassifiedDocList: function(rdf){
                    var documents = [];
                    var main = this;

//                    var query = 'SELECT * { ?s ?p ?o }';
//                    rdf.execute(query, function(success, results) {
//                        for(var i=0;i<results.length;i++){
//                            var row = results[i];
//                            console.log(row.s.value + ' - ' + row.p.value + ' - ' + row.o.value);
//                        }
//                    });

                    var query = 'SELECT * { ?url <http://fusepool.eu/ontologies/ecs#textPreview> ?preview';
                    query += '      OPTIONAL { ?url <http://purl.org/dc/terms/title> ?title }';
                    query += '      OPTIONAL { ?url <http://purl.org/dc/terms/abstract> ?content }';
                    query += '      OPTIONAL { ?url <http://www.w3.org/2001/XMLSchema#double> ?orderVal }';
                    query += '}';
                    query += '  ORDER BY DESC(?orderVal)';
                    rdf.execute(query, function(success, results) {
                        if (success) {
                            for(var i=0;i<results.length;i++){
                                var row = results[i];
                                if(!isEmpty(row.content) && (isEmpty(row.title) || isEmpty(row.title.lang) || row.title.lang + '' === main.lang)){
                                    var content = row.content.value;
                                    var title = '';
                                    if(!isEmpty(row.title)){
                                        title = row.title.value;
                                    }
                                    if(!main.containsDocument(documents, content, title)){
                                        documents.push({url: row.url.value, shortContent: content, title: title});
                                    }
                                }
                            }
                        }
                    });
                    return documents;
                },

                /**
                 * This functions group and sort the entities update the entity list on the left side
                 * @param {Object} rdf the rdf object which contains the new entity list
                 * @param {String} searchWord the searched word
                 */
                updateEntityList: function(rdf, searchWord){
                    // The checked facets and type facets
                    var checkedEntities = this.getCheckedEntities(rdf);

                    // The facet and the type facet list
                    var categories = this.getEntities(rdf);

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
                                entityName = entityName.substr(entityName.lastIndexOf('#')+1);
                                var entityCount = category[j].count;
                                var typeFacet = category[j].typeFacet;

                                var entity = {id: entityId, text:entityName, count: entityCount, typeFacet: typeFacet};
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
                getEntities: function(rdf){
                    var entities = [];
                    entities = this.getFacets(rdf);
                    entities = entities.concat(this.getTypeFacets(rdf));
                    return entities;
                },

                /**
                 * This function search the dictionary categories in an rdf object.
                 * @param {Object} rdf the rdf object, which conatins the categories
                 * @returns {Array} the categories array with the entities
                 */
                getCheckedEntities: function(rdf){
                    var checkedEntities = [];
                    var checkedEntities = this.checkedEntitiesFromRdf(rdf);
                    checkedEntities = checkedEntities.concat(this.checkedTypeFacetsFromRdf(rdf));
                    return checkedEntities;
                },

                /**
                 * This function gives the array of the type facets
                 * @param {Object} rdf the RDF object which contains the type facets
                 * @returns {Array} the result array
                 */
                getTypeFacets: function(rdf){
                    var result = [];
                    var query = 'SELECT * { ?v <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://fusepool.eu/ontologies/ecs#ContentStoreView>.';
                    query += '       ?v <http://fusepool.eu/ontologies/ecs#typeFacet> ?f. ';
                    query += '       ?f <http://fusepool.eu/ontologies/ecs#facetCount> ?count. ';
                    query += '       ?f <http://fusepool.eu/ontologies/ecs#facetValue> ?id. ';
                    query += '      OPTIONAL { ?id <http://www.w3.org/2000/01/rdf-schema#label> ?entity }';
                    query += '      OPTIONAL { ?id <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> ?type }';
                    query += '}';
                    rdf.execute(query, function(success, results) {
                        if (success) {
                            for(var i=0;i<results.length;i++){
                                var row = results[i];
                                var entity = row.entity;
                                if(isEmpty(entity)){
                                    entity = row.id.value;
                                } else {
                                    entity = row.entity.value;
                                }
                                var type = row.type;
                                if(isEmpty(type)){
                                    type = 'Facet types';
                                } else {
                                    type = row.type.value;
                                }
                                result.push({entityId: row.id.value, entity: entity, value: type, count: row.count.value, typeFacet: true});
                            }
                        }
                    });
                    return result;
                },

                getFacets: function(rdf){
                    var result = [];
                    var query = 'SELECT * { ?v <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://fusepool.eu/ontologies/ecs#ContentStoreView>.';
                    query += '       ?v <http://fusepool.eu/ontologies/ecs#facet> ?f. ';
                    query += '       ?f <http://fusepool.eu/ontologies/ecs#facetCount> ?count. ';
                    query += '       ?f <http://fusepool.eu/ontologies/ecs#facetValue> ?id. ';
                    query += '      OPTIONAL { ?id <http://www.w3.org/2000/01/rdf-schema#label> ?entity }';
                    query += '      OPTIONAL { ?id <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> ?type }';
                    query += '}';
                    rdf.execute(query, function(success, results) {
                        if (success) {
                            for(var i=0;i<results.length;i++){
                                var row = results[i];
                                if(!isEmpty(row.entity)){
                                    var type = row.type.value;
                                    var categoryName = type.substring(type.lastIndexOf('#')+1);
                                    result.push({entityId: row.id.value, entity: row.entity.value, value: categoryName, count: row.count.value, typeFacet: false});    
                                }
                            }
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
                    var query = 'SELECT * { ?s <http://fusepool.eu/ontologies/ecs#subject> ?id';
                    query += '      OPTIONAL { ?id <http://www.w3.org/2000/01/rdf-schema#label> ?entity }';
                    query += '}';
                    rdf.execute(query, function(success, results) {
                        if (success) {
                            for(var i=0;i<results.length;i++){
                                var row = results[i];
                                if(!isEmpty(row.entity)){
                                    var entity = {id: row.id.value, text: row.entity.value, typeFacet: false};
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
                 * This function search the checked entities in an rdf object and
                 * return with it
                 * @param {Object} rdf the rdf object
                 * @returns {Array} the checked entity list
                 */
                checkedTypeFacetsFromRdf: function(rdf){
                    var checkedTypes = [];
                    var query = 'SELECT * { ?s <http://fusepool.eu/ontologies/ecs#type> ?o }';
                    rdf.execute(query, function(success, results) {
                        for(var i=0;i<results.length;i++){
                            var id = results[i].o.value;
                            var text = id.substring(id.lastIndexOf('#')+1);
                            text = text.substring(text.lastIndexOf('/')+1);
                            var entity = {id: id, text: text, typeFacet: true};
                            checkedTypes.push(entity);
                        }
                    });
                    return checkedTypes;
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
                newNGraph: function(rdf){
                    var documents = this.createDocumentList(rdf);
                    this.$.nGraph.newGraph(documents, this.searchWord);
                },

                /**
                 * This function updates the document list on the middle
                 * @param {Object} rdf the rdf object which contains the new document list
                 */
                updateDocumentList: function(rdf){
                    var documents = this.createDocumentList(rdf);
                    this.$.documents.updateList(documents, this.searchWord, this.checkedEntities);
                    this.$.documents.documentCount = this.getDocumentsCount(rdf);
                    this.$.documents.updateCounts();
                },

                /**
                 * This function delete the preview's content
                 */
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
                    var query = 'SELECT * { ?s <http://fusepool.eu/ontologies/ecs#contentsCount> ?o }';
                    rdf.execute(query, function(success, results) {
                        if (success) {
							if(results.length > 0) {
								result = results[0].o.value;
							}
						}
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
                  
                  //Getting the order of stuff
                  var hits = [];
               
                    rdf.rdf.setPrefix("ecs","http://fusepool.eu/ontologies/ecs#");
                    rdf.rdf.setPrefix("rdf","http://www.w3.org/1999/02/22-rdf-syntax-ns#");
                    var graph;
                    rdf.graph(function(success, things){graph = things;});
                    var triples = graph.match(null, rdf.rdf.createNamedNode(rdf.rdf.resolve("ecs:contents")), null).toArray();
                    var current = triples[0].object

                     while(!current.equals(rdf.rdf.createNamedNode(rdf.rdf.resolve("rdf:nil")))){
                      var hit = graph.match(current, rdf.rdf.createNamedNode(rdf.rdf.resolve("rdf:first")), null).toArray()[0].object;
                      hits.push(hit.nominalValue);
                      console.log("Hit: " + hit.nominalValue);   
                      current = graph.match(current, rdf.rdf.createNamedNode(rdf.rdf.resolve("rdf:rest")), null).toArray()[0].object;
                     }
                     //console.log(graph.toNT());


                    var querylist = 'PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> ';
                    querylist += 'SELECT * {';
                    querylist += '      ?url <http://fusepool.eu/ontologies/ecs#textPreview> ?preview .';
                    querylist += '      ?url <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> ?dtype .';
                    querylist += '      ?url <http://purl.org/dc/terms/abstract> ?content .';
                    querylist += '      { ?url <http://purl.org/dc/terms/title> ?title .';
                    querylist += '        filter ( lang(?title) = "en")';
                    querylist += '      } UNION {  ';
                    querylist += '        ?url <http://purl.org/dc/terms/title> ?title .';
                    querylist += '        filter ( lang(?title) = "")';
                    querylist += '      }'
                    querylist += '}'

                    

              

                   /** This is the tentative to iterate the list at the API level to have it in ORDER 
                   
                    var triples = graph.match(null, rdf.rdf.createNamedNode(rdf.rdf.resolve("ecs:contents")), null).toArray();
                    var hit = graph.match(triples[0].object, store.rdf.createNamedNode(store.rdf.resolve("rdf:rest")), null).toArray();
                    */
                   
                    rdf.execute(querylist, function(success, results) {
                        if (success) {
//                          console.log("DOC: " + results[0].title.value);
//                          console.log("DOC: " + results[1].title.value);

                            for(var rank = 0; rank < hits.length; rank ++){


                              for(var i=0;i<results.length;i++){
                                  var row = results[i];
                                  if(row.url.value!=hits[rank] ||
                                        row.dtype.value.indexOf("ecs") != -1 || 
                                        row.dtype.value.indexOf("owl#A") != -1){
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
                                  var title = '';
                                  if(!isEmpty(row.title)){
                                          title = row.title.value;
                                  }
                                  else {
                                          title = 'Title not found';
                                  }
                                  var dtype = '';
                                  if(!isEmpty(row.dtype)){
                                    console.log("length of dtype: " + row.dtype.length);
                                          dtype = row.dtype.value;
                                  }
                                  else {
                                          dtype = 'Type not found';
                                  }
                                  if(!main.containsDocument(documents, content, title)){
                                          documents.push({url: row.url.value, shortContent: content, title: title, type: dtype});
                                  }
                            }
                          }
                        }
                    });
                    //console.log("Documents: " + documents);
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