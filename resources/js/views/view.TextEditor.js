require('Views.TextEditor', 'View');
OGX.Views.TextEditor = function(__config){
    construct(this, 'Views.TextEditor');
	'use strict'; 
    const that = this;

    //@Override
    this.construct = function(__data){
        tinymce.init({
            selector:'textarea#tiny',
            menubar:'',
            toolbar:'undo redo | bold italic | alignleft aligncenter alignright alignjustify | outdent indent',
            resize:false,
            skin:'ogx',
            content_css:'dark',
            setup: function(__ed) {
                __ed.on('keyup', onTextChange);
            }
        });        
    };
    
    //@Override
	this.enable = function(){
        tinymce.activeEditor.mode.set('design');
    };
	
    //@Override
	this.disable = function(){
        tinymce.activeEditor.mode.set('readonly');
    };    
	
    //@Override
	this.ux = function(__bool){
        if(__bool){
          
        }else{
            
        }
    }; 
    
    //@Override
    this.destroy = function(){};

    this.val = function(__string){
        tinymce.activeEditor.setContent(__string);
    };

    function onTextChange(){  
        const content = tinymce.get('tiny').getContent();      
        that.el.trigger('CHANGE', content);
    }

};