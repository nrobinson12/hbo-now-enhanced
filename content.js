new MutationObserver(function(mutations) {
    mutations.forEach((mutation) => {
        
        // change grey background/bars to black
        $('div.default').filter(function() {
            return $(this).css('background-color') == 'rgb(15, 15, 15)';
        }).css('background-color', 'rgb(0, 0, 0)');

    });
}).observe(document.body, {childList: true, subtree: true});
