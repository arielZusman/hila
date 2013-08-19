var $j = jQuery;

// define constants for frequent values
var NAV_W = 241;
var OPEN_W = 820;

var projectTemplate = [ '<div class="previous-image js-previous"></div>',
        '<div id="js-slider" class="slider">','<%= project_gallery %>',
        '</div><!-- .slider -->',
    '<div class="next-image js-next"></div>',
    '<div class="wrap-project-close">',
    '<span class="js-project-close"></span></div>',
    '<div class="project-header">',
        '<h1 class="project-title"><%= project_title %></h1>',
        '<div class="project-info">',
            '<span class="project-date"><%= project_date %></span>',
            '<p class="tagList"><%= project_tags %></p>',
        '</div><!-- .project-info -->',
    '</div><!-- .project-header -->',
    '<nav class="slider-nav">',
        '<div class="counter">',
            '<span id="js-current-image">1</span>/',
            '<span id="js-total-images"><%= total_images %></span></div>',
            '<span class="previous js-previous"></span>',
            '<span class="next js-next"></span>',
            '<span class="js-project-close project-close"></span>',
    '</nav><!-- .content-nav -->',
    '<div class="project-content"><%= project_content %></div><!-- .project-content -->'
].join("\n");

var slider = {
    
    init: function(){
        // this.maxImages = parseInt($j('#js-total-images').html(),10);
        this.currentImage = $j('#js-current-image'); // image number 
        this.gallery = $j('#js-slider img');
        this.imgIndex = 0;
        
        // start preloading the images
        // $j('.preload').imageloader();
        
        // add numbers so we can find the image like .image-1
        for (var i=0; i<slider.maxImages; i++) {
            $j(slider.gallery[i]).addClass("image-"+i);
        }
        $j('#js-slider img').eq(0).css('display', 'inline');

        // Hook event handler
        $j('.js-next,.js-previous').off();
        $j('.js-next').on('click', {action : "next"}, slider.setIndex);
        $j('.js-previous').on('click', {action : "prev"}, slider.setIndex);
        
    },
    setIndex: function(e) {
        if ( e.data.action == 'next' ) {
            if ( slider.imgIndex < (slider.maxImages -1)) {
                slider.imgIndex++;
            } else {
                slider.imgIndex = 0;
            }
        } else if ( e.data.action == 'prev' ) {
            if ( slider.imgIndex > 0 ) {
                slider.imgIndex--;
            } else {
                slider.imgIndex = slider.maxImages - 1;
            }
        }
        slider.currentImage.html(slider.imgIndex+1);
        slider.show();
    },
    show: function() {
        slider.gallery.fadeOut(1000);
        $j('.image-' + slider.imgIndex).fadeIn(1000);
    },
    destroy : function () {
        delete slider.maxImages;
        delete slider.currentImage;
        delete slider.gallery;
        delete slider.imgIndex;
    }

};

var project = {
    init: function () {
        this.mainWrap = $j('#js-main-wrap'); // this wraps the both the open project and thumbs
        this.wrap = $j('.project-wrapper'); // this wraps only the project
        this.bigSeprator = $j('.big-sperator');
        this.bodyWidth = $j('body').width();
        this.isOpen = false;

        // Hook event handler        
        project.wrap.on('click','span.js-project-close', project.close);
        
    },

    setup: function() {
        var body = $j('body');
        if ( body.scrollLeft() > 0 ) {
            body.animate({
                scrollLeft: 0
            }, 250, 'easeOutQuad', project.open);
        } else {
            project.open();
        }
    },

    open: function () {
        
        var w = project.mainWrap.width();
        $j('body').css('min-width', w + 300);

        project.bigSeprator.css('visibility', 'visible');
        project.wrap.animate({
            opacity: 1
        },{
            duration: 400
        });

        project.mainWrap.animate({
            marginLeft: '0px'
        },{
            duration: 750,
            easing: 'easeOutQuad',
            complete: function(){
                $j(this).css({
                    visibility: 'visible',
                    opacity: 1
                });
                project.isOpen = true;
                thumbs.setNavPosition();
            }
        });
    },
    close: function () {
        var bodyWidth = $j('body').width();
        console.log(bodyWidth);
        project.wrap.animate({
            opacity: 0
        },400);
        project.mainWrap.animate({
            // opacity: '0',
            marginLeft: '-875px'
        },{
            duration: 750,
            easing: 'easeOutQuad',
            complete: function(){
                // $j('body').css('min-width',project.bodyWidth - 300);
                $j('body').css('min-width',bodyWidth - 820);
                // $j('body').css('width', '1387px');
                project.isOpen = false;
                thumbs.setNavPosition();
            }
        });
    }
};

