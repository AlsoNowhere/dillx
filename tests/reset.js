
import dillx from "../dist/dillx";

import { reverseForEach } from "sage";

export const reset = () => {
    dillx.reset();
    reverseForEach(document.body.childNodes,child=>document.body.removeChild(child));
}
