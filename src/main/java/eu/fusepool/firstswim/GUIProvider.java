package eu.fusepool.firstswim;

import java.security.Permission;
import java.util.Collections;
import java.util.concurrent.locks.Lock;
import javax.ws.rs.GET;
import javax.ws.rs.HeaderParam;
import javax.ws.rs.Path;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.UriInfo;
import org.apache.clerezza.rdf.core.Literal;
import org.apache.clerezza.rdf.core.MGraph;
import org.apache.clerezza.rdf.core.Resource;
import org.apache.clerezza.rdf.core.TypedLiteral;
import org.apache.clerezza.rdf.core.UriRef;
import org.apache.clerezza.rdf.core.access.LockableMGraph;
import org.apache.clerezza.rdf.core.access.NoSuchEntityException;
import org.apache.clerezza.rdf.core.access.TcManager;
import org.apache.clerezza.rdf.core.access.security.TcAccessController;
import org.apache.clerezza.rdf.core.access.security.TcPermission;
import org.apache.clerezza.rdf.core.impl.PlainLiteralImpl;
import org.apache.clerezza.rdf.core.sparql.ParseException;
import org.apache.clerezza.rdf.core.sparql.QueryParser;
import org.apache.clerezza.rdf.core.sparql.ResultSet;
import org.apache.clerezza.rdf.core.sparql.SolutionMapping;
import org.apache.clerezza.rdf.core.sparql.query.SelectQuery;
import org.apache.clerezza.rdf.ontologies.RDF;
import org.apache.clerezza.rdf.ontologies.RDFS;
import org.apache.clerezza.rdf.utils.GraphNode;
import org.apache.felix.scr.annotations.Activate;
import org.apache.felix.scr.annotations.Component;
import org.apache.felix.scr.annotations.Deactivate;
import org.apache.felix.scr.annotations.Property;
import org.apache.felix.scr.annotations.Reference;
import org.apache.felix.scr.annotations.Service;
import org.apache.stanbol.commons.indexedgraph.IndexedMGraph;
import org.apache.stanbol.commons.web.viewable.RdfViewable;
import org.apache.stanbol.enhancer.servicesapi.ChainManager;
import org.apache.stanbol.enhancer.servicesapi.ContentItemFactory;
import org.apache.stanbol.enhancer.servicesapi.EnhancementJobManager;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.osgi.service.component.ComponentContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Upload file for which the enhancements are to be computed
 */
@Component
@Service(Object.class)
@Property(name="javax.ws.rs", boolValue=true)
@Path("firstswim")
public class GUIProvider {
    
    /**
     * Using slf4j for logging
     */
    private static final Logger log = LoggerFactory.getLogger(GUIProvider.class);
        
    @Reference
    private ContentItemFactory contentItemFactory;
    
    @Reference
    private EnhancementJobManager enhancementJobManager;
    
    @Reference
    private ChainManager chainManager;
    
    @Reference
    private TcManager tcManager;
    
    private UriRef ANNOTATION_GRAPH_NAME = new UriRef("urn:x-localinstance:/fusepool/annotation.graph");
    
    @Activate
    protected void activate(ComponentContext context) {
        log.info("The firstswim file provider service is being activated");
    }
    
    @Deactivate
    protected void deactivate(ComponentContext context) {
        log.info("The firstswim file provider is being deactivated");
    }
    
    /**
     * This method return an RdfViewable, this is an RDF serviceUri with associated
     * presentational information.
     */
    @GET
    public RdfViewable serviceEntry(@Context final UriInfo uriInfo, 
            @HeaderParam("user-agent") String userAgent) throws Exception {
        final String resourcePath = uriInfo.getAbsolutePath().toString();
        //The URI at which this service was accessed accessed, this will be the 
        //central serviceUri in the response
        final UriRef serviceUri = new UriRef(resourcePath);
        //the in memory graph to which the triples for the response are added
        final MGraph responseGraph = new IndexedMGraph();
        //This GraphNode represents the service within our result graph
        final GraphNode node = new GraphNode(serviceUri, responseGraph);
        //The triples will be added to the first graph of the union
        //i.e. to the in-memory responseGraph
        node.addProperty(RDF.type, Ontology.GUI);
        node.addProperty(RDFS.comment, new PlainLiteralImpl("The First Swim GUI provider."));
        //What we return is the GraphNode we created with a template path
        return new RdfViewable("GUI.ftl", node, GUIProvider.class);
    }
    
