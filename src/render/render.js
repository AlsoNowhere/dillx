
import { forEach } from "sage";

import { deBracer } from "dill-core";

import { renderAttributes } from "./render-attributes";

import { renderComponentAttributes } from "./render-component-attributes";

export const render = template => {

    const { element, text, data, Component, childTemplates } = template;

// This property is only defined if this is a TextNode. In which case render the TextNode.
    if (text) {
        const previousValue = element.nodeValue;
        const newValue = deBracer(text,data);

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
    else if (Component) {
// We need to pass the render function into here to prevent a cyclic issue in rollup.
        continueRendering = renderComponentAttributes(template, render);
        template.data.hasOwnProperty("onchange") && template.data.onchange();
    }

    if (!continueRendering) {
        return;
    }

// Now render the child nodes.
    childTemplates && forEach(childTemplates,render);
}
