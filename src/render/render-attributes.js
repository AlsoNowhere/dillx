
import { forEach } from "sage";

import { resolveData, deBracer } from "dill-core";

import { renderIf } from "./render-if";

import { renderFor } from "./render-for";

import { renderTemplate } from "./render-template";

const properties = ["value","checked"];

export const renderAttributes = (template, render) => {

    const { element, data } = template;

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

    if (template.dill_template) {
        renderTemplate(template);
    }

    template.attributes && forEach(template.attributes,attribute=>{

        const name = Object.keys(attribute)[0];
        const value = Object.values(attribute)[0];

        if (name.charAt(name.length-1) === "-") {
            const attrName = name.substring(0,name.length-1);

    // Only define the value of the Element attribute if the value is different.
    // This is a way of performing more performant diffing without needing a virtual DOM.
            const previousValue = properties.includes(attrName)
                ? element[attrName]
                : [...element.attributes]
                    .filter(x=>x.nodeName===name.substring(0,name.length-1))
                    .nodeValue;
            const newValue = resolveData(data,value);

            if (previousValue !== newValue) {
    // If the value is false or undefined don't add the attribute at all or remove it.
    // This is because certain Elements such as <input /> are affected by the presence of the attribute regradless of that attribute's value.
    // e.g disabled/required.
                if (newValue === false || newValue === undefined) {
                    element.removeAttribute(attrName)
                }
                else if (attrName.substr(0,5) !== "dill-") {
    // Certain attributes of Elements are actually properties on the Node not the Element. This means that defining the attribute will not affec the Element is the way anticipated.
    // These properties are changed on the Element instead of being seeing as attributes so the original intent is retained.
    // e.g checked on <input type="checkbox" /> Elements.
                    properties.includes(attrName)
                        ? element[attrName] = newValue
                        : element.setAttribute(attrName,newValue);
                }
            }
            return;
        }

    // Only define the value of the Element attribute if the value is different.
    // This is a way of performing more performant diffing without needing a virtual DOM.
        const previousValue = [...element.attributes].filter(x=>x.nodeName===name);
        const newValue = deBracer(value,data);
        
        if (name.substr(0,5) !== "dill-") {
            if (previousValue === undefined || previousValue.nodeValue !== newValue) {
                element.setAttribute(name,newValue);
            }
        }
    });

    return true;
}
