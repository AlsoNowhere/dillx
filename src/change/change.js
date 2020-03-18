import { forEach } from "../common/for-each";
import { render } from "../render/render";
import { apps } from "../create/apps";

export var change = function(data){
    if (data === undefined) {
        return forEach(apps,function(x){
            render(x);
        });
    }
    else {
        render(data,
            Array.prototype.indexOf.apply(data._dillTemplate.element.parentNode.children,[data._dillTemplate.element])    
        );
    }
}
