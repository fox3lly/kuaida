dog.Content = dog.View.extend({
    events: {
        "click .content_data": "editData",
        "click .content_type": "changeType",
        "click .content_prop": "setProp",
        "mousedown .toobar_content": "move",
        "click .content_delete": "remove",
        "click div.content_cut": "cut",
        "click div.content_copy": "copy",
        "click div.content_paste": "paste"

    },
    init: function (data, type) {
        var self = this;
        this.isHTML = (data._attributes.type == "html"); //@asg 10.19
        this.el = $('<div class="content"></div>').attr('id', 'content' + (++dog.ids));
        this.create();
        if (type == "new") {       //new的情况data是content的template.json
            this.parseTemplate(data);
        } else {
            this.data = dog.deepCopy({}, data);
            this.temp = (_.select(subject.conttem.data, function (obj) { return (obj._attributes.id == self.data._attributes.cid || self.data._attributes.type == "html") }))[0];
            //@asg 6.30 for couldnt-find-content-template error
            if (!this.temp) {
                this.temp = {
                    "_attributes": {
                        "id": "-1",
                        "title": "模块已禁用",
                        "group": "none",
                        //"disNum": 4,
                        "autolist": "1",
                        "style": [],
                        "custom": []
                    },
                    "template": "<div>该项目不具有[" + this.data._attributes.title + "]组件的使用权，请联系总部运营。</div>"
                }
            }
        }
        this.fixData();
        this.render();
        this.registerEvent();
        this._super();
    },
    parseTemplate: function (data) {
        this.temp = data;
        this.data = {
            '_attributes': {
                'cid': this.temp._attributes.id,
                'style': [],
                'custom': subject.getDefaultCustom(this.temp._attributes.custom),
                'disNum': this.temp._attributes.disNum//,'data': this.temp._attributes.data
            },
            'data': false
        }

    },
    //    this._attributes:data,disNum
    fixData: function () {
        if (!this.temp._attributes.data) {        //如果老content没有存默认data字段,
            var _dataInTemplate = dog.getTemplateContext(this.temp.template)
            this.temp._attributes.data = _.filter(subject.dataDefault, function (obj) { return _.contains(_dataInTemplate, obj.name); });
        }
        this.data._attributes.disNum = this.temp._attributes.disNum;
        //        if (!this.data._attributes.disNum) {     //如果老数据没有存disNum
        //            this.data._attributes.disNum = this.temp._attributes.disNum || 6;   //@asg @hjl;
        //        }
        this.data.template = this.temp.template;   //php need this???
        if (this.temp._attributes.data.length) { //@asg 10.18 wether need data 
            this.data.data = subject.defaultData(this.temp._attributes.data, this.data.data || this.temp._attributes.disNum || 6);
        }
    },
    create: function () {
        //modified @asg 4.27; remove relative positioning to normal position; move toolbar into a relative wrapper
        this.el.html("<div class='toolWraper'><div class='toobar_content'><div class='content_data btn' title='数据'> </div><div class='btn content_type' title='类型'> </div><div class='btn content_prop' title='属性'> </div><div class='btn content_delete' title='删除'> </div><div class='content_cut btn' title='剪切'> </div><div class='content_copy btn' title='复制'> </div><div class='content_paste btn' title='粘贴'> </div></div></div><div class='contentholder'></div>");
        this.contentTool = this.el.find(".toobar_content");
        this.contentholder = this.el.find(".contentholder");
    },
    _renderDOM: function () {
        if (!this.isHTML) {

            // replace custom marks first [^mark]; templating after;  @asg 12.4.18 bug fix     
            var template = this.temp.template;
            if (this.data._attributes.custom && this.data._attributes.custom.length !== 0) {
                $.each(this.data._attributes.custom, function (i, item) {
                    if (item.mark) {
                        var tNAme, NRegExp;
                        tName = item.mark.match(/\[\^([a-zA-Z0-9_]*)\]/i);
                        if (tName) {
                            nRegExp = new RegExp("\\[\\^" + tName[1] + "\\]", "ig");
                            template = template.replace(nRegExp, item.value);
                        }
                    }
                });
            }
            template = template.replace(/\[\^repId\]/g, this.el[0].id);
            var html = template;
            //@asg 10.18 is data needed??
            var liarr;
            if (this.data.data) {
                liarr = this.data.data; //@asg @hjl 10.25 fix IE7 slice(0,undefined) bug;
                if (this.data._attributes.disNum) {
                    liarr = liarr.slice(0, this.data._attributes.disNum);
                }
            }
            html = _.template(template, { data: liarr });
            $(this.contentholder[0]).html(html);
        } else {
            $(this.contentholder[0]).html(this.data.html);
        }
    },
    _renderScript: function () {
        this.contentholder.find('script').each(function () {
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
    },
    render: function () {
        var self = this;
        if ($("#" + this.el[0].id).size() > 0) { // if this content is already appended to the DOM tree
            try {
                this._renderDOM();

                this._renderScript();

                if (!this.isHTML) {
                    this.getStyleSheet();
                } else {
                    this.el.find('.content_data').hide();
                    this.el.find('.content_type').hide();
                }
            } catch (exception) {
                this.contentholder.html("<div><b>" + this.data._attributes.title + "</b>组件发生错误： <i>" + exception.message
                    + "</i> 无法加载。</div>");
            }

            //2012.01.09 avoid anchors href redirecting!
            this.contentholder.find("a").each(function (idx, dom) {
                var href = dom.getAttribute("href");
                if (href) {     //@hjl 10.24
                    $(dom).click(function () {
                        return false;
                    });
                }
            });
            this.contentholder.bind('selectstart', function () {
                return false;
            });
        } else { //this content is not in the DOM tree
            setTimeout(function () { self.render() }, 50);
        }
    },
    registerEvent: function (settings) {
        var that = this;
        //remove the layer
        this.el.bind("mouseenter", function () {
            if (subject.workMode == 'data' || subject.status == "editCont") {
                //$(this).css("border-color","#0000FF");
                that.setupToobar(1);
            }
        }).bind("mouseleave", function () {
            that.contentTool.css({ "opacity": 0 });
        });
        if ($.browser.msie) {
            var _tb1 = that.contentTool.css("opacity", 1);
            _tb1.html("<div class=\"tool_cover\" style=\"z-index:109\"></div><div style=\"width:auto;top:0;right:0;float:right;position:absolute;z-index:110;filter: progid:DXImageTransform.Microsoft.Alpha(opacity=100); -ms-filter: 'progid:DXImageTransform.Microsoft.Alpha(opacity=100)'\">" + _tb1.html() + '</div>')
        }
        that.contentTool.show();
        that.setupToobar(0);
    },
    //@asg 9.10:setup toobar
    setupToobar: function (opacity) {
        var that = this;
        var _css = {
            "opacity": 0 + opacity,
            "display": 'block'
        }
        if ($("#" + this.el[0].id).size() > 0) {
            _css["height"] = this.el[0].offsetHeight - 2 + 'px';
            _css["width"] = this.el[0].offsetWidth - 2 + 'px';
        } else {
        }
        that.contentTool.show().css(_css);

    },
    styleChange: function (params) {
        var _data = this.data.data;
        this.parseTemplate(params);
        this.data.data = _data;
        this.fixData();
        this.render();
    },
    getData: function () {
        if (this.isHTML) {
            var dhtml = this.data.html
            return {
                "_attributes": {
                    "type": "html"
                },
                "html": dhtml
            }
        } else {
            return this.data;
        }

    },
    editData: function () {
        var self = this;
        var editpannel = new dog.pannel.EditDataPannel(self.data, self.temp._attributes.data, { 'title': "edit data" });
        editpannel.bind('update', function (e, data) {
            self.data.data = data;
            self.render();
        })
        return false;
    },
    changeType: function () {
        var self = this;
        var contentStyleSelectPannel = new dog.pannel.ContentStyleSelectPannel({ "title": "select content" });
        contentStyleSelectPannel.bind('update', function () {
            self.styleChange(arguments[1])
        })
        return false;

    },
    getHTML: function () {
        var clone = this.el.find('.contentholder').last().clone();
        return clone[0].innerHTML;
    },
    setProp: function () {
        var self = this;
        if (this.isHTML) {
            var raw = self.data.html//@asg 1.11 for Data;
            var tidy = style_html(raw, 4, ' ', 80);
            var rawHTMLPannel = new dog.pannel.RawHTMLPannel(tidy);
            rawHTMLPannel.bind("confirm", function (event, data) {
                self.data.html = data[0];
                self.render();
            })
        } else {
            this.temp._attributes.convertible = true;//@asg 2013.5.22 convert to html

            var editAttributePannel = new dog.pannel.EditAttributePannel(this.data._attributes, this.temp._attributes, null, {
                "title": "编辑属性"
            });
            editAttributePannel.bind("update", function (event, data) {
                self.data._attributes = data;
                self.getStyleSheet();
                self.render();
            })
            editAttributePannel.bind("convert", function (event, data) {
                var transform = window.confirm("转为HTML后将不能再以组件方式编辑，以后只能用HTML方式编辑,是否转换为html形式?");
                if (transform) {
                    self.isHTML = true;
                    var raw = self.getHTML();
                    var tidy = style_html(raw, 4, ' ', 80);
                    var rawHTMLPannel = new dog.pannel.RawHTMLPannel(tidy);
                    rawHTMLPannel.bind("confirm", function (event, data) {
                        self.data.html = data[0];
                        self.render();
                        self.el.find('.content_data').hide();
                        self.el.find('.content_type').hide();
                    })
                }
            })
        }
        return false;

    },
    remove: function () {
        if (confirm("是否删除此内容区?")) {
            this.el.remove();
        }
        return false;
    },
    move: function (e) {
        var sender = this.el;
        var start = {
            x: e.pageX,
            y: e.pageY,
            cx: sender.offset().left - e.pageX,
            cy: sender.offset().top - e.pageY,
            positions: {
                position: "relative",
                left: 0,
                top: 0
            }
        };
        e.preventDefault();
        sender.dnd(start);
        return false;
    }
});
