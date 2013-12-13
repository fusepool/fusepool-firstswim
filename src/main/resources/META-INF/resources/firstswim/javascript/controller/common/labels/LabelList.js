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
				{ kind: onyx.Input, name: 'moreLabelInput', placeholder: 'Add a new label name' }
			]},
			{ tag: 'div', name: 'addLabelButton', content: 'Add label', ontap: 'addLabel' },
			{ tag: 'div', name: 'hideAddingPanelButton', content: 'Close', ontap: 'hideAddingPanelBtnPress' }
		] },
		{ classes: 'clear' }
    ],

    /**
     * The create function sets the content of the label list
     */
    create: function(){
        this.inherited(arguments);

        for(var i=0;i<this.labelIds.length;++i){
			this.$.labelList.createComponent({
				kind: 'LabelItem',
				labelId: this.labelIds[i],
				labelText: this.labelTexts[i],
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
	
	addLabel: function() {
		var labelId = '<http://fusepool.info/labels/'+getRandomId()+'>';
		
		var newLabelText = $.trim(this.$.moreLabelInput.getValue());
		if(newLabelText!='' && $.inArray(newLabelText,this.labelTexts)<0 ) {
			
			this.sendLabelListAnnotation(this.labelListId,labelId,newLabelText,1);
			
			this.labelIds.push(labelId);
			this.labelTexts.push(newLabelText);
			
			this.$.labelList.createComponent({
				kind: 'LabelItem',
				labelId: labelId,
				labelText: newLabelText,
				labelClass: 'labelDiv',
				labelTextClass: 'labelText',
				labelDeleteClass: 'labelDeleteButton',
				deleteFunction: 'deleteLabel'
			});
			
			this.$.labelList.render();
		}
        this.$.moreLabelInput.setValue('').focus();
	},

    /**
     * This function deletes a label from the GUI and sends an annotation
	 * to the server about this action.
     */
    deleteLabel: function(labelId){
		var ind = $.inArray(labelId,this.labelIds)
		this.sendLabelListAnnotation(this.labelListId,this.labelIds[ind],this.labelTexts[ind],-1);
		
		this.labelIds.splice(ind,1);
		this.labelTexts.splice(ind,1);
		
    },
	
	sendLabelListAnnotation: function(docURI,labelId,labelText,action) {
				
		var annoURI = '<http://fusepool.info/annostore/labelling/'+getRandomId()+'>';
		var annoBodyURI = '<http://fusepool.info/annostore/labelling/body/'+getRandomId()+'>';
		var currentDate = new Date().toISOString();
		var userURI =  '<http://fusepool.info/users/anonymous>';
		
		var annotationString =	'fpanno:datasource a oa:SpecificResource . ' +
								'fpanno:labellingAnnotation a oa:Annotation . ' +
								'fpanno:labellingBody a oa:SpecificResource . ' +
								
								 annoURI+' a fpanno:labellingAnnotation ; ' +
								'fpanno:hasTarget '+docURI+' ; ' +
								'fpanno:hasBody '+annoBodyURI+' ; ' +
								'fpanno:annotatedAt "'+currentDate+'" ; ' +
								'fpanno:annotatedBy '+userURI+' . ' +
								
								 annoBodyURI+' a fpanno:labellingBody ; ' +
								'fpanno:hasNewLabel '+labelId+' . ' +
								 labelId + ' a oa:Tag, cnt:ContentAsText ; ' + 
								'cnt:chars "'+labelText+'" . ';
		
		if(action==1) {
			sendAnnotation(annotationString);
			// console.log('@prefix fpanno: <http://fusepool.eu/ontologies/annostore> . '+annotationString);
		}
		else {
		}
	}
	
});