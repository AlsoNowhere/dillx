
import { reverseForEach } from "sage";

import { resolveData } from "dill-core";
import { appendTemplate } from "../create/append-template";

export const renderTemplate = template => {
    const newChildren = resolveData(template.data,template.template.value);

    // console.log("PreNew: ", template.element, template.template.template.children, newChildren);

    if (
        newChildren instanceof Array
        && (template.template.template.children.length !== newChildren.length
        || !newChildren.reduce((a,b,i)=>{

            // console.log("Monitor 1: ", a, b, template.template.template.children[i], b === template.template.template.children[i]);

            if (!a) {
                return false;
            }
            if (b!==template.template.template.children[i]) {
                return false;
            }
            return true;

            // return !a?a:b!==template.template.template.children[i]?false:true;
        }
        ,true))
    ) {
        // console.log("It was different!");

        template.template.template.children.length = 0;
        newChildren.forEach(x=>{
            template.template.template.children.push(x);
        });

        reverseForEach(template.element.childNodes,x=>template.element.removeChild(x));

        template.childTemplates = template.template.template.children
            ? [...template.template.template.children].reverse().map(x=>appendTemplate(template,template.element,template.data,x))
            : null;
    }
}
