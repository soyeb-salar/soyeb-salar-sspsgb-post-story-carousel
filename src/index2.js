import { __ } from '@wordpress/i18n';
import { useBlockProps, InspectorControls, ColorPalette } from '@wordpress/block-editor';
import { PanelBody, RangeControl, SelectControl, TextControl } from '@wordpress/components';
import { useEffect, useState } from '@wordpress/element';
import '../src/editor.css';
import '../src/style.css';

// Define default font colors
const FONT_COLORS = [
    { color: '#000000', name: 'Black' },
    { color: '#FFFFFF', name: 'White' },
    { color: '#FF0000', name: 'Red' },
    // Add more colors as needed
];

function stripHtmlTags(html) {
    var doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || "";
}

// Function to fetch media details
const fetchMedia = async (mediaId) => {
    try {
        const response = await fetch(`${wpApiSettings.root}wp/v2/media/${mediaId}`, {
            headers: {
                'Content-Type': 'application/json',
                'X-WP-Nonce': wpApiSettings.nonce,
            },
        });
        if (!response.ok) throw new Error('Network response was not ok.');
        return await response.json();
    } catch (error) {
        console.error('Fetching media failed:', error);
        return null;
    }
};

const fetchAvatar = async (authorId) => {
    try {
        const response = await fetch(`${wpApiSettings.root}wp/v2/users/${authorId}`, {
            headers: {
                'Content-Type': 'application/json',
                'X-WP-Nonce': wpApiSettings.nonce,
            },
        });
        if (!response.ok) throw new Error('Network response was not ok.');
        return await response.json();
    } catch (error) {
        console.error('Fetching author avatar failed:', error);
        return null;
    }
};

