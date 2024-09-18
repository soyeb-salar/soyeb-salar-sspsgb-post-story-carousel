<?php
/**
 * Plugin Name: Post Story Carousel Gutenberg Block
 * Description: A Gutenberg block that displays a carousel of posts as story cards.
 * Version: 1.0
 * Author: Soyeb Salar
 * Author URI: https://www.linkedin.com/in/soyebsalar/
 * License: GPLv2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: sspsgb-post-story-carousel
 * Donate link: https://www.soyebsalar.in/donate/
 */

defined('ABSPATH') || exit;

define("SSPSGB_PLUGIN_PATH", plugin_dir_path(__FILE__));
define("SSPSGB_PLUGIN_URL", plugin_dir_url(__FILE__));
define("SSPSGB_PLUGIN_BASENAME", plugin_basename(__FILE__));

function sspsgb_enqueue_block_editor_assets()
{
    wp_enqueue_script(
        'sspsgb-block', SSPSGB_PLUGIN_URL . 'build/index.js', array('wp-blocks', 'wp-element', 'wp-editor', 'wp-components'),
        filemtime(SSPSGB_PLUGIN_PATH . 'build/index.js'), true
    );

    wp_enqueue_style(
        'sspsgb-editor-style', SSPSGB_PLUGIN_URL . 'src/editor.css', array('wp-edit-blocks'), filemtime(SSPSGB_PLUGIN_PATH . 'src/editor.css')
    );
// Get all public post types
    $post_types = get_post_types(array('public' => true), 'objects');
    $post_type_options = array();

    // Filter out unwanted post types, like 'attachment'
    foreach ($post_types as $post_type) {
        if ('attachment' === $post_type->name) {
            continue;
        }
        $post_type_options[] = array(
            'label' => $post_type->labels->singular_name,
            'value' => $post_type->name,
        );
    }

    // Pass post types to the block's JavaScript
    wp_localize_script('sspsgb-block', 'sspsgbPostTypes', $post_type_options);

    wp_localize_script('sspsgb-block', 'sspsgbpPath', SSPSGB_PLUGIN_URL);

}
add_action('enqueue_block_editor_assets', 'sspsgb_enqueue_block_editor_assets');

function sspsgb_enqueue_block_assets()
{
    wp_enqueue_style(
        'sspsgb-style', SSPSGB_PLUGIN_URL . 'build/style-index.css', array(), filemtime(SSPSGB_PLUGIN_PATH . 'build/style-index.css')
    );
    wp_enqueue_script(
        'sspsgb-scrolling-functions', SSPSGB_PLUGIN_URL . 'src/scrolling-functions.js', array("jquery"), '1.0', true);

}
add_action('enqueue_block_assets', 'sspsgb_enqueue_block_assets');

function sspsgb_register_block()
{
    register_block_type('sspsgb/post-carousel', array(
        'editor_script' => 'sspsgb-block',
        'editor_style' => 'sspsgb-editor-style',
        'style' => 'sspsgb-style',
        'render_callback' => 'sspsgb_render_post_carousel',
    ));
}
add_action('init', 'sspsgb_register_block');

function sspsgb_image_custom_size($customImageWidth, $customImageHeight)
{
    $customStyle = ';width: ' . $customImageWidth . 'px; height: ' . $customImageHeight . 'px;min-width: ' . $customImageWidth . 'px;min-height: ' . $customImageHeight . 'px;';
    return $customStyle;
}

