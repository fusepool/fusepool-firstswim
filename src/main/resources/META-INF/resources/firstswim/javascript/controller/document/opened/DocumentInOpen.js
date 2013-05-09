enyo.kind({
    name: 'DocumentInOpen',
    kind: enyo.Control,

    published: {
        documentURL: '',
        menu: null
    },

    create: function(){
        this.inherited(arguments);
        this.createMenu();
    },

    createMenu: function(){
        enyo.kind({ 
            kind: enyo.Control,
            name: 'MenuController',
            classes: 'entityMenu',
            
            published: {
                clickTop: null,
                clickLeft: null,
                selectedText: ''
            },

            components: [
                { kind: 'DynamicMenu', name: 'entityMenu',
                    menuItemClass: 'entityMenuItem', menuItems: [
                        { label: 'Add entity', functionName: 'addEntity' },
                        { label: 'Remove entity', functionName: 'removeEntity' },
                        { label: 'Move entity', functionName: 'moveEntity' }
                    ]
                },
                {
                    kind: 'AddEntityPopup',
                    name: 'addEntityPopup',
                    classes: 'addEntityPopup',
                    entityContentClass: 'addEntityContent',
                    titleContent: 'Add entity: ',
                    selectClass: 'dictionarySelect',
                    okAddEntityButtonClass: 'okAddEntityButton',
                    okAddEntityButtonContent: 'OK',
                    cancelAddEntityButtonContent: 'Cancel'
                },
                {
                    kind: 'RemoveEntityPopup',
                    name: 'removeEntityPopup',
                    classes: 'removeEntityPopup',
                    entityContentClass: 'removeEntityContent',
                    titleClass: 'removeEntityTitle',
                    titleContent: 'Remove entity: ',
                    selectClass: 'dictionarySelect',
                    okButtonClass: 'okRemoveEntityButton',
                    okButtonContent: 'OK',
                    cancelButtonContent: 'Cancel'
                },
                {
                    kind: 'MoveEntityPopup',
                    name: 'moveEntityPopup',
                    classes: 'moveEntityPopup',
                    entityContentClass: 'moveEntityContent',
                    titleClass: 'moveEntityTitle',
                    titleContent: 'Move entity: ',
                    fromContent: 'From:',
                    fromClass: 'fromToText',
                    fromSelectClass: 'dictionarySelect',
                    toContent: 'From:',
                    toClass: 'fromToText',
                    toSelectClass: 'dictionarySelect',
                    okButtonClass: 'okMoveEntityButton',
                    okButtonContent: 'OK',
                    cancelButtonContent: 'Cancel'
                }
            ],

            addEntity: function(){
                this.hideMenu();
                this.$.addEntityPopup.addEntity(this.selectedText);
            },

            removeEntity: function(){
                this.hideMenu();
                this.$.removeEntityPopup.removeEntity(this.selectedText);
            },

            moveEntity: function(){
                this.hideMenu();
                this.$.moveEntityPopup.moveEntity(this.selectedText);
            },

            showMenu: function(inEvent, selectedText){
                this.selectedText = selectedText;
                this.clickTop = inEvent.pageY;
                this.clickLeft = inEvent.pageX;
                this.applyStyle('top', this.clickTop + 'px');
                this.applyStyle('left', this.clickLeft + 'px');
                this.$.entityMenu.show();
            },

            hideMenu: function(){
                this.$.entityMenu.hide();
            }

        });
        this.menu = new MenuController();
        this.menu.renderInto(document.getElementById('menu'));
        this.menu.hideMenu();
    },

    components: [
        {
            kind: 'DocumentBox',
            name: 'documentBox',
            classes: 'openedDocument',
            positiveRateClass: 'positiveRate',
            negativeRateClass: 'negativeRate',
            documentTitleClass: 'documentTitle',
            documentContentClass: 'documentContent',
            noDataLabel: 'No data available',
            rateDivClass: 'rateDiv',
            ontap: 'hideMenu'
        },
        {
            kind: 'RatePopup',
            name: 'ratePopup',
            classes: 'ratePopup',
            positiveLabel: 'Rate to positive',
            negativeLabel: 'Rate to negative',
            okButtonLabel: 'OK',
            placeholderText: 'Category name...',
            rateContentClass: 'rateContent',
            inputFrameClass: 'searchLabel',
            okButtonClass: 'okRateButton'
        }
    ],

    showMenu: function(inEvent, selectedText){
        if(!isEmpty(this.menu)){
            this.menu.showMenu(inEvent, selectedText);
        }
     },

     hideMenu: function(){
        if(!isEmpty(this.menu)){
            this.menu.hideMenu();
        }
     },

    showRatePopup: function(isPositive, content){
        this.$.ratePopup.showPopup(isPositive, content);
    },

    openDoc: function(documentURL){
        this.documentURL = documentURL;
        var request = new enyo.Ajax({
            method: 'GET',
            url: documentURL + '.meta',
            handleAs: 'text',
            headers: { Accept: 'application/rdf+xml' }
        });
        request.go();
        request.response(this, function(inSender, inResponse) {
            this.processOpenDocResponse(inResponse);
        });
    },

    processOpenDocResponse: function(data){
        // Delete bad type rows, and replace new lines to spaces
        var textArray = data.split('\n');
        var newText = '';
        for(var i=0;i<textArray.length;i++){
            var row = textArray[i];
            if(row.indexOf('http://www.w3.org/2001/XMLSchema#base64Binary') === -1){
                newText += textArray[i];
                if(row.indexOf('<') === -1 && row.indexOf('>') === -1 && row.indexOf('xmlns') === -1){
                    newText += '|';
                } else {
                    newText += ' ';
                }
            }
        }
        newText = newText.substring(0, newText.length-1);

        var parsedData = new DOMParser().parseFromString(newText,'text/xml');
        var rdf = jQuery.rdf();
        rdf.load(parsedData, {});

        var docText = '';
        rdf.where('?s <http://rdfs.org/sioc/ns#content> ?o').each(function(){
            docText = this.o.value;
        });
        this.$.documentBox.showDoc({ title : '', content : docText });
    }

});