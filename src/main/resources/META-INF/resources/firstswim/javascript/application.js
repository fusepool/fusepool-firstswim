enyo.kind({
    name: "enyo.sample.WebServiceSample",
    kind: "FittableRows",
    classes: "enyo-fit webservice-sample",
    components: [
        {kind: "WebService", name: "entityhub", url: "/entityhub/site/dbpedia/find", onResponse: "processResponse", callbackName: "callback"},
        {kind: "FittableColumns", classes: "onyx-toolbar-inline", components: [
                {content: "Search: "},
                {kind: "onyx.Input", name: "query", fit: true, value: 'Delft'},
                {kind: "onyx.Button", content: "Fetch", ontap: "fetch"}
            ]},
        {kind: "onyx.TextArea", fit: true, classes: "webservice-sample-source"}
    ],

    fetch: function() {
    // send parameters the remote service using the 'send()' method
        this.$.entityhub.send({
            name: this.$.query.getValue(),
        });
    },
    processResponse: function(inSender, inEvent) {
    // do something with it
        this.$.textArea.setValue(JSON.stringify(inEvent.data, null, 2));
    }
});
