<?php get_header(); ?>
<?php get_sidebar(); ?>


<div id="js-main-wrap" class="main-wrapper clearfix">
    <article class="project-wrapper">
    </article><!-- .project-wrapper -->    
    
    <div class="thumbs-wrapper">
        <div class="thumbs-nav left" id="js-nav-left"><span></span></div>
        <img class="big-sperator" src="<?php echo get_template_directory_uri(); ?>/img/blackSeperatorLine.png" width="5" height="713"/>
        
        <?php get_template_part( 'hila_loop' ); ?>
        
        <div class="thumbs-nav right" id="js-nav-right"><span></span></div>    
    </div><!-- .thumbs-wrapper -->    
</div><!-- .main-wrapper -->

<?php get_footer(); ?>
