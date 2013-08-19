<?php
/**
 * functions and definitions
 *
 */
remove_action( 'wp_head', 'wp_generator' );

/**
 * Add support for Featured image
 * Set size of post thumbnail
 */
if ( function_exists( 'add_theme_support' ) ) {
    add_theme_support( 'post-thumbnails' );
    set_post_thumbnail_size( 242, 155 );
}
add_image_size( 'project', 770, 480, false );

/**
 *  Hide admin bar
 */
add_filter( 'show_admin_bar', '__return_false' );

/**
 * Set the content width based on the theme's design and stylesheet.
 * This is the width of the gallery
 */
if ( ! isset( $content_width ) ) {
    $content_width = 770; /* pixels */
}


/**
 * Add js files in the footer
 */
function hila_scripts() {
    wp_register_script( 'plugins', get_template_directory_uri() . '/js/plugins.js', array ( 'jquery', 'jquery-effects-core' ), false, true );
    wp_register_script( 'main', get_template_directory_uri() . '/js/main.js', array ( 'plugins' ), false, true );


    wp_register_style( 'normalize', get_template_directory_uri() . '/css/normalize.css', '', false, 'all' );
    wp_register_style( 'main', get_template_directory_uri() . '/css/main.css', array ( 'normalize' ), false, 'all' );

    wp_enqueue_script( 'plugins' );
    wp_enqueue_script( 'main' );
    wp_enqueue_script( 'underscore' );
    wp_enqueue_style( 'normalize' );
    wp_enqueue_style( 'main' );

    $wp_vars = array(
        'site_url' => site_url()
    );
    wp_localize_script( 'main', 'wp_vars', $wp_vars );

}
add_action( 'wp_enqueue_scripts', 'hila_scripts', 5 );



/**
 *  Register menu
 */

register_nav_menus( array( 'main-nav' => 'main-nav' ) );

function hila_main_nav() {
    wp_nav_menu( array(
            'theme_location'  => 'main-nav',
            'menu'            => 'main',
            'container'       => false,
            'container_class' => 'nav-main',
            // 'container_id'    => ,
            'menu_class'      => 'menu',
            'menu_id'         => '',
            'echo'            => true,
            'fallback_cb'     => false,
            'before'          => '',
            'after'           => '',
            'link_before'     => '',
            'link_after'      => '',
            'items_wrap'      => '<ul class="%2$s">%3$s</ul>',
            'depth'           => 0,
            'walker'          => '' ) );
}

/**
 * get the tags for the post by id
 * returns the post tags as <a> separated by ', '
 *
 */

if ( !function_exists( 'hila_get_post_tags' ) ) {
    function hila_get_post_tags( $id ) {
        $post_tags = array ();
        $tags = get_the_tags( $id );
        if ( $tags ) {
            foreach ( $tags as $tag ) {
                $tag_link = get_tag_link( $tag->term_id );
                $post_tags[] = '<a href="' . $tag_link .'" rel="tag">' . $tag->name . '</a>';
            }
        }
        $post_tags = implode( ', ', $post_tags );
        return $post_tags;
    }
}

/**
 * Ajax
 */

function get_post_content_ajax() {
    $link = $_GET['link'];

    $postid = url_to_postid ( $link );

    $post = get_post( $postid );


    $args = array (
        'post_type' => 'attachment',
        'posts_per_page' => -1,
        'post_status' =>'any',
        'post_parent' => $post->ID
    );

    $gallery = get_post_gallery( $post->ID, false );
    $gallery = $gallery['src'];
    $total_images = count( $gallery );
    $post_data = array (
        'project_title' => $post->post_title,
        'project_date' => get_post_meta( $post->ID, $key = 'project_date', true ),
        'project_tags' => hila_get_post_tags( $post->ID ),
        'project_content' => strip_shortcodes ( $post->post_content ),
        'project_gallery' => $gallery,
        'total_images' => "{$total_images}"
    );

    $post_data = json_encode( $post_data );
    die( $post_data );

}

function get_about_page() {
    // $link = $_GET['link'];
    $post = get_page_by_title( 'About Me' );
    // var_dump($page);
    // $postid = url_to_postid ( $link );

    // $post = get_post( $postid );
    $post_data = '<div class="wrap-project-close"><span class="js-project-close"></span></div><div class="project-content only-text">' . $post->post_content . '</div>';
    die( $post_data );
}

// creating Ajax call for WordPress
add_action( 'wp_ajax_nopriv_get_post_content_ajax', 'get_post_content_ajax' );
add_action( 'wp_ajax_get_post_content_ajax', 'get_post_content_ajax' );

add_action( 'wp_ajax_nopriv_get_about_page', 'get_about_page' );
add_action( 'wp_ajax_get_about_page', 'get_about_page' );
?>
