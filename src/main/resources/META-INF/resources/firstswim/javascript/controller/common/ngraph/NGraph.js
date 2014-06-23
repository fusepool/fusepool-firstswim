/**
* @class NGraph
*/
enyo.kind(
/** @lends NGraph.prototype */
{
    name: 'NGraph',
    kind: enyo.Control,

    published: {
        offset: 0,
        searchWord: '',
        titleClass: '',
        titleContent: '',
        noDataLabel: '',
        openDocFunction: '',
        loaderClass: '',
        openDocEvent: 'ontap',
		rGraph: null,
		graphJSON: null
    },

    /**
     * When the component is created the program sets the title's properties and
     * hides the loader.
     */
    create: function(){
        this.inherited(arguments);
        this.$.loader.hide();
        this.$.title.setContent(this.titleContent);
        this.$.title.setClasses(this.titleClass);
        this.$.loader.setClasses(this.loaderClass);
		this.canvasResizer(); 
    },

    components: [
        { tag: 'div', name: 'title' },
		{ name: 'loader' },
		{ tag: 'div', name: 'nGraphDiv', published: { id: 'nGraphDiv'}, classes: 'nGraphDiv' }
    ],
		
    /**
     * This function runs, when the user starts a search. It clears the current 
     * content and shows the loader.
     */
    startLoading: function(){
        this.$.loader.show();
        this.$.nGraphDiv.setContent('');
        this.$.nGraphDiv.destroyClientControls();
        this.$.nGraphDiv.render();
	},
	
	/**
	 * This function returns default values for the graph.
	 * @param {String} propertyName name of the property (animation/edge/node/navigation/background)
	 * @returns {Object} the value
	 */
	getGraphDefaults: function(propertyName) {
		switch(propertyName) {
			case 'animation': 
				return { type: 'replot', duration: 0, fps: 10, hideLabels: false };
			break;
			case 'edge': 
				return { overridable: true, color: '#cadada', lineWidth:1 };
			break;
			case 'node': 
				return { overridable: true, color: '#239fa0' };
			break;
			case 'navigation': 
				return  { enable: true, panning: true, zooming: 100 };
			break;
			case 'background': 
				return  { CanvasStyles: { strokeStyle: '#e0e0e0' } };
			break;
			default:
				return null;
		}
	},
	
	/**
	 * This function runs a search for documents.
	 * @param {String} searchWord a search term
	 * @param {String} URI an entity that filters the result. "query" means no filter needed.
	 */
	search: function(nodeObj,URI,level){
		var main = this;
		
		var url = CONSTANTS.SEARCH_URL;
		if(URI=="query") {
			url+='?search='+nodeObj.name;
			this.owner.searchWord = nodeObj.name;
		}
		else {
			url+='?search=&subject='+URI;
		}		
		url+='&offset=0&maxFacets=0&items=5';
		
		var store = rdfstore.create();
		store.load('remote', url, function(success) {
			if(success) {
				var documents = main.createDocumentList(store);
				main.addDocNodes(documents,nodeObj,level);
			}
		});
	},
	
	/**
	 * This function create the document list from the rdf object.
	 * @param {Object} rdf the rdf object, which contains the documents
	 * @returns {Array} the document list
	 */
	createDocumentList: function(rdf){
		var documents = [];
		var main = this;

		var querylist = 'PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> ';
		querylist += 'SELECT * {';
		querylist += '      { ?url <http://purl.org/dc/terms/title> ?title .';
		querylist += '        filter ( lang(?title) = "en")';
		querylist += '      } UNION {  ';
		querylist += '        ?url <http://purl.org/dc/terms/title> ?title .';
		querylist += '        filter ( lang(?title) = "")';
		querylist += '      }';
		querylist += '      OPTIONAL { ?url <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> ?dtype }';
		querylist += '}';
		
		rdf.execute(querylist, function(success, results) {
			if (success) {
				for(var i=0;i<results.length;i++){
					var row = results[i];
					var title = 'Title not found';
					if(!isEmpty(row.title)){
						title = row.title.value;
					}
					if(!main.owner.containsDocument(documents, row.url.value)){
						documents.push({url: row.url.value, title: title});
					}
				}
			}
		});
		return documents;
	},
	
	/**
	* This function gets the documents and pushes them to the nodeObj
	* as child nodes, and calls the buildGraphJSON to continue building
	* the graph on the given branch. 
	 * @param {Object} docNodes retrieved documents
	 * @param {Object} nodeObj points to the parent node
	 * @param {Number} level the current level
	*/
	addDocNodes: function(docNodes,nodeObj,level) {
		var nodeLimit = readCookie('nodeLimit').split(',');
		for(var i=0; i<docNodes.length && i<( level >= nodeLimit.length ? 4 : nodeLimit[level]); i++) {
			nodeObj.children.push({ id: docNodes[i].url, name: cutStr(docNodes[i].title,60), children: [], data: { type: "document", $type: "square", $color: "#239fa0" }});
			this.buildGraphJSON(nodeObj.children[nodeObj.children.length-1],docNodes[i].url,level);
		}
	},
	
	/**
	 * This function builds an object recursively until it reaches the desired level. 
	 * It's set to 2, the centre node is level 0. This object will be used to feed the 
	 * graph. Important: The centre node must be initialized already before calling
	 * this function.
	 * @param {String} searchWord a search term
	 * @param {String} URI an entity that filters the result. "query" means no filter (for centre node)
	 */
	buildGraphJSON: function(nodeObj,URI,level) {
		var main = this;
		level++;
		
		if(level < 4) {
			switch(nodeObj.data.type) {
				case "query":
				case "subject":
					this.search(nodeObj,URI,level);
					this.redrawGraph();
				break;
				case "document":
					var url = CONSTANTS.DETAILS_URL + '?iri=' + URI;
					var store = rdfstore.create();
					store.load('remote', url, function(success) {
						var subjNodes = main.getSubjectConnections(success, store);
						var nodeLimit = readCookie('nodeLimit').split(',');						
						main.createSubjNodes(nodeObj, subjNodes, nodeLimit, level, 0);						
					});				
				break;
			}
		}
	},
	
	/**
	* After getting the subject children of a given document,
	* this function iterates through them and initialize the 
	* nodes in the graph after getting the label information.
	* @param {Object} nodeObj the parent node
	* @param {Object} subjNodes the extracted children
	* @param {Number} nodeLimit the node limit on the current level
	* @param {Number} level the current level 
	* @param {Number} i the current index 
	*/
	createSubjNodes: function(nodeObj, subjNodes, nodeLimit, level, i){
		var main=this;
		if(i<( level >= nodeLimit.length ? 4 : nodeLimit[level]) && i<subjNodes.length) {
			var title = '(?)';
			var url = CONSTANTS.DETAILS_URL + '?iri=' + subjNodes[i];
			var sstore = rdfstore.create();
			sstore.load('remote', url, function(success) {				
				var query = 'SELECT * { ?s <http://www.w3.org/2000/01/rdf-schema#label> ?o }';
				sstore.execute(query, function(success, results) {
					if(success && !isEmpty(results[0])) {
						if (success && results.length > 0) {
							nodeObj.children.push({ id: subjNodes[i], name: results[0].o.value, children: [], data: { type: "subject", $type: "triangle", $color: "#55cdff" }});
							var ind = nodeObj.children.length-1;
							main.buildGraphJSON(nodeObj.children[ind],subjNodes[i],level);
							main.redrawGraph();	
						}
					}
					i++;
					main.createSubjNodes(nodeObj, subjNodes, nodeLimit, level, i);	
				});								
			});
		}
	},
	
	/**
	 * This function filters an rdf object and returns an array of URIs found in
	 * dc:subject
	 * @param {Boolean} success whether the search query was success or not
	 * @param {Object} rdf the response rdf object
	 * @returns {Array} URIs of the connected subjects
	 */
	getSubjectConnections: function(success, rdf) {
		var subjectConnections = [];
		var main = this;

		var query = 'SELECT * { ?s <http://purl.org/dc/elements/1.1/subject> ?subj }';  		
		rdf.execute(query, function(success, results) {
            if (success) {
                for(var i=0;i<results.length;i++){
					var row = results[i];
					if(!isEmpty(row.subj)) {
						subjectConnections.push(row.subj.value);
					}
				}
            }
        });
		return subjectConnections;
    },

	/**
	 * This function queries the platform using a URI for getting the title of the entity.
	 * @param {String} URI the entity's URI which title is needed
	 * @returns {String} title of the given entity
	 */
	getTitleByURI: function(URI) {
		var title = '(?)';
		var url = CONSTANTS.DETAILS_URL + '?iri=' + URI;
		var store = rdfstore.create();
		store.load('remote', url, function(success) {
			title = getRDFPropertyValue(store, 'http://www.w3.org/2000/01/rdf-schema#label');
		});
		return title;
	},
	
	/**
	 * After a new search term has been entered, the graph is being redrawn.
	 * In case of the very first search, a completely new graph is being initialized.
	 * @param {String} searchWord the search word
	 */
	newGraph: function() {
        this.searchWord = this.owner.searchWord;
		var main = this;
		
		if(isEmpty(this.graphJSON)) {
			this.rGraph = new $jit.RGraph({
				injectInto: main.$.nGraphDiv.id,
				background: main.getGraphDefaults('background'),
				Navigation: main.getGraphDefaults('navigation'),
				Node: main.getGraphDefaults('node'),
				Edge: main.getGraphDefaults('edge'),
				onBeforeCompute: function(node){ } ,
				onCreateLabel: function(domElement, node){  
					domElement.innerHTML = node.name;  
					domElement.onclick = function(){  
						main.rGraph.onClick(node.id, {
							onComplete: function() {
								main.onNodeClick(node, 'ontap');
							}
						});  
					};
					domElement.onmouseover = function(){ 
						domElement.style.color = '#09a7a9';
						main.onNodeHover(node, 'ontap');
					};
					domElement.onmouseout = function(){  
						domElement.style.color = '#555';
						main.onNodeLeave(node, 'ontap');
					};  
				},
				onPlaceLabel: function(domElement, node){  
					var style = domElement.style;  
					style.display = '';  
					style.cursor = 'pointer';  
					style.color = "#555";  
					style.maxWidth = "130px";
					
					if(node._depth == 0) {
						style.fontSize = "13px";  
					}
					else {  
						style.fontSize = "12px";
					}
					var left = parseInt(style.left);  
					var w = domElement.offsetWidth;  
					style.left = (left - w / 2) + 'px';  
				}  
			});
		}
		
		this.graphJSON = { id: 'query', name: this.searchWord, children: [], data: { type: 'query', $color: "#c5c5c5" }};
		this.rGraph.loadJSON(this.graphJSON);
		this.rGraph.compute();		
		this.buildGraphJSON(this.graphJSON,'query',0);
	},
	
	/** 
	 * This function redraws the graph using the object in the graphJSON variable.
	 */
	redrawGraph: function() {
		this.rGraph.op.morph(this.graphJSON, this.getGraphDefaults('animation'));
	},

    /**
     * This function is called when the user clicks on a node.
	 * It calls a parent function, which can call the preview box
	 * to open a document.
	 * @param {Object} node the clicked node
	 * @param {Event} inEvent the click event
     */
    onNodeClick: function(node, inEvent){
		var centre = { id: node.id, name: node.name, children: [], data: { type: node.data.type, $type: node.data.$type, $color: node.data.$color }};
		this.graphJSON = centre;
		this.buildGraphJSON(centre, node.id, 0);
		
		this.rGraph.op.morph(this.graphJSON, this.getGraphDefaults('animation'));
    },
	
	/**
	 * This function clears the timeout that has been set 
	 * for node hover.
	 * @param {Object} node the clicked node
	 * @param {Event} inEvent the click event
	 */
	onNodeLeave: function(node, inEvent) {
		clearTimeout(this.timeout);
	},
	
	/**
	 * This function sets a 1 sec timeout before displaying details.
	 * @param {Object} node the clicked node
	 * @param {Event} inEvent the click event
	 */
	onNodeHover: function(node, inEvent) {
		if(node.id!='query') {
			var main = this;
			clearTimeout(this.timeout);
			this.timeout = setTimeout(function() {
				main.owner[main.openDocFunction](node.id, inEvent);
				return false;
			},1000);
		}
	},
	
	/**
	* This functions shows a message in the network-graph panel
	* @param {String} message the message to be displayed
	*/
    showMessage: function(message){
        this.$.nGraphDiv.destroyClientControls();
        this.$.nGraphDiv.setContent(message);
    },
	
	/**
	 * This function defines a function on window resize event which 
	 * resizes the graph canvas to the proper size.
	 */
	canvasResizer: function() {
		var main=this;
		$(window).resize(function() {
			if(!isEmpty(main.rGraph)) {
				main.rGraph.canvas.resize($('.nGraphDiv').width(), $('.nGraphDiv').height()); 
			}
		});
	}
});
