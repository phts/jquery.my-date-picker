(function($) {

  function init(options) {
    var settings = $.extend({}, $.fn.myDatePicker.defaults, options);
    this.each(function() {
      initOne.call(this, settings)
    });
  }

  function initOne(settings) {
    var $input = $(this);
    $input.on("focus", show);
  }

  function show() {
    var $input = $(this);
  }

  $.fn.myDatePicker = function(options) {
    if (!this.length) return this;
    init.call(this, options);
  };

  $.fn.myDatePicker.defaults = {
  };

}(jQuery));
