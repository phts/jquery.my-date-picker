# my-date-picker

A jQuery plugin which adds a date picker to a text input. The text input becomes `readonly` and its value cannot be changed directly.

Browser support: Firefox, Google Chrome, IE8-11

## Usage

```
$("input").myDatePicker(options);
```

## Options

* `width` - Widget's width. Default: `250`.
* `height` - Widget's height. Default: `350`.
* `closeButtonImg` - Close button image path. Default: `"img/close.png"`.
* `weekdays` - Array with short day names showing in a widget's header.

  Default: `["Ma", "Di", "Wo", "Do", "Vr", "Za", "Zo"]`.

* `months` - Array with month names showing in a widget's header.

  Default: `["Januari", "Februari", "Maart", "April", "Mei", "Juni", "Juli", "Augustus", "September", "October", "November", "December"]`.

* `shortMonths` - Array with short month names showing in small black bands in a day grid.

  Default: `["Jan", "Feb", "Maa", "Apr", "Mei", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]`.

* `pastWeeks` - Number of weeks which are showed before current week and contain disabled dates. Default: `2`.
* `futureDays` - Amount of days loaded from the current date (including the current date). Default: `180`.
* `disabledWeekdays` - Array with disabled weekdays (from 1 to 7). Default: `[7]`.
* `disabledDates` - Array of strings with disabled dates (format `"dd-mm-yyyy"`). Default: `[]`.
* `useScrollWheel` - Determines whether to use a mouse wheel to scroll date grid in a widget. Default: `true`.
* `pxPerScrollWheel` - Amount of pixels scrolled by a mouse wheel. Default: `20`.
* `showScrollButtons` - Determines whether to show scroll buttons if date grid exceeds widget's bounds. Default: `true`.
* `pxPerScrollButtons` - Amount of pixels scrolled by scrollbars. Default: `10`.
