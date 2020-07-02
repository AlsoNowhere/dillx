
import {
    // Template,
    Component, apps } from "dill-core";

import { change } from "./render/change";

import { createDillxApp } from "./create/create-dillx-app";

import { createDillxTemplate } from "./create/create-dillx-template";

// Define the Dill object
const dillx = new (function Dillx(){
// let dillx;
// export default window.dill = window.dillx = dillx = new (function Dillx(){

// This function kicks off a new render.
// It accepts an argument which is a Component scope.
// If passed a Component scope it renders that and Components down from there.
// If passed undefined the whole app gets re rendered.
    this.change = change;

// Expose the Template model.
    // this.Template = Template;

// Expose the Component model.
// This allows new Components to be created so is very important.
    this.Component = Component;

// This method creates new apps.
    this.create = createDillxApp;

// This method is used to define a new Element, Component or textNode.
// Use this either literally: dill.template("p",[{"class":"padding"}],["Content"]).
// Or gettings rollup=plugin-dillx to compile it from JSX: dillx(<p class="padding">Content</p>).
    this.template = createDillxTemplate;

    // this.apps = apps;

    this.reset = () => apps.length = 0;
})();

window.dill = dillx;
window.dillx = dillx;
export { dillx };
