
import { forEach } from "sage";

export const fireEvents = (
    template,
    name,
    runOnChilds = true
) => {
    if (template.if && !template.if.initialValue) {
        return;
    }

    template.Component instanceof Function && template.data.hasOwnProperty(name) && template.data[name]();
    runOnChilds && template.childTemplates && forEach(template.childTemplates,childTemplate => fireEvents(childTemplate,name));
}
