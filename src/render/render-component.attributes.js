
import { renderIf } from "./render-if";
import { renderFor } from "./render-for";

export const renderComponentAttributes = template => {
    if (template.if) {
        const result = renderIf(template);
        if (!result) {
            return false;
        }
    }
    if (template.for) {
        renderFor(template);
        return false;
    }
    return true;
}
