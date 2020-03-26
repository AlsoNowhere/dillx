
/* Must conform to a '< then >' pattern. */
const recurseArrowCheck = str => {
    if (str.indexOf("<") === -1) {
        return true;
    }
    if (str.indexOf("<") > str.indexOf(">")) {
        return false;
    }
    return recurseArrowCheck(str.substring(str.indexOf(">")+1));
}

const buildAttributes = (str,methods) => {

    const l = str.length;

    let insideSpeech = false;
    let insideBraces = null;
    let insideBraceNumber = null;
    let braces = 0;
    let newStr = "";

    for (let i = 0 ; i < l ; i++) {
        const x = str.substr(i,1);
        if (x === '"') {
            insideSpeech = !insideSpeech;
            if (insideBraces === null) {
                newStr += x;
            }
            continue;
        }
        if (insideSpeech) {
            if (insideBraces === null) {
                newStr += x;
            }
            continue;
        }
        if (x === "{") {
            braces++;
        }
        if (x === "}") {
            braces--;
        }
        if (x === "{" && insideBraces === null) {
            insideBraces = i;
            insideBraceNumber = braces;
            continue;
        }
        if (x === "}" && insideBraces !== null && braces === insideBraceNumber - 1) {
            const templateName = "template$_" + methods._index++;
            let value = str.substring(insideBraces,i+1)
                .replace(/"/g,"'");
            value = value.substring(1,value.length-1);

            if (value.indexOf("{") !== -1) {
                if (
                    value.substring(0,value.indexOf("{")).match(/functions*[^s]*[!1].*[!2]s*/)===null
                    && value.substring(0,value.indexOf("{")).match(/[!1].*[!2]s*[!11]s*/)===null
                ) {
                    value = `function(){return ${value}}`;
                }
            }
            else {
                if (
                    value.match(/functions*[^s]*[!1].*[!2]s*/)===null
                    && value.match(/[!1].*[!2]s*[!11]s*/)===null
                ) {
                    value = `function(){return ${value}}`;
                }
            }

            methods[templateName] = value;
            insideBraces = null;
            insideBraceNumber = null;
            newStr += `"${templateName}"`;
            continue;
        }
        if (insideBraces !== null) {
            continue;
        }
        newStr += x;
    }

// /* Anything inside a tag that matches the attribute format is added to the attribute list. */
    let _attributes = [];
    newStr
        .replace(/s[[]()a-z-]+="[^"]+"/g,x=>_attributes.push(x))
        .replace(/s[[]()a-z-]+/g,x=>_attributes.push(x));

    _attributes = _attributes.map(x=>{
        const split = x.substr(1).split("=");
        const attribute = {
            name: `"${split[0]}"`
        };
        if (split[1]) {
            attribute.value = split[1];
        }
        return attribute;
    });

// /* Build the attribute literal string. */
    const attributes = _attributes.map(x=>`{name:${x.name},value:${x.value}}`).join(",");

    return attributes;
}

export const resolveJSX = str => {

/* If the content does not contain any angle brackets then there is nothing to parse so return the whole thing. */
    if (str.indexOf("<") === -1) {
        return str;
    }

/* Any angle brackets found must be in the format <> <> not < < > for example. If this is not true then the code is not valid for parsing and will be returned as is. */
    // if (!recurseArrowCheck(str)) {
    //     return str;
    // }

    const methods = {
        _index: 0
    };

    let output = `"` + str

/* Remove line breaks and carriage returns. (Where we're going, we don't need 'em!) */
        .replace(/[
]+/g,"")
        .replace(/=>/g,"[!11]")

/* Find all instances of tags (anything between < and >: */
/* <> */
/* </> */
/* <span> */
/* </span> */
/* <span /> */
/* <Span /> */
/* ). */
        .replace(/<[^<]*>/g,x=>{

/* Handle fragments and closing tags. */
            if (x === "<>") {
                return `",["`;
            }
            if (x === "</>") {
                return `"],"`;
            }
            if (x.substr(0,2) === "</") {
                return `"]),"`;
            }

/* Find the tag name by splitting for spaces and using the first item in the resulting Array. */
            let tagName;
            x.substring(1,x.length-1).split(" ").forEach((y,j)=>{
                if (j === 0) {
                    tagName = y.substr(0,1).toLowerCase() !== y.substr(0,1) ? y : `"${y}"`;
                    return;
                }
            });

            const attributes = buildAttributes(x,methods);

/* Create the end of the string literal. Check if the tag is self closing. */
            const end = x.substr(x.length-2,1) === "/" ? `),"` : `,["`;
            let output = `",dillx.template(${tagName},[${attributes}]${end}`;

/* Room for console logging debugging. */

            return output;
        }) + `"`;

/* A lot of pointless strings can be added into the Arrays here. These two replacers try to clean things up a bit. */
        output = output.replace(/"s*",/g,"");
        output = output.replace(/,"s*"/g,"");

    delete methods._index;

    return "
//#goose" + JSON.stringify(methods) + "
" + output;
}
