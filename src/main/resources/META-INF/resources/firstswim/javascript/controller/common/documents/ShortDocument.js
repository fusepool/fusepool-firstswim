/**
* @class ShortDocument
*/
enyo.kind(
/** @lends ShortDocument.prototype */
{
    name: 'ShortDocument',
    kind: enyo.Control,

    published: {
        url: '',
        title: '',
        titleClass: '',
        shortContent: '',
        openDocEvent: '',
        parentFunction: '',
        slideValue: 1,
        prevCheckVal: 1,
        addCheckFunction: '',
        removeCheckFunction: '',
        showSlidebar: false,
        shortDocumentClass: '',
        contentClass: '',
        openButtonClass: '',
		labelListClass: '',
		moreLabelsPanelClass: '',
		moreLabelInputClass: '',
		moreLabelInputDecClass: '',
		addLabelButtonClass: '',
		hideAddingPanelButtonClass: '',
		searchWord: ''
    },

    /**
     * When the component is created the program sets the content's properties and
     * binds the 'openDocEvent' event to the 'shortDoc' component.
	 * @method create
     */
    create: function(){
		this.inherited(arguments);
		this.$.shortDoc.setClasses(this.shortDocumentClass);
		this.$.content[this.openDocEvent] = 'openDoc';
		this.$.title[this.openDocEvent] = 'openDoc';
		this.$.title.setContent(this.title);
		this.$.title.setClasses(this.titleClass);
		this.$.content.setContent(this.shortContent);
		this.$.content.setClasses(this.contentClass);
		this.$.documentMenu.hide();
		this.$.labelListContainer.createComponent({
			kind: 'LabelList',
			labelListId: this.url,
			labelListClass: this.labelListClass,
			moreLabelsPanelClass: this.moreLabelsPanelClass,
			moreLabelInputClass: this.moreLabelInputClass,
			moreLabelInputDecClass: this.moreLabelInputDecClass,
			addLabelButtonClass: this.addLabelButtonClass,
			hideAddingPanelButtonClass: this.hideAddingPanelButtonClass,
			searchWord: this.searchWord
		});
    },

    /**
     * After rendering, the positive/negative slider is being initialized.
	 * @method rendered
     */
    rendered: function(){
        this.inherited(arguments);
        var main = this;
        var sliderId = this.$.rateSlider.getId();
		jQuery('#' + sliderId).slider({
            value: this.slideValue,
            min: 0,
            orientation: 'vertical',
            max: 2,
            step: 1,
            slide: function(event, ui) {
                main.slideValue = ui.value;
                main.checking();
            }
		});
        if(!this.showSlidebar){
            this.$.rateSlider.hide();
        }
        var documentMenu = this.$.documentMenu;
        var newTabBtnId = documentMenu.getChildrenById(1).getId();
        jQuery('#'+newTabBtnId).attr('data-clipboard-text', this.url);
        new ZeroClipboard(jQuery('#'+newTabBtnId), {
            moviePath: CONSTANTS.CLIPBOARD_COPY_PATH,
            hoverClass: 'menuItemHover'
        });
        jQuery('#global-zeroclipboard-html-bridge').click(function(){
            documentMenu.hide();
        });
    },

    components: [
        { name: 'shortDoc', ontap: 'leaveMenu', components: [
            { tag: 'div', name: 'controls', classes: 'shortDocumentControls enyo-unselectable', components: [
                { tag: 'div', name: 'icon', classes: 'shortDocumentIcon', onclick: 'tapIcon' },
                { tag: 'div', name: 'rateSlider', classes: 'rateSlider enyo-unselectable' }
            ]},
            { kind: 'DynamicMenu', name: 'documentMenu', classes: 'documentMenu',
                menuItemClass: 'entityMenuItem', menuItems: [
                    { label: 'Open in new tab', functionName: 'openInNewTab' },
                    { label: 'Copy URI to clipboard' }
                ]
            },
            { tag: 'div', name: 'title', onleave: 'leaveMenu', style: 'cursor: pointer;' },
            { tag: 'div', name: 'content', onleave: 'leaveMenu', style: 'cursor: pointer;', allowHtml: true },
            { tag: 'div', classes: 'clear' },
            { tag: 'div', name: 'labelListContainer', classes: 'labelListContainer' },
            { tag: 'div', classes: 'clear' }
        ]}
    ],

	/**
	 * This function is called when the user enables/disables
	 * label prediction. It calls the toggle function of each
	 * label lists'.
	 * @method togglePredictedLabelLists
	 * @param {Boolean} enable state of label prediction
	 */
	togglePredictedLabelLists: function(enable) {
        var labelList = this.$.labelListContainer.children;
        for(var i=0;i<labelList.length;i++){
            labelList[i].togglePredictedLabelLists(enable);
        }
	},
	
    /**
     * This function hides the document popup menu.
	 * @method leaveMenu
     */
    leaveMenu: function(){
        this.$.documentMenu.hide();
    },

    /**
     * This function is called when the user clicks on the
	 * 'Open in new tab' menu item.
	 * @method openInNewTab
     */
    openInNewTab: function(){
        this.$.documentMenu.hide();
        window.open(this.url, '_blank');
    },

    /**
     * This function runs on 'openDocEvent' events (ontap, ontouch, onenter, etc).
	 * It calls the parent's function which opens the document in the preview.
	 * @method openDoc
     * @param {Object} inSender the component where the event is fired (shortDoc)
     * @param {Object} inEvent the fired event (important in the desktop version)
     */
    openDoc: function(inSender, inEvent){
        this.$.documentMenu.hide();
        this.owner[this.parentFunction](this.url, this.type, inEvent);
    },

    /**
     * This function runs when the user clicsk on the document icon.
	 * @method tapIcon
     * @param {Object} inSender the document icon
     * @param {Object} inEvent the click event
     */
    tapIcon: function(inSender, inEvent){
        if(inEvent.which == 3){
            this.$.documentMenu.show();
        }
    },

    /**
     * This function shows/hides the slider bar according to the
	 * 'activated' parameter
	 * @method updateRatings
     * @param {Boolean} activated display status of the slide bar
     */
    updateRatings: function(activated){
        this.showSlidebar = activated;
        if(activated){
            this.$.rateSlider.show();
        }
		else {
            this.$.rateSlider.hide();
        }
    },

    /**
     * This function runs when the user slides the bar.
	 * It calls the parent addCheck or removeCheck function.
	 * @method checking
     */
    checking: function(){
        if(this.prevCheckVal === 1){
            this.owner[this.addCheckFunction]();
        }
        if(this.slideValue === 1){
            this.owner[this.removeCheckFunction]();
            this.$.rateSlider.applyStyle('background-color', 'white');
        }
		else if(this.slideValue === 2){
            this.$.rateSlider.applyStyle('background-color', 'lightgreen');
        }
		else {
            this.$.rateSlider.applyStyle('background-color', 'lightcoral');
        }
        this.prevCheckVal = this.slideValue;
    }

});