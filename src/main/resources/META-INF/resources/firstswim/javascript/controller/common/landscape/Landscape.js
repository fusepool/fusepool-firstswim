/**
* @class Landscape
*/
enyo.kind(
/** @lends Landscape.prototype */
{
    name: 'Landscape',
    kind: enyo.Control,

    published: {
        titleClass: '',
        titleContent: '',
        loaderClass: ''
    },

    /**
     * When the component is created the program sets the title's properties and
     * hides the loader.
     */
    create: function(){
        this.inherited(arguments);
        this.$.loader.hide();
        this.$.title.setContent(this.titleContent);
        this.$.title.setClasses(this.titleClass);
        this.$.loader.setClasses(this.loaderClass);
		// FusePool.Landscaping.initialize('.landscapeDiv');
    },

    components: [
        { tag: 'div', name: 'title' },
		{ name: 'loader' },
		{ tag: 'div', name: 'landscapeDiv', published: { id: 'landscapeDiv'}, classes: 'landscapeDiv', content: 'Coming soon...' }
    ],
	
    /**
     * This function runs, when the user starts a search. It only shows the loader yet.
     */
    startLoading: function(){
        this.$.loader.show();
	}
	
});
