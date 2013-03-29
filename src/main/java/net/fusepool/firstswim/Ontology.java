package net.fusepool.firstswim;

import org.apache.clerezza.rdf.core.UriRef;


/**
 * Ideally this should be a dereferenceable ontology on the web. Given such 
 * an ontology a class of constant (similar to this) can be generated with
 * the org.apache.clerezza:maven-ontologies-plugin
 */
public class Ontology {
    /**
     * Resources of this type handle HTTP POST requests with a multipart message
     * containing the content to be enhance as one field and optionally the
     * requested enhancment chain in the other.
     */
    public static final UriRef GUI = new UriRef("http://example.org/service-description#GUI");
    
}
