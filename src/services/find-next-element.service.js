
import { forEach } from "sage";

const recurseTemplates = (childTemplates,template,obj) => {
    childTemplates instanceof Array && forEach(childTemplates,childTemplate=>{
        if (obj.element instanceof Element) {
            return;
        }
        if (
            obj.element === undefined
                && childTemplate === template
        ) {
            obj.element = null;
            return;
        }
        if (
            obj.element === null
                && childTemplate.element
                && childTemplate.element.parentNode !== null
                && document.body.contains(childTemplate.element)
            ) {
            obj.element = childTemplate.element;
            return;
        }
        recurseTemplates(childTemplate.childTemplates,template,obj);
    });
}

export const findNextElement = (rootTemplate,template) => {
    let obj = {};
    recurseTemplates(rootTemplate.childTemplates,template,obj);
    return obj.element;
}
