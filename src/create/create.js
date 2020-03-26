
import { Template } from "./Template.model";
import { render } from "../render/render";
import { apps } from "./apps";
import { createData } from "../common/create-data";
import { dillModule } from "../module/Module.model";

export var create = function(Data,element,dillElementTemplate){
    element.children.length === 0
        ? element.appendChild(dillElementTemplate)
        : element.insertBefore(dillElementTemplate,element.children[0]);

    var data = createData(new Data());
    data._module = dillModule;
    var template = new Template(dillModule,data,element);
    apps.push(template);
    data.onprerender && data.onprerender();
    render(template,0);
    data.oninit && data.oninit();
    return data;
}
