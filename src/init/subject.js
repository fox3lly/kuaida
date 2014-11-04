var $$ = function (id) {
    return document.getElementById(id);
};
String.prototype.toHTML = function () {
    var str = this;
    str = str.replace(/&/g, "&amp;");
    str = str.replace(/"/g, "&quot;");
    str = str.replace(/</g, "&lt;");
    str = str.replace(/>/g, "&gt;");
    return str;
};

var subject = {
    api:{
        gettemplate   : '/topic/default/getTemplateJson',
        getsubject    : '/topic/default/getSubjectJson',
        lockuser :   '/topic/default/lockuser',
        getTemplateStyle : '/topic/default/getTemplateStyle',
        save : '/topic/default/save',
        publish :  '/topic/default/publish',
        preview :'/topic/default/preview',
        getHistory : '/topic/default/getHistory',
        addfile:'/topic/default/addfile'
    },
    types: {
        'parts': true,
        'nav': true,
        'banner': true,
        'splitter': true//@asg 2012.1.11
    },
    status: "ok",
    workMode: 'full',
    styleCheck: true,
    isEditing: false, //是否正在编辑
    ready: function () {
        if (this.JSON.status == "ok" && this.template.status == "ok") {
            //new subject.sToolBar({"wrap":$("#toolBar")});
            //new dog.Toolbar;
            if (this.JSON.jsondoc)
                this.JSON.run();
            if (!this.JSON.error) { this.status = "ok"; };
        } else {
            return;
        };
    },
    defaultAttributes: {
        "styleId": 25,
        "pageTitle": "关键词_当前页面名称_频道名_新浪乐居",
        "keywords": "关键词,关键词",
        "description": "此页面的说明",
        "customStyle": "",
        "style": [
		{ "name": "网页背景图片(图片地址)", "selector": "body", "property": "background-image", "value": "默认" },
        { "name": "网页背景颜色", "selector": "body", "property": "background-color", "value": "" },
        { "name": "网页背景位置", "selector": "body", "property": "background-position", "value": "center 0" },
		{ "name": "网页背景重复方式", "selector": "body", "property": "background-repeat", "value": ["默认:默认", "不重复:no-repeat", "重复:repeat", "横向重复:repeat-x", "纵向重复:repeat-y"] },
		{ "name": "顶部背景图片(图片地址)", "selector": "#topWrap", "property": "background-image", "value": "默认" },
        { "name": "顶部背景颜色", "selector": "#topWrap", "property": "background-color", "value": "" },
        { "name": "顶部背景位置", "selector": "#topWrap", "property": "background-position", "value": "center 0" },
		{ "name": "顶部背景重复方式", "selector": "#topWrap", "property": "background-repeat", "value": ["默认:默认", "不重复:no-repeat", "重复:repeat", "横向重复:repeat-x", "纵向重复:repeat-y"] },
		{ "name": "主体背景图片(图片地址)", "selector": "#wrap", "property": "background-image", "value": "默认" },
        { "name": "主体背景颜色", "selector": "#wrap", "property": "background-color", "value": "" },
        { "name": "主体背景位置", "selector": "#wrap", "property": "background-position", "value": "center 0" },
		{ "name": "主体背景重复方式", "selector": "#wrap", "property": "background-repeat", "value": ["默认:默认", "不重复:no-repeat", "重复:repeat", "横向重复:repeat-x", "纵向重复:repeat-y"] },
		{ "name": "字体大小", "selector": "body", "property": "font-size", "value": "12px" },
		{ "name": "字体颜色", "selector": "body", "property": "color", "value": "#000" },
		{ "name": "链接颜色", "selector": "a:link", "property": "color", "value": "默认" },
		{ "name": "已访问链接颜色", "selector": "a:visited", "property": "color", "value": "默认" },
		{ "name": "活动链接颜色", "selector": "a:hover", "property": "color", "value": "默认" },
		{ "name": "标题背景重复方式", "selector": ".w_title", "property": "background-repeat", "value": ["默认:默认", "不重复:no-repeat", "重复:repeat", "横向重复:repeat-x", "纵向重复:repeat-y"] }
	]
    },
    strCSS: "",
    sysAttr: function () {
        if (this.status != "ok") { return };
        var self = this;
        var editDefault = {
            custom: [
                    { mark: "pageTitle", name: '标题设置', value: "关键词_当前页面名称_频道名_新浪乐居" },
                    { mark: "keywords", name: '关键词', value: "关键词,关键词" },
                    { mark: "description", name: 'SEO说明', value: "此页面的说明" },
                    { mark: "customStyle", name: '自定样式', value: "" },
                    { mark: "cssHead", name: 'CSS样式', value: "" }//新增CSS样式模块2013-6-21
                ],
            style: this.defaultAttributes.style
        }
        var edits = dog.pannel.customize(editDefault.custom, this._attributes);

        var editSysAttributePannel = new dog.pannel.EditAttributePannel(edits, editDefault, null, { "title": "页面属性" });
        editSysAttributePannel.bind("update", function (event, data) {
            //@asg 2013.5.29 self._attributes = data;
            dog.pannel.uncustomize(data, self._attributes)

            //新增CSS样式模块2013-6-21
            var cssHeadStyle = '/*cssHeadStyle*/' + self._attributes.cssHead + '/*cssHeadStyle*/';
            var reg = new RegExp('/\\*cssHeadStyle\\*/.*?/\\*cssHeadStyle\\*/','gi');
            dog.clearStyle(reg);
            dog.createStyle(cssHeadStyle);
            
            self.getStyleSheet("page");
        });
    },
    sysStyle: function () {
        var self = this;
        var editSysAttributePannel = new dog.pannel.SystemStyleSelectPannel({ "title": "更换风格" });
        editSysAttributePannel.bind("update", function (event, index) {
            subject.styletem.add(index, "add");
        });
    },
    getStyleSheet: function (mark) {
        var styles = this._attributes.style;
        var stylestr = '/*' + mark + '*/';
        if (styles) {
            $.each(styles, function () {
                var selector = this.selector;
                var style = $.extend({}, this, {
                    "selector": selector
                });
                stylestr += _.template(dog.styleTemplate, style);
            })
        };
        stylestr += '/*' + mark + '*/';
        var reg = new RegExp('/\\*' + mark + '\\*/.*?/\\*' + mark + '\\*/', 'gi');
        //@asg 10.26; call dog, 
        dog.clearStyle(reg);
        dog.createStyle(stylestr);
    },
    getDefaultCustom: function (custom) {
        var ret = [];
        $.each(custom, function (i, item) {
            // get value and defaultvalue
            // @asg 12.4.18 new feature:
            // added checkbox custom;
            var val;
            if (!$.isArray(item.value)) {   //normal custom data, it's a string.
                val = item.value
            } else if (item.value[0].split(':').length == 2) {// select option custom, retvalue is the first element of the array
                val = item.value[0].split(':')[1]
            } else {  //checkbox custom, retvalue is the combination of each element of the array which are readonly or default true;
                var valSelected = [];
                $.each(item.value, function (valueIdx, v) {
                    splitedvalue = _.map(v.replace('http:', 'http：').split(":"), function (s) { return s.replace('http：', 'http:') });
                    if (splitedvalue[2] == 'true' || splitedvalue[2] == 'readonly') {
                        valSelected.push(splitedvalue[1])
                    }
                })
                val = valSelected.join(',');
            }
            ret.push({
                "name": item.name
                , "mark": item.mark
                , "value": val
            });
        });
        return ret;
    },
    setMode: function (mode) { //修改工作模式
        if (mode != 'full' && mode != 'data') {
            if (this.workMode == 'full') {
                mode = 'data';
            } else {
                mode = 'full';
            };
        };
        this.workMode = mode;
        $("body").removeClass("data full").addClass(mode)//@asg 4.28; for ie6 fix: use css to hide buttons in content_tool
    }
};

subject.saveCSS = function (CSS, defaultCSS) {
    //CSS.length=0;//清空改变的样式属性重新赋值
    var css = [];
    $.each(CSS, function (i, item) {
        var selector, property, name, dValue = "默认";
        $.each(defaultCSS, function (j, m) {
            if (item.name == m.name) {
                dValue = $.isArray(m.value) ? m.value[0].split(":")[1] : m.value;
                name = m.name;
                selector = m.selector;
                property = m.property;
                return false;
            }
        });
        if (item.value == dValue || item.value == '' || item.value == '默认') {
            return true;
        };
        css.push({ "name": name, "selector": selector, "property": property, "value": item.value });
    });
    return css;
};
subject.saveCustom = function (custom, customTemplate) {
    //CSS.length=0;//清空改变的样式属性重新赋值
    var defaultCustom = subject.getDefaultCustom(customTemplate);
    var temp = [];
    $.each(custom, function (i, item) {
        var mark, name, dValue = "默认";
        defaultItem = _.find(defaultCustom, function (customItem) {
            return item.mark == customItem.mark
        });
        var templateItem = _.find(customTemplate, function (customItem) {
            return item.mark == customItem.mark
        });
        if (defaultItem) {
            dValue = defaultItem.value;
            name = defaultItem.name;
            mark = defaultItem.mark;
        }
        temp.push({
            "name": name,
            "mark": mark,
            "value": (item.value == '' && !$.isArray(templateItem.value)) ?
        		dValue : item.value
        });
    });
    return temp;
};   
subject.urlValue = function (name) {
    var pars = window.location.href.match(new RegExp("[?&]" + name + "=([^&=?]+)"))
    if (pars)
        return unescape(pars[1]);
    else
        return null;
}

Date.prototype.formatDate = function (code) {
    if (!code) { return };
    var yyyy = new String(this.getFullYear());
    var yy = yyyy.substr(2);
    var m = new String(this.getMonth() + 1);
    var mm = m.length < 2 ? "0" + m : m;
    var d = new String(this.getDate());
    var dd = d.length < 2 ? "0" + d : d;
    code = code.replace(/yyyy/ig, yyyy);
    code = code.replace(/yy/ig, yy);
    code = code.replace(/mm/ig, mm);
    code = code.replace(/m/ig, m);
    code = code.replace(/dd/ig, dd);
    code = code.replace(/d/ig, d);
    return code;
};

subject.dataDefault = [
{ "name": "author", "title": "作者", "value": "作者名称" },
{ "name": "title", "title": "标题", "value": "数据标题文字$i", "validator": /^((([^<>]*<(\/)*(strong|a|span|p)\b[^<>]*>[^<>]*)*)|([^<>]*))$/g },
{ "name": "link", "title": "链接", "value": "http://" },
{ "name": "intro", "title": "描述", "value": "新浪(NASDAQ: SINA)是一家服务于中国及全球华人社群的领先在线媒体及增值资讯服务提供商。", "validator": /^((([^<>]*<(\/)*(strong|a|span|p)\b[^<>]*>[^<>]*)*)|([^<>]*))$/g },
{ "name": "image", "title": "图片", "value": "http://www.sinaimg.cn/dy/stencil/temp/sina.jpg" },
{ "name": "datetime", "title": "日期", "value": new Date().formatDate("m月d日") },
{ "name": "br", "title": "换行", "value": true },
{ "name": "vid", "title": "视频vid", "value": "" }
];
subject.defaultData = function (dataDefault, dataSum) {
    var tempData = [];
    dataDefault = dataDefault || subject.dataDefault;
    var sum = dataSum ? (isNaN(dataSum) ? dataSum.length : dataSum) : 6;
    for (var j = 0, item; item = dataDefault[j]; j++) {
        var k, val;
        if (item.name) {
            k = item.name;
            val = item.value;
        } else {
            k = item;
            val = _.find(subject.dataDefault, function (obj) { return obj.name == item }).value;
        }
        for (var i = 0; i < sum; i++) {
            if (!tempData[i]) {
                tempData.push({});
            }
            if (dataSum && dataSum[i] && dataSum[i][k] != null) {
                tempData[i][k] = dataSum[i][k];
            } else if (typeof val === "string") {
                tempData[i][k] = val.replace("$i", i);
            } else {
                tempData[i][k] = val
            }
        }
    };
    return tempData;
}
subject.init = function () {/*TODO两个请求应该分别调用两个函数来处理数据，template应该使初始化专题的所有模板列表，数据应该是在模板数据处理完之后再进行处理*/

    this.cid = subject.urlValue("c_id");
    this.pid = subject.urlValue("p_id");
    this.tid = subject.urlValue("t_id");
    this.did = subject.urlValue("d_id");
    this.hid = subject.urlValue("h_id");
    this.searchUrl = '/api/document/search';
    this.JSON.getData(subject.api.getsubject, this.cid, this.pid, this.tid, this.did, this.hid);
    this.template.getData(subject.api.gettemplate, this.cid, this.pid, this.tid, this.did);
    //lock
    var topic_lock = function () {
        $.getJSON(subject.api.lockuser, { t_id: subject.tid, d_id: subject.did }, function (data) {
            if (data.status) {
                if (data.msg != '') {
                    alert(data.msg);
                    clearInterval(lock_interval);
                }
                if (!$('#TopTool').length) {
                    new dog.Toolbar();
                }
            } else {
                clearInterval(lock_interval);
                alert(data.error);
            }
        });        
    };
    topic_lock();
    lock_interval = setInterval(topic_lock, 59000);


};

subject.url = function (str) {
    return "http://" + window.location.host + str;
};
