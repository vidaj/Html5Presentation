var NullSlide = {
    /** Waiting for __noSuchMethod__ support in Chrome */
    setNextSlide : function(slide) {},
    setPreviousSlide: function(slide) {},
    disable: function() {},
    show: function() {},
    markAsPrevious: function() {},
    markAsNext: function() {},
    markAsFarPrevious: function() {},
    markAsFarNext: function() {}
};

var Slide = function() {
    var Slide = function(elements) {
        this.elements = $(elements);
        this.nextSlide = null;
        this.previousSlide = null;
    };

    Slide.prototype.setNextSlide = function(slide) {
        this.nextSlide = slide;
    };

    Slide.prototype.setPreviousSlide = function(slide) {
        this.previousSlide = slide;
    };

    Slide.prototype.disable = function() {
        this.elements.removeClass('active previous next farPrevious farNext');
    };

    Slide.prototype.show = function() {
        this.disable();
        this.previousSlide.markAsPrevious();
        this.nextSlide.markAsNext();
        this.elements.addClass('active');
    };

    Slide.prototype.markAsPrevious = function() {
        this.disable();
        this.previousSlide.markAsFarPrevious();
        this.elements.addClass('previous');
    };

    Slide.prototype.markAsNext = function() {
        this.disable();
        this.nextSlide.markAsFarNext();
        this.elements.addClass('next');
    };

    Slide.prototype.markAsFarPrevious = function() {
        this.disable();
        this.elements.addClass('farPrevious');
    };

    Slide.prototype.markAsFarNext = function() {
        this.disable();
        this.elements.addClass('farNext');
    };

    return Slide;
}();



var SlideShow = function() {

    var createSlides = function(originalSlides) {
        var slides = [];
        var length = originalSlides.length;
        for (var i = 0; i < length; i++) {
            slides.push(new Slide(originalSlides[i]));
        }
        var previousSlide = NullSlide;
        for (var i = 0; i < length; i++) {
            var currentSlide = slides[i];
            var nextSlide = (i + 1 !== length) ? slides[i + 1] : NullSlide;
            currentSlide.setPreviousSlide(previousSlide);
            currentSlide.setNextSlide(nextSlide);
            previousSlide = currentSlide;
        }
        return slides;
    };

    var SlideShow = function(slides) {
        this.slides = createSlides(slides);
        this.currentSlide = 0;
        this.slideCount = this.slides.length;

        this.slides.map(function(slide) { slide.disable(); } );
        this.slides[0].show();

        var me = this;
        document.addEventListener('keydown', function(e) { me.handleKeys(e); }, false);
    };

    SlideShow.prototype.handleKeys = function(event) {
        if (/^(input|textarea)$/i.test(event.target.nodeName) || event.target.isContentEditable) {
            return;
        }
        var RIGHT_ARROW = 39,
            LEFT_ARROW = 37,
            SPACE = 32;
        switch (event.keyCode) {
            case LEFT_ARROW:
                this.previous(); break;
            case RIGHT_ARROW:
            case SPACE:
                this.next(); break;
        }
    };

    SlideShow.prototype.next = function() {
        if (this.currentSlide == this.slideCount - 1) {
            return;
        }
        this.currentSlide += 1;
        this.slides[this.currentSlide].show();
    };

    SlideShow.prototype.previous = function() {
        if (this.currentSlide == 0) {
            return;
        }
        this.currentSlide -= 1;
        this.slides[this.currentSlide].show();
    };

    return SlideShow;
}();

$(document).ready(function() {
   var show = new SlideShow($('.slide'));
});