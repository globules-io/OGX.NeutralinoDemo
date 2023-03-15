require('Views.TextEditor', 'View');
OGX.Views.TextEditor = function(__config){
    construct(this, 'Views.TextEditor');
	'use strict'; 
    const that = this;
    let to = null;

    //@Override
    this.construct = function(__data){
        tinymce.init({
            selector:'textarea#tiny',
            menubar:'',
            toolbar:'undo redo | bold italic | alignleft aligncenter alignright alignjustify | outdent indent | numlist bullist | codesample customimage',
            resize:false,
            skin:'ogx',
            content_css:'dark',
            plugins: 'lists codesample',
            setup: function(__ed) {
                __ed.on('keyup', onTextChange);
                __ed.ui.registry.addButton('customimage', {
                    icon:'image',
                    onAction:selectImage
                });
            }
        });   
    };
    
    //@Override
	this.onFocus = function(){
        tinymce.activeEditor.mode.set('design');
    };
	
    //@Override
	this.onBlur = function(){
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
        if(to){
            clearTimeout(to);
        }
        to = setTimeout(() => {
            const content = tinymce.get('tiny').getContent();      
            that.el.trigger('CHANGE', content);
        }, 50);        
    }
   
    function selectImage(){
       Neutralino.os.showOpenDialog('Select Image', {
            defaultPath: '',
            filters: [
                {name: 'Images', extensions: ['jpg', 'png']}
            ]
        }).then((__data) => {
            Neutralino.filesystem.readBinaryFile(__data[0]).then((__buffer) => {
                const blob = new Blob([__buffer], { type: 'image/'+ __data[0].split('.').pop()});
                var reader = new FileReader();
                reader.onload = function(__e){
                    const dataurl = __e.target.result;
                    const b64 = dataurl.substr(dataurl.indexOf(',')+1);
                    const img = new Image();   
                    img.onload = function(){  
                        tinymce.activeEditor.insertContent('<img src="data:image/png;base64,'+b64+'" width="'+img.width+'" height="'+img.height+'">');   
                        onTextChange();                            
                    };  
                    img.src = dataurl;                        
                 };
                reader.readAsDataURL(blob);                               
            }, (__error) => {console.log('ERR', __error)}).catch(__error => {console.log('Error', __error);});  
        });
    }     

};