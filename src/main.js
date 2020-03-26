
import { create } from "./create/create";
import { change } from "./change/change";
import { Component } from "./component/component";
import { reset } from "./reset/reset";
import { createElementTemplate } from "./template/create-element-template";

var Dillx = function(){
	this.template = createElementTemplate;
	this.create = create;
	this.change = change;
	this.Component = Component;
	this.reset = reset;
};

// ESM | mode
window.dillx = new Dillx();
export default new Dillx();

// script src | mode
// window.dill = new Dill();
