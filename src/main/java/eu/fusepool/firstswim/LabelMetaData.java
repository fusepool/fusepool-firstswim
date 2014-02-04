package eu.fusepool.firstswim;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;
import org.slf4j.LoggerFactory;

/**
 * Manage label metadata.
 * @author Gabor
 */
public class LabelMetaData implements Comparable<LabelMetaData>{
    private final String hasNewLabel = "http://fusepool.eu/ontologies/annostore#hasNewLabel";
    private final String hasDeletedLabel = "http://fusepool.eu/ontologies/annostore#hasDeletedLabel";
    private final SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss");
    
    /**
     * Using slf4j for logging
     */
    private static final org.slf4j.Logger log = LoggerFactory.getLogger(GUIProvider.class);
    
    private String label;
    private Date date;
    private boolean deleted;
    
    public LabelMetaData(String label, String stringDate, String status){
        this.label = label;
        // parse string date to java object
        try {
            date = dateFormat.parse(stringDate);
        } catch (ParseException ex) {
            log.error("Cannot parse date: {}", ex.getMessage());
        }
        // parse status
        if(hasNewLabel.equals(status)){
            deleted = false;
        }
        else if(hasDeletedLabel.equals(status)){
            deleted = true;
        }
        else{
            deleted = true;
            log.warn("Cannot parse status: {}", status);
        }
    }
    
    public String GetLabel(){
        return label;
    }
    
    public boolean IsDeleted(){
        return deleted;
    }
    
    @Override
    public int compareTo(LabelMetaData o) {
        return (date.before(o.date) ? 1 : date.equals(o.date) ? 0 : -1);
    }

    @Override
    public String toString() {
        return "LabelMetaData{" + "label=" + label + ", date=" + date + ", deleted=" + deleted + '}';
    }
    
    
}
