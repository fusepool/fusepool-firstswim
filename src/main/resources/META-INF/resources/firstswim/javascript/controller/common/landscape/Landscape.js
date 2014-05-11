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
        loaderClass: '',
        searchWord: ''
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
    },

    components: [
        { tag: 'div', name: 'title' },
		{ name: 'loader' },
		{ tag: 'div', name: 'landscapeDiv', classes: 'landscapeDiv', content: 'Initializing...' }
    ],
	
    /**
     * This function runs, when the user starts a search. It only shows the loader yet.
     */
    startLoading: function(){
//        this.$.loader.show();
    },
	
	rendered: function() {
		this.inherited(arguments); // important! must call the inherited method
		if (this.hasNode()) {
			// Daniel van Adrichem: the actual div is not yet created while
			// in the .create() function. I have added it to this this
			// rendered() function since this is called after everything
			// has been created.
			// first remove the current content
			this.$.landscapeDiv.setContent('');
			// then initialize landscaping (if available)
			if (window['FusePool'] === undefined ||
				FusePool['Landscaping'] === undefined) {
				this.$.landscapeDiv.setContent('Landscape currently unavailable.');
			}
			else {
				FusePool.Landscaping.initialize('.landscapeDiv', this);
			}
		}
	}
	
});