function sspsgb_get_image_size_dimensions($size_name)
{
    $dimensions = array('width' => null, 'height' => null);

    // Check for default sizes
    if (in_array($size_name, get_intermediate_image_sizes())) {
        $dimensions['width'] = get_option("{$size_name}_size_w");
        $dimensions['height'] = get_option("{$size_name}_size_h");
    }
    // Check for custom sizes
    else {
        global $_wp_additional_image_sizes;
        if (isset($_wp_additional_image_sizes[$size_name])) {
            $dimensions['width'] = $_wp_additional_image_sizes[$size_name]['width'];
            $dimensions['height'] = $_wp_additional_image_sizes[$size_name]['height'];
        }
    }

    return $dimensions;
}
function sspsgb_render_post_carousel($attributes)
{
    // Extract attributes
    $numberOfPosts = isset($attributes['numberOfPosts']) ? intval($attributes['numberOfPosts']) : 7;
    $postType = isset($attributes['postType']) ? sanitize_text_field($attributes['postType']) : 'post';
    $category = isset($attributes['category']) ? sanitize_text_field($attributes['category']) : '';
    $fontSize = isset($attributes['fontSize']) ? sanitize_text_field($attributes['fontSize']) : '14px';
    $fontFamily = isset($attributes['fontFamily']) ? sanitize_text_field($attributes['fontFamily']) : 'Arial';
    $fontColor = isset($attributes['fontColor']) ? sanitize_hex_color($attributes['fontColor']) : '#fff';
    $lineHeight = isset($attributes['lineHeight']) ? sanitize_text_field($attributes['lineHeight']) : '1';
    $subtitleLength = isset($attributes['subtitleLength']) ? intval($attributes['subtitleLength']) : 50;
    $paddingTop = isset($attributes['paddingTop']) ? sanitize_text_field($attributes['paddingTop']) : '10px';
    $paddingRight = isset($attributes['paddingRight']) ? sanitize_text_field($attributes['paddingRight']) : '10px';
    $paddingBottom = isset($attributes['paddingBottom']) ? sanitize_text_field($attributes['paddingBottom']) : '10px';
    $paddingLeft = isset($attributes['paddingLeft']) ? sanitize_text_field($attributes['paddingLeft']) : '10px';
    $marginTop = isset($attributes['marginTop']) ? sanitize_text_field($attributes['marginTop']) : '0px';
    $marginRight = isset($attributes['marginRight']) ? sanitize_text_field($attributes['marginRight']) : '0px';
    $marginBottom = isset($attributes['marginBottom']) ? sanitize_text_field($attributes['marginBottom']) : '0px';
    $marginLeft = isset($attributes['marginLeft']) ? sanitize_text_field($attributes['marginLeft']) : '0px';
    $imageSize = isset($attributes['imageSize']) ? sanitize_text_field($attributes['imageSize']) : 'medium';
    $customImageWidth = isset($attributes['customImageWidth']) ? intval($attributes['customImageWidth']) : 175;
    $customImageHeight = isset($attributes['customImageHeight']) ? intval($attributes['customImageHeight']) : 350;
    $descriptionFontSize = isset($attributes['descriptionFontSize']) ? sanitize_text_field($attributes['descriptionFontSize']) : '12px';
    $descriptionFontColor = isset($attributes['descriptionFontColor']) ? sanitize_text_field($attributes['descriptionFontColor']) : '#fff';
    $cardSpace = isset($attributes['cardSpace']) ? intval($attributes['cardSpace']) : 5;

    // Query posts
    $queryArgs = array(
        'post_type' => $postType,
        'posts_per_page' => $numberOfPosts,
        'post_status' => 'publish',
    );

    if ($category) {
        $queryArgs['category_name'] = $category;
    }

    $query = new WP_Query($queryArgs);

    if (!$query->have_posts()) {
        return '<p>No posts available.</p>';
    }

    // Render posts
    $output = '<div class="sspsgb-carousel" style="padding: ' . esc_attr($paddingTop) . 'px ' . esc_attr($paddingRight) . 'px ' . esc_attr($paddingBottom) . 'px ' . esc_attr($paddingLeft) . '; margin: ' . esc_attr($marginTop) . 'px ' . esc_attr($marginRight) . 'px ' . esc_attr($marginBottom) . ' ' . esc_attr($marginLeft) . 'px;">';
    $output .= '<div class="sspsgb-story-container">';

    while ($query->have_posts()) {
        $query->the_post();
        $title = get_the_title();
        $permalink = get_permalink();
        $description = get_the_excerpt();
        $shortDescription = wp_trim_words($description, $subtitleLength, '...');
        $author_id = get_the_author_meta('ID');
        $author_logo_url = get_avatar_url($author_id);

        // Handle custom image size
        if ($imageSize === 'custom' && $customImageWidth && $customImageHeight) {
            $thumbnailUrl = get_the_post_thumbnail_url(get_the_ID(), array($customImageWidth, $customImageHeight));
            $customStyle = sspsgb_image_custom_size($customImageWidth, $customImageHeight);
        } else {
            $thumbnailUrl = get_the_post_thumbnail_url(get_the_ID(), $imageSize);
            $dimensions = sspsgb_get_image_size_dimensions($imageSize);
            $customImageWidth = $dimensions['width'];
            $customImageHeight = $dimensions['height'];
            $customStyle = sspsgb_image_custom_size($customImageWidth, $customImageHeight);
        }

        if (empty($thumbnailUrl)) {
            $thumbnailUrl = SSPSGB_PLUGIN_URL . 'assets/img/default-story.jpg';
        }

        $output .= '<div class="sspsgb-story-card" style="background-image: url(\'' . esc_url($thumbnailUrl) . '\');' . $customStyle . ';margin:' . $cardSpace . 'px">';
        $output .= '<a href="' . esc_url($permalink) . '" class="sspsgb-story-info">';
        $output .= '<img src="' . esc_url($author_logo_url) . '" alt="User Logo" class="sspsgb-user-logo">';
        $output .= '<div class="sspsgb-story-title" style="font-size: ' . esc_attr($fontSize) . 'px; font-family: ' . esc_attr($fontFamily) . '; color: ' . esc_attr($fontColor) . '; line-height: ' . esc_attr($lineHeight) . ';">' . esc_html($title) . '</div>';
        $output .= '</a>';
        $output .= '<div class="sspsgb-story-description" style="font-size: ' . esc_attr($descriptionFontSize) . 'px; font-family: ' . esc_attr($fontFamily) . '; color: ' . esc_attr($descriptionFontColor) . '; line-height: ' . esc_attr($lineHeight) . ';">' . esc_html($shortDescription) . '</div>';
        $output .= '</div>';
    }

    wp_reset_postdata();

    $output .= '</div>';
    $output .= '<div class="sspsgb-arrow sspsgb-left">&#8249;</div>';
    $output .= '<div class="sspsgb-arrow sspsgb-right">&#8250;</div>';
    $output .= '</div>';

    return $output;
}
