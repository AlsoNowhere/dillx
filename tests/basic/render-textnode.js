
import dillx from "../../dist/dillx";

import { reset } from "../reset";

export default () => test("Render a textnode",()=>{
    reset();

    dillx.create(document.body,function(){},dillx(
        <>
            Lemon
        </>
    ));

    expect(document.body.childNodes.length).toBe(1);
    expect(document.body.childNodes[0].nodeName).toBe("#text");
});
