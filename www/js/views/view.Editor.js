require('Views.Editor', 'View');
OGX.Views.Editor = function(__config){
    construct(this, 'Views.Editor');
	'use strict'; 
    const view = this;
    const book_default = {_id:'root', type:'root', label:'', items:[]};
    const chapter_default =  {type:'folder', label:'', items:[]};
    let list, tree, text_editor, data;
    let book = null;
    let book_tree = null;
    let chapter = null;

    //@Override
    this.construct = function(__data){
        list = app.cfind('DynamicList', 'list');
        tree = app.cfind('Tree', 'tree');
        text_editor = app.cfind('View', 'text_editor');
        text_editor.disable();
        data = new OGX.List(app.getJSON('data'));
    };
    
    //@Override
	this.enable = function(){};
	
    //@Override
	this.disable = function(){};    
	
    //@Override    
	this.ux = function(__bool){
        if(__bool){
            list.on(OGX.DynamicList.SELECT, selectBook);
            this.on(this.touch.down, '.books .icon_add', createBook)
            this.on(this.touch.down, '.books .icon_remove', removeBook);
            this.on(this.touch.down, '#tree .icon_add', createChapter)
            this.on(this.touch.down, '#tree .icon_remove', removeChapter);
            tree.on(OGX.Tree.SELECT, selectChapter);
            text_editor.on('CHANGE', updateChapter);
        }else{
            list.off(OGX.DynamicList.SELECT, selectBook);
            this.off(this.touch.down, '.books .icon_add', createBook)
            this.off(this.touch.down, '.books .icon_remove', removeBook);
            this.off(this.touch.down, '#tree .icon_add', createChapter)
            this.off(this.touch.down, '#tree .icon_remove', removeChapter);
            tree.off(OGX.Tree.SELECT, selectChapter);
            text_editor.off('CHANGE', updateChapter);
        }
    }; 
    
    //@Override
    this.destroy = function(){};  

    function closePopup(__id){
        app.removeOverlay(false);
        app.removePopup(__id, false);
    }

    /* BOOKS */
    function saveBookList(){
        Neutralino.filesystem.writeFile('www/json/books.json', JSON.stringify(list.val())).then(function(){
            console.log('WRITE SUCCESS');
        }, function(__err){
            console.log('WRITE ERROR', __err);
        });        
    }

    function saveBook(){
        const _id = book._id;
        book = tree.getTree();
        book._id = _id; 
        Neutralino.filesystem.writeFile('www/json/'+book._id+'.json', JSON.stringify(book));
    }

    function createBook(){
        app.addOverlay();
        app.addPopup({
            id: 'pop_new_book',
            title: 'New Book',
            width: '400|50%-',
            height: 240,
            'node:OML':[{
                'default:Views.NewBook':{
                    id: 'new_book',
                    template: 'NewBook',
                    data: data
                }
            }],
            buttons: [
                {label:'OK', enabled:false, callback:addBook}, 
                {label:'CANCEL', callback:closePopup, params:'pop_new_book'}
            ]
        });
    }

    function addBook(){
        const name = app.cfind('View', 'new_book').val();
        closePopup('pop_new_book');
        const id = 'book_'+new Date().getTime();   
        let book = OGX.Data.clone(book_default);    
        book._id = id;
        book.label = name;
        Neutralino.filesystem.writeFile('www/json/'+id+'.json', JSON.stringify(book)).then(function(){
            console.log('WRITE SUCCESS');
        }, function(__err){
            console.log('WRITE ERROR', __err);
        });                
        list.insert(book);
        saveBookList();
    }

    function removeBook(__e){       
        if(book){
            app.addOverlay();
            app.addPopup({
                id: 'pop_confirm',
                title: 'Delete Book?',
                width: '400|50%-',
                height: 200,
                html: '<span class="popup_message">Please confirm you want to delete '+book.label+'. This action cannot be undone.</span>',
                buttons: [
                    {label:'YES', callback:trashBook}, 
                    {label:'CANCEL', callback:closePopup, params:'pop_confirm'}
                ]
            });
        }
    }

    function selectBook(__e, __item){
        book = __item;
        OGX.Net.load('/json/'+__item._id+'.json', (__json) => {
            book_tree = __json;
            tree.setTree(book_tree);            
            chapter = tree.selectItem('root');      
            selectChapter(null, {item:chapter});            
            $('#books .icon_remove').removeClass('off');
            $('#tree').removeClass('off');
            $('#tree > .tree').removeClass('hidden');
        });        
    }

    function updateChapter(__e, __string){
        if(book && chapter && chapter.type !== 'root'){
            tree.updateItem(chapter.item._id, {data:__string}, true);      
            setTimeout(saveBook, 200);    
        }
    }    

    function trashBook(){           
        Neutralino.filesystem.removeFile('./json/'+book._id+'.json');
        list.findDelete('_id', book._id, 1);
        tree.newTree();
        saveBookList();
        book = null;
        book_tree = null;
        chapter = null;           
        closePopup('pop_confirm');
        $('#books .icon_remove').addClass('off');
        $('#tree').addClass('off');
        $('#tree > .tree').addClass('hidden');
    }    

    /* CHAPTER */
    function selectChapter(__e, __node){
        chapter = __node;         
        if(chapter.item.type !== 'root'){
            if(__node.item.hasOwnProperty('data')){            
                text_editor.val(chapter.item.data);       
            }else{
                text_editor.val('');  
            }
            text_editor.enable();
            $('#text_editor').removeClass('off');  
            $('#tree .icon_remove').removeClass('off');
        }else{
            text_editor.val('');  
            text_editor.disable();
            $('#text_editor').addClass('off');  
            $('#tree .icon_remove').addClass('off');
        }      
        $('#tree .icon_add').removeClass('off');            
    }

    function createChapter(){
        if(book && book_tree && chapter){
            app.addOverlay();
            app.addPopup({
                id: 'pop_new_chapter',
                title: 'New Chapter',
                width: '400|50%-',
                height: 240,                
                'node:OML':[{
                    'default:Views.NewChapter':{
                        id: 'new_chapter',
                        template: 'NewChapter',
                        data: chapter
                    }
                }],               
                buttons: [
                    {label:'OK', enabled:false, callback:addChapter}, 
                    {label:'CANCEL', callback:closePopup, params:'pop_new_chapter'}
                ]
            });
        }
    }

    function addChapter(){
        const title = app.cfind('View', 'new_chapter').val();
        closePopup('pop_new_chapter');
        const id = 'chapter_'+new Date().getTime();  
        let chapter = OGX.Data.clone(chapter_default);    
        chapter.label = title;
        chapter._id = id;
        tree.addItem(chapter);
    }

    function removeChapter(){
        if(book && chapter){
            app.addOverlay();
            app.addPopup({
                id: 'pop_confirm',
                title: 'Delete Chapter?',
                width: '400|50%-',
                height: 200,
                html: '<span class="popup_message">Please confirm you want to delete '+chapter.item.label+'. This action cannot be undone.</span>',
                buttons: [
                    {label:'YES', callback:trashChapter}, 
                    {label:'CANCEL', callback:closePopup, params:'pop_confirm'}
                ]
            });
        }
    }

    function trashChapter(){
        closePopup('pop_confirm');
        tree.deleteItem(chapter.item._id);
        text_editor.val('');  
        text_editor.disable();      
        $('#tree .icon_remove').addClass('off');     
        $('#text_editor').addClass('off');  
    }
};