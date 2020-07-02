
import dillx from "../../dist/dillx";

import { reset } from "../reset";

const classText = "example";

export default () => test("Render attribute bindings",()=>{
    reset();

    const Data = function(){
        this.classText = classText;
    };

    dillx.create(document.body,Data,dillx(
        <p class="one {classText}"></p>
    ));

    expect(document.body.childNodes[0].attributes.class.nodeValue).toBe(`one ${classText}`);
});
