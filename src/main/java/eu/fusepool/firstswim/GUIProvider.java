package eu.fusepool.firstswim;

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
import com.xerox.services.HubEngine;
import java.security.AccessController;
import java.security.PrivilegedAction;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import javax.ws.rs.FormParam;
import javax.ws.rs.POST;
import javax.ws.rs.core.Response;
import org.apache.stanbol.commons.security.auth.AuthenticationService;
import org.apache.stanbol.commons.security.auth.NoSuchAgent;

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
    
    private LockableMGraph graph;
    
    // threshold for weight of predicted labels
    private final double THRESHOLD = 0.0;
    
    // limit the number of prediced labels returned
    private final int LABEL_LIMIT = 10;
    
    @Reference
    private HubEngine predictionHub;
    
    private UriRef ANNOTATION_GRAPH_NAME = new UriRef("urn:x-localinstance:/fusepool/annotation.graph");
    
    @Reference
    private AuthenticationService authenticationService;
    
    @Activate
    protected void activate(ComponentContext context) {
        log.info("The firstswim file provider service is being activated");
        
        tcManager = TcManager.getInstance();
//        TcAccessController tca;
        
        try {
            graph = tcManager.getMGraph(ANNOTATION_GRAPH_NAME);
//            tca = new TcAccessController(tcManager);
//            tca.setRequiredReadPermissions(ANNOTATION_GRAPH_NAME, Collections.singleton((Permission) new TcPermission(
//                    "urn:x-localinstance:/fusepool/content.graph", "read")));
        } catch (Exception e) {
            System.out.println("Exception: " + e.getMessage());
            log.error("Error", e);
        }
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
            @QueryParam("iri") final UriRef iri,
            @QueryParam("usePrediction") final String usePrediction ) throws Exception {
        
        // json response for the client
        JSONObject response = new JSONObject();
        JSONArray existingLabels = new JSONArray();
        JSONArray predictedLabels = new JSONArray();
        
        try {            
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
                    for (String lbl : labels.GetNewLabels()) {
                        existingLabels.add(lbl);
                    }
                    
                    // get all user defined labels
                    List<String> allUserLabels = labels.GetAllLabels();
            
                    // add the document URI to a hashmap 
                    HashMap<String,String> params = new HashMap<String, String>();
                    params.put("docURI", iri.getUnicodeString());
                    
                    String predictedLabel;
                    double predictedScore;
                    List<Label> lbls;
                    String predictionResut;
                    
                    // get predicted labels
                    if(usePrediction.equals("true")) {
                        predictionResut = predictionHub.predict("LUP34",params);       
                    }
                    else {
                        predictionResut = "";
                    }
                    System.out.println("predictionResut: " + predictionResut);  
                    if(predictionResut != null){
                        // if the prediction string is an error do not do anything
                        if(!predictionResut.equals("__error__")){
                            lbls = new ArrayList<Label>();
                            // splitting ## separated prediction result string
                            for (String lbl : predictionResut.split("##")) {
                                // get the first part of each string which contains the label (for now we do not need the confidence score which is the second part)
                                String[] lblsrt = lbl.split("__");
                                predictedLabel = lblsrt[0];
                                predictedScore = 0.0;
                                // try parsing the score value, otherwise it is set to 0.0
                                try{
                                    predictedScore = Double.parseDouble(lblsrt[1]);
                                }catch(NumberFormatException e){
                                    log.warn("Warning: {}", e.getMessage());
                                }
                                // only use label if the confidence score is larger than a predefined threshold
                                if(predictedScore > THRESHOLD){
                                    lbls.add(new Label(predictedLabel, predictedScore));
                                }
                            }
                            
                            // sort labels by score
                            Collections.sort(lbls);
                            
                            int counter = 0;
                            
                            // splitting ## separated prediction result string and adding them to json response
                            for (Label lbl : lbls) {
                                if(counter >= LABEL_LIMIT){
                                    break;
                                }
                                
                                // only use predicted label if there is no matching user defined label (deleted or new)
                                if(!allUserLabels.contains(lbl.getLabel())){
                                    System.out.println(lbl.toString());
                                    predictedLabels.add(lbl.getLabel());
                                    counter++;
                                }
                            }
                        }
                    }
                } finally {
                    l.unlock();
                }                
            } else {
                log.error("There is no registered graph with given uri: " + ANNOTATION_GRAPH_NAME.getUnicodeString());
            }
        } catch (Exception e) {
            System.out.println("Exception: " + e.getMessage());
            log.error("Error", e);
        }
        // add labels to response
        response.put("existingLabels", existingLabels);
        response.put("predictedLabels", predictedLabels);
        return response.toString();
    }
    
    @POST
    @Path("authUser")
    public Response loginUser(@FormParam("userName") final String userName,
            @FormParam("password") final String password) {
        return AccessController.doPrivileged(new PrivilegedAction<Response>() {
            public Response run() {
                Boolean success;
                try {
                    success = authenticationService.authenticateUser(userName, password);
                } catch (NoSuchAgent ex) {
                    success = false;
                    log.error("Authentication error, " + ex.getMessage());
                }
                if(success){
                    return Response.status(Response.Status.OK).entity("OK").build();
                }
                else{
                    return Response.status(Response.Status.BAD_REQUEST).entity("Invalid Username Or Password").build();
                }
            }
        }); 
    }
    
    @GET
    @Path("entitysearch")
    public String serviceEntry(@Context final UriInfo uriInfo,
            @QueryParam("items") final int items,
            @QueryParam("maxFacets") final int maxFacets,
            @QueryParam("offset") final int offset,
            @QueryParam("search") final String search
            ) throws Exception {
        
        // json response for the client
        String predictionResut = null;
        
        try {                    
            // add the search string to a hashmap 
            HashMap<String, String> params = new HashMap<String, String>();
            params.put("search", search);
            params.put("offset", Integer.toString(offset));
            params.put("maxFacets", Integer.toString(maxFacets));
            params.put("items", Integer.toString(items));
            
            // get prediction
            predictionResut = predictionHub.predict("LUP45", params);
            
            if (predictionResut == null) {
                log.error("Error: {}", "LUP45 return null");
                return CreateEmptyResult(search, offset, maxFacets, items);
            }
            else{
                if(predictionResut.equals("__error__")){
                    log.error("Error: {}", "LUP45 returned error string");
                    return CreateEmptyResult(search, offset, maxFacets, items);
                }
            }
                              
        } catch (Exception e) {
            System.out.println("Exception: " + e.getMessage());
            log.error("Error", e);
            return CreateEmptyResult(search, offset, maxFacets, items);
        }

        return predictionResut;
    }
    
    @GET
    @Path("entitydetails")
    public String serviceEntry4(@Context final UriInfo uriInfo,
            @QueryParam("entityURI") final String entityURI
            ) throws Exception {
        
        // json response for the client
        String predictionResult = null;
        
        try {                    
            // add the URI to a hashmap 
            HashMap<String, String> params = new HashMap<String, String>();
            params.put("entityURI", entityURI);
            
            // get prediction
            predictionResult = predictionHub.predict("LUP45", params);
            
            if (predictionResult == null) {
                log.error("Error: {}", "LUP45 return null");
                return "";
            }
            else{
                if(predictionResult.equals("__error__")){
                    log.error("Error: {}", "LUP45 returned error string");
                    return "";
                }
            }
                              
        } catch (Exception e) {
            System.out.println("Exception: " + e.getMessage());
            log.error("Error", e);
            return "";
        }

        return predictionResult;
    }
    @GET
    @Path("getpredicates")
    public String serviceEntry3(@Context final UriInfo uriInfo,
            @QueryParam("user") final String user,
            @QueryParam("document") final String document,
            @QueryParam("query") final String query
            ) throws Exception {
        
        JSONObject response = new JSONObject();
        JSONArray array = new JSONArray();
        // json response for the client
        String predictionResult = null;
        
        try {                    
            // add the properties to a hashmap 
            HashMap<String, String> params = new HashMap<String, String>();
            params.put("user", user);
            params.put("document", document);
            params.put("query", query);
            
            // get prediction
            predictionResult = predictionHub.predict("LUP55", params);
            
            String predictedLabel;
            double predictedScore;
            List<Label> lbls;
            
            if (predictionResult == null) {
                log.error("Error: {}", "LUP55 return null");
                return "";
            }
            else{
                if(predictionResult.equals("__error__")){
                    log.error("Error: {}", "LUP55 returned error string");
                    return "";
                }
                else{
                    lbls = new ArrayList<Label>();
                    for (String lbl : predictionResult.split("##")) {
                        String[] lblsrt = lbl.split("__");
                        predictedLabel = lblsrt[0];
                        predictedScore = 0.0;
                        // try parsing the score value, otherwise it is set to 0.0
                        try {
                            predictedScore = Double.parseDouble(lblsrt[1]);
                        } catch (NumberFormatException e) {
                            log.warn("Warning: {}", e.getMessage());
                        }
                        lbls.add(new Label(predictedLabel, predictedScore));
                       
                    }
                    
                    int counter = 0;
                    
                    
                    JSONObject object;
                    // splitting ## separated prediction result string and adding them to json response
                    for (Label lbl : lbls) {
                        if(lbl.getScore() > 0.2){
                            object = new JSONObject();
                            object.put("text", lbl.getLabel());
                            object.put("accepted", "true");
                            array.add(object);
                            
                        }
                        else{
                            object = new JSONObject();
                            object.put("text", lbl.getLabel());
                            object.put("accepted", "false");
                            array.add(object);
                        }
                    }
                }
            }
                              
        } catch (Exception e) {
            System.out.println("Exception: " + e.getMessage());
            log.error("Error", e);
            return "";
        } 
        return array.toString();
    }
    
    private String CreateEmptyResult(String search, int offset, int maxFacets, int items){
        String emptyResult = "";
        
        emptyResult += "<http://platform.fusepool.info/ecs/?search=" + search + "&offset=" + Integer.toString(offset) + "&maxFacets=" + Integer.toString(maxFacets) + "&items=" + Integer.toString(items) + ">";
        emptyResult += "a       <http://fusepool.eu/ontologies/ecs#ContentStoreView> ;";
        emptyResult += "<http://www.w3.org/2000/01/rdf-schema#comment>";
        emptyResult += "        \"An enhanced content store\" ;";
        emptyResult += "<http://fusepool.eu/ontologies/ecs#contentsCount>";
        emptyResult += "        \"0\"^^<http://www.w3.org/2001/XMLSchema#int> ;";
        emptyResult += "<http://fusepool.eu/ontologies/ecs#search>";
        emptyResult += "        \"" + search + "\"^^<http://www.w3.org/2001/XMLSchema#string> ;";
        emptyResult += "<http://fusepool.eu/ontologies/ecs#store>";
        emptyResult += "        <http://platform.fusepool.info/ecs/> .";
        
        return emptyResult;
    }
    
    @GET
    @Path("getuserlabels")
    public String serviceEntry2(@Context final UriInfo uriInfo,
            @QueryParam("user") final String user) throws Exception {
        
        // json response for the client
        JSONObject response = new JSONObject();
        JSONArray userLabels = new JSONArray();
        System.out.println(user);
        try {            
            // query all labels for a given URI
            String sparqlQuery =    "PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>"
                                +   "PREFIX xsd: <http://www.w3.org/2011/XMLSchema#>"
                                +   "PREFIX cnt: <http://www.w3.org/2011/content#>"
                                +   "PREFIX oa: <http://www.w3.org/ns/oa#>"
                                +   "PREFIX fpanno: <http://fusepool.eu/ontologies/annostore#>"
                                +   "SELECT ?label ?date ?status WHERE { "
                                    +   "?x1 fpanno:annotatedBy <http://fusepool.info/users/" + user + "> ."
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
                    System.out.println(labels.GetAllLabels().toString());
                    List<String> lblList = new ArrayList<String>();
                    for (String lbl : labels.GetAllLabels()) {
                        lblList.add(lbl);
                    }
                    
                    String[] lblArray = lblList.toArray(new String[lblList.size()]);
                    
                    Arrays.sort(lblArray);
                    
                    // add existing labels to json response
                    for (String lbl : lblArray) {
                        userLabels.add(lbl);
                    }
                    
                } finally {
                    l.unlock();
                }                
            } else {
                log.error("There is no registered graph with given uri: " + ANNOTATION_GRAPH_NAME.getUnicodeString());
            }
        } catch (Exception e) {
            System.out.println("Exception: " + e.getMessage());
            log.error("Error", e);
        }
        // add labels to response
        response.put("userLabels", userLabels);
        return response.toString();
    }
    
}
