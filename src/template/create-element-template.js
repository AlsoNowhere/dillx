
import { dillModule } from "../module/Module.model";

export var createElementTemplate = function(
    nameOrComponent,
    attributes,
    children
){
    var name,
        element;

    if (typeof nameOrComponent === "string") {
        name = nameOrComponent;
    }
    else if (nameOrComponent instanceof Object && nameOrComponent.component instanceof this.Component) {
        name = nameOrComponent.component.name;
        dillModule.setComponent(nameOrComponent);
    }

    element = document.createElement(name);

    attributes.forEach(function(attribute){
        element.setAttribute(attribute.name,attribute.value);
    });

    if (children instanceof Array) {
        children.forEach(function(child){
            element.appendChild(typeof child === "string" ? document.createTextNode(child) : child);
        });
    }

    return element;
}
