
import { forEach, define } from "sage";

import { createData, Template, Component, resolveData } from "dill-core";

import { templateAttributes } from "../template/template-attributes";

export const mapTemplateToElement = (
    rootTemplate,
    elementOrArray,
    data,
    template,
    isSvgOrChildOfSVG
) => {

// There are two elements in question here. Either this is a Component (element) or a DOM Element (rootElement).
// Components are not elements and are therefore not added to a DOM Element above them.
// Instead the next actual DOM Element that is not a Component is sent down and any element child of this Component are added to that instead.
    let element = elementOrArray;
    let rootElement = elementOrArray;

    if (elementOrArray instanceof Array) {
        element = elementOrArray[0];
        rootElement = elementOrArray[1];
    }

// If the template argument is a string then this element must be a TextNode.
// Create one, add it to the root element and go no further with the template.
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
// Only an Element, not a TextNode can have attributes so define that Array here.
// Clone the Array of attributes here to prevent coupling. Each new instance of a Component has unique attributes, they are not shared between instances of a Component.
    const attributes = [...template.attributes];

// SVG elements and children of SVG elements require a different way of being created so we need to know if this element is an SVG element or the child of one.
    if (template.name) {
        if (template.name === "svg") {
            isSvgOrChildOfSVG = true;
        }

// SVG elements are created differently to other Elements.
        const child = isSvgOrChildOfSVG
            ? document.createElementNS("http://www.w3.org/2000/svg",template.name)
            : document.createElement(template.name);


/*
    A word on dill attribute features.
    The main power of Dill is in these attributes. Dill uses four attributes to create a complex app:
        - extends
        - if
        - for
        - template
    This is instead of trying to use pseudo JavaScript syntax like .map((x,i)=>(< key={i}></>))) for looping, && or ? for conditionals or {moreContent()} for templating.
    Dill also does not use directives which would allow endless features.
    This is because Dill is simple and tackles the main chunk of why frameworks exist, to make content conditional, to iterate over boiler plate and to add dynamic content.

    Each of the code sections below discovers if the attribute in question has been added to this element.
     -> const dillExtend = attributes.find(x=>Object.keys(x)[0]==="dill-extend");

    If it has:
     -> if (dillExtend !== undefined) {

    remove it from the list of attributes:
     -> attributes.splice(attributes.indexOf(dillExtend),1);
*/

// Dill extend feature (dill-extend={{"click--":"action"}}). Handled here for a DOM Element. Read the docs on how to use this in an app.
        const dillExtend = attributes.find(x=>Object.keys(x)[0]==="dill-extend");
        if (dillExtend !== undefined) {
            attributes.splice(attributes.indexOf(dillExtend),1);
            const newValues = resolveData(data,Object.values(dillExtend)[0]);

    // Any properties on the object will be added as attribtues to this element. This needs to happen before the others because they may be added by this object.
            Object.entries(newValues).forEach(entry=>{
                const obj = {};
                obj[entry[0]] = entry[1];
                template.attributes.push(obj);
            });
        }

/*
    A word on dill-if condiitonal Elements

    If an Element is rendered and added to the page but then later it is removed from the page the reference to the Element is kept in memory.
    This may be seen as an antipattern and a memory leak because that Element is taking up memory without being used anywhere.
    The Element persists though instead of being re created because Dill is based on a single source of truth instead of immutable data.
    If this Element is reference by a dev while it is on the DOM it can still be reference without creating issues even while it is off the DOM.
*/
// Dill if feature (dill-if={true}). Handled here for a DOM Element. Read the docs on how to use this in an app.
        const dillIf = attributes.find(x=>Object.keys(x)[0]==="dill-if");
        if (dillIf !== undefined) {
            attributes.splice(attributes.indexOf(dillIf),1);

    // If the attribute value starts with a "!" then flip the boolean value of the scope property.
            const inverted = Object.values(dillIf)[0].charAt(0) === "!";
            let ifValue = !!resolveData(data,Object.values(dillIf)[0].substr(inverted?1:0));
            if (inverted) {
                ifValue = !ifValue;
            }

    // If the value for the dill-if is false the element is not added to the parent Element but the information will be saved so that it could be templated and generated at a later time.
            if (!ifValue) {
                options.if = new function DillIf(){
                    this.rootElement = rootElement;
                    this.template = template;
                    this.initialValue = false;
                    this.templated = false;
                    this.value = Object.values(dillIf)[0].substr(inverted?1:0);
                    this.inverted = inverted;
                    Object.seal(this);
                };
    // Seeing as this Element will not be added, return and do not continue templating it for now.
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
    // These details are saved here so that if at a later time the dill-if value is false the Element can be removed but information about it is retained.
                options.if = new function DillIf(){
                    this.rootElement = rootElement;
                    this.initialValue = true;
                    this.templated = true;
                    this.value = Object.values(dillIf)[0].substr(inverted?1:0);
                    this.inverted = inverted;
                    Object.seal(this);
                }
            }
        }

// Dill for feature (dill-for={[]}). Handled here for a DOM Element. Read the docs on how to use this in an app.
        const dillFor = attributes.find(x=>Object.keys(x)[0]==="dill-for");
        if (dillFor !== undefined) {
            attributes.splice(attributes.indexOf(dillFor),1);

    // Store data about this Element.
            options.for = new function DillFor(){
                this.rootElement = rootElement;
                this.template = template;
                this.initialLength = 0;
                this.value = Object.values(dillFor)[0];
                this.clone = child.cloneNode(true);
                this.templates = [];
                Object.seal(this);
            };
    // Do not continue from.
    // Looping Element are always created from a clone and so we don't need to add an Element here yet.
    // During the render stage the data is looked up and the resulting list will determine how many clones of this Element are to be added to the DOM.
            return new Template(
                rootTemplate,
                child,
                data,
                null,
                null,
                options
            );
        }

// Dill template feature (dill-template={dillx(<p></p>)}). Handled here for a DOM Element. Read the docs on how to use this in an app.
        const dillTemplate = attributes.find(x=>Object.keys(x)[0]==="dill-template");
        if (dillTemplate !== undefined) {
            attributes.splice(attributes.indexOf(dillTemplate),1);
            const newValues = resolveData(data,Object.values(dillTemplate)[0]);

    // Save data about this here.
            options.dill_template = new function DillTemplate(){
                this.value = Object.values(dillTemplate)[0];
                this.dillXTemplate = template;
            };
    // Swap out the Element's child nodes here, before the Element childs get rendered.
            if (newValues instanceof Array) {
                template.children = newValues;
            }
            else if (!!newValues) {
                template.children = [newValues];
            }
        }

// Other element attributes.
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

        newTemplate.childTemplates = template.children
            ? [...template.children]
                .reverse()
                .map(x=>mapTemplateToElement(
                    newTemplate,
                    child,
                    data,
                    x,
                    isSvgOrChildOfSVG
                ))
            : null;

        return newTemplate;
    }

    if (template.Component instanceof Function
        && template.Component.component instanceof Component) {

// Isolating a Component can be done by the following example: <Component dill-isolate />
// This means that the root data above the Component is not passed into this Component instance. This prevents scope we don't want from creeping in but it is not the default behvaiour unlike other frameworks.
        let isolate = false;
        const dillIsolate = attributes.find(x=>Object.keys(x)[0]==="dill-isolate");
        if (dillIsolate !== undefined) {
            attributes.splice(attributes.indexOf(dillIsolate),1);
            isolate = true;
        }

// Create a new data Object on to the prototype chain from the root data (if not isolated).
        const newData = createData(new template.Component(),isolate?undefined:data);
        
    // Any child nodes that have been added which are being replaced are saved into the data with the ._template property.
        newData._template = template;

// Properties added to the Component instance are added on to the new data scope here.
// e.g <Component example="'content'" />
// The above will add the property "example" with the value "content" to this data object. ({ example: "content" }).
        attributes && forEach(attributes,attribute=>{
            const name = Object.keys(attribute)[0];
            const value = Object.values(attribute)[0];
            if (value.charAt(0) === "'" && value.charAt(value.length-1) === "'") {
                Object.defineProperty(newData,name,{
                    value: value.substring(1,value.length-1)
                });
                return;
            }
            define(newData,name,()=>data[value],(_value)=>data[value]=_value);
        });


// Dill if feature (dill-if={true}). Handled here for a Component. Read the docs on how to use this in an app.
        const dillIf = attributes.find(x=>Object.keys(x)[0]==="dill-if");
        if (dillIf !== undefined) {
            attributes.splice(attributes.indexOf(dillIf),1);
            const inverted =  Object.values(dillIf)[0].charAt(0) === "!";
            let ifValue = !!resolveData(data, Object.values(dillIf)[0].substr(inverted?1:0));
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
                    this.value = Object.values(dillIf)[0].substr(inverted?1:0);
                    this.elements = [];
                    this.inverted = inverted;
                    Object.seal(this);
                };
                return new Template(
                    rootTemplate,
                    template.Component,
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
                    this.value = Object.values(dillIf)[0].substr(inverted?1:0);
                    this.elements = [];
                    this.inverted = inverted;
                    Object.seal(this);
                }
            }
        }


