
$(function () {
    function _createBtn(text, fn) {
        var btn = document.createElement("a");
        btn.appendChild(document.createTextNode(text));
        if (btn.addEventListener) {
            btn.addEventListener('click', fn, false);
        } else if (btn.attachEvent) {
            btn.attachEvent('onclick', fn);
        }
        btn.style.color = "#06a";
        btn.style.fontFamily = "arial";
        btn.style.cursor = "pointer";
        return btn
    }
    function getValDefault(key) {
        switch (key) {
            case "style":
                return { "name": "display name", "selector": "[^repId]", "property": "css property", "value": "css value" }
            case "custom":
                return { "name": "display name", "mark": "[^mark]", "value": "" }
            case "value":
                return "name:value[:readonly/true/false]"
            case "contents":
                return { autolist: "1",
                    custom: [],
                    group: "group",
                    id: "uniq id",
                    style: [],
                    title: "name of the content",
                    template: "content"
                }
        }
    }
    function _createAddButton(valDefault) {

        var btnAdd = _createBtn("      [add]", function () {
            var ul = this.parentNode.getElementsByTagName("ul")[0];
            var value = retrieve(ul);
            valDefault = valDefault || value[0];
            var li = _createNode(value.length, valDefault);
            li.className = "unfold";
            var liLast = ul.getElementsByTagName("li");
            liLast = liLast[liLast.length - 1];
            ul.insertBefore(li, liLast);
            var inValues = li.getElementsByTagName("span");
            while (inValues[0]) {
                var span = inValues[0];
                edit(span.parentNode.getElementsByTagName("h1")[0]);
            }
        })
        btnAdd.className = "btnAdd";
        return btnAdd;
    }
    function _createNode(key, value) {
        var li = document.createElement("LI");
        li.className = "fold";

        var h1 = document.createElement("H1");
        h1.innerHTML = key;
        li.appendChild(h1);

        var domValue = fold(value);

        li.appendChild(document.createTextNode(":"));
        li.appendChild(domValue);
        var fnKeyClick;
        if (domValue.nodeName == "UL") {
            var preview = document.createElement("div");
            preview.className = "preview";
            if ($.isArray(value)) {
                preview.innerHTML = "(array[" + value.length + "])";
                var valDefault = getValDefault(key);
                li.appendChild(_createAddButton(valDefault));
            } else {
                preview.innerHTML = "{object}";
            }
            li.insertBefore(preview, domValue);
            fnKeyClick = function () {
                var li = this.parentNode;
                var _class = li.className.split(" ")
                if (_class.indexOf("fold") > -1) {
                    _class.splice(_class.indexOf("fold"), 1, "unfold");
                } else {
                    _class.splice(_class.indexOf("unfold"), 1, "fold");
                }
                li.className = _class.join(" ");
            }
        } else if (domValue.nodeName == "SPAN") {
            fnKeyClick = function () {
                var key = this;
                var text = key;
                while (text = text.nextSibling) {
                    if (text.nodeName == "SPAN") {
                        edit(key);
                    } else if (text.nodeName == "TEXTAREA" || text.nodeName == "INPUT") {
                        save(key);
                    }
                }
            }
        }

        //if the item is the 'value' of a CUSTOM or STYLE, special switch
        if (key == "value") {
            var valArrayDefault = [], valTextDefault = "input values";
            var text;
            if (domValue.nodeName == "UL") {
                text = "[switch to String]";
                li.setAttribute("former", JSON.stringify(valTextDefault));
            } else {
                text = "[switch to Array]";
                li.setAttribute("former", JSON.stringify(valArrayDefault));
            }
            var btnSwitch = _createBtn(text, function () {
                for (var _val = h1; _val = _val.nextSibling; ) {
                    var valDefault, valNow;
                    if (_val.nodeName == "UL") {
                        valNow = retrieve(_val);
                    } else if (_val.nodeName == "SPAN") {
                        valNow = _val.textContent;
                    } else if (_val.nodeName == "INPUT") {
                        valNow = _val.value;
                    } else {
                        continue;
                    }
                    valDefault = JSON.parse(_val.parentNode.getAttribute("former") || "");
                    var newLi = _createNode("value", valDefault);
                    newLi.setAttribute("former", JSON.stringify(valNow));
                    _val.parentNode.parentNode.insertBefore(newLi, _val.parentNode);
                    _val.parentNode.parentNode.removeChild(_val.parentNode);
                    edit(h1);
                    break;
                }
            });
            li.appendChild(btnSwitch);
        }

        // if item belongs to an array, del button 
        if (!isNaN(Number(key))) {
            var btnDel = _createBtn("     x     ", function () {
                if (confirm("are you sure??")) {
                    var json = retrieve(li.parentNode);
                    json.splice(key, 1);
                    var _ul = fold(json);
                    li.parentNode.parentNode.insertBefore(_ul, li.parentNode);
                    li.parentNode.parentNode.removeChild(li.parentNode);
                }
            })
            btnDel.style.display = "inline";
            li.appendChild(btnDel);
            li.className = li.className.split(" ").concat("array").join(" ");
        }

        if (h1.addEventListener) {
            h1.addEventListener('click', fnKeyClick, false);
        } else if (h1.attachEvent) {
            h1.attachEvent('onclick', fnKeyClick);
        }
        return li;
    } //function createNode

    function fold(json) {
        if (typeof json == "array" || typeof json == "object") {
            var isArray = $.isArray(json);
            var ul = document.createElement("UL");
            var liBrackets0 = document.createElement("LI"),
                liBrackets1 = document.createElement("LI");
            liBrackets0.style.clear = "both";
            liBrackets1.style.clear = "both";
            if (isArray) {
                liBrackets0.innerHTML = "[";
                liBrackets1.innerHTML = "]";
            } else {
                liBrackets0.innerHTML = "{";
                liBrackets1.innerHTML = "}";
            }

            ul.appendChild(liBrackets0);

            for (var key in json) {
                var li = _createNode(key, json[key]);
                ul.appendChild(li);
            }
            ul.appendChild(liBrackets1);
            return ul;
        } else {
            var input = document.createTextNode(json);
            var span = document.createElement("span");
            span.appendChild(input)
            return span;
        }
    } //  function fold(json) 
    function retrieve(ul) {
        var ret = {}          // use object
        for (var i in ul.childNodes) {
            var li = ul.childNodes[i];
            if (li.nodeName != "LI") continue;

            var key = li.getElementsByTagName("h1");
            if (key.length == 0) {
                if (li.innerHTML.match(/\[/)) {
                    ret = [];         // use array      []
                }
                continue
            }
            key = key[0];

            var value = '';
            for (var domValue = key; domValue = domValue.nextSibling; ) {
                if (domValue.nodeName == "SPAN") {
                    value = domValue.textContent;
                } else if (domValue.nodeName == "UL") {
                    value = retrieve(domValue)
                } else if (domValue.nodeName == "TEXTAREA" || domValue.nodeName == "INPUT") {
                    value = domValue.value;
                }
            }
            ret[key.textContent] = value;
        }
        return ret;
    }
    function edit(key) {
        var text = key;
        while (text = text.nextSibling) {
            if (text.nodeName == "SPAN") {
                if (key.innerHTML == "html" || key.innerHTML == "template") {
                    var input = document.createElement("TEXTAREA");
                    input.value = text.textContent;
                    input.style.width = key.parentNode.clientWidth - key.clientWidth - 60 + "px";
                    input.style.height = (key.parentNode.clientHeight + 60) + "px";
                    key.parentNode.insertBefore(input, text)
                    key.parentNode.removeChild(text);
                } else {
                    var input = document.createElement("INPUT");
                    input.value = text.textContent;
                    input.style.width = key.parentNode.clientWidth - key.clientWidth - 60 + "px";
                    key.parentNode.insertBefore(input, text)
                    key.parentNode.removeChild(text);
                }
                break;
            } else if (text.nodeName == "UL") {
                text.parentNode.className = "unfold";
                for (var li = text.childNodes[0]; li = li.nextSibling; ) {
                    if (li.nodeName != "LI") continue;
                    var key = li.getElementsByTagName("h1")
                    if (key.length) {
                        key = key[0];
                        edit(key);
                    }
                }
            }
        }
    }
    function save(key) {
        var text = key;
        while (text = text.nextSibling) {
            if (text.value) {
                key.parentNode.insertBefore(fold(text.value), text);
                key.parentNode.removeChild(text);
            }
        }
    }
    function init() {
        var template = JSON.parse($("#template_json").val());

        var hell = fold(template);
        var wrapper = $("<div></div>");
        //wrapper.before($("#template_json").hide());
        $("#template_json").hide().before(wrapper)
        wrapper.append(hell);
        $(hell).parent().addClass("hell")
        style = document.createElement('style');
        style.type = 'text/css';
        document.getElementsByTagName('head')[0].appendChild(style);
        var str = ".hell ul{margin:0 ;padding:0 0 0 40px;display:none;}\
        .hell ul li{line-height:20px;list-style:none;margin:0; padding:0 ;color:#963;}\
        .hell ul li:hover{background:#EFF}\
        .hell ul li h1{background-color:#EFE;float:left;width:70px;overflow:hidden;display:inline-block;cursor:pointer;color:#000;padding:0 20px;margin:0 20px;font:normal normal normal 14px/18px songti}\
        .hell ul li div.preview{color:#aaa;display:inline;font:italic normal normal 10px/10px arial;}\
        .hell ul li.unfold{border:solid 1px #EEF;}\
        .hell ul li.unfold.array{float:none}\
        .hell ul li.unfold>.btnAdd{display:inline;}\
        .hell ul li.unfold>ul{display:block;}\
        .hell ul li.unfold>.preview{display:none;}\
        .hell ul li.unfold>h1{background-color:#DFD;}\
        .hell ul li.fold{border-style:none;}\
        .hell ul li.fold.array{float:left}\
        .hell ul li.fold>.btnAdd{display:none;}\
        .hell ul li.fold>ul{display:none;}\
        .hell ul li.fold>.preview{display:inline;}\
        ";
        if (style.styleSheet) {
            style.styleSheet.cssText = str;
        } else {
            style.textContent = str;
        }

        $(hell).show();
        wrapper.delegate("h1", "click", function () {
            var key = this;
        })
        $(document).delegate("#save_topic", "mousedown", function () {
            $("#template_json").val(retrieve(hell))
        })
    }
    init();
})                                              
    
