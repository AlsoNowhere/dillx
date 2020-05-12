
import { forEach } from "sage";

import { apps } from "dill-core";

import { render } from "./render";

export const change = template => {
    if (template) {
        render(template);
    }
    else {
        forEach(apps,appTemplate=>{
            appTemplate instanceof Array
                ? forEach(appTemplate,childTemplate => render(childTemplate))
                : render(appTemplate);
        });
    }
}
