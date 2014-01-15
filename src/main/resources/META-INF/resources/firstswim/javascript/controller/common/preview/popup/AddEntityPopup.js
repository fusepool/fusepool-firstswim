enyo.kind({

    kind: onyx.Popup,
    name: 'AddEntityPopup',

    published: {
        titleContent: '',
        okButtonContent: '',
        cancelButtonContent: '',
		selectedText: ''
    },

    create: function(){
        this.inherited(arguments);
        this.$.title.setContent(this.titleContent);
        this.$.okButton.setContent(this.okButtonContent);
        this.$.cancelButton.setContent(this.cancelButtonContent);
    },

    components: [
        { tag: 'div', name: 'addEntityContent', components: [
            { tag: 'span', name: 'title', classes: 'addEntityTitle' },
            { tag: 'span', name: 'addEntityWord' }
        ]},
        { tag: 'select', name: 'dictionarySelect', components: [
            { tag: 'option', content: 'Person', value: 'urn:fusepool-person-ontology' },
            { tag: 'option', content: 'Location', value: 'urn:fusepool-location-ontology' },
            { tag: 'option', content: 'Organization', value: 'urn:fusepool-organization-ontology' },
            { tag: 'option', content: 'Disease', value: 'urn:fusepool-disease-ontology' }
        ]},		
        { kind: onyx.Button, name: 'okButton', ontap: 'okAddEntity' },
        { kind: onyx.Button, name: 'cancelButton', ontap: 'cancelAddEntity' }
    ],

    addEntity: function(selectedText){
		this.selectedText = selectedText;
        this.$.addEntityWord.setContent(selectedText);
        this.show();
    },

    okAddEntity: function(){
		var annotationBody = '<userID>: unknown; <dictionary>: '+this.$.dictionarySelect.components[this.$.dictionarySelect.eventNode.selectedIndex].value+'; <entity>: '+this.selectedText+'; <event>: add;';
		// console.log(annotationBody);
		// Preparing the annotationBody... Then:
		// sendAnnotation(annotationBody);
        this.hide();
    },

    cancelAddEntity: function(){
        this.hide();
    }
});