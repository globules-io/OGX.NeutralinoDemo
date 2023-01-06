require('Views.NewChapter', 'View');
OGX.Views.NewChapter = function(__config){
    construct(this, 'Views.NewChapter');
	'use strict'; 
    const node = __config.data;
    let popup, text;
    let val = null;

    //@Override
    this.construct = function(__data){
        popup = app.findPopup(this);
        text = $('#new_chapter > .text');
        OGX.Form.bindField({
            el: '#new_chapter input',
            allowed: /[a-zA-Z0-9 ]/,
            validate:true,
            wait:0,
            change_cb:onTitleChange
        });  
    };
    
    //@Override
	this.enable = function(){};
	
    //@Override
	this.disable = function(){};    
	
    //@Override
	this.ux = function(__bool){
        if(__bool){
          
        }else{
            
        }
    }; 
    
    //@Override
    this.destroy = function(){
        OGX.Form.unbindField('#new_chapter input');
    };

    this.val = function(){
        return val;
    };

    function onTitleChange(__obj){
        let t;
        if(__obj.valid){
            if(!node.item.items.hasOwnProperty('insert')){
                node.item.items = new OGX.List(node.item.items);
            }
            if(node.item.items.get({title:{eq:__obj.value}}, null, 1)){
                t = 'There is already a chapter with that title !';
                val = null;
                popup.disableButton(0);
            }else{               
                t = 'This looks good and original !';
                val = __obj.value;
                popup.enableButton(0);                              
            }    
            text.html(t);
            popup.enableButton(0);
        }else{             
            t = 'Enter chapter title and hit OK';
            val = null;           
            popup.disableButton(0);
            text.html(t);
        }
    }

};