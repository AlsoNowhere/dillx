
import { forEach } from "sage";

export const fireEvents = (template,name) => {
    if (template.if && !template.if.initialValue) {
        return;
    }

    // template.component instanceof Function
    //     && template.data.hasOwnProperty(name)
    //     && console.log("Doth run dough: ", template);

    template.component instanceof Function && template.data.hasOwnProperty(name) && template.data[name]();
    template.childTemplates && forEach(template.childTemplates,childTemplate => fireEvents(childTemplate,name));
}
