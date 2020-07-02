
import dillx from "../../dist/dillx";

import { reset } from "../reset";

const action = jest.fn(() => {});

const Example = function(){
    return dillx(
        <p click--={action()}></p>
    )
}

export default () => test("Create a new attribute",()=>{
    reset();

    dillx.create(document.body,function(){},dillx(
        <Example />
    ));

    document.body.childNodes[0].dispatchEvent(new Event("click"));

    expect(action.mock.calls.length).toBe(1);
});