    @GET
    @Path("getlabels")
    public String serviceEntry(@Context final UriInfo uriInfo,
            @QueryParam("iri") final UriRef iri) throws Exception {
        
        // json response for the client
        JSONObject response = new JSONObject();
        JSONArray existingLabels = new JSONArray();
        JSONArray predictedLabels = new JSONArray();
        
        try {
            // get TcManager instance
            tcManager = TcManager.getInstance();
            TcAccessController tca;
            
            // get the graph by its URI
            LockableMGraph graph = null;
            try {
                graph = tcManager.getMGraph(ANNOTATION_GRAPH_NAME);
//                tca = new TcAccessController(tcManager);
//                tca.setRequiredReadPermissions(ANNOTATION_GRAPH_NAME,Collections.singleton((Permission)new TcPermission(
//                    "urn:x-localinstance:/content.graph", "read"))
//                );
            } catch (NoSuchEntityException e) {
                log.error("Enhancement Graph must be existing", e);
            }
            
            // query all labels for a given URI
            String sparqlQuery =    "PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>"
                                +   "PREFIX xsd: <http://www.w3.org/2011/XMLSchema#>"
                                +   "PREFIX cnt: <http://www.w3.org/2011/content#>"
                                +   "PREFIX oa: <http://www.w3.org/ns/oa#>"
                                +   "PREFIX fpanno: <http://fusepool.eu/ontologies/annostore#>"
                                +   "SELECT ?label ?date ?status WHERE { "
                                    +   "?x1 fpanno:hasTarget <" + iri.getUnicodeString() + "> ."
                                    +   "?x1 fpanno:hasBody ?x2 ."
                                    +   "?x1 fpanno:annotatedAt ?date ."
                                        +   "OPTIONAL {?x2 fpanno:hasNewLabel ?x3} ."
                                        +   "OPTIONAL {?x2 fpanno:hasDeletedLabel ?x3} ."
                                    +   "?x3 rdf:type oa:Tag ."
                                    +   "?x3 cnt:chars ?label ."
                                    +   "?x2 ?status ?x3 ."
                                +   "}";
            
            // parse the SPARQL query
            SelectQuery selectQuery = null;
            try {
                selectQuery = (SelectQuery) QueryParser.getInstance().parse(sparqlQuery);
            } catch (ParseException e) {
                log.error("Cannot parse the SPARQL query", e);
            }

            if (graph != null) {
                Lock l = graph.getLock().readLock();
                l.lock();
                try {
                    // execute the SPARQL query
                    ResultSet resultSet = tcManager.executeSparqlQuery(selectQuery, graph);
                    // object for handling labels
                    Labels labels = new Labels();       
                    String label, date, status;
                    UriRef uri;
                    while (resultSet.hasNext()) {
                        SolutionMapping mapping = resultSet.next();
                        try {
                            Literal literal;
                            
                            // get label text
                            Resource r = mapping.get("label");
                            if (r instanceof TypedLiteral) {
                                literal = (TypedLiteral) r;
                            } else {
                                literal = (PlainLiteralImpl) r;
                            }
                            label = literal.getLexicalForm();
                            
                            // get timestamp of label
                            r = mapping.get("date");
                            if (r instanceof TypedLiteral) {
                                literal = (TypedLiteral) r;
                            } else {
                                literal = (PlainLiteralImpl) r;
                            }
                            date = literal.getLexicalForm();
                            
                            // get status of label (hasNew or hasDeleted)
                            r = mapping.get("status");
                            if (r instanceof UriRef) {
                                uri = (UriRef) r;
                                status = uri.getUnicodeString();
                            } else {
                                literal = (PlainLiteralImpl) r;
                                status = literal.getLexicalForm();
                            }
                            
                            labels.AddLabel(label, date, status);
                            
                        } catch (Exception e) {
                            log.error("Error: {}", e.getMessage());
                            System.out.println(e.getMessage());
                            continue;
                        }
                    }
                    // add existing labels to json response
                    for (String lbl : labels.GetLabels()) {
                        existingLabels.add(lbl);
                    }
                    
                    ////////////////////////////////////////
                    // TODO add predicted labels to response
                    ////////////////////////////////////////
                    
                } finally {
                    l.unlock();
                }                
            } else {
                log.error("There is no registered graph with given uri: " + ANNOTATION_GRAPH_NAME.getUnicodeString());
            }
        } catch (Exception e) {
            log.error("Error", e);
        }
        // add labels to response
        response.put("existingLabels", existingLabels);
        response.put("predictedLabels", predictedLabels);
        return response.toString();
    }
}
