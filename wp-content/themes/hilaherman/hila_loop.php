<?php

/**
 * custom wp_query so we can arrange the posts in columns
 */
$tag = get_query_var( 'tag' );
$query = new WP_Query( "tag={$tag}" );

define( 'TMPL_DIR', get_template_directory_uri() );


if ( $query->have_posts() ) {
    // how many columns do we need
    $col_count = floor( $query->post_count / 3 );

    if ( $query->post_count % 3 != 0 ) {
        $col_count += 1;
    }

    $output = "";
    for ( $j=0; $j < $col_count; $j++ ) {
        // if ( $j == 0 ) {
        //     // first col needs special style
        //     $output .= '<div class="col first">';
        // } else {
        //     $output .= '<div class="col">';
        // }

        $output .= '<div class="col-' . ($j + 1) . '" >';

        $i = 0; // counter for posts inside the col max is 3

        while ( $query->have_posts() && $i<3 ) {
            $query->the_post();

            $post_tags = hila_get_post_tags( get_the_ID() );

            // start building the thumbnail
            $output .= '<article class="thumbFrame">';
            $output .= '<div class="thumbImg">';
            if ( has_post_thumbnail() ) {
                $output .= get_the_post_thumbnail();
            } else {
                $output .= '<img src="' . TMPL_DIR . '/img/one_px_bg.png" width="242" height="155"/>';
            }
            $output .= '<a class="js-project-link" href="' . get_permalink() . '">';
            $output .= '<img class="hoverProjectLayer" src="' . TMPL_DIR . '/img/hoverProjectLayer.png" width="242" height="155"/>';
            $output .= '</a></div>';
            $output .= '<header class="post">';
            $output .= '<h2 class="thumb-title"><a class="js-thumb-title" href="' . get_permalink() . '">' . get_the_title() . '</a></h2>';
            $output .= '<p class="tagList">' . $post_tags . '</p>';
            $output .= '</header><!-- .post -->';
            $output .= '</article><!-- .thumbFrame -->';

            $i++;
        }

        $output .= '</div><!-- .col -->';
    }
    echo $output;
}
wp_reset_postdata();
