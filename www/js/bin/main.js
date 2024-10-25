var app;
$(document).ready(function(){	    
    Neutralino.init();
    Neutralino.events.on('windowClose', () => {
        Neutralino.app.exit();
    });    
    Neutralino.events.on("serverOffline", () => {        
        window.location.reload();
    });
    app = new OGX.App({encrypted:false});
});