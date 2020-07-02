
import dillx from "../../dist/dillx";

import { reset } from "../reset";

const action = jest.fn(() => {});

export default () => test("Create a new attribute",()=>{
    reset();

    const Data = function(){
        this.action = action;
    };

    dillx.create(document.body,Data,dillx(
        <p click--="action"></p>
    ));

    document.body.childNodes[0].dispatchEvent(new Event("click"));

    expect(action.mock.calls.length).toBe(1);
});
