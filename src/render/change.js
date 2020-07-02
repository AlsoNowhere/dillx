
import { forEach, logger } from "sage";

import { apps, Template } from "dill-core";

import { render } from "./render";

// This function kicks off a new render.
// It accepts an argument which is a Component scope.
export const change = template => {

// Dev only
    if (template !== undefined
        && !(template instanceof Function)
        && !(template._dillTemplate instanceof Template)) {
        return logger.error("Dillx",".change()","template","You must pass either undefined or a Component scope to dillx.change. e.g dillx.change(this);");
    }
// / Dev only


    template
    
// If passed a Component scope it renders that and Components down from there.
        ? render(template._dillTemplate)

// If passed undefined the whole app gets re rendered.
        : forEach(apps,appTemplate=>{
            appTemplate instanceof Array
                ? forEach(appTemplate,childTemplate => render(childTemplate))
                : render(appTemplate);
        });
}
