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
        documents: null,
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
	
    getNodeConnections: function(nodeURL,limit){
		var conns=[];
		
        var main = this;
        var url = CONSTANTS.DETAILS_URL + '?iri=' + nodeURL;
        var store = rdfstore.create();
        store.load('remote', url, function(success) {
            conns = main.processNodeConnResponse(success, store);
        });
		/*var conns = [
						{ id : 'test'+getRandomId(), name : 'Test title'+getRandomId(), children: [] },
						{ id : 'test'+getRandomId(), name : 'Test title'+getRandomId(), children: [] },
						{ id : 'test'+getRandomId(), name : 'Test title'+getRandomId(), children: [] },
						{ id : 'test'+getRandomId(), name : 'Test title'+getRandomId(), children: [] },
						{ id : 'test'+getRandomId(), name : 'Test title'+getRandomId(), children: [] }
					];*/
		return conns;
    },
	
    /**
     * @param {Boolean} success the ajax query was success or not
     * @param {String} rdf the rdf object
     */
    processNodeConnResponse: function(success, rdf){
        var subjects = this.getSubjectConnections(rdf); 
        // var documents = this.getDocumentConnections(rdf);
		return subjects;
    },
	
	getSubjectConnections: function(rdf){
		var subjectConnections = [];
		var main = this;

		var query = 'SELECT * { ?s <http://rdfs.org/sioc/ns#subject> ?subj }';  // dc:subject?
		// var query = 'SELECT * { ?f <http://fusepool.eu/ontologies/ecs#subject> ?subj } ';  
		
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
	
	newGraph: function(documents, searchWord) {
        this.searchWord = searchWord;
        this.offset = 0;
        this.documents = documents;
        // this.$.nGraphDiv.destroyClientControls();
		var main = this;
		
		if(documents.length > 0){
			this.initGraphJSON(documents);
			
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
			
			this.rGraph.loadJSON(this.graphJSON);
			
			this.rGraph.graph.eachNode(function(n) {  
				var pos = n.getPos();  
				pos.setc(-100, -100);  
			});  
			this.rGraph.compute('end');  
			this.rGraph.fx.animate({  
				modes:['polar'],  
				duration: 200  
			});
			
			// $(window).resize(function() {
				// main.rGraph.canvas.getsize();
			// });
			
			this.$.loader.hide();
		}
		else {
            this.showMessage(this.noDataLabel);
            this.$.loader.hide();
            this.$.nGraphDiv.render();
        }
	},
	
    initGraphJSON: function(documents){
		if(documents.length > 0){
			this.graphJSON = {
				id: 'query',
				name: this.searchWord,
				children: []
			};
            for(var i=0;i<documents.length;++i){				
				var nodeObj = { id : documents[i].url, name : documents[i].title, children : [] };
				
				var nodeConnections = this.getNodeConnections(nodeObj.id, GLOBAL.secondLvlLimit);
				if(!isEmpty(nodeConnections)) {
					for(var j=0;j<nodeConnections.length;j++) {
						nodeObj.children.push(nodeConnections[j]);
						this.sendDocListAnnotation(nodeConnections[j].id,0);
					}
				}
				this.graphJSON.children.push(nodeObj);
				this.sendDocListAnnotation(documents[i].url,0);
            }
        }
		console.log(this.graphJSON);
    },
	
    updateGraphJSON: function(center){

		var newJSON	= { id: center.id, name: center.name, children: [] };
		var main = this;
		
		$.each(center.adjacencies, function( index, value ) {
			var child = { id: value.nodeFrom.id, name: value.nodeFrom.name, children: [] };
			
			var nodeConnections = main.getNodeConnections(child.id, GLOBAL.firstLvlLimit);
			if(!isEmpty(nodeConnections)) {
				for(var j=0;j<nodeConnections.length;j++) {
					child.children.push(nodeConnections[j]);
					main.sendDocListAnnotation(nodeConnections[j].id,0);
				}
			}
			newJSON.children.push(child);			
		});
		
		this.graphJSON = newJSON;
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
     * This function is called when the user clicks on a node.
	 * An annotation is being sent about the click, and it calls
	 * a parent function, which can call the preview box to open a
     * document.
     */
    onNodeClick: function(node, inEvent){
		/* delete - a morph jobb rá
		var subnodes = node.getSubnodes(3);		
        for(var i=0;i<subnodes.length;i++) {
			this.deleteNode(subnodes[i].id);
		}
		*/
		// this.getNodeConnections(node.id,9);

		this.updateGraphJSON(node);
		this.rGraph.op.morph(this.graphJSON, this.getGraphDefaults('animation'));
		
		if(node.id!='query') {
			this.owner[this.openDocFunction](node.id, inEvent);
			this.sendDocListAnnotation(node.id,'true');
		}
    },
	
	deleteNode: function(nodeId) {
		var n = this.rGraph.graph.getNode(nodeId);
        if(!n) return;
        var subnodes = n.getSubnodes(0);
        var map = [];
        for(var i=0;i<subnodes.length;i++) {
            map.push(subnodes[i].id);
        }
        this.rGraph.op.removeNode(map.reverse(), this.getGraphDefaults('animation') );
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
		// console.log(annotationString);
	}
});
