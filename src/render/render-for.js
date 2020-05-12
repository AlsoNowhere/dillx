
import { forEach } from "sage";

import { resolveData, Template, createData } from "dill-core";

import { findNextElement } from "../services/find-next-element.service";
import { templateAttributes } from "../template/template-attributes";
import { appendTemplate } from "../create/append-template";
import { render } from "./render";
import { fireEvents } from "../services/fire-events.service";

const DillFor = function(
    item,
    index
){
    this._item = item;
    this._index = index;
}

const cleanData = function(
    parentTemplate,
    list,
    data,
    forIndex
){
    var key;
    var listItem = list[forIndex];
    if (listItem instanceof Object) {
        for (key in data) {
            if (!listItem.hasOwnProperty(key)) {
                delete data[key];
            }
        }
        for (key in listItem) {
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

const removeComponentElements = (template,childTemplates) => {
    forEach(childTemplates,childTemplate=>{
        if (childTemplate.element && (!childTemplate.for || childTemplate.for.initialValue)) {
            template.for.rootElement.removeChild(childTemplate.element);
        }
        else if (childTemplate.component) {
            removeComponentElements(template,childTemplate.childTemplates);
        }
    });
}

export const renderFor = template => {
    const list = resolveData(template.data,template.for.value);
    const initialLength = template.for.initialLength;
    forEach(template.for.templates.slice(0,list.length<initialLength?list.length:initialLength),(forTemplate,index)=>{
        cleanData(template,list,forTemplate.data,index);
    });
    if (list.length < initialLength) {
        forEach(template.for.templates.slice(list.length),forTemplate=>{
            if (template.element) {
                template.for.rootElement.removeChild(forTemplate.element);
            }
            else if (template.component) {
                removeComponentElements(template,forTemplate.childTemplates);
            }
        });
        template.for.templates.length = list.length;
    }
    else if (list.length > initialLength) {
        const insertIndex = findNextElement(template.rootTemplate,template);
        forEach(Array(list.length - initialLength).fill(null),(_,index)=>{
            if (template.element) {
                const clone = template.for.clone.cloneNode(true);

                insertIndex === null
                    ? template.for.rootElement.appendChild(clone)
                    : template.for.rootElement.insertBefore(clone,insertIndex);

                const newData = createData(new DillFor(list[index+initialLength],index+initialLength),template.data);
                cleanData(template,list,newData,index+initialLength);
                const newTemplate = new Template(
                    template,
                    clone,
                    newData
                );
                newTemplate.attributes = templateAttributes(template.for.template,clone,newTemplate.data);
                newTemplate.childTemplates = template.for.template.children
                    ? [...template.for.template.children].reverse().map(x=>appendTemplate(newTemplate,clone,newTemplate.data,x))
                    : null;
                template.for.templates.push(newTemplate);
            }
            else if (template.component) {
                const componentData = createData(new template.component(),template.data);
                const newData = createData(new DillFor(list[index+initialLength],index+initialLength),componentData);
                cleanData(template,list,newData,index+initialLength);
                const newTemplate = new Template(
                    template.rootTemplate,
                    template.component,
                    newData
                );
                fireEvents(newTemplate,"oninit");
                fireEvents(newTemplate,"oninserted");
                const div = document.createElement("DIV");
                newTemplate.childTemplates = [...template.component.component.template]
                    .reverse().map(x=>appendTemplate(template.rootTemplate,[div,template.for.rootElement],newData,x));
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
