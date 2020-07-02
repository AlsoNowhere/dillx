
import dillx from "../../dist/dillx";

import { reset } from "../reset";

export default () => test("Create a new attribute",()=>{
    reset();

    const Data = function(){
        this.p = null;
    };

    const data = dillx.create(document.body,Data,dillx(
        <p p---=""></p>
    ));

    expect(data.p).toBe(document.body.childNodes[0]);
});
