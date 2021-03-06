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
			/* {kind: "onyx.PickerDecorator", name: 'userLabels', onActivate: 'initUserLabelSelect', onSelect: 'userLabelSelection', components: [
				{kind: "onyx.PickerButton", content: "My labels", style: "width: 150px;"},
				{kind: "onyx.Picker", name: 'userLabelPicker', components: [] }
			]}, */
			{kind: "onyx.InputDecorator", name: 'moreLabelInputDec', components: [
				{ kind: onyx.Input, name: 'moreLabelInput', placeholder: 'Add a new label name', onkeydown: 'onKeydown' }
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
	 * @method create
     */
    create: function(){
        this.inherited(arguments);

		this.initLabels();
		
        this.$.moreLabelsPanel.setClasses(this.moreLabelsPanelClass);		
        this.$.moreLabelInput.setClasses(this.moreLabelInputClass);		
        this.$.moreLabelInputDec.setClasses(this.moreLabelInputDecClass);		
        this.$.addLabelButton.addClass(this.addLabelButtonClass);
        this.$.hideAddingPanelButton.addClass(this.hideAddingPanelButtonClass);
        this.$.labelList.setClasses(this.labelListClass);

		this.$.moreLabelsPanel.hide();
    },
	
	/**
	 * This function is fired when the user selects a label
	 * from user label list.
	 * @method userLabelSelection
	 */
	userLabelSelection: function(inSender, inEvent) {
		this.addUserLabel(inEvent.selected.content);
	},
	
	initUserLabelSelect: function(inSender, inEvent) {
	},
	
	/**
	 * This function calls the back-end for predicted and existing 
	 * labels and initializes the lists based on the return value.
	 * @method initLabels
	 */
	initLabels: function() {
		this.labelTexts = [];
		this.predictedLabelTexts = [];
		
		var main = this;
		var request = new enyo.Ajax({
			method: 'GET',
			url: CONSTANTS.GET_LABELS_URL + '?iri=' + this.labelListId + '&usePrediction=' + ( readCookie('viewType') == 'entityList' ? false : true ),
			// url: CONSTANTS.GET_LABELS_URL + '?iri=' + this.labelListId + '&usePrediction=false',
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
			// obj=JSON.parse('{"existingLabels":["barriers","sodium","vascular","yea","25","endothelium","helium","asd"],"predictedLabels":["go","fa"]}');
			if(!isEmpty(obj)) {
				for(var i=0;i<obj.existingLabels.length;i++){
					main.labelTexts.push(obj.existingLabels[i]);
					main.$.labelList.createComponent({
						kind: 'LabelItem',
						name: obj.existingLabels[i],
						labelText: obj.existingLabels[i],
						labelType: 'userDefined',
						labelClass: 'labelDiv',
						labelTextClass: 'labelText',
						labelDeleteClass: 'labelDeleteButton',
						deleteFunction: 'deleteLabel'
					});
					main.$.labelList.render();
				}
				if(obj.predictedLabels.length > 0 ) {
					for(var i=0;i<obj.predictedLabels.length;i++){
						main.predictedLabelTexts.push(obj.predictedLabels[i]);
						main.$.predictedLabelList.createComponent({
							kind: 'LabelItem',
							name: obj.predictedLabels[i],
							labelText: obj.predictedLabels[i],
							labelType: 'prediction',
							labelClass: 'predictedLabelDiv',
							labelTextClass: 'labelText',
							labelAddClass: 'labelAddButton',
							labelDeleteClass: 'labelDeleteButton',
							deleteFunction: 'deleteLabel',
							addFunction: 'addPredictedLabel'
						});
						main.$.predictedLabelList.render();
					}
					if(!readCookie('labelPrediction')) {
						main.$.predictedLabelListName.hide();
						main.$.predictedLabelList.hide();
					}
				}
				else {
					main.$.predictedLabelListName.hide();
					main.$.predictedLabelList.hide();
				}
			}
		});
		/*
		var userLabels = readCookie('userLabels'); // array!
		if(userLabels.length > 0) {
			for(var i=0;i<userLabels.length;i++) {
				main.$.userLabelPicker.createComponent({ content: userLabels[i] });
			}
			main.$.userLabelPicker.render();
		} */
	},
		
	/**
	 * This function shows/hides the list of predicted labels
	 * based on the 'enable' parameter.
	 * @method togglePredictedLabelLists
	 * @param {Boolean} enable enable/disable label prediction 
	 */
	togglePredictedLabelLists: function(enable) {
		if(enable=="true" && this.predictedLabelTexts.length > 0) {
			this.$.predictedLabelListName.show();
			this.$.predictedLabelList.show();
		}
		else {
			this.$.predictedLabelListName.hide();
			this.$.predictedLabelList.hide();
		}
	},
	
	/**
	 * This function runs when the user clicks on the 
	 * 'Add label' button. It displays the panel in which
	 * users can add labels using the input field.
	 * @method addMoreLabelsBtnPress
	 */
	addMoreLabelsBtnPress: function() {
		this.$.addMoreLabelsButton.hide();
		this.$.moreLabelsPanel.show();
        this.$.moreLabelInput.focus();
	},
		
	/**
	 * This function runs when the user clicks on the 
	 * 'Close' button. It hides the panel in which
	 * users can add labels using the input field.
	 * @method hideAddingPanelBtnPress
	 */
	hideAddingPanelBtnPress: function() {
		this.$.addMoreLabelsButton.show();
		this.$.moreLabelsPanel.hide();		
	},
	
	/**
	 * This function handles key press events. On pressing 
	 * 'Enter' it adds the entered label. On pressing 'ESC'
	 * it closes the panel.
	 * @method onKeydown
	 * @param {Object} inSender the sender object
	 * @param {Object} inEvent the fired event
	 */
	onKeydown: function(inSender, inEvent) {
		switch(inEvent.keyCode) {
			case 13:	// Enter
				this.addNewLabel();
				break;
			case 27: 	// Escape
				this.hideAddingPanelBtnPress();
				break;
		}
	},
	
	/**
	 * This function adds a label from the input field to the
	 * list of existing labels.
	 * @method addNewLabel
	 */
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
	
	/**
	 * This function adds a predicted label to the list of existing labels. 
	 * @method addPredictedLabel
	 */
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
	 * This function adds a user label to the list of existing labels. 
	 * @method addUserLabel
	 */
	addUserLabel: function(labelText) {		
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
		}
	},

    /**
     * This function deletes a label from the GUI and sends an annotation
	 * to the server about it.
	 * @method deleteLabel
	 * @param {String} labelText name of the label
	 * @param {Object} labelElement the label element
     */
    deleteLabel: function(labelText,labelElement){
		var ind = $.inArray(labelText,this.labelTexts);
		if(ind>-1) {
			this.sendLabelListAnnotation(this.labelListId,this.labelTexts[ind],-1);
			this.labelTexts.splice(ind,1);
			labelElement.destroy();
		}
		else {
			var ind = $.inArray(labelText,this.predictedLabelTexts);
			if(ind>-1) {
				this.sendLabelListAnnotation(this.labelListId,this.predictedLabelTexts[ind],-1);
				this.predictedLabelTexts.splice(ind,1);
				if(this.predictedLabelTexts.length==0) {
					this.$.predictedLabelListName.hide();
				}
				labelElement.destroy();
			}
		}
    },
	
	/**
	 * This function creates the proper annotation string
	 * and fires the annotation sender function.
	 * @method sendLabelListAnnotation
	 * @param {String} docURI URI of the related document
	 * @param {String} labelText name of the label
	 * @param {Number} action type of the click action (1 = accept; -1 = dismiss)
	 */
	sendLabelListAnnotation: function(docURI,labelText,action) {
				
		var currentDate = new Date().toISOString();
		var userURI =  'http://fusepool.info/users/'+readCookie('currentUser');
		
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