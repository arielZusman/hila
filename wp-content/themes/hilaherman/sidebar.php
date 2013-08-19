<nav class="nav-main">
    <a href="<?php echo get_site_url(); ?>">
        <img class="logo" src="<?php echo get_template_directory_uri(); ?>/img/LOGO.png" width="116" height="196" alt="logo"></a>
    
    <?php hila_main_nav(); ?>    
    
    <span class="menu-seprator"></span>
    
    <a class="menu-about" href="<?php echo site_url( 'about' ); ?>">About me</a>

    <span class="menu-seprator"></span>
    
    <address class="contact-info">
        <a class="link email" href="mailto:hchila@gmail.com">hchila@gmail.com</a><br/>
        <a class="link tel" href="tel:+972524816661">972.52.4816661</a>    
    </address><!-- .contact-info -->        
</nav><!-- .nav-main -->
