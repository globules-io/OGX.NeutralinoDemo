require('Views.TextEditor', 'View');
OGX.Views.TextEditor = function(__config){
    construct(this, 'Views.TextEditor');
	'use strict'; 

    //@Override
    this.construct = function(__data, __route_data){
        tinymce.init({
            selector:'textarea#tiny',
            menubar:'',
            toolbar:'undo redo | bold italic | alignleft aligncenter alignright alignjustify | outdent indent',
            resize:false,
            skin:'ogx',
            content_css:'dark',
            setup:function(ed) {
                ed.on('keyup', onTextChange);
            }
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
    this.destroy = function(){};

    function onTextChange(){       
        const content = tinymce.get('tiny').getContent();       
    }

};