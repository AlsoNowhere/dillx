
import { forEach, define } from "sage";

import { createData, Template, Component, resolveData } from "dill-core";

import { templateAttributes } from "../template/template-attributes";
import { fireEvents } from "../services/fire-events.service";

export const appendTemplate = (
    rootTemplate,
    elementOrArray,
    data,
    template,
    svg
) => {

    let element = elementOrArray;
    let rootElement = elementOrArray;

    if (elementOrArray instanceof Array) {
        element = elementOrArray[0];
        rootElement = elementOrArray[1];
    }

    if (typeof template === "string") {
        const child = document.createTextNode(template);
        element.childNodes.length > 0
            ? element.insertBefore(child,element.childNodes[0])
            : element.appendChild(child);
        return new Template(
            rootTemplate,
            child,
            data
        );
    }

    const options = {};

    const attributes = template.attributes.slice();

    if (template.name) {
        if (template.name === "svg") {
            svg = true;
        }

        const child = svg
            ? document.createElementNS("http://www.w3.org/2000/svg",template.name)
            : document.createElement(template.name);

        const dillIf = attributes.find(x=>x.name==="dill-if");
        if (dillIf !== undefined) {
            attributes.splice(attributes.indexOf(dillIf),1);
            const inverted = dillIf.value.charAt(0) === "!";
            let ifValue = !!resolveData(data,dillIf.value.substr(inverted?1:0));
            if (inverted) {
                ifValue = !ifValue;
            }
            if (!ifValue) {
                options.if = new function DillIf(){
                    this.rootElement = rootElement;
                    this.template = template;
                    this.initialValue = false;
                    this.templated = false;
                    this.value = dillIf.value.substr(inverted?1:0);
                    this.inverted = inverted;
                    Object.seal(this);
                };
                return new Template(
                    rootTemplate,
                    child,
                    data,
                    null,
                    null,
                    options
                );
            }
            else {
                options.if = new function DillIf(){
                    this.rootElement = rootElement;
                    this.initialValue = true;
                    this.templated = true;
                    this.value = dillIf.value.substr(inverted?1:0);
                    this.inverted = inverted;
                    Object.seal(this);
                }
            }
        }

        const dillFor = attributes.find(x=>x.name==="dill-for");
        if (dillFor !== undefined) {
            attributes.splice(attributes.indexOf(dillFor),1);
            options.for = new function DillFor(){
                this.rootElement = rootElement;
                this.template = template;
                this.initialLength = 0;
                this.value = dillFor.value;
                this.clone = child.cloneNode(true);
                this.templates = [];
                Object.seal(this);
            };
            return new Template(
                rootTemplate,
                child,
                data,
                null,
                null,
                options
            );
        }

        const dillTemplate = attributes.find(x=>x.name==="dill-template");
        if (dillTemplate !== undefined) {
            attributes.splice(attributes.indexOf(dillTemplate),1);
            const newValues = resolveData(data,dillTemplate.value);
            options.template = new function DillTemplate(){
                this.value = dillTemplate.value;
                this.template = template;
            };
            if (newValues instanceof Array) {
                template.children = newValues;
            }
        }

        const _attributes = templateAttributes(template,child,data);

        element.childNodes.length > 0
            ? element.insertBefore(child,element.childNodes[0])
            : element.appendChild(child);

        const newTemplate = new Template(
            rootTemplate,
            child,
            data,
            _attributes,
            null,
            options
        );

        newTemplate.childTemplates = template.children ? [...template.children].reverse().map(x=>appendTemplate(newTemplate,child,data,x,svg)) : null;

        return newTemplate;
    }

    if (template.component instanceof Function
        && template.component.component instanceof Component) {

        let isolate = false;
        const dillIsolate = attributes.find(x=>x.name==="dill-isolate");
        if (dillIsolate !== undefined) {
            attributes.splice(attributes.indexOf(dillIsolate),1);
            isolate = true;
        }

        const newData = createData(new template.component(),isolate?undefined:data);
        newData._template = template;

        attributes && forEach(attributes,attribute=>{
            const {name,value} = attribute;
            if (value.charAt(0) === "'" && value.charAt(value.length-1) === "'") {
                Object.defineProperty(newData,name,{
                    value: value.substring(1,value.length-1)
                });
                return;
            }
            define(newData,name,()=>data[value],(_value)=>data[value]=_value);
        });

        const dillIf = attributes.find(x=>x.name==="dill-if");
        if (dillIf !== undefined) {
            attributes.splice(attributes.indexOf(dillIf),1);
            const inverted = dillIf.value.charAt(0) === "!";
            let ifValue = !!resolveData(data,dillIf.value.substr(inverted?1:0));
            if (inverted) {
                ifValue = !ifValue;
            }
            if (!ifValue) {
                options.if = new function DillIf(){
                    this.rootElement = rootElement;
                    this.parentData = data;
                    this.template = template;
                    this.initialValue = false;
                    this.templated = false;
                    this.value = dillIf.value.substr(inverted?1:0);
                    this.elements = [];
                    this.inverted = inverted;
                    Object.seal(this);
                };
                return new Template(
                    rootTemplate,
                    template.component,
                    newData,
                    null,
                    null,
                    options
                );
            }
            else {
                options.if = new function DillIf(){
                    this.rootElement = rootElement;
                    this.parentData = data;
                    this.initialValue = true;
                    this.templated = true;
                    this.value = dillIf.value.substr(inverted?1:0);
                    this.elements = [];
                    this.inverted = inverted;
                    Object.seal(this);
                }
            }
        }

        const dillFor = attributes.find(x=>x.name==="dill-for");
        if (dillFor !== undefined) {
            attributes.splice(attributes.indexOf(dillFor),1);
            options.for = new function DillFor(){
                this.rootElement = rootElement;
                this.template = template;
                this.initialLength = 0;
                this.value = dillFor.value;
                this.templates = [];
                this.elements = [];
                Object.seal(this);
            };
            return new Template(
                rootTemplate,
                template.component,
                data,
                null,
                null,
                options
            );
        }

        const newTemplate = new Template(
            rootTemplate,
            template.component,
            newData,
            attributes,
            null,
            options
        );

// Runs before childs which means it will run before child oninit but will not have access to any attribute--- that are declared in the children.
        newData.hasOwnProperty("onpretemplate") && newData.onpretemplate();

        newTemplate.childTemplates = [...template.component.component.template].reverse().map(x=>appendTemplate(newTemplate,elementOrArray,newData,x,svg));

        fireEvents(newTemplate,"oninit");
        fireEvents(newTemplate,"oninserted");

        return newTemplate;
    }
}
