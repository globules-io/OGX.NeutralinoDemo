require('Views.Editor', 'View');
OGX.Views.Editor = function(__config){
    construct(this, 'Views.Editor');
	'use strict'; 
    const view = this;
    let list, tree, text_editor, data;

    //@Override
    this.construct = function(__data, __route_data){
        list = app.cfind('DynamicList', 'list');
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
            list.on(OGX.DynamicList.SELECT, function(__e, __item){
                if(!__item.id){
                    app.addOverlay();
                    app.addPopup({
                        id: 'new_book',
                        title: 'New Book',
                        width: '400|50%-',
                        height: 200,
                        buttons: [
                            {label:'OK', callback:closePopup, params:'new_book'}, 
                            {label:'CANCEL', callback:closePopup, params:'new_book'}
                        ]
                    });
                }
            });
            tree.on(OGX.Tree.SELECT, function(__e, __item){

            });
        }else{
            list.off(OGX.DynamicList.SELECT);
            tree.off(OGX.Tree.SELECT);
        }
    }; 
    
    //@Override
    this.destroy = function(){};
   
    function saveData(__string){
        Neutralino.filesystem.writeFile('./json/data.json', __string);
    }

    function closePopup(__id){
        app.removeOverlay(false);
        app.removePopup(__id, false);
    }

};