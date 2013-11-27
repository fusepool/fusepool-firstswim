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
		{ tag: 'div', name: 'addMoreLabelsButton', classes: 'addMoreLabelsButton', content: 'Add more', ontap: 'addMoreLabelsBtnPress' },
		{ tag: 'div', name: 'moreLabelsPanel', components: [
			{kind: "onyx.InputDecorator", name: 'moreLabelInputDec', components: [
				{ kind: onyx.Input, name: 'moreLabelInput', placeholder: 'Add a new label name' }
			]},
			{ tag: 'div', name: 'addLabelButton', content: 'Add', ontap: 'addLabel' },
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
		var newLabelText = $.trim(this.$.moreLabelInput.getValue());
		if(newLabelText!='' && $.inArray(newLabelText,this.labelTexts)<0 ) {
			
			this.sendLabelListAnnotation(this.labelListId,newLabelText,1);
			
			this.labelIds.push('randomID');
			this.labelTexts.push(newLabelText);
			
			this.$.labelList.createComponent({
				kind: 'LabelItem',
				labelId: 'newIdOfANewLabel',
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
		this.sendLabelListAnnotation(this.labelListId,labelId,0);
		
		var ind = $.inArray(labelId,this.labelIds)
		this.labelIds.splice(ind,1);
		this.labelTexts.splice(ind,1);
    },
	
	sendLabelListAnnotation: function(docURI,labelItem,action) {
		console.log('<userID>: unknown; <query>: ' + this.searchWord + '; <docId>:' + docURI + '; <labelItem>:' + labelItem + '; <action>: ' + action );
		// Preparing the annotationBody... Then:
		// this.owner.sendAnnotation(annotationBody);
	}
	
});