
import { forEach, reverseForEach } from "sage";

import { resolveData } from "dill-core";

import { appendTemplate } from "../create/append-template";
import { findNextElement } from "../services/find-next-element.service";
import { templateAttributes } from "../template/template-attributes";
import { render } from "./render";
import { fireEvents } from "../services/fire-events.service";

const removeComponentElements = (template,arr,childTemplates) => {
    forEach(childTemplates,childTemplate=>{
        if (childTemplate.element && (!childTemplate.if || childTemplate.if.initialValue)) {
            arr.push(childTemplate.element);
            template.if.rootElement.removeChild(childTemplate.element);
        }
        else if (childTemplate.component) {
            removeComponentElements(template,arr,childTemplate.childTemplates);
        }
    });
}

export const renderIf = template => {
    let newValue =  !!resolveData(template.if.parentData||template.data,template.if.value);
    if (template.if.inverted) {
        newValue = !newValue;
    }
    if (template.if.initialValue === newValue) {
        return template.if.initialValue;
    }
    else if (template.if.initialValue && !newValue) {
        const arr = [];
        template.element
            ? template.if.rootElement.removeChild(template.element)
            : removeComponentElements(template,arr,template.childTemplates);
        template.if.initialValue = false;
        if (template.component) {
            template.if.elements = arr;
        }
    }
    else if (!template.if.initialValue && newValue) {
        const insertIndex = findNextElement(template.rootTemplate,template);
        if (template.element) {
            insertIndex === null
                ? template.if.rootElement.appendChild(template.element)
                : template.if.rootElement.insertBefore(template.element,insertIndex);
        }
        template.if.initialValue = true;
        if (!template.if.templated) {
            template.if.templated = true;

            if (template.element) {
                template.attributes = templateAttributes(template.if.template,template.element,template.data);
                template.childTemplates = template.if.template.children
                    && template.if.template.children.map(x=>appendTemplate(template,template.element,template.data,x));
                render(template);
            }
            else if (template.component) {
                const div = document.createElement("DIV");
                template.childTemplates = [...template.if.template.component.component.template].reverse().map(x=>appendTemplate(template,[div,template.if.rootElement],template.data,x));
                forEach([...div.childNodes],element=>{
                    insertIndex === null
                        ? template.if.rootElement.appendChild(element)
                        : template.if.rootElement.insertBefore(element,insertIndex);
                });
                fireEvents(template,"oninit");
                fireEvents(template,"oninserted");
                forEach(template.childTemplates,render);
            }
        }
        else if (template.component) {
            reverseForEach(template.if.elements,element=>{
                insertIndex === null
                    ? template.if.rootElement.appendChild(element)
                    : template.if.rootElement.insertBefore(element,insertIndex);
            });
            fireEvents(template,"oninserted");
            forEach(template.childTemplates,render);
        }
    }

    return template.if.initialValue;
}
