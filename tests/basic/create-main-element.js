
import dillx from "../../dist/dillx";

import { reset } from "../reset";

export default () => test("Create main element",()=>{
    reset();

    dillx.create(document.body,function(){},dillx(
        <main></main>
    ));

    expect(document.body.children.length).toBe(1);
    expect(document.body.children[0].nodeName).toBe("MAIN");
});
