/*move the throttle function to dog.js*/
var debug = { block: 0, content: 0};
var moving = false;
if ($.browser.msie) {
    String.prototype.trim = function () { return this.replace(/^\s+|\s+$/g, ''); }
}


$(function () {

    /* utils */
    var $body = $('body'), $window = $(window);
    $.fn.vAlign = function () {
        return this.each(function (i) {
            var h = $(this).height();
            var oh = $(this).outerHeight();
            var wh = $window.height();
            var top = (wh - (h + (oh - h))) / 2 + $window.scrollTop();
            var mt = (h + (oh - h)) / 2;
            if(top < 10) {
                top = 10;
            }
            $(this).css({
                "top": top + "px",
                "position": "absolute"
            })
        })
    };
    $.fn.hAlign = function () {
        return this.each(function (i) {
            var w = $(this).width();
            var ow = $(this).outerWidth();
            var ml = (w + (ow - w)) / 2;
            $(this).css({
                "margin-left": "-" + ml + "px",
                "left": "50%",
                "position": "absolute"
            })
            //@wx 2012-04-18 fix the problem of 'Pop-up layer is not in the middle in IE6' (BUG ID 445)
            if (navigator.appVersion.indexOf('MSIE 6.0') > 0) {
                $(this).css("margin-left", "-" + (ml / 2) + "px")
            }
        })
    };
    $.fn.dnd = function (start, selector, callback) {
        var sender = $(this);
        $("body").css("cursor", "move");
        var placeholder = $("<div class='clearfix' style=';border:dashed 2px green;width:" + (sender.outerWidth() - 6) + "px;height:" + (sender.outerHeight() - 2) + "px'></div>");
        $(document).bind("mouseup.block", function (e) {
            if (moving) {
                //@asg 1.9
                var _type = sender[0].className;
                moving = false;
                _type = _type.replace(/(\s*)(\w)(\w+).*/, function (match, p0, p1, p2, offset, string) { return p1.toUpperCase() + p2 });
                senderDog = sender.getObject(_type);
                var copyDog = new dog[_type](senderDog.getData());
                placeholder.before(copyDog.el); sender.remove(); placeholder.remove();
                $(selector).removeClass("dropbox");
                // @asg 4.28; feature: callback after drop
                if ($.isFunction(callback)) {
                    callback.call(copyDog.el);
                }
            }
            $("body").css("cursor", "auto");
            $(document).unbind(".block").undelegate(selector, "mousemove.block");
        }).bind("mousemove.block", function (evt) {
            evt.preventDefault();
            if (!evt.which) { $(document).trigger("mouseup.block"); return false; }
            if (moving) {
                placeholder.detach();
                placeholder.width((moving.container.width() - 10));

                sender.offset({ left: start.cx + evt.pageX, top: start.cy + evt.pageY });
                if (moving.dropbox.size() > 1) for (var i = 0; i < moving.dropbox.size(); i++) {
                    var dom = moving.dropbox.get(i);
                    var _dropbox = moving.dropbox.eq(i);
                    var _x = _dropbox.offset().left,
                    _y = _dropbox.offset().top;
                    if (_y < evt.pageY
                    && _y + _dropbox.outerHeight() > evt.pageY
                    && _x < evt.pageX
                    && _x + _dropbox.width() > evt.pageX) {
                        if (moving.container[0] != dom) {
                            moving.container = _dropbox;
                            moving.competitor = (moving.container.children(".part,.row,.content,.block"));
                        }
                        break;
                    }
                }
                if (moving.competitor) {
                    for (var i = 0; i < moving.competitor.size(); i++) {
                        var dom = moving.competitor.get(i);
                        if (dom === placeholder.get(0) || dom === sender.get(0)) continue;
                        var _d = moving.competitor.eq(i);
                        if (_d.offset().top > evt.pageY) {
                            _d.before(placeholder);
                            return false;
                        }
                    }
                }
                placeholder.appendTo(moving.container);
                return false;
            }
            else if (Math.abs((evt.pageX - start.x) * (evt.pageY - start.y)) > 25) {
                moving = { container: sender.parent() };
                moving.competitor = (moving.container.children(".part,.row,.content,.block"));
                moving.dropbox = $(selector);
                $(selector).addClass("dropbox");
                placeholder.detach();
                sender.before(placeholder);
                var _width = sender.width(), _height = sender.height();
                //  sender.detach().appendTo($("body"));
                sender.css({ width: _width, height: _height, position: 'absolute' });
                sender.addClass("dragging");
            }
            evt.preventDefault();
            return false;
        });

        return false;
    }
    $.fn.layerShow = function (fn, selector, eventName) {
        var self = $(this);
        var showing = true;
        var oldZindex;
        var nounce = ".n" + $.now();
        if (!self.css('position').match(/absolute/)) {
            var create = function () {
                if (!showing) return null;
                var shades = $(".layerShade");
                var 
        height0 = Math.max($("body").outerHeight(), $(window).height()),
        width0 = self.offset().left;
                height1 = self.offset().top;
                width1 = self.outerWidth();
                height2 = height0 - height1 - self.outerHeight();
                width2 = Math.max($("body").outerWidth(), $(window).width()) - width0 - width1;
                var shadeHTML = "<div class='layerShade' style='position:absolute;left:0;top:0;z-index:998;background:black;opacity:0.4;filter:alpha(opacity=40)'></div>";
                var shade0 = (shades[0] ? shades.eq(0) : $(shadeHTML).appendTo("body")).css({
                    width: width0,
                    height: height0
                });
                var shade10 = (shades[1] ? shades.eq(1) : $(shadeHTML).appendTo("body")).css({
                    width: width1,
                    height: height1,
                    left: width0
                });
                var shade11 = (shades[2] ? shades.eq(2) : $(shadeHTML).appendTo("body")).css({
                    width: width1,
                    height: height2,
                    left: width0,
                    top: height0 - height2
                });
                var shade2 = (shades[3] ? shades.eq(3) : $(shadeHTML).appendTo("body")).css({
                    width: width2,
                    height: height0,
                    left: width0 + width1
                });
                return $(".layerShade");
            }
            var shades = create();
            $(window).resize(_.throttle(create, 20))
            $(document).bind('mousemove' + nounce, _.throttle(create, 20));
        } else {
            var shadeHTML = "<div class='layerShade' style='z-index:998;position:absolute;width:100%;height:" + Math.max($("body").outerHeight(), $(window).height()) + "px;left:0;top:0;right:0;bottom:0;background:black;opacity:0.4;filter:alpha(opacity=40)'></div>";
            oldZindex = self.css('z-index');
            self.css('z-index', 999);
            $(shadeHTML).appendTo('body');
            $(document).bind('mousemove' + nounce, _.throttle(function (evt) {
                if (!showing) return null;
                if ($(".layerShade").size() == 0) {
                    $(shadeHTML).appendTo('body');
                }
            }, 20));
        }
        var done = function (evt) {
            showing = false;
            $(".layerShade").remove();
            if ($.isFunction(fn)) fn.call(self, evt);
            self.undelegate(selector, eventName + nounce);
            $(document).unbind('mousemove' + nounce);
            self.css('z-index', oldZindex);
        };
        if (selector && eventName) {
            self.delegate(selector, eventName + nounce, done);
        }
    }
    $.fn.getStyleObject = function () {
        var dom = this.get(0);
        var style;
        var returns = {};
        if (window.getComputedStyle) {
            var camelize = function (a, b) {
                return b.toUpperCase();
            };
            style = window.getComputedStyle(dom, null);
            for (var i = 0, l = style.length; i < l; i++) {
                var prop = style[i];
                var camel = prop.replace(/\-([a-z])/, camelize);
                var val = style.getPropertyValue(prop);
                returns[camel] = val;
            };
            return returns;
        };
        if (style = dom.currentStyle) {
            for (var prop in style) {
                returns[prop] = style[prop];
            };
            return returns;
        };
        if (style = dom.style) {
            for (var prop in style) {
                if (typeof style[prop] != 'function') {
                    returns[prop] = style[prop];
                }
            }
            return returns;
        }
        return returns;
    }
    $.fn.getObject = function (Type) {
        var f = function (s) {
            if (s.data(Type)) {
                return s.data(Type);
            } else if (s.parent().size()) {
                return f(s.parent());
            } else {
                return null;
            }
        }
        return f(this);
    }

})

/*faking php*/
function count(arr){
	return arr.length
}

function strlen(str){
    return str.toString().length
}

function json_encode(obj){
    return JSON.stringify(obj);
}
