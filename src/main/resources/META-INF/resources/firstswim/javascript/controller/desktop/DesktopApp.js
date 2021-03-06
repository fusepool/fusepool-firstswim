jQuery(document).ready(function () {

    function initialization(){

		placeDefaultCookies();
        createUI();
		// setCurrentUser();
        enyo.Scroller.touchScrolling=false;

        /**
		 * This function creates the whole user interface by
		 * initializing necessary components and methods.
		 * @method createUI
		 */
        function createUI(){
            /**
            * @class DocumentApp
            */
            enyo.kind(
            /** @lends DocumentApp.prototype */
            {
                name: 'DocumentApp',
                kind: enyo.Control,

                /**
                 * When the component is being created it renders the
				 * template for the document preview, and calling functions
				 * that process cookie and GET parameters.
				 * @method create
                 */
                create: function(){
                    this.inherited(arguments);
                    renderTemplateDiv();
					this.processCookieValues();
                    this.processGETParameters();
                },

                /**
                 * After the rendering the program calculates and sets the
                 * position of the bookmark popup and the size of the preview box.
				 * @method rendered
                 */
                rendered: function(){
                    this.inherited(arguments);
                    this.previewOriginHeight = jQuery('#' + this.$.previewBox.getOpenDocId()).height();
                    this.changeBMPopupPosition();
					this.initDraggers();
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
												{kind: 'Group', classes: 'viewTypeToggleButtons', onActivate: "onViewTypeToggle", components: [
													{kind: "onyx.TooltipDecorator", components: [
														{kind: "onyx.IconButton", name: 'docListViewButton', classes: 'docListViewButton' },
														{kind: "onyx.Tooltip", content: "Document list view", classes: 'menuItemTooltip', active: false }
													]},
													{kind: "onyx.TooltipDecorator", components: [
														{kind: "onyx.IconButton", name: 'entityListViewButton',  classes: 'entityListViewButton'},
														{kind: "onyx.Tooltip", content: "Entity list view", classes: 'menuItemTooltip', active: false }
													]},
													{kind: "onyx.TooltipDecorator", components: [
														{kind: "onyx.IconButton", name: 'locationViewButton',  classes: 'locationViewButton'},
														{kind: "onyx.Tooltip", content: "LocationMapper", classes: 'menuItemTooltip', active: false }
													]},
													{kind: "onyx.TooltipDecorator", components: [
														{kind: "onyx.IconButton", name: 'landscapeViewButton',  classes: 'landscapeViewButton'},
														{kind: "onyx.Tooltip", content: "Landscape view", classes: 'menuItemTooltip', active: false }
													]},
													{kind: "onyx.TooltipDecorator", components: [
														{kind: "onyx.IconButton", name: 'nGraphViewButton',  classes: 'nGraphViewButton'},
														{kind: "onyx.Tooltip", content: "Network graph view", classes: 'menuItemTooltip', active: false }
													]}
												]},
												{kind: 'onyx.MenuDecorator', name: 'styleSettingsSelect', classes: 'styleSettingsSelect', onSelect: 'selectCss', components: [
													{kind: "onyx.IconButton", name: 'brushButton', classes: 'brushButton' },
													{kind: "onyx.Tooltip", content: "Style settings", classes: 'menuItemTooltip', active: false },
													{kind: "onyx.Menu", name: 'styleSettingsMenu', classes: 'styleSettingsMenu', components: [
														{content: "Default", name: "firstswim", classes: "stylePickerItem", value: 'firstswim'},
														{content: "High contrast", name: "contrast", classes: "stylePickerItem", value: 'contrast'},
														{content: "Orange", name: "beer", classes: "stylePickerItem", value: 'beer'},
														{content: "Clear", name: "clear", classes: "stylePickerItem", value: 'clear'}
													]}
												]},
												{kind: "onyx.TooltipDecorator", components: [
													{kind: "onyx.IconButton", ontap: 'login', name: 'loginButton', classes: 'loginButton loggedOut' },
													{kind: "onyx.Tooltip", content: "Login", classes: 'menuItemTooltip', active: false }
												]}
												/*,
												{
													name: 'bookmark',
													kind: 'Bookmark',
													buttonClass: 'bookmarkButton',
													parentTapFunction: 'createBookmark',
													parentPopupFunction: 'popupBookmark',
													warningPopupClass: 'bookmarkPopup',
													warningPopupContent: '<br/>Your browser doesn\'t support add bookmark via Javascript.<br/><br/>Please insert this URL manually:<br/><br/>'
												} */
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
				 * This function calls the 'initViewType' function which
				 * sets the view type based on cookie values and calls the
				 * 'setCss' function too.
				 * @method processCookieValues
				 */
				processCookieValues: function() {
					this.initViewType();
					this.setCss(readCookie('css'));
				},
				
				/**
				 * This function runs when the user selects a stylesheet.
				 * It calls the 'setCss' function with the proper value.
				 * @method selectCss
				 */
				selectCss: function(inSender, inEvent) {
					this.setCss(inEvent.originator.value);
				},
				
				/**
				 * This function changes the stylesheet behind the page and 
				 * places a cookie.
				 * @method setCss
				 */
				setCss: function(cssName) {
					$("#mainCss").attr("href", CONSTANTS.STYLE_PATH + cssName + ".css");
					createCookie('css', cssName, 30);
				},
				
				/**
				 * This function initializes the view type at the beginning
				 * using the 'viewType' cookie value by setting up the toggle 
				 * buttons and calling the 'createViewType' function with the
				 * proper parameter value.
				 * @method initViewType
				 */
				initViewType: function() {
					switch(readCookie('viewType')) {
						case 'documentList':
							this.$.docListViewButton.setActive(true);
						break;
						case 'entityList':
							this.$.entityListViewButton.setActive(true);
						break;
						case 'locationViewer':
							this.$.locationViewButton.setActive(true);
						break;
						case 'landscape':
							this.$.landscapeViewButton.setActive(true);
						break;
						case 'nGraph':
							this.$.nGraphViewButton.setActive(true);
						break;
						default:
							this.$.docListViewButton.setActive(true);
					}
					this.createViewType(readCookie('viewType'));
				},
				
				/**
				 * This function runs after changing the view type.
				 * First, it checks whether it is really a change or
				 * the same as the current one. If it has to be changed,
				 * it calls the toggle functions, sets the cookie value
				 * and fires a search using the current search term.
				 * @method toggleViewType
				 */
				toggleViewType: function(viewType) {
					if(readCookie('viewType') != viewType) {
						this.destroyCurrentViewType(viewType);
						createCookie('viewType', viewType, 30);
						this.createViewType(viewType);
						this.search(this.searchWord);
					}
				},
				
				/**
				 * This function initializes every components after changing 
				 * view type. It creates both panels and draggers.
				 * @method createViewType
				 */
				createViewType: function(viewType) {
					switch(viewType) {
						default:
						case 'documentList':
							this.createComponent({	name: 'leftDesktopCol',
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
																showDetailsFunction: 'displayDetails'
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
												
							this.createComponent({	name: 'firstDocDragger', classes: 'firstDocDragger verticalDragger' });
							
							this.createComponent({	kind: 'DocumentList',
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
												
							this.createComponent({	name: 'secondDocDragger', classes: 'secondDocDragger verticalDragger' });
							
							this.render();							
							
						break;
						case 'entityList':									
							this.createComponent({	name: 'leftDesktopCol',
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
															dictionaryTitle: 'Organizations',
															titleClass: 'dictionariesMainTitle',
															showDetailsFunction: 'displayDetails'
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
												
							this.createComponent({	name: 'firstDocDragger', classes: 'firstDocDragger verticalDragger' });
							
							this.createComponent({	kind: 'DocumentList',
													name: 'documents',
													openDocFunction: 'openDoc',
													openDocEvent: 'ontap',
													classes: 'documentList',
													loaderClass: 'loader',
													scrollerClass: 'documentListScroll',
													titleClass: 'documentsMainTitle',
													classifyFinishFunction: 'processClassifyResponse',
													titleContent: 'People ',
													documentsCountClass: 'documentsCount',
													noDataLabel: 'No data available',
													moreButtonClass: 'moreButton',
													moreDocumentsFunction: 'moreDocuments'
												});
												
							this.createComponent({	name: 'secondDocDragger', classes: 'secondDocDragger verticalDragger' });
							
							this.render();
							
						break;
						case 'locationViewer':
							this.createComponent({
								kind: 'LocationViewer',
								name: 'locationViewer',
								classes: 'locationViewerPanel',
								loaderClass: 'loader',
								titleClass: 'locationViewerMainTitle',
								titleContent: 'Location viewer ',
								noDataLabel: 'No data available'
							});
							this.render();
						break;
						case 'landscape':						
							this.createComponent({
									kind: 'Landscape',
									name: 'landscape',
									classes: 'landscapePanel',
									loaderClass: 'loader',
									titleClass: 'landscapeMainTitle',
									titleContent: 'Landscape '
								});
							this.render();
						break;
						case 'nGraph':
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
							this.createComponent({	name: 'nGraphDragger', classes: 'nGraphDragger verticalDragger' });
							this.render();
						break;
					}
				},
				
				/**
				 * This function handles view type toggling by calling the
				 * toggle function with the proper parameter.
				 * @method onViewTypeToggle
				 */
				onViewTypeToggle: function(inSender, inEvent) {
					if (inEvent.originator.getActive()) {
						//var selected = inEvent.originator.indexInContainer();
						switch(inEvent.originator.name) {
							case 'docListViewButton':
								this.toggleViewType('documentList');
							break;
							case 'entityListViewButton':
								this.toggleViewType('entityList');
							break;
							case 'locationViewButton':
								this.toggleViewType('locationViewer');
							break;
							case 'landscapeViewButton':
								this.toggleViewType('landscape');
							break;
							case 'nGraphViewButton':
								this.toggleViewType('nGraph');
							break;
						}
					}
				},
				
				/**
				 * This function destroys every components of the current view type
				 * in case it's not the same as the new view type.
				 * @method destroyCurrentViewType
				 */
				destroyCurrentViewType: function(newType) {
					switch (readCookie('viewType')) {
						case 'nGraph':
							this.$.nGraph.destroy();
							this.$.nGraphDragger.destroy();
						break;
						case 'documentList':	
						case 'entityList':										
							this.$.leftDesktopCol.destroy();
							this.$.firstDocDragger.destroy();
							this.$.documents.destroy();
							this.$.secondDocDragger.destroy();
						break;
						case 'landscape':									
							this.$.landscape.destroy();
						break;
						case 'locationViewer':									
							this.$.locationViewer.destroy();
						break;
					}
				},
				
				/**
				 * This function initializes all the draggers that the page contains.
				 * It uses jQuery 'draggable'.
				 * @method initDraggers
				 */
				initDraggers: function() {
					if($('.firstDocDragger').length > 0) {
						$('.firstDocDragger').draggable({
							axis: "x",
							drag: function( event, ui ) {								
								var docListCalcWidth = parseInt($('.previewBox').css('left'), 10) - ((ui.position.left - 10 ) + 30);								
								if( ui.position.left > 80 && docListCalcWidth > 160 ) {
									$('.leftDesktopCol').css('width', ( ui.position.left - 10 )+'px');
									$('.documentList').css('left', ( ui.position.left + 10 )+'px');
									$('.documentList').css('width', docListCalcWidth+'px');
								}
								else {
									event.type = 'mouseup';
									$('.firstDocDragger').trigger(event);
								}
							}
						});
						
					}
					if($('.secondDocDragger').length > 0) {
						$('.secondDocDragger').draggable({
							axis: "x",
							drag: function( event, ui ) {
								var docListCalcWidth = ui.position.left - ($('.leftDesktopCol').width() + 20);
								if( ($(document).width() - ui.position.left ) > 80 && docListCalcWidth > 160 ) {
									$('.documentList').css('width', docListCalcWidth + 'px');
									$('.previewBox').css('left', ( ui.position.left + 10 )+'px');
								}
								else {
									event.type = 'mouseup';
									$('.secondDocDragger').trigger(event);
								}
							}
						});
					}
					if($('.nGraphDragger').length > 0) {
						var main = this;
						$('.nGraphDragger').draggable({
							axis: "x",
							drag: function( event, ui ) {
								var nGraphCalcWidth = ui.position.left - 10;
								if( ($(document).width() - ui.position.left ) > 80 && nGraphCalcWidth > 160 ) {
									$('.nGraphDiv').css('width', nGraphCalcWidth + 'px');
									$('.previewBox').css('left', ( ui.position.left + 10 )+'px');
								}
								else {
									event.type = 'mouseup';
									$('.nGraphDragger').trigger(event);
								}
								main.$.nGraph.onDivResize();
							}
						});
					}
				},
				
                /**
                 * This function is called, when the user clicks on the login button.
                 * It displays the login popup window.
				 * @method login
                 */
                login: function(){
                    this.$.loginPopup.showLogin();
                },

                /**
                 * This function is called when the user clicks on the logo.
                 * It navigates to the Fusepool main site.
				 * @method clickLogo
                 */
                clickLogo: function(){
                    window.open(CONSTANTS.FUSEPOOL_MAIN_URL);
                },

                /**
                 * This function processes GET parameters. If it finds 'search' or
                 * 'entity', it fires a search and open the document if there is the
                 * 'openPreview' parameter.
				 * @method processGETParameters
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
                 * and opens the document on the right.
				 * @method openDoc
                 * @param {String} docURI the URI of the clicked document
                 * @param {Object} inEvent mouse over on a short document event
                 */
                openDoc: function(docURI, inEvent){
                    if(!isEmpty(inEvent)){
                        var topMessage = jQuery('#' + this.$.topMessageBox.getId());
                        var topMessageVisible = topMessage.is(':visible');
                        var topMessageHeight = 0;
                        if(topMessageVisible){
                            topMessageHeight = topMessage.outerHeight();
                            alert(topMessageHeight);
                        }
                    }
                    this.$.previewBox.openDoc(docURI);
                },
				
                /**
                 * This function queries the Annostore for a single annotation - only for testing purposes.
				 * @method getAnnotation
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
						// console.log("success: "+inResponse);
					});
                },

                /**
                 * This function creates and saves a bookmark, which contains the
                 * search word, the unchecked entities and the opened document.
				 * @method createBookmark
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
                        var documentURL = this.$.previewBox.getDocumentURI();
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
                 * This function shows a message in a popup.
				 * @method popupBookmark
                 * @param {String} message the message
                 */
                popupBookmark: function(message){
                    this.$.bookmarkPopup.show();
                    this.$.bookmarkPopup.setContent(message);
                    this.changeBMPopupPosition();
                },

                /**
                 * This function calculates the position of the popup to be 
                 * displayed horizontally in the center, vertically on the top.
				 * @method changeBMPopupPosition
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
				 * @method resizeHandler
                 */
                resizeHandler: function() {
                    this.inherited(arguments);
                    this.changeBMPopupPosition();
                },

                /**
                 * This function reduces the preview box height if there isn't enough
                 * place for that. It sets the default height for the box otherwise.
				 * @method changePreviewBoxSize
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
                 * This function calls the ajax search if the search word is not empty.
				 * @method search
                 * @param {String} searchWord the search word
                 * @param {Array} checkedEntities the checked entities on the left side
                 */
                search: function(searchWord, checkedEntities){
					checkedEntities = typeof checkedEntities !== 'undefined' ? checkedEntities : [];
                    this.searchWord = searchWord;
					createCookie('lastSearch',searchWord,30);
                    this.checkedEntities = checkedEntities;
                    if(!isEmpty(searchWord)){
						this.cleanPreviewBox();
						switch(readCookie('viewType')) {
							case 'entityList':
							case 'documentList':
								this.$.documents.startLoading();
								this.sendSearchRequest(searchWord, checkedEntities, 'processSearchResponse');
							break;
							case 'nGraph':
								this.$.nGraph.newGraph();	
							break;
							case 'landscape':
								this.$.landscape.startLoading();
								this.sendSearchRequest(searchWord, [], 'processSearchResponse');
							break;
							case 'locationViewer':
								this.$.locationViewer.search(searchWord);
							break;
						}
                        this.$.searchBox.updateInput(this.searchWord);
                    }
                },

                /**
                 * This function sends an ajax request for searching.
				 * @method sendSearchRequest
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
                 * This function creates the search URL for the query.
				 * @method createSearchURL
                 * @param {String} searchWord the search word
                 * @param {Array} checkedEntities the checked entities
                 * @param {Number} offset offset of the query
                 * @return {String} the search url
                 */
                createSearchURL: function(searchWord, checkedEntities, offset){
					
					// var labelPattern = /^.*'label:'.*$/;
					// if(labelPattern.test(searchWord)) {
					
					// }
					// var predictedLabelPattern = /^.*'predicted label:'.*$/;
					// if(predictedLabelPattern.test(searchWord)) {
					
					// }
					
					if(readCookie('viewType') == "entityList") {
						var url = CONSTANTS.ENTITY_SEARCH_URL;
					}
					else {
						var url = CONSTANTS.SEARCH_URL;
					}
                    if(isEmpty(offset)){
                        offset = 0;
                    }
                    url += '?search='+searchWord;
                    if(checkedEntities.length > 0){
                        url += this.getCheckedEntitiesURL(checkedEntities);
                    }
                    url += '&offset='+offset+'&maxFacets='+readCookie('maxFacets')+'&items='+readCookie('items');
                    return url;
                },

                /**
                 * This function sends a request for more documents.
				 * @method moreDocuments
                 * @param {Number} offset the offset of the document (e.g. offset = 10 -> documents 10-20)
                 */
                moreDocuments: function(offset){
                    this.sendSearchRequest(this.searchWord, this.checkedEntities, 'processMoreResponse', offset);
                },

                /**
                 * This function runs after the ajax more search is done.
                 * This function calls the document updater function.
				 * @method processMoreResponse
                 * @param {Boolean} success status of the search query
                 * @param {Object} rdf the response rdf object
                 */
                processMoreResponse: function(success, rdf){
                     var documents = this.createDocumentList(rdf);
                     this.$.documents.addMoreDocuments(documents);
                },

                /**
                 * This function creates a URL fraction that represents
				 * the checked entities.
				 * @method getCheckedEntitiesURL
                 * @param {Array} checkedEntities the original checked entities
                 * @return {String} built URL fraction
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
                 * This function runs after the ajax search is done. It calls
                 * the entity list updater and the document updater functions.
				 * @method processSearchResponse
                 * @param {Boolean} success status of the search query
                 * @param {Object} rdf the response rdf object
                 */
                processSearchResponse: function(success, rdf){
                    if(success) {
						switch(readCookie('viewType')) {
							case 'documentList':
							case 'entityList':
								this.updateEntityList(rdf, this.searchWord);
								this.updateDocumentList(rdf);
								this.cleanDetailsBox();
							break;
							case 'landscape':
								FusePool.Landscaping.doSearch();
							break;
						}
					}
					else {
						this.$.documents.updateList([], this.searchWord, this.checkedEntities);
						this.$.documents.documentsCount = 0;
						this.$.documents.updateCounts();
					}
				},

                /**
                 * This function is called after a successful classification.
				 * @method processClassifyResponse
                 * @param {Object} rdf the rdf response of the request
                 * @param {String} searchWord the search word
                 */
                processClassifyResponse: function(rdf, searchWord){
                    this.updateEntityList(rdf, searchWord);
                    this.updateClassifiedDocList(rdf);
                },

                /**
                 * This function updates the document list after classification
				 * to have the correct order.
				 * @method updateClassifiedDocList
                 * @param {Object} rdf the RDF object
                 */
                updateClassifiedDocList: function(rdf){
                    var documents = this.createClassifiedDocList(rdf);
                    this.$.documents.updateList(documents, this.searchWord);
                    this.$.documents.documentsCount = this.getDocumentsCount(rdf);
                    this.$.documents.updateCounts();
                },

                /**
                 * This function creates a document list after classification.
				 * @method createClassifiedDocList
                 * @param {Object} rdf the RDF object
                 * @return {Array} the created document list
                 */
                createClassifiedDocList: function(rdf){
                    var documents = [];
                    var main = this;

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
                                    if(!main.containsDocument(documents, content, title, row.url.value)){
                                        documents.push({url: row.url.value, shortContent: content, title: title});
                                    }
                                }
                            }
                        }
                    });
                    return documents;
                },

                /**
                 * This function groups and sorts the entities and updates
				 * the entity list on the left side.
				 * @method updateEntityList
                 * @param {Object} rdf the rdf object which contains the new entity list
                 * @param {String} searchWord the search word
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
                 * This function searches for dictionary categories in an rdf object.
				 * @method getEntities
                 * @param {Object} rdf the rdf object
                 * @return {Array} the categories array with the entities
                 */
                getEntities: function(rdf){
                    var entities = [];
                    entities = this.getFacets(rdf);
                    entities = entities.concat(this.getTypeFacets(rdf));
                    return entities;
                },

                /**
                 * This function searches for dictionary categories in an rdf object.
				 * @method getCheckedEntities
                 * @param {Object} rdf the rdf object
                 * @return {Array} the categories array with the entities
                 */
                getCheckedEntities: function(rdf){
                    var checkedEntities = [];
                    var checkedEntities = this.checkedEntitiesFromRdf(rdf);
                    checkedEntities = checkedEntities.concat(this.checkedTypeFacetsFromRdf(rdf));
                    return checkedEntities;
                },

                /**
                 * This function returns an array of type facets found in an RDF object.
				 * @method getTypeFacets
                 * @param {Object} rdf the RDF object which contains the type facets
                 * @return {Array} the result array
                 */
                getTypeFacets: function(rdf){
                    var result = [];
                    var query = 'SELECT * { ?v <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://fusepool.eu/ontologies/ecs#ContentStoreView>.';
                    query += '       ?v <http://fusepool.eu/ontologies/ecs#typeFacet> ?f. ';
                    query += '       ?f <http://fusepool.eu/ontologies/ecs#facetCount> ?count. ';
                    query += '       ?f <http://fusepool.eu/ontologies/ecs#facetValue> ?id. ';
					query += '		OPTIONAL { { ?id <http://www.w3.org/2000/01/rdf-schema#label> ?entity .';
					query += '        filter ( lang(?entity) = "en")';
					query += '      } UNION {  ';
					query += '        ?id <http://www.w3.org/2000/01/rdf-schema#label> ?entity .';
					query += '        filter ( lang(?entity) = "")';
					query += '      } } ';
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

				/**
                 * This function returns an array of facets found in an RDF object.
				 * @method getFacets
                 * @param {Object} rdf the RDF object which contains the facets
                 * @return {Array} the result array
				*/
                getFacets: function(rdf){
                    var result = [];
                    var query = 'SELECT * { ?v <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://fusepool.eu/ontologies/ecs#ContentStoreView>.';
                    query += '       ?v <http://fusepool.eu/ontologies/ecs#facet> ?f. ';
                    query += '       ?f <http://fusepool.eu/ontologies/ecs#facetCount> ?count. ';
                    query += '       ?f <http://fusepool.eu/ontologies/ecs#facetValue> ?id. ';
					query += '		OPTIONAL { { ?id <http://www.w3.org/2000/01/rdf-schema#label> ?entity .';
					query += '        filter ( lang(?entity) = "en")';
					query += '      } UNION {  ';
					query += '        ?id <http://www.w3.org/2000/01/rdf-schema#label> ?entity .';
					query += '        filter ( lang(?entity) = "")';
					query += '      } } ';
                    query += '      OPTIONAL { ?id <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> ?type }';
                    query += '}';
                    rdf.execute(query, function(success, results) {
                        if (success) {
                            for(var i=0;i<results.length;i++){
                                var row = results[i];
								// if(!isEmpty(row.entity)){ 	// X branch
                                if(!isEmpty(row.entity) && !isEmpty(row.type)){
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
                 * This function searches for the checked entities in an RDF object and
                 * returns them.
				 * @method checkedEntitiesFromRdf
                 * @param {Object} rdf the rdf object
                 * @return {Array} the checked entity list
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
                                    var entity = {id: row.id.value, text: row.entity.value, count: -1, typeFacet: false};
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
                 * This function searches for the checked entities in an RDF object and
                 * returns them.
				 * @method checkedTypeFacetsFromRdf
                 * @param {Object} rdf the rdf object
                 * @return {Array} the checked entity list
                 */
                checkedTypeFacetsFromRdf: function(rdf){
                    var checkedTypes = [];
                    var query = 'SELECT * { ?s <http://fusepool.eu/ontologies/ecs#type> ?o }';
                    rdf.execute(query, function(success, results) {
                        for(var i=0;i<results.length;i++){
                            var id = results[i].o.value;
                            var text = id.substring(id.lastIndexOf('#')+1);
                            text = text.substring(text.lastIndexOf('/')+1);
                            var entity = {id: id, text: text, count: -1, typeFacet: true};
                            checkedTypes.push(entity);
                        }
                    });
                    return checkedTypes;
                },

                /**
                 * This function decides whether an entity list contains an entity or not.
				 * @method containsEntity
                 * @param {Array} entities the array of the entities
                 * @param {String} entity the entity
                 * @return {Boolean} true, if the list contains the entity, false otherwise
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
                 * This function deletes every entity from an array that equals
                 * a given entity (after a given index).
				 * @method deteleLaterEntities
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
                 * This function updates the document list in the middle.
				 * @method updateDocumentList
                 * @param {Object} rdf the RDF object which contains the new document list
                 */
                updateDocumentList: function(rdf){
                    this.$.documents.documentsCount = this.getDocumentsCount(rdf);
                    this.$.documents.updateCounts();
					if(this.$.documents.documentsCount>0) {
						var documents = this.createDocumentList(rdf);
					}
					else {
						var documents = [];
					}
					this.$.documents.updateList(documents, this.searchWord, this.checkedEntities);
                },

                /**
                 * This function deletes the content from the Preview panel.
				 * @method cleanPreviewBox
                 */
                cleanPreviewBox: function(){
                    this.$.previewBox.clean();
                },
				
                /**
                 * This function deletes the content from the Details panel.
				 * @method cleanDetailsBox
                 */
                cleanDetailsBox: function(){
                    this.$.detailsBox.clean();
                },

                /**
                 * This function searches for the count of documents in an rdf object.
				 * @method getDocumentsCount
                 * @param {Object} rdf the rdf object, which contains the count of documents.
                 * @return {Number} the count of documents
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
				 * This function creates an ordered list of documents from an rdf object.
				 * @method createDocumentList
				 * @param {Object} rdf the rdf object
				 * @return {Array} the document list
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
					
					if(readCookie('viewType') == "entityList") {							
						var querylist = 'PREFIX foaf: <http://xmlns.com/foaf/0.1/>' + 
						'PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>' + 
						'SELECT ?url ?name ?addresslocality ?streetaddress ' + 
						'WHERE { ' + 
							'?url rdf:type foaf:Person . ' + 
							'?url foaf:name ?name .  ' + 
							'?url <http://schema.org/address> ?addressURI . ' + 
							'?addressURI <http://schema.org/addressLocality> ?addresslocality . ' + 
							'?addressURI <http://schema.org/streetAddress> ?streetaddress ' + 
						'}';
					}
					else {
						var querylist = 'PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> ';
							querylist += 'SELECT * {';
							querylist += '      { ?url <http://purl.org/dc/terms/title> ?title . ';
							querylist += '        filter ( lang(?title) = "en")';
							querylist += '      } UNION {  ';
							querylist += '        ?url <http://purl.org/dc/terms/title> ?title . ';
							querylist += '        filter ( lang(?title) = "")';
							querylist += '      }';
							querylist += '      OPTIONAL { ?url <http://purl.org/dc/terms/abstract> ?abst } . ';
							querylist += '      OPTIONAL { ?url <http://fusepool.eu/ontologies/ecs#textPreview> ?preview } . ';
							querylist += '      OPTIONAL { ?url <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> ?dtype } . ';
							querylist += '}';
					}
					
					/* This is the tentative to iterate the list at the API level to have it in ORDER 
						var triples = graph.match(null, rdf.rdf.createNamedNode(rdf.rdf.resolve("ecs:contents")), null).toArray();
						var hit = graph.match(triples[0].object, store.rdf.createNamedNode(store.rdf.resolve("rdf:rest")), null).toArray(); */

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
									
									//// TITLE ////
									var title = '[Unknown]';
									if(!isEmpty(row.title)){
										title = row.title.value;
									}
									else if(!isEmpty(row.name)) {
										title = row.name.value;
									}
									
									//// SHORT CONTENT ////									
									var shortContent = '';
									if(!isEmpty(row.abst)) {
										shortContent = row.abst.value;
									}
									else if(!isEmpty(row.preview)) {
										shortContent = row.preview.value;
									}
									else if(!isEmpty(row.addresslocality) && !isEmpty(row.streetaddress)) {
										shortContent = row.addresslocality.value + ', ' + row.streetaddress.value;
									}
									else {
										var exclude = ['http://www.w3.org/1999/02/22-rdf-syntax-ns#type','http://purl.org/dc/terms/title'];
										shortContent = getAPropertyValue(rdf, row.url.value, exclude);
									}
									
									//// DOCTYPE ////
									var dtype = '[Type not found]';
									if(!isEmpty(row.dtype)){
										dtype = row.dtype.value;
									}
									
									if(!main.containsDocument(documents, shortContent, title, row.url.value)){
										documents.push({url: row.url.value, shortContent: shortContent, title: title, type: dtype});
									}
								}
							}
						}
					});
					
					return documents;
				},
				
                /**
                 * This function decides whether a document list contains
				 * a document with a specific content and title or not.
				 * @method containsDocument
                 * @param {Array} documents the list of documents
                 * @param {String} content content of the other document
                 * @param {String} title title of the other document
                 * @return {Boolean} true, if the list contains, false otherwise
                 */
                containsDocument: function(documents, content, title, url){
                    for(var i=0;i<documents.length;i++){
                        if(documents[i].url === url || (documents[i].shortContent === content && documents[i].title === title)){
                            return true;
                        }
                    }
                    return false;
                },

                /**
                 * This function calls the content updater function of the
				 * details box.
				 * [replaced with function 'displayDetails']
				 * @method updateDetails
                 * @param {String} title the title of the details
                 * @param {Object} addressObject the address object
                 */
                updateDetails: function(title, addressObject){
                    this.$.detailsBox.updateDetails(title, addressObject);
                },
				
				/**
				 * This function calls the display function of the
				 * details box.
				 * @method displayDetails
				 * @param {Object} rdf rdf with the metadata of the entity
				 */
				displayDetails: function(rdf){
					this.$.detailsBox.displayDetails(rdf);
				}
            });
        }
        new DocumentApp().renderInto(document.getElementById('main'));
        renderTemplateDiv();
        
        function renderTemplateDiv(){
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
