
import { forEach, reverseForEach } from "sage";

import { resolveData } from "dill-core";

import { mapTemplateToElement } from "../template/map-template-to-element";

import { templateAttributes } from "../template/template-attributes";

import { findNextElement } from "../services/find-next-element.service";
import { fireEvents } from "../services/fire-events.service";

// When a Component is removed from the DOM it is itself not on the DOM so we use this function to go through, using the rootElement the Component has a reference to and remove the Elements from their actualy DOM parent Elements.
// This is a recursive function.
// This function is similar to that defined in renderFor but is not the same.
const removeComponentElements = (
    template,
    arr,
    childTemplates
) => {
    forEach(childTemplates,childTemplate=>{
        if (childTemplate.element
            && (!childTemplate.if || childTemplate.if.initialValue)) {
            arr.push(childTemplate.element);
            template.if.rootElement.removeChild(childTemplate.element);
        }
        else if (childTemplate.component) {
            removeComponentElements(template,arr,childTemplate.childTemplates);
        }
    });
}

export const renderIf = (
    template,
    render
) => {

// Get the new boolean of whether the Element should be attached to the DOM or not.
    let newValue =  !!resolveData(template.if.parentData||template.data,template.if.value);
    if (template.if.inverted) {
        newValue = !newValue;
    }

// If the Element is currently attached to the DOM and the new value says it SHOULD be, then do nothing, all is well.
    if (template.if.initialValue === newValue) {
        return template.if.initialValue;
    }

// If the Element is currently attached to the DOM and the new value says it SHOULD NOT be, then remove this Element or Component.
    else if (template.if.initialValue && !newValue) {

        const arr = [];

        template.element
            ? template.if.rootElement.removeChild(template.element)
            : removeComponentElements(template,arr,template.childTemplates);

        if (template.Component) {
            template.if.elements = arr;
        }

    // This lifecycle hook allows the dev to do some house keeping when the Component is removed.
    // This event can be fired on an Element because there may be Components as child nodes of this Element being removed and they need to know they have been removed too.
        fireEvents(template,"onremove");

        template.if.initialValue = false;
    }

// If the Element is NOT currently attached to the DOM and the new value says it SHOULD be, then we need to add this Element or Component.
    else if (!template.if.initialValue && newValue) {
        
        const insertIndex = findNextElement(template.rootTemplate,template);

        if (template.element) {
            insertIndex === null
                ? template.if.rootElement.appendChild(template.element)
                : template.if.rootElement.insertBefore(template.element,insertIndex);

            if (template.if.templated) {

    // This lifecycle hook runs every time the Component is added, whether this is the first time the Component is being added or not.
                fireEvents(template,"oninserted");
            }
        }

// Update the current boolean value on the template data for the next render.
        template.if.initialValue = true;

// This part of the code checks if the Element or Component has been rendered before. If not, then run the below.
// Elements and Components that are rendered for the first time have certain code that needs to be run.
        if (!template.if.templated) {
            template.if.templated = true;

            if (template.element) {
                template.attributes = templateAttributes(template.if.template,template.element,template.data);
                template.childTemplates = template.if.template.children
                    && template.if.template.children
                    .reverse()
                        .map(x=>mapTemplateToElement(template,template.element,template.data,x,template.element.nodeName === "svg"))
                        ;   
                render(template);
            }

            else if (template.Component) {

// This Div element sucks up all the child Elements created from a Component's creation.
// These child nodes are then added to the rootElement as the Component is not actually attached to the DOM.
// The Div element is then garbage collected.
                const div = document.createElement("DIV");

                template.childTemplates = [...template.if.template.Component.component.template]
                    .reverse()
                    .map(x=>mapTemplateToElement(
                        template,
                        [div,template.if.rootElement],
                        template.data,
                        x
                    ));

                forEach([...div.childNodes],element=>{
                    insertIndex === null
                        ? template.if.rootElement.appendChild(element)
                        : template.if.rootElement.insertBefore(element,insertIndex);
                });

    // Here we run the initial events on this Component but not on their children (the false argument).
    // This is because these children have not yet been templated which means these lifecycle hooks will be run anyway.
                fireEvents(template,"oninit",false);
                fireEvents(template,"oninserted",false);

                forEach(template.childTemplates,render);
            }
        }

        else if (template.Component) {

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
