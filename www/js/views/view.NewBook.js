require('Views.NewBook', 'View');
OGX.Views.NewBook = function(__config){
    construct(this, 'Views.NewBook');
	'use strict'; 
    const books = __config.data;
    let popup, text;
    let val = null;

    //@Override
    this.construct = (__data) => {   
        popup = app.findPopup(this);
        text = $('#new_book > .text');
        OGX.Form.bindField({
            el: '#new_book input',
            allowed: /[a-zA-Z0-9 ]/,
            validate:true,
            wait:0,
            change_cb:onNameChange
        });  
    };   
    
    //@Override
    this.destroy = () => {
        OGX.Form.unbindField('#new_book input');
    };

    this.val = () => {
        return val;
    };

    function onNameChange(__obj){
        let t;
        if(__obj.valid){
            if(books.get({name:{eq:__obj.value}}, null, 1)){
                t = 'There is already a book with that name !';
                val = null;
                popup.disableButton(0);
            }else{               
                t = 'This looks good and original !';
                val = __obj.value;
                popup.enableButton(0);                              
            }    
            text.html(t);
        }else{             
            t = 'Enter book name and hit OK';
            val = null;           
            popup.disableButton(0);
            text.html(t);
        }
    }

};