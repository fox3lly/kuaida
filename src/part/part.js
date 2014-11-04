/*
 *author viking
 * use this shitty class combine with jquery or you'll get fucked
 *
 *| ___ \         | |   (_)
 *| |_/ /__ _ _ __| |_   _ ___
 *|  __// _` | '__| __| | / __|
 *| |  | (_| | |  | |_ _| \__ \
 *\_|   \__,_|_|   \__(_) |___/
 *                     _/ |
 *                    |__/
 *                    
 * last modify:@asg 6.29
 */

(function () {
    var $topWrap = $('#topWrap');
    var $wrap = $('#wrap');
    //default settings
    var settings = {

}

//part class start here
var Part = dog.View.extend({
    events: {
        "click span.delete": "remove",
        "click span.up": "up",
        "click span.down": "down",
        "click span.config": "config",
        "click span.cut": "cut",
        "click span.copy": "copy",
        "click span.paste": "paste"
    },
    init: function (opts) {
        //public argurments goes here
        this.opts = opts;
        //modified @asg 2012.4; get templated part from json; get rows' classes from template;
        this.template = _.find(subject.parttem.data, function (_part) { return _part._attributes.id == opts._attributes.pid })
        || _.find(subject.parttem.data, function (_part) { return _part._attributes.row == opts._attributes.row });
        this.opts._attributes.pid = this.template._attributes.id
        this.defaultAttributes = {};
        $.extend(this.defaultAttributes, this.template._attributes, this.opts._attributes);
        this.style = this.opts._attributes.style;
        this.container = $wrap;
        var parttem = this.template.html;
        this.el = this.main = $(parttem.replace(/\[\^.*?\]/ig, '<span id="partcont"></span>'));
        this.partCont = this.el.find('#partCont').parent();
        $('#partCont').remove();
        this.partCont.addClass('partCont');
        this.partTool = $('<div class="partTool"><p><span class="delete icon" title="删除">Delete</span><span class="config icon" title="属性">Config</span><span class="up icon" title="上移">Up</span><span class="down icon" title="下移">Down</span><span class="cut icon" title="剪切">cut</span><span class="copy icon" title="复制">copy</span><span class="paste icon" title="粘贴">paste</span></p></div>');
        this.create();
        this.registerEvent(); //@asg remove getstylesheet; deplicated;
        this._super();
    },
    create: function () {
        //modified @asg 4.27; remove relative positioning to normal position; move toolbar into a relative wrapper
        this.el.prepend('<div class="toolWraper"></div>');
        this.el.find('.toolWraper').append(this.partTool);

        this.el.append(this.partCont);
        this.setId();
        this.getStyleSheet();
        this.container.append(this.el);
        this.renderRow();
    },
    renderRow: function () {
        //modified @asg 2012.4; get templated part from json; get rows' classes from template;
        var rowNum = this.opts.rows ? this.opts.rows.length : this.opts._attributes.row || this.template._attributes.row;
        var item = this.opts;
        for (var z = 0; z < rowNum; z++) {
            var data = (this.opts.rows) ? item.rows[z] : $.extend({}, subject.rowtem.data[0]);
            var row = new Row(data, {
                parent: this.el,
                way: {
                    method: 'render'
                }
            });
            //@asg remove setId; deplicated;
            row.setClass(this.template._attributes.rowClass[z]);
            if (item.rows) {
                row.render(data);
            }
        }
    },
    setId: function () {
        this.el.attr('id', 'part_' + (++dog.ids));
    },
    remove: function () {
        var sure = window.confirm('是否删除此横切?');
        if (sure) {
            this.el.remove();
        }
    },
    down: function () {//@asg 1.11 no more jquery[after/before/append/html/replaceWith];
        var next = this.el.next()
        var colon = new dog.Part(this.getData());
        if (next.length > 0) {
            //this.el.before(next);
            next.after(colon.el);
            this.el.remove();
        } else {
            alert('已经是在最下面了');
        }
        return false;
    },
    up: function () { //@asg 1.11 no more jquery[after/before/append/html/replaceWith];
        var next = this.el.prev();
        var colon = new dog.Part(this.getData());
        if (next.length > 0) {
            //this.el.after(next);
            next.before(colon.el);
            this.el.remove();
        } else {
            alert('已经是在最上面了');
        }
    },
    config: function () {
        var self = this;
        //ishide @asg

        var editDefault = { custom: [{ mark: "ishide", name: '发布时暂时隐藏此横切', value: [":true:false"]}] };
        var edits = dog.pannel.customize(editDefault.custom, self.opts._attributes);
        var editAttributePannel = new dog.pannel.EditAttributePannel(edits, editDefault, "", {
            "title": "横切属性"
        });
        editAttributePannel.bind("update", function (event, data) {
            dog.pannel.uncustomize(data, self.opts._attributes)
            self.getStyleSheet();
        })

    },

    registerEvent: function (settings) {
        var that = this;
        //remove the layer
        //@wx 2012-04-18 fix the problem of the HengQie's height doesn't change immediately with blocks' change
        this.el.mousemove(function () {
            if (subject.workMode != 'full') { return };
            that.partTool.css({ "height": this.offsetHeight - 2 + 'px', "width": (this.offsetWidth + 20) + 'px' });
            that.partTool.find('p').css({ "left": this.offsetWidth })//@asg 6.29
            that.partTool.stop().fadeTo('normal', 1);
        })
        this.el.mouseout(function () {
            that.partTool.stop().fadeOut();
        })
    },
    getStyle: function (opt) {
        var arr = [];
        for (var i = 0; i < opt.length; i++) {
            var x = parseInt(this.el.css(opt[i]));
            arr.push(x);
        }
        return arr;
    },
    getData: function () {
        var self = this;
        this.opts.rows = [];
        this.el.find('.row').each(function (i, item) {
            self.opts.rows.push($(this).getObject('Row').getData())
        });
        return this.opts;
    },
    configCss: function (opts) {
        this.el.css(opts);
    },
    move: function (e) {
        var sender = this.el;
        var start = {
            x: e.pageX,
            y: e.pageY,
            cx: sender.offset().left - e.pageX,
            cy: sender.offset().top - e.pageY + 20,
            positions: {
                position: "relative",
                left: 0,
                top: 0
            }
        };
        e.preventDefault();

        return sender.dnd(start, ".editing .content");
    }
});

var rowDefault = {
    width: '200px'
}
//row class
var Row = dog.View.extend({
    events: {
        "click span.add": "addNewBlock",
        "click span.edit": "edit"
    },
    init: function (data, opts) {
        //public argurments goes here
        this.data = data;
        this.father = opts.parent;
        this.el = $('<div><div class=\"row\"></div><div class=\"tools\"><span class=\"add\">添加</span><span class=\"edit\">属性</span></div></div>').appendTo(this.father.find('.partCont'));
        this.rowBox = this.el.find('.row');
        this.setId();
        this.create();
        this._super();
    },
    //public methods
    create: function () {
        this.tool = this.el.find('.tools');
    },
    render: function (data) {
        for (var bl in data.blocks) {
            this.addBlock(data.blocks[bl]);
        }
        return false;
    },
    addBlock: function (block) {
        //var holder = this.el.find('.blockBox'),
        c = new dog.Block(block);
        c.el.appendTo(this.rowBox);
    }, //上下两个方法有什么区别？请注释。
    addNewBlock: function () {
        var self = this;
        var blockStyleSelectPannel = new dog.pannel.BlockStyleSelectPannel({
            "title": "1111"
        });
        blockStyleSelectPannel.bind('update', function () {
            var data = dog.deepCopy({}, arguments[1]);
            data._attributes.style = [];
            c = new dog.Block(data);
            c.el.appendTo(self.rowBox);
        })
    },
    edit: function () {
        var self = this, stylePropertyPannel = new dog.pannel.EditAttributePannel(self.data._attributes, subject.rowtem.data[0]._attributes, null, {
            "title": "编辑数据"
        });
        stylePropertyPannel.bind("update", function (event, data) {
            self.data._attributes = data;
            self.getStyleSheet();
        })
    },
    getData: function () {
        var self = this;
        self.data = $.extend({}, self.data);
        self.data.blocks = [];
        this.el.find('.block').each(function (i, item) {
            self.data.blocks.push($(this).getObject('Block').getData())
        });
        return self.data;
    },
    getParentId: function () {
        this.pid = this.father.attr('id');
    },
    getParentWidth: function () {
        var pwidth = this.parent.width();
        return pwidth;

    },
    setId: function () {
        this.getParentId();
        this.el.attr('id', this.pid + '_row' + (++dog.ids));
        this.getStyleSheet();
    },
    setClass: function (y) {
        this.el.addClass(y);
    },
    setWidth: function (y) {
        if ((y * 1) === 3) {
            this.rowDefault = Math.round((this.getParentWidth() - 20) / 3);
        } else {
            this.rowDefault = Math.round((this.getParentWidth() - 20) / 2);
        }

    },
    configCss: function (css) {
        this.el.css(css);
    },
    getStyle: function (opt) {
        var arr = [];
        for (var i = 0; i < opt.length; i++) {
            var x = parseInt(this.el.css(opt[i]));
            arr.push(x);
        }
        return arr;
    }
});

//the banner class
var Banner = dog.View.extend({
    events: {
        "click span.config": "edit"
    },
    init: function (data) {
        this.styleBanner = '';
        this.data = data;

        this.defaultData = {
            "_attributes": {
                "bannerview": "normal",
                "bannertype": "img",
                "src": "",
                "alt": "",
                "width": "",
                "height": "",
                "memo": "",
                "style": [{
                    "name": "内填充",
                    "selector": ".Banner",
                    "property": "padding",
                    "value": "默认"
                }, {
                    "name": "对齐方式",
                    "selector": ".Banner",
                    "property": "text-align",
                    "value": ["默认:inherit", "居中:center", "居左:left", "居右:right"]
                }, {
                    "name": "banner下间距",
                    "selector": ".Banner",
                    "property": "margin-bottom",
                    "value": "默认"
                }, {
                    "name": "注释字号",
                    "selector": ".bannerMemo",
                    "property": "font-size",
                    "value": "默认"
                }, {
                    "name": "注释颜色",
                    "selector": ".bannerMemo",
                    "property": "color",
                    "value": "默认"
                }, {
                    "name": "注释位置(左)",
                    "selector": ".bannerMemo",
                    "property": "left",
                    "value": "默认"
                }, {
                    "name": "注释位置(右)",
                    "selector": ".bannerMemo",
                    "property": "right",
                    "value": "5px"
                }, {
                    "name": "注释位置(上)",
                    "selector": ".bannerMemo",
                    "property": "top",
                    "value": "默认"
                }, {
                    "name": "注释位置(下)",
                    "selector": ".bannerMemo",
                    "property": "bottom",
                    "value": "5px"
                }],
                custom: [
                    { mark: "bannerview", name: "banner显示", value: ["显示:normal", "隐藏:hidden", "透明:trans"] },
                    { mark: "bannertype", name: "banner类型", value: ["图片:img", "flash:flash"] },
                    { mark: "src", name: '图片地址', value: "" },
                    { mark: "alt", name: '图片说明', value: "" },
                    { mark: "width", name: '图片宽度', value: "" },
                    { mark: "", name: '图片宽度', value: "px(只输入数字)" },
                    { mark: "height", name: '图片高度', value: "" },
                    { mark: "", name: '图片高度', value: "px(只输入数字)" },
                    { mark: "memo", name: '专题注释', value: ""}]
            }
        }
        //subject.json中banner的html属性只给后台生成预览用,前端的banner生成从_attributes中提取
        //src为空时,根据当前样式id,从styletem中匹配
        var self = this;
        $.each(subject.styletem.data, function (i, n) {
            if (n.id == subject._attributes.styleId) {
                self.styleBanner = n.banner;
                return false;
            }
        });

        this.el = $('<div id="Banner_box" class="partBox"><div id="BannerCont"></div></div>'); //@asg 10.23; toolbar fix
        this.partTool = $('<div class="partTool"><p><span class="config icon">Config</span></p></div>');
        this.create();
        this.render();
        this.registerEvent();
        this.getStyleSheet();
        this._super();
    },
    render: function () {
        //console.log(this.data._attributes.src);
        //console.log(this.defaultData._attributes.src);
        if (this.data._attributes.bannertype == 'html') {
            this.isHTML = true;
            this.contHTML = this.data.html;
            this.el.find("#BannerCont").html(this.contHTML); //@asg   2013.10.18
        }
        else {//@asg   2013.10.18
            if (this.data._attributes.bannertype == 'img') {
                this.contHTML = '<div class="Banner" style="position:relative"><img src="' + (this.data._attributes.src ? this.data._attributes.src : this.styleBanner) + '"' + (this.data._attributes.width != '' && this.data._attributes.width != 'auto' ? ' width="' + this.data._attributes.width + '"' : '') + (this.data._attributes.height != '' && this.data._attributes.height != 'auto' ? ' height="' + this.data._attributes.height + '"' : '') + ' alt="' + this.data._attributes.alt + '" /><div class="bannerMemo">' + this.data._attributes.memo + '</div></div>';
            } else if (this.data._attributes.bannertype == 'flash') {
                this.contHTML = '<div class="Banner" id="bannerFlash"></div><script type="text/javascript">\n\
                var bannerFlashObj = new sinaFlash("' + this.data._attributes.src + '","","' + this.data._attributes.width + '", "' + this.data._attributes.height + '", "9", "", false,"high");\n\
                bannerFlashObj.addParam("wmode", "opaque");\n\
                bannerFlashObj.addParam("menu", "false");\n\
                bannerFlashObj.write("bannerFlash");\n\
                </s' + 'cript>\n<!-- Banner end -->';
            };
            this.el.find("#BannerCont").html(this.contHTML);
            if (this.data._attributes.bannerview == 'hidden') {
                var height = this.el.find(".Banner")
                this.el.find(".Banner").html('');
                this.el.find("#BannerCont").css({ "minHeight": "60px" });
            } else if (this.data._attributes.bannerview == 'trans') {
                var bannerHeight = this.data._attributes.height || 0;
                this.el.find(".Banner").html('');
                this.el.find(".Banner").css({ "height": bannerHeight + "px" });
                this.el.find("#BannerCont").css({ "minHeight": "60px" });
            } 
        }
    },
    create: function () {
        $topWrap.append(this.el);
    },
    edit: function () {
        var self = this;
        if (!self.isHTML) {
            //@asg
            var editDefault = {
                custom: this.defaultData._attributes.custom,
                style: this.defaultData._attributes.style,
                convertible: true   //@asg 2013.5.22 convert to html
            }
            var edits = dog.pannel.customize(editDefault.custom, this.data._attributes);

            var editAttributePannel = new dog.pannel.EditAttributePannel(edits, editDefault, "", {
                "title": "导航菜单属性"
            });
            editAttributePannel.bind("update", function (event, data) {
                dog.pannel.uncustomize(data, self.data._attributes)
                self.render();
                self.getStyleSheet();
                self.getData();
            });
            editAttributePannel.bind("convert", function (event, data) {
                var transform = window.confirm("转为HTML后将不能再以组件方式编辑，以后只能用HTML方式编辑,是否转换为html形式?");
                if (transform) {
                    self.isHTML = true;
                    self.data._attributes.bannertype = 'html';
                    var raw = self.el.find("#BannerCont").html();
                    var tidy = style_html(raw, 4, ' ', 80);
                    var rawHTMLPannel = new dog.pannel.RawHTMLPannel(tidy);
                    rawHTMLPannel.bind("confirm", function (event, data) {
                        self.el.find("#BannerCont").html(data[0]);
                    })
                }
            })
        } else {
            var raw = self.el.find("#BannerCont").html();
            var tidy = style_html(raw, 4, ' ', 80);
            var rawHTMLPannel = new dog.pannel.RawHTMLPannel(tidy);
            rawHTMLPannel.bind("confirm", function (event, data) {
                self.el.find("#BannerCont").html(data[0]);
            })
        }

    },
    getData: function () {
        this.data.html = this.el.find('#BannerCont').html();
        return this.data;
    },
    registerEvent: function () {
        var self = this;
        var toolWraper = $('<div class="toolWraper" style="width:' + this.el.find(".Banner").width() + 'px;display:block;position:relative"></div>'); //@asg  2013.05.8 remove margin:auto; terrible bug.
        this.el.prepend(toolWraper)
        toolWraper.append(this.partTool)
        this.el.hover(function () {
            self.partTool.css({ "height": this.offsetHeight - 2 + 'px' });
            self.partTool.css({ "width": self.el.find(".Banner").width() - 2 + 'px' }); ; //@asg 2013.5.21 (.Banner)//  2013.05.8 width = #BannerCont; not 'this';
            self.partTool.show();
        }, function () {
            self.partTool.hide();
        })
    }
});

var navEditTemplate = "<ul id=\"dataList\"><% _.each(data,function(item,key){ %><li id=\"dataList_<%=key%>\"><%=key+1%>标题：<input type=\"text\" value=\"<%=item.text%>\"/>链接：<input type=\"text\" value=\"<%=item.href%>\"><span class=\"ico_up\"></span><span class=\"ico_down\"></span><span class=\"ico_del\"></span></li><% }); %></ul>";
var Nav = dog.View.extend({
    events: {
        "click span.ico_data": "editData",
        "click span.ico_attrib": "editArrtibute"
    },
    init: function (data) {
        this.data = data;
        this.defaultData = {
            "data": [{
                "name": "title",
                "title": "标题",
                "value": "栏目名称"
            }, {
                "name": "link",
                "title": "链接",
                "value": "http://www.sina.com.cn/"
            }],
            "_attributes": {
                "style": [{
                    "name": "字体大小",
                    "selector": "#[^repId]",
                    "property": "font-size",
                    "value": "12px"
                }, {
                    "name": "字体加粗",
                    "selector": "#[^repId]",
                    "property": "font-weight",
                    "value": ["不加粗:normal", "加粗:bold"]
                }, {
                    "name": "文本颜色",
                    "selector": "#[^repId] .NavMenu",
                    "property": "color",
                    "value": "默认"
                }, {
                    "name": "链接颜色",
                    "selector": "#[^repId] a:link",
                    "property": "color",
                    "value": "默认"
                }, {
                    "name": "已访问链接颜色",
                    "selector": "#[^repId] a:visited",
                    "property": "color",
                    "value": "默认"
                }, {
                    "name": "活动链接颜色",
                    "selector": "#[^repId] a:hover",
                    "property": "color",
                    "value": "默认"
                }],
                custom: [{ mark: "ishide", name: '发布时暂时隐藏此横切', value: [":true:false"]}],
                "ishide": "false"
            }
        };
        this.el = $('<div id="NavCont"><div id="NavMenu"><div class="NavMenu"></div></div></div>');
        this.navMenu = this.el.find('.NavMenu');
        if (data._attributes.type == "html") {
            this.isHTML = true;
            this.buttons = $('<div id="NavTool"><p><span class="ico_attrib" title="属性"></span></p></div>').appendTo(this.el);
        } else {
            this.data.template = this.template = '<% _.each(data,function(obj,i){%><% if(i==0) { %><a href="<%= obj.link %>"><%= obj.title %></a><% } else { %> | <a href="<%= obj.link %>"><%= obj.title %></a><% } %><% }); %>';
            this.buttons = $('<div id="NavTool"><p><span class="ico_data" title="数据"></span><span class="ico_attrib" title="属性"></span></p></div>').appendTo(this.el);
            this.getStyleSheet();
        }
        this.createMenu();
        $topWrap.append(this.el);
        this.registerEvent();
        this._super();
    },
    createMenu: function () {
        if (!this.isHTML) {
            var data = this.data.data;
            var array = [];
            this.navMenu.html(_.template(this.template, {
                "data": data
            }));
        } else {
            this.navMenu.html(this.data.html)
        }
    },
    editData: function () {
        var self = this;
        var navPannel = new dog.pannel.EditDataPannel(self.data, self.defaultData.data, { "title": "编辑数据" });
        navPannel.bind("update", function () {
            self.data.data = arguments[1];
            /*对data重新赋值*/
            self.createMenu();
            /*重新渲染菜单*/
        })
    },
    editArrtibute: function () {
        var self = this;
        if (!this.isHTML) {
            //ishide @asg
            var editDefault = {
                custom: self.defaultData._attributes.custom,
                style: self.defaultData._attributes.style,
                convertible: true//@asg 2013.5.22 convert to html
            };
            var edits = dog.pannel.customize(editDefault.custom, self.data._attributes);
            var editAttributePannel = new dog.pannel.EditAttributePannel(edits, editDefault, "", {
                "title": "导航菜单属性"
            });
            editAttributePannel.bind("update", function (event, data) {
                dog.pannel.uncustomize(data, self.data._attributes)
                self.getStyleSheet();
            })
            editAttributePannel.bind("convert", function (event, data) {
                var transform = window.confirm("转为HTML后将不能再以组件方式编辑，以后只能用HTML方式编辑,是否转换为html形式?");
                if (transform) {
                    self.isHTML = true;
                    var raw = self.navMenu.html();
                    var tidy = style_html(raw, 4, ' ', 80);
                    var rawHTMLPannel = new dog.pannel.RawHTMLPannel(tidy);
                    rawHTMLPannel.bind("confirm", function (event, data) {
                        self.navMenu.html(data[0]);
                    })
                    self.el.find('.ico_data').hide();
                }
            })
        } else {
            var raw = this.navMenu.html();
            var tidy = style_html(raw, 4, ' ', 80);
            var rawHTMLPannel = new dog.pannel.RawHTMLPannel(tidy);
            rawHTMLPannel.bind("confirm", function (event, data) {
                self.navMenu.html(data[0]);
            })
        }

    },
    getData: function () {
        //delete this.data.template
        if (!this.isHTML) {
            return this.data;
        } else {
            return {
                "_attributes": {
                    "type": "html"
                },
                "html": this.navMenu.html()
            }
        }
    },
    registerEvent: function () {
        var self = this;
        this.el.hover(function () {
            self.buttons.css({ "height": this.offsetHeight - 2 + 'px' });
            self.buttons.show();
        }, function () {
            self.buttons.hide();
        })
    }
})

var Splitter = dog.View.extend({    //@asg 2012.1.11 splitter!
    init: function (opts) {
        this.container = $wrap;
        this.el = $("<div class='clearfix' style='clear:both; width:100%;height:2px;border-top:dashed 2px #666'></div>")
        this.container.append(this.el);
    }
})    //@asg 2012.1.11 splitter! end

var Adplace = dog.View.extend({
    events: {
        "click span.delete": "remove",
        "click span.up": "up",
        "click span.down": "down",
        "click span.config": "config"
    },
    init: function (adId, adContent) {
        //public argurments goes here
        this.data = { _attributes: {} };
        this.data._attributes.adId = adId;
        this.data._attributes.adContent = adContent;
        this.el = $('<div class="partBox adbox adtip" adId = "' + this.data._attributes.adId + '"><span class="adtext"></span><div class="adBox" id = "' + this.data._attributes.adId + '"></div></div>');
        if (this.data._attributes.adId) {
            this.defaultData.custom[0].value = this.data._attributes.adId;
            var href = window.location.search;
            href = href.substring(1);

            if (dog.cookie.getItem(href) == 'true') {

            } else if (this.data._attributes.adContent) {
                this.el.find(".adbox").append(this.data._attributes.adContent)
            } else {
                this.el.find("span").append("广告位：" + this.data._attributes.adId);
                this.el.css({
                    height: '70px', background: '#ccc', color: '#fff', fontSize: '16px', lineHeight: '70px', textAlign: 'center'
                });
            }

        } else {
            this.el.find("span").append("请修改属性添加广告位id（格式为t01）");
            this.el.css({
                height: '70px', background: '#ccc', color: '#fff', fontSize: '16px', lineHeight: '70px', textAlign: 'center'
            });
        }
        this.partTool = $('<div class="partTool"><p><span class="delete icon" title="删除">Delete</span><span class="config icon" title="属性">Config</span><span class="up icon" title="上移">Up</span><span class="down icon" title="下移">Down</span></p></div>');

        this.create();
        this.registerEvent(); //@asg remove getstylesheet; deplicated;
        this._super();
    },
    create: function () {
        //modified @asg 4.27; remove relative positioning to normal position; move toolbar into a relative wrapper
        this.el.prepend('<div class="toolWraper"></div>');
        this.el.find('.toolWraper').append(this.partTool);
        $wrap.append(this.el);
        this.setId();
        //this.getStyleSheet();
    },
    setId: function () {
        // this.el.attr('id', 'part_' + (++dog.ids));
    },
    remove: function () {
        var sure = window.confirm('是否删除此横切?');
        if (sure) {
            this.el.remove();
        }
    },
    down: function () {//@asg 1.11 no more jquery[after/before/append/html/replaceWith];
        var next = this.el.next()
        var adidVal = this.data._attributes.adId; // this.el.attr('adId');
        var ad = this.el.find('.adBox').html();
        if (next.length > 0) {
            //this.el.before(next);
            if (adidVal) {
                var colon = new dog.Adplace(adidVal, ad);
            } else {
                var colon = new dog.Adplace();
            }
            next.after(colon.el);
            this.el.remove();
        } else {
            //
            if (this.el.parent().attr('id') == 'topWrap') {
                if (adidVal) {
                    var colon = new dog.Adplace(adidVal, ad);
                } else {
                    var colon = new dog.Adplace();
                }
                var wrap = this.el.parent().parent().parent().find('#wrap');
                wrap.children().first().after(colon.el);
                this.el.remove();
            } else {
                alert('已经是在最下面了');
            }
        }
        return false;
    },
    up: function () {
        var next = this.el.prev();
        var adidVal = this.data._attributes.adId//this.el.attr('adId');
        var ad = this.el.find('.adBox').html();
        if (next.length > 0) {
            if (adidVal) {
                var colon = new dog.Adplace(adidVal, ad);
            } else {
                var colon = new dog.Adplace();
            }
            //this.el.after(next);
            next.before(colon.el);
            this.el.remove();
        } else {
            //开始插入到topWrap
            if (this.el.parent().attr('id') == 'wrap') {
                //如果是在大布局中
                if (adidVal) {
                    var colon = new dog.Adplace(adidVal, ad);
                } else {
                    var colon = new dog.Adplace();
                }
                var topWrap = this.el.parent().parent().find('#topWrap');
                topWrap.children().last().before(colon.el);
                this.el.remove();
            } else {
                //如果是在topwrap中
                alert('已经是在最上面了');
            }
        }
    },
    config: function () {
        var self = this;
        var Adid = self.data._attributes.adId//self.el.attr('adId');
        var editDefault = {
            custom: [{ mark: "adId", name: '广告位', value: ""}]
        }
        var edits = dog.pannel.customize(editDefault.custom, self.data._attributes);
        var editAttributePannel = new dog.pannel.EditAttributePannel(edits, editDefault, null, {
            "title": "编辑ID"
        });
        editAttributePannel.bind("update", function (event, data) {
            if (data.custom) {
                dog.pannel.uncustomize(data, self.data._attributes)
                var adid = self.data._attributes.adId;
                self.el.attr('adId', adid);
                var adText = '广告位：' + adid;
                self.el.find('.adtext').text(adText);
                self.el.css({ 'height': '70px', 'background': '#ccc', 'color': '#fff', 'font-size': '16px', 'line-height': '70px', 'text-align': 'center' })
                self.el.find('.adBox').attr('id', adid);
                self.el.find('.adBox').html('');
            }

        })
    },

    registerEvent: function (settings) {
        var that = this;
        //remove the layer
        //@wx 2012-04-18 fix the problem of the HengQie's height doesn't change immediately with blocks' change
        this.el.mousemove(function () {
            if (subject.workMode != 'full') { return };
            that.partTool.css({ "height": this.offsetHeight - 2 + 'px', "width": (this.offsetWidth + 20) + 'px' });
            that.partTool.find('p').css({ "left": this.offsetWidth })//@asg 6.29
            that.partTool.stop().fadeTo('normal', 1);
        })
        this.el.mouseout(function () {
            that.partTool.stop().fadeOut();
        })
    }
});
//init nav and parts
var splitter = function (data) {    //@asg 2012.1.11 splitter!
    new dog.Splitter(data);
}
var adplace = function (data) {
    new dog.Adplace(data);
}
var nav = function (data) {
    new dog.Nav(data);
}
var banner = function (data) {
    subject.banner = new dog.Banner(data);
}
var parts = function (data) {
    for (var j = 0; j < data.length; j++) {
        var item = data[j];
        if (item.splitter) {
            var splitter = new Splitter();
        } else if (typeof (item.tid) != 'undefined') {
            //alert(item.tid);
            var tid = item.tid
            var adplace = new Adplace(tid, '');
        } else {
            var part = new Part(item);
        }
    }
}
dog.nav = nav;
dog.banner = banner;
dog.parts = parts;
dog.Row = Row;
dog.Part = Part;
dog.Banner = Banner;
dog.Nav = Nav;
dog.Splitter = Splitter;    //@asg 2012.1.11 splitter!
dog.splitter = splitter;    //@asg 2012.1.11 splitter!

dog.Adplace = Adplace;    //@river ad 
dog.adplace = adplace;    //@river ad
})()
