jQuery(document).ready(function ($) {
    var isDragging = false;
    var startX;
    var scrollLeft;

    function scrollLeftAction() {
        var storyContainer = $('.sspsgb-story-container')[0];
        if (storyContainer) {
            storyContainer.scrollBy({
                left: -300,
                behavior: 'smooth'
            });
        }
    }

    function scrollRightAction() {
        var storyContainer = $('.sspsgb-story-container')[0];
        if (storyContainer) {
            storyContainer.scrollBy({
                left: 300,
                behavior: 'smooth'
            });
        }
    }

    $(document).on('click', '.sspsgb-arrow.sspsgb-left', function () {
        scrollLeftAction();
    });

    $(document).on('click', '.sspsgb-arrow.sspsgb-right', function () {
        scrollRightAction();
    });

    // Mouse and touch drag functionality
    $('.sspsgb-story-container').on('mousedown', function (e) {
        isDragging = true;
        startX = e.pageX - $(this).offset().left;
        scrollLeft = $(this).scrollLeft();
        $(this).addClass('dragging'); // Add class to change cursor
    });

    $(document).on('mouseup', function () {
        isDragging = false;
        $('.sspsgb-story-container').removeClass('dragging'); // Remove class to reset cursor
    });

    $('.sspsgb-story-container').on('mousemove', function (e) {
        if (!isDragging) return;
        e.preventDefault();
        var x = e.pageX - $(this).offset().left;
        var walk = (x - startX) * 3; // Scroll-fast factor
        $(this).scrollLeft(scrollLeft - walk);
    });

    // Touch events for mobile
    $('.sspsgb-story-container').on('touchstart', function (e) {
        var touch = e.originalEvent.touches[0];
        isDragging = true;
        startX = touch.pageX - $(this).offset().left;
        scrollLeft = $(this).scrollLeft();
        $(this).addClass('dragging'); // Add class to change cursor
    });

    $(document).on('touchend', function () {
        isDragging = false;
        $('.sspsgb-story-container').removeClass('dragging'); // Remove class to reset cursor
    });

    $('.sspsgb-story-container').on('touchmove', function (e) {
        if (!isDragging) return;
        e.preventDefault();
        var touch = e.originalEvent.touches[0];
        var x = touch.pageX - $(this).offset().left;
        var walk = (x - startX) * 3; // Scroll-fast factor
        $(this).scrollLeft(scrollLeft - walk);
    });
});
