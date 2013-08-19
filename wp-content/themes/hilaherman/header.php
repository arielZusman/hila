<!DOCTYPE html>
<!--[if lt IE 7]>      <html class="no-js lt-ie9 lt-ie8 lt-ie7"> <![endif]-->
<!--[if IE 7]>         <html class="no-js lt-ie9 lt-ie8"> <![endif]-->
<!--[if IE 8]>         <html class="no-js lt-ie9"> <![endif]-->
<!--[if gt IE 8]><!--> <html class="no-js"> <!--<![endif]-->
    <head>
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
        <title><?php bloginfo( 'name' ) ?></title>
        <meta name="description" content="">
        <meta name="viewport" content="width=device-width">

        <!-- <link rel="stylesheet" href="<?php echo get_stylesheet_uri(); ?>"> -->
        <link rel="shortcut icon" href="<?php echo get_template_directory_uri(); ?>/favicon.ico" />
        <!--[if lt IE 9]>
            <script src="<?php echo get_template_directory_uri(); ?>/js/html5shiv.js"></script>
        <![endif]-->
        <?php wp_head(); ?>
        <?php 
            /**
            * custom wp_query so we can arrange the posts in columns
            */
            $tag = get_query_var( 'tag' );
            $query = new WP_Query( "tag={$tag}");
            if ( $query->have_posts() ) {
            // how many columns do we need
                $col_count = floor( $query->post_count / 3 );

                if ( $query->post_count % 3 != 0) {
                    $col_count += 1;
                }
                $bodyW = $col_count * 262 +241;                
            }
        ?>
        <style>
            body {
                min-width: <?php echo $bodyW . 'px;' ?>
                /*width: <?php echo $bodyW . 'px;' ?>*/
            }
        </style>

    </head>
    <body class="clearfix">
