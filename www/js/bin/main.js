var app;
$(document).ready(function(){	    
    Neutralino.init();
    Neutralino.events.on('windowClose', () => {
        Neutralino.app.exit();
    });    
    app = new OGX.App({encrypted:false});
});