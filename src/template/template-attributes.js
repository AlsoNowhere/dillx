
import { forEach } from "sage";

import { deBracer } from "dill-core";

export const templateAttributes = (
    template,
    element,
    data
) => {

    const attributes = forEach(template.attributes||[],attribute=>{

// Get the attribute name and value.
        const name = Object.keys(attribute)[0];
        const value = Object.values(attribute)[0];

// Attributes that end in three dashes get removed and the name becomes an Element reference.
// e.g <p ref---=""></p> -> <p></p>
        if (name.substr(name.length-3) === "---") {
            data[name.substring(0,name.length-3)] = element;
            return 0;
        }

// Attributes that end in two dashes get removed and the name becomes an event on the Element.
// e.g <button click--={console.log("Action")}></button> -> <button></button>
        if (name.substr(name.length-2) === "--") {
            element.addEventListener(name.substring(0,name.length-2),event=>{
                const result = data[value](event,element);
                if (result !== false) {
                    dillx.change();
                }
            });
            return 0;
        }

// Attributes that end in one dash get removed and the name becomes an actual attribute on the Element.
// e.g <p class-={"padding"}></p> -> <p class="padding"></p>
        if (name.charAt(name.length-1) === "-") {
            return attribute;
        }

// Attributes that begin with dill- are ignored because we know what they do.
        if (name.substr(0,5) !== "dill-") {
            element.setAttribute(name,deBracer(value,data));
        }

// Anything else is a fair attribute.
        return attribute;
    });

    return attributes;
}
