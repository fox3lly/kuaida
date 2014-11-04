(function () {
    var getCoords = function (el) {
        var box = el.getBoundingClientRect(),
        doc = el.ownerDocument,
        body = doc.body,
        html = doc.documentElement,
        clientTop = html.clientTop || body.clientTop || 0,
        clientLeft = html.clientLeft || body.clientLeft || 0,
        top = box.top + (self.pageYOffset || html.scrollTop || body.scrollTop) - clientTop,
        left = box.left + (self.pageXOffset || html.scrollLeft || body.scrollLeft) - clientLeft
        return { 'top': top, 'left': left };
    };

    var getStyle = function (el, style) {
        if (! +"\v1") {
            style = style.replace(/\-(\w)/g, function (all, letter) {
                return letter.toUpperCase();
            });
            var value = el.currentStyle[style];
            (value == "auto") && (value = "0px");
            return value;
        } else {
            return document.defaultView.getComputedStyle(el, null).getPropertyValue(style)
        }
    }
    var ToolDrag = function (id) {
        var el = document.getElementById(id);
        if (!el) return false;

        //isQuirk = document.documentMode ? document.documentMode == 5 : document.compatMode && document.compatMode != "CSS1Compat",
        var options = arguments[1] || {},
        container = options.container || document.documentElement,
        handle = options.handle,
        onStart = options.onStart || function () { },
        onDrag = options.onDrag || function () { },
        onEnd = options.onEnd || function () { },
        cls,
        _handle,
        _top,
        _left,
        _html,
        count = 0;
        el.style.position = "fixed";

        if (handle) {
            cls = new RegExp("(^|\\s)" + handle + "(\\s|$)");
            for (var i = 0, l = el.childNodes.length; i < l; i++) {
                var child = el.childNodes[i];
                if (child.nodeType == 1 && cls.test(child.className)) {
                    _handle = child;
                    break;
                }
            }
        }
        var dragstart = function (e) {
            e = e || window.event;
            el.offset_x = 0
            if (!el.className.match("ontop"))
                el.offset_x = e.clientX - el.offsetLeft; ;
            el.offset_y = e.clientY - el.offsetTop;
            document.onmouseup = dragend;
            document.onmousemove = drag;
            onStart();
            return false;
        }
        var drag = function (e) {
            //console.log(e.clientX);
            e = e || window.event;
            if (count == 0) {
                el.style.left = e.clientX + "px";
                el.style.top = e.clientY + "px";
            }
            el.style.cursor = "pointer";
            ! +"\v1" ? document.selection.empty() : window.getSelection().removeAllRanges();
            _left = e.clientX - el.offset_x;
            _top = e.clientY - el.offset_y;
            if (_top < 0) {
                el.style.left = "0px";
                el.style.top = "0px";
                el.className = "dragWin ontop";

            } else {
                el.className = "dragWin flap";
                el.style.left = _left + "px";
                el.style.top = _top + "px";
            }
            count++;
            onDrag();
        }

        var dragend = function () {
            count = 0;
            document.onmouseup = null;
            document.onmousemove = null;
            onEnd();
        }
        ToolDrag.z = 999;
        (_handle || el).onmousedown = dragstart;
    }
    window['ToolDrag'] = ToolDrag;
})();
