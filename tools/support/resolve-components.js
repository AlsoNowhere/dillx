
export const resolveComponents = content => {

    let output = ``;

    let component = null;
    let componentName = null;
    let brace = 0;
    let brackets = 0;
    let template = null;
    let insideReturn = false;
    let returnBrackets = null;

    let methods = '';
    content = content.split("
").filter(x=>{
        if (x.substr(0,8) === "//#goose") {
            Object.entries(JSON.parse(x.substr(8))).forEach(x=>{
                methods += `
	this.${x[0]} = ${x[1]};
`;
            });
            return false;
        }
        return true;
    }).join("
");

    const l = content.length;
    for (let i = 0 ; i < l ; i++) {
        const x = content[i];
        if (x === "{") brace++;
        if (x === "}") brace--;
        if (x === "(") brackets++;
        if (x === ")") brackets--;
        if (content.substr(i,6) === "const ") {
            const firstLetter = content.substr(i+6,1);
            if (firstLetter.toLowerCase() !== firstLetter) {
                component = brace;
                componentName = content.substr(i+6,
                    content.substr(i+6).indexOf(" ")
                );
            }
        }
        if (component !== null && brace > component && content.substr(i,13) === "return dillx(") {
            i += 12;
            returnBrackets = brackets;
            brackets++;
            insideReturn = true;
            template = `(`;
            output += methods;
            continue;
        }
        if (insideReturn) {
            template += x;
            if (returnBrackets === brackets) {
                insideReturn = false;
                returnBrackets = null;
            }
            continue;
        }
        if (component !== null && brace === component && template !== null) {
            output += x;

// Got to slap this cheeky "-c" on the end here otherwise components like Header will become header and conflict with HTML semantics.
            const inlineComponentName = componentName.replace(/[A-Z]/g,x=>`-${x.toLowerCase()}`).substr(1) + "-c";
            
            output += `
${componentName}.component = new dillx.Component("${inlineComponentName}",${template});`;
            template = null;
            continue;
        }
        output += x;
    }

    return output;
}