var thumbs = {
    init: function() {
        this.navRight = $j('#js-nav-right');
        this.navLeft = $j('#js-nav-left');
        this.contentW = $j('.thumbs-wrapper').width() + NAV_W - 60;
        this.viewport = $j(window);

        thumbs.setNavPosition();
        // Hook events    
        thumbs.viewport.on({
            resize: thumbs.setNavPosition,
            scroll: thumbs.setNavPosition
        });
        thumbs.navRight.on('click', 'span', thumbs.scrlRight);
        thumbs.navLeft.on('click', 'span', thumbs.scrlLeft);
        
    },
    setNavPosition : function (e) {
        var viewport = $j(window);
            
        // project is open and we can see part of the thumbnails and it's not scrolled
        // all the way to the right
        var isInView = false;
        var col = $j("[class|='col']");
        var count = col.length;
        
        // check which col are in view or not put them in array
                
        var i = 0;
        while ( !isInView && i < count) {
            isInView = thumbs.isInView(col[i], true);
            i++;
        }

        if  ( project.isOpen &&
              isInView &&
              viewport.scrollLeft() + viewport.width() < thumbs.contentW + 820 + 50
              // thumbs.navRight.offset().left < thumbs.contentW + 820 - 50
              ) {
            thumbs.navRight.offset({
                left: viewport.scrollLeft() + viewport.width() - 50,
                top: 50
            }).css('display', 'block');
        } else if ( !project.isOpen &&
                    // thumbs.contentW - 100 > viewport.width()
                    viewport.scrollLeft() + viewport.width() < thumbs.contentW
                 ) {
            // project is closed the content width is larger then viewport        
            thumbs.navRight.offset({
                left: viewport.scrollLeft() + viewport.width() - 50,
                top: 50
            }).css('display', 'block');
        } else {
            // we have enough space don't need the navigation
            thumbs.navRight.css('display','none');
        }

        if ( col.eq(0).offset().left < viewport.scrollLeft()) {
            thumbs.navLeft.offset({
                left: viewport.scrollLeft(),
                top: 50
            }).css('display', 'block');
        } else {
            thumbs.navLeft.css('display', 'none');
        }

    },
    scrlRight: function() {
        /*
            find which is the most left col that is in view
            find the first right col that not in view
        */
        var isInView = [];
        var col = $j("[class|='col']");
        var count = col.length;
        
        // check which col are in view or not put them in array
        for ( var i = 0; i < count; i++) {
            isInView.push( thumbs.isInView(col[i], false) );
        }
        
        // find the first col that isn't in view
        
        
        var colNum = isInView.lastIndexOf(true) + 1;
        var last = col[colNum];

        if (typeof last !== 'undefined') {
            $j.scrollTo(last, {
                axis: 'x',
                offset: {left: -50, top: 0},
                duration: 400,
                easing: 'easeOutQuad'
            });
        }
    },
    scrlLeft: function() {
        var isInView = [];
        var col = $j("[class|='col']");
        var count = col.length;
        
        // check which col are in view or not put them in array
        for ( var i = 0; i < count; i++) {
            isInView.push(thumbs.isInView(col[i], false));
        }

        
        var colNum = isInView.indexOf(true) - 1;
        var last = col[colNum];
        if (typeof last !== 'undefined') {
            $j.scrollTo(last, {
                axis: 'x',
                offset: {left: -50, top: 0},
                duration: 400,
                easing: 'easeOutQuad'
            });
        }
    },
    isInView: function (elem, partial) {
        var docViewLeft = thumbs.viewport.scrollLeft();
        var docViewRight = docViewLeft + thumbs.viewport.width();

        var elemLeft = $j(elem).offset().left; // L <--
        var elemRight = elemLeft + $j(elem).width(); // --> R
        
        return ((elemRight >= docViewLeft || partial ) && (elemLeft <= docViewRight) &&
            (elemRight <= docViewRight || partial) &&  (elemLeft >= docViewLeft) );
        
    }

};


jQuery(document).ready(function($) {


    // calc body height to fit project text
    var bodyHeight = $('body').height();
    var bodyWidth = $('body').width();
    
    $('.nav-main').height(bodyHeight-50);
    
    thumbs.init();

    project.init();

    $('.js-project-link, .js-thumb-title').click(function(e) {
        e.preventDefault();
        var link = $(this)[0].href;
        var parsedTemplate = "";
        $.ajax({
            url: wp_vars.site_url + '/wp-admin/admin-ajax.php',
            type: 'GET',
            dataType: 'json',
            data: { action: 'get_post_content_ajax', link: link},
            success: function (data) {
                // $('.project-wrapper').empty();
                
                var count = parseInt(data.total_images,10);
                slider.maxImages = count;
                var gallery = "";
                for ( var i=0; i < count; i++ ) {
                    gallery += '<img src="' + data.project_gallery[i] + '" alt="project image" width="770" height="480" class="preload"/>';
                }
                data.project_gallery = gallery;
                parsedTemplate = _.template( projectTemplate, data);
            },
            complete: function(){
                if ( project.isOpen ) {
                    // project.wrap.css('opacity', '0');

                    project.wrap.animate({opacity: 0}, {
                        duration: 400,
                        done: function() {
                            project.wrap.html(parsedTemplate);
                            project.setup();
                            slider.init();
                        }
                    });
                     
                } else {
                    project.wrap.html(parsedTemplate);
                    project.setup();
                    slider.init();
                }
                // project.wrap.html(parsedTemplate);
                
            }
        });
    });

    $('.menu-about').click(function(e) {
        
        e.preventDefault();
        var link = $(this)[0].href;
        var parsedTemplate = "";
        $.ajax({
            url: wp_vars.site_url + '/wp-admin/admin-ajax.php',
            type: 'GET',
            dataType: 'html',
            data: { action: 'get_about_page', link: link },
            success: function (data) {
                parsedTemplate = data;
            },
            complete : function () {
                if ( project.isOpen ) {
                    project.wrap.animate(
                        {opacity: 0}, 500,
                        function () {
                            project.wrap.html(parsedTemplate);
                            project.setup();
                        }
                    );
                } else {
                    project.wrap.html(parsedTemplate);
                    project.setup();
                }
                
            }
        });
    });
    


});