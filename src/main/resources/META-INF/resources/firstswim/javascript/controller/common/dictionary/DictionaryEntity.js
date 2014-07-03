/**
* @class DictionaryEntity
*/
enyo.kind(
/** @lends DictionaryEntity.prototype */
{
    tag: 'div',
    name: 'DictionaryEntity',
    style: 'position: relative',

    published: {
        addressURL: '',
        entityId: '',
        entityText: '',
        entityCount: 0,
        mainClass: '',
        entityTextClass: '',
		entityCountClass: '',
        entityCheckboxClass: '',
        detailsURL: '',
        parentFunction: '',
        typeFacet: false,
        checked: false,
		checkable: true,
        showDetailsFunction: '',
        detailsStart: false
    },

    create: function(){
        this.inherited(arguments);
        this.$.main.setClasses(this.mainClass);
		if(this.checkable) {
			this.$.entityCheckbox.setValue(this.checked);
			this.$.entityCheckbox.setClasses(this.entityCheckboxClass);
		}
		else {
			this.$.entityCheckbox.hide();
		}
        this.$.entityLabel.setContent(this.entityText);
        this.$.entityLabel.setClasses(this.entityTextClass);
		if(this.entityCount > 0) {
			// TODO -1 helyett helyes ertek pipalas utan (DesktopApp)
			this.$.entityCount.setContent('('+this.entityCount+')');
		}
        this.$.entityCount.setClasses(this.entityCountClass);
        this.$.facetMenu.hide();
    },

    rendered: function(){
        this.inherited(arguments);
        var facetMenu = this.$.facetMenu;
        var newTabBtnId = facetMenu.getChildrenById(1).getId();
        jQuery('#'+newTabBtnId).attr('data-clipboard-text', this.entityId);
        new ZeroClipboard(jQuery('#'+newTabBtnId), {
            moviePath: CONSTANTS.CLIPBOARD_COPY_PATH,
            hoverClass: 'menuItemHover'
        });
        jQuery('#global-zeroclipboard-html-bridge').click(function(){
            facetMenu.hide();
        });
    },

    components: [
        { tag: 'div', name: 'main', onenter: 'preDetails', onmouseout: 'stopDetails', components: [
            { kind: onyx.Checkbox, name: 'entityCheckbox', onchange: 'checkboxChange' },
            { tag: 'span', name: 'entityLabel', onclick: 'entityClick', onenter: 'preDetails', onmouseout: 'stopDetails' },
            { tag: 'span', name: 'entityCount' }
        ]},
        { kind: 'DynamicMenu', name: 'facetMenu', classes: 'facetMenu',
            menuItemClass: 'entityMenuItem', menuItems: [
                { label: 'Open in new tab', functionName: 'openInNewTab' },
                { label: 'Copy URI to clipboard' }
            ]
        }
    ],

    /**
     * This function is called when the user click on the 'Open in new tab' menuitem.
     */
    openInNewTab: function(){
        this.$.facetMenu.hide();
        window.open(this.entityId, '_blank');
    },

    hideMenu: function(){
        this.$.facetMenu.hide();
    },

    /**
     * This function is called when the user hover the mouse over an entity.
     * It waits for one second and if the user didn't leave the entity, it calls
     * the details function.
     */
    preDetails: function(){
        if(!this.detailsStart){
            this.detailsStart = true;
            var main = this;
            setTimeout(function(){
                if(main.detailsStart){
                    main.stopDetails();
                    main.getDetails();
                }
            }, 400);
        }
    },

    /**
     * It stopped the details if the user move out the mouse from the entity.
     */
    stopDetails: function(){
        this.detailsStart = false;
    },

    /**
     * This function send an ajax request to get an entity's details
     */
    getDetails: function(){
        var main = this;
        var url = this.detailsURL + '?iri=' + this.entityId;
        var store = rdfstore.create();
        store.load('remote', url, function(success) {
            main.processDetailsResponse(success, store);
        });
    },

    /**
     * This functions runs when the details ajax response is arrived about the details.
     * @param {Boolean} success the search query was success or not
     * @param {Object} rdf the response rdf object
     */
    processDetailsResponse: function(success, rdf){
        if(!isEmpty(this.owner)){
            this.owner.owner[this.showDetailsFunction](rdf);
        }
    },

    /**
     * This function is called when the user check/uncheck the checkbox.
     * It calls the callParent function.
     * @param {Object} inSender the checkbox component
     */
    checkboxChange: function(inSender){
        var cbValue = inSender.getValue();
        this.callParent(cbValue);
    },

    /**
     * This function is called when the user clicks on an entity.
     */
    entityClick: function(inSender, inEvent){
		if(readCookie('viewType') != 'entityList') {
			if(inEvent.which == 3){
				this.$.facetMenu.show();
			} else {
				var cbValue = !this.$.entityCheckbox.getValue();
				this.callParent(cbValue);            
			}
        }
    },

    /**
     * This function calls the parent's search function with the clicked entity
     * and the new checkbox value.
     * @param {Boolean} cbValue new checkbox value
     */
    callParent: function(cbValue){
        this.owner.owner[this.parentFunction]({id: this.entityId, text: this.entityText, typeFacet: this.typeFacet, count: this.entityCount}, cbValue);
    }

});