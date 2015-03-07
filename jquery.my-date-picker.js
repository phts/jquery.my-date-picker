(function($) {
  "use strict";

  // Production steps of ECMA-262, Edition 5, 15.4.4.14
  // Reference: http://es5.github.io/#x15.4.4.14
  // Adds IE8 support
  if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function(searchElement, fromIndex) {
      var k;

      if (this == null) {
        throw new TypeError('"this" is null or not defined');
      }

      var O = Object(this);
      var len = O.length >>> 0;
      if (len === 0) {
        return -1;
      }

      var n = +fromIndex || 0;
      if (Math.abs(n) === Infinity) {
        n = 0;
      }

      if (n >= len) {
        return -1;
      }

      k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);
      while (k < len) {
        if (k in O && O[k] === searchElement) {
          return k;
        }
        k++;
      }
      return -1;
    };
  }

  var MyDatePicker = function(options, input) {
    this.$input = $(input);
    this._init(options)
  }

  MyDatePicker.defaults = {
    width: 250,
    height: 350,
    closeButtonImg: "img/close.png",
    weekdays: ["Ma", "Di", "Wo", "Do", "Vr", "Za", "Zo"],
    months: ["Januari", "Februari", "Maart", "April", "Mei", "Juni", "Juli", "Augustus", "September", "October", "November", "December"],
    shortMonths: ["Jan", "Feb", "Maa", "Apr", "Mei", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    pastWeeks: 2,
    featureWeeks: 25,
    disabledWeekdays: [7],
    disabledDates: [],
    useScrollWheel: true
  };

  MyDatePicker.prototype = {

    _init: function(options) {
      var _this = this;
      this.settings = $.extend({}, MyDatePicker.defaults, options);

      this.$input.prop('readonly', true);
      this.$input.on("click", function() {
        _this._show();
      });
      $(window).on('resize', function() {
        if (!_this._isShown()) return;
        _this._fixContainerPosition();
      });
    },

    _show: function() {
      if (!this.$containerEl) {
        this._build();
      }
      if (this.$containerEl.is(':visible')) {
        this._close();
        return;
      }

      var date = new Date();
      var selectedDate = this._getValue();

      this._drawMonth(date, this.$monthEl);
      this._drawDays(date, this.$daysEl, selectedDate);

      this.$containerEl.show();
      this._fixContainerPosition();
      this._fixCellsPosition();
    },

    _build: function() {
      var _this = this;
      this.$containerEl = $("<div class='my-date-picker-container' />");
      this.$contentEl = $("<div class='my-date-picker-content' />").appendTo(this.$containerEl);
      this.$headerEl = $("<div class='my-date-picker-header' />").appendTo(this.$contentEl);
      this.$monthEl = $("<div class='my-date-picker-month' />").appendTo(this.$headerEl);
      this.$weekdaysEl = $("<div class='my-date-picker-weekdays' />").appendTo(this.$headerEl);
      this.$closeBtnEl = $("<img class='my-date-picker-closer' src='"+this.settings.closeButtonImg+"' alt='X'/>").appendTo(this.$headerEl);
      this.$daysViewportEl = $("<div class='my-date-picker-days-viewport' />").appendTo(this.$contentEl);
      this.$daysEl = $("<div class='my-date-picker-days' />").appendTo(this.$daysViewportEl);

      this.$closeBtnEl.on('click', function() {
        _this._close();
      });

      if (this.settings.useScrollWheel) {
        this.$daysViewportEl.on("mousewheel DOMMouseScroll", function(event) {
          var delta = -20;
          if (event.originalEvent.wheelDelta < 0 || event.originalEvent.detail > 0) {
            // wheel down
            delta = 20;
          }
          _this._scrollDelta(delta);
          return false;
        });
      }

      this._drawWeekdays(this.$weekdaysEl);

      this.$containerEl.hide().appendTo("body")
    },

    _fixContainerPosition: function() {
      var width = this.settings.width;
      var height = this.settings.height;
      var top = this.$input.offset().top + this.$input.height()/2 - height/2;
      var left = this.$input.offset().left + this.$input.width()*2/3;
      if (top + height > $(document).height()) top = $(document).height() - height - 20;
      if (top < 20) top = 20;
      if (left + width > $(document).width()) left = $(document).width() - width - 20;
      if (left < 20) left = 20;

      this.$containerEl
        .width(width).height(height)
        .css({position: "absolute", top: top, left: left});
    },

    _fixCellsPosition: function() {
      var $cell = $(".cell", this.$containerEl);
      var newCellWidth = this.$contentEl.width() / 7 - parseInt($cell.css("border-left-width")) - parseInt($cell.css("border-right-width"));
      $cell.width(newCellWidth).height(newCellWidth).css("line-height", newCellWidth+"px");

      this.$daysViewportEl.height(this.$contentEl.height() - this.$headerEl.outerHeight(true));
    },

    _close: function() {
      this.$containerEl.hide();
    },

    _drawMonth: function(date, $toDiv) {
      $toDiv.html(this.settings.months[date.getMonth()] + " " + date.getFullYear());
    },

    _drawWeekdays: function($toDiv) {
      var html = "<table><thead><tr>";
      for (var i = 0; i < this.settings.weekdays.length; i++) {
        html += "<th class='cell weekday'>"+this.settings.weekdays[i]+"</th>";
      }
      html += "</tr></thead></table>";
      $toDiv.append(html);
    },

    _drawDays: function(date, $toDiv, selectedDate) {
      var _this = this;
      var $table = $("<table/>");
      var $tbody = $("<tbody/>").appendTo($table);
      var $row;

      var pastDays = 7 * this.settings.pastWeeks + this._getDay(date) - 1;
      date.setDate(date.getDate()-pastDays);
      for (var day = 0; day < pastDays; day++) {
        if (day % 7 == 0) {
          if ($row) $tbody.append($row);
          $row = $("<tr/>");
        }
        $row.append(this._makeCell(date, true, selectedDate));
        date.setDate(date.getDate()+1);
      }

      var featureDays = 7 * this.settings.featureWeeks + 7 - this._getDay(date);
      for (var day = pastDays; day < (pastDays+featureDays+1); day++) {
        if (day % 7 == 0) {
          if ($row) $tbody.append($row);
          $row = $("<tr/>");
        }
        var $cell = this._makeCell(date, this._isIncluded(this.settings.disabledWeekdays, this._getDay(date)), selectedDate);
        $row.append($cell);
        date.setDate(date.getDate()+1);
      }

      $tbody.append($row);
      $toDiv.html($table);

      $("td.available", $toDiv).on('click', function() {
        var dateString = $(this).data("dateString");
        if (!dateString) return;
        _this._select(dateString);
      });
    },

    _makeCell: function(date, disabled, selectedDate) {
      var $cell = $("<td class='cell day'>"+date.getDate()+"</td>");
      if (date.getDate() == 1) {
        $cell.append("<span class='month-name'><span class='month-name-text'>" +
          this.settings.shortMonths[date.getMonth()].split("").join("<br/>") +
          "</span></span>");
      }
      if (disabled) {
        $cell.addClass('disabled');
      } else {
        var dateString = this._dateToString(date);
        if (this._isIncluded(this.settings.disabledDates, dateString)) {
          $cell.addClass('disabled');
        } else {
          $cell.addClass('available');
        }
        $cell.data("dateString", dateString);
        if (dateString == selectedDate) {
          $cell.addClass('selected');
        }
      }
      return $cell;
    },

    _select: function(dateString) {
      this._setValue(dateString);
      this._close();
    },

    _getValue: function() {
      return this.$input.val();
    },

    _setValue: function(value) {
      this.$input.val(value);
    },

    _getDay: function(date) {
      var day = date.getDay();
      if (day == 0) {
        day = 7;
      }
      return day;
    },

    _isIncluded: function(array, value) {
      return array.indexOf(value) != -1;
    },

    _dateToString: function(date) {
      var dateString = date.getDate() < 10 ? "0"+date.getDate() : date.getDate();
      var monthString = date.getMonth() < 10 ? "0"+date.getMonth() : date.getMonth();
      return dateString + "-" + monthString + "-" + date.getFullYear();
    },

    _isShown: function() {
      return !!this.$containerEl && this.$containerEl.is(':visible');
    },

    _scrollDelta: function(delta) {
      this._setScroll(this._getScroll() + delta);
    },

    _getScroll: function() {
      return -this.$daysEl.position().top;
    },

    _setScroll: function(top) {
      var minScroll = 0;
      var maxScroll = this.$daysEl.height() - this.$daysViewportEl.height();
      if (top < minScroll) {
        top = minScroll;
      } else if (top > maxScroll) {
        top = maxScroll;
      }
      this.$daysEl.css({position: "absolute", top: -top, left: 0});
    }

  };

  $.fn.myDatePicker = function(options) {
    this.each(function() {
      $.data(this, "my-date-picker", new MyDatePicker(options, this));
    });
  };

}(jQuery));
