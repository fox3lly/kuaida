/**
* @author nttdocomo
*/
(function () {
    function getStyleTag() {
        var style = document.getElementsByTagName('style');
        if (style.length) {
            style = style[0];
        } else {
            style = document.createElement('style');
            style.type = 'text/css';
            document.getElementsByTagName('head')[0].appendChild(style);
        }
        return style;
    }
    /*http://ejohn.org/blog/objectgetprototypeof/*/
    if (typeof Object.getPrototypeOf !== "function") {
        if (typeof "test".__proto__ === "object") {
            Object.getPrototypeOf = function (object) {
                return object.__proto__;
            };
        } else {
            Object.getPrototypeOf = function (object) {
                // May break if the constructor has been tampered with
                return object.constructor.prototype;
            };
        }
    }
    /**
    * 生成命名空间
    * @param {string} 命名空间名 如 "dog.Part"
    * @param {props} 属性或方法
    */
    function namespace(string, props) {
        var object = window;
        var names = string.split(".");
        for (var i = 0; i < names.length; i++) {
            var name = names[i];
            if (typeof object[name] === "undefined") {
                object[name] = {}
            }
            object = object[name]
        }
        if (props) {
            for (var key in props) {
                object[key] = props[key]
            }
        }
        return object
    }
    namespace("dog", {
        ids: 0,
        styleTag: getStyleTag(),
        styleTemplate: '<%=selector%>{<%=property%>:<%=value%>;}',
        augmentString: function (string, fn) {
            var object = window;
            var names = string.split(".");
            for (var i = 0, len = names.length; i < len; ++i) {
                object = object[name[i]]
            }
        },
        createStyle: function (str) {
            //dog.styleTag = getStyleTag()  
            if (dog.styleTag.styleSheet) {
                dog.styleTag.styleSheet.cssText = dog.styleTag.styleSheet.cssText + str;
            } else {
                dog.styleTag.textContent = dog.styleTag.textContent + str;
            }
        },
        clearStyle: function (reg) {//@asg 10.26; move RegExp ;make clearStyle more portable
            if (dog.styleTag.styleSheet) {
                dog.styleTag.styleSheet.cssText = dog.styleTag.styleSheet.cssText.replace(reg, '');
            } else {
                dog.styleTag.textContent = dog.styleTag.textContent.replace(reg, '');
            }
        },
        throttle: function (fn, delay) {//http://remysharp.com/2010/07/21/throttling-function-calls/
            var timer = null;
            return function () {
                var context = this, args = arguments;
                clearTimeout(timer);
                timer = setTimeout(function () {
                    fn.apply(context, args);
                }, delay);
            };
        },
        isNum: function (str) { //数字组成的串
            if (str == null) { return false };
            str = new String(str);
            var rt = /\d+/i;
            return rt.test(str);
        },
        isType: function (obj, type) {
            var toString = Object.prototype.toString, undefined;
            return (type === "Null" && obj === null) ||
		    (type === "Undefined" && obj === undefined) ||
		    toString.call(obj).slice(8, -1) === type;
        },
        deepCopy: function (result, source) {
            for (var key in source) {
                var copy = source[key];
                if (result === copy) continue; //防止死循环 
                if (dog.isType(copy, "Object")) {
                    result[key] = arguments.callee(result[key] || {}, copy);
                } else if (dog.isType(copy, "Array")) {
                    result[key] = arguments.callee(result[key] || [], copy);
                } else {
                    result[key] = copy;
                }
            }
            return result;
        },
        checkHTMLTag: function (code, noAlert) {
            var retag = code;
            function compare(txt1, txt2) {
                var txt = '<' + '/' + txt1.substr(1);
                return (txt == txt2) ? 1 : 0;
            }
            function checkComment(txt) {
                var _ret;
                txt = txt.replace(/\r|\n/ig, '');
                txt = txt.replace(/<style *[^<>]*>.*?<\/style>/ig, '');
                txt = txt.replace(/<script *[^<>]*>.*?<\/script>/ig, '');
                if (/<\!-+>/ig.test(txt) || /<\!--(-+(.*?)|(.*?)-+)-->/ig.test(txt)) {
                    _ret = false;
                } else {
                    if (txt.split("<!--").length != txt.split("-->").length) _ret = false;
                    else {
                        _ret = true;
                    }
                }
                return _ret;
            }
            // 检查<ul>标签内部是否存在全角空格
            function checkBigBlank(txt) {
                var _ret = true;
                var arr = txt.match(/<ul[^>]*?>([\s\S]*?)<\/ul>/ig);
                if (arr != null) {
                    for (var i = 0, j = arr.length; i < j; i++) {
                        if (/\u3000/.test(arr[i].replace(/<li[^>]*?>([\s\S]*?)<\/li>/ig, ""))) {
                            _ret = false;
                        }
                    }
                }
                return _ret;
            }
            if (retag == '') {
                return 1; //空串直接返回1
            }
            // pass comment tag checker?
            if (checkComment(retag) == false) {
                if (!noAlert) alert("注释代码错误，请遵守<!-- comment -->格式！\n提示：<!--->, <!----->, <!--- comment -->等等都是不规范的注释，常常会造成问题。");
                return 0;
            } else if (checkBigBlank(retag) == false) {
                if (!noAlert) alert("发现<li>与<li>之间存在全角空格，可能会造成页面显示错误，请检查删除！");
                return 0;
            } else {
                retag = retag.replace(/\r|\n/ig, ''); //除去回车和换行	
                // 去掉不能很好控制的<script>...<\/script>和<!--...-->
                retag = retag.replace(/<style *[^<>]*>.*?<\/style>/ig, '');
                retag = retag.replace(/<script *[^<>]*>.*?<\/script>/ig, '');
                retag = retag.replace(/<\!--.*?-->/ig, '');
                var arrIntElement = retag.match(/<\/?[A-Za-z][a-z0-9]*[^>]*>/ig);
                if (arrIntElement != null) {
                    //预处理标签,得到规整的标签数组,去掉所有属性只留下<a>和</a>
                    var arrPrElement = [];
                    for (var k = 0; k < arrIntElement.length; k++) {
                        arrPrElement[k] = arrIntElement[k].replace(/(<\/?[A-Za-z0-9]+) *[^>]*>/ig, "$1>");
                        arrPrElement[k] = arrPrElement[k].replace(/[\s]+/g, '').toLowerCase();
                    }
                    //不需要配对的标签,小写
                    var arrMinus = new Array('<img>', '<input>', '<meta>', '<hr>', '<br>', '<link>', '<param>', '<frame>', '<base>', '<basefont>', '<isindex>', '<area>');
                    //去掉多余的单标签标记,返回新的arrIntElement
                    for (var i = 0; i < arrPrElement.length; i++) {
                        for (var k = 0; k < arrMinus.length; k++) {
                            if (arrPrElement[i] == arrMinus[k]) {
                                arrPrElement.splice(i, 1);
                                i--;
                            }
                        }
                    }
                    //判断<aaa>与</aaa>是配对的html标签
                    var stack = new Array();
                    stack[0] = '#';
                    var p = 0;
                    var problem;
                    for (var j = 0; j < arrPrElement.length; j++) {
                        if (compare(stack[p], arrPrElement[j])) {
                            p--;
                            stack.length--;
                        }
                        else {
                            stack[++p] = arrPrElement[j];
                        }
                    }
                    if (stack[p] != "#") {
                        if (!noAlert) alert("html标签不匹配，请检查是不是漏了</a>,</div>,</li>,</ul>,</font>等等");
                        return 0;
                    }
                    //双引号和单引号完整性检查
                    for (var k = 0; k < arrIntElement.length; k++) {
                        var rr = arrIntElement[k].match(/\"/ig);
                        var r = arrIntElement[k].match(/\'/ig);
                        if (rr != null) {
                            if (rr.length % 2 != 0) {
                                if (!noAlert) alert("警告：" + arrIntElement[k] + " 双引号不完整");
                                return 0;
                            }
                        }
                        if (r != null) {
                            if (r.length % 2 != 0) {
                                if (!noAlert) alert("警告：" + arrIntElement[k] + " 单引号不完整");
                                return 0;
                            }
                        }
                    }
                }
            }
            return 1;
        },
        checkStyleValue: function (el, property) {
            var index = $(el).attr("id").split("_")[1],
			    value = $(el).val().trim(),
				warning = $("#warning_" + index);
            subject.styleCheck = true;
            warning.empty();
            if (value == "" || value == "默认" || value == "inherit" || value == "auto") { return; }
            if (/size|width|height|padding|margin|left|right|top|bottom/.test(property) && !/^((\d+(px|em|%)?) ?){1,4};?$/.test(value)) {
                subject.styleCheck = false;
                warning.html("样式格式输入错误请检查!");
            }
        },
        EventProvider: {
            _provider: function () {
                if (!this._eventProvider) {
                    this._eventProvider = $('<div/>');
                }
                return this._eventProvider
            },
            _createEvent: function (type) {
                if (!this._events) {
                    this._events = {};
                }
                if (!this._events[type]) {
                    this._events[type] = new $.Event(type);
                }
            },
            trigger: function () {
                this._createEvent(arguments[0]);
                var provider = this._provider();
                provider.trigger.apply(provider, arguments);
            },
            bind: function () {
                this._createEvent(arguments[0]);
                var provider = this._provider();
                provider.bind.apply(provider, arguments);
            },
            one: function () {
                this._createEvent(arguments[0]);
                var provider = this._provider();
                provider.one.apply(provider, arguments);
            },
            unbind: function () {
                var provider = this._provider();
                provider.unbind.apply(provider, arguments);
            }
        },
        getTemplateContext: function (templateString) {
            var tempObjs = templateString.match(/<%=\s*?obj\.\w+?\s*?%>/g);
            var list = [];
            var uniq = {};
            /*去除重复字段用*/
            if (tempObjs) {
                for (var j = 0; j < tempObjs.length; j++) {
                    var name = tempObjs[j].match(/<%=\s*?obj\.(\w+?)\s*?%>/)[1];
                    if (!uniq[name]) {
                        uniq[name] = true;
                        list.push(name)
                    }
                }
            }
            return list;
        },
        copyToClipboard: function (txt) {
            if (window.clipboardData) {
                window.clipboardData.clearData();
                window.clipboardData.setData("Text", txt);
            } else if (navigator.userAgent.indexOf("Opera") != -1) {
                window.location = txt;
            } else if (window.netscape) {
                try {
                    netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
                } catch (e) {
                    alert("被浏览器拒绝！\n请在浏览器地址栏输入'about:config'并回车\n然后将 'signed.applets.codebase_principal_support'设置为'true'");
                    return false;
                }
                var clip = Components.classes['@mozilla.org/widget/clipboard;1'].createInstance(Components.interfaces.nsIClipboard);
                if (!clip)
                    return;
                var trans = Components.classes['@mozilla.org/widget/transferable;1'].createInstance(Components.interfaces.nsITransferable);
                if (!trans)
                    return;
                trans.addDataFlavor('text/unicode');
                var str = new Object();
                var len = new Object();
                var str = Components.classes["@mozilla.org/supports-string;1"].createInstance(Components.interfaces.nsISupportsString);
                var copytext = txt;
                str.data = copytext;
                trans.setTransferData("text/unicode", str, copytext.length * 2);
                var clipid = Components.interfaces.nsIClipboard;
                if (!clip)
                    return false;
                clip.setData(trans, null, clipid.kGlobalClipboard);
            }
        },
        //cookie
        cookie: {
            getItem: function (sKey) {
                if (!sKey || !this.hasItem(sKey)) {
                    return null;
                }
                return unescape(document.cookie.replace(new RegExp("(?:^|.*;\\s*)" + escape(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*((?:[^;](?!;))*[^;]?).*"), "$1"));
            },
            setItem: function (sKey, sValue, vEnd, sPath, sDomain, bSecure) {
                if (!sKey || /^(?:expires|max\-age|path|domain|secure)$/.test(sKey)) {
                    return;
                }
                var sExpires = "";
                if (vEnd) {
                    switch (typeof vEnd) {
                        case "number":
                            sExpires = "; max-age=" + vEnd;
                            break;
                        case "string":
                            sExpires = "; expires=" + vEnd;
                            break;
                        case "object":
                            if (vEnd.hasOwnProperty("toGMTString")) {
                                sExpires = "; expires=" + vEnd.toGMTString();
                            }
                            break;
                    }
                }
                document.cookie = escape(sKey) + "=" + escape(sValue) + sExpires + (sDomain ? "; domain=" + sDomain : "") + (sPath ? "; path=" + sPath : "") + (bSecure ? "; secure" : "");
            },
            removeItem: function (sKey) {
                if (!sKey || !this.hasItem(sKey)) {
                    return;
                }
                var oExpDate = new Date();
                oExpDate.setDate(oExpDate.getDate() - 1);
                document.cookie = escape(sKey) + "=; expires=" + oExpDate.toGMTString() + "; path=/";
            },
            hasItem: function (sKey) {
                return (new RegExp("(?:^|;\\s*)" + escape(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=")).test(document.cookie);
            }
        },
        docWrite: document.write
    });
    $.extendStyle = function () {
        var target = arguments[0];
        $.each(arguments[1], function (i, item) {
            var name = item.name;
            $.each(target, function (j, jtem) {
                if (jtem.name == name) {
                    target[j] = item;
                }
            })
        });
        return target;
    };
    $.extendAttributes = function () {
        var target = arguments[0];
        if (typeof target !== "object") {
            target = {};
        }
        $.each(arguments[1], function (i, item) {
            if ($.isArray(item)) {
                target[i] = $.extendStyle(target[i], item);
            } else if (item !== undefined) {
                target[i] = item;
            }
        });
        return target;
    };
    var eventSplitter = /^(\S+)\s*(.*)$/;
    dog.View = Class.extend({
        init: function () {
            this.delegateEvents();
            //get Objectrl Name!
            var r = dog;
            for (var name in r) {
                if (r[name] && r[name].prototype && Object.getPrototypeOf(this) === r[name].prototype) {
                    this.dogName = name;
                    this.el.data(name, this);
                    break;
                }
            }
        },
        //public methods goes here
        getStyleSheet: function () {
            var repId = this.el.attr('id');
            var styles = (this.opts || this.data)._attributes.style;
            var reg = new RegExp('#' + repId + '\\b[^{]*?{[^}]*?}', 'gim'); //@asg 10.26; make clearStyle more portable
            dog.clearStyle(reg); /*clear all style about this id*/
            if (styles.length) {
                $.each(styles, function () {
                    var selector = this.selector;
                    var style = $.extend({}, this, {
                        "selector": selector.replace(/\[\^repId\]/, repId)
                    });
                    //this.selector = this.selector.replace(/\[\^repId\]/,repId);
                    dog.createStyle(_.template(dog.styleTemplate, style));
                })
            }
        },
        copy: function () {
            var _data = dog.deepCopy({}, this.getData());
            var _name = this.dogName;
            if (window.clipboardData) {
                window.clipboardData.clearData();
                window.clipboardData.setData("Text", JSON.stringify({ "name": _name, "data": _data }))
            } else if (window.localStorage) { //@asg
                localStorage.setItem(_name, JSON.stringify(_data))
            }
            dog.Clipboard = dog.Clipboard || {};
            dog.Clipboard[_name] = _data;
        },
        cut: function () {
            this.copy();
            this.el.remove();
        },
        paste: function () {
            var _name = this.dogName;
            var _data;
            try {
                if (dog.Clipboard && dog.Clipboard[_name]) {
                    _data = dog.Clipboard[_name];
                } else if (window.clipboardData && window.clipboardData.getData) {
                    var clip = JSON.parse(window.clipboardData.getData('Text'));
                    if (clip.name && _name == clip.name)
                        _data = clip.data;
                } else if (window.localStorage) { //@asg
                    _data = JSON.parse(localStorage.getItem(_name));
                } else {
                    return;
                }
                var _cdata = dog.deepCopy({}, _data);
                var _copiedItem = new dog[_name](_cdata);
                _copiedItem.el.insertBefore(this.el);
            } catch (ex) {
            }
        },
        delegateEvents: function (events) {
            var events = events || this.events;
            if (!(events || (events = this.events)))
                return;
            if (_.isFunction(events))
                events = events.call(this);
            $(this.el).unbind('.delegateEvents' + this.cid);
            for (var key in events) {
                var method = this[events[key]];
                if (!method)
                    throw new Error('Event "' + events[key] + '" does not exist');
                var match = key.match(eventSplitter);
                var eventName = match[1], selector = match[2];
                method = _.bind(method, this);
                var _m = function (method) {
                    return function () {
                        //save
                        method();
                    }
                }
                eventName += '.delegateEvents' + this.cid;
                if (selector === '') {
                    $(this.el).bind(eventName, method);
                } else {
                    $(this.el).delegate(selector, eventName, method);
                }
            }
        }
    });
    //图片样式类后添加图片上传按钮, 类似iColorPicker
    dog.iImagePicker = function (wrap) {
        $(wrap).find("input.iImagePicker").each(function (i) {
            var but = $('<button type="button" style="margin-left:8px;">上传图片</button>');
            but.click(function () {
                var self = this;
                var uploadAttributePannel = new dog.pannel.UploadPicPannel();
                uploadAttributePannel.bind("confirm", function (event, data) {
                    $('input.iImagePicker', self.parentNode).val(data);
                });
            });
            $(this).after(but);
        });
    }

    var _execScript = function (codeScript, domScript) {
        codeScript = codeScript.replace('\bdocument\.write\b', 'dog.docwrite');
        var _writebuffer = [];
        dog.docwrite = function () {
            _writebuffer.concat(arguments);
        }
        $.globalEval(codeScript);
        dog.docwrite = null;
        while (_writebuffer.length > 0) {
            var _$htmlbuffers = $(_writebuffer.join(''));

            _writebuffer = [];
            while (_$htmlbuffers.length) {
                var _dombuffer = _$htmlbuffers.splice(0, 1);
                if (_dombuffer.nodeName != 'SCRIPT') {
                    this.parentNode.insertBefore(_dombuffer, domScript);    //dom created
                } else {
                    $('body').append(_dombuffer);                      //scripts 
                }
            }
        }
    };
    dog.execContentScript = function ($scripts) {
        $scripts.each(function (idx, _domScript) {
            if (_domScript.src) {
                $.ajax({
                    'url': 'pub.house.sina.com.cn/api/interface/getdata?api_cid=1&api_name=interface&-url-=' + _domScript.src,
                    'success': function (data) {
                        _execScript(data, _domScript);
                    }
                })
            } else {
                _execScript(_domScript.text || _domScript.textContent || _domScript.innerHTML || '', _domScript);
            }
        })
    }


})()
