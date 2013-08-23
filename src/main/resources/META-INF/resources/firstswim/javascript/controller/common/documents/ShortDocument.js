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
        contentClass: '',
        openButtonClass: ''
    },

    /**
     * When the component is created the program set the content's properties and
     * join the openDocEvent event to the shortDoc component.
     */
    create: function(){
        this.inherited(arguments);
        this.$.shortDoc.setClasses(this.contentClass);
        this.$.shortDoc[this.openDocEvent] = 'openDoc';
        this.$.title.setContent(this.title);
        this.$.title.setClasses(this.titleClass);
        this.$.content.setContent(this.shortContent);
    },

    /**
     * After the rendering, the positive/negative slider will be initialized.
     */
    rendered: function(){
        this.inherited(arguments);
        var sliderId = this.$.rateSlider.getId();
	jQuery("#" + sliderId).slider({
            value: 1,
            min: 0,
            orientation: 'vertical',
            max: 2,
            step: 1
	});
        this.$.rateSlider.hide();
    },

    components: [
        { name: 'shortDoc', components: [
            { tag: 'div', name: 'title' },
            { tag: 'div', name: 'rateSlider', classes: 'rateSlider enyo-unselectable' },
            { tag: 'div', name: 'content' }
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
        if(activated){
            this.$.rateSlider.show();
        } else {
            this.$.rateSlider.hide();
        }
    }

});