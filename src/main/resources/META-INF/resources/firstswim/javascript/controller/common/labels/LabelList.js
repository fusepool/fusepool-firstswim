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
        labels: null,
		moreLabelsPanelClass: '',
		moreLabelInputClass: '',
		moreLabelInputDecClass: '',
		addLabelButtonClass: '',
		labelListClass: '',
		searchWord: ''
    },

    components: [
		{ tag: 'div', name: 'labelListName', content: 'Labels:' },
        { classes: 'clear' },
        { tag: 'div', name: 'labelList' },
        { classes: 'clear' },
		{ kind: onyx.Button, name: 'addMoreLabelsButton', content: '+', ontap: 'addMoreLabelsBtnPress' },
		{ tag: 'div', name: 'moreLabelsPanel', components: [
			{kind: "onyx.InputDecorator", name: 'moreLabelInputDec', components: [
				{ kind: onyx.Input, name: 'moreLabelInput', placeholder: 'Add a new label name' }
			]},
			{ kind: onyx.Button, name: 'addLabelButton', content: 'Add', ontap: 'addLabel' },
			{ kind: onyx.Button, name: 'hideAddingPanelButton', content: 'Hide', ontap: 'hideAddingPanelBtnPress' }
		] }
    ],

    /**
     * The create function sets the content of the label list
     */
    create: function(){
        this.inherited(arguments);

        var countOfElements = 0;
        for(var i=0;i<this.labels.length;++i){
			countOfElements++;
			this.$.labelList.createComponent({
				kind: 'LabelItem',
				labelId: this.labels[i].id,
				labelText: this.labels[i].text,
				labelClass: 'labelDiv',
				labelTextClass: 'labelText',
				deleteFunction: 'deleteLabel'
			});
        }
        if(countOfElements === 0){
            this.hide();
        }
		
        this.$.moreLabelsPanel.setClasses(this.moreLabelsPanelClass);		
        this.$.moreLabelInput.setClasses(this.moreLabelInputClass);		
        this.$.moreLabelInputDec.setClasses(this.moreLabelInputDecClass);		
        this.$.addLabelButton.setClasses(this.addLabelButtonClass);		
        this.$.labelList.setClasses(this.labelListClass);

		this.$.moreLabelsPanel.hide();
    },
	
	addMoreLabelsBtnPress: function() {
		this.$.addMoreLabelsButton.hide();
		this.$.moreLabelsPanel.show();
	},
	
	hideAddingPanelBtnPress: function() {
		this.$.addMoreLabelsButton.show();
		this.$.moreLabelsPanel.hide();		
	},
	
	addLabel: function() {
		var newLabelText = $.trim(this.$.moreLabelInput.getValue());
		if(newLabelText!='') {
			this.$.moreLabelInput.setValue('');
			this.sendLabelListAnnotation(this.labelListId,newLabelText,1);
			this.$.labelList.createComponent({
				kind: 'LabelItem',
				labelId: 'newIdOfANewLabel',
				labelText: newLabelText,
				labelClass: 'labelDiv',
				labelTextClass: 'labelText',
				deleteFunction: 'deleteLabel'
			});
			this.$.labelList.render();
		}
	},

    /**
     * This function deletes a label from the GUI and sends an annotation
	 * to the server about this action.
     */
    deleteLabel: function(labelId){
		this.sendLabelListAnnotation(this.labelListId,labelId,0);
    },
	
	sendLabelListAnnotation: function(docURI,labelItem,action) {
		console.log('<userID>: unknown; <query>: ' + this.searchWord + '; <HITID>:' + docURI + '; <labelItem>:' + labelItem + '; <action>: ' + action );
		// Preparing the annotationBody... Then:
		// this.owner.sendAnnotation(annotationBody);
	},
	
    getLabels: function(){
        return this.labels;
    }
	
});