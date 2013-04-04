enyo.kind({
    name: 'DocumentInOpen',
    kind: enyo.Control,
    classes: 'documentInOpen',

    published: {
        documentId: '',
        documentTitle: '',
        documentContent: ''
    },

    create: function(){
        this.inherited(arguments);
        this.$.documentBox.hide();
    },
    
    components: [
        { tag: 'div', classes: 'openedDocument', name: 'documentBox', components: [
            { kind: 'enyo.Scroller', fit: true, touch: true, touchOverscroll: false, components: [
                { tag: 'div', classes: 'documentTitle', name: 'title' },
                { tag: 'div', classes: 'documentContent', name: 'content' }
            ]}
        ]}
    ],

    openDoc: function(documentId){
        this.documentId = documentId;
        var docObj = this.getFakeDocument();
        this.showDoc(docObj);
    },

    showDoc: function(docObj){
        if(docObj.title != '' && docObj.content != ''){
            this.documentTitle = docObj.title;
            this.documentContent = docObj.content;
            this.$.title.setContent(this.documentTitle);
            this.$.content.setContent(this.documentContent);
        } else {
            this.$.content.setContent('No data available');
        }
        this.$.documentBox.show();
    },

    getFakeDocument: function(){
        var docObj = {};
        if(this.documentId == 'AAAAAA1'){
            docObj.title = 'Star Wars Episode III';
            docObj.content = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam rutrum malesuada leo quis mollis. Duis sollicitudin purus rhoncus magna tempor et volutpat eros pulvinar. Phasellus id velit eget sem pretium luctus et eget urna. Fusce ac lorem a diam consequat ullamcorper. Ut vehicula odio in tellus interdum eu dapibus risus pretium. Sed convallis orci eu orci vehicula non fermentum enim dictum. Etiam non dolor nec neque mattis interdum vel sed mi. Integer ipsum ante, tincidunt non hendrerit eget, iaculis eu dui. Fusce quis elit est, et cursus velit. Vivamus eget leo at libero blandit tristique. Donec eleifend malesuada magna, in porttitor sem pellentesque vitae. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec elementum leo id neque porttitor vel scelerisque orci volutpat. In hac habitasse platea dictumst. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Praesent vel dolor volutpat augue dictum feugiat sed sed urna. Ut malesuada augue id turpis commodo porttitor. Nullam turpis dolor, mollis at tincidunt eget, faucibus suscipit nibh. Nulla et mauris odio. Sed leo ligula, malesuada at hendrerit id, pharetra vitae justo. In eu mi odio. In posuere, neque sed feugiat auctor, urna est vestibulum diam, a aliquet lorem tortor facilisis dui. Integer sollicitudin, nisl eget bibendum facilisis, elit leo congue lectus, at bibendum nulla orci nec lectus. Proin feugiat, nibh non condimentum consectetur, urna velit mollis odio, vel lacinia quam lorem nec urna. Etiam at arcu ipsum, et vehicula lorem. Suspendisse ac augue vitae tortor gravida iaculis sit amet in erat. Suspendisse potenti. Nullam a nisl nec mi vehicula condimentum eu sed mauris. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Cras ut ligula tortor, ac venenatis massa. Nam vehicula, magna quis vestibulum imperdiet, felis felis vulputate felis, aliquam hendrerit erat nulla et nunc. Phasellus hendrerit dictum massa ac bibendum. Pellentesque ut purus ut lorem aliquet sodales. Etiam ipsum odio, elementum at tempor ultricies, rhoncus eu neque.';            
        } else {
            docObj.title = 'Other document';
            docObj.content = 'Fusce ac lorem a diam consequat ullamcorper. Ut vehicula odio in tellus interdum eu dapibus risus pretium. Sed convallis orci eu orci vehicula non fermentum enim dictum. Etiam non dolor nec neque mattis interdum vel sed mi. Integer ipsum ante, tincidunt non hendrerit eget, iaculis eu dui. Fusce quis elit est, et cursus velit. Vivamus eget leo at libero blandit tristique. Donec eleifend malesuada magna, in porttitor sem pellentesque vitae. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec elementum leo id neque porttitor vel scelerisque orci volutpat. In hac habitasse platea dictumst. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Praesent vel dolor volutpat augue dictum feugiat sed sed urna. Ut malesuada augue id turpis commodo porttitor. Nullam turpis dolor, mollis at tincidunt eget, faucibus suscipit nibh. Nulla et mauris odio. Sed leo ligula, malesuada at hendrerit id, pharetra vitae justo. In eu mi odio. In posuere, neque sed feugiat auctor, urna est vestibulum diam, a aliquet lorem tortor facilisis dui. Integer sollicitudin, nisl eget bibendum facilisis, elit leo congue lectus, at bibendum nulla orci nec lectus. Proin feugiat, nibh non condimentum consectetur, urna velit mollis odio, vel lacinia quam lorem nec urna. Etiam at arcu ipsum, et vehicula lorem. Suspendisse ac augue vitae tortor gravida iaculis sit amet in erat. Suspendisse potenti. Nullam a nisl nec mi vehicula condimentum eu sed mauris. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Cras ut ligula tortor, ac venenatis massa. Nam vehicula, magna quis vestibulum imperdiet, felis felis vulputate felis, aliquam hendrerit erat nulla et nunc. Phasellus hendrerit dictum massa ac bibendum. Pellentesque ut purus ut lorem aliquet sodales. Etiam ipsum odio, elementum at tempor ultricies, rhoncus eu neque.';
        }
        return docObj;
    }

});