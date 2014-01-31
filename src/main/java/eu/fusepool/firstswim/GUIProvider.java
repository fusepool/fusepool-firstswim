package eu.fusepool.firstswim;

import java.util.concurrent.locks.Lock;
import javax.ws.rs.GET;
import javax.ws.rs.HeaderParam;
import javax.ws.rs.Path;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.UriInfo;
import org.apache.clerezza.rdf.core.MGraph;
import org.apache.clerezza.rdf.core.Resource;
import org.apache.clerezza.rdf.core.TypedLiteral;
import org.apache.clerezza.rdf.core.UriRef;
import org.apache.clerezza.rdf.core.access.LockableMGraph;
import org.apache.clerezza.rdf.core.access.NoSuchEntityException;
import org.apache.clerezza.rdf.core.access.TcManager;
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
        JSONArray labels = new JSONArray();
        try {
            //Get TcManager
            tcManager = TcManager.getInstance();

            //Get the graph by its URI
            LockableMGraph graph = null;
            try {
                graph = tcManager.getMGraph(ANNOTATION_GRAPH_NAME);
            } catch (NoSuchEntityException e) {
                log.error("Enhancement Graph must be existing", e);
            }
            
            String sparqlQuery =    "PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>"
                                +   "PREFIX xsd: <http://www.w3.org/2011/XMLSchema#>"
                                +   "PREFIX cnt: <http://www.w3.org/2011/content#>"
                                +   "PREFIX oa: <http://www.w3.org/ns/oa#>"
                                +   "PREFIX fpanno: <http://fusepool.eu/ontologies/annostore#>"
                                +   "SELECT ?label ?x1 WHERE { "
                                +   "?x1 fpanno:hasTarget <" + iri.getUnicodeString() + "> ."
                                +   "?x1 fpanno:hasBody ?x2 ."
                                +   "?x2 fpanno:hasNewLabel ?x3 ."
                                +   "?x3 rdf:type oa:Tag ."
                                +   "?x3 cnt:chars ?label ."
                                +   "}";
            
            //Parse the SPARQL query
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

                    //Execute the SPARQL query
                    ResultSet resultSet = tcManager.executeSparqlQuery(selectQuery, graph);

                    while (resultSet.hasNext()) {
                        SolutionMapping mapping = resultSet.next();
                        try {
                            Resource r = mapping.get("label");
                            if (r instanceof TypedLiteral) {
                                TypedLiteral label = (TypedLiteral) r;
                                labels.add(label.getLexicalForm());
                            } else {
                                PlainLiteralImpl label = (PlainLiteralImpl) r;
                                labels.add(label.getLexicalForm());
                            }
                        } catch (Exception e) {
                            System.out.println(e.getMessage());
                            break;
                        }
                    }
                } finally {
                    l.unlock();
                }
            } else {
                log.error("There is no registered graph with given uri: " + ANNOTATION_GRAPH_NAME.getUnicodeString());
            }
        } catch (Exception e) {
            log.error("Error", e);
        }
        
        JSONObject json = new JSONObject();
        json.put("labels", labels);
        
        return json.toString();
    }
}
