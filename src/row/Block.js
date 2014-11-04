
var Block = dog.View.extend({
    events: {
        "click .add": "addContent",
        "click .dele": "remove",
        "click .type": "selectStyle",
        "click .edit": "edit",
        "mousedown .toobar1": "move",
        "click .prop": "setProp",
        "click div.cut": "cut",
        "click div.copy": "copy",
        "click div.paste": "paste"
    },
    init: function (blockdata) {
        this.el = $('<div class="block">').attr('id', 'block' + (++dog.ids));
        //@asg 9.10
        var self = this;
        var _$append = this.el.appendTo;
        this.el.appendTo = function () {
            _$append.apply(this, arguments);
            //console.log("appendto")
            self.setupToobar();
        }
        this.data = blockdata;
        this.isHTML = false;
        /*如果这个block是新建的，则data里是没有bid的，为避免问题手动为他添加bid*/
        if (!this.data._attributes.bid) {
            this.data._attributes.bid = this.data._attributes.id;
        }
        if (!this.data._attributes.type) {
            this.data._attributes.type = "module";
        }
        this.findBlockStyle();
        this.ceateLayout();
        if (this.data._attributes.type != 'html') {
            this.getStyleSheet();
        } else {
            this.isHTML = true;
        }
        this._super();
    },
    findBlockStyle: function () {
        var self = this;
        this.blocktemp = _.select(subject.blocktem.data, function (obj) {
            return obj._attributes.id == self.data._attributes.bid
        })[0]; //block template of id
        this.data.cons = this.getData().cons;
    },
    create: function () {
        this.title = this.el.find('.w_title > .w_name');
        this.more = this.el.find('.w_title > .w_more');
        this.content = this.el.find(".contentPlaceHolder").parent();
        this.contentPlackHolder = this.content.find('div').remove(); //@asg 5.4 fix for empty block;
        if (this.data.cons) {
            try {
                this.setContents(this.data.cons); //@asg 5.16 error catch
            } catch (excption) { alert(excption) }
        }
        this.blockTool = this.el.find(".toobar");
        this.toobar1 = this.el.find(".toobar1");
        this.toobar2 = this.el.find(".toobar2");
        this.registerEvent();
    },
    ceateLayout: function () {
        if (!this.data._attributes.bmore && !this.data._attributes.btitle) {
            $.extend(this.data._attributes, {
                "btitle": "标题",
                "bmore": "<a href=\"#\">更多&gt;&gt;</a>"
            });
        }
        //modified @asg 4.27; remove relative positioning to normal position; move toolbar into a relative wrapper
        var toobarHTML = '<div class="toolWraper"><div class="toobar"><div class="toobar1 clearfix"><div class="btn edit" title="修改内容">修改内容</div><div class="btn dele" title="删除">删除</div><div class="btn type" title="类型">类型</div><div class="btn prop" title="属性">属性</div><div class="cut btn" title="剪切">cut</div><div class="copy btn" title="复制">copy</div><div class="paste btn" title="粘贴">paste</div></div><div class="toobar2 clearfix"><div class="btn add">添加</div><div class="btn quit">退出</div></div></div></div>'
        if (!this.blocktemp) {
            this.el[0].innerHTML = '<div class="blkBox"></div><div class="toolWraper"><div class="toobar"><div class="toobar1 clearfix"><div class="btn dele" title="删除">删除</div><div class="btn prop" title="属性">属性</div><div class="cut btn" title="剪切">cut</div><div class="copy btn" title="复制">copy</div><div class="paste btn" title="粘贴">paste</div></div><div class="toobar2 clearfix"><div class="btn add">添加</div><div class="btn quit">退出</div></div></div></div>';
            this.setBlockHTML(this.data.html);
            //asg 1.9
        } else {
            this.el.html('<div class="blkBox">' + this.blocktemp.html
            .replace(/\[\^w_title\]/, this.data._attributes.btitle)
            .replace(/\[\^w_more\]/, this.data._attributes.bmore)
            .replace(/\[\^w_content\]/, "<div class=\"contentPlaceHolder\" style=\"height: 200px;text-align:center\">请选择并添加组件</div>") + '</div>' + toobarHTML);
        }
        this.create();
    },
    setBlockHTML: function (code) {             //aaa bbb<script>alert(111)</script>
        var self = this;
        if ($("#" + self.el[0].id).size() > 0) {
            self.data.html = code;    //@asg 1.11 for Data;
            self.el.find('>div')[0].innerHTML = code;
            self.el.find('script').each(function () {
                if (this.src) {
                    var script = document.createElement('script'), i, attrName, attrValue, attrs = this.attributes;
                    for (i = 0; i < attrs.length; i++) {
                        attrName = attrs[i].name;
                        attrValue = attrs[i].value;
                        script[attrName] = attrValue;
                    }
                    document.body.appendChild(script);
                } else {
                    $.globalEval(this.text || this.textContent || this.innerHTML || '');
                }
            });
        }
        else {
            setTimeout(function () { self.setBlockHTML(code) }, 50);
        }
    },
    registerEvent: function (settings) {
        //modified @asg 4.27; change display_none to opacity_0; 
        var that = this;
        this.el.bind("mouseenter", function () {
            that.setupToobar({ "opacity": 1 });
        }).bind("mouseleave", function () {
            that.blockTool.css({ "opacity": 0.1 });
        });
        that.setupToobar({ "opacity": 0, "display": 'block' });
        if ($.browser.msie) {
            var _tb1 = this.blockTool.find(".toobar1").css("opacity", 1);
            _tb1.html('<div class="tool_cover" style="position:absolute;z-index:119"></div><div style="float:right;position:absolute;z-index:120;filter: progid:DXImageTransform.Microsoft.Alpha(opacity=100); -ms-filter: "progid:DXImageTransform.Microsoft.Alpha(opacity=100)">' + _tb1.html() + '</div>')
        }
    },
    //added @asg 4.27; setup toobar size!
    setupToobar: function (css) {
        var self = this;
        var _style = {};
        self.contentPlackHolder.remove();
        if (0 === self.content.children().size()) {
            self.contentPlackHolder.appendTo(self.content);
        }
        if (subject.workMode == 'data') {
            _style = { "display": "none" }
        }
        else if (subject.status == "editCont") {
            var _top = self.blockTool.parent().position().top - self.el.position().top; //@asg 9.10: 
            _style = {
                "height": "auto"
                , "width": ((self.el[0].offsetWidth ? self.el.outerWidth(!$.browser.msie) : 800) - 2) + 'px'

                , "top": "-30px"//@asg 11.13
                , "bottom": "auto"
                , "display": "block"
            }
        } else {
            var _height = self.blockTool.parent().position().top - self.el.position().top; //@asg 9.10: block's toolWraper lies at the very bottom.
            //console.log(self.blockTool.parent().position().top +"////"+ self.el.position().top )
            _style = {
                "height": ((self.el[0].offsetHeight ? _height : 1000) - 2) + 'px'
                , "width": ((self.el[0].offsetWidth ? self.el.outerWidth(!$.browser.msie) : 800) - 2) + 'px'
                , "bottom": 0
                , "top": "auto"
                , "display": "block"
            }
        }
        self.blockTool.css($.extend(_style, css));
    },
    addContent: function () {
        var self = this;
        var contentStyleSelectPannel = new dog.pannel.ContentStyleSelectPannel({ "title": "选择组件" });
        contentStyleSelectPannel.bind('update', function () {
            var data = dog.deepCopy({}, arguments[1]);
            c = new dog.Content(data, "new");
            c.el.appendTo(self.content);
            c.setupToobar();
            self.setupToobar();    //added @asg 4.27; setup toobar size!
        })
        return false;
    },
    setContents: function (data) {
        var self = this;
        var refresh = _.throttle(self.setupToobar, 20); //@asg 9.11;
        $.each(data, function (i, d) {
            var _con = $("<div></div>"); // place holder
            _con.appendTo(self.content);
            setTimeout(function () {
                var c = new dog.Content(d);
                _con.replaceWith(c.el);
                c.setupToobar();
                refresh.call(self); //@asg 9.10;
            }, 0)
        })
    },
    getHTML: function () {
        var clone = this.el.find('>div').eq(0).clone();
        clone.find('.content .toolWraper').remove();
        return clone[0].innerHTML;
    },
    setProp: function () {
        var self = this;
        if (this.isHTML) {
            var raw = self.data.html  //@asg 1.11 for Data;
            var tidy = style_html(raw, 4, ' ', 80);
            var rawHTMLPannel = new dog.pannel.RawHTMLPannel(tidy);
            rawHTMLPannel.bind("confirm", function (event, data) {
                self.setBlockHTML(data[0]);
                //asg 1.9
            })
        } else {
            var editDefault = {
                custom: [
                    { mark: "btitle", name: '标题设置', value: this.blocktemp._attributes.btitle },
                    { mark: "bmore", name: '更多链接', value: this.blocktemp._attributes.bmore }
                ],
                style: this.blocktemp._attributes.style,
                convertible: true
            }
            var edits = dog.pannel.customize(editDefault.custom, this.data._attributes);

            var editAttributePannel = new dog.pannel.EditAttributePannel(edits, editDefault, null, {
                "title": "编辑属性"
            });
            editAttributePannel.bind("update", function (event, data) {
                dog.pannel.uncustomize(data, self.data._attributes)
                self.setTitle();
                self.setMore();
                self.getStyleSheet();
            })
            editAttributePannel.bind("convert", function (event, data) {
                var transform = window.confirm("转为HTML后将不能再以组件方式编辑，以后只能用HTML方式编辑,是否转换为html形式?");
                if (transform) {
                    self.isHTML = true;
                    var raw = self.getHTML();
                    var tidy = style_html(raw, 4, ' ', 80);
                    var rawHTMLPannel = new dog.pannel.RawHTMLPannel(tidy);
                    rawHTMLPannel.bind("confirm", function (event, data) {
                        self.setBlockHTML(data[0]);
                    })
                    self.el.find('.type').hide();
                    self.el.find('.edit').hide();
                    self.blockTool = self.el.find(".toobar"); //@asg 7.3
                }
            })
        }
    },
    setTitle: function () {
        var title = this.data._attributes.btitle;
        this.title.text(title);
    },
    setMore: function () {
        var more = this.data._attributes.bmore;
        this.more.html(more);
    },
    getData: function () {
        var self = this;
        if (this.isHTML) {
            var dhtml = this.data.html;
            return {
                "_attributes": {
                    "type": "html"
                },
                "html": dhtml
            }
        } else {
            var contents;
            if (self.content) {
                contents = [];
                self.content.children(".content").each(function (idx, dom) {
                    contents.push($(dom).getObject('Content').getData());
                })
            }
            return $.extend({}, self.data, {
                "cons": contents,
                title: self.el.find(".spTitle").text(),
                url: self.el.find(".spMore a").attr("href"),
                "class": self.el.get(0).className.replace("block")
            });
        }
    },
    selectStyle: function () {
        var self = this;
        var blockStyleSelectPannel = new dog.pannel.BlockStyleSelectPannel();
        blockStyleSelectPannel.bind('update', function () {
            self.data._attributes.bid = arguments[1]._attributes.id;
            self.findBlockStyle();
            self.ceateLayout();
            if (self.data._attributes.type != 'html') {
                self.getStyleSheet();
            }
        })
    },
    remove: function () {
        if (confirm("是否删除此区块?"))
            this.el.remove();
    },
    edit: function () {
        var self = this;
        var sender = this.el;
        var t1 = this.toobar1.hide();
        var t2 = this.toobar2.show();
        sender.addClass("editing");
        this.blockTool.css({ "height": "auto" });
        subject.status = "editCont";
        self.setupToobar();    //added @asg 4.28; setup toobar size!

        sender.layerShow(function (evt) {
            sender.show().removeClass('editing').css("z-index", 100);
            subject.status = "ok";
            t2.hide();
            t1.show();
            self.setupToobar();    //added @asg 4.27; setup toobar size!
        }, ".quit", "click");
    },
    move: function (e) {
        var self = this;
        var sender = this.el;
        var start = {
            x: e.pageX,
            y: e.pageY,
            cx: sender.offset().left - e.pageX,
            cy: sender.offset().top - e.pageY
        };
        return sender.dnd(start, ".row", function () {
            self.setupToobar()// @asg 4.28; fix: callback after drop, resize the box;
        });

    }
});
dog.Block = Block;
