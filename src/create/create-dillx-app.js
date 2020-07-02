
import { reverseForEach, forEach, logger } from "sage";

import { createData, apps } from "dill-core";

import { mapTemplateToElement } from "../template/map-template-to-element";

import { render } from "../render/render";

import { XTemplate } from "../models/XTemplate.model";

// This method creates new apps.
export const createDillxApp = (
// Must be passed, a DOM Element
    element,
    Data,
    dillxTemplate
) => {


// Dev only
    if (!(element instanceof Element)) {
        return logger.error("Dillx",".create()","element","You must pass a DOM Element to the element argument.");
    }
// / Dev only

// Dev only
    if (!(Data instanceof Function)) {
        return logger.error("Dillx",".create()","Data","You must pass a constructor function to the Data argument.");
    }
// / Dev only


// Make sure that this property is an Array.
    dillxTemplate = dillxTemplate instanceof Array
        ? dillxTemplate
        : [dillxTemplate];

// Dev only
    if (dillxTemplate.filter(x=>x instanceof XTemplate||typeof x==="string").length < dillxTemplate.length) {
        return logger.error("Dillx",".create()","dillxTemplate",'You must pass an output of dill.template() to the dillxTemplate argument. You can do this using rollup-plugin-dillx, e.g dillx(<p class="padding">Content</p>) or literally by writing dillx.template() e.g dillx.template("p",[{"class":"padding"},["Content"]]).');
    }
// / Dev only


// Create a new Dill data object.
    const data = createData(new Data());
    
// If this data has the lifecycle hook 'onpretemplate' then run it now, at the creation of this new Dill data object.
    data.hasOwnProperty("onpretemplate") && data.onpretemplate();

// Create DillTemplates. Read more about this in the mapTemplateToElement file (./src/template/map-template-to-element.js).
    const templates = reverseForEach(dillxTemplate,child=>mapTemplateToElement(null,element,data,child,false));

// This creates the reference for a new app which is now added as a new app to the list of apps.
    apps.push(templates);

// Now that the app is created we can run the initial render automatically.
    forEach(templates,render);

// But returning the Dill data object here the dev can have access to the actual root data for this app.
// If the dev tries to use the object they passed in it would not be the same.
// This is why the Data property has to be a constructor function, to prevent the confusion that the object passed in is not the same as the one used in the app.
    return data;
}
