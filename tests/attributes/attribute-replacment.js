
import dillx from "../../dist/dillx";

import { reset } from "../reset";

const classText = "example";

export default () => test("Create a new attribute",()=>{
    reset();

    const Data = function(){
        this.classText = classText;
    };

    dillx.create(document.body,Data,dillx(
        <p class-="classText"></p>
    ));

    expect(document.body.childNodes[0].attributes.class.nodeValue).toBe(classText);
});
