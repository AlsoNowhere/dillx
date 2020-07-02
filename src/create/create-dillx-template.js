
import { XTemplate } from "../models/XTemplate.model";

export const createDillxTemplate = (
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
}
