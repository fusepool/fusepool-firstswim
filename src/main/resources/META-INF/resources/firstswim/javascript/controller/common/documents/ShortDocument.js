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

    components: [
        { name: 'shortDoc', components: [
            { tag: 'div', name: 'title' },
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
    }

});