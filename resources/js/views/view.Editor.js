require('Views.Editor', 'View');
OGX.Views.Editor = function(__config){
    construct(this, 'Views.Editor');
	'use strict'; 
    const view = this;
    let tree, text_editor, data;

    //@Override
    this.construct = function(__data, __route_data){
        tree = app.cfind('Tree', 'tree');
        text_editor = app.cfind('Views.TextEditor', 'text_editor');
        data = app.getJSON('data');
    };
    
    //@Override
	this.enable = function(){};
	
    //@Override
	this.disable = function(){};    
	
    //@Override    
	this.ux = function(__bool){
        if(__bool){
            tree.on(OGX.Tree.SELECT, function(__e, __item){

            });
        }else{
            tree.off(OGX.Tree.SELECT);
        }
    }; 
    
    //@Override
    this.destroy = function(){};
   
    function saveData(__string){
        Neutralino.filesystem.writeFile('./json/data.json', __string);
    }

};