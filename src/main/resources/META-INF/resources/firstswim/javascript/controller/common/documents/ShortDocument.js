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
        openButtonClass: ''
    },

    /**
     * When the component is created the program set the content's properties and
     * join the openDocEvent event to the shortDoc component.
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
    },

    /**
     * After the rendering, the positive/negative slider will be initialized.
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

        var newTabBtnId = this.$.documentMenu.getChildrenById(1).getId();
        jQuery('#'+newTabBtnId).attr('data-clipboard-text', this.url);
        new ZeroClipboard(jQuery('#'+newTabBtnId), {
            moviePath: CONSTANTS.CLIPBOARD_COPY_PATH,
            hoverClass: 'menuItemHover'
        });
        var main = this;
        jQuery('#global-zeroclipboard-html-bridge').click(function(){
            main.$.documentMenu.hide();
        });
    },

    components: [
        { name: 'shortDoc', components: [
            { tag: 'div', name: 'controls', classes: 'shortDocumentControls enyo-unselectable', components: [
                { tag: 'div', name: 'icon', classes: 'shortDocumentIcon', onclick: 'tapIcon' },
                { tag: 'div', name: 'rateSlider', classes: 'rateSlider enyo-unselectable' }
            ]},
            { kind: 'DynamicMenu', name: 'documentMenu', classes: 'documentMenu',
                menuItemClass: 'entityMenuItem', menuItems: [
                    { label: 'Open in new tab', functionName: 'openInNewTab' },
                    { label: 'Copy URI to clipboard', functionName: 'copyURIToClipboard' }
                ]
            },
            { tag: 'div', name: 'title', onleave: 'leaveMenu', style: 'cursor: pointer;' },
            { tag: 'div', name: 'content', onleave: 'leaveMenu', style: 'cursor: pointer;', allowHtml: true },
            { tag: 'div', classes: 'clear' }
        ]}
    ],

    leaveMenu: function(){
        this.$.documentMenu.hide();
    },

    /**
     * This function is called when the user click on the 'Open in new tab' menuitem.
     */
    openInNewTab: function(){
        this.$.documentMenu.hide();
        window.open(this.url, '_blank');
    },

    /**
     * This function is called when the user click on the 'Copy URI to clipboard' menuitem.
     */
    copyURIToClipboard: function(){
        this.$.documentMenu.hide();
        var newTabBtnId = this.$.newTabBtn.getId();
    },

    /**
     * This function runs when the user do a same event with the openDocEvent
     * event (like ontap, ontouch, onenter, etc). It calls the parent's function,
     * which can open a document to preview.
     * @param {Object} inSender the component where the event is created (shortDoc)
     * @param {Object} inEvent the event which is created (inEvent is important in the desktop version)
     */
    openDoc: function(inSender, inEvent){
        this.$.documentMenu.hide();
        this.owner[this.parentFunction](this.url, inEvent);
    },

    /**
     * This function runs when the user click on the document icon.
     * @param {Object} inSender the document icon
     * @param {Object} inEvent the click event
     */
    tapIcon: function(inSender, inEvent){
        if(inEvent.which == 3){
            this.$.documentMenu.show();
        }
    },

    /**
     * This function shows the slider bar if the activated parameter is true, hides the bar otherwise
     * @param {Boolean} activated show the slidebar or not
     */
    updateRatings: function(activated){
        this.showSlidebar = activated;
        if(activated){
            this.$.rateSlider.show();
        } else {
            this.$.rateSlider.hide();
        }
    },

    /**
     * This function runs when the slides the bar. It calls the parent addCheck or removeCheck function
     */
    checking: function(){
        if(this.prevCheckVal === 1){
            this.owner[this.addCheckFunction]();
        }
        if(this.slideValue === 1){
            this.owner[this.removeCheckFunction]();
            this.$.rateSlider.applyStyle('background-color', 'white');
        } else if(this.slideValue === 2){
            this.$.rateSlider.applyStyle('background-color', 'lightgreen');
        } else {
            this.$.rateSlider.applyStyle('background-color', 'lightcoral');
        }
        this.prevCheckVal = this.slideValue;
    }

});