
import { Template, Component, apps } from "dill-core";

import { change } from "./render/change";

import { createDillxApp } from "./create/create-dillx-app";
import { createDillxTemplate } from "./create/create-dillx-template";

const Dillx = function(){
    this.change = change;
    this.Template = Template;
    this.Component = Component;
    this.create = createDillxApp;
    this.template = createDillxTemplate;
    this.apps = apps;
};

const dillx = new Dillx();

window.dill = dillx;
window.dillx = dillx;
export default dillx;
