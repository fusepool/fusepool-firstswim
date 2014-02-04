package eu.fusepool.firstswim;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * Manage labels.
 * @author Gabor
 */
public class Labels {
    private HashMap<String,List<LabelMetaData>> labels;
    
    public Labels(){
        labels = new HashMap<String,List<LabelMetaData>>();
    }
    
    /**
     * Group labels using a HashMap.
     * @param label
     * @param date
     * @param status 
     */
    public void AddLabel(String label, String date, String status){
        List<LabelMetaData> temp = labels.get(label);
        if(temp == null){
            temp = new ArrayList<LabelMetaData>();
        }
        temp.add(new LabelMetaData(label, date, status));
        labels.put(label, temp);
    }
    
    /**
     * Get most recent labels and filter deleted labels.
     * @return 
     */
    public List<String> GetLabels(){    
        List<LabelMetaData> mostRecentLabels;
        List<LabelMetaData> temp;
        
        Set set = labels.entrySet();
        Iterator iterator = set.iterator();
        mostRecentLabels = new ArrayList<LabelMetaData>();
        
        while(iterator.hasNext()){
            Map.Entry me = (Map.Entry)iterator.next();
            temp = (List<LabelMetaData>) me.getValue();
            // sort labels by date
            Collections.sort(temp);
            // get the most recent label
            mostRecentLabels.add(temp.get(0));
        }
        // sort labels by date
        Collections.sort(mostRecentLabels);
        // reverse the ordering
        Collections.reverse(mostRecentLabels);
        // get labels that are not deleted labels
        List<String> enabledLabels = new ArrayList<String>();
        for (LabelMetaData label : mostRecentLabels) {
            if(!label.IsDeleted()){
                enabledLabels.add(label.GetLabel());
            }
        }
        return enabledLabels;
    }
}
