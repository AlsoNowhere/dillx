
import { reverseForEach } from "sage";

import { resolveData } from "dill-core";

import { mapTemplateToElement } from "../template/map-template-to-element";

export const renderTemplate = template => {
    let newChildren = resolveData(template.data,template.dill_template.value);

    if (!(newChildren instanceof Array)) {
        newChildren = [newChildren];
    }

// Check that the new values provided are indeed differenet.
// This prevents re rendering when not needed and is better for performance.
    if (template.dill_template.dillXTemplate.children.length !== newChildren.length
        || !newChildren.reduce((a,b,i)=>{
            if (!a) {
                return false;
            }
            if (b!==template.dill_template.dillXTemplate.children[i]) {
                return false;
            }
            return true;
        }
        ,true)
    ) {

// The template contains the child templates that are going to be rendered after this function.
// Here we preserve the Object (Array) where these child templates are stored and just change the values.
// This prevents reference conflicts.
// DO NOT DO THIS: template.dill_template.dillXTemplate.children = newChildren;
        template.dill_template.dillXTemplate.children.length = 0;
        newChildren.forEach(x=>{
            template.dill_template.dillXTemplate.children.push(x);
        });

        reverseForEach(template.element.childNodes,x=>template.element.removeChild(x));

        template.childTemplates.length = 0;
        template.dill_template.dillXTemplate.children
            && [...template.dill_template.dillXTemplate.children]
            .reverse()
            .map(x=>mapTemplateToElement(template,template.element,template.data,x))
            .forEach(each => {
                template.childTemplates.push(each);
            });
    }
}