// Dill if feature (dill-for={[]}). Handled here for a Component. Read the docs on how to use this in an app.
        const dillFor = attributes.find(x=>Object.keys(x)[0]==="dill-for");
        if (dillFor !== undefined) {
            attributes.splice(attributes.indexOf(dillFor),1);
            options.for = new function DillFor(){
                this.rootElement = rootElement;
                this.template = template;
                this.initialLength = 0;
                this.value = Object.values(dillFor)[0];
                this.templates = [];
                this.elements = [];
                Object.seal(this);
            };
            return new Template(
                rootTemplate,
                template.Component,
                data,
                null,
                null,
                options
            );
        }

        const newTemplate = new Template(
            rootTemplate,
            template.Component,
            newData,
            attributes,
            null,
            options
        );

// Adds a reference to the new Template created here. This is used by dillx.change(this) to only render the Component passed to it.
        newData._dillTemplate = newTemplate;

// The onpretemplate lifecycle hook runs before childs which means it will run before child oninit but will not have access to any attribute--- that are declared in the children.
        newData.hasOwnProperty("onpretemplate") && newData.onpretemplate();

// Now that the template for this element has been completed, do the child templates.
        newTemplate.childTemplates = [...template.Component.component.template]
            .reverse()
            .map(x=>mapTemplateToElement(
                newTemplate,
                elementOrArray,
                newData,
                x,
                isSvgOrChildOfSVG
            ));

// Run Component lifecycle hooks.
// Do not use fireEvents here because we only want this component to run these, not the childs.
        newTemplate.data.hasOwnProperty("oninit") && newTemplate.data.oninit();
        newTemplate.data.hasOwnProperty("oninserted") && newTemplate.data.oninserted();

        return newTemplate;
    }
}
