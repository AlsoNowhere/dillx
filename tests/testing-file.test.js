(function () {
    'use strict';

    const define = (scope,property,getAction,setAction) => {
        if (!(scope instanceof Object)) {
            throw new Error("Thyme, define, scope -- You must pass an Object as the scope");
        }
        if (typeof property !== "string") {
            throw new Error("Thyme, define, property -- You must pass a string as the property");
        }
        if (!(getAction instanceof Function)) {
            throw new Error("Thyme, define, getAction -- You must pass a function as the getAction");
        }
        if (!(setAction instanceof Function)) {
            throw new Error("Thyme, define, setAction -- You must pass a function as the setAction");
        }

        Object.defineProperty(scope,property,{
            get: getAction,
            set: setAction
        });
    };
    const define$1 = define;

    const createData = (newData,parentData) => {
        const Data = function(){
            for (let key in newData) {
                let _value = newData[key];
                define$1(this,key,()=>_value,value=>_value=value);
            }
            if (parentData !== undefined) {
                this._parent = parentData;
            }
        };
        Data.prototype = parentData === undefined
            ? {}
            : parentData;
        return new Data();
    };

    var resolveData = function(data,value){
        var output = data[value] instanceof Function
            ? data[value]()
            : data[value];
        return output === undefined
            ? ""
            : output;
    };

    var deBracer = function(string,data){
        return string.replace(/{[A-Za-z0-9_$]+}/g,function(match,index){
            if (string.charAt(index-1) === "\\") {
                return match;
            }
            return resolveData(data,match.substring(1,match.length-1));
        });
    };

    const apps = [];

    var Component = function(
        name,
        template,
        // isolated
    ){
        this.name = name;
        this.template = template instanceof Array
            ? template
            : [template];
        // this.isolated = isolated;
    };

    const Template = function(
        rootTemplate = null,
        elementOrComponent,
        data,
        attributes = null,
        childTemplates = null,
        options = {}
    ){
        this.rootTemplate = rootTemplate;

        if (elementOrComponent instanceof Node) {
            this.text = elementOrComponent.nodeValue;
            this.element = elementOrComponent;
        }
        else if (elementOrComponent instanceof Element) {
            this.element = elementOrComponent;
        }
        else if (elementOrComponent instanceof Function && elementOrComponent.component instanceof Component) {
            this.component = elementOrComponent;
        }

        this.data = data;

        this.attributes = attributes;

        this.childTemplates = childTemplates;

        if (options.if) {
            this.if = options.if;
        }

        if (options.for) {
            this.for = options.for;
        }

        if (options.template) {
            this.template = options.template;
        }

        Object.seal(this);
    };

    const createData$1 = createData;
    const deBracer$1 = deBracer;
    const resolveData$1 = resolveData;

    // export const Component = _Component;
    // export const TemplateComponent = _TemplateComponent;

    // export const createIf = _createIf;
    // export const createFor = _createFor;
    // export const createDillTemplate = _createDillTemplate;
    // export const createAttributes = _createAttributes;

    // export const renderIf = _renderIf;
    // export const renderFor = _renderFor;
    // export const renderAttributes = _renderAttributes;

    const apps$1 = apps;
    // export const reset = _reset;

    const Template$1 = Template;
    const Component$1 = Component;

    const define$2 = (scope,property,getAction,setAction) => {
        if (!(scope instanceof Object)) {
            throw new Error("Thyme, define, scope -- You must pass an Object as the scope");
        }
        if (typeof property !== "string") {
            throw new Error("Thyme, define, property -- You must pass a string as the property");
        }
        if (!(getAction instanceof Function)) {
            throw new Error("Thyme, define, getAction -- You must pass a function as the getAction");
        }
        if (!(setAction instanceof Function)) {
            throw new Error("Thyme, define, setAction -- You must pass a function as the setAction");
        }

        Object.defineProperty(scope,property,{
            get: getAction,
            set: setAction
        });
    };

    var logger = {
        error: function(app,_module,property,message){
            throw new Error(`${app} - ${_module} - ${property} -- ${message}`);
        },
        warn: function(app,_module,property,message) {
            console.warn(`${app} - ${_module} - ${property} -- ${message}`);
        }
    };

    var baseForEach = function(initialIncrement, howToEndWhile, increment){
        return function(array, callback){
            var i = initialIncrement(array),
                result,
                newArray = [];
            while (howToEndWhile(i,array)) {
                result = callback(array[i], i);
                if (result === false) {
                    break;
                }
                if (typeof result === "number") {
                    i += result;
                }
                else {
                    newArray.push(result);
                }
                i += increment;
            }
            return newArray;
        }
    };

    var forEach = baseForEach(
        function(){
            return 0;
        },
        function(i, array){
            return i < array.length;
        },
        1
    );

    var reverseForEach = baseForEach(
        function(array){
            return array.length - 1;
        },
        function(i){
            return i >= 0;
        },
        -1
    );
    const define$1$1 = define$2;

    const logger$1 = logger;

    const forEach$1 = forEach;
    const reverseForEach$1 = reverseForEach;

    const templateAttributes = (
        template,
        element,
        data
    ) => {

        const attributes = forEach$1(template.attributes||[],attribute=>{

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
                element.setAttribute(name,deBracer$1(value,data));
            }

    // Anything else is a fair attribute.
            return attribute;
        });

        return attributes;
    };

    const mapTemplateToElement = (
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

            return new Template$1(
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
                const newValues = resolveData$1(data,Object.values(dillExtend)[0]);

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
                let ifValue = !!resolveData$1(data,Object.values(dillIf)[0].substr(inverted?1:0));
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
                    return new Template$1(
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
                    };
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
                return new Template$1(
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
                const newValues = resolveData$1(data,Object.values(dillTemplate)[0]);

        // Save data about this here.
                options.template = new function DillTemplate(){
                    this.value = Object.values(dillTemplate)[0];
                    this.template = template;
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

            const newTemplate = new Template$1(
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

        if (template.component instanceof Function
            && template.component.component instanceof Component$1) {

    // Isolating a Component can be done by the following example: <Component dill-isolate />
    // This means that the root data above the Component is not passed into this Component instance. This prevents scope we don't want from creeping in but it is not the default behvaiour unlike other frameworks.
            let isolate = false;
            const dillIsolate = attributes.find(x=>Object.keys(x)[0]==="dill-isolate");
            if (dillIsolate !== undefined) {
                attributes.splice(attributes.indexOf(dillIsolate),1);
                isolate = true;
            }

    // Create a new data Object on to the prototype chain from the root data (if not isolated).
            const newData = createData$1(new template.component(),isolate?undefined:data);
            
        // Any child nodes that have been added which are being replaced are saved into the data with the ._template property.
            newData._template = template;

    // Properties added to the Component instance are added on to the new data scope here.
    // e.g <Component example="'content'" />
    // The above will add the property "example" with the value "content" to this data object. ({ example: "content" }).
            attributes && forEach$1(attributes,attribute=>{
                const name = Object.keys(attribute)[0];
                const value = Object.values(attribute)[0];
                if (value.charAt(0) === "'" && value.charAt(value.length-1) === "'") {
                    Object.defineProperty(newData,name,{
                        value: value.substring(1,value.length-1)
                    });
                    return;
                }
                define$1$1(newData,name,()=>data[value],(_value)=>data[value]=_value);
            });


    // Dill if feature (dill-if={true}). Handled here for a Component. Read the docs on how to use this in an app.
            const dillIf = attributes.find(x=>Object.keys(x)[0]==="dill-if");
            if (dillIf !== undefined) {
                attributes.splice(attributes.indexOf(dillIf),1);
                const inverted =  Object.values(dillIf)[0].charAt(0) === "!";
                let ifValue = !!resolveData$1(data, Object.values(dillIf)[0].substr(inverted?1:0));
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
                    return new Template$1(
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
                        this.value = Object.values(dillIf)[0].substr(inverted?1:0);
                        this.elements = [];
                        this.inverted = inverted;
                        Object.seal(this);
                    };
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
                return new Template$1(
                    rootTemplate,
                    template.component,
                    data,
                    null,
                    null,
                    options
                );
            }

            const newTemplate = new Template$1(
                rootTemplate,
                template.component,
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
            newTemplate.childTemplates = [...template.component.component.template]
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
    };

    const recurseTemplates = (childTemplates,template,obj) => {
        childTemplates instanceof Array && forEach$1(childTemplates,childTemplate=>{
            if (obj.element instanceof Element) {
                return;
            }
            if (
                obj.element === undefined
                    && childTemplate === template
            ) {
                obj.element = null;
                return;
            }
            if (
                obj.element === null
                    && childTemplate.element
                    && childTemplate.element.parentNode !== null
                    && document.body.contains(childTemplate.element)
                ) {
                obj.element = childTemplate.element;
                return;
            }
            recurseTemplates(childTemplate.childTemplates,template,obj);
        });
    };

    const findNextElement = (rootTemplate,template) => {
        let obj = {};
        recurseTemplates(rootTemplate.childTemplates,template,obj);
        return obj.element;
    };

    const fireEvents = (template,name) => {
        if (template.if && !template.if.initialValue) {
            return;
        }

        template.component instanceof Function && template.data.hasOwnProperty(name) && template.data[name]();
        template.childTemplates && forEach$1(template.childTemplates,childTemplate => fireEvents(childTemplate,name));
    };

    // When a Component is removed from the DOM it is itself not on the DOM so we use this function to go through, using the rootElement the Component has a reference to and remove the Elements from their actualy DOM parent Elements.
    // This is a recursive function.
    // This function is similar to that defined in renderFor but is not the same.
    const removeComponentElements = (
        template,
        arr,
        childTemplates
    ) => {
        forEach$1(childTemplates,childTemplate=>{
            if (childTemplate.element
                && (!childTemplate.if || childTemplate.if.initialValue)) {
                arr.push(childTemplate.element);
                template.if.rootElement.removeChild(childTemplate.element);
            }
            else if (childTemplate.component) {
                removeComponentElements(template,arr,childTemplate.childTemplates);
            }
        });
    };

    const renderIf = (template, render) => {

    // Get the new boolean of whether the Element should be attached to the DOM or not.
        let newValue =  !!resolveData$1(template.if.parentData||template.data,template.if.value);
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

            if (template.component) {
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
                        && template.if.template.children.map(x=>mapTemplateToElement(template,template.element,template.data,x));    
                    fireEvents(template,"oninit");
                    fireEvents(template,"oninserted");
                    render(template);
                }

                else if (template.component) {

    // This Div element sucks up all the child Elements created from a Component's creation.
    // These child nodes are then added to the rootElement as the Component is not actually attached to the DOM.
    // The Div element is then garbage collected.
                    const div = document.createElement("DIV");

                    template.childTemplates = [...template.if.template.component.component.template]
                        .reverse()
                        .map(x=>mapTemplateToElement(
                            template,
                            [div,template.if.rootElement],
                            template.data,
                            x
                        ));

                    forEach$1([...div.childNodes],element=>{
                        insertIndex === null
                            ? template.if.rootElement.appendChild(element)
                            : template.if.rootElement.insertBefore(element,insertIndex);
                    });

                    fireEvents(template,"oninit");
                    fireEvents(template,"oninserted");
                    forEach$1(template.childTemplates,render);
                }
            }

            else if (template.component) {

                reverseForEach$1(template.if.elements,element=>{
                    insertIndex === null
                        ? template.if.rootElement.appendChild(element)
                        : template.if.rootElement.insertBefore(element,insertIndex);
                });

                fireEvents(template,"oninserted");
                forEach$1(template.childTemplates,render);
            }
        }

        return template.if.initialValue;
    };

    const DillFor = function(
        item,
        index
    ){
        this._item = item;
        this._index = index;
    };

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
    const removeComponentElements$1 = (
        template,
        childTemplates
    ) => {
        forEach$1(childTemplates,childTemplate=>{
            if (childTemplate.element && (!childTemplate.for || childTemplate.for.initialValue)) {
                template.for.rootElement.removeChild(childTemplate.element);
            }
            else if (childTemplate.component) {
                removeComponentElements$1(template,childTemplate.childTemplates);
            }
        });
    };

    const renderFor = (template, render) => {

        const list = resolveData$1(template.data,template.for.value);
        const initialLength = template.for.initialLength;

    // Only clean the data on the values that are going to be on the new list.
    // If the old list was 3 long and the new list is 4 long clean the first 3.
    // If the old list was 3 long and the new list is 2 long clean the first 2.
        forEach$1(template.for.templates.slice(0,list.length<initialLength?list.length:initialLength),(forTemplate,index)=>{
            cleanData(template,list,forTemplate.data,index);
        });

    // If the new list is shorter than the old list then just remove the redundant Elements or Components.
        if (list.length < initialLength) {
            forEach$1(template.for.templates.slice(list.length),forTemplate=>{
                if (template.element) {
                    template.for.rootElement.removeChild(forTemplate.element);
                }
                else if (template.component) {
                    removeComponentElements$1(template,forTemplate.childTemplates);
                }
            });
            template.for.templates.length = list.length;
        }

    // If the new list if longer than the old list we need to clone more Elements or Components and add them here.
        else if (list.length > initialLength) {

            const insertIndex = findNextElement(template.rootTemplate,template);

            forEach$1(Array(list.length - initialLength).fill(null),(_,index)=>{
                if (template.element) {

                    const clone = template.for.clone.cloneNode(true);

        // If the the last Element on the list is the last Element on the parent Element then append, otherwise insert the new clone Element after the last Element on the list.
                    insertIndex === null
                        ? template.for.rootElement.appendChild(clone)
                        : template.for.rootElement.insertBefore(clone,insertIndex);

                    const newData = createData$1(new DillFor(list[index+initialLength],index+initialLength),template.data);

        // Clean data also acts to add the correct properties to the newData and make it appropriate to be in a for loop.
        // Like adding the index value.
                    cleanData(template,list,newData,index+initialLength);

                    const newTemplate = new Template$1(
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
                else if (template.component) {

                    const componentData = createData$1(new template.component(),template.data);
                    const newData = createData$1(new DillFor(list[index+initialLength],index+initialLength),componentData);

                    cleanData(template,list,newData,index+initialLength);

                    const newTemplate = new Template$1(
                        template.rootTemplate,
                        template.component,
                        newData
                    );

                    fireEvents(newTemplate,"oninit");
                    fireEvents(newTemplate,"oninserted");

                    const div = document.createElement("DIV");

                    newTemplate.childTemplates = [...template.component.component.template]
                        .reverse().map(x=>mapTemplateToElement(template.rootTemplate,[div,template.for.rootElement],newData,x));

                    forEach$1([...div.childNodes],element=>{
                        insertIndex === null
                            ? template.for.rootElement.appendChild(element)
                            : template.for.rootElement.insertBefore(element,insertIndex);
                    });

                    template.for.templates.push(newTemplate);
                }
            });
        }

        template.for.initialLength = list.length;
        forEach$1(template.for.templates,render);
    };

    const renderTemplate = template => {
        let newChildren = resolveData$1(template.data,template.template.value);

        if (!(newChildren instanceof Array)) {
            newChildren = [newChildren];
        }

    // Check that the new values provided are indeed differenet.
    // This prevents re rendering when not needed and is better for performance.
        if (template.template.template.children.length !== newChildren.length
            || !newChildren.reduce((a,b,i)=>{
                if (!a) {
                    return false;
                }
                if (b!==template.template.template.children[i]) {
                    return false;
                }
                return true;
            }
            ,true)
        ) {

    // The template contains the child templates that are going to be rendered after this function.
    // Here we preserve the Object (Array) where these child templates are stored and just change the values.
    // This prevents reference conflicts.
    // DO NOT DO THIS: template.template.template.children = newChildren;
            template.template.template.children.length = 0;
            newChildren.forEach(x=>{
                template.template.template.children.push(x);
            });

            reverseForEach$1(template.element.childNodes,x=>template.element.removeChild(x));

            template.childTemplates.length = 0;
            template.template.template.children
                && [...template.template.template.children]
                .reverse()
                .map(x=>mapTemplateToElement(template,template.element,template.data,x))
                .forEach(each => {
                    template.childTemplates.push(each);
                });
        }
    };

    const properties = ["value","checked"];

    const renderAttributes = (template, render) => {

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

        if (template.template) {
            renderTemplate(template);
        }

        template.attributes && forEach$1(template.attributes,attribute=>{

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
                const newValue = resolveData$1(data,value);

                if (previousValue !== newValue) {
        // If the value is false or undefined don't add the attribute at all or remove it.
        // This is because certain Elements such as <input /> are affected by the presence of the attribute regradless of that attribute's value.
        // e.g disabled/required.
                    if (newValue === false || newValue === undefined) {
                        element.removeAttribute(attrName);
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
            const newValue = deBracer$1(value,data);
            
            if (name.substr(0,5) !== "dill-") {
                if (previousValue === undefined || previousValue.nodeValue !== newValue) {
                    element.setAttribute(name,newValue);
                }
            }
        });

        return true;
    };

    const renderComponentAttributes = (template, render) => {

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

        return true;
    };

    const render = template => {

        const { element, text, data, component, childTemplates } = template;

    // This property is only defined if this is a TextNode. In which case render the TextNode.
        if (text) {
            const previousValue = element.nodeValue;
            const newValue = deBracer$1(text,data);

        // Only define the value of the TextNode Element if the value is different.
        // This is a way of performing more performant diffing without needing a virtual DOM.
            if (previousValue !== newValue) {
                element.nodeValue = newValue;
            }

        // TextNode handled, no need to continue.
            return;
        }


    // When checking the Element attributes they may dictate whether the Element will be rendered at all.
    // For example if the dill-if value is now false.
        let continueRendering = true;
        if (element) {
    // We need to pass the render function into here to prevent a cyclic issue in rollup.
            continueRendering = renderAttributes(template, render);
        }
        else if (component) {
    // We need to pass the render function into here to prevent a cyclic issue in rollup.
            continueRendering = renderComponentAttributes(template, render);
            template.data.hasOwnProperty("onchange") && template.data.onchange();
        }

        if (!continueRendering) {
            return;
        }

    // Now render the child nodes.
        childTemplates && forEach$1(childTemplates,render);
    };

    const XTemplate = function(
        nameOrComponent,
        attributes,
        children
    ){
        if (typeof nameOrComponent === "string") {
            this.name = nameOrComponent;
        }
        else if (nameOrComponent instanceof Function) {
            this.component = nameOrComponent;
        }

        if (attributes instanceof Array) {
            this.attributes = attributes;
        }

        if (children instanceof Array) {
            this.children = children;
        }

        Object.seal(this);
    };

    // This function kicks off a new render.
    // It accepts an argument which is a Component scope.
    const change = template => {


    // Dev only
        if (template !== undefined
            || !(template instanceof Function)
            || !(template._dillTemplate instanceof XTemplate)) ;
    // / Dev only


        template
        
    // If passed a Component scope it renders that and Components down from there.
            ? render(template._dillTemplate)

    // If passed undefined the whole app gets re rendered.
            : forEach$1(apps$1,appTemplate=>{
                appTemplate instanceof Array
                    ? forEach$1(appTemplate,childTemplate => render(childTemplate))
                    : render(appTemplate);
            });
    };

    // This method creates new apps.
    const createDillxApp = (
    // Must be passed, a DOM Element
        element,
        Data,
        dillxTemplate
    ) => {


    // Dev only
        if (!(element instanceof Element)) {
            return logger$1.error("Dillx",".create()","element","You must pass a DOM Element to the element argument.");
        }
    // / Dev only

    // Dev only
        if (!(Data instanceof Function)) {
            return logger$1.error("Dillx",".create()","Data","You must pass a constructor function to the Data argument.");
        }
    // / Dev only


    // Make sure that this property is an Array.
        dillxTemplate = dillxTemplate instanceof Array
            ? dillxTemplate
            : [dillxTemplate];

    // Dev only
        if (dillxTemplate.filter(x=>x instanceof XTemplate||typeof x==="string").length < dillxTemplate.length) {
            return logger$1.error("Dillx",".create()","dillxTemplate",'You must pass an output of dill.template() to the dillxTemplate argument. You can do this using rollup-plugin-dillx, e.g dillx(<p class="padding">Content</p>) or literally by writing dillx.template() e.g dillx.template("p",[{"class":"padding"},["Content"]]).');
        }
    // / Dev only


    // Create a new Dill data object.
        const data = createData$1(new Data());
        
    // If this data has the lifecycle hook 'onpretemplate' then run it now, at the creation of this new Dill data object.
        data.hasOwnProperty("onpretemplate") && data.onpretemplate();

    // Create DillTemplates. Read more about this in the mapTemplateToElement file (./src/template/map-template-to-element.js).
        const templates = reverseForEach$1(dillxTemplate,child=>mapTemplateToElement(null,element,data,child,false));

    // This creates the reference for a new app which is now added as a new app to the list of apps.
        apps$1.push(templates);

    // Now that the app is created we can run the initial render automatically.
        forEach$1(templates,render);

    // But returning the Dill data object here the dev can have access to the actual root data for this app.
    // If the dev tries to use the object they passed in it would not be the same.
    // This is why the Data property has to be a constructor function, to prevent the confusion that the object passed in is not the same as the one used in the app.
        return data;
    };

    const createDillxTemplate = (
        nameOrComponent,
        attributes = [],
        children = []
    ) => {


        if (nameOrComponent instanceof Array) {
            return nameOrComponent;
        }


        return new XTemplate(
            nameOrComponent,
            attributes,
            children
        );
    };




    // export const createDillxTemplate = (
    //     nameOrComponent,
    //     attributes = [],
    //     children = []
    // ) => {

    //     if (nameOrComponent instanceof Array) {
    //         return nameOrComponent;
    //     }

    //     return new XTemplate(
    //         nameOrComponent,
    //         attributes,
    //         children
    //     );

    //     // return new function XTemplate(){

    //     //     if (typeof nameOrComponent === "string") {
    //     //         this.name = nameOrComponent
    //     //     }
    //     //     else if (nameOrComponent instanceof Function
    //     //         // && nameOrComponent.component instanceof Component
    //     //         ) {
    //     //         this.component = nameOrComponent;
    //     //     }
        
    //     //     if (attributes instanceof Array) {
    //     //         this.attributes = attributes;
    //     //     }
        
    //     //     if (children instanceof Array) {
    //     //         this.children = children;
    //     //     }
    //     // }
    // }

    // Define the Dill object
    const dillx$1 = new (function Dillx(){

    // This function kicks off a new render.
    // It accepts an argument which is a Component scope.
    // If passed a Component scope it renders that and Components down from there.
    // If passed undefined the whole app gets re rendered.
        this.change = change;

    // Expose the Template model.
        // this.Template = Template;

    // Expose the Component model.
    // This allows new Components to be created so is very important.
        this.Component = Component$1;

    // This method creates new apps.
        this.create = createDillxApp;

    // This method is used to define a new Element, Component or textNode.
    // Use this either literally: dill.template("p",[{"class":"padding"}],["Content"]).
    // Or gettings rollup=plugin-dillx to compile it from JSX: dillx(<p class="padding">Content</p>).
        this.template = createDillxTemplate;

        // this.apps = apps;

        this.reset = () => apps$1.length = 0;
    })();

    window.dill = dillx$1;
    window.dillx = dillx$1;

    var baseForEach$1 = function(initialIncrement, howToEndWhile, increment){
        return function(array, callback){
            var i = initialIncrement(array),
                result,
                newArray = [];
            while (howToEndWhile(i,array)) {
                result = callback(array[i], i);
                if (result === false) {
                    break;
                }
                if (typeof result === "number") {
                    i += result;
                }
                else {
                    newArray.push(result);
                }
                i += increment;
            }
            return newArray;
        }
    };

    var reverseForEach$2 = baseForEach$1(
        function(array){
            return array.length - 1;
        },
        function(i){
            return i >= 0;
        },
        -1
    );
    const reverseForEach$1$1 = reverseForEach$2;

    const reset = () => {
        dillx$1.reset();
        reverseForEach$1$1(document.body.childNodes,child=>document.body.removeChild(child));
    };

    var renderTextNode = () => test("Render a textnode",()=>{
        reset();

        dillx$1.create(document.body,function(){},dillx$1.template(["            Lemon        "]));

        expect(document.body.childNodes.length).toBe(1);
        expect(document.body.childNodes[0].nodeName).toBe("#text");
    });

    var createMainElement = () => test("Create main element",()=>{
        reset();

        dillx$1.create(document.body,function(){},dillx$1.template(/*{}*/"main",[],[""]));

        expect(document.body.children.length).toBe(1);
        expect(document.body.children[0].nodeName).toBe("MAIN");
    });

    const testText = "Example";

    var renderTextBindings = () => test("Render text bindings",()=>{
        reset();

        const Data = function(){
            this.testText = testText;
        };

        dillx$1.create(document.body,Data,dillx$1.template(["            Lemon {testText}        "]));

        expect(document.body.childNodes[0].textContent.includes(`Lemon ${testText}`)).toBe(true);
    });

    const testText$1 = "Example";

    var renderMultipleTextBindings = () => test("Render text bindings",()=>{
        reset();

        const Data = function(){
            this.testText = testText$1;
        };

        dillx$1.create(document.body,Data,dillx$1.template(["            Lemon {testText} | {testText}        "]));

        expect(document.body.childNodes[0].textContent.includes(`Lemon ${testText$1} | ${testText$1}`)).toBe(true);
    });

    const classText = "example";

    var stringBinding = () => test("Render attribute bindings",()=>{
        reset();

        const Data = function(){
            this.classText = classText;
        };

        dillx$1.create(document.body,Data,dillx$1.template(/*{}*/"p",[{"class":"one {classText}"}],[""]));

        expect(document.body.childNodes[0].attributes.class.nodeValue).toBe(`one ${classText}`);
    });

    const classText$1 = "example";

    var attributeReplacement = () => test("Create a new attribute",()=>{
        reset();

        const Data = function(){
            this.classText = classText$1;
        };

        dillx$1.create(document.body,Data,dillx$1.template(/*{}*/"p",[{"class-":"classText"}],[""]));

        expect(document.body.childNodes[0].attributes.class.nodeValue).toBe(classText$1);
    });

    const action = jest.fn(() => {});

    var addEvent = () => test("Create a new attribute",()=>{
        reset();

        const Data = function(){
            this.action = action;
        };

        dillx$1.create(document.body,Data,dillx$1.template(/*{}*/"p",[{"click--":"action"}],[""]));

        document.body.childNodes[0].dispatchEvent(new Event("click"));

        expect(action.mock.calls.length).toBe(1);
    });

    var getElementReference = () => test("Create a new attribute",()=>{
        reset();

        const Data = function(){
            this.p = null;
        };

        const data = dillx$1.create(document.body,Data,dillx$1.template(/*{}*/"p",[{"p---":""}],[""]));

        expect(data.p).toBe(document.body.childNodes[0]);
    });

    const action$1 = jest.fn(() => {});

    const Example = function(){
        this.$template_0 = function(){return action$1()};

    };
    Example.component = new dillx$1.Component("example",dillx$1.template("p",[{"click--":"$template_0"}],[""]));

    var addEventDillx = () => test("Create a new attribute",()=>{
        reset();

        dillx$1.create(document.body,function(){},dillx$1.template(/*{}*/Example,[]));

        document.body.childNodes[0].dispatchEvent(new Event("click"));

        expect(action$1.mock.calls.length).toBe(1);
    });

    [

        createMainElement,
        renderTextNode,
        renderTextBindings,
        renderMultipleTextBindings,

        stringBinding,
        attributeReplacement,
        addEvent,
        getElementReference,

        addEventDillx,

    ].forEach(each => each());

}());
