/* Built by scripts/build-flatpickr-package.js. Edit v2/packages-src/FlatpickrJOG.Controls.source.js instead. */
(() => {
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __commonJS = (cb, mod) => function __require() {
    try {
      return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
    } catch (e) {
      throw mod = 0, e;
    }
  };

  // node_modules/flatpickr/dist/flatpickr.js
  var require_flatpickr = __commonJS({
    "node_modules/flatpickr/dist/flatpickr.js"(exports, module) {
      (function(global, factory) {
        typeof exports === "object" && typeof module !== "undefined" ? module.exports = factory() : typeof define === "function" && define.amd ? define(factory) : (global = typeof globalThis !== "undefined" ? globalThis : global || self, global.flatpickr = factory());
      })(exports, (function() {
        "use strict";
        var __assign = function() {
          __assign = Object.assign || function __assign2(t) {
            for (var s, i = 1, n = arguments.length; i < n; i++) {
              s = arguments[i];
              for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
            }
            return t;
          };
          return __assign.apply(this, arguments);
        };
        function __spreadArrays() {
          for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
          for (var r = Array(s), k = 0, i = 0; i < il; i++)
            for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
              r[k] = a[j];
          return r;
        }
        var HOOKS = [
          "onChange",
          "onClose",
          "onDayCreate",
          "onDestroy",
          "onKeyDown",
          "onMonthChange",
          "onOpen",
          "onParseConfig",
          "onReady",
          "onValueUpdate",
          "onYearChange",
          "onPreCalendarPosition"
        ];
        var defaults = {
          _disable: [],
          allowInput: false,
          allowInvalidPreload: false,
          altFormat: "F j, Y",
          altInput: false,
          altInputClass: "form-control input",
          animate: typeof window === "object" && window.navigator.userAgent.indexOf("MSIE") === -1,
          ariaDateFormat: "F j, Y",
          autoFillDefaultTime: true,
          clickOpens: true,
          closeOnSelect: true,
          conjunction: ", ",
          dateFormat: "Y-m-d",
          defaultHour: 12,
          defaultMinute: 0,
          defaultSeconds: 0,
          disable: [],
          disableMobile: false,
          enableSeconds: false,
          enableTime: false,
          errorHandler: function(err) {
            return typeof console !== "undefined" && console.warn(err);
          },
          getWeek: function(givenDate) {
            var date = new Date(givenDate.getTime());
            date.setHours(0, 0, 0, 0);
            date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
            var week1 = new Date(date.getFullYear(), 0, 4);
            return 1 + Math.round(((date.getTime() - week1.getTime()) / 864e5 - 3 + (week1.getDay() + 6) % 7) / 7);
          },
          hourIncrement: 1,
          ignoredFocusElements: [],
          inline: false,
          locale: "default",
          minuteIncrement: 5,
          mode: "single",
          monthSelectorType: "dropdown",
          nextArrow: "<svg version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' viewBox='0 0 17 17'><g></g><path d='M13.207 8.472l-7.854 7.854-0.707-0.707 7.146-7.146-7.146-7.148 0.707-0.707 7.854 7.854z' /></svg>",
          noCalendar: false,
          now: /* @__PURE__ */ new Date(),
          onChange: [],
          onClose: [],
          onDayCreate: [],
          onDestroy: [],
          onKeyDown: [],
          onMonthChange: [],
          onOpen: [],
          onParseConfig: [],
          onReady: [],
          onValueUpdate: [],
          onYearChange: [],
          onPreCalendarPosition: [],
          plugins: [],
          position: "auto",
          positionElement: void 0,
          prevArrow: "<svg version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' viewBox='0 0 17 17'><g></g><path d='M5.207 8.471l7.146 7.147-0.707 0.707-7.853-7.854 7.854-7.853 0.707 0.707-7.147 7.146z' /></svg>",
          shorthandCurrentMonth: false,
          showMonths: 1,
          static: false,
          time_24hr: false,
          weekNumbers: false,
          wrap: false
        };
        var english = {
          weekdays: {
            shorthand: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
            longhand: [
              "Sunday",
              "Monday",
              "Tuesday",
              "Wednesday",
              "Thursday",
              "Friday",
              "Saturday"
            ]
          },
          months: {
            shorthand: [
              "Jan",
              "Feb",
              "Mar",
              "Apr",
              "May",
              "Jun",
              "Jul",
              "Aug",
              "Sep",
              "Oct",
              "Nov",
              "Dec"
            ],
            longhand: [
              "January",
              "February",
              "March",
              "April",
              "May",
              "June",
              "July",
              "August",
              "September",
              "October",
              "November",
              "December"
            ]
          },
          daysInMonth: [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
          firstDayOfWeek: 0,
          ordinal: function(nth) {
            var s = nth % 100;
            if (s > 3 && s < 21)
              return "th";
            switch (s % 10) {
              case 1:
                return "st";
              case 2:
                return "nd";
              case 3:
                return "rd";
              default:
                return "th";
            }
          },
          rangeSeparator: " to ",
          weekAbbreviation: "Wk",
          scrollTitle: "Scroll to increment",
          toggleTitle: "Click to toggle",
          amPM: ["AM", "PM"],
          yearAriaLabel: "Year",
          monthAriaLabel: "Month",
          hourAriaLabel: "Hour",
          minuteAriaLabel: "Minute",
          time_24hr: false
        };
        var pad = function(number, length) {
          if (length === void 0) {
            length = 2;
          }
          return ("000" + number).slice(length * -1);
        };
        var int = function(bool) {
          return bool === true ? 1 : 0;
        };
        function debounce(fn, wait) {
          var t;
          return function() {
            var _this = this;
            var args = arguments;
            clearTimeout(t);
            t = setTimeout(function() {
              return fn.apply(_this, args);
            }, wait);
          };
        }
        var arrayify = function(obj) {
          return obj instanceof Array ? obj : [obj];
        };
        function toggleClass(elem, className, bool) {
          if (bool === true)
            return elem.classList.add(className);
          elem.classList.remove(className);
        }
        function createElement(tag, className, content) {
          var e = window.document.createElement(tag);
          className = className || "";
          content = content || "";
          e.className = className;
          if (content !== void 0)
            e.textContent = content;
          return e;
        }
        function clearNode(node) {
          while (node.firstChild)
            node.removeChild(node.firstChild);
        }
        function findParent(node, condition) {
          if (condition(node))
            return node;
          else if (node.parentNode)
            return findParent(node.parentNode, condition);
          return void 0;
        }
        function createNumberInput(inputClassName, opts) {
          var wrapper = createElement("div", "numInputWrapper"), numInput = createElement("input", "numInput " + inputClassName), arrowUp = createElement("span", "arrowUp"), arrowDown = createElement("span", "arrowDown");
          if (navigator.userAgent.indexOf("MSIE 9.0") === -1) {
            numInput.type = "number";
          } else {
            numInput.type = "text";
            numInput.pattern = "\\d*";
          }
          if (opts !== void 0)
            for (var key in opts)
              numInput.setAttribute(key, opts[key]);
          wrapper.appendChild(numInput);
          wrapper.appendChild(arrowUp);
          wrapper.appendChild(arrowDown);
          return wrapper;
        }
        function getEventTarget(event) {
          try {
            if (typeof event.composedPath === "function") {
              var path = event.composedPath();
              return path[0];
            }
            return event.target;
          } catch (error) {
            return event.target;
          }
        }
        var doNothing = function() {
          return void 0;
        };
        var monthToStr = function(monthNumber, shorthand, locale) {
          return locale.months[shorthand ? "shorthand" : "longhand"][monthNumber];
        };
        var revFormat = {
          D: doNothing,
          F: function(dateObj, monthName, locale) {
            dateObj.setMonth(locale.months.longhand.indexOf(monthName));
          },
          G: function(dateObj, hour) {
            dateObj.setHours((dateObj.getHours() >= 12 ? 12 : 0) + parseFloat(hour));
          },
          H: function(dateObj, hour) {
            dateObj.setHours(parseFloat(hour));
          },
          J: function(dateObj, day) {
            dateObj.setDate(parseFloat(day));
          },
          K: function(dateObj, amPM, locale) {
            dateObj.setHours(dateObj.getHours() % 12 + 12 * int(new RegExp(locale.amPM[1], "i").test(amPM)));
          },
          M: function(dateObj, shortMonth, locale) {
            dateObj.setMonth(locale.months.shorthand.indexOf(shortMonth));
          },
          S: function(dateObj, seconds) {
            dateObj.setSeconds(parseFloat(seconds));
          },
          U: function(_, unixSeconds) {
            return new Date(parseFloat(unixSeconds) * 1e3);
          },
          W: function(dateObj, weekNum, locale) {
            var weekNumber = parseInt(weekNum);
            var date = new Date(dateObj.getFullYear(), 0, 2 + (weekNumber - 1) * 7, 0, 0, 0, 0);
            date.setDate(date.getDate() - date.getDay() + locale.firstDayOfWeek);
            return date;
          },
          Y: function(dateObj, year) {
            dateObj.setFullYear(parseFloat(year));
          },
          Z: function(_, ISODate) {
            return new Date(ISODate);
          },
          d: function(dateObj, day) {
            dateObj.setDate(parseFloat(day));
          },
          h: function(dateObj, hour) {
            dateObj.setHours((dateObj.getHours() >= 12 ? 12 : 0) + parseFloat(hour));
          },
          i: function(dateObj, minutes) {
            dateObj.setMinutes(parseFloat(minutes));
          },
          j: function(dateObj, day) {
            dateObj.setDate(parseFloat(day));
          },
          l: doNothing,
          m: function(dateObj, month) {
            dateObj.setMonth(parseFloat(month) - 1);
          },
          n: function(dateObj, month) {
            dateObj.setMonth(parseFloat(month) - 1);
          },
          s: function(dateObj, seconds) {
            dateObj.setSeconds(parseFloat(seconds));
          },
          u: function(_, unixMillSeconds) {
            return new Date(parseFloat(unixMillSeconds));
          },
          w: doNothing,
          y: function(dateObj, year) {
            dateObj.setFullYear(2e3 + parseFloat(year));
          }
        };
        var tokenRegex = {
          D: "",
          F: "",
          G: "(\\d\\d|\\d)",
          H: "(\\d\\d|\\d)",
          J: "(\\d\\d|\\d)\\w+",
          K: "",
          M: "",
          S: "(\\d\\d|\\d)",
          U: "(.+)",
          W: "(\\d\\d|\\d)",
          Y: "(\\d{4})",
          Z: "(.+)",
          d: "(\\d\\d|\\d)",
          h: "(\\d\\d|\\d)",
          i: "(\\d\\d|\\d)",
          j: "(\\d\\d|\\d)",
          l: "",
          m: "(\\d\\d|\\d)",
          n: "(\\d\\d|\\d)",
          s: "(\\d\\d|\\d)",
          u: "(.+)",
          w: "(\\d\\d|\\d)",
          y: "(\\d{2})"
        };
        var formats = {
          // get the date in UTC
          Z: function(date) {
            return date.toISOString();
          },
          // weekday name, short, e.g. Thu
          D: function(date, locale, options) {
            return locale.weekdays.shorthand[formats.w(date, locale, options)];
          },
          // full month name e.g. January
          F: function(date, locale, options) {
            return monthToStr(formats.n(date, locale, options) - 1, false, locale);
          },
          // padded hour 1-12
          G: function(date, locale, options) {
            return pad(formats.h(date, locale, options));
          },
          // hours with leading zero e.g. 03
          H: function(date) {
            return pad(date.getHours());
          },
          // day (1-30) with ordinal suffix e.g. 1st, 2nd
          J: function(date, locale) {
            return locale.ordinal !== void 0 ? date.getDate() + locale.ordinal(date.getDate()) : date.getDate();
          },
          // AM/PM
          K: function(date, locale) {
            return locale.amPM[int(date.getHours() > 11)];
          },
          // shorthand month e.g. Jan, Sep, Oct, etc
          M: function(date, locale) {
            return monthToStr(date.getMonth(), true, locale);
          },
          // seconds 00-59
          S: function(date) {
            return pad(date.getSeconds());
          },
          // unix timestamp
          U: function(date) {
            return date.getTime() / 1e3;
          },
          W: function(date, _, options) {
            return options.getWeek(date);
          },
          // full year e.g. 2016, padded (0001-9999)
          Y: function(date) {
            return pad(date.getFullYear(), 4);
          },
          // day in month, padded (01-30)
          d: function(date) {
            return pad(date.getDate());
          },
          // hour from 1-12 (am/pm)
          h: function(date) {
            return date.getHours() % 12 ? date.getHours() % 12 : 12;
          },
          // minutes, padded with leading zero e.g. 09
          i: function(date) {
            return pad(date.getMinutes());
          },
          // day in month (1-30)
          j: function(date) {
            return date.getDate();
          },
          // weekday name, full, e.g. Thursday
          l: function(date, locale) {
            return locale.weekdays.longhand[date.getDay()];
          },
          // padded month number (01-12)
          m: function(date) {
            return pad(date.getMonth() + 1);
          },
          // the month number (1-12)
          n: function(date) {
            return date.getMonth() + 1;
          },
          // seconds 0-59
          s: function(date) {
            return date.getSeconds();
          },
          // Unix Milliseconds
          u: function(date) {
            return date.getTime();
          },
          // number of the day of the week
          w: function(date) {
            return date.getDay();
          },
          // last two digits of year e.g. 16 for 2016
          y: function(date) {
            return String(date.getFullYear()).substring(2);
          }
        };
        var createDateFormatter = function(_a) {
          var _b = _a.config, config = _b === void 0 ? defaults : _b, _c = _a.l10n, l10n = _c === void 0 ? english : _c, _d = _a.isMobile, isMobile = _d === void 0 ? false : _d;
          return function(dateObj, frmt, overrideLocale) {
            var locale = overrideLocale || l10n;
            if (config.formatDate !== void 0 && !isMobile) {
              return config.formatDate(dateObj, frmt, locale);
            }
            return frmt.split("").map(function(c, i, arr) {
              return formats[c] && arr[i - 1] !== "\\" ? formats[c](dateObj, locale, config) : c !== "\\" ? c : "";
            }).join("");
          };
        };
        var createDateParser = function(_a) {
          var _b = _a.config, config = _b === void 0 ? defaults : _b, _c = _a.l10n, l10n = _c === void 0 ? english : _c;
          return function(date, givenFormat, timeless, customLocale) {
            if (date !== 0 && !date)
              return void 0;
            var locale = customLocale || l10n;
            var parsedDate;
            var dateOrig = date;
            if (date instanceof Date)
              parsedDate = new Date(date.getTime());
            else if (typeof date !== "string" && date.toFixed !== void 0)
              parsedDate = new Date(date);
            else if (typeof date === "string") {
              var format = givenFormat || (config || defaults).dateFormat;
              var datestr = String(date).trim();
              if (datestr === "today") {
                parsedDate = /* @__PURE__ */ new Date();
                timeless = true;
              } else if (config && config.parseDate) {
                parsedDate = config.parseDate(date, format);
              } else if (/Z$/.test(datestr) || /GMT$/.test(datestr)) {
                parsedDate = new Date(date);
              } else {
                var matched = void 0, ops = [];
                for (var i = 0, matchIndex = 0, regexStr = ""; i < format.length; i++) {
                  var token_1 = format[i];
                  var isBackSlash = token_1 === "\\";
                  var escaped = format[i - 1] === "\\" || isBackSlash;
                  if (tokenRegex[token_1] && !escaped) {
                    regexStr += tokenRegex[token_1];
                    var match = new RegExp(regexStr).exec(date);
                    if (match && (matched = true)) {
                      ops[token_1 !== "Y" ? "push" : "unshift"]({
                        fn: revFormat[token_1],
                        val: match[++matchIndex]
                      });
                    }
                  } else if (!isBackSlash)
                    regexStr += ".";
                }
                parsedDate = !config || !config.noCalendar ? new Date((/* @__PURE__ */ new Date()).getFullYear(), 0, 1, 0, 0, 0, 0) : new Date((/* @__PURE__ */ new Date()).setHours(0, 0, 0, 0));
                ops.forEach(function(_a2) {
                  var fn = _a2.fn, val = _a2.val;
                  return parsedDate = fn(parsedDate, val, locale) || parsedDate;
                });
                parsedDate = matched ? parsedDate : void 0;
              }
            }
            if (!(parsedDate instanceof Date && !isNaN(parsedDate.getTime()))) {
              config.errorHandler(new Error("Invalid date provided: " + dateOrig));
              return void 0;
            }
            if (timeless === true)
              parsedDate.setHours(0, 0, 0, 0);
            return parsedDate;
          };
        };
        function compareDates(date1, date2, timeless) {
          if (timeless === void 0) {
            timeless = true;
          }
          if (timeless !== false) {
            return new Date(date1.getTime()).setHours(0, 0, 0, 0) - new Date(date2.getTime()).setHours(0, 0, 0, 0);
          }
          return date1.getTime() - date2.getTime();
        }
        var isBetween = function(ts, ts1, ts2) {
          return ts > Math.min(ts1, ts2) && ts < Math.max(ts1, ts2);
        };
        var calculateSecondsSinceMidnight = function(hours, minutes, seconds) {
          return hours * 3600 + minutes * 60 + seconds;
        };
        var parseSeconds = function(secondsSinceMidnight) {
          var hours = Math.floor(secondsSinceMidnight / 3600), minutes = (secondsSinceMidnight - hours * 3600) / 60;
          return [hours, minutes, secondsSinceMidnight - hours * 3600 - minutes * 60];
        };
        var duration = {
          DAY: 864e5
        };
        function getDefaultHours(config) {
          var hours = config.defaultHour;
          var minutes = config.defaultMinute;
          var seconds = config.defaultSeconds;
          if (config.minDate !== void 0) {
            var minHour = config.minDate.getHours();
            var minMinutes = config.minDate.getMinutes();
            var minSeconds = config.minDate.getSeconds();
            if (hours < minHour) {
              hours = minHour;
            }
            if (hours === minHour && minutes < minMinutes) {
              minutes = minMinutes;
            }
            if (hours === minHour && minutes === minMinutes && seconds < minSeconds)
              seconds = config.minDate.getSeconds();
          }
          if (config.maxDate !== void 0) {
            var maxHr = config.maxDate.getHours();
            var maxMinutes = config.maxDate.getMinutes();
            hours = Math.min(hours, maxHr);
            if (hours === maxHr)
              minutes = Math.min(maxMinutes, minutes);
            if (hours === maxHr && minutes === maxMinutes)
              seconds = config.maxDate.getSeconds();
          }
          return { hours, minutes, seconds };
        }
        if (typeof Object.assign !== "function") {
          Object.assign = function(target) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
              args[_i - 1] = arguments[_i];
            }
            if (!target) {
              throw TypeError("Cannot convert undefined or null to object");
            }
            var _loop_1 = function(source2) {
              if (source2) {
                Object.keys(source2).forEach(function(key) {
                  return target[key] = source2[key];
                });
              }
            };
            for (var _a = 0, args_1 = args; _a < args_1.length; _a++) {
              var source = args_1[_a];
              _loop_1(source);
            }
            return target;
          };
        }
        var DEBOUNCED_CHANGE_MS = 300;
        function FlatpickrInstance(element, instanceConfig) {
          var self2 = {
            config: __assign(__assign({}, defaults), flatpickr.defaultConfig),
            l10n: english
          };
          self2.parseDate = createDateParser({ config: self2.config, l10n: self2.l10n });
          self2._handlers = [];
          self2.pluginElements = [];
          self2.loadedPlugins = [];
          self2._bind = bind;
          self2._setHoursFromDate = setHoursFromDate;
          self2._positionCalendar = positionCalendar;
          self2.changeMonth = changeMonth;
          self2.changeYear = changeYear;
          self2.clear = clear;
          self2.close = close;
          self2.onMouseOver = onMouseOver;
          self2._createElement = createElement;
          self2.createDay = createDay;
          self2.destroy = destroy;
          self2.isEnabled = isEnabled;
          self2.jumpToDate = jumpToDate;
          self2.updateValue = updateValue;
          self2.open = open;
          self2.redraw = redraw;
          self2.set = set;
          self2.setDate = setDate;
          self2.toggle = toggle;
          function setupHelperFunctions() {
            self2.utils = {
              getDaysInMonth: function(month, yr) {
                if (month === void 0) {
                  month = self2.currentMonth;
                }
                if (yr === void 0) {
                  yr = self2.currentYear;
                }
                if (month === 1 && (yr % 4 === 0 && yr % 100 !== 0 || yr % 400 === 0))
                  return 29;
                return self2.l10n.daysInMonth[month];
              }
            };
          }
          function init() {
            self2.element = self2.input = element;
            self2.isOpen = false;
            parseConfig();
            setupLocale();
            setupInputs();
            setupDates();
            setupHelperFunctions();
            if (!self2.isMobile)
              build();
            bindEvents();
            if (self2.selectedDates.length || self2.config.noCalendar) {
              if (self2.config.enableTime) {
                setHoursFromDate(self2.config.noCalendar ? self2.latestSelectedDateObj : void 0);
              }
              updateValue(false);
            }
            setCalendarWidth();
            var isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
            if (!self2.isMobile && isSafari) {
              positionCalendar();
            }
            triggerEvent("onReady");
          }
          function getClosestActiveElement() {
            var _a;
            return ((_a = self2.calendarContainer) === null || _a === void 0 ? void 0 : _a.getRootNode()).activeElement || document.activeElement;
          }
          function bindToInstance(fn) {
            return fn.bind(self2);
          }
          function setCalendarWidth() {
            var config = self2.config;
            if (config.weekNumbers === false && config.showMonths === 1) {
              return;
            } else if (config.noCalendar !== true) {
              window.requestAnimationFrame(function() {
                if (self2.calendarContainer !== void 0) {
                  self2.calendarContainer.style.visibility = "hidden";
                  self2.calendarContainer.style.display = "block";
                }
                if (self2.daysContainer !== void 0) {
                  var daysWidth = (self2.days.offsetWidth + 1) * config.showMonths;
                  self2.daysContainer.style.width = daysWidth + "px";
                  self2.calendarContainer.style.width = daysWidth + (self2.weekWrapper !== void 0 ? self2.weekWrapper.offsetWidth : 0) + "px";
                  self2.calendarContainer.style.removeProperty("visibility");
                  self2.calendarContainer.style.removeProperty("display");
                }
              });
            }
          }
          function updateTime(e) {
            if (self2.selectedDates.length === 0) {
              var defaultDate = self2.config.minDate === void 0 || compareDates(/* @__PURE__ */ new Date(), self2.config.minDate) >= 0 ? /* @__PURE__ */ new Date() : new Date(self2.config.minDate.getTime());
              var defaults2 = getDefaultHours(self2.config);
              defaultDate.setHours(defaults2.hours, defaults2.minutes, defaults2.seconds, defaultDate.getMilliseconds());
              self2.selectedDates = [defaultDate];
              self2.latestSelectedDateObj = defaultDate;
            }
            if (e !== void 0 && e.type !== "blur") {
              timeWrapper(e);
            }
            var prevValue = self2._input.value;
            setHoursFromInputs();
            updateValue();
            if (self2._input.value !== prevValue) {
              self2._debouncedChange();
            }
          }
          function ampm2military(hour, amPM) {
            return hour % 12 + 12 * int(amPM === self2.l10n.amPM[1]);
          }
          function military2ampm(hour) {
            switch (hour % 24) {
              case 0:
              case 12:
                return 12;
              default:
                return hour % 12;
            }
          }
          function setHoursFromInputs() {
            if (self2.hourElement === void 0 || self2.minuteElement === void 0)
              return;
            var hours = (parseInt(self2.hourElement.value.slice(-2), 10) || 0) % 24, minutes = (parseInt(self2.minuteElement.value, 10) || 0) % 60, seconds = self2.secondElement !== void 0 ? (parseInt(self2.secondElement.value, 10) || 0) % 60 : 0;
            if (self2.amPM !== void 0) {
              hours = ampm2military(hours, self2.amPM.textContent);
            }
            var limitMinHours = self2.config.minTime !== void 0 || self2.config.minDate && self2.minDateHasTime && self2.latestSelectedDateObj && compareDates(self2.latestSelectedDateObj, self2.config.minDate, true) === 0;
            var limitMaxHours = self2.config.maxTime !== void 0 || self2.config.maxDate && self2.maxDateHasTime && self2.latestSelectedDateObj && compareDates(self2.latestSelectedDateObj, self2.config.maxDate, true) === 0;
            if (self2.config.maxTime !== void 0 && self2.config.minTime !== void 0 && self2.config.minTime > self2.config.maxTime) {
              var minBound = calculateSecondsSinceMidnight(self2.config.minTime.getHours(), self2.config.minTime.getMinutes(), self2.config.minTime.getSeconds());
              var maxBound = calculateSecondsSinceMidnight(self2.config.maxTime.getHours(), self2.config.maxTime.getMinutes(), self2.config.maxTime.getSeconds());
              var currentTime = calculateSecondsSinceMidnight(hours, minutes, seconds);
              if (currentTime > maxBound && currentTime < minBound) {
                var result = parseSeconds(minBound);
                hours = result[0];
                minutes = result[1];
                seconds = result[2];
              }
            } else {
              if (limitMaxHours) {
                var maxTime = self2.config.maxTime !== void 0 ? self2.config.maxTime : self2.config.maxDate;
                hours = Math.min(hours, maxTime.getHours());
                if (hours === maxTime.getHours())
                  minutes = Math.min(minutes, maxTime.getMinutes());
                if (minutes === maxTime.getMinutes())
                  seconds = Math.min(seconds, maxTime.getSeconds());
              }
              if (limitMinHours) {
                var minTime = self2.config.minTime !== void 0 ? self2.config.minTime : self2.config.minDate;
                hours = Math.max(hours, minTime.getHours());
                if (hours === minTime.getHours() && minutes < minTime.getMinutes())
                  minutes = minTime.getMinutes();
                if (minutes === minTime.getMinutes())
                  seconds = Math.max(seconds, minTime.getSeconds());
              }
            }
            setHours(hours, minutes, seconds);
          }
          function setHoursFromDate(dateObj) {
            var date = dateObj || self2.latestSelectedDateObj;
            if (date && date instanceof Date) {
              setHours(date.getHours(), date.getMinutes(), date.getSeconds());
            }
          }
          function setHours(hours, minutes, seconds) {
            if (self2.latestSelectedDateObj !== void 0) {
              self2.latestSelectedDateObj.setHours(hours % 24, minutes, seconds || 0, 0);
            }
            if (!self2.hourElement || !self2.minuteElement || self2.isMobile)
              return;
            self2.hourElement.value = pad(!self2.config.time_24hr ? (12 + hours) % 12 + 12 * int(hours % 12 === 0) : hours);
            self2.minuteElement.value = pad(minutes);
            if (self2.amPM !== void 0)
              self2.amPM.textContent = self2.l10n.amPM[int(hours >= 12)];
            if (self2.secondElement !== void 0)
              self2.secondElement.value = pad(seconds);
          }
          function onYearInput(event) {
            var eventTarget = getEventTarget(event);
            var year = parseInt(eventTarget.value) + (event.delta || 0);
            if (year / 1e3 > 1 || event.key === "Enter" && !/[^\d]/.test(year.toString())) {
              changeYear(year);
            }
          }
          function bind(element2, event, handler, options) {
            if (event instanceof Array)
              return event.forEach(function(ev) {
                return bind(element2, ev, handler, options);
              });
            if (element2 instanceof Array)
              return element2.forEach(function(el) {
                return bind(el, event, handler, options);
              });
            element2.addEventListener(event, handler, options);
            self2._handlers.push({
              remove: function() {
                return element2.removeEventListener(event, handler, options);
              }
            });
          }
          function triggerChange() {
            triggerEvent("onChange");
          }
          function bindEvents() {
            if (self2.config.wrap) {
              ["open", "close", "toggle", "clear"].forEach(function(evt) {
                Array.prototype.forEach.call(self2.element.querySelectorAll("[data-" + evt + "]"), function(el) {
                  return bind(el, "click", self2[evt]);
                });
              });
            }
            if (self2.isMobile) {
              setupMobile();
              return;
            }
            var debouncedResize = debounce(onResize, 50);
            self2._debouncedChange = debounce(triggerChange, DEBOUNCED_CHANGE_MS);
            if (self2.daysContainer && !/iPhone|iPad|iPod/i.test(navigator.userAgent))
              bind(self2.daysContainer, "mouseover", function(e) {
                if (self2.config.mode === "range")
                  onMouseOver(getEventTarget(e));
              });
            bind(self2._input, "keydown", onKeyDown);
            if (self2.calendarContainer !== void 0) {
              bind(self2.calendarContainer, "keydown", onKeyDown);
            }
            if (!self2.config.inline && !self2.config.static)
              bind(window, "resize", debouncedResize);
            if (window.ontouchstart !== void 0)
              bind(window.document, "touchstart", documentClick);
            else
              bind(window.document, "mousedown", documentClick);
            bind(window.document, "focus", documentClick, { capture: true });
            if (self2.config.clickOpens === true) {
              bind(self2._input, "focus", self2.open);
              bind(self2._input, "click", self2.open);
            }
            if (self2.daysContainer !== void 0) {
              bind(self2.monthNav, "click", onMonthNavClick);
              bind(self2.monthNav, ["keyup", "increment"], onYearInput);
              bind(self2.daysContainer, "click", selectDate);
            }
            if (self2.timeContainer !== void 0 && self2.minuteElement !== void 0 && self2.hourElement !== void 0) {
              var selText = function(e) {
                return getEventTarget(e).select();
              };
              bind(self2.timeContainer, ["increment"], updateTime);
              bind(self2.timeContainer, "blur", updateTime, { capture: true });
              bind(self2.timeContainer, "click", timeIncrement);
              bind([self2.hourElement, self2.minuteElement], ["focus", "click"], selText);
              if (self2.secondElement !== void 0)
                bind(self2.secondElement, "focus", function() {
                  return self2.secondElement && self2.secondElement.select();
                });
              if (self2.amPM !== void 0) {
                bind(self2.amPM, "click", function(e) {
                  updateTime(e);
                });
              }
            }
            if (self2.config.allowInput) {
              bind(self2._input, "blur", onBlur);
            }
          }
          function jumpToDate(jumpDate, triggerChange2) {
            var jumpTo = jumpDate !== void 0 ? self2.parseDate(jumpDate) : self2.latestSelectedDateObj || (self2.config.minDate && self2.config.minDate > self2.now ? self2.config.minDate : self2.config.maxDate && self2.config.maxDate < self2.now ? self2.config.maxDate : self2.now);
            var oldYear = self2.currentYear;
            var oldMonth = self2.currentMonth;
            try {
              if (jumpTo !== void 0) {
                self2.currentYear = jumpTo.getFullYear();
                self2.currentMonth = jumpTo.getMonth();
              }
            } catch (e) {
              e.message = "Invalid date supplied: " + jumpTo;
              self2.config.errorHandler(e);
            }
            if (triggerChange2 && self2.currentYear !== oldYear) {
              triggerEvent("onYearChange");
              buildMonthSwitch();
            }
            if (triggerChange2 && (self2.currentYear !== oldYear || self2.currentMonth !== oldMonth)) {
              triggerEvent("onMonthChange");
            }
            self2.redraw();
          }
          function timeIncrement(e) {
            var eventTarget = getEventTarget(e);
            if (~eventTarget.className.indexOf("arrow"))
              incrementNumInput(e, eventTarget.classList.contains("arrowUp") ? 1 : -1);
          }
          function incrementNumInput(e, delta, inputElem) {
            var target = e && getEventTarget(e);
            var input = inputElem || target && target.parentNode && target.parentNode.firstChild;
            var event = createEvent("increment");
            event.delta = delta;
            input && input.dispatchEvent(event);
          }
          function build() {
            var fragment = window.document.createDocumentFragment();
            self2.calendarContainer = createElement("div", "flatpickr-calendar");
            self2.calendarContainer.tabIndex = -1;
            if (!self2.config.noCalendar) {
              fragment.appendChild(buildMonthNav());
              self2.innerContainer = createElement("div", "flatpickr-innerContainer");
              if (self2.config.weekNumbers) {
                var _a = buildWeeks(), weekWrapper = _a.weekWrapper, weekNumbers = _a.weekNumbers;
                self2.innerContainer.appendChild(weekWrapper);
                self2.weekNumbers = weekNumbers;
                self2.weekWrapper = weekWrapper;
              }
              self2.rContainer = createElement("div", "flatpickr-rContainer");
              self2.rContainer.appendChild(buildWeekdays());
              if (!self2.daysContainer) {
                self2.daysContainer = createElement("div", "flatpickr-days");
                self2.daysContainer.tabIndex = -1;
              }
              buildDays();
              self2.rContainer.appendChild(self2.daysContainer);
              self2.innerContainer.appendChild(self2.rContainer);
              fragment.appendChild(self2.innerContainer);
            }
            if (self2.config.enableTime) {
              fragment.appendChild(buildTime());
            }
            toggleClass(self2.calendarContainer, "rangeMode", self2.config.mode === "range");
            toggleClass(self2.calendarContainer, "animate", self2.config.animate === true);
            toggleClass(self2.calendarContainer, "multiMonth", self2.config.showMonths > 1);
            self2.calendarContainer.appendChild(fragment);
            var customAppend = self2.config.appendTo !== void 0 && self2.config.appendTo.nodeType !== void 0;
            if (self2.config.inline || self2.config.static) {
              self2.calendarContainer.classList.add(self2.config.inline ? "inline" : "static");
              if (self2.config.inline) {
                if (!customAppend && self2.element.parentNode)
                  self2.element.parentNode.insertBefore(self2.calendarContainer, self2._input.nextSibling);
                else if (self2.config.appendTo !== void 0)
                  self2.config.appendTo.appendChild(self2.calendarContainer);
              }
              if (self2.config.static) {
                var wrapper = createElement("div", "flatpickr-wrapper");
                if (self2.element.parentNode)
                  self2.element.parentNode.insertBefore(wrapper, self2.element);
                wrapper.appendChild(self2.element);
                if (self2.altInput)
                  wrapper.appendChild(self2.altInput);
                wrapper.appendChild(self2.calendarContainer);
              }
            }
            if (!self2.config.static && !self2.config.inline)
              (self2.config.appendTo !== void 0 ? self2.config.appendTo : window.document.body).appendChild(self2.calendarContainer);
          }
          function createDay(className, date, _dayNumber, i) {
            var dateIsEnabled = isEnabled(date, true), dayElement = createElement("span", className, date.getDate().toString());
            dayElement.dateObj = date;
            dayElement.$i = i;
            dayElement.setAttribute("aria-label", self2.formatDate(date, self2.config.ariaDateFormat));
            if (className.indexOf("hidden") === -1 && compareDates(date, self2.now) === 0) {
              self2.todayDateElem = dayElement;
              dayElement.classList.add("today");
              dayElement.setAttribute("aria-current", "date");
            }
            if (dateIsEnabled) {
              dayElement.tabIndex = -1;
              if (isDateSelected(date)) {
                dayElement.classList.add("selected");
                self2.selectedDateElem = dayElement;
                if (self2.config.mode === "range") {
                  toggleClass(dayElement, "startRange", self2.selectedDates[0] && compareDates(date, self2.selectedDates[0], true) === 0);
                  toggleClass(dayElement, "endRange", self2.selectedDates[1] && compareDates(date, self2.selectedDates[1], true) === 0);
                  if (className === "nextMonthDay")
                    dayElement.classList.add("inRange");
                }
              }
            } else {
              dayElement.classList.add("flatpickr-disabled");
            }
            if (self2.config.mode === "range") {
              if (isDateInRange(date) && !isDateSelected(date))
                dayElement.classList.add("inRange");
            }
            if (self2.weekNumbers && self2.config.showMonths === 1 && className !== "prevMonthDay" && i % 7 === 6) {
              self2.weekNumbers.insertAdjacentHTML("beforeend", "<span class='flatpickr-day'>" + self2.config.getWeek(date) + "</span>");
            }
            triggerEvent("onDayCreate", dayElement);
            return dayElement;
          }
          function focusOnDayElem(targetNode) {
            targetNode.focus();
            if (self2.config.mode === "range")
              onMouseOver(targetNode);
          }
          function getFirstAvailableDay(delta) {
            var startMonth = delta > 0 ? 0 : self2.config.showMonths - 1;
            var endMonth = delta > 0 ? self2.config.showMonths : -1;
            for (var m = startMonth; m != endMonth; m += delta) {
              var month = self2.daysContainer.children[m];
              var startIndex = delta > 0 ? 0 : month.children.length - 1;
              var endIndex = delta > 0 ? month.children.length : -1;
              for (var i = startIndex; i != endIndex; i += delta) {
                var c = month.children[i];
                if (c.className.indexOf("hidden") === -1 && isEnabled(c.dateObj))
                  return c;
              }
            }
            return void 0;
          }
          function getNextAvailableDay(current, delta) {
            var givenMonth = current.className.indexOf("Month") === -1 ? current.dateObj.getMonth() : self2.currentMonth;
            var endMonth = delta > 0 ? self2.config.showMonths : -1;
            var loopDelta = delta > 0 ? 1 : -1;
            for (var m = givenMonth - self2.currentMonth; m != endMonth; m += loopDelta) {
              var month = self2.daysContainer.children[m];
              var startIndex = givenMonth - self2.currentMonth === m ? current.$i + delta : delta < 0 ? month.children.length - 1 : 0;
              var numMonthDays = month.children.length;
              for (var i = startIndex; i >= 0 && i < numMonthDays && i != (delta > 0 ? numMonthDays : -1); i += loopDelta) {
                var c = month.children[i];
                if (c.className.indexOf("hidden") === -1 && isEnabled(c.dateObj) && Math.abs(current.$i - i) >= Math.abs(delta))
                  return focusOnDayElem(c);
              }
            }
            self2.changeMonth(loopDelta);
            focusOnDay(getFirstAvailableDay(loopDelta), 0);
            return void 0;
          }
          function focusOnDay(current, offset) {
            var activeElement = getClosestActiveElement();
            var dayFocused = isInView(activeElement || document.body);
            var startElem = current !== void 0 ? current : dayFocused ? activeElement : self2.selectedDateElem !== void 0 && isInView(self2.selectedDateElem) ? self2.selectedDateElem : self2.todayDateElem !== void 0 && isInView(self2.todayDateElem) ? self2.todayDateElem : getFirstAvailableDay(offset > 0 ? 1 : -1);
            if (startElem === void 0) {
              self2._input.focus();
            } else if (!dayFocused) {
              focusOnDayElem(startElem);
            } else {
              getNextAvailableDay(startElem, offset);
            }
          }
          function buildMonthDays(year, month) {
            var firstOfMonth = (new Date(year, month, 1).getDay() - self2.l10n.firstDayOfWeek + 7) % 7;
            var prevMonthDays = self2.utils.getDaysInMonth((month - 1 + 12) % 12, year);
            var daysInMonth = self2.utils.getDaysInMonth(month, year), days = window.document.createDocumentFragment(), isMultiMonth = self2.config.showMonths > 1, prevMonthDayClass = isMultiMonth ? "prevMonthDay hidden" : "prevMonthDay", nextMonthDayClass = isMultiMonth ? "nextMonthDay hidden" : "nextMonthDay";
            var dayNumber = prevMonthDays + 1 - firstOfMonth, dayIndex = 0;
            for (; dayNumber <= prevMonthDays; dayNumber++, dayIndex++) {
              days.appendChild(createDay("flatpickr-day " + prevMonthDayClass, new Date(year, month - 1, dayNumber), dayNumber, dayIndex));
            }
            for (dayNumber = 1; dayNumber <= daysInMonth; dayNumber++, dayIndex++) {
              days.appendChild(createDay("flatpickr-day", new Date(year, month, dayNumber), dayNumber, dayIndex));
            }
            for (var dayNum = daysInMonth + 1; dayNum <= 42 - firstOfMonth && (self2.config.showMonths === 1 || dayIndex % 7 !== 0); dayNum++, dayIndex++) {
              days.appendChild(createDay("flatpickr-day " + nextMonthDayClass, new Date(year, month + 1, dayNum % daysInMonth), dayNum, dayIndex));
            }
            var dayContainer = createElement("div", "dayContainer");
            dayContainer.appendChild(days);
            return dayContainer;
          }
          function buildDays() {
            if (self2.daysContainer === void 0) {
              return;
            }
            clearNode(self2.daysContainer);
            if (self2.weekNumbers)
              clearNode(self2.weekNumbers);
            var frag = document.createDocumentFragment();
            for (var i = 0; i < self2.config.showMonths; i++) {
              var d = new Date(self2.currentYear, self2.currentMonth, 1);
              d.setMonth(self2.currentMonth + i);
              frag.appendChild(buildMonthDays(d.getFullYear(), d.getMonth()));
            }
            self2.daysContainer.appendChild(frag);
            self2.days = self2.daysContainer.firstChild;
            if (self2.config.mode === "range" && self2.selectedDates.length === 1) {
              onMouseOver();
            }
          }
          function buildMonthSwitch() {
            if (self2.config.showMonths > 1 || self2.config.monthSelectorType !== "dropdown")
              return;
            var shouldBuildMonth = function(month2) {
              if (self2.config.minDate !== void 0 && self2.currentYear === self2.config.minDate.getFullYear() && month2 < self2.config.minDate.getMonth()) {
                return false;
              }
              return !(self2.config.maxDate !== void 0 && self2.currentYear === self2.config.maxDate.getFullYear() && month2 > self2.config.maxDate.getMonth());
            };
            self2.monthsDropdownContainer.tabIndex = -1;
            self2.monthsDropdownContainer.innerHTML = "";
            for (var i = 0; i < 12; i++) {
              if (!shouldBuildMonth(i))
                continue;
              var month = createElement("option", "flatpickr-monthDropdown-month");
              month.value = new Date(self2.currentYear, i).getMonth().toString();
              month.textContent = monthToStr(i, self2.config.shorthandCurrentMonth, self2.l10n);
              month.tabIndex = -1;
              if (self2.currentMonth === i) {
                month.selected = true;
              }
              self2.monthsDropdownContainer.appendChild(month);
            }
          }
          function buildMonth() {
            var container = createElement("div", "flatpickr-month");
            var monthNavFragment = window.document.createDocumentFragment();
            var monthElement;
            if (self2.config.showMonths > 1 || self2.config.monthSelectorType === "static") {
              monthElement = createElement("span", "cur-month");
            } else {
              self2.monthsDropdownContainer = createElement("select", "flatpickr-monthDropdown-months");
              self2.monthsDropdownContainer.setAttribute("aria-label", self2.l10n.monthAriaLabel);
              bind(self2.monthsDropdownContainer, "change", function(e) {
                var target = getEventTarget(e);
                var selectedMonth = parseInt(target.value, 10);
                self2.changeMonth(selectedMonth - self2.currentMonth);
                triggerEvent("onMonthChange");
              });
              buildMonthSwitch();
              monthElement = self2.monthsDropdownContainer;
            }
            var yearInput = createNumberInput("cur-year", { tabindex: "-1" });
            var yearElement = yearInput.getElementsByTagName("input")[0];
            yearElement.setAttribute("aria-label", self2.l10n.yearAriaLabel);
            if (self2.config.minDate) {
              yearElement.setAttribute("min", self2.config.minDate.getFullYear().toString());
            }
            if (self2.config.maxDate) {
              yearElement.setAttribute("max", self2.config.maxDate.getFullYear().toString());
              yearElement.disabled = !!self2.config.minDate && self2.config.minDate.getFullYear() === self2.config.maxDate.getFullYear();
            }
            var currentMonth = createElement("div", "flatpickr-current-month");
            currentMonth.appendChild(monthElement);
            currentMonth.appendChild(yearInput);
            monthNavFragment.appendChild(currentMonth);
            container.appendChild(monthNavFragment);
            return {
              container,
              yearElement,
              monthElement
            };
          }
          function buildMonths() {
            clearNode(self2.monthNav);
            self2.monthNav.appendChild(self2.prevMonthNav);
            if (self2.config.showMonths) {
              self2.yearElements = [];
              self2.monthElements = [];
            }
            for (var m = self2.config.showMonths; m--; ) {
              var month = buildMonth();
              self2.yearElements.push(month.yearElement);
              self2.monthElements.push(month.monthElement);
              self2.monthNav.appendChild(month.container);
            }
            self2.monthNav.appendChild(self2.nextMonthNav);
          }
          function buildMonthNav() {
            self2.monthNav = createElement("div", "flatpickr-months");
            self2.yearElements = [];
            self2.monthElements = [];
            self2.prevMonthNav = createElement("span", "flatpickr-prev-month");
            self2.prevMonthNav.innerHTML = self2.config.prevArrow;
            self2.nextMonthNav = createElement("span", "flatpickr-next-month");
            self2.nextMonthNav.innerHTML = self2.config.nextArrow;
            buildMonths();
            Object.defineProperty(self2, "_hidePrevMonthArrow", {
              get: function() {
                return self2.__hidePrevMonthArrow;
              },
              set: function(bool) {
                if (self2.__hidePrevMonthArrow !== bool) {
                  toggleClass(self2.prevMonthNav, "flatpickr-disabled", bool);
                  self2.__hidePrevMonthArrow = bool;
                }
              }
            });
            Object.defineProperty(self2, "_hideNextMonthArrow", {
              get: function() {
                return self2.__hideNextMonthArrow;
              },
              set: function(bool) {
                if (self2.__hideNextMonthArrow !== bool) {
                  toggleClass(self2.nextMonthNav, "flatpickr-disabled", bool);
                  self2.__hideNextMonthArrow = bool;
                }
              }
            });
            self2.currentYearElement = self2.yearElements[0];
            updateNavigationCurrentMonth();
            return self2.monthNav;
          }
          function buildTime() {
            self2.calendarContainer.classList.add("hasTime");
            if (self2.config.noCalendar)
              self2.calendarContainer.classList.add("noCalendar");
            var defaults2 = getDefaultHours(self2.config);
            self2.timeContainer = createElement("div", "flatpickr-time");
            self2.timeContainer.tabIndex = -1;
            var separator = createElement("span", "flatpickr-time-separator", ":");
            var hourInput = createNumberInput("flatpickr-hour", {
              "aria-label": self2.l10n.hourAriaLabel
            });
            self2.hourElement = hourInput.getElementsByTagName("input")[0];
            var minuteInput = createNumberInput("flatpickr-minute", {
              "aria-label": self2.l10n.minuteAriaLabel
            });
            self2.minuteElement = minuteInput.getElementsByTagName("input")[0];
            self2.hourElement.tabIndex = self2.minuteElement.tabIndex = -1;
            self2.hourElement.value = pad(self2.latestSelectedDateObj ? self2.latestSelectedDateObj.getHours() : self2.config.time_24hr ? defaults2.hours : military2ampm(defaults2.hours));
            self2.minuteElement.value = pad(self2.latestSelectedDateObj ? self2.latestSelectedDateObj.getMinutes() : defaults2.minutes);
            self2.hourElement.setAttribute("step", self2.config.hourIncrement.toString());
            self2.minuteElement.setAttribute("step", self2.config.minuteIncrement.toString());
            self2.hourElement.setAttribute("min", self2.config.time_24hr ? "0" : "1");
            self2.hourElement.setAttribute("max", self2.config.time_24hr ? "23" : "12");
            self2.hourElement.setAttribute("maxlength", "2");
            self2.minuteElement.setAttribute("min", "0");
            self2.minuteElement.setAttribute("max", "59");
            self2.minuteElement.setAttribute("maxlength", "2");
            self2.timeContainer.appendChild(hourInput);
            self2.timeContainer.appendChild(separator);
            self2.timeContainer.appendChild(minuteInput);
            if (self2.config.time_24hr)
              self2.timeContainer.classList.add("time24hr");
            if (self2.config.enableSeconds) {
              self2.timeContainer.classList.add("hasSeconds");
              var secondInput = createNumberInput("flatpickr-second");
              self2.secondElement = secondInput.getElementsByTagName("input")[0];
              self2.secondElement.value = pad(self2.latestSelectedDateObj ? self2.latestSelectedDateObj.getSeconds() : defaults2.seconds);
              self2.secondElement.setAttribute("step", self2.minuteElement.getAttribute("step"));
              self2.secondElement.setAttribute("min", "0");
              self2.secondElement.setAttribute("max", "59");
              self2.secondElement.setAttribute("maxlength", "2");
              self2.timeContainer.appendChild(createElement("span", "flatpickr-time-separator", ":"));
              self2.timeContainer.appendChild(secondInput);
            }
            if (!self2.config.time_24hr) {
              self2.amPM = createElement("span", "flatpickr-am-pm", self2.l10n.amPM[int((self2.latestSelectedDateObj ? self2.hourElement.value : self2.config.defaultHour) > 11)]);
              self2.amPM.title = self2.l10n.toggleTitle;
              self2.amPM.tabIndex = -1;
              self2.timeContainer.appendChild(self2.amPM);
            }
            return self2.timeContainer;
          }
          function buildWeekdays() {
            if (!self2.weekdayContainer)
              self2.weekdayContainer = createElement("div", "flatpickr-weekdays");
            else
              clearNode(self2.weekdayContainer);
            for (var i = self2.config.showMonths; i--; ) {
              var container = createElement("div", "flatpickr-weekdaycontainer");
              self2.weekdayContainer.appendChild(container);
            }
            updateWeekdays();
            return self2.weekdayContainer;
          }
          function updateWeekdays() {
            if (!self2.weekdayContainer) {
              return;
            }
            var firstDayOfWeek = self2.l10n.firstDayOfWeek;
            var weekdays = __spreadArrays(self2.l10n.weekdays.shorthand);
            if (firstDayOfWeek > 0 && firstDayOfWeek < weekdays.length) {
              weekdays = __spreadArrays(weekdays.splice(firstDayOfWeek, weekdays.length), weekdays.splice(0, firstDayOfWeek));
            }
            for (var i = self2.config.showMonths; i--; ) {
              self2.weekdayContainer.children[i].innerHTML = "\n      <span class='flatpickr-weekday'>\n        " + weekdays.join("</span><span class='flatpickr-weekday'>") + "\n      </span>\n      ";
            }
          }
          function buildWeeks() {
            self2.calendarContainer.classList.add("hasWeeks");
            var weekWrapper = createElement("div", "flatpickr-weekwrapper");
            weekWrapper.appendChild(createElement("span", "flatpickr-weekday", self2.l10n.weekAbbreviation));
            var weekNumbers = createElement("div", "flatpickr-weeks");
            weekWrapper.appendChild(weekNumbers);
            return {
              weekWrapper,
              weekNumbers
            };
          }
          function changeMonth(value, isOffset) {
            if (isOffset === void 0) {
              isOffset = true;
            }
            var delta = isOffset ? value : value - self2.currentMonth;
            if (delta < 0 && self2._hidePrevMonthArrow === true || delta > 0 && self2._hideNextMonthArrow === true)
              return;
            self2.currentMonth += delta;
            if (self2.currentMonth < 0 || self2.currentMonth > 11) {
              self2.currentYear += self2.currentMonth > 11 ? 1 : -1;
              self2.currentMonth = (self2.currentMonth + 12) % 12;
              triggerEvent("onYearChange");
              buildMonthSwitch();
            }
            buildDays();
            triggerEvent("onMonthChange");
            updateNavigationCurrentMonth();
          }
          function clear(triggerChangeEvent, toInitial) {
            if (triggerChangeEvent === void 0) {
              triggerChangeEvent = true;
            }
            if (toInitial === void 0) {
              toInitial = true;
            }
            self2.input.value = "";
            if (self2.altInput !== void 0)
              self2.altInput.value = "";
            if (self2.mobileInput !== void 0)
              self2.mobileInput.value = "";
            self2.selectedDates = [];
            self2.latestSelectedDateObj = void 0;
            if (toInitial === true) {
              self2.currentYear = self2._initialDate.getFullYear();
              self2.currentMonth = self2._initialDate.getMonth();
            }
            if (self2.config.enableTime === true) {
              var _a = getDefaultHours(self2.config), hours = _a.hours, minutes = _a.minutes, seconds = _a.seconds;
              setHours(hours, minutes, seconds);
            }
            self2.redraw();
            if (triggerChangeEvent)
              triggerEvent("onChange");
          }
          function close() {
            self2.isOpen = false;
            if (!self2.isMobile) {
              if (self2.calendarContainer !== void 0) {
                self2.calendarContainer.classList.remove("open");
              }
              if (self2._input !== void 0) {
                self2._input.classList.remove("active");
              }
            }
            triggerEvent("onClose");
          }
          function destroy() {
            if (self2.config !== void 0)
              triggerEvent("onDestroy");
            for (var i = self2._handlers.length; i--; ) {
              self2._handlers[i].remove();
            }
            self2._handlers = [];
            if (self2.mobileInput) {
              if (self2.mobileInput.parentNode)
                self2.mobileInput.parentNode.removeChild(self2.mobileInput);
              self2.mobileInput = void 0;
            } else if (self2.calendarContainer && self2.calendarContainer.parentNode) {
              if (self2.config.static && self2.calendarContainer.parentNode) {
                var wrapper = self2.calendarContainer.parentNode;
                wrapper.lastChild && wrapper.removeChild(wrapper.lastChild);
                if (wrapper.parentNode) {
                  while (wrapper.firstChild)
                    wrapper.parentNode.insertBefore(wrapper.firstChild, wrapper);
                  wrapper.parentNode.removeChild(wrapper);
                }
              } else
                self2.calendarContainer.parentNode.removeChild(self2.calendarContainer);
            }
            if (self2.altInput) {
              self2.input.type = "text";
              if (self2.altInput.parentNode)
                self2.altInput.parentNode.removeChild(self2.altInput);
              delete self2.altInput;
            }
            if (self2.input) {
              self2.input.type = self2.input._type;
              self2.input.classList.remove("flatpickr-input");
              self2.input.removeAttribute("readonly");
            }
            [
              "_showTimeInput",
              "latestSelectedDateObj",
              "_hideNextMonthArrow",
              "_hidePrevMonthArrow",
              "__hideNextMonthArrow",
              "__hidePrevMonthArrow",
              "isMobile",
              "isOpen",
              "selectedDateElem",
              "minDateHasTime",
              "maxDateHasTime",
              "days",
              "daysContainer",
              "_input",
              "_positionElement",
              "innerContainer",
              "rContainer",
              "monthNav",
              "todayDateElem",
              "calendarContainer",
              "weekdayContainer",
              "prevMonthNav",
              "nextMonthNav",
              "monthsDropdownContainer",
              "currentMonthElement",
              "currentYearElement",
              "navigationCurrentMonth",
              "selectedDateElem",
              "config"
            ].forEach(function(k) {
              try {
                delete self2[k];
              } catch (_) {
              }
            });
          }
          function isCalendarElem(elem) {
            return self2.calendarContainer.contains(elem);
          }
          function documentClick(e) {
            if (self2.isOpen && !self2.config.inline) {
              var eventTarget_1 = getEventTarget(e);
              var isCalendarElement = isCalendarElem(eventTarget_1);
              var isInput = eventTarget_1 === self2.input || eventTarget_1 === self2.altInput || self2.element.contains(eventTarget_1) || // web components
              // e.path is not present in all browsers. circumventing typechecks
              e.path && e.path.indexOf && (~e.path.indexOf(self2.input) || ~e.path.indexOf(self2.altInput));
              var lostFocus = !isInput && !isCalendarElement && !isCalendarElem(e.relatedTarget);
              var isIgnored = !self2.config.ignoredFocusElements.some(function(elem) {
                return elem.contains(eventTarget_1);
              });
              if (lostFocus && isIgnored) {
                if (self2.config.allowInput) {
                  self2.setDate(self2._input.value, false, self2.config.altInput ? self2.config.altFormat : self2.config.dateFormat);
                }
                if (self2.timeContainer !== void 0 && self2.minuteElement !== void 0 && self2.hourElement !== void 0 && self2.input.value !== "" && self2.input.value !== void 0) {
                  updateTime();
                }
                self2.close();
                if (self2.config && self2.config.mode === "range" && self2.selectedDates.length === 1)
                  self2.clear(false);
              }
            }
          }
          function changeYear(newYear) {
            if (!newYear || self2.config.minDate && newYear < self2.config.minDate.getFullYear() || self2.config.maxDate && newYear > self2.config.maxDate.getFullYear())
              return;
            var newYearNum = newYear, isNewYear = self2.currentYear !== newYearNum;
            self2.currentYear = newYearNum || self2.currentYear;
            if (self2.config.maxDate && self2.currentYear === self2.config.maxDate.getFullYear()) {
              self2.currentMonth = Math.min(self2.config.maxDate.getMonth(), self2.currentMonth);
            } else if (self2.config.minDate && self2.currentYear === self2.config.minDate.getFullYear()) {
              self2.currentMonth = Math.max(self2.config.minDate.getMonth(), self2.currentMonth);
            }
            if (isNewYear) {
              self2.redraw();
              triggerEvent("onYearChange");
              buildMonthSwitch();
            }
          }
          function isEnabled(date, timeless) {
            var _a;
            if (timeless === void 0) {
              timeless = true;
            }
            var dateToCheck = self2.parseDate(date, void 0, timeless);
            if (self2.config.minDate && dateToCheck && compareDates(dateToCheck, self2.config.minDate, timeless !== void 0 ? timeless : !self2.minDateHasTime) < 0 || self2.config.maxDate && dateToCheck && compareDates(dateToCheck, self2.config.maxDate, timeless !== void 0 ? timeless : !self2.maxDateHasTime) > 0)
              return false;
            if (!self2.config.enable && self2.config.disable.length === 0)
              return true;
            if (dateToCheck === void 0)
              return false;
            var bool = !!self2.config.enable, array = (_a = self2.config.enable) !== null && _a !== void 0 ? _a : self2.config.disable;
            for (var i = 0, d = void 0; i < array.length; i++) {
              d = array[i];
              if (typeof d === "function" && d(dateToCheck))
                return bool;
              else if (d instanceof Date && dateToCheck !== void 0 && d.getTime() === dateToCheck.getTime())
                return bool;
              else if (typeof d === "string") {
                var parsed = self2.parseDate(d, void 0, true);
                return parsed && parsed.getTime() === dateToCheck.getTime() ? bool : !bool;
              } else if (
                // disabled by range
                typeof d === "object" && dateToCheck !== void 0 && d.from && d.to && dateToCheck.getTime() >= d.from.getTime() && dateToCheck.getTime() <= d.to.getTime()
              )
                return bool;
            }
            return !bool;
          }
          function isInView(elem) {
            if (self2.daysContainer !== void 0)
              return elem.className.indexOf("hidden") === -1 && elem.className.indexOf("flatpickr-disabled") === -1 && self2.daysContainer.contains(elem);
            return false;
          }
          function onBlur(e) {
            var isInput = e.target === self2._input;
            var valueChanged = self2._input.value.trimEnd() !== getDateStr();
            if (isInput && valueChanged && !(e.relatedTarget && isCalendarElem(e.relatedTarget))) {
              self2.setDate(self2._input.value, true, e.target === self2.altInput ? self2.config.altFormat : self2.config.dateFormat);
            }
          }
          function onKeyDown(e) {
            var eventTarget = getEventTarget(e);
            var isInput = self2.config.wrap ? element.contains(eventTarget) : eventTarget === self2._input;
            var allowInput = self2.config.allowInput;
            var allowKeydown = self2.isOpen && (!allowInput || !isInput);
            var allowInlineKeydown = self2.config.inline && isInput && !allowInput;
            if (e.keyCode === 13 && isInput) {
              if (allowInput) {
                self2.setDate(self2._input.value, true, eventTarget === self2.altInput ? self2.config.altFormat : self2.config.dateFormat);
                self2.close();
                return eventTarget.blur();
              } else {
                self2.open();
              }
            } else if (isCalendarElem(eventTarget) || allowKeydown || allowInlineKeydown) {
              var isTimeObj = !!self2.timeContainer && self2.timeContainer.contains(eventTarget);
              switch (e.keyCode) {
                case 13:
                  if (isTimeObj) {
                    e.preventDefault();
                    updateTime();
                    focusAndClose();
                  } else
                    selectDate(e);
                  break;
                case 27:
                  e.preventDefault();
                  focusAndClose();
                  break;
                case 8:
                case 46:
                  if (isInput && !self2.config.allowInput) {
                    e.preventDefault();
                    self2.clear();
                  }
                  break;
                case 37:
                case 39:
                  if (!isTimeObj && !isInput) {
                    e.preventDefault();
                    var activeElement = getClosestActiveElement();
                    if (self2.daysContainer !== void 0 && (allowInput === false || activeElement && isInView(activeElement))) {
                      var delta_1 = e.keyCode === 39 ? 1 : -1;
                      if (!e.ctrlKey)
                        focusOnDay(void 0, delta_1);
                      else {
                        e.stopPropagation();
                        changeMonth(delta_1);
                        focusOnDay(getFirstAvailableDay(1), 0);
                      }
                    }
                  } else if (self2.hourElement)
                    self2.hourElement.focus();
                  break;
                case 38:
                case 40:
                  e.preventDefault();
                  var delta = e.keyCode === 40 ? 1 : -1;
                  if (self2.daysContainer && eventTarget.$i !== void 0 || eventTarget === self2.input || eventTarget === self2.altInput) {
                    if (e.ctrlKey) {
                      e.stopPropagation();
                      changeYear(self2.currentYear - delta);
                      focusOnDay(getFirstAvailableDay(1), 0);
                    } else if (!isTimeObj)
                      focusOnDay(void 0, delta * 7);
                  } else if (eventTarget === self2.currentYearElement) {
                    changeYear(self2.currentYear - delta);
                  } else if (self2.config.enableTime) {
                    if (!isTimeObj && self2.hourElement)
                      self2.hourElement.focus();
                    updateTime(e);
                    self2._debouncedChange();
                  }
                  break;
                case 9:
                  if (isTimeObj) {
                    var elems = [
                      self2.hourElement,
                      self2.minuteElement,
                      self2.secondElement,
                      self2.amPM
                    ].concat(self2.pluginElements).filter(function(x) {
                      return x;
                    });
                    var i = elems.indexOf(eventTarget);
                    if (i !== -1) {
                      var target = elems[i + (e.shiftKey ? -1 : 1)];
                      e.preventDefault();
                      (target || self2._input).focus();
                    }
                  } else if (!self2.config.noCalendar && self2.daysContainer && self2.daysContainer.contains(eventTarget) && e.shiftKey) {
                    e.preventDefault();
                    self2._input.focus();
                  }
                  break;
              }
            }
            if (self2.amPM !== void 0 && eventTarget === self2.amPM) {
              switch (e.key) {
                case self2.l10n.amPM[0].charAt(0):
                case self2.l10n.amPM[0].charAt(0).toLowerCase():
                  self2.amPM.textContent = self2.l10n.amPM[0];
                  setHoursFromInputs();
                  updateValue();
                  break;
                case self2.l10n.amPM[1].charAt(0):
                case self2.l10n.amPM[1].charAt(0).toLowerCase():
                  self2.amPM.textContent = self2.l10n.amPM[1];
                  setHoursFromInputs();
                  updateValue();
                  break;
              }
            }
            if (isInput || isCalendarElem(eventTarget)) {
              triggerEvent("onKeyDown", e);
            }
          }
          function onMouseOver(elem, cellClass) {
            if (cellClass === void 0) {
              cellClass = "flatpickr-day";
            }
            if (self2.selectedDates.length !== 1 || elem && (!elem.classList.contains(cellClass) || elem.classList.contains("flatpickr-disabled")))
              return;
            var hoverDate = elem ? elem.dateObj.getTime() : self2.days.firstElementChild.dateObj.getTime(), initialDate = self2.parseDate(self2.selectedDates[0], void 0, true).getTime(), rangeStartDate = Math.min(hoverDate, self2.selectedDates[0].getTime()), rangeEndDate = Math.max(hoverDate, self2.selectedDates[0].getTime());
            var containsDisabled = false;
            var minRange = 0, maxRange = 0;
            for (var t = rangeStartDate; t < rangeEndDate; t += duration.DAY) {
              if (!isEnabled(new Date(t), true)) {
                containsDisabled = containsDisabled || t > rangeStartDate && t < rangeEndDate;
                if (t < initialDate && (!minRange || t > minRange))
                  minRange = t;
                else if (t > initialDate && (!maxRange || t < maxRange))
                  maxRange = t;
              }
            }
            var hoverableCells = Array.from(self2.rContainer.querySelectorAll("*:nth-child(-n+" + self2.config.showMonths + ") > ." + cellClass));
            hoverableCells.forEach(function(dayElem) {
              var date = dayElem.dateObj;
              var timestamp = date.getTime();
              var outOfRange = minRange > 0 && timestamp < minRange || maxRange > 0 && timestamp > maxRange;
              if (outOfRange) {
                dayElem.classList.add("notAllowed");
                ["inRange", "startRange", "endRange"].forEach(function(c) {
                  dayElem.classList.remove(c);
                });
                return;
              } else if (containsDisabled && !outOfRange)
                return;
              ["startRange", "inRange", "endRange", "notAllowed"].forEach(function(c) {
                dayElem.classList.remove(c);
              });
              if (elem !== void 0) {
                elem.classList.add(hoverDate <= self2.selectedDates[0].getTime() ? "startRange" : "endRange");
                if (initialDate < hoverDate && timestamp === initialDate)
                  dayElem.classList.add("startRange");
                else if (initialDate > hoverDate && timestamp === initialDate)
                  dayElem.classList.add("endRange");
                if (timestamp >= minRange && (maxRange === 0 || timestamp <= maxRange) && isBetween(timestamp, initialDate, hoverDate))
                  dayElem.classList.add("inRange");
              }
            });
          }
          function onResize() {
            if (self2.isOpen && !self2.config.static && !self2.config.inline)
              positionCalendar();
          }
          function open(e, positionElement) {
            if (positionElement === void 0) {
              positionElement = self2._positionElement;
            }
            if (self2.isMobile === true) {
              if (e) {
                e.preventDefault();
                var eventTarget = getEventTarget(e);
                if (eventTarget) {
                  eventTarget.blur();
                }
              }
              if (self2.mobileInput !== void 0) {
                self2.mobileInput.focus();
                self2.mobileInput.click();
              }
              triggerEvent("onOpen");
              return;
            } else if (self2._input.disabled || self2.config.inline) {
              return;
            }
            var wasOpen = self2.isOpen;
            self2.isOpen = true;
            if (!wasOpen) {
              self2.calendarContainer.classList.add("open");
              self2._input.classList.add("active");
              triggerEvent("onOpen");
              positionCalendar(positionElement);
            }
            if (self2.config.enableTime === true && self2.config.noCalendar === true) {
              if (self2.config.allowInput === false && (e === void 0 || !self2.timeContainer.contains(e.relatedTarget))) {
                setTimeout(function() {
                  return self2.hourElement.select();
                }, 50);
              }
            }
          }
          function minMaxDateSetter(type) {
            return function(date) {
              var dateObj = self2.config["_" + type + "Date"] = self2.parseDate(date, self2.config.dateFormat);
              var inverseDateObj = self2.config["_" + (type === "min" ? "max" : "min") + "Date"];
              if (dateObj !== void 0) {
                self2[type === "min" ? "minDateHasTime" : "maxDateHasTime"] = dateObj.getHours() > 0 || dateObj.getMinutes() > 0 || dateObj.getSeconds() > 0;
              }
              if (self2.selectedDates) {
                self2.selectedDates = self2.selectedDates.filter(function(d) {
                  return isEnabled(d);
                });
                if (!self2.selectedDates.length && type === "min")
                  setHoursFromDate(dateObj);
                updateValue();
              }
              if (self2.daysContainer) {
                redraw();
                if (dateObj !== void 0)
                  self2.currentYearElement[type] = dateObj.getFullYear().toString();
                else
                  self2.currentYearElement.removeAttribute(type);
                self2.currentYearElement.disabled = !!inverseDateObj && dateObj !== void 0 && inverseDateObj.getFullYear() === dateObj.getFullYear();
              }
            };
          }
          function parseConfig() {
            var boolOpts = [
              "wrap",
              "weekNumbers",
              "allowInput",
              "allowInvalidPreload",
              "clickOpens",
              "time_24hr",
              "enableTime",
              "noCalendar",
              "altInput",
              "shorthandCurrentMonth",
              "inline",
              "static",
              "enableSeconds",
              "disableMobile"
            ];
            var userConfig = __assign(__assign({}, JSON.parse(JSON.stringify(element.dataset || {}))), instanceConfig);
            var formats2 = {};
            self2.config.parseDate = userConfig.parseDate;
            self2.config.formatDate = userConfig.formatDate;
            Object.defineProperty(self2.config, "enable", {
              get: function() {
                return self2.config._enable;
              },
              set: function(dates) {
                self2.config._enable = parseDateRules(dates);
              }
            });
            Object.defineProperty(self2.config, "disable", {
              get: function() {
                return self2.config._disable;
              },
              set: function(dates) {
                self2.config._disable = parseDateRules(dates);
              }
            });
            var timeMode = userConfig.mode === "time";
            if (!userConfig.dateFormat && (userConfig.enableTime || timeMode)) {
              var defaultDateFormat = flatpickr.defaultConfig.dateFormat || defaults.dateFormat;
              formats2.dateFormat = userConfig.noCalendar || timeMode ? "H:i" + (userConfig.enableSeconds ? ":S" : "") : defaultDateFormat + " H:i" + (userConfig.enableSeconds ? ":S" : "");
            }
            if (userConfig.altInput && (userConfig.enableTime || timeMode) && !userConfig.altFormat) {
              var defaultAltFormat = flatpickr.defaultConfig.altFormat || defaults.altFormat;
              formats2.altFormat = userConfig.noCalendar || timeMode ? "h:i" + (userConfig.enableSeconds ? ":S K" : " K") : defaultAltFormat + (" h:i" + (userConfig.enableSeconds ? ":S" : "") + " K");
            }
            Object.defineProperty(self2.config, "minDate", {
              get: function() {
                return self2.config._minDate;
              },
              set: minMaxDateSetter("min")
            });
            Object.defineProperty(self2.config, "maxDate", {
              get: function() {
                return self2.config._maxDate;
              },
              set: minMaxDateSetter("max")
            });
            var minMaxTimeSetter = function(type) {
              return function(val) {
                self2.config[type === "min" ? "_minTime" : "_maxTime"] = self2.parseDate(val, "H:i:S");
              };
            };
            Object.defineProperty(self2.config, "minTime", {
              get: function() {
                return self2.config._minTime;
              },
              set: minMaxTimeSetter("min")
            });
            Object.defineProperty(self2.config, "maxTime", {
              get: function() {
                return self2.config._maxTime;
              },
              set: minMaxTimeSetter("max")
            });
            if (userConfig.mode === "time") {
              self2.config.noCalendar = true;
              self2.config.enableTime = true;
            }
            Object.assign(self2.config, formats2, userConfig);
            for (var i = 0; i < boolOpts.length; i++)
              self2.config[boolOpts[i]] = self2.config[boolOpts[i]] === true || self2.config[boolOpts[i]] === "true";
            HOOKS.filter(function(hook) {
              return self2.config[hook] !== void 0;
            }).forEach(function(hook) {
              self2.config[hook] = arrayify(self2.config[hook] || []).map(bindToInstance);
            });
            self2.isMobile = !self2.config.disableMobile && !self2.config.inline && self2.config.mode === "single" && !self2.config.disable.length && !self2.config.enable && !self2.config.weekNumbers && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
            for (var i = 0; i < self2.config.plugins.length; i++) {
              var pluginConf = self2.config.plugins[i](self2) || {};
              for (var key in pluginConf) {
                if (HOOKS.indexOf(key) > -1) {
                  self2.config[key] = arrayify(pluginConf[key]).map(bindToInstance).concat(self2.config[key]);
                } else if (typeof userConfig[key] === "undefined")
                  self2.config[key] = pluginConf[key];
              }
            }
            if (!userConfig.altInputClass) {
              self2.config.altInputClass = getInputElem().className + " " + self2.config.altInputClass;
            }
            triggerEvent("onParseConfig");
          }
          function getInputElem() {
            return self2.config.wrap ? element.querySelector("[data-input]") : element;
          }
          function setupLocale() {
            if (typeof self2.config.locale !== "object" && typeof flatpickr.l10ns[self2.config.locale] === "undefined")
              self2.config.errorHandler(new Error("flatpickr: invalid locale " + self2.config.locale));
            self2.l10n = __assign(__assign({}, flatpickr.l10ns.default), typeof self2.config.locale === "object" ? self2.config.locale : self2.config.locale !== "default" ? flatpickr.l10ns[self2.config.locale] : void 0);
            tokenRegex.D = "(" + self2.l10n.weekdays.shorthand.join("|") + ")";
            tokenRegex.l = "(" + self2.l10n.weekdays.longhand.join("|") + ")";
            tokenRegex.M = "(" + self2.l10n.months.shorthand.join("|") + ")";
            tokenRegex.F = "(" + self2.l10n.months.longhand.join("|") + ")";
            tokenRegex.K = "(" + self2.l10n.amPM[0] + "|" + self2.l10n.amPM[1] + "|" + self2.l10n.amPM[0].toLowerCase() + "|" + self2.l10n.amPM[1].toLowerCase() + ")";
            var userConfig = __assign(__assign({}, instanceConfig), JSON.parse(JSON.stringify(element.dataset || {})));
            if (userConfig.time_24hr === void 0 && flatpickr.defaultConfig.time_24hr === void 0) {
              self2.config.time_24hr = self2.l10n.time_24hr;
            }
            self2.formatDate = createDateFormatter(self2);
            self2.parseDate = createDateParser({ config: self2.config, l10n: self2.l10n });
          }
          function positionCalendar(customPositionElement) {
            if (typeof self2.config.position === "function") {
              return void self2.config.position(self2, customPositionElement);
            }
            if (self2.calendarContainer === void 0)
              return;
            triggerEvent("onPreCalendarPosition");
            var positionElement = customPositionElement || self2._positionElement;
            var calendarHeight = Array.prototype.reduce.call(self2.calendarContainer.children, (function(acc, child) {
              return acc + child.offsetHeight;
            }), 0), calendarWidth = self2.calendarContainer.offsetWidth, configPos = self2.config.position.split(" "), configPosVertical = configPos[0], configPosHorizontal = configPos.length > 1 ? configPos[1] : null, inputBounds = positionElement.getBoundingClientRect(), distanceFromBottom = window.innerHeight - inputBounds.bottom, showOnTop = configPosVertical === "above" || configPosVertical !== "below" && distanceFromBottom < calendarHeight && inputBounds.top > calendarHeight;
            var top = window.pageYOffset + inputBounds.top + (!showOnTop ? positionElement.offsetHeight + 2 : -calendarHeight - 2);
            toggleClass(self2.calendarContainer, "arrowTop", !showOnTop);
            toggleClass(self2.calendarContainer, "arrowBottom", showOnTop);
            if (self2.config.inline)
              return;
            var left = window.pageXOffset + inputBounds.left;
            var isCenter = false;
            var isRight = false;
            if (configPosHorizontal === "center") {
              left -= (calendarWidth - inputBounds.width) / 2;
              isCenter = true;
            } else if (configPosHorizontal === "right") {
              left -= calendarWidth - inputBounds.width;
              isRight = true;
            }
            toggleClass(self2.calendarContainer, "arrowLeft", !isCenter && !isRight);
            toggleClass(self2.calendarContainer, "arrowCenter", isCenter);
            toggleClass(self2.calendarContainer, "arrowRight", isRight);
            var right = window.document.body.offsetWidth - (window.pageXOffset + inputBounds.right);
            var rightMost = left + calendarWidth > window.document.body.offsetWidth;
            var centerMost = right + calendarWidth > window.document.body.offsetWidth;
            toggleClass(self2.calendarContainer, "rightMost", rightMost);
            if (self2.config.static)
              return;
            self2.calendarContainer.style.top = top + "px";
            if (!rightMost) {
              self2.calendarContainer.style.left = left + "px";
              self2.calendarContainer.style.right = "auto";
            } else if (!centerMost) {
              self2.calendarContainer.style.left = "auto";
              self2.calendarContainer.style.right = right + "px";
            } else {
              var doc = getDocumentStyleSheet();
              if (doc === void 0)
                return;
              var bodyWidth = window.document.body.offsetWidth;
              var centerLeft = Math.max(0, bodyWidth / 2 - calendarWidth / 2);
              var centerBefore = ".flatpickr-calendar.centerMost:before";
              var centerAfter = ".flatpickr-calendar.centerMost:after";
              var centerIndex = doc.cssRules.length;
              var centerStyle = "{left:" + inputBounds.left + "px;right:auto;}";
              toggleClass(self2.calendarContainer, "rightMost", false);
              toggleClass(self2.calendarContainer, "centerMost", true);
              doc.insertRule(centerBefore + "," + centerAfter + centerStyle, centerIndex);
              self2.calendarContainer.style.left = centerLeft + "px";
              self2.calendarContainer.style.right = "auto";
            }
          }
          function getDocumentStyleSheet() {
            var editableSheet = null;
            for (var i = 0; i < document.styleSheets.length; i++) {
              var sheet = document.styleSheets[i];
              if (!sheet.cssRules)
                continue;
              try {
                sheet.cssRules;
              } catch (err) {
                continue;
              }
              editableSheet = sheet;
              break;
            }
            return editableSheet != null ? editableSheet : createStyleSheet();
          }
          function createStyleSheet() {
            var style = document.createElement("style");
            document.head.appendChild(style);
            return style.sheet;
          }
          function redraw() {
            if (self2.config.noCalendar || self2.isMobile)
              return;
            buildMonthSwitch();
            updateNavigationCurrentMonth();
            buildDays();
          }
          function focusAndClose() {
            self2._input.focus();
            if (window.navigator.userAgent.indexOf("MSIE") !== -1 || navigator.msMaxTouchPoints !== void 0) {
              setTimeout(self2.close, 0);
            } else {
              self2.close();
            }
          }
          function selectDate(e) {
            e.preventDefault();
            e.stopPropagation();
            var isSelectable = function(day) {
              return day.classList && day.classList.contains("flatpickr-day") && !day.classList.contains("flatpickr-disabled") && !day.classList.contains("notAllowed");
            };
            var t = findParent(getEventTarget(e), isSelectable);
            if (t === void 0)
              return;
            var target = t;
            var selectedDate = self2.latestSelectedDateObj = new Date(target.dateObj.getTime());
            var shouldChangeMonth = (selectedDate.getMonth() < self2.currentMonth || selectedDate.getMonth() > self2.currentMonth + self2.config.showMonths - 1) && self2.config.mode !== "range";
            self2.selectedDateElem = target;
            if (self2.config.mode === "single")
              self2.selectedDates = [selectedDate];
            else if (self2.config.mode === "multiple") {
              var selectedIndex = isDateSelected(selectedDate);
              if (selectedIndex)
                self2.selectedDates.splice(parseInt(selectedIndex), 1);
              else
                self2.selectedDates.push(selectedDate);
            } else if (self2.config.mode === "range") {
              if (self2.selectedDates.length === 2) {
                self2.clear(false, false);
              }
              self2.latestSelectedDateObj = selectedDate;
              self2.selectedDates.push(selectedDate);
              if (compareDates(selectedDate, self2.selectedDates[0], true) !== 0)
                self2.selectedDates.sort(function(a, b) {
                  return a.getTime() - b.getTime();
                });
            }
            setHoursFromInputs();
            if (shouldChangeMonth) {
              var isNewYear = self2.currentYear !== selectedDate.getFullYear();
              self2.currentYear = selectedDate.getFullYear();
              self2.currentMonth = selectedDate.getMonth();
              if (isNewYear) {
                triggerEvent("onYearChange");
                buildMonthSwitch();
              }
              triggerEvent("onMonthChange");
            }
            updateNavigationCurrentMonth();
            buildDays();
            updateValue();
            if (!shouldChangeMonth && self2.config.mode !== "range" && self2.config.showMonths === 1)
              focusOnDayElem(target);
            else if (self2.selectedDateElem !== void 0 && self2.hourElement === void 0) {
              self2.selectedDateElem && self2.selectedDateElem.focus();
            }
            if (self2.hourElement !== void 0)
              self2.hourElement !== void 0 && self2.hourElement.focus();
            if (self2.config.closeOnSelect) {
              var single = self2.config.mode === "single" && !self2.config.enableTime;
              var range = self2.config.mode === "range" && self2.selectedDates.length === 2 && !self2.config.enableTime;
              if (single || range) {
                focusAndClose();
              }
            }
            triggerChange();
          }
          var CALLBACKS = {
            locale: [setupLocale, updateWeekdays],
            showMonths: [buildMonths, setCalendarWidth, buildWeekdays],
            minDate: [jumpToDate],
            maxDate: [jumpToDate],
            positionElement: [updatePositionElement],
            clickOpens: [
              function() {
                if (self2.config.clickOpens === true) {
                  bind(self2._input, "focus", self2.open);
                  bind(self2._input, "click", self2.open);
                } else {
                  self2._input.removeEventListener("focus", self2.open);
                  self2._input.removeEventListener("click", self2.open);
                }
              }
            ]
          };
          function set(option, value) {
            if (option !== null && typeof option === "object") {
              Object.assign(self2.config, option);
              for (var key in option) {
                if (CALLBACKS[key] !== void 0)
                  CALLBACKS[key].forEach(function(x) {
                    return x();
                  });
              }
            } else {
              self2.config[option] = value;
              if (CALLBACKS[option] !== void 0)
                CALLBACKS[option].forEach(function(x) {
                  return x();
                });
              else if (HOOKS.indexOf(option) > -1)
                self2.config[option] = arrayify(value);
            }
            self2.redraw();
            updateValue(true);
          }
          function setSelectedDate(inputDate, format) {
            var dates = [];
            if (inputDate instanceof Array)
              dates = inputDate.map(function(d) {
                return self2.parseDate(d, format);
              });
            else if (inputDate instanceof Date || typeof inputDate === "number")
              dates = [self2.parseDate(inputDate, format)];
            else if (typeof inputDate === "string") {
              switch (self2.config.mode) {
                case "single":
                case "time":
                  dates = [self2.parseDate(inputDate, format)];
                  break;
                case "multiple":
                  dates = inputDate.split(self2.config.conjunction).map(function(date) {
                    return self2.parseDate(date, format);
                  });
                  break;
                case "range":
                  dates = inputDate.split(self2.l10n.rangeSeparator).map(function(date) {
                    return self2.parseDate(date, format);
                  });
                  break;
              }
            } else
              self2.config.errorHandler(new Error("Invalid date supplied: " + JSON.stringify(inputDate)));
            self2.selectedDates = self2.config.allowInvalidPreload ? dates : dates.filter(function(d) {
              return d instanceof Date && isEnabled(d, false);
            });
            if (self2.config.mode === "range")
              self2.selectedDates.sort(function(a, b) {
                return a.getTime() - b.getTime();
              });
          }
          function setDate(date, triggerChange2, format) {
            if (triggerChange2 === void 0) {
              triggerChange2 = false;
            }
            if (format === void 0) {
              format = self2.config.dateFormat;
            }
            if (date !== 0 && !date || date instanceof Array && date.length === 0)
              return self2.clear(triggerChange2);
            setSelectedDate(date, format);
            self2.latestSelectedDateObj = self2.selectedDates[self2.selectedDates.length - 1];
            self2.redraw();
            jumpToDate(void 0, triggerChange2);
            setHoursFromDate();
            if (self2.selectedDates.length === 0) {
              self2.clear(false);
            }
            updateValue(triggerChange2);
            if (triggerChange2)
              triggerEvent("onChange");
          }
          function parseDateRules(arr) {
            return arr.slice().map(function(rule) {
              if (typeof rule === "string" || typeof rule === "number" || rule instanceof Date) {
                return self2.parseDate(rule, void 0, true);
              } else if (rule && typeof rule === "object" && rule.from && rule.to)
                return {
                  from: self2.parseDate(rule.from, void 0),
                  to: self2.parseDate(rule.to, void 0)
                };
              return rule;
            }).filter(function(x) {
              return x;
            });
          }
          function setupDates() {
            self2.selectedDates = [];
            self2.now = self2.parseDate(self2.config.now) || /* @__PURE__ */ new Date();
            var preloadedDate = self2.config.defaultDate || ((self2.input.nodeName === "INPUT" || self2.input.nodeName === "TEXTAREA") && self2.input.placeholder && self2.input.value === self2.input.placeholder ? null : self2.input.value);
            if (preloadedDate)
              setSelectedDate(preloadedDate, self2.config.dateFormat);
            self2._initialDate = self2.selectedDates.length > 0 ? self2.selectedDates[0] : self2.config.minDate && self2.config.minDate.getTime() > self2.now.getTime() ? self2.config.minDate : self2.config.maxDate && self2.config.maxDate.getTime() < self2.now.getTime() ? self2.config.maxDate : self2.now;
            self2.currentYear = self2._initialDate.getFullYear();
            self2.currentMonth = self2._initialDate.getMonth();
            if (self2.selectedDates.length > 0)
              self2.latestSelectedDateObj = self2.selectedDates[0];
            if (self2.config.minTime !== void 0)
              self2.config.minTime = self2.parseDate(self2.config.minTime, "H:i");
            if (self2.config.maxTime !== void 0)
              self2.config.maxTime = self2.parseDate(self2.config.maxTime, "H:i");
            self2.minDateHasTime = !!self2.config.minDate && (self2.config.minDate.getHours() > 0 || self2.config.minDate.getMinutes() > 0 || self2.config.minDate.getSeconds() > 0);
            self2.maxDateHasTime = !!self2.config.maxDate && (self2.config.maxDate.getHours() > 0 || self2.config.maxDate.getMinutes() > 0 || self2.config.maxDate.getSeconds() > 0);
          }
          function setupInputs() {
            self2.input = getInputElem();
            if (!self2.input) {
              self2.config.errorHandler(new Error("Invalid input element specified"));
              return;
            }
            self2.input._type = self2.input.type;
            self2.input.type = "text";
            self2.input.classList.add("flatpickr-input");
            self2._input = self2.input;
            if (self2.config.altInput) {
              self2.altInput = createElement(self2.input.nodeName, self2.config.altInputClass);
              self2._input = self2.altInput;
              self2.altInput.placeholder = self2.input.placeholder;
              self2.altInput.disabled = self2.input.disabled;
              self2.altInput.required = self2.input.required;
              self2.altInput.tabIndex = self2.input.tabIndex;
              self2.altInput.type = "text";
              self2.input.setAttribute("type", "hidden");
              if (!self2.config.static && self2.input.parentNode)
                self2.input.parentNode.insertBefore(self2.altInput, self2.input.nextSibling);
            }
            if (!self2.config.allowInput)
              self2._input.setAttribute("readonly", "readonly");
            updatePositionElement();
          }
          function updatePositionElement() {
            self2._positionElement = self2.config.positionElement || self2._input;
          }
          function setupMobile() {
            var inputType = self2.config.enableTime ? self2.config.noCalendar ? "time" : "datetime-local" : "date";
            self2.mobileInput = createElement("input", self2.input.className + " flatpickr-mobile");
            self2.mobileInput.tabIndex = 1;
            self2.mobileInput.type = inputType;
            self2.mobileInput.disabled = self2.input.disabled;
            self2.mobileInput.required = self2.input.required;
            self2.mobileInput.placeholder = self2.input.placeholder;
            self2.mobileFormatStr = inputType === "datetime-local" ? "Y-m-d\\TH:i:S" : inputType === "date" ? "Y-m-d" : "H:i:S";
            if (self2.selectedDates.length > 0) {
              self2.mobileInput.defaultValue = self2.mobileInput.value = self2.formatDate(self2.selectedDates[0], self2.mobileFormatStr);
            }
            if (self2.config.minDate)
              self2.mobileInput.min = self2.formatDate(self2.config.minDate, "Y-m-d");
            if (self2.config.maxDate)
              self2.mobileInput.max = self2.formatDate(self2.config.maxDate, "Y-m-d");
            if (self2.input.getAttribute("step"))
              self2.mobileInput.step = String(self2.input.getAttribute("step"));
            self2.input.type = "hidden";
            if (self2.altInput !== void 0)
              self2.altInput.type = "hidden";
            try {
              if (self2.input.parentNode)
                self2.input.parentNode.insertBefore(self2.mobileInput, self2.input.nextSibling);
            } catch (_a) {
            }
            bind(self2.mobileInput, "change", function(e) {
              self2.setDate(getEventTarget(e).value, false, self2.mobileFormatStr);
              triggerEvent("onChange");
              triggerEvent("onClose");
            });
          }
          function toggle(e) {
            if (self2.isOpen === true)
              return self2.close();
            self2.open(e);
          }
          function triggerEvent(event, data) {
            if (self2.config === void 0)
              return;
            var hooks = self2.config[event];
            if (hooks !== void 0 && hooks.length > 0) {
              for (var i = 0; hooks[i] && i < hooks.length; i++)
                hooks[i](self2.selectedDates, self2.input.value, self2, data);
            }
            if (event === "onChange") {
              self2.input.dispatchEvent(createEvent("change"));
              self2.input.dispatchEvent(createEvent("input"));
            }
          }
          function createEvent(name) {
            var e = document.createEvent("Event");
            e.initEvent(name, true, true);
            return e;
          }
          function isDateSelected(date) {
            for (var i = 0; i < self2.selectedDates.length; i++) {
              var selectedDate = self2.selectedDates[i];
              if (selectedDate instanceof Date && compareDates(selectedDate, date) === 0)
                return "" + i;
            }
            return false;
          }
          function isDateInRange(date) {
            if (self2.config.mode !== "range" || self2.selectedDates.length < 2)
              return false;
            return compareDates(date, self2.selectedDates[0]) >= 0 && compareDates(date, self2.selectedDates[1]) <= 0;
          }
          function updateNavigationCurrentMonth() {
            if (self2.config.noCalendar || self2.isMobile || !self2.monthNav)
              return;
            self2.yearElements.forEach(function(yearElement, i) {
              var d = new Date(self2.currentYear, self2.currentMonth, 1);
              d.setMonth(self2.currentMonth + i);
              if (self2.config.showMonths > 1 || self2.config.monthSelectorType === "static") {
                self2.monthElements[i].textContent = monthToStr(d.getMonth(), self2.config.shorthandCurrentMonth, self2.l10n) + " ";
              } else {
                self2.monthsDropdownContainer.value = d.getMonth().toString();
              }
              yearElement.value = d.getFullYear().toString();
            });
            self2._hidePrevMonthArrow = self2.config.minDate !== void 0 && (self2.currentYear === self2.config.minDate.getFullYear() ? self2.currentMonth <= self2.config.minDate.getMonth() : self2.currentYear < self2.config.minDate.getFullYear());
            self2._hideNextMonthArrow = self2.config.maxDate !== void 0 && (self2.currentYear === self2.config.maxDate.getFullYear() ? self2.currentMonth + 1 > self2.config.maxDate.getMonth() : self2.currentYear > self2.config.maxDate.getFullYear());
          }
          function getDateStr(specificFormat) {
            var format = specificFormat || (self2.config.altInput ? self2.config.altFormat : self2.config.dateFormat);
            return self2.selectedDates.map(function(dObj) {
              return self2.formatDate(dObj, format);
            }).filter(function(d, i, arr) {
              return self2.config.mode !== "range" || self2.config.enableTime || arr.indexOf(d) === i;
            }).join(self2.config.mode !== "range" ? self2.config.conjunction : self2.l10n.rangeSeparator);
          }
          function updateValue(triggerChange2) {
            if (triggerChange2 === void 0) {
              triggerChange2 = true;
            }
            if (self2.mobileInput !== void 0 && self2.mobileFormatStr) {
              self2.mobileInput.value = self2.latestSelectedDateObj !== void 0 ? self2.formatDate(self2.latestSelectedDateObj, self2.mobileFormatStr) : "";
            }
            self2.input.value = getDateStr(self2.config.dateFormat);
            if (self2.altInput !== void 0) {
              self2.altInput.value = getDateStr(self2.config.altFormat);
            }
            if (triggerChange2 !== false)
              triggerEvent("onValueUpdate");
          }
          function onMonthNavClick(e) {
            var eventTarget = getEventTarget(e);
            var isPrevMonth = self2.prevMonthNav.contains(eventTarget);
            var isNextMonth = self2.nextMonthNav.contains(eventTarget);
            if (isPrevMonth || isNextMonth) {
              changeMonth(isPrevMonth ? -1 : 1);
            } else if (self2.yearElements.indexOf(eventTarget) >= 0) {
              eventTarget.select();
            } else if (eventTarget.classList.contains("arrowUp")) {
              self2.changeYear(self2.currentYear + 1);
            } else if (eventTarget.classList.contains("arrowDown")) {
              self2.changeYear(self2.currentYear - 1);
            }
          }
          function timeWrapper(e) {
            e.preventDefault();
            var isKeyDown = e.type === "keydown", eventTarget = getEventTarget(e), input = eventTarget;
            if (self2.amPM !== void 0 && eventTarget === self2.amPM) {
              self2.amPM.textContent = self2.l10n.amPM[int(self2.amPM.textContent === self2.l10n.amPM[0])];
            }
            var min = parseFloat(input.getAttribute("min")), max = parseFloat(input.getAttribute("max")), step = parseFloat(input.getAttribute("step")), curValue = parseInt(input.value, 10), delta = e.delta || (isKeyDown ? e.which === 38 ? 1 : -1 : 0);
            var newValue = curValue + step * delta;
            if (typeof input.value !== "undefined" && input.value.length === 2) {
              var isHourElem = input === self2.hourElement, isMinuteElem = input === self2.minuteElement;
              if (newValue < min) {
                newValue = max + newValue + int(!isHourElem) + (int(isHourElem) && int(!self2.amPM));
                if (isMinuteElem)
                  incrementNumInput(void 0, -1, self2.hourElement);
              } else if (newValue > max) {
                newValue = input === self2.hourElement ? newValue - max - int(!self2.amPM) : min;
                if (isMinuteElem)
                  incrementNumInput(void 0, 1, self2.hourElement);
              }
              if (self2.amPM && isHourElem && (step === 1 ? newValue + curValue === 23 : Math.abs(newValue - curValue) > step)) {
                self2.amPM.textContent = self2.l10n.amPM[int(self2.amPM.textContent === self2.l10n.amPM[0])];
              }
              input.value = pad(newValue);
            }
          }
          init();
          return self2;
        }
        function _flatpickr(nodeList, config) {
          var nodes = Array.prototype.slice.call(nodeList).filter(function(x) {
            return x instanceof HTMLElement;
          });
          var instances = [];
          for (var i = 0; i < nodes.length; i++) {
            var node = nodes[i];
            try {
              if (node.getAttribute("data-fp-omit") !== null)
                continue;
              if (node._flatpickr !== void 0) {
                node._flatpickr.destroy();
                node._flatpickr = void 0;
              }
              node._flatpickr = FlatpickrInstance(node, config || {});
              instances.push(node._flatpickr);
            } catch (e) {
              console.error(e);
            }
          }
          return instances.length === 1 ? instances[0] : instances;
        }
        if (typeof HTMLElement !== "undefined" && typeof HTMLCollection !== "undefined" && typeof NodeList !== "undefined") {
          HTMLCollection.prototype.flatpickr = NodeList.prototype.flatpickr = function(config) {
            return _flatpickr(this, config);
          };
          HTMLElement.prototype.flatpickr = function(config) {
            return _flatpickr([this], config);
          };
        }
        var flatpickr = function(selector, config) {
          if (typeof selector === "string") {
            return _flatpickr(window.document.querySelectorAll(selector), config);
          } else if (selector instanceof Node) {
            return _flatpickr([selector], config);
          } else {
            return _flatpickr(selector, config);
          }
        };
        flatpickr.defaultConfig = {};
        flatpickr.l10ns = {
          en: __assign({}, english),
          default: __assign({}, english)
        };
        flatpickr.localize = function(l10n) {
          flatpickr.l10ns.default = __assign(__assign({}, flatpickr.l10ns.default), l10n);
        };
        flatpickr.setDefaults = function(config) {
          flatpickr.defaultConfig = __assign(__assign({}, flatpickr.defaultConfig), config);
        };
        flatpickr.parseDate = createDateParser({});
        flatpickr.formatDate = createDateFormatter({});
        flatpickr.compareDates = compareDates;
        if (typeof jQuery !== "undefined" && typeof jQuery.fn !== "undefined") {
          jQuery.fn.flatpickr = function(config) {
            return _flatpickr(this, config);
          };
        }
        Date.prototype.fp_incr = function(days) {
          return new Date(this.getFullYear(), this.getMonth(), this.getDate() + (typeof days === "string" ? parseInt(days, 10) : days));
        };
        if (typeof window !== "undefined") {
          window.flatpickr = flatpickr;
        }
        return flatpickr;
      }));
    }
  });

  // node_modules/flatpickr/dist/flatpickr.css
  var require_flatpickr2 = __commonJS({
    "node_modules/flatpickr/dist/flatpickr.css"(exports, module) {
      module.exports = `.flatpickr-calendar {
  background: transparent;
  opacity: 0;
  display: none;
  text-align: center;
  visibility: hidden;
  padding: 0;
  -webkit-animation: none;
          animation: none;
  direction: ltr;
  border: 0;
  font-size: 14px;
  line-height: 24px;
  border-radius: 5px;
  position: absolute;
  width: 307.875px;
  -webkit-box-sizing: border-box;
          box-sizing: border-box;
  -ms-touch-action: manipulation;
      touch-action: manipulation;
  background: #fff;
  -webkit-box-shadow: 1px 0 0 #e6e6e6, -1px 0 0 #e6e6e6, 0 1px 0 #e6e6e6, 0 -1px 0 #e6e6e6, 0 3px 13px rgba(0,0,0,0.08);
          box-shadow: 1px 0 0 #e6e6e6, -1px 0 0 #e6e6e6, 0 1px 0 #e6e6e6, 0 -1px 0 #e6e6e6, 0 3px 13px rgba(0,0,0,0.08);
}
.flatpickr-calendar.open,
.flatpickr-calendar.inline {
  opacity: 1;
  max-height: 640px;
  visibility: visible;
}
.flatpickr-calendar.open {
  display: inline-block;
  z-index: 99999;
}
.flatpickr-calendar.animate.open {
  -webkit-animation: fpFadeInDown 300ms cubic-bezier(0.23, 1, 0.32, 1);
          animation: fpFadeInDown 300ms cubic-bezier(0.23, 1, 0.32, 1);
}
.flatpickr-calendar.inline {
  display: block;
  position: relative;
  top: 2px;
}
.flatpickr-calendar.static {
  position: absolute;
  top: calc(100% + 2px);
}
.flatpickr-calendar.static.open {
  z-index: 999;
  display: block;
}
.flatpickr-calendar.multiMonth .flatpickr-days .dayContainer:nth-child(n+1) .flatpickr-day.inRange:nth-child(7n+7) {
  -webkit-box-shadow: none !important;
          box-shadow: none !important;
}
.flatpickr-calendar.multiMonth .flatpickr-days .dayContainer:nth-child(n+2) .flatpickr-day.inRange:nth-child(7n+1) {
  -webkit-box-shadow: -2px 0 0 #e6e6e6, 5px 0 0 #e6e6e6;
          box-shadow: -2px 0 0 #e6e6e6, 5px 0 0 #e6e6e6;
}
.flatpickr-calendar .hasWeeks .dayContainer,
.flatpickr-calendar .hasTime .dayContainer {
  border-bottom: 0;
  border-bottom-right-radius: 0;
  border-bottom-left-radius: 0;
}
.flatpickr-calendar .hasWeeks .dayContainer {
  border-left: 0;
}
.flatpickr-calendar.hasTime .flatpickr-time {
  height: 40px;
  border-top: 1px solid #e6e6e6;
}
.flatpickr-calendar.noCalendar.hasTime .flatpickr-time {
  height: auto;
}
.flatpickr-calendar:before,
.flatpickr-calendar:after {
  position: absolute;
  display: block;
  pointer-events: none;
  border: solid transparent;
  content: '';
  height: 0;
  width: 0;
  left: 22px;
}
.flatpickr-calendar.rightMost:before,
.flatpickr-calendar.arrowRight:before,
.flatpickr-calendar.rightMost:after,
.flatpickr-calendar.arrowRight:after {
  left: auto;
  right: 22px;
}
.flatpickr-calendar.arrowCenter:before,
.flatpickr-calendar.arrowCenter:after {
  left: 50%;
  right: 50%;
}
.flatpickr-calendar:before {
  border-width: 5px;
  margin: 0 -5px;
}
.flatpickr-calendar:after {
  border-width: 4px;
  margin: 0 -4px;
}
.flatpickr-calendar.arrowTop:before,
.flatpickr-calendar.arrowTop:after {
  bottom: 100%;
}
.flatpickr-calendar.arrowTop:before {
  border-bottom-color: #e6e6e6;
}
.flatpickr-calendar.arrowTop:after {
  border-bottom-color: #fff;
}
.flatpickr-calendar.arrowBottom:before,
.flatpickr-calendar.arrowBottom:after {
  top: 100%;
}
.flatpickr-calendar.arrowBottom:before {
  border-top-color: #e6e6e6;
}
.flatpickr-calendar.arrowBottom:after {
  border-top-color: #fff;
}
.flatpickr-calendar:focus {
  outline: 0;
}
.flatpickr-wrapper {
  position: relative;
  display: inline-block;
}
.flatpickr-months {
  display: -webkit-box;
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
}
.flatpickr-months .flatpickr-month {
  background: transparent;
  color: rgba(0,0,0,0.9);
  fill: rgba(0,0,0,0.9);
  height: 34px;
  line-height: 1;
  text-align: center;
  position: relative;
  -webkit-user-select: none;
     -moz-user-select: none;
      -ms-user-select: none;
          user-select: none;
  overflow: hidden;
  -webkit-box-flex: 1;
  -webkit-flex: 1;
      -ms-flex: 1;
          flex: 1;
}
.flatpickr-months .flatpickr-prev-month,
.flatpickr-months .flatpickr-next-month {
  -webkit-user-select: none;
     -moz-user-select: none;
      -ms-user-select: none;
          user-select: none;
  text-decoration: none;
  cursor: pointer;
  position: absolute;
  top: 0;
  height: 34px;
  padding: 10px;
  z-index: 3;
  color: rgba(0,0,0,0.9);
  fill: rgba(0,0,0,0.9);
}
.flatpickr-months .flatpickr-prev-month.flatpickr-disabled,
.flatpickr-months .flatpickr-next-month.flatpickr-disabled {
  display: none;
}
.flatpickr-months .flatpickr-prev-month i,
.flatpickr-months .flatpickr-next-month i {
  position: relative;
}
.flatpickr-months .flatpickr-prev-month.flatpickr-prev-month,
.flatpickr-months .flatpickr-next-month.flatpickr-prev-month {
/*
      /*rtl:begin:ignore*/
/*
      */
  left: 0;
/*
      /*rtl:end:ignore*/
/*
      */
}
/*
      /*rtl:begin:ignore*/
/*
      /*rtl:end:ignore*/
.flatpickr-months .flatpickr-prev-month.flatpickr-next-month,
.flatpickr-months .flatpickr-next-month.flatpickr-next-month {
/*
      /*rtl:begin:ignore*/
/*
      */
  right: 0;
/*
      /*rtl:end:ignore*/
/*
      */
}
/*
      /*rtl:begin:ignore*/
/*
      /*rtl:end:ignore*/
.flatpickr-months .flatpickr-prev-month:hover,
.flatpickr-months .flatpickr-next-month:hover {
  color: #959ea9;
}
.flatpickr-months .flatpickr-prev-month:hover svg,
.flatpickr-months .flatpickr-next-month:hover svg {
  fill: #f64747;
}
.flatpickr-months .flatpickr-prev-month svg,
.flatpickr-months .flatpickr-next-month svg {
  width: 14px;
  height: 14px;
}
.flatpickr-months .flatpickr-prev-month svg path,
.flatpickr-months .flatpickr-next-month svg path {
  -webkit-transition: fill 0.1s;
  transition: fill 0.1s;
  fill: inherit;
}
.numInputWrapper {
  position: relative;
  height: auto;
}
.numInputWrapper input,
.numInputWrapper span {
  display: inline-block;
}
.numInputWrapper input {
  width: 100%;
}
.numInputWrapper input::-ms-clear {
  display: none;
}
.numInputWrapper input::-webkit-outer-spin-button,
.numInputWrapper input::-webkit-inner-spin-button {
  margin: 0;
  -webkit-appearance: none;
}
.numInputWrapper span {
  position: absolute;
  right: 0;
  width: 14px;
  padding: 0 4px 0 2px;
  height: 50%;
  line-height: 50%;
  opacity: 0;
  cursor: pointer;
  border: 1px solid rgba(57,57,57,0.15);
  -webkit-box-sizing: border-box;
          box-sizing: border-box;
}
.numInputWrapper span:hover {
  background: rgba(0,0,0,0.1);
}
.numInputWrapper span:active {
  background: rgba(0,0,0,0.2);
}
.numInputWrapper span:after {
  display: block;
  content: "";
  position: absolute;
}
.numInputWrapper span.arrowUp {
  top: 0;
  border-bottom: 0;
}
.numInputWrapper span.arrowUp:after {
  border-left: 4px solid transparent;
  border-right: 4px solid transparent;
  border-bottom: 4px solid rgba(57,57,57,0.6);
  top: 26%;
}
.numInputWrapper span.arrowDown {
  top: 50%;
}
.numInputWrapper span.arrowDown:after {
  border-left: 4px solid transparent;
  border-right: 4px solid transparent;
  border-top: 4px solid rgba(57,57,57,0.6);
  top: 40%;
}
.numInputWrapper span svg {
  width: inherit;
  height: auto;
}
.numInputWrapper span svg path {
  fill: rgba(0,0,0,0.5);
}
.numInputWrapper:hover {
  background: rgba(0,0,0,0.05);
}
.numInputWrapper:hover span {
  opacity: 1;
}
.flatpickr-current-month {
  font-size: 135%;
  line-height: inherit;
  font-weight: 300;
  color: inherit;
  position: absolute;
  width: 75%;
  left: 12.5%;
  padding: 7.48px 0 0 0;
  line-height: 1;
  height: 34px;
  display: inline-block;
  text-align: center;
  -webkit-transform: translate3d(0px, 0px, 0px);
          transform: translate3d(0px, 0px, 0px);
}
.flatpickr-current-month span.cur-month {
  font-family: inherit;
  font-weight: 700;
  color: inherit;
  display: inline-block;
  margin-left: 0.5ch;
  padding: 0;
}
.flatpickr-current-month span.cur-month:hover {
  background: rgba(0,0,0,0.05);
}
.flatpickr-current-month .numInputWrapper {
  width: 6ch;
  width: 7ch\\0;
  display: inline-block;
}
.flatpickr-current-month .numInputWrapper span.arrowUp:after {
  border-bottom-color: rgba(0,0,0,0.9);
}
.flatpickr-current-month .numInputWrapper span.arrowDown:after {
  border-top-color: rgba(0,0,0,0.9);
}
.flatpickr-current-month input.cur-year {
  background: transparent;
  -webkit-box-sizing: border-box;
          box-sizing: border-box;
  color: inherit;
  cursor: text;
  padding: 0 0 0 0.5ch;
  margin: 0;
  display: inline-block;
  font-size: inherit;
  font-family: inherit;
  font-weight: 300;
  line-height: inherit;
  height: auto;
  border: 0;
  border-radius: 0;
  vertical-align: initial;
  -webkit-appearance: textfield;
  -moz-appearance: textfield;
  appearance: textfield;
}
.flatpickr-current-month input.cur-year:focus {
  outline: 0;
}
.flatpickr-current-month input.cur-year[disabled],
.flatpickr-current-month input.cur-year[disabled]:hover {
  font-size: 100%;
  color: rgba(0,0,0,0.5);
  background: transparent;
  pointer-events: none;
}
.flatpickr-current-month .flatpickr-monthDropdown-months {
  appearance: menulist;
  background: transparent;
  border: none;
  border-radius: 0;
  box-sizing: border-box;
  color: inherit;
  cursor: pointer;
  font-size: inherit;
  font-family: inherit;
  font-weight: 300;
  height: auto;
  line-height: inherit;
  margin: -1px 0 0 0;
  outline: none;
  padding: 0 0 0 0.5ch;
  position: relative;
  vertical-align: initial;
  -webkit-box-sizing: border-box;
  -webkit-appearance: menulist;
  -moz-appearance: menulist;
  width: auto;
}
.flatpickr-current-month .flatpickr-monthDropdown-months:focus,
.flatpickr-current-month .flatpickr-monthDropdown-months:active {
  outline: none;
}
.flatpickr-current-month .flatpickr-monthDropdown-months:hover {
  background: rgba(0,0,0,0.05);
}
.flatpickr-current-month .flatpickr-monthDropdown-months .flatpickr-monthDropdown-month {
  background-color: transparent;
  outline: none;
  padding: 0;
}
.flatpickr-weekdays {
  background: transparent;
  text-align: center;
  overflow: hidden;
  width: 100%;
  display: -webkit-box;
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-box-align: center;
  -webkit-align-items: center;
      -ms-flex-align: center;
          align-items: center;
  height: 28px;
}
.flatpickr-weekdays .flatpickr-weekdaycontainer {
  display: -webkit-box;
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-box-flex: 1;
  -webkit-flex: 1;
      -ms-flex: 1;
          flex: 1;
}
span.flatpickr-weekday {
  cursor: default;
  font-size: 90%;
  background: transparent;
  color: rgba(0,0,0,0.54);
  line-height: 1;
  margin: 0;
  text-align: center;
  display: block;
  -webkit-box-flex: 1;
  -webkit-flex: 1;
      -ms-flex: 1;
          flex: 1;
  font-weight: bolder;
}
.dayContainer,
.flatpickr-weeks {
  padding: 1px 0 0 0;
}
.flatpickr-days {
  position: relative;
  overflow: hidden;
  display: -webkit-box;
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-box-align: start;
  -webkit-align-items: flex-start;
      -ms-flex-align: start;
          align-items: flex-start;
  width: 307.875px;
}
.flatpickr-days:focus {
  outline: 0;
}
.dayContainer {
  padding: 0;
  outline: 0;
  text-align: left;
  width: 307.875px;
  min-width: 307.875px;
  max-width: 307.875px;
  -webkit-box-sizing: border-box;
          box-sizing: border-box;
  display: inline-block;
  display: -ms-flexbox;
  display: -webkit-box;
  display: -webkit-flex;
  display: flex;
  -webkit-flex-wrap: wrap;
          flex-wrap: wrap;
  -ms-flex-wrap: wrap;
  -ms-flex-pack: justify;
  -webkit-justify-content: space-around;
          justify-content: space-around;
  -webkit-transform: translate3d(0px, 0px, 0px);
          transform: translate3d(0px, 0px, 0px);
  opacity: 1;
}
.dayContainer + .dayContainer {
  -webkit-box-shadow: -1px 0 0 #e6e6e6;
          box-shadow: -1px 0 0 #e6e6e6;
}
.flatpickr-day {
  background: none;
  border: 1px solid transparent;
  border-radius: 150px;
  -webkit-box-sizing: border-box;
          box-sizing: border-box;
  color: #393939;
  cursor: pointer;
  font-weight: 400;
  width: 14.2857143%;
  -webkit-flex-basis: 14.2857143%;
      -ms-flex-preferred-size: 14.2857143%;
          flex-basis: 14.2857143%;
  max-width: 39px;
  height: 39px;
  line-height: 39px;
  margin: 0;
  display: inline-block;
  position: relative;
  -webkit-box-pack: center;
  -webkit-justify-content: center;
      -ms-flex-pack: center;
          justify-content: center;
  text-align: center;
}
.flatpickr-day.inRange,
.flatpickr-day.prevMonthDay.inRange,
.flatpickr-day.nextMonthDay.inRange,
.flatpickr-day.today.inRange,
.flatpickr-day.prevMonthDay.today.inRange,
.flatpickr-day.nextMonthDay.today.inRange,
.flatpickr-day:hover,
.flatpickr-day.prevMonthDay:hover,
.flatpickr-day.nextMonthDay:hover,
.flatpickr-day:focus,
.flatpickr-day.prevMonthDay:focus,
.flatpickr-day.nextMonthDay:focus {
  cursor: pointer;
  outline: 0;
  background: #e6e6e6;
  border-color: #e6e6e6;
}
.flatpickr-day.today {
  border-color: #959ea9;
}
.flatpickr-day.today:hover,
.flatpickr-day.today:focus {
  border-color: #959ea9;
  background: #959ea9;
  color: #fff;
}
.flatpickr-day.selected,
.flatpickr-day.startRange,
.flatpickr-day.endRange,
.flatpickr-day.selected.inRange,
.flatpickr-day.startRange.inRange,
.flatpickr-day.endRange.inRange,
.flatpickr-day.selected:focus,
.flatpickr-day.startRange:focus,
.flatpickr-day.endRange:focus,
.flatpickr-day.selected:hover,
.flatpickr-day.startRange:hover,
.flatpickr-day.endRange:hover,
.flatpickr-day.selected.prevMonthDay,
.flatpickr-day.startRange.prevMonthDay,
.flatpickr-day.endRange.prevMonthDay,
.flatpickr-day.selected.nextMonthDay,
.flatpickr-day.startRange.nextMonthDay,
.flatpickr-day.endRange.nextMonthDay {
  background: #569ff7;
  -webkit-box-shadow: none;
          box-shadow: none;
  color: #fff;
  border-color: #569ff7;
}
.flatpickr-day.selected.startRange,
.flatpickr-day.startRange.startRange,
.flatpickr-day.endRange.startRange {
  border-radius: 50px 0 0 50px;
}
.flatpickr-day.selected.endRange,
.flatpickr-day.startRange.endRange,
.flatpickr-day.endRange.endRange {
  border-radius: 0 50px 50px 0;
}
.flatpickr-day.selected.startRange + .endRange:not(:nth-child(7n+1)),
.flatpickr-day.startRange.startRange + .endRange:not(:nth-child(7n+1)),
.flatpickr-day.endRange.startRange + .endRange:not(:nth-child(7n+1)) {
  -webkit-box-shadow: -10px 0 0 #569ff7;
          box-shadow: -10px 0 0 #569ff7;
}
.flatpickr-day.selected.startRange.endRange,
.flatpickr-day.startRange.startRange.endRange,
.flatpickr-day.endRange.startRange.endRange {
  border-radius: 50px;
}
.flatpickr-day.inRange {
  border-radius: 0;
  -webkit-box-shadow: -5px 0 0 #e6e6e6, 5px 0 0 #e6e6e6;
          box-shadow: -5px 0 0 #e6e6e6, 5px 0 0 #e6e6e6;
}
.flatpickr-day.flatpickr-disabled,
.flatpickr-day.flatpickr-disabled:hover,
.flatpickr-day.prevMonthDay,
.flatpickr-day.nextMonthDay,
.flatpickr-day.notAllowed,
.flatpickr-day.notAllowed.prevMonthDay,
.flatpickr-day.notAllowed.nextMonthDay {
  color: rgba(57,57,57,0.3);
  background: transparent;
  border-color: transparent;
  cursor: default;
}
.flatpickr-day.flatpickr-disabled,
.flatpickr-day.flatpickr-disabled:hover {
  cursor: not-allowed;
  color: rgba(57,57,57,0.1);
}
.flatpickr-day.week.selected {
  border-radius: 0;
  -webkit-box-shadow: -5px 0 0 #569ff7, 5px 0 0 #569ff7;
          box-shadow: -5px 0 0 #569ff7, 5px 0 0 #569ff7;
}
.flatpickr-day.hidden {
  visibility: hidden;
}
.rangeMode .flatpickr-day {
  margin-top: 1px;
}
.flatpickr-weekwrapper {
  float: left;
}
.flatpickr-weekwrapper .flatpickr-weeks {
  padding: 0 12px;
  -webkit-box-shadow: 1px 0 0 #e6e6e6;
          box-shadow: 1px 0 0 #e6e6e6;
}
.flatpickr-weekwrapper .flatpickr-weekday {
  float: none;
  width: 100%;
  line-height: 28px;
}
.flatpickr-weekwrapper span.flatpickr-day,
.flatpickr-weekwrapper span.flatpickr-day:hover {
  display: block;
  width: 100%;
  max-width: none;
  color: rgba(57,57,57,0.3);
  background: transparent;
  cursor: default;
  border: none;
}
.flatpickr-innerContainer {
  display: block;
  display: -webkit-box;
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-box-sizing: border-box;
          box-sizing: border-box;
  overflow: hidden;
}
.flatpickr-rContainer {
  display: inline-block;
  padding: 0;
  -webkit-box-sizing: border-box;
          box-sizing: border-box;
}
.flatpickr-time {
  text-align: center;
  outline: 0;
  display: block;
  height: 0;
  line-height: 40px;
  max-height: 40px;
  -webkit-box-sizing: border-box;
          box-sizing: border-box;
  overflow: hidden;
  display: -webkit-box;
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
}
.flatpickr-time:after {
  content: "";
  display: table;
  clear: both;
}
.flatpickr-time .numInputWrapper {
  -webkit-box-flex: 1;
  -webkit-flex: 1;
      -ms-flex: 1;
          flex: 1;
  width: 40%;
  height: 40px;
  float: left;
}
.flatpickr-time .numInputWrapper span.arrowUp:after {
  border-bottom-color: #393939;
}
.flatpickr-time .numInputWrapper span.arrowDown:after {
  border-top-color: #393939;
}
.flatpickr-time.hasSeconds .numInputWrapper {
  width: 26%;
}
.flatpickr-time.time24hr .numInputWrapper {
  width: 49%;
}
.flatpickr-time input {
  background: transparent;
  -webkit-box-shadow: none;
          box-shadow: none;
  border: 0;
  border-radius: 0;
  text-align: center;
  margin: 0;
  padding: 0;
  height: inherit;
  line-height: inherit;
  color: #393939;
  font-size: 14px;
  position: relative;
  -webkit-box-sizing: border-box;
          box-sizing: border-box;
  -webkit-appearance: textfield;
  -moz-appearance: textfield;
  appearance: textfield;
}
.flatpickr-time input.flatpickr-hour {
  font-weight: bold;
}
.flatpickr-time input.flatpickr-minute,
.flatpickr-time input.flatpickr-second {
  font-weight: 400;
}
.flatpickr-time input:focus {
  outline: 0;
  border: 0;
}
.flatpickr-time .flatpickr-time-separator,
.flatpickr-time .flatpickr-am-pm {
  height: inherit;
  float: left;
  line-height: inherit;
  color: #393939;
  font-weight: bold;
  width: 2%;
  -webkit-user-select: none;
     -moz-user-select: none;
      -ms-user-select: none;
          user-select: none;
  -webkit-align-self: center;
      -ms-flex-item-align: center;
          align-self: center;
}
.flatpickr-time .flatpickr-am-pm {
  outline: 0;
  width: 18%;
  cursor: pointer;
  text-align: center;
  font-weight: 400;
}
.flatpickr-time input:hover,
.flatpickr-time .flatpickr-am-pm:hover,
.flatpickr-time input:focus,
.flatpickr-time .flatpickr-am-pm:focus {
  background: #eee;
}
.flatpickr-input[readonly] {
  cursor: pointer;
}
@-webkit-keyframes fpFadeInDown {
  from {
    opacity: 0;
    -webkit-transform: translate3d(0, -20px, 0);
            transform: translate3d(0, -20px, 0);
  }
  to {
    opacity: 1;
    -webkit-transform: translate3d(0, 0, 0);
            transform: translate3d(0, 0, 0);
  }
}
@keyframes fpFadeInDown {
  from {
    opacity: 0;
    -webkit-transform: translate3d(0, -20px, 0);
            transform: translate3d(0, -20px, 0);
  }
  to {
    opacity: 1;
    -webkit-transform: translate3d(0, 0, 0);
            transform: translate3d(0, 0, 0);
  }
}
`;
    }
  });

  // v2/packages-src/ThirdPartyJOG.Helpers.js
  var require_ThirdPartyJOG_Helpers = __commonJS({
    "v2/packages-src/ThirdPartyJOG.Helpers.js"(exports, module) {
      "use strict";
      var DEFAULT_THEME_VARIABLE_NAMES = [
        "--jog-app-background",
        "--jog-surface",
        "--jog-surface-muted",
        "--jog-text",
        "--jog-text-muted",
        "--jog-text-strong",
        "--jog-border",
        "--jog-border-soft",
        "--jog-primary",
        "--jog-primary-text",
        "--jog-danger",
        "--jog-danger-text",
        "--jog-overlay",
        "--jog-resize-grip",
        "--jog-font-family",
        "--jog-font-size",
        "--jog-caption-size",
        "--jog-title-size",
        "--jog-line-height",
        "--jog-radius-control",
        "--jog-radius-section",
        "--jog-radius-shell",
        "--jog-radius-window",
        "--jog-page-padding",
        "--jog-section-header-x",
        "--jog-section-header-y",
        "--jog-section-body",
        "--jog-window-content",
        "--jog-control-padding-x",
        "--jog-control-padding-y",
        "--jog-close-button-x",
        "--jog-close-button-y",
        "--jog-field-gap",
        "--jog-list-padding",
        "--jog-shadow-shell",
        "--jog-shadow-section",
        "--jog-shadow-window",
        "--jog-shadow-invalid-ring"
      ];
      function initializeValueBridge(control, options) {
        var stateKey = options && options.stateKey ? options.stateKey : "value";
        var emptyValue = options ? options.emptyValue : "";
        control._suppressAdapterChange = false;
        control._lastAppliedValue = emptyValue;
        control._lastEmittedValue = emptyValue;
        control.SetStateValue(stateKey, emptyValue);
      }
      function syncAdapterValueIntoControl(control, options) {
        var stateKey = options && options.stateKey ? options.stateKey : "value";
        var nextValue = options ? options.nextValue : void 0;
        var payload = options ? options.payload : null;
        var eventName = options && options.eventName ? options.eventName : "Change";
        var eventExtras;
        control._lastAppliedValue = nextValue;
        control._lastEmittedValue = nextValue;
        if (options && typeof options.afterSync === "function") {
          options.afterSync(nextValue, payload);
        }
        if (control._suppressAdapterChange) {
          control._suppressAdapterChange = false;
          if (control.GetStateValue(stateKey) !== nextValue) {
            control.SetStateValue(stateKey, nextValue);
          }
          if (options && typeof options.afterSuppressed === "function") {
            options.afterSuppressed(nextValue, payload);
          }
          return false;
        }
        if (control.GetStateValue(stateKey) !== nextValue) {
          control.SetStateValue(stateKey, nextValue);
        }
        if (options && typeof options.eventExtras === "function") {
          eventExtras = options.eventExtras(nextValue, payload);
        } else if (options && options.eventExtras) {
          eventExtras = options.eventExtras;
        } else {
          eventExtras = { Value: nextValue };
        }
        control.RaiseEvent(eventName, payload ? payload.originalEvent || null : null, eventExtras);
        return true;
      }
      function applyValueToAdapter(control, options) {
        var nextValue = options ? options.nextValue : void 0;
        if (options && typeof options.beforeApply === "function") {
          options.beforeApply(nextValue);
        }
        if (!options || !options.adapter || typeof options.setAdapterValue !== "function") {
          control._lastAppliedValue = nextValue;
          return false;
        }
        if (nextValue === control._lastAppliedValue) {
          return false;
        }
        control._suppressAdapterChange = true;
        options.setAdapterValue(nextValue);
        control._lastAppliedValue = nextValue;
        control._lastEmittedValue = nextValue;
        if (typeof options.afterApply === "function") {
          options.afterApply(nextValue);
        }
        return true;
      }
      function bindValue(control, store, key, options) {
        var propertyName = options && options.propertyName ? options.propertyName : "Value";
        var eventMethodName = options && options.eventMethodName ? options.eventMethodName : "OnChange";
        var normalize = options && typeof options.normalize === "function" ? options.normalize : function(value) {
          return value;
        };
        var getEventValue = options && typeof options.getEventValue === "function" ? options.getEventValue : function(args) {
          return args.Value;
        };
        var unsubscribe = store.Subscribe(key, function(value) {
          control[propertyName] = normalize(value);
        });
        control.TrackBinding(unsubscribe);
        control[propertyName] = normalize(store.Get(key));
        control[eventMethodName](function(args) {
          store.Set(key, getEventValue(args));
        });
      }
      function bindCollection(control, collection, options) {
        var propertyName = options && options.propertyName ? options.propertyName : "Items";
        var eventKeys = Array.isArray(options && options.eventKeys) && options.eventKeys.length ? options.eventKeys.slice() : ["change"];
        var mapRows = options && typeof options.mapRows === "function" ? options.mapRows : function(rows) {
          return rows.slice();
        };
        var unsubscribes = [];
        function update() {
          var rows = collection && typeof collection.GetRows === "function" ? collection.GetRows() : [];
          control[propertyName] = mapRows(rows, collection);
        }
        eventKeys.forEach(function(eventKey) {
          unsubscribes.push(collection.Subscribe(eventKey, update));
        });
        control.TrackBinding(function() {
          unsubscribes.forEach(function(unsubscribe) {
            if (typeof unsubscribe === "function") {
              unsubscribe();
            }
          });
        });
        update();
      }
      function syncThemeVariablesFromNode(globalObject, sourceNode, targetNode, variableNames) {
        var computedStyle;
        var names = Array.isArray(variableNames) && variableNames.length ? variableNames : DEFAULT_THEME_VARIABLE_NAMES;
        if (!sourceNode || !targetNode || !globalObject || typeof globalObject.getComputedStyle !== "function") {
          return;
        }
        computedStyle = globalObject.getComputedStyle(sourceNode);
        names.forEach(function(name) {
          var value = computedStyle.getPropertyValue(name);
          if (value) {
            targetNode.style.setProperty(name, value);
          }
        });
      }
      module.exports = {
        applyValueToAdapter,
        bindCollection,
        bindValue,
        initializeValueBridge,
        syncAdapterValueIntoControl,
        syncThemeVariablesFromNode,
        THEME_VARIABLE_NAMES: DEFAULT_THEME_VARIABLE_NAMES.slice()
      };
    }
  });

  // v2/packages-src/FlatpickrJOG.Controls.source.js
  (function(global) {
    "use strict";
    var flatpickr = require_flatpickr();
    var flatpickrBaseCss = require_flatpickr2();
    var thirdPartyHelpers = require_ThirdPartyJOG_Helpers();
    var JOG = global.JOG;
    var FlatpickrJOG = global.FlatpickrJOG || {};
    var testingAdapterFactory = null;
    if (!JOG) {
      throw new Error("FlatpickrJOG.Controls.js requires JOG to load first.");
    }
    JOG.RegisterStyleBlock("FlatpickrJOG.Controls.Vendor", flatpickrBaseCss);
    JOG.RegisterStyleBlock("FlatpickrJOG.Controls", [
      ".flatpickrjog-date-picker { position: relative; display: block; min-width: 0; min-height: 42px; box-sizing: border-box; }",
      ".flatpickrjog-date-picker-input { display: block; width: 100%; min-height: 36px; box-sizing: border-box; border: 1px solid var(--jog-border) !important; border-bottom: 1px solid var(--jog-border) !important; border-radius: var(--jog-radius-control) !important; background: var(--jog-surface) !important; background-color: var(--jog-surface) !important; background-image: none !important; color: var(--jog-text) !important; padding: var(--jog-control-padding-y) var(--jog-control-padding-x); font: inherit; line-height: var(--jog-line-height); outline: none; appearance: none; -webkit-appearance: none; box-shadow: none !important; }",
      ".flatpickrjog-date-picker > .flatpickrjog-date-picker-input.flatpickr-input[readonly] { border: 1px solid var(--jog-border) !important; border-bottom: 1px solid var(--jog-border) !important; border-top: 1px solid var(--jog-border) !important; border-left: 1px solid var(--jog-border) !important; border-right: 1px solid var(--jog-border) !important; border-radius: var(--jog-radius-control) !important; background: var(--jog-surface) !important; background-color: var(--jog-surface) !important; background-image: none !important; color: var(--jog-text) !important; cursor: pointer; box-shadow: none !important; -webkit-text-fill-color: var(--jog-text); opacity: 1; }",
      ".flatpickrjog-date-picker:focus-within .flatpickrjog-date-picker-input { border-color: var(--jog-primary); box-shadow: 0 0 0 1px var(--jog-primary); }",
      ".flatpickrjog-date-picker.is-readonly .flatpickrjog-date-picker-input { background: var(--jog-surface-muted); cursor: default; }",
      ".flatpickrjog-date-picker.is-readonly .flatpickrjog-date-picker-input.flatpickr-input[readonly] { background: var(--jog-surface-muted); cursor: default; }",
      ".flatpickrjog-date-picker.is-disabled .flatpickrjog-date-picker-input { opacity: 0.6; cursor: not-allowed; }",
      ".flatpickrjog-date-picker.jog-invalid .flatpickrjog-date-picker-input { border-color: var(--jog-danger); box-shadow: var(--jog-shadow-invalid-ring); }",
      ".flatpickrjog-date-picker.jog-theme-preset-muted .flatpickrjog-date-picker-input { background: var(--jog-surface-muted); }",
      ".flatpickrjog-date-picker.jog-theme-preset-muted .flatpickrjog-date-picker-input.flatpickr-input[readonly] { background: var(--jog-surface-muted); }",
      ".flatpickrjog-date-picker.jog-theme-preset-primary .flatpickrjog-date-picker-input { border-color: color-mix(in srgb, var(--jog-primary) 38%, var(--jog-border)); box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--jog-primary) 12%, transparent); }",
      ".flatpickr-calendar { background: var(--jog-surface) !important; background-color: var(--jog-surface) !important; border: 1px solid var(--jog-border) !important; box-shadow: var(--jog-shadow-shell) !important; color: var(--jog-text); }",
      ".flatpickr-calendar:after { border-bottom-color: var(--jog-surface); }",
      ".flatpickr-calendar.arrowBottom:after { border-top-color: var(--jog-surface); }",
      ".flatpickr-calendar:before { border-bottom-color: var(--jog-border); }",
      ".flatpickr-calendar.arrowBottom:before { border-top-color: var(--jog-border); }",
      ".flatpickr-months, .flatpickr-weekdays, .flatpickr-rContainer, .flatpickr-days, .dayContainer, .flatpickr-current-month, .flatpickr-innerContainer { background: var(--jog-surface) !important; background-color: var(--jog-surface) !important; }",
      ".flatpickr-months .flatpickr-month, .flatpickr-current-month .flatpickr-monthDropdown-months, .flatpickr-current-month input.cur-year { color: var(--jog-text-strong); fill: var(--jog-text-strong); }",
      ".flatpickr-weekday, span.flatpickr-weekday { color: var(--jog-text-muted); }",
      ".flatpickr-day, .flatpickr-time input, .flatpickr-time .flatpickr-am-pm { color: var(--jog-text); }",
      ".flatpickr-day.today { border-color: var(--jog-primary); }",
      ".flatpickr-day:hover, .flatpickr-day:focus { background: var(--jog-surface-muted); border-color: var(--jog-border-soft); }",
      ".flatpickr-day.selected, .flatpickr-day.startRange, .flatpickr-day.endRange, .flatpickr-day.selected:hover, .flatpickr-day.startRange:hover, .flatpickr-day.endRange:hover { background: var(--jog-primary); border-color: var(--jog-primary); color: var(--jog-primary-text); }",
      ".flatpickr-prev-month:hover svg, .flatpickr-next-month:hover svg { fill: var(--jog-primary); }"
    ].join("\n"));
    function normalizeDateValue(value) {
      if (value == null) {
        return "";
      }
      return String(value).trim();
    }
    function normalizeDateLimit(value) {
      if (value == null || value === "") {
        return "";
      }
      return String(value).trim();
    }
    function createDefaultDatePickerAdapter(options) {
      var picker = null;
      var inputNode = null;
      function syncCalendarThemeVariables() {
        if (!picker || !picker.calendarContainer || !inputNode) {
          return;
        }
        thirdPartyHelpers.syncThemeVariablesFromNode(global, inputNode, picker.calendarContainer);
      }
      function notifyChange(dateString, originalEvent) {
        if (typeof options.onChange !== "function") {
          return;
        }
        options.onChange({
          value: normalizeDateValue(dateString),
          isEmpty: !dateString,
          originalEvent: originalEvent || null
        });
      }
      function buildOptions() {
        return {
          dateFormat: "Y-m-d",
          defaultDate: options.value || void 0,
          minDate: options.minDate || void 0,
          maxDate: options.maxDate || void 0,
          allowInput: false,
          disableMobile: true,
          clickOpens: options.enabled !== false && options.readOnly !== true,
          prevArrow: '<span aria-hidden="true">&#8249;</span>',
          nextArrow: '<span aria-hidden="true">&#8250;</span>',
          onChange: function(selectedDates, dateString) {
            notifyChange(dateString, null);
          },
          onOpen: function() {
            syncCalendarThemeVariables();
            if (typeof options.onOpen === "function") {
              options.onOpen({ originalEvent: null });
            }
          },
          onClose: function() {
            if (typeof options.onClose === "function") {
              options.onClose({ originalEvent: null });
            }
          }
        };
      }
      function syncInputInteraction(enabled, readOnly) {
        if (!inputNode) {
          return;
        }
        inputNode.disabled = !enabled;
        inputNode.readOnly = !enabled || !!readOnly;
        inputNode.setAttribute("aria-readonly", !enabled || readOnly ? "true" : "false");
      }
      return {
        attach: function(nextInputNode) {
          inputNode = nextInputNode;
          picker = flatpickr(inputNode, buildOptions());
          syncCalendarThemeVariables();
          this.setPlaceholder(options.placeholder || "");
          this.setInteractive(options.enabled !== false, options.readOnly === true);
        },
        dispose: function() {
          if (picker && typeof picker.destroy === "function") {
            picker.destroy();
          }
          picker = null;
          inputNode = null;
        },
        setValue: function(value) {
          var nextValue = normalizeDateValue(value);
          if (!picker) {
            if (inputNode) {
              inputNode.value = nextValue;
            }
            return;
          }
          if (!nextValue) {
            picker.clear(false);
            return;
          }
          picker.setDate(nextValue, false, "Y-m-d");
        },
        setMinDate: function(value) {
          if (picker) {
            picker.set("minDate", normalizeDateLimit(value) || null);
          }
        },
        setMaxDate: function(value) {
          if (picker) {
            picker.set("maxDate", normalizeDateLimit(value) || null);
          }
        },
        setPlaceholder: function(value) {
          if (inputNode) {
            inputNode.placeholder = value || "";
          }
        },
        setInteractive: function(enabled, readOnly) {
          syncInputInteraction(!!enabled, !!readOnly);
          if (picker) {
            picker.set("clickOpens", !!enabled && !readOnly);
          }
        },
        clear: function() {
          if (picker) {
            picker.clear(false);
            return;
          }
          if (inputNode) {
            inputNode.value = "";
          }
        },
        getValue: function() {
          if (picker && picker.input) {
            return normalizeDateValue(picker.input.value);
          }
          if (inputNode) {
            return normalizeDateValue(inputNode.value);
          }
          return "";
        },
        isEmpty: function() {
          return !this.getValue();
        },
        focus: function() {
          if (picker && picker.input && typeof picker.input.focus === "function") {
            picker.input.focus();
            return;
          }
          if (inputNode && typeof inputNode.focus === "function") {
            inputNode.focus();
          }
        },
        open: function() {
          if (picker && typeof picker.open === "function") {
            picker.open();
          }
        },
        close: function() {
          if (picker && typeof picker.close === "function") {
            picker.close();
          }
        }
      };
    }
    function createDatePickerAdapter(options) {
      if (typeof testingAdapterFactory === "function") {
        return testingAdapterFactory(options);
      }
      return createDefaultDatePickerAdapter(options);
    }
    function DatePicker() {
      JOG.Control.call(this, "DatePicker");
      this._pickerAdapter = null;
      this._inputNode = null;
      this._focusHandler = null;
      this._blurHandler = null;
      this.Height = 42;
      this.MinHeight = 42;
      thirdPartyHelpers.initializeValueBridge(this, {
        emptyValue: ""
      });
      this.SetStateValue("placeholder", "");
      this.SetStateValue("readOnly", false);
      this.SetStateValue("minDate", "");
      this.SetStateValue("maxDate", "");
      this.SetStateValue("pickerOpen", false);
    }
    DatePicker.prototype = Object.create(JOG.Control.prototype);
    DatePicker.prototype.constructor = DatePicker;
    DatePicker.prototype.CreateDom = function(doc) {
      var node = doc.createElement("div");
      var input = doc.createElement("input");
      node.className = "jog-control flatpickrjog-date-picker";
      input.className = "flatpickrjog-date-picker-input";
      input.type = "text";
      input.setAttribute("aria-haspopup", "dialog");
      input.autocomplete = "off";
      node.appendChild(input);
      this._inputNode = input;
      return node;
    };
    DatePicker.prototype.BindDomEvents = function() {
      var control = this;
      if (!this._inputNode) {
        return;
      }
      this._focusHandler = function(event) {
        control.RaiseEvent("Focus", event || null);
      };
      this._blurHandler = function(event) {
        control.RaiseEvent("Blur", event || null, {
          Value: control.Value
        });
      };
      this._inputNode.addEventListener("focus", this._focusHandler);
      this._inputNode.addEventListener("blur", this._blurHandler);
    };
    DatePicker.prototype._handleAdapterChange = function(payload) {
      var nextValue = normalizeDateValue(payload && payload.value);
      thirdPartyHelpers.syncAdapterValueIntoControl(this, {
        nextValue,
        payload,
        eventExtras: {
          Value: nextValue
        }
      });
    };
    DatePicker.prototype._handleAdapterOpen = function(payload) {
      this.SetStateValue("pickerOpen", true);
      this.RaiseEvent("Open", payload ? payload.originalEvent || null : null, {
        Value: this.Value
      });
    };
    DatePicker.prototype._handleAdapterClose = function(payload) {
      this.SetStateValue("pickerOpen", false);
      this.RaiseEvent("Close", payload ? payload.originalEvent || null : null, {
        Value: this.Value
      });
    };
    DatePicker.prototype._applyValueToAdapter = function(value) {
      var nextValue = normalizeDateValue(value);
      thirdPartyHelpers.applyValueToAdapter(this, {
        adapter: this._pickerAdapter,
        nextValue,
        setAdapterValue: function(appliedValue) {
          this._pickerAdapter.setValue(appliedValue);
        }.bind(this)
      });
    };
    DatePicker.prototype.OnAttached = function() {
      var control = this;
      if (!this._inputNode) {
        return;
      }
      this._pickerAdapter = createDatePickerAdapter({
        value: this.Value,
        placeholder: this.Placeholder,
        minDate: this.MinDate,
        maxDate: this.MaxDate,
        enabled: this.Enabled,
        readOnly: this.ReadOnly,
        onChange: function(payload) {
          control._handleAdapterChange(payload);
        },
        onOpen: function(payload) {
          control._handleAdapterOpen(payload);
        },
        onClose: function(payload) {
          control._handleAdapterClose(payload);
        }
      });
      this._pickerAdapter.attach(this._inputNode);
      this._pickerAdapter.setPlaceholder(this.Placeholder);
      this._pickerAdapter.setMinDate(this.MinDate);
      this._pickerAdapter.setMaxDate(this.MaxDate);
      this._pickerAdapter.setInteractive(this.Enabled, this.ReadOnly);
      this._applyValueToAdapter(this.Value);
    };
    DatePicker.prototype.OnDisposed = function() {
      if (this._inputNode && this._focusHandler) {
        this._inputNode.removeEventListener("focus", this._focusHandler);
      }
      if (this._inputNode && this._blurHandler) {
        this._inputNode.removeEventListener("blur", this._blurHandler);
      }
      this._focusHandler = null;
      this._blurHandler = null;
      if (this._pickerAdapter) {
        this._pickerAdapter.dispose();
        this._pickerAdapter = null;
      }
      this._inputNode = null;
    };
    DatePicker.prototype.ApplyState = function(prevState, nextState) {
      JOG.Control.prototype.ApplyState.call(this, prevState, nextState);
      if (!this._domNode || !this._inputNode) {
        return;
      }
      if (this._pickerAdapter) {
        if (prevState.value !== nextState.value) {
          this._applyValueToAdapter(nextState.value);
        }
        if (prevState.placeholder !== nextState.placeholder) {
          this._pickerAdapter.setPlaceholder(nextState.placeholder);
        }
        if (prevState.minDate !== nextState.minDate) {
          this._pickerAdapter.setMinDate(nextState.minDate);
        }
        if (prevState.maxDate !== nextState.maxDate) {
          this._pickerAdapter.setMaxDate(nextState.maxDate);
        }
        if (prevState.enabled !== nextState.enabled || prevState.readOnly !== nextState.readOnly) {
          this._pickerAdapter.setInteractive(nextState.enabled, nextState.readOnly);
        }
      }
      this._domNode.classList.toggle("is-readonly", !!nextState.readOnly);
      this._domNode.classList.toggle("is-disabled", !nextState.enabled);
      this._domNode.classList.toggle("is-open", !!nextState.pickerOpen);
      this._inputNode.setAttribute("aria-expanded", nextState.pickerOpen ? "true" : "false");
    };
    DatePicker.prototype.Focus = function() {
      if (this._lifecycle === "Disposed") {
        JOG.Control.prototype.Focus.call(this);
        return;
      }
      if (this._pickerAdapter && typeof this._pickerAdapter.focus === "function") {
        this._pickerAdapter.focus();
        return;
      }
      if (this._inputNode && typeof this._inputNode.focus === "function") {
        this._inputNode.focus();
        return;
      }
      JOG.Control.prototype.Focus.call(this);
    };
    DatePicker.prototype.Open = function() {
      if (this._pickerAdapter && typeof this._pickerAdapter.open === "function") {
        this._pickerAdapter.open();
      }
    };
    DatePicker.prototype.Close = function() {
      if (this._pickerAdapter && typeof this._pickerAdapter.close === "function") {
        this._pickerAdapter.close();
      }
    };
    DatePicker.prototype.Clear = function() {
      this.SetStateValue("pickerOpen", false);
      if (this._pickerAdapter && typeof this._pickerAdapter.clear === "function") {
        this._suppressAdapterChange = true;
        this._pickerAdapter.clear();
        this._lastAppliedValue = "";
        this._lastEmittedValue = "";
        this.SetStateValue("value", "");
      } else {
        this.Value = "";
      }
      this.ClearError();
    };
    DatePicker.prototype.IsEmpty = function() {
      if (this._pickerAdapter && typeof this._pickerAdapter.isEmpty === "function") {
        return !!this._pickerAdapter.isEmpty();
      }
      return !this.Value;
    };
    DatePicker.prototype.BindValue = function(store, key) {
      thirdPartyHelpers.bindValue(this, store, key, {
        normalize: normalizeDateValue,
        getEventValue: function(args) {
          return args.Value;
        }
      });
    };
    DatePicker.prototype.OnOpen = function(listener) {
      this.RegisterEvent("Open", listener);
    };
    DatePicker.prototype.OnClose = function(listener) {
      this.RegisterEvent("Close", listener);
    };
    JOG.DefineControlProperty(DatePicker.prototype, "Value", {
      stateKey: "value",
      normalize: normalizeDateValue
    });
    JOG.DefineControlProperty(DatePicker.prototype, "Placeholder", {
      stateKey: "placeholder",
      normalize: function(value) {
        return value == null ? "" : String(value);
      }
    });
    JOG.DefineControlProperty(DatePicker.prototype, "ReadOnly", {
      stateKey: "readOnly",
      normalize: function(value) {
        return !!value;
      }
    });
    JOG.DefineControlProperty(DatePicker.prototype, "MinDate", {
      stateKey: "minDate",
      normalize: normalizeDateLimit
    });
    JOG.DefineControlProperty(DatePicker.prototype, "MaxDate", {
      stateKey: "maxDate",
      normalize: normalizeDateLimit
    });
    FlatpickrJOG.DatePicker = DatePicker;
    FlatpickrJOG.__setTestingAdapterFactory = function(factory) {
      testingAdapterFactory = typeof factory === "function" ? factory : null;
    };
    JOG.RegisterControl({
      fullName: "FlatpickrJOG.DatePicker",
      version: "1.0.0",
      jogVersionRange: "^2.0.0",
      constructor: DatePicker,
      metadata: {
        baseType: "Control",
        shortName: "DatePicker",
        packageName: "FlatpickrJOG",
        packageVersion: "1.0.0",
        properties: ["Value", "Placeholder", "ReadOnly", "MinDate", "MaxDate", "Invalid", "ErrorText", "ThemePreset"],
        events: ["OnChange", "OnOpen", "OnClose", "OnFocus", "OnBlur"],
        methods: ["Focus", "Open", "Close", "Clear", "IsEmpty", "BindValue", "SetError", "ClearError", "BindError"],
        themePresets: ["muted", "primary"],
        capabilities: {
          supportsValidation: true,
          supportsKeyboard: true,
          supportsResponsiveLayout: true
        }
      }
    });
    global.FlatpickrJOG = FlatpickrJOG;
  })(typeof window !== "undefined" ? window : globalThis);
})();
/*! Bundled license information:

flatpickr/dist/flatpickr.js:
  (* flatpickr v4.6.13, @license MIT *)
  (*! *****************************************************************************
      Copyright (c) Microsoft Corporation.
  
      Permission to use, copy, modify, and/or distribute this software for any
      purpose with or without fee is hereby granted.
  
      THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
      REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
      AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
      INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
      LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
      OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
      PERFORMANCE OF THIS SOFTWARE.
      ***************************************************************************** *)
*/
