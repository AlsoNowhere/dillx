
import { forEach } from "sage";
import { deBracer } from "dill-core";

export const templateAttributes = (template,element,data) => {
    const attributes = forEach(template.attributes||[],attribute=>{
        const name = attribute.name;
        const value = attribute.value;
        if (name.substr(name.length-3) === "---") {
            data[name.substring(0,name.length-3)] = element;
            return 0;
        }
        if (name.substr(name.length-2) === "--") {
            element.addEventListener(name.substring(0,name.length-2),event=>{
                const result = data[value](event,element);
                if (result !== false) {
                    dillx.change();
                }
            });
            return 0;
        }
        if (name.charAt(name.length-1) === "-") {
            return attribute;
        }
        if (name.substr(0,5) !== "dill-") {
            element.setAttribute(name,deBracer(value,data));
        }
        return attribute;
    });
    return attributes;
}
