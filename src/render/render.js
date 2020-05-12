
import { forEach } from "sage";

import { deBracer } from "dill-core";

import { renderAttributes } from "./render-attributes";
import { renderComponentAttributes } from "./render-component.attributes";

export const render = template => {

    const {element,text,data,component,childTemplates} = template;
    
    // console.log("Render: ", template);

    if (text) {
        const previousValue = element.nodeValue;
        const newValue = deBracer(text,data);
        if (previousValue !== newValue) {
            element.nodeValue = newValue;
        }
        return;
    }

    let continueRendering = true;

    if (element) {
        continueRendering = renderAttributes(template);
    }
    else if (component) {
        continueRendering = renderComponentAttributes(template);
        template.data.hasOwnProperty("onchange") && template.data.onchange();
    }

    if (!continueRendering) {
        return;
    }

    childTemplates && forEach(childTemplates,render);
}
