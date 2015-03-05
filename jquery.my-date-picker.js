(function($) {
  "use strict";

  var settings;

  function init(options) {
    settings = $.extend({}, $.fn.myDatePicker.defaults, options);
    this.each(function() {
      initOne.call(this, settings)
    });
  }

  function initOne(settings) {
    var $input = $(this);
    $input.prop('readonly', true);
    $input.on("click", show);
  }

  function show() {
    var input = this;
    var $input = $(this);

    var $container = $input.data('my-date-picker');
    if (!$container) {
      $container = build.call(input);
      $input.data("my-date-picker", $container);
    }
    if ($container.is(':visible')) {
      close.call(input);
      return;
    }

    var $month = $(".my-date-picker-month", $container);
    var $days = $(".my-date-picker-days", $container);

    var date = new Date();
    var selectedDate = $input.val();

    drawMonth.call(input, date, $month);
    drawDays.call(input, date, $days, selectedDate);

    $container.show();
    fixContainerPosition.call(input, $container);
    fixCellsPosition.call(input, $container);
  }

  function build() {
    var input = this;
    var $input = $(this);

    var $container = $("<div class='my-date-picker-container' />");
    var $content = $("<div class='my-date-picker-content' />").appendTo($container);
    var $header = $("<div class='my-date-picker-header' />").appendTo($content);
    var $month = $("<div class='my-date-picker-month' />").appendTo($header);
    var $weekdays = $("<div class='my-date-picker-weekdays' />").appendTo($header);
    var $closeBtn = $("<img class='my-date-picker-closer' src='img/close.png' alt='X'/>").appendTo($header);
    var $daysViewport = $("<div class='my-date-picker-days-viewport' />").appendTo($content);
    var $days = $("<div class='my-date-picker-days' />").appendTo($daysViewport);

    $closeBtn.on('click', function() {
      close.call(input);
    });

    drawWeekdays.call(input, $weekdays);

    $container.hide().appendTo("body")
    return $container;
  }

  function fixContainerPosition($container) {
    var $input = $(this);

    var width = settings.width;
    var height = settings.height;
    var top = $input.offset().top + $input.height()/2 - height/2;
    var left = $input.offset().left + $input.width()*2/3;
    if (top + height > $(document).height()) top = $(document).height() - height - 20;
    if (top < 20) top = 20;
    if (left + width > $(document).width()) left = $(document).width() - width - 20;
    if (left < 20) left = 20;

    $container
      .width(width).height(height)
      .offset({top: top, left: left});
  }

  function fixCellsPosition($container) {
    var $input = $(this);
    var $content = $(".my-date-picker-content", $container);
    var $header = $(".my-date-picker-header", $container);
    var $daysViewport = $(".my-date-picker-days-viewport", $container);

    var $cell = $(".cell", $container);
    var newCellWidth = $content.width() / 7 - parseInt($cell.css("border-left-width")) - parseInt($cell.css("border-right-width"));
    $cell.width(newCellWidth).height(newCellWidth).css("line-height", newCellWidth+"px");

    $daysViewport.height($content.height() - $header.outerHeight(true));
  }

  function close() {
    var $input = $(this);

    var $container = $input.data("my-date-picker");
    if (!$container) {
      return;
    }
    $container.hide();
  }

  function drawMonth(date, $toDiv) {
    $toDiv.html(settings.months[date.getMonth()] + " " + date.getFullYear());
  }

  function drawWeekdays($toDiv) {
    var html = "<table><thead><tr>";
    for (var i = 0; i < settings.weekdays.length; i++) {
      html += "<th class='cell weekday'>"+settings.weekdays[i]+"</th>";
    }
    html += "</tr></thead></table>";
    $toDiv.append(html);
  }

  function drawDays(date, $toDiv, selectedDate) {
    var input = this;
    var $table = $("<table/>");
    var $tbody = $("<tbody/>").appendTo($table);
    var $row;

    var pastDays = 7 * settings.pastWeeks + getDay(date) - 1;
    date.setDate(date.getDate()-pastDays);
    for (var day = 0; day < pastDays; day++) {
      if (day % 7 == 0) {
        if ($row) $tbody.append($row);
        $row = $("<tr/>");
      }
      $row.append(makeCell(date, true, selectedDate));
      date.setDate(date.getDate()+1);
    }

    var featureDays = 7 * settings.featureWeeks + 7 - getDay(date);
    for (var day = pastDays; day < (pastDays+featureDays+1); day++) {
      if (day % 7 == 0) {
        if ($row) $tbody.append($row);
        $row = $("<tr/>");
      }
      var $cell = makeCell(date, include(settings.disabledWeekdays, getDay(date)), selectedDate);
      $row.append($cell);
      date.setDate(date.getDate()+1);
    }

    $tbody.append($row);
    $toDiv.html($table);

    $("td.available", $toDiv).on('click', function() {
      var dateString = $(this).data("dateString");
      if (!dateString) return;
      select.call(input, dateString);
    });
  }

  function makeCell(date, disabled, selectedDate) {
    var $cell = $("<td class='cell day'>"+date.getDate()+"</td>");
    if (date.getDate() == 1) {
      $cell.append("<span class='month-name'><span class='month-name-text'>"+settings.shortMonths[date.getMonth()]+"</span></span>");
    }
    if (disabled) {
      $cell.addClass('disabled');
    } else {
      var dateString = dateToString(date);
      if (include(settings.disabledDates, dateString)) {
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
  }

  function select(dateString) {
    var $input = $(this);
    $input.val(dateString);
    close.call(this);
  }

  function getDay(date) {
    var day = date.getDay();
    if (day == 0) {
      day = 7;
    }
    return day;
  }

  function include(array, value) {
    return array.indexOf(value) != -1;
  }

  function dateToString(date) {
    var dateString = date.getDate() < 10 ? "0"+date.getDate() : date.getDate();
    var monthString = date.getMonth() < 10 ? "0"+date.getMonth() : date.getMonth();
    return dateString + "-" + monthString + "-" + date.getFullYear();
  }

  $.fn.myDatePicker = function(options) {
    if (!this.length) return this;
    init.call(this, options);
  };

  $.fn.myDatePicker.defaults = {
    width: 250,
    height: 350,
    weekdays: ["Ma", "Di", "Wo", "Do", "Vr", "Za", "Zo"],
    months: ["Januari", "Februari", "Maart", "April", "Mei", "Juni", "Juli", "Augustus", "September", "October", "November", "December"],
    shortMonths: ["Jan", "Feb", "Maa", "Apr", "Mei", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    pastWeeks: 2,
    featureWeeks: 25,
    disabledWeekdays: [7],
    disabledDates: []
  };

}(jQuery));
