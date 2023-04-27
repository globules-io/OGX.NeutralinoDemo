require('Views.Editor', 'View');
OGX.Views.Editor = function(__config){
    construct(this, 'Views.Editor');
	'use strict'; 
    const view = this;
    const book_default = {_id:'root', type:'root', label:'', items:[]};
    const chapter_default =  {type:'folder', label:'', items:[]};
    const backup_interval = 24*60*60;
    let list, tree, text_editor;
    let books = null;
    let book = null;
    let book_tree = null;
    let chapter = null;

    //@Override
    this.construct = (__data) => {
        initData();
        list = app.cfind('DynamicList', 'list');
        tree = app.cfind('Tree', 'tree');
        text_editor = app.cfind('View', 'text_editor');
        text_editor.disable();
        setTimeout(() => {$('body').removeClass(('loading'))}, 1000);
    }; 
	
    //@Override    
	this.ux = (__bool) => {
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

    function closePopup(__id){
        app.removeOverlay(false);
        app.removePopup(__id, false);
    }

    /* BOOKS */
    function saveBookList(){
        Neutralino.filesystem.writeFile('./books.json', JSON.stringify(list.val()));        
    }

    function saveBook(){        
        const _id = book._id;
        book = tree.getTree();
        book._id = _id; 
        Neutralino.filesystem.writeFile('./'+book._id+'.json', JSON.stringify(book));       
    }

    function backupBook(){
        const b = list.val().get({_id:{eq:book._id}}, null, 1);
        if(!b.hasOwnProperty('unix') || moment().unix() - b.unix > backup_interval){
            b.unix = moment().unix();
            saveBookList();
            book = tree.getTree();
            book._id = b._id; 
            Neutralino.filesystem.writeFile('./backup/'+book._id+'_'+b.unix+'.json', JSON.stringify(book));     
        }       
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
                    data: list.val()
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
        book.unix = moment().unix();
        Neutralino.filesystem.writeFile('./'+id+'.json', JSON.stringify(book));                
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
        Neutralino.filesystem.readFile('./'+__item._id+'.json').then((__json) => {
            book_tree = JSON.parse(__json);
            tree.setTree(book_tree);            
            chapter = tree.selectItem(book_tree._id);      
            selectChapter(null, {item:chapter});      
            backupBook();
            $('#books .icon_remove').removeClass('off');
            $('#tree').removeClass('off');
            $('#tree > .tree').removeClass('hidden');
        }); 
    }

    function updateChapter(__e, __string){
        if(book && chapter && chapter.type !== 'root'){
            tree.updateItem(chapter.item._id, {data:__string}, true);      
            backupBook();
            setTimeout(saveBook, 200);    
        }
    }    

    function trashBook(){           
        Neutralino.filesystem.removeFile('./'+book._id+'.json');
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
        backupBook();
        saveBook();
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

    /* DATA */
    function initData(){   
        //backup folder   
        Neutralino.filesystem.getStats('./backup')
        .then(() => {            
        }, (__error) => {
            if(__error.code === 'NE_FS_NOPATHE'){
                Neutralino.filesystem.createDirectory('./backup');
            }
        })
        .catch(__error => {console.log(__error);});     

        //backup book list   
        Neutralino.filesystem.getStats('./books.json')
        .then(() => {
            Neutralino.filesystem.readFile('./books.json')
            .then(__json => {
                books = new OGX.List(JSON.parse(__json));
                list.val(books);
            }) 
            .catch(__error => {console.log(__error);});  
        }, (__error) => {
            if(__error.code === 'NE_FS_NOPATHE'){
                Neutralino.filesystem.writeFile('./books.json', '[]');
            }
        })
        .catch(__error => {console.log(__error);});        
    }
};