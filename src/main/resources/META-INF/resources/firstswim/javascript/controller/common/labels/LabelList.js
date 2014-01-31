/**
* @class LabelList
*/
enyo.kind(
/** @lends LabelList.prototype */
{
    name: 'LabelList',
    kind: enyo.Control,
	classes: 'labelListPanel',

    published: {
		labelListId: '', // docURI
        labelTexts: [],
        predictedLabelTexts: [],
		moreLabelsPanelClass: '',
		moreLabelInputClass: '',
		moreLabelInputDecClass: '',
		addLabelButtonClass: '',
		hideAddingPanelButtonClass: '',
		labelListClass: '',
		searchWord: ''
    },

    components: [
		{ tag: 'div', name: 'labelListName', classes: 'labelListName', content: 'Labels:' },
        { classes: 'clear' },
        { tag: 'div', name: 'labelList' },
		{ tag: 'div', name: 'addMoreLabelsButton', classes: 'addMoreLabelsButton enyo-unselectable', content: 'Add label', ontap: 'addMoreLabelsBtnPress' },
		{ tag: 'div', name: 'moreLabelsPanel', components: [
			{kind: "onyx.InputDecorator", name: 'moreLabelInputDec', components: [
				{ kind: onyx.Input, name: 'moreLabelInput', placeholder: 'Add a new label name', onkeydown: 'addOnEnter' }
			]},
			{ tag: 'div', name: 'addLabelButton', content: 'Add label', ontap: 'addNewLabel', classes: 'enyo-unselectable' },
			{ tag: 'div', name: 'hideAddingPanelButton', content: 'Close', ontap: 'hideAddingPanelBtnPress', classes: 'enyo-unselectable' }
		] },
		{ classes: 'clear' },
		{ tag: 'div', name: 'predictedLabelListName', classes: 'labelListName', content: 'Predicted labels:' },
		{ classes: 'clear' },
        { tag: 'div', name: 'predictedLabelList' },
		{ classes: 'clear' }
    ],

    /**
     * The create function sets the content of the label list based on the doc URI
     */
    create: function(){
        this.inherited(arguments);

		this.initLabels();
		this.initPredictedLabels();
		
        this.$.moreLabelsPanel.setClasses(this.moreLabelsPanelClass);		
        this.$.moreLabelInput.setClasses(this.moreLabelInputClass);		
        this.$.moreLabelInputDec.setClasses(this.moreLabelInputDecClass);		
        this.$.addLabelButton.addClass(this.addLabelButtonClass);
        this.$.hideAddingPanelButton.addClass(this.hideAddingPanelButtonClass);
        this.$.labelList.setClasses(this.labelListClass);

		this.$.moreLabelsPanel.hide();
    },
	
	initLabels: function() {
		var main = this;
		
		var request = new enyo.Ajax({
			method: 'GET',
			url: CONSTANTS.GET_LABELS_URL+'?iri='+this.labelListId,
			handleAs: 'text',
			headers: { Accept : 'application/json', 'Content-Type' : 'application/x-www-form-urlencoded'},
			published: { timeout: 60000 }
		});
		request.go();
		request.error(this, function(){
			console.log("error");
		});
		request.response(this, function(inSender, inResponse) {
			var obj = JSON.parse(inResponse);
			if(!isEmpty(obj)) {
				for(var i=0;i<obj.labels.length;i++){
					main.labelTexts.push(obj.labels[i]);
					main.$.labelList.createComponent({
						kind: 'LabelItem',
						name: obj.labels[i],
						labelText: obj.labels[i],
						labelType: 'userDefined',
						labelClass: 'labelDiv',
						labelTextClass: 'labelText',
						labelDeleteClass: 'labelDeleteButton',
						deleteFunction: 'deleteLabel'
					});
					main.$.labelList.render();
				}
			}
		});
	},
	
	initPredictedLabels: function() {

		// TODO: query the REST endpoint for predicted labels
		// push the result to this.predictedLabelTexts	
		// if(this.predictedLabelTexts.length==0) {
			// this.$.predictedLabelListName.hide();
		// }
		// else {
		/*
			for(var i=0;i<this.predictedLabelTexts.length;i++){
				this.$.predictedLabelList.createComponent({
					kind: 'LabelItem',
					name: this.predictedLabelTexts[i],
					labelText: this.predictedLabelTexts[i],
					labelType: 'prediction',
					labelClass: 'predictedLabelDiv',
					labelTextClass: 'labelText',
					labelAddClass: 'labelAddButton',
					addFunction: 'addPredictedLabel'
				});
			}
		*/
		// }
	},
	
	addMoreLabelsBtnPress: function() {
		this.$.addMoreLabelsButton.hide();
		this.$.moreLabelsPanel.show();
        this.$.moreLabelInput.focus();
	},
	
	hideAddingPanelBtnPress: function() {
		this.$.addMoreLabelsButton.show();
		this.$.moreLabelsPanel.hide();		
	},
	
	addOnEnter: function(inSender, inEvent) {
		if (inEvent.keyCode === 13) {
			this.addNewLabel();
		}
	},
	
	addNewLabel: function() {
		
		var newLabelText = $.trim(this.$.moreLabelInput.getValue());
		if(newLabelText!='' && $.inArray(newLabelText,this.labelTexts)<0 ) {
			
			var ind = $.inArray(newLabelText,this.predictedLabelTexts);	
			if(ind>-1) {
				this.addPredictedLabel(this.predictedLabelTexts[ind],this.$.predictedLabelList.$[this.predictedLabelTexts[ind]]);
				this.$.moreLabelInput.setValue('');
			}
			else {
				this.sendLabelListAnnotation(this.labelListId,newLabelText,1);
				
				this.labelTexts.push(newLabelText);
				
				this.$.labelList.createComponent({
					kind: 'LabelItem',
					name: newLabelText,
					labelText: newLabelText,
					labelClass: 'labelDiv',
					labelTextClass: 'labelText',
					labelDeleteClass: 'labelDeleteButton',
					deleteFunction: 'deleteLabel'
				});
				
				this.$.labelList.render();
				this.$.moreLabelInput.setValue('').focus();
			}
		}
	},
	
	addPredictedLabel: function(labelText,labelElement) {		
		if(labelText!='' && $.inArray(labelText,this.labelTexts)<0 ) {
			
			this.sendLabelListAnnotation(this.labelListId,labelText,1);
			
			this.labelTexts.push(labelText);
			
			var ind = $.inArray(labelText,this.predictedLabelTexts);	
			if(ind>-1) {
				this.predictedLabelTexts.splice(ind,1);
				if(this.predictedLabelTexts.length==0) {
					this.$.predictedLabelListName.hide();
				}
			}
			
			this.$.labelList.createComponent({
				kind: 'LabelItem',
				name: labelText,
				labelText: labelText,
				labelClass: 'labelDiv',
				labelTextClass: 'labelText',
				labelDeleteClass: 'labelDeleteButton',
				deleteFunction: 'deleteLabel'
			});
			
			this.$.labelList.render();
			
			labelElement.destroy();
		}
	},

    /**
     * This function deletes a label from the GUI and sends an annotation
	 * to the server about this action.
     */
    deleteLabel: function(labelText,labelElement){
		var ind = $.inArray(labelText,this.labelTexts);
		if(ind>-1) {
			this.sendLabelListAnnotation(this.labelListId,this.labelTexts[ind],-1);
			this.labelTexts.splice(ind,1);
			labelElement.destroy();
		}
    },
	
	sendLabelListAnnotation: function(docURI,labelText,action) {
				
		var currentDate = new Date().toISOString();
		var userURI =  'http://fusepool.info/users/anonymous';	// test
		
		var annotationString =	'@prefix xsd: <http://www.w3.org/2011/XMLSchema#> . ' +
								'@prefix cnt: <http://www.w3.org/2011/content#> . ' + 
								'@prefix oa: <http://www.w3.org/ns/oa#> . ' + 								
								'@prefix fpanno: <http://fusepool.eu/ontologies/annostore#> . ' + 
								
								'_:1 a fpanno:labellingAnnotation , oa:Annotation ; ' +
								'fpanno:hasTarget <'+docURI+'> ; ' +
								'fpanno:hasBody _:2 ; ' +
								'fpanno:annotatedAt "'+currentDate+'" ; ' +
								'fpanno:annotatedBy <'+userURI+'> . ' +

								'_:2 a fpanno:labellingBody ; ';
		if(action==1) {
			annotationString +=	'fpanno:hasNewLabel _:3 . ' +
								'_:3 a oa:Tag, cnt:ContentAsText ; ' +
								'cnt:chars "'+labelText+'" . ';
		}
		else {
			annotationString +=	'fpanno:hasDeletedLabel _:4 . ' +
								'_:4 a oa:Tag, cnt:ContentAsText ; ' +
								'cnt:chars "'+labelText+'" . ';
		}
		sendAnnotation(annotationString);
	}
	
});