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
		labelListId: '', // = docURI
        labelIds: [],
        labelTexts: [],
        predictedLabelIds: [],
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
		{ tag: 'div', name: 'addMoreLabelsButton', classes: 'addMoreLabelsButton', content: 'Add label', ontap: 'addMoreLabelsBtnPress' },
		{ tag: 'div', name: 'moreLabelsPanel', components: [
			{kind: "onyx.InputDecorator", name: 'moreLabelInputDec', components: [
				{ kind: onyx.Input, name: 'moreLabelInput', placeholder: 'Add a new label name', onkeydown: 'addOnEnter' }
			]},
			{ tag: 'div', name: 'addLabelButton', content: 'Add label', ontap: 'addNewLabel' },
			{ tag: 'div', name: 'hideAddingPanelButton', content: 'Close', ontap: 'hideAddingPanelBtnPress' }
		] },
		{ classes: 'clear' },
		{ tag: 'div', name: 'predictedLabelListName', classes: 'labelListName', content: 'Predicted labels:' },
		{ classes: 'clear' },
        { tag: 'div', name: 'predictedLabelList' },
		{ classes: 'clear' }
    ],

    /**
     * The create function sets the content of the label list
     */
    create: function(){
        this.inherited(arguments);

        for(var i=0;i<this.predictedLabelIds.length;++i){
			this.$.predictedLabelList.createComponent({
				kind: 'LabelItem',
				name: this.predictedLabelIds[i],
				labelId: this.predictedLabelIds[i],
				labelText: this.predictedLabelTexts[i],
				labelType: 'prediction',
				labelClass: 'predictedLabelDiv',
				labelTextClass: 'labelText',
				labelAddClass: 'labelAddButton',
				addFunction: 'addPredictedLabel'
			});
        }

        for(var i=0;i<this.labelIds.length;++i){
			this.$.labelList.createComponent({
				kind: 'LabelItem',
				name: this.labelIds[i],
				labelId: this.labelIds[i],
				labelText: this.labelTexts[i],
				labelType: 'userDefined',
				labelClass: 'labelDiv',
				labelTextClass: 'labelText',
				labelDeleteClass: 'labelDeleteButton',
				deleteFunction: 'deleteLabel'
			});
        }
		
        this.$.moreLabelsPanel.setClasses(this.moreLabelsPanelClass);		
        this.$.moreLabelInput.setClasses(this.moreLabelInputClass);		
        this.$.moreLabelInputDec.setClasses(this.moreLabelInputDecClass);		
        this.$.addLabelButton.setClasses(this.addLabelButtonClass);
        this.$.hideAddingPanelButton.setClasses(this.hideAddingPanelButtonClass);
        this.$.labelList.setClasses(this.labelListClass);

		this.$.moreLabelsPanel.hide();
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
				this.addPredictedLabel(this.predictedLabelIds[ind],this.predictedLabelTexts[ind],this.$.predictedLabelList.$[this.predictedLabelIds[ind]]);
				this.$.moreLabelInput.setValue('');
			}
			else {
				var labelURI = 'http://fusepool.info/labels/'+getRandomId();
				this.sendLabelListAnnotation(this.labelListId,labelURI,newLabelText,1);
				
				this.labelIds.push(labelURI);
				this.labelTexts.push(newLabelText);
				
				this.$.labelList.createComponent({
					kind: 'LabelItem',
					name: labelURI,
					labelId: labelURI,
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
	
	addPredictedLabel: function(labelURI,labelText,labelElement) {		
		if(labelText!='' && $.inArray(labelText,this.labelTexts)<0 ) {
			
			// this.sendLabelListAnnotation(this.labelListId,labelURI,labelText,1); // vsz nem kell
			
			this.labelIds.push(labelURI);
			this.labelTexts.push(labelText);
			
			var ind = $.inArray(labelText,this.predictedLabelTexts);	
			if(ind>-1) {
				this.predictedLabelIds.splice(ind,1);
				this.predictedLabelTexts.splice(ind,1);
			}
			
			this.$.labelList.createComponent({
				kind: 'LabelItem',
				name: labelURI,
				labelId: labelURI,
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
    deleteLabel: function(labelURI,labelElement){
		var ind = $.inArray(labelURI,this.labelIds);
		if(ind>-1) {
			this.sendLabelListAnnotation(this.labelListId,this.labelIds[ind],this.labelTexts[ind],-1);
			
			this.labelIds.splice(ind,1);
			this.labelTexts.splice(ind,1);

			labelElement.destroy();
		}
    },
	
	sendLabelListAnnotation: function(docURI,labelURI,labelText,action) {
				
		var currentDate = new Date().toISOString();
		var userURI =  'http://fusepool.info/users/anonymous';
		
		var annotationString =	'@prefix xsd: <http://www.w3.org/2011/XMLSchema#> . ' +
								'@prefix cnt: <http://www.w3.org/2011/content#> . ' + 
								'@prefix oa: <http://www.w3.org/ns/oa#> . ' + 								
								'@prefix fpanno: <http://fusepool.eu/ontologies/annostore#> . ' + 
								
								'_:1 a fpanno:labellingAnnotation , oa:Annotation ; ' +
								'fpanno:hasTarget <'+docURI+'> ; ' +
								'fpanno:hasBody _:2 ; ' +
								'fpanno:annotatedAt "'+currentDate+'" ; ' +
								'fpanno:annotatedBy <'+userURI+'> . ' +

								'_:2 a fpanno:labellingBody ; ' +
								'fpanno:hasNewLabel _:3 . ' +

								'_:3 a oa:Tag, cnt:ContentAsText ; ' +
								'cnt:chars "'+labelText+'" . ';
								
		/* régi
		var annotationString =	'@prefix cnt: <http://www.w3.org/2011/content#> . ' + 
								'@prefix oa: <http://www.w3.org/ns/oa#> . ' + 								
								'@prefix fpanno: <http://fusepool.eu/ontologies/annostore#> . ' + 
								
								'fpanno:datasource a oa:SpecificResource . ' +
								'fpanno:labellingAnnotation a oa:Annotation . ' +
								'fpanno:labellingBody a oa:SpecificResource . ' +
								
								'<'+annoURI+'> a fpanno:labellingAnnotation ; ' +
								'fpanno:hasTarget <'+docURI+'> ; ' +
								'fpanno:hasBody <'+annoBodyURI+'> ; ' +
								'fpanno:annotatedAt "'+currentDate+'" ; ' +
								'fpanno:annotatedBy <'+userURI+'> . ' +
								
								'<'+annoBodyURI+'> a fpanno:labellingBody ; ' +
								'fpanno:hasNewLabel <'+labelURI+'> . ' +
								'<'+labelURI+'> a oa:Tag, cnt:ContentAsText ; ' + 
								'cnt:chars "'+labelText+'" . ';*/
		
		if(action==1) {
			sendAnnotation(annotationString);
		}
		else {
			// -1 : delete label
		}
	}
	
});