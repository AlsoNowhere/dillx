
import { renderIf } from "./render-if";

import { renderFor } from "./render-for";

export const renderComponentAttributes = (template, render) => {

    if (template.if) {
        const result = renderIf(template, render);
        if (!result) {
            return false;
        }
    }

    if (template.for) {
        renderFor(template, render);
        return false;
    }

    return true;
}