// Register block type
wp.blocks.registerBlockType('sspsgb/post-carousel', {
    title: __('Post Story Carousel', 'sspsgb'),
    icon: 'slides',
    category: 'layout',
    attributes: {
        numberOfPosts: { type: 'number', default: 7 },
        postType: { type: 'string', default: 'post' },
        category: { type: 'string', default: '' },
        fontSize: { type: 'number', default: 14 },
        fontFamily: { type: 'string', default: 'Arial' },
        fontColor: { type: 'string', default: '#ffffff' },
        lineHeight: { type: 'number', default: 1 },
        subtitleLength: { type: 'number', default: 50 },
        paddingTop: { type: 'number', default: 10 },
        paddingBottom: { type: 'number', default: 10 },
        paddingLeft: { type: 'number', default: 10 },
        paddingRight: { type: 'number', default: 10 },
        marginTop: { type: 'number', default: 10 },
        marginBottom: { type: 'number', default: 10 },
        marginLeft: { type: 'number', default: 10 },
        marginRight: { type: 'number', default: 10 },
        imageSize: { type: 'string', default: 'large' },
        customImageWidth: { type: 'number', default: 175 },
        customImageHeight: { type: 'number', default: 350 },
        descriptionFontSize: { type: 'number', default: 12 },
        descriptionFontColor: { type: 'string', default: '#ffffff' },
        cardSpace: { type: 'number', default: 5 },
    },
    edit: (props) => {
        const { attributes, setAttributes } = props;
        const [posts, setPosts] = useState([]);

        useEffect(() => {
            const fetchPosts = async () => {
                try {
                    const apiUrl = `${wpApiSettings.root}wp/v2/${attributes.postType}s?per_page=${attributes.numberOfPosts}${attributes.category ? `&categories=${attributes.category}` : ''}`;
                    const response = await fetch(apiUrl, {
                        headers: {
                            'Content-Type': 'application/json',
                            'X-WP-Nonce': wpApiSettings.nonce,
                        },
                    });
                    if (!response.ok) throw new Error('Network response was not ok.');
                    const data = await response.json();

                    // Fetch media and author avatar details for each post
                    const enrichedPosts = await Promise.all(data.map(async (post) => {
                        const media = post.featured_media ? await fetchMedia(post.featured_media) : null;
                        const author = post.author ? await fetchAvatar(post.author) : null;
                        return { ...post, featured_media: media, author };
                    }));
                    setPosts(enrichedPosts);
                } catch (error) {
                    console.error('Fetching posts failed:', error);
                }
            };
            fetchPosts();
        }, [attributes.numberOfPosts, attributes.postType, attributes.category]);

        const {
            numberOfPosts,
            postType,
            category,
            fontSize,
            fontFamily,
            fontColor,
            lineHeight,
            subtitleLength,
            paddingTop,
            paddingBottom,
            paddingLeft,
            paddingRight,
            marginTop,
            marginBottom,
            marginLeft,
            marginRight,
            imageSize,
            customImageWidth,
            customImageHeight,
            descriptionFontSize,
            descriptionFontColor,
            cardSpace,
        } = attributes;

        const postTypeOptions = [
            { label: __('Post', 'sspsgb'), value: 'post' },
            { label: __('Page', 'sspsgb'), value: 'page' },
        ];

        return (
            <>
                <InspectorControls>
                    <PanelBody title={__('Post Settings', 'sspsgb')}>
                        <SelectControl
                            label={__('Image Size', 'sspsgb')}
                            value={imageSize}
                            options={[
                                { label: __('Thumbnail', 'sspsgb'), value: 'thumbnail' },
                                { label: __('Medium', 'sspsgb'), value: 'medium' },
                                { label: __('Large', 'sspsgb'), value: 'large' },
                                { label: __('Full', 'sspsgb'), value: 'full' },
                                { label: __('Custom', 'sspsgb'), value: 'custom' },
                            ]}
                            onChange={(value) => setAttributes({ imageSize: value })}
                        />
                        {imageSize === 'custom' && (
                            <>
                                <TextControl
                                    label={__('Custom Image Width (px)', 'sspsgb')}
                                    type="number"
                                    value={customImageWidth}
                                    onChange={(value) => setAttributes({ customImageWidth: parseInt(value, 10) || null })}
                                />
                                <TextControl
                                    label={__('Custom Image Height (px)', 'sspsgb')}
                                    type="number"
                                    value={customImageHeight}
                                    onChange={(value) => setAttributes({ customImageHeight: parseInt(value, 10) || null })}
                                />
                            </>
                        )}
                        <RangeControl
                            label={__('Number of Posts', 'sspsgb')}
                            value={numberOfPosts}
                            onChange={(value) => setAttributes({ numberOfPosts: value })}
                            min={1}
                            max={20}
                        />
                        <SelectControl
                            label={__('Post Type', 'sspsgb')}
                            value={postType}
                            options={postTypeOptions}
                            onChange={(value) => setAttributes({ postType: value })}
                        />
                        <TextControl
                            label={__('Category ID (leave empty for all)', 'sspsgb')}
                            value={category}
                            onChange={(value) => setAttributes({ category: value })}
                        />
                    </PanelBody>
                    {/* Additional Panels for Title, Description, and Spacing */}
                    <PanelBody title={__('Title Settings', 'sspsgb')}>
                        <RangeControl
                            label={__('Title Font Size', 'sspsgb')}
                            value={fontSize}
                            onChange={(value) => setAttributes({ fontSize: value })}
                            min={10}
                            max={50}
                        />
                        <TextControl
                            label={__('Title Font Family', 'sspsgb')}
                            value={fontFamily}
                            onChange={(value) => setAttributes({ fontFamily: value })}
                        />
                        <ColorPalette
                            label={__('Title Font Color', 'sspsgb')}
                            colors={FONT_COLORS}
                            value={fontColor}
                            onChange={(color) => setAttributes({ fontColor: color })}
                        />
                        <RangeControl
                            label={__('Title Line Height', 'sspsgb')}
                            value={lineHeight}
                            onChange={(value) => setAttributes({ lineHeight: value })}
                            min={0}
                            max={2}
                        />
                    </PanelBody>
                    <PanelBody title={__('Description Settings', 'sspsgb')}>
                        <RangeControl
                            label={__('Description Length', 'sspsgb')}
                            value={subtitleLength}
                            onChange={(value) => setAttributes({ subtitleLength: value })}
                            min={10}
                            max={300}
                        />
                        <RangeControl
                            label={__('Description Font Size', 'sspsgb')}
                            value={descriptionFontSize}
                            onChange={(value) => setAttributes({ descriptionFontSize: value })}
                            min={10}
                            max={50}
                        />
                        <label>{__('Description Font Color', 'sspsgb')}</label>
                        <ColorPalette
                            colors={FONT_COLORS}
                            value={descriptionFontColor}
                            onChange={(color) => setAttributes({ descriptionFontColor: color })}
                        />
                    </PanelBody>
                    <PanelBody title={__('Spacing Settings', 'sspsgb')}>
                        <RangeControl
                            label={__('Padding Top (px)', 'sspsgb')}
                            value={paddingTop}
                            onChange={(value) => setAttributes({ paddingTop: value })}
                            min={0}
                            max={100}
                        />
                        <RangeControl
                            label={__('Padding Bottom (px)', 'sspsgb')}
                            value={paddingBottom}
                            onChange={(value) => setAttributes({ paddingBottom: value })}
                            min={0}
                            max={100}
                        />
                        <RangeControl
                            label={__('Padding Left (px)', 'sspsgb')}
                            value={paddingLeft}
                            onChange={(value) => setAttributes({ paddingLeft: value })}
                            min={0}
                            max={100}
                        />
                        <RangeControl
                            label={__('Padding Right (px)', 'sspsgb')}
                            value={paddingRight}
                            onChange={(value) => setAttributes({ paddingRight: value })}
                            min={0}
                            max={100}
                        />
                        <RangeControl
                            label={__('Margin Top (px)', 'sspsgb')}
                            value={marginTop}
                            onChange={(value) => setAttributes({ marginTop: value })}
                            min={0}
                            max={100}
                        />
                        <RangeControl
                            label={__('Margin Bottom (px)', 'sspsgb')}
                            value={marginBottom}
                            onChange={(value) => setAttributes({ marginBottom: value })}
                            min={0}
                            max={100}
                        />
                        <RangeControl
                            label={__('Margin Left (px)', 'sspsgb')}
                            value={marginLeft}
                            onChange={(value) => setAttributes({ marginLeft: value })}
                            min={0}
                            max={100}
                        />
                        <RangeControl
                            label={__('Margin Right (px)', 'sspsgb')}
                            value={marginRight}
                            onChange={(value) => setAttributes({ marginRight: value })}
                            min={0}
                            max={100}
                        />
                    </PanelBody>
                </InspectorControls>

                <div {...useBlockProps()}>
                    <div className="ssspsgb-carousel">
                        <div className="sspsgb-story-container  ">
                            {posts.map((post, index) => (
                                <div key={index} className="sspsgb-story-card" style={{
                                    backgroundImage: `url(${post.featured_media.source_url})`, width: customImageWidth + 'px', height: customImageHeight + 'px', margin: cardSpace + 'px', height: customImageHeight + 'px',
                                }}>
                                    <a href='${post.link}' class="sspsgb-story-info">
                                        {post.author && post.author.avatar_urls && (
                                            <img
                                                className="sspsgb-user-logo"
                                                src={post.author.avatar_urls[24]}
                                                alt={post.author.name}
                                                width="30"
                                                height="30"
                                            />
                                        )}
                                        <div
                                            className="sspsgb-story-title"
                                            style={{ fontSize: fontSize + 'px', fontFamily: fontFamily, color: fontColor, lineHeight: lineHeight }}>
                                            {post.title.rendered}
                                        </div>
                                    </a>
                                    <div
                                        className="sspsgb-story-description"
                                        style={{ fontSize: descriptionFontSize + 'px', color: descriptionFontColor }}>
                                        {stripHtmlTags(post.content.rendered).length > subtitleLength
                                            ? stripHtmlTags(post.content.rendered).substring(0, subtitleLength) + '...'
                                            : stripHtmlTags(post.content.rendered)}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div class="sspsgb-arrow sspsgb-left">&#8249;</div>
                        <div class="sspsgb-arrow sspsgb-right">&#8250;</div>
                    </div>
                </div>
            </>
        );
    },
    save: () => null,
});
