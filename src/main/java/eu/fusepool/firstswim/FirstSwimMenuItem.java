package eu.fusepool.firstswim;

import org.apache.felix.scr.annotations.Component;
import org.apache.felix.scr.annotations.Service;
import org.apache.stanbol.commons.web.base.NavigationLink;

@Component
@Service(NavigationLink.class)
public class FirstSwimMenuItem extends NavigationLink {
    
    public FirstSwimMenuItem() {
        super("firstswim", 
                "/firstswim", 
                "The Fusepool FirstSwim GUI provider.", 300);
    }
    
}
