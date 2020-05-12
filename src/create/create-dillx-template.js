
// import { Component } from "dill-core";

export const createDillxTemplate = (
    nameOrComponent,
    attributes = [],
    children = []
) => {

    if (nameOrComponent instanceof Array) {
        return nameOrComponent;
    }

    return new function XTemplate(){

        // console.log("Soup: ", [nameOrComponent], nameOrComponent.component, attributes, children, this);

        if (typeof nameOrComponent === "string") {
            this.name = nameOrComponent
        }
        else if (nameOrComponent instanceof Function
            // && nameOrComponent.component instanceof Component
            ) {
            this.component = nameOrComponent;
        }
    
        if (attributes instanceof Array) {
            this.attributes = attributes;
        }
    
        if (children instanceof Array) {
            this.children = children;
        }
    }
}
