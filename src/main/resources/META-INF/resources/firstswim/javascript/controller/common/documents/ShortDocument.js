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
        this.$.shortDoc[this.openDocEvent] = 'openDoc';
        this.$.title.setContent(this.title);
        this.$.title.setClasses(this.titleClass);
        this.$.content.setContent(this.shortContent);
        this.$.content.setClasses(this.contentClass);
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
    },

    components: [
        { name: 'shortDoc', components: [
            { tag: 'div', name: 'controls', classes: 'shortDocumentControls enyo-unselectable', components: [
				{ tag: 'div', name: 'icon', classes: 'shortDocumentIcon' },
				{ tag: 'div', name: 'rateSlider', classes: 'rateSlider enyo-unselectable' }
			]},
            { tag: 'div', name: 'title' },
            { tag: 'div', name: 'content', allowHtml: true },
            { tag: 'div', classes: 'clear' }
        ]}
    ],

    /**
     * This function runs when the user do a same event with the openDocEvent
     * event (like ontap, ontouch, onenter, etc). It calls the parent's function,
     * which can open a document to preview.
     * @param {Object} inSender the component where the event is created (shortDoc)
     * @param {Object} inEvent the event which is created (inEvent is important in the desktop version)
     */
    openDoc: function(inSender, inEvent){
        this.owner[this.parentFunction](this.url, inEvent);
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