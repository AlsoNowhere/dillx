
import dillx from "../../dist/dillx";

import { reset } from "../reset";

const testText = "Example";

export default () => test("Render text bindings",()=>{
    reset();

    const Data = function(){
        this.testText = testText;
    };

    dillx.create(document.body,Data,dillx(
        <>
            Lemon {testText}
        </>
    ));

    expect(document.body.childNodes[0].textContent.includes(`Lemon ${testText}`)).toBe(true);
});
