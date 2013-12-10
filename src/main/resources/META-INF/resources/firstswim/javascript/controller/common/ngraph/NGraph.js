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
        openDocEvent: 'ontap'
    },

    /**
     * When the component is created the program sets the title's properties and
     * hides it.
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
		{ tag: 'div', name: 'nGraphCanvas', published: { id: 'nGraphCanvas'}, classes: 'nGraphCanvas' },
		{ name: 'loader' }
    ],

    /**
     * This function runs, when the user starts a search. It clears the list
     * and shows the loader.
     */
    startLoading: function(){
        this.$.nGraphCanvas.setContent('');
        this.$.nGraphCanvas.destroyClientControls();
        this.$.nGraphCanvas.render();
        this.$.loader.show();
    },

    /**
     * This function updates the document list from a documents object. This
     * object contains the short documents.
     * @param {Array} documents the document list object
     * @param {String} searchWord the search word
     * @param {Array} checkedEntities the checked facets and type facets
     */
    updateGraph: function(documents, searchWord, checkedEntities){
        this.searchWord = searchWord;
        this.offset = 0;		
	
        this.documents = documents;
        this.$.nGraphCanvas.destroyClientControls();
        if(documents.length > 0){
			var jsontr = {
				id: "query",
				name: "["+this.searchWord+"]",
				children: []
			};
			
			//
            for(var i=0;i<documents.length;++i){
               /* 
				openDocEvent: this.openDocEvent,
				openButtonClass: 'openDocButton',
				container: this.$.list,
				url: documents[i].url,
				title: documents[i].title,
				shortContent: documents[i].shortContent,
				parentFunction: 'openDoc',
				searchWord: this.searchWord
                */
				var nodeObj = { id: documents[i].url, name: documents[i].title };
				jsontr.children.push(nodeObj);
				this.sendDocListAnnotation(documents[i].url,0);
            }
			var rgraph = new $jit.RGraph({ 
				//Where to append the visualization  
				injectInto: 'documentApp_nGraph_nGraphCanvas',  
				//Optional: create a background canvas that plots  
				//concentric circles.  
				levelDistance: 100,
				background: {  
				  CanvasStyles: {  
					strokeStyle: '#e0e0e0'  
				  }  
				},  
				//Add navigation capabilities:  
				//zooming by scrolling and panning.  
				Navigation: {  
				  enable: true,  
				  panning: true,  
				  zooming: 100  
				},  
				//Set Node and Edge styles.  
				Node: {  
					overridable: true,
					color: '#239fa0'  
				},				  
				Edge: {  
					overridable: true,
					color: '#cadada',  
					lineWidth:1 
				},			  
				onBeforeCompute: function(node){  
					//Log.write("centering " + node.name + "...");  
					//Add the relation list in the right column.  
					//This list is taken from the data property of each JSON node.  
					//$jit.id('inner-detailstr').innerHTML = node.data.relation;  
				},
				//Add the name of the node in the correponding label  
				//and a click handler to move the graph.  
				//This method is called once, on label creation.  
				onCreateLabel: function(domElement, node){  
					domElement.innerHTML = node.name;  
					domElement.onclick = function(){  
						rgraph.onClick(node.id, {  
							onComplete: function() {  
								//Log.write("done");  
							}  
						});  
					};  
				},  
				//Change some label dom properties.  
				//This method is called each time a label is plotted.  
				onPlaceLabel: function(domElement, node){  
					var style = domElement.style;  
					style.display = '';  
					style.cursor = 'pointer';  
					
					if(node._depth == 0) {
						style.fontSize = "11px";  
						style.color = "#555";  
						style.maxWidth = "130px";
					}
					else if (node._depth == 1) {  
						style.fontSize = "10px";  
						style.color = "#555";
						style.maxWidth = "130px";
					  
					} else if(node._depth == 2 || node._depth == 3){  
						style.fontSize = "9px";  
						style.color = "#555";  
						style.maxWidth = "130px";
					  
					} else {  
						style.display = 'none';  
					}  
			  
					var left = parseInt(style.left);  
					var w = domElement.offsetWidth;  
					style.left = (left - w / 2) + 'px';  
				}  
			});
			
			rgraph.loadJSON(jsontr);
			//trigger small animation  
			rgraph.graph.eachNode(function(n) {  
			  var pos = n.getPos();  
			  pos.setc(-100, -100);  
			});  
			rgraph.compute('end');  
			rgraph.fx.animate({  
			  modes:['polar'],  
			  duration: 200  
			});
			
            this.$.loader.hide();
            //this.$.nGraphCanvas.render();
        }
		else {
            this.showMessage(this.noDataLabel);
            this.$.loader.hide();
            this.$.nGraphCanvas.render();
        }
        this.$.title.show();
    },

    /**
     * This functions shows a message in the network-graph panel
     * @param {String} message the message to be displayed
     */
    showMessage: function(message){
        this.$.nGraphCanvas.destroyClientControls();
        this.$.nGraphCanvas.setContent(message);
    },

    /**
     * This function is called when the user would like to open a document to
     * preview. It calls a parent function, which can call the preview box to
     * open a document.
     * @param {String} url the request URL of the preview opening
     * @param {Object} inEvent the user mouse event (it is important in the desktop version)
     */
    openDoc: function(url, inEvent){
        this.owner[this.openDocFunction](url, inEvent);
		this.sendDocListAnnotation(url,1);
    },
	
    /**
     * This function prepares an annotation about the activities related to the
	 * document list: which documents the user got back using what search query;
	 * whether the user clicked on the documents. Then calls a parent function 
	 * which actually sends the request to the server.
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
		console.log('<userID>: unknown; <query>: '+this.searchWord+'; <docID>:'+docURI+'; <src>: '+src+'; <boost parameter used>: 0; <click>: '+click );
		// Preparing the annotationBody... Then:
		// sendAnnotation(annotationBody);
	}
});
