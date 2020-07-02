
// Basic tests
import renderTextNode from "./basic/render-textnode";
import createMainElement from "./basic/create-main-element";
import renderTextBindings from "./basic/render-text-bindings";
import renderMultipleTextBindings from "./basic/render-multiple-text-bindings";

// Attributes
import stringBinding from "./attributes/string-binding";
import attributeReplacement from "./attributes/attribute-replacment";
import addEvent from "./attributes/add-event";
import getElementReference from "./attributes/get-element-reference";

// Dillx features
import addEventDillx from "./dill-x-features/add-event";

[

// Basic tests
    createMainElement,
    renderTextNode,
    renderTextBindings,
    renderMultipleTextBindings,

// Attributes
    stringBinding,
    attributeReplacement,
    addEvent,
    getElementReference,

// Dillx features
    addEventDillx,

].forEach(each => each());
