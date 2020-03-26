import { resolveJSX } from "./resolve-jsx";

let limiter = 0;

const recursiveResolveContent = content => {

    if (++limiter > 1000) {
        console.log("Dam size: ", limiter);
        throw new Error("Dam breached");
    }

    let output = content.replace(/([^()]*)/g,
        x=>"[!1]"+resolveJSX(x.substring(1,x.length-1))+"[!2]"
    );

    if (output !== content) {
        output = recursiveResolveContent(output);
    }

    return output;
}

/* -- Anything inside parenthesis is checked for JSX content. --
    Parenthesis are escaped with a temporary character to
    prevent infinite loops until all the code is checked
    then they are reinserted.
*/
export const resolveContent = content => {

    const output = recursiveResolveContent(content)
        .replace(/[!1]/g,"(")
        .replace(/[!2]/g,")")
        .replace(/[!11]/g,"=>")
    ;

    return output;
}
