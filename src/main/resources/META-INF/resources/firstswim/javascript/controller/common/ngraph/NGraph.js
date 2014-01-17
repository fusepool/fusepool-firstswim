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
    },

    components: [
        { tag: 'div', name: 'title' },
		{ name: 'loader' },
		{ tag: 'div', name: 'nGraphDiv', published: { id: 'nGraphDiv'}, classes: 'nGraphDiv' }
    ],

    /**
     * This function runs, when the user starts a search. It clears the list
     * and shows the loader.
     */
    startLoading: function(){
        this.$.loader.show();
        this.$.nGraphDiv.setContent('');
        this.$.nGraphDiv.destroyClientControls();
        this.$.nGraphDiv.render();
	},
	
	getGraphDefaults: function(propertyName) {
		switch(propertyName) {
			case 'animation': 
				return { type: 'fade:seq', duration: 300, fps: 30, hideLabels: false };
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
	
	search: function(searchWord, URI){
		var main = this;
		
		var url = CONSTANTS.SEARCH_URL;
		if(URI=="query") {
			url+='?search='+searchWord;
		}
		else {
			url+='?search=&subject='+URI;
		}		
		url+='&offset=0&maxFacets=0&items=5';
		
		var documents = [];
		var store = rdfstore.create();
		store.load('remote', url, function(success) {
			if(success) {
				documents = main.owner.createDocumentList(store);
			}
		});		
		return documents;
	},
	
	buildGraphJSON(nodeObj,URI,level) {
		if(level > 0 && nodeObj.data.type=="subject") {
			nodeObj.name = getTitleByURI(URI);
		}		
		this.sendDocListAnnotation(URI,0);
		level++;
		
		if(level < 3) {
			switch(nodeObj.data.type) {
				case "query":
				case "subject":
					var docNodes = this.search(nodeObj.name,URI);
					for(var i=0; i<docNodes.length; i++) {
						var ind = nodeObj.children.push({ id: docNodes[i].url, name: docNodes[i].title, children: [], data: { type: "document" }});
						this.buildGraphJSON(nodeObj.children[ind],docNodes[i].url,level);
					}
				break;
				case "document":				
					var url = CONSTANTS.DETAILS_URL + '?iri=' + URI;
					var store = rdfstore.create();
					store.load('remote', url, function(success) {
						var subjNodes =  main.getSubjectConnections(success, store);
						for(var i=0; i<subjNodes.length; i++) {
							var ind = nodeObj.children.push({ id: subjNodes[i], name: "", children: [], data: { type: "subject" }});
							this.buildGraphJSON(nodeObj.children[ind],subjNodes[i].url,level);
						}
					});				
				break;
			}
		}
	},
	
	getSubjectConnections: function(success, rdf){
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
		
	getTitleByURI: function(URI) {
		var title = '?';
		var url = CONSTANTS.DETAILS_URL + '?iri=' + URI;
		var store = rdfstore.create();
		store.load('remote', url, function(success) {
			store.execute(query, function(success, results) {
				if (success) {
					for(var i=0;i<results.length;i++){
						var row = results[i];
						if(!isEmpty(row.title)) {
							title=row.title;
						}
					}
				}
			});
		});
		return title;
	},
	
	newGraph: function(searchWord) {
        this.searchWord = searchWord;
		var main = this;
			
		this.rGraph = new $jit.RGraph({
			injectInto: main.$.nGraphDiv.id,
			background: main.getGraphDefaults('background'),
			Navigation: main.getGraphDefaults('navigation'),
			Node: main.getGraphDefaults('node'),
			Edge: main.getGraphDefaults('edge'),
			onBeforeCompute: function(node){ } , //onclick
			onCreateLabel: function(domElement, node){  
				domElement.innerHTML = node.name;  
				domElement.onclick = function(){  
					main.rGraph.onClick(node.id, {
						onComplete: function() {
							main.onNodeClick(node, 'ontap');
						}
					});  
				};  
			},
			onPlaceLabel: function(domElement, node){  
				var style = domElement.style;  
				style.display = '';  
				style.cursor = 'pointer';  
				
				if(node._depth == 0) {
					style.fontSize = "12px";  
					style.color = "#555";  
					style.maxWidth = "130px";
				}
				else if (node._depth == 1) {  
					style.fontSize = "11px";  
					style.color = "#555";
					style.maxWidth = "130px";
				  
				}
				else if(node._depth == 2 || node._depth == 3){  
					style.fontSize = "10px";  
					style.color = "#555";  
					style.maxWidth = "130px";
				  
				}
				else {  
					style.display = 'none';  
				}
				var left = parseInt(style.left);  
				var w = domElement.offsetWidth;  
				style.left = (left - w / 2) + 'px';  
			}  
		});
		
		this.rGraph.loadJSON({ id: 'query', name: this.searchWord, children: [], data: { type: 'query' }});
		
		this.rGraph.graph.eachNode(function(n) {
			var pos = n.getPos();
			pos.setc(-100, -100);
		});  
		this.rGraph.compute('end');  
		this.rGraph.fx.animate({  
			modes:['polar'],
			duration: 200
		});
		
		this.initNode('query',0,'query');
		this.rGraph.op.morph(this.graphJSON, this.getGraphDefaults('animation'));
		
		this.$.loader.hide();
	},

    /**
     * This function is called when the user clicks on a node.
	 * An annotation is being sent about the click, and it calls
	 * a parent function, which can call the preview box to open a
     * document.
     */
    onNodeClick: function(node, inEvent){
		
		var centre = { id: node.id, name: node.name, children: [], data: { type: node.data.type }};
		this.graphJSON = centre;
		this.buildGraphJSON(centre, node.id, 0, node.data.type);
		
		this.rGraph.op.morph(this.graphJSON, this.getGraphDefaults('animation'));
		
		if(node.id!='query') {
			this.owner[this.openDocFunction](node.id, inEvent);
			this.sendDocListAnnotation(node.id,'true');
		}
    },
	
	/*
    updateGraphJSON: function(centre){
		var main = this;
		$.each(centre.adjacencies, function( index, value ) {
			var child = { id: value.nodeFrom.id, name: value.nodeFrom.name, children: [] };
			this.graphJSON.children.push(child);
			
			main.setNodeConnections(child.id);
		});
    },*/
	/*
	deleteNode: function(nodeId) {
		var n = this.rGraph.graph.getNode(nodeId);
        if(!n) return;
        var subnodes = n.getSubnodes(0);
        var map = [];
        for(var i=0;i<subnodes.length;i++) {
            map.push(subnodes[i].id);
        }
        this.rGraph.op.removeNode(map.reverse(), this.getGraphDefaults('animation') );
    },*/
	/**
	* This functions shows a message in the network-graph panel
	* @param {String} message the message to be displayed
	*/
    showMessage: function(message){
        this.$.nGraphDiv.destroyClientControls();
        this.$.nGraphDiv.setContent(message);
    },
    /**
     * This function prepares an annotation about the activities related to the
	 * document list: which documents the user got back using what search query;
	 * whether the user clicked on the documents. Then calls a function which
	 * actually sends the request to the server.
     * @param {String} docURI the URI of the document
     * @param {Number} click is it only displayed or clicked
     */
	sendDocListAnnotation: function(docURI,click) {
		var src = 'unknown';
		if(docURI.indexOf('/pmc/') > 0) {
			src = 'pubmed';
		}
		else if (docURI.indexOf('/patent/') > 0) {
			src = 'patent';
		}
		
		var annoURI = 'http://fusepool.info/annostore/reranking/'+getRandomId();
		var annoBodyURI = 'http://fusepool.info/annostore/reranking/body/'+getRandomId();
		var currentDate = new Date().toISOString();
		var userURI =  'http://fusepool.info/users/anonymous';
		
		var annotationString =	'@prefix xsd: <http://www.w3.org/2011/XMLSchema#> . ' + 
								'@prefix oa: <http://www.w3.org/ns/oa#> . ' + 								
								'@prefix fpanno: <http://fusepool.eu/ontologies/annostore#> . ' + 
								
								'fpanno:datasource a oa:SpecificResource . ' +
								'fpanno:patent a fpanno:datasource . ' +
								'fpanno:pubmed a fpanno:datasource . ' +
								'fpanno:rerankingAnnotation a oa:Annotation . ' + 
								
								'<'+annoURI+'> a fpanno:rerankingAnnotation ; ' +
								'oa:hasTarget fpanno:'+src+' ; ' +
								'oa:hasBody <'+annoBodyURI+'> ; ' +
								'oa:annotatedAt "'+currentDate+'" ; ' +
								'oa:annotatedBy <'+userURI+'> . ' +
								
								'<'+annoBodyURI+'> a ' +
								'fpanno:rerankingBody ; ' +
								'fpanno:hasQuery "'+this.searchWord+'" ; ' +
								'fpanno:wasClicked "'+click+'"^^xsd:boolean ; ' + 
								'fpanno:withPatentBoost 0.00 ; ' +
								'fpanno:withPubmedBoost 0.00 . ';

		sendAnnotation(annotationString);
	}
});
