
export const XTemplate = function(
    nameOrComponent,
    attributes,
    children
){
    if (typeof nameOrComponent === "string") {
        this.name = nameOrComponent
    }
    else if (nameOrComponent instanceof Function) {
        this.Component = nameOrComponent;
    }

    if (attributes instanceof Array) {
        this.attributes = attributes;
    }

    if (children instanceof Array) {
        this.children = children;
    }

    Object.seal(this);
}
