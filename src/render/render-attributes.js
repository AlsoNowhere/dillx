
import { forEach } from "sage";

import { resolveData, deBracer } from "dill-core";

import { renderIf } from "./render-if";
import { renderFor } from "./render-for";
import { renderTemplate } from "./render-template";

const properties = ["value","checked"];

export const renderAttributes = template => {

    const {element, data} = template;

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

    if (template.template) {
        renderTemplate(template);
    }

    template.attributes && forEach(template.attributes,attribute=>{

        const name = attribute.name;
        const value = attribute.value;

        if (name.charAt(name.length-1) === "-") {
            const attrName = name.substring(0,name.length-1);
            const previousValue = properties.includes(attrName)
                ? element[attrName]
                : [...element.attributes].filter(x=>x.nodeName===name.substring(0,name.length-1));
            const newValue = resolveData(data,value);
            if (previousValue !== newValue) {
                if (newValue === false || newValue === undefined) {
                    element.removeAttribute(attrName)
                }
                else if (attrName.substr(0,5) !== "dill-") {
                    properties.includes(attrName)
                        ? element[attrName] = newValue
                        : element.setAttribute(attrName,newValue);
                }
            }
            return attribute;
        }

        const previousValue = [...element.attributes].filter(x=>x.nodeName===name);
        const newValue = deBracer(value,data);
        
        if (previousValue === undefined || previousValue.nodeValue !== newValue) {
            if (name.substr(0,5) !== "dill-") {
                element.setAttribute(name,newValue);
            }
        }
    });

    return true;
}
