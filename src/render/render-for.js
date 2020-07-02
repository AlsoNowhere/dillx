
import { forEach } from "sage";

import { resolveData, Template, createData } from "dill-core";

import { mapTemplateToElement } from "../template/map-template-to-element";

import { templateAttributes } from "../template/template-attributes";

import { findNextElement } from "../services/find-next-element.service";
import { fireEvents } from "../services/fire-events.service";

const DillFor = function(
    item,
    index
){
    this._item = item;
    this._index = index;
}

// This function allows an object on a list used in a dill-for to be retained instead of creating an Object similar to it with the actual object being destroyed.
// In own words the reference is retained.
const cleanData = function(
    parentTemplate,
    list,
    data,
    forIndex
){
    const listItem = list[forIndex];

    if (listItem instanceof Object) {
        for (let key in data) {
            if (!listItem.hasOwnProperty(key)) {
                delete data[key];
            }
        }
        for (let key in listItem) {
            if (data.hasOwnProperty(key)) {
                data[key] = listItem[key];
            }
            else {
                Object.defineProperty(data,key,{
                    value: listItem[key],
                    writable: true
                });
            }
        }
    }

    data._item = listItem;
    data._index = forIndex;
    data._parent = parentTemplate.data;

    return data;
};

// When a Component is removed from the DOM it is itself not on the DOM so we use this function to go through, using the rootElement the Component has a reference to and remove the Elements from their actualy DOM parent Elements.
// This is a recursive function.
// This function is similar to that defined in renderIf but is not the same.
const removeComponentElements = (
    template,
    childTemplates
) => {
    forEach(childTemplates,childTemplate=>{
        if (childTemplate.element && (!childTemplate.for || childTemplate.for.initialValue)) {
            template.for.rootElement.removeChild(childTemplate.element);
        }
        else if (childTemplate.component) {
            removeComponentElements(template,childTemplate.childTemplates);
        }
    });
}

export const renderFor = (template, render) => {

    const list = resolveData(template.data,template.for.value);
    const initialLength = template.for.initialLength;

// Only clean the data on the values that are going to be on the new list.
// If the old list was 3 long and the new list is 4 long clean the first 3.
// If the old list was 3 long and the new list is 2 long clean the first 2.
    forEach(template.for.templates.slice(0,list.length<initialLength?list.length:initialLength),(forTemplate,index)=>{
        cleanData(template,list,forTemplate.data,index);
    });

// If the new list is shorter than the old list then just remove the redundant Elements or Components.
    if (list.length < initialLength) {
        forEach(template.for.templates.slice(list.length),forTemplate=>{
            if (template.element) {
                template.for.rootElement.removeChild(forTemplate.element);
            }
            else if (template.Component) {
                removeComponentElements(template,forTemplate.childTemplates);
            }
        });
        template.for.templates.length = list.length;
    }

// If the new list if longer than the old list we need to clone more Elements or Components and add them here.
    else if (list.length > initialLength) {

        const insertIndex = findNextElement(template.rootTemplate,template);

        forEach(Array(list.length - initialLength).fill(null),(_,index)=>{
            if (template.element) {

                const clone = template.for.clone.cloneNode(true);

    // If the the last Element on the list is the last Element on the parent Element then append, otherwise insert the new clone Element after the last Element on the list.
                insertIndex === null
                    ? template.for.rootElement.appendChild(clone)
                    : template.for.rootElement.insertBefore(clone,insertIndex);

                const newData = createData(new DillFor(list[index+initialLength],index+initialLength),template.data);

    // Clean data also acts to add the correct properties to the newData and make it appropriate to be in a for loop.
    // Like adding the index value.
                cleanData(template,list,newData,index+initialLength);

                const newTemplate = new Template(
                    template,
                    clone,
                    newData
                );

    // Render the attributes and child templates.
                newTemplate.attributes = templateAttributes(template.for.template,clone,newTemplate.data);
                newTemplate.childTemplates = template.for.template.children
                    ? [...template.for.template.children].reverse().map(x=>mapTemplateToElement(newTemplate,clone,newTemplate.data,x))
                    : null;

                template.for.templates.push(newTemplate);
            }
            else if (template.Component) {

                const componentData = createData(new template.Component(),template.data);
                const newData = createData(new DillFor(list[index+initialLength],index+initialLength),componentData);

                cleanData(template,list,newData,index+initialLength);

                const newTemplate = new Template(
                    template.rootTemplate,
                    template.Component,
                    newData
                );

                fireEvents(newTemplate,"oninit");
                fireEvents(newTemplate,"oninserted");

                const div = document.createElement("DIV");

                newTemplate.childTemplates = [...template.Component.component.template]
                    .reverse().map(x=>mapTemplateToElement(template.rootTemplate,[div,template.for.rootElement],newData,x));

                forEach([...div.childNodes],element=>{
                    insertIndex === null
                        ? template.for.rootElement.appendChild(element)
                        : template.for.rootElement.insertBefore(element,insertIndex);
                });

                template.for.templates.push(newTemplate);
            }
        });
    }

    template.for.initialLength = list.length;
    forEach(template.for.templates,render);
}
