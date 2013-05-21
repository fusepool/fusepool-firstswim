enyo.kind({

    name: 'DetailsBox',
    kind: enyo.Control,

    components: [
        { tag: 'div', name: 'detailsTitle', classes: 'detailsTitle' },
        { kind: enyo.Image, name: 'detailsImage', classes: 'detailsImage' },
        { tag: 'div', name: 'detailsContent', classes: 'detailsContent' }
    ],

    updateDetails: function(detailsObject){
        this.$.detailsTitle.setContent(detailsObject.title);
        var image = detailsObject.image;
        if(isEmpty(image)){
            this.$.detailsImage.hide();
        } else {
            this.$.detailsImage.setSrc(image);
            this.$.detailsImage.show();
        }
        this.$.detailsContent.setContent(detailsObject.content);
    }

});