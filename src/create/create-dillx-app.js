
import { reverseForEach, forEach } from "sage";

import { createData, apps } from "dill-core";

import { appendTemplate } from "./append-template";

import { render } from "../render/render";

export const createDillxApp = (
    element,
    Data,
    dillxTemplate
) => {
    const data = createData(new Data());
    
    data.hasOwnProperty("onpretemplate") && data.onpretemplate();

    dillxTemplate = dillxTemplate instanceof Array
        ? dillxTemplate
        : [dillxTemplate];

    const templates = reverseForEach(dillxTemplate,child=>{
        return appendTemplate(null,element,data,child,false);
    });

    apps.push(templates);

    // console.log("Finishing it: ", templates);

    forEach(templates,render);
}
