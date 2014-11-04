/**
 * @author nttdocomo
 * last modify: @asg 6.27
 * 
 */
(function () {
    var $body = $('body'), $window = $(window);
    var blacklist = ['row', 'title', 'id', 'bid', 'cid', 'type', 'group', 'autolist', 'styleId', 'rowClass']; //@asg 7.3 added "rowClass"
    var box = {};
    box.styleEditBox = dog.View.extend({
        init: function (data, defaultData) {
            var styleEditeTemplate = '<h3>---------样式设置(CSS数值需要带上单位px、em、%等)：</h3><div id="cssAttribList" class="pannel-body"><% _.each(styles,function(item){ %><div class="x-field x-form-item clearfix"><%=item%></div><% }); %></div>';
            this.template = styleEditeTemplate;
            this.name = "style";
            this.data = data;
            this.defaultData = defaultData;
        },
        html: function () {
            var stylesHtml = [];
            var self = this;
            var str = [], temList = [];
            $.each(this.defaultData, function (i, item) {
                temList.push($.extend({}, item));
                if (self.data) {
                    $.each(self.data, function (j, savedValue) {
                        if (savedValue.selector == item.selector && savedValue.property == item.property) {
                            temList[i].currentValue = savedValue.value;
                        };
                    });
                }
                if (!temList[i].currentValue) { temList[i].currentValue = temList[i].value; }
            })
            if (temList) {
                $.each(temList, function (i, n) {
                    if (n.name) {
                        if (!$.isArray(n.value)) {
                            //@wx 2012-4-18 fix the problem of "Pop-up layer shows in wrong style" in IE8

                            n.className = n.property     //@asg 11.09
                                .replace(/.*color.*/m, "iColorPicker")
                                .replace(/.*image.*/m, "iImagePicker");
                            var template = '<label class="x-form-item-label"><%=item.name%></label><div class="x-form-item-body"><input id="styleinput_' + i + '" class="x-form-field x-form-text we1_txt <%=item.className%>" type="text" name="<%=item.name%>" value="<%=item.currentValue%>" onblur="dog.checkStyleValue(this,\'<%=item.property%>\');return false;"/><span id="warning_' + i + '" style="color:red;"></span></div>'
                            stylesHtml.push(_.template(template, { "item": n }));
                        } else {
                            var str = [];
                            str.push('<label class="x-form-item-label">' + n.name + '</label><div class="x-form-item-body"><select name="' + n.name + '">');
                            $.each(n.value, function (j, m) {
                                var optlist = m.split(":");
                                str.push('<option value="' + optlist[1] + '"' + (optlist[1] == n.currentValue ? ' selected="selected"' : "") + '>' + optlist[0] + "(" + optlist[1] + ")" + '</option>');
                            });
                            str.push('</select></div>');
                            stylesHtml.push(str.join(''));
                        };
                    }
                });
            }
            return _.template(this.template, { "styles": stylesHtml });
        },
        getData: function (el) {
            var inputs = el.find('#cssAttribList input');
            var selects = el.find('#cssAttribList select');
            var temp = [];
            for (var i = 0; i < inputs.length; i++) {
                var tempdata = {};
                if (isNaN(inputs[i].value))//@asg 7.21 parseInt, umpty string is not NaN or number 
                    tempdata.value = inputs[i].value.replace(/^(http:\/\/[^\s]+)/, "url($1)")
                else if (inputs[i].value.replace(/\s/g) != "") {
                    tempdata.value = inputs[i].value + "px";
                } else {
                    tempdata.value = ""; //@asg7.31
                }
                tempdata.name = inputs[i].name;
                temp.push(tempdata);
            }
            for (var i = 0; i < selects.length; i++) {
                var tempdata = {};
                tempdata.value = selects[i].value;
                tempdata.name = selects[i].name;
                temp.push(tempdata);
            }
            return subject.saveCSS(temp, this.defaultData);
        }
    });
    box.customEditBox = dog.View.extend({
        init: function (data, defaultData) {
            var customEditeTemplate = '<h3>---------自定义属性：</h3><div id="customAttribList" class="pannel-body"><% _.each(customs,function(item,name){ %><div class="x-field x-form-item clearfix"><div class="clearfix"><label class="x-form-item-label"><%=name%></label></div><% _.each(item,function(html){ %><%=html%><% });%></div><%}); %></div>';
            this.template = customEditeTemplate;
            this.name = "custom";
            this.data = data;
            this.defaultData = defaultData;
        },
        html: function () {
            var self = this;
            var str = [], temList = [];
            var defaultData = subject.getDefaultCustom(this.defaultData)
            , templateData = this.defaultData;
            //self.data = $.extend(defaultData, self.data);
            $.each(templateData, function (i, item) {
                temList.push($.extend({}, item));
                if (self.data) {
                    var savedOrDefaultDataItem =
                    _.find(self.data, function (savedValue) {
                        return savedValue.name == item.name && savedValue.mark == item.mark;
                    })
                    ||
                    _.find(defaultData, function (savedValue) {
                        return savedValue.name == item.name && savedValue.mark == item.mark;
                    });
                    temList[i].currentValue = savedOrDefaultDataItem.value;

                }
            })
            if (temList) {
                var itemTemplate = {};
                $.each(temList, function (i, column) {
                    if (column.name) {
                        itemTemplate[column.name] = itemTemplate[column.name] || []; //@asg 5.9; for group by customs' name
                        if (typeof (column.value) == "string") {
                            var template;
                            if (column.mark.match(/http./)) {//link display
                                template = '<div class="x-form-item-body"><a id="customspan_' + i + '" class="x-form-field-link" href="<%=item.mark%>" ><%=item.currentValue%></a></div>'
                            } else if (column.mark.match(/\S/)) { //input
                                template = '<div class="x-form-item-body"><input id="custominput_' + i + '" class="we1_txt x-form-field x-form-text" type="text" name="<%=item.mark%>" value="<%-item.currentValue%>" /></div>'
                            } else {//text display
                                template = '<div class="x-form-item-body"><span id="customspan_' + i + '" class="x-form-field-label"><%=item.value%></span></div>'
                            }
                            itemTemplate[column.name].push(_.template(template, { "item": column })); //@asg 5.9; for group by customs' name
                        } else if ($.isArray(column.value)) {
                            var str = ['<div class="x-form-item-body">'];
                            if (column.value[0].split(":").length == 2) {
                                str.push('<select name="' + column.mark + '">');
                                $.each(column.value, function (j, m) {
                                    var optlist = m.split(":");
                                    str.push('<option value="' + optlist[1] + '"' + (optlist[1] == column.currentValue ? ' selected="selected"' : "") + '>' + optlist[0] + "(" + optlist[1] + ")" + '</option>');
                                });
                                str.push('</select>');
                            } else {
                                var _currentvalues = column.currentValue.split(',');
                                $.each(column.value, function (j, m) {
                                    var optlist = _.map(m.replace('http:', 'http：').split(":"), function (s) { return s.replace('http：', 'http:') });
                                    var checked = false
                                     , readonly = false
                                     , nRegExp = new RegExp("," + optlist[1] + ",", "ig"); // @asg 4.28; fix: match the value when it is not a word
                                    ;
                                    if (optlist[2] == 'readonly') {
                                        checked = true;
                                        readonly = true;
                                    } else if (column.currentValue != null) {
                                        checked = (',' + column.currentValue + ',').match(nRegExp); // @asg 4.28; fix: match the value when it is not a word
                                    } else if (optlist[2] == 'true') {
                                        checked = true;
                                    }
                                    str.push('<div class="x-form-item-checkboxWrapper"><input id="customcheckbox' + i + '_' + j
                                    + '" name="' + column.mark + '" type="checkbox" value="' + optlist[1] + '"'
                                    + ((checked) ? ' checked="checked"' : "")
                                    + ((readonly) ? ' disabled="disabled"' : "") + '></input><label for="customcheckbox' + i + '_' + j + '">' + optlist[0] + '</label></div>');
                                });
                            }
                            str.push('</div>');
                            itemTemplate[column.name].push(str.join('')); //@asg 5.9; for group by customs' name
                        };
                    }
                });
            }
            return _.template(this.template, { "customs": itemTemplate });
        },
        getData: function (el) {
            var inputs = el.find('#customAttribList :text');
            var selects = el.find('#customAttribList select');
            var checkedboxes = el.find('#customAttribList :checkbox');
            var temp = [];
            for (var i = 0; i < inputs.length; i++) {
                var tempdata = {};
                tempdata.value = inputs[i].value;
                tempdata.mark = inputs[i].name;
                temp.push(tempdata);
            }
            for (var i = 0; i < selects.length; i++) {
                var tempdata = {};
                tempdata.value = selects[i].value;
                tempdata.mark = selects[i].name;
                temp.push(tempdata);
            }
            var checkeddata = {};
            for (var i = 0; i < checkedboxes.length; i++) {
                checkeddata[checkedboxes[i].name] = checkeddata[checkedboxes[i].name] || [];
                if (checkedboxes[i].checked)
                    checkeddata[checkedboxes[i].name].push(checkedboxes[i].value);
            }
            for (var name in checkeddata) {
                var tempdata = {};
                tempdata.value = checkeddata[name].join(',');
                tempdata.mark = name;
                temp.push(tempdata);
            }
            return subject.saveCustom(temp, this.defaultData);

        }
    });

    var pannel = {};
    pannel.Pannel = dog.View.extend({
        init: function (data, template, context) {
            this.context = context;
            //@wx 2012.4.18 fix BUG ID 446
            //@asg 2012.9.10
            this.id = "EditData" + $.now();
            this.data = data;
            this.editTemplate = template || this.editTemplate;
            var self = this;
            this.dialog = art.dialog({
                title: context.title,
                width: context.width ? parseInt(context.width) + 50 : 640,
                lock: true,
                padding: 0,
                //button: btn,
                ok: function () {
                    self.confirm();
                },
                cancel: function () {
                    self.close()
                    return false;
                }
            })
            this.el = $(this.dialog.DOM.inner[0]);
            this.createPannel();
            this.createLayout();

            this.editDataList = this.el.find('#dataList');

            this.adjust();

            this._super();
        },
        modifyTitle: function (fn) {
            fn.call(this, $(this.dialog.DOM.title[0]))
        },
        modifyButtons: function (fn) {
            fn.call(this, $(this.dialog.DOM.buttons[0]).find("button"))
        },
        addButton: function (options) {
            if (this[options.callback]) {
                var self = this, fnName = options.callback;
                options.callback = function () {
                    self[fnName]();
                    return false;
                }
                this.dialog.button(options)
            }
        },
        adjust: function () {
            this.dialog._reset();
        },
        createLayout: function () {
            var _contextHTML = $('<div id="dataList">' + this.context.data + '</div>');
            this.dialog.content(_contextHTML.splice(0, 1)[0]); //@asg 6.24 not works for scripts
            dog.execContentScript(_contextHTML);

        },
        createPannel: function () {

        },
        close: function () {
            this.dialog.close();
        },
        refresh: function () {
            this.editDataList.html(_.template(this.editTemplate, {
                "data": this.data
            }));
        }

    }).extend(dog.EventProvider);
    //updated
    pannel.uncustomize = function (dataEdited, attributes) {
        var custom = dataEdited.custom;
        for (var i in custom) {
            attributes[custom[i].mark] = custom[i].value;
        }
        if (dataEdited.style) {
            attributes.style = dataEdited.style;
        }
    }

    /*
    * set up for EditAttributePannel; returns data;
    */
    pannel.customize = function (customTemplate, attribute) {
        var ret = { custom: [] };
        for (var i in customTemplate) {
            if (attribute[customTemplate[i].mark]) {
                ret.custom.push({
                    name: customTemplate[i].name,
                    value: attribute[customTemplate[i].mark],
                    mark: customTemplate[i].mark
                })
            }
        }
        if (attribute.style) {
            ret.style = attribute.style;
        }
        return ret;
    }
    pannel.EditAttributePannel = pannel.Pannel.extend({
        events: {
            "click .upload": "upload"
        },
        init: function (data, defaultData, template, context) {
            context.width = "640px";
            this.editTemplate = ""//styleEditTemplate;
            this.defaultData = defaultData;
            this.boxs = [];
            this._super(data, this.editTemplate, context);
            if (defaultData.convertible) {//bid || data.cid || data.type == "html"//remove '|| data.id ' @asg7.12
                this.addButton({ name: '转化为HTML', callback: "convert" });
            } else {
            }
            this.addButton({ name: '还原默认', callback: "reset" });
            dog.iColorPicker(this.editDataList);
            dog.iImagePicker(this.editDataList);

            //@asg 2012.4.18 for auto image;@asg 7.2 for colorpicker ignore
            this.editDataList.delegate(':text:not(.iColorPicker)', 'change', function (e) {
                var $this = $(this)
                $this.parent().find('img').remove();
                $this.removeClass("we2_txt").addClass("we1_txt")//@asg 6.18; for css style
                if (this.value.match(/^http:.+/i)) {
                    $('<img src="' + this.value + '" onerror="$(this).remove()"></img>').appendTo($this.parent())
                    $this.removeClass("we1_txt").addClass("we2_txt")
                } else if (this.value.match(/url\([^)]+\)/i)) {
                    $('<img src="' + this.value.match(/url\([^)]+\)/i)[1] + '" onerror="$(this).remove()"></img>').appendTo($this.parent())
                    $this.removeClass("we1_txt").addClass("we2_txt")
                }
            }).find('input').each(function (i, input) {
                if (this.value.match(/^http:.+/i)) {
                    $('<img src="' + this.value + '" onerror="$(this).remove()"></img>').appendTo($(this).parent())
                }
            })
        },
        reset: function () {
            _.extend(this.data, _.omit(this.defaultData, blacklist)); //@asg 10.26-10.30
            if (this.defaultData.custom) {
                this.data.custom = subject.getDefaultCustom(this.defaultData.custom); //@asg 10.24
            }
            if (this.data.style) { this.data.style = []; } //@asg 10.24 reset styles too;
            this.createPannel();
            this.el.find("#dataList").html(this.context.data);
            this.adjust();
        },
        createPannel: function () {
            var html = "";
            for (var name in this.defaultData) {
                //@asg 5.07.2013
                if (box[name + "EditBox"] && this.defaultData[name].length) {//@asg 2012.4.18 /7.11 some attributes don't need to be edited.                           
                    //@asg 2013.05.07 no blacklist no whitelist no nothing nor textEditBox; everything that edited goes with customEdit
                    var editBox = new box[name + "EditBox"](this.data[name], this.defaultData[name]); //goto styleEditBox
                    this.boxs.push(editBox);
                    html += editBox.html();
                }
            }
            if (html == '') {//@asg 7.5
                html = "<div style='text-align:center'>无可编辑属性</div>";
            }
            this.context.data = "<div id=\"AW_Cont\">" + html + "</div>";
        },
        confirm: function () {
            var bannertype = this.editDataList.find("#banner_type").val(),
        		src = this.editDataList.find("#inputfield_src").val(),
        		width = this.editDataList.find("#inputfield_width").val(),
        		height = this.editDataList.find("#inputfield_height").val();
            if (bannertype == 'flash' && src == '') {
                alert('请填写flash地址！');
                this.editDataList.find("#inputfield_src").focus();
                return;
            };
            if (bannertype == 'flash' && !dog.isNum(width)) {
                alert('请填写flash宽度！');
                this.editDataList.find("#inputfield_width").focus();
                return;
            };
            if (bannertype == 'flash' && !dog.isNum(height)) {
                alert('请填写flash高度！');
                this.editDataList.find("#inputfield_height").focus();
                return;
            };
            if (!subject.styleCheck) { return; }
            var self = this;
            var data = $.extend({}, this.data); /*解决不知到在哪self.data变成了defaultData的引用*/
            $.each(this.boxs, function (i, item) {
                data[item.name] = item.getData(self.editDataList);
            });
            this.trigger("update", [data]);
            this.close();
        },
        upload: function () {
            var self = this;
            var uploadAttributePannel = new dog.pannel.UploadPicPannel();
            uploadAttributePannel.bind("confirm", function (event, data) {
                self.el.find('#inputfield_src').val(data);
            });
        },
        convert: function () {
            this.trigger("convert", []);
            this.close();
        }
    });
    pannel.BlockStyleSelectPannel = pannel.Pannel.extend({
        events: {
            "click #dataList": "update"
        },
        init: function (context) {
            var data = [].concat(subject.blocktem.data);
            context = { 'title': "选择板块样式", 'width': '430px' };
            this.editTemplate = '<% _.each(data,function(item,i){ %><p class="p_tit"><%=item._attributes.title%></p><div class=\"add\"><%=item.html%></div><% }); %>'; //@asg 6.26
            this._super(data, this.editTemplate, context);
            this.blockList = this.editDataList.find('#NewBlockList > div.add');
            this.modifyButtons(function ($buttons) {         //@asg 4.28 remove button
                $buttons.hide();
            })
        },
        createPannel: function () {
            var defaultData = [];
            $.each(this.data, function (i, item) {
                var obj = $.extend({}, item)
                obj.html = obj.html.replace(/\[\^w_title\]/, "标题").replace(/\[\^w_more\]/, "<a href=\"#\">更多</a>").replace(/\[\^w_content\]/, "<div style=\"height: 200px;\"></div>");
                defaultData.push(obj)
            })
            this.context.data = '<div id="NewBlockList">' + _.template(this.editTemplate, {
                "data": defaultData
            }) + '</div>';
        },
        update: function (e) {
            var el = $(e.target).parents("div.add");
            var index = this.blockList.index(el);
            this.trigger("update", [subject.blocktem.data[index]]);
            this.close();
        }
    });
    pannel.SystemStyleSelectPannel = pannel.Pannel.extend({
        events: {
            "click #dataList": "update",
            "change #styleColor": "styleColorChange",
            "change #styleChannel": "styleChannelChange"
        },
        init: function (context) {
            this.selectChannel = "";
            this.selectColor = "";
            this.colorSelect = $("<select id=\"styleColor\"><option value=''>全部</option></select>"); //@asg 7.21
            this.channelSelect = $("<select id=\"styleChannel\"><option value=''>全部</option></select>");
            this.channels = [];
            this.originalStyle = subject._attributes.styleId;
            this.colors = [];
            var data = [].concat(subject.styletem.data);
            var context = { 'title': "更换风格", 'width': '900px' };
            this.editTemplate = '<% _.each(data,function(item,i){ %><div class=\"styleadd <% if(item.id==subject._attributes.styleId){print("stylecur")}%>\" id=\"styleid_<%=item.id%>\"><img src=\"<%=item.imgsrc%>\"><p>风格分类:<%=item.channel%></p><p>颜色:<%=item.color%></p></div><% }); %>';
            this._super(data, this.editTemplate, context);

            this.selectContainer = $("<span class=\"w_select\"></span>");
            this.createSelect();
            this.styleList = this.editDataList.find('#NewStyleList > div.styleadd');

        },
        createSelect: function () {
            var self = this;
            $.each(this.data, function (i, n) {
                if (n.channel) {
                    tmpChannel = n.channel.split(",");
                    $.each(tmpChannel, function (j, m) {
                        if ($.inArray(m, self.channels) == -1) {
                            self.channels.push(m);
                            self.channelSelect.append("<option value='" + m + "'>" + m + "</option>");
                        }
                    });
                };
                if (n.color) {
                    tmpColor = n.color.split(",");
                    $.each(tmpColor, function (j, m) {
                        if ($.inArray(m, self.colors) == -1) {//@asg 6.27
                            self.colors.push(m);
                            self.colorSelect.append("<option value='" + m + "'>" + m + "</option>");
                        }
                    });
                }
            });
            this.selectContainer.append(this.channelSelect);
            this.selectContainer.append(this.colorSelect);
            this.modifyTitle(function ($title) {
                $title.append(this.selectContainer);
            })
        },
        render: function () {
            this.editDataList.empty();
            this.editDataList.html(this.context.data);

            if (this.editDataList.find('#NewStyleList').html() == '') {
                this.editDataList.html('<div id="NewStyleList">没有相关样式列表。。</div>');
            };
        },
        styleColorChange: function (e) {
            var select = $(e.target).val();
            this.selectColor = select;
            this.createPannel();
            this.render();
        },
        styleChannelChange: function (e) {
            var select = $(e.target).val();
            this.selectChannel = select;
            this.createPannel();
            this.render();
        },
        createPannel: function () {
            var defaultData = [], self = this;
            $.each(this.data, function (i, item) {
                if (item.channel.indexOf(self.selectChannel) != -1
                		&& item.color.indexOf(self.selectColor) != -1) {
                    var obj = $.extend({}, item)
                    //obj.html = obj.html.replace(/\[\^w_title\]/,"标题").replace(/\[\^w_more\]/,"<a href=\"#\">更多</a>").replace(/\[\^w_content\]/,"<div style=\"height: 200px;\"></div>");
                    defaultData.push(obj);
                }
            })
            this.context.data = '<div id="NewStyleList">' + _.template(this.editTemplate, {
                "data": defaultData
            }) + '</div>';
        },
        update: function (e) {
            this.el.find(".styleadd").removeClass('stylecur');
            var el = $(e.target).parents("div.styleadd"); /*获取点击元素复原素class为styleadd的元素*/
            el.addClass('stylecur');
            if (!el.attr("id") || el.attr("id").indexOf("styleid") == -1) {
                return;
            }
            var index = el.attr("id").split("_")[1];
            this.currentIndex = index; //@asg 7.5;
            this.trigger("update", index);
            /*不关闭pannel*/
        },
        confirm: function (e) {
            this.confirmedStyle = this.currentIndex;
            this.close()
        },
        close: function () {
            if (this.confirmedStyle) {
                this.trigger("update", this.confirmedStyle);
                this._super()
            } else {
                if (confirm("尚未保存，是否确认退出？")) {
                    this.trigger("update", this.originalStyle);
                    this._super()
                }
            }

        }
    });
    pannel.UploadPicPannel = pannel.Pannel.extend({
        init: function () {
            var data = {};
            var editTemplate = {};
            this.picobj;
            var template = '<div id="swfupload">\
            请选择上传文件(jpg,png,swf)：<input type="button" id="button"/><ol id="log"></ol></div>';
            var context = { 'title': '上传图片', 'data': template };
            this._super(data, editTemplate, context);
            this.modifyButtons(function ($buttons) {         //@asg 4.28 remove button           //this.el.find('.confirm').hide();
                $buttons.hide();
            })

            var self = this;
            this.el.find("#swfupload").swfupload({
                upload_url: subject.upload_url,
                post_params: { "pkey": subject.upload_key, "mkey": subject.upload_m_key },
                file_size_limit: "10240",
                file_types_description: "Image",
                file_types: "*.jpg;*.png;*.swf",
                flash_url: subject.prefix + "lib/swfupload/swfupload.swf", //@asg 10.24
                button_image_url: subject.prefix + 'lib/swfupload/XPButtonUploadText_61x22.png',
                button_width: 61,
                button_height: 22,
                button_placeholder: $('#button')[0]
            })
			.bind('fileQueued', function (event, file) {
			    $(this).swfupload('startUpload');
			})
			.bind('uploadStart', function (event, file) {
			    $('#log').append('<li>正在上传中 - ' + file.name + '</li>');
			    $('#log').append('<li><img src="lib/swfupload/ajax-loader.gif" alt="uploading"/></li>');
			})
			.bind('uploadSuccess', function (event, file, serverData) {
			    self.picobj = jQuery.parseJSON(serverData);
			    $('#log').empty();
			    var _data = {
			        c_id: subject.cid
                    , p_id: subject.pid
                    , t_id: subject.tid
                    , d_id: subject.did
                    , file: [self.picobj.msg]
			    };
			    var url = document.domain;
			    $.ajax({
			        url: "http://" + url + subject.api.addfile
                    , type: "POST"
                    , data: { "fileinfo": JSON.stringify(_data)}//
                    , success: function (data) {
                        self.picobj = jQuery.parseJSON(serverData);
                        $('#log').empty();
                        $('#log').append('<li>上传成功 - ' + file.name + '</li>');
                        self.modifyButtons(function ($buttons) {         //@asg 4.28 remove button
                            $buttons.eq(0).show();
                        })
                    }
			    })
			});
        },
        confirm: function () {
            var furl = this.picobj.msg.furl; //@asg 10.24; upload api altered it's return value'msg'
            this.trigger('confirm', [[furl]]);
            this.close();
        }
    })
    pannel.RawHTMLPannel = pannel.Pannel.extend({
        init: function (html) {
            var data = {};
            var editTemplate = {};
            this.html = html;
            var template = 'Edit your HTML:<br/><textarea style="width:700px;height:400px" id="html"></textarea>';
            var context = { 'title': '编辑栏目块HTML', 'data': template };
            this._super(data, editTemplate, context);
            this.el.find('#html').val(this.html);
        },
        confirm: function () {
            var code = this.el.find('#html').val();
            if (dog.checkHTMLTag(code)) {
                this.trigger('confirm', [[code]]);
                this.close();
            }
        }

    })
    pannel.InsertPartPannel = pannel.Pannel.extend({
        init: function () {
            var data = {};
            var editTemplate = {};
            //var template = 'æ’å…¥æ¨ªåˆ‡:';
            var template = '';
            $.each(subject.parttem.data, function (idx, _part) {
                //template += '<div>' + _part._attributes.title + ':<input type="radio" name="ids" value="' + _part._attributes.id + '" ' + (idx ? '' : 'checked') + '/></div>';
                //add by guanjia 2014.4.23
                if(idx < 4){
                template += '<span class="crhq">' + _part._attributes.title + ':<input type="radio" name="ids" value="' + _part._attributes.id + '" ' + (idx ? '' : 'checked') + '/></span>'; 
                //libin css 2013.01.31
                }else{
                    return false;
                }
                //subject.parttem.data include a host of data to match,only display the first four data
            })
            //add by guanjia 2014.24
            //自定义列数设置
            template +='<span class="crhq">\u81ea\u5b9a\u4e49\u5217\u6570\u8bbe\u7f6e:<input type="radio" name="ids" value="" class="mr20"/><input type="text" class="row_configure" name="row_configure"></span>'
            //insert partPannel add new mode,you can input a number to set rows 
            var context = { 'title': '插入横切', 'data': template };
            this._super(data, editTemplate, context);
        },
        confirm: function () {
            if(this.el.find('input[name="ids"]:checked')){
                //add by guanjia 2014.4.23
                //add checkbox conditional
                if(this.el.find('input[name="ids"]').eq(4).attr("checked") == true){
                    if(this.el.find('input[name="row_configure"]').val() != '' || this.el.find('input[name="row_configure"]').val() < '12'){
                        var ids = parseInt(this.el.find('input[name="row_configure"]').val()) + 1;
                    }else{
                        alert("\u8bf7\u8f93\u5165\u5c0f\u4e8e12\u7684\u671f\u671b\u5217\u6570");//请输入小于12的期望列数
                    }
                }else{
                 var ids = this.el.find('input[name="ids"]:checked').val(); //@asg 2012.4.20 : formating
                }
                //add by guanjia 2014.4.23
            }
            var margin = 0; //this.el.find('input[name="margin"]').val();
            this.trigger('insert', [[ids, margin]]);
            this.close();
        }
    });
    pannel.recoverHistoryPannel = pannel.Pannel.extend({
        init: function () {
            var data = {};
            var editTemplate = {};
            var template = '<div style="padding:30px;"><span style="padding-right:20px;">历史记录: </span><select style="width:240px" id="historySelect"><option value="loading">正在查询...</option></select></div>';
            var context = { 'title': '历史还原', 'data': template };
            var tid = subject.tid;
            var did = subject.did;
            this._super(data, editTemplate, context);
            $.get(subject.api.getHistory+"?t_id=" + tid + "&d_id=" + did, function (data) {
                var historyList = data.data;
                var len = historyList.length;
                var $select = $('#historySelect');
                var html = '';
                for (var i = 0; i < len; i++) {
                    var item = historyList[i];
                    html += '<option value="' + item.id + '"><span>' + item.edit_user + ': </span><em>' + item.last_edit_time + '</em></option>';
                }
                $select[0].innerHTML = html;
            }, "JSON");
        },
        confirm: function () {
            var $select = $('#historySelect');
            var tid = subject.tid;
            var did = subject.did;
            var hisid = $select.val();
            if (hisid !== 'loading') {
                var historyWin = window.open(window.location.href + '&h_id=' + hisid);
                historyWin.focus();
            }
        }
    });
    pannel.ContentStyleSelectPannel = pannel.Pannel.extend({
        events: {
            "click #dataList .add": "update",
            "mouseover #dataList .add": "showLayer",
            "mouseout #dataList .add": "hideLayer",
            "click a": "disableLink"
        },
        init: function (context) {
            //this.subjectData = subject.defaultData();
            var data = subject.conttem.data;
            var context = { 'title': "添加内容" };
            this.editTemplate = '<% _.each(data,function(contents,typename){ %><h2 class="tab"><%= typename %></h2><div class="tab" title="<%= typename %>" ><% _.each(contents,function(item,i){ %><h3><%=item.title%></h3><div class="add" cid="<%=item._attributes.id%>" title="<%=item.title%>"><div class="overlay"><h1>点击插入</h1></div><div id="content_select_c<%=item._attributes.id%>" class="c_t_01"><%=item.template%></div></div><% });%></div><%}); %>';
            this._super(data, this.editTemplate, context);
            this.editDataList.find('#NewContList').before('<div id="tablist" class="clearfix"></div>');
            this.contentList = this.editDataList.find('#NewContList div.add');
            var tabs = this.editDataList.find('#NewContList>div.tab')//tabs是每栏的内容
            tabs.css("display", "none");
            var buttons = this.editDataList.find('h2.tab')//buttons是每栏的标签
            .detach().appendTo($("#tablist"));
            var el = this.el;
            buttons.bind("click", function (e) {
                var tgname = this.innerHTML;
                buttons.removeClass("active");
                this.className = "tab active";
                tabs.hide().filter('[title="' + tgname + '"]').show(); //.toggle();
                //el.vAlign().hAlign()
            })
            .eq(0).trigger("click");
        },
        createPannel: function () {
            var self = this;
            var groupeddata = {};
            var self = this;
            $.each(self.data, function (idx, item) {
                //@asg 2012.4.18 getdefautCustom() for checkbox; replace custom value before templating;
                var item1 = {
                    title: item._attributes.title,
                    _attributes: {
                        id: item._attributes.id,
                        group: item._attributes.group
                    }
                };
                try {
                    item1.template = item.template.replace(/\[\^w_title\]/, "标题").replace(/\[\^w_more\]/, "<a href=\"#\">更多</a>").replace(/\[\^w_content\]/, "<div style=\"height: 200px;\"></div>");
                    if (item._attributes.custom && item._attributes.custom.length !== 0) {
                        var defautCustomData = subject.getDefaultCustom(item._attributes.custom)
                        $.each(defautCustomData, function (i, item) {
                            var tName, NRegExp;
                            tName = item.mark.match(/\[\^([a-zA-Z0-9_]*)\]/i);
                            if (tName) {
                                nRegExp = new RegExp("\\[\\^" + tName[1] + "\\]", "ig");
                                item1.template = item1.template.replace(nRegExp, item.value);
                            }
                        });
                    }
                    item1.template = item1.template.replace(/\[\^repId\]/g, "content_select_c" + item._attributes.id);
                    item1.template = _.template(item1.template, {
                        "data": subject.defaultData(item._attributes.data || dog.getTemplateContext(item.template), item._attributes.disNum)
                    })
                } catch (exception) {
                    item1.template = "<div><b>" + item._attributes.title + "</b>组件发生错误： <i>" + exception.message
                	+ "</i> 无法加载。</div>";
                    item1._attributes.id = -1;
                }
                var group = item._attributes.group;
                groupeddata[group] = ($.isArray(groupeddata[group]) ? groupeddata[group] : new Array())
                groupeddata[group].push(item1);
            })
            this.context.data = '<div id="NewContList">' + _.template(self.editTemplate, {
                "data": groupeddata
            }) + '</div>';
        },
        disableLink: function (e) {
            //this.update(e); @asg 2013.5.22 what's this about?
        },
        showLayer: function (e) {
            var el = $(e.target).parents("div.add");
            var height = el.outerHeight();
            el.find('.overlay').css('line-height', height + 'px').show();
        },
        hideLayer: function (e) {
            var el = $(e.target).parents("div.add");
            el.find('.overlay').hide();
        },
        update: function (e) {
            var el = $(e.target).parents("div.add"); /*获取点击元素复原素class为add的元素*/
            //var index = this.contentList.index(el); /*获取add元素在列表中的索引*/
            var id = el.attr("cid");
            if (id == -1) {//@asg 7.2 see also line 740
                alert("错误组件无法加载")
            } else {
                var data = _.find(subject.conttem.data, function (cont) { return cont._attributes.id == id });
                /*data = dog.deepCopy({}, data) 按照索引获取对应content的样式,外层已经完成*/
                this.trigger("update", [data]); /*触发update返回结果*/
            }
            this.close(); /*关闭pannel*/
            return false; //2012.01.09 avoid anchors href redirecting!
        }
    });
    //adPort @river
    pannel.adPortPannel = pannel.Pannel.extend({
        init: function () {
            var data = {};
            var editTemplate = {};
            var inputvalue = subject._attributes.adport;
            if (inputvalue) {
                var arr = inputvalue.split("?");
                var inputVal = arr[0].substring(arr[0].indexOf("list/") + 5);
            } else {
                var inputVal = '';
            }
            var template = '<p style="padding-left:30px;"><span style="display:inline-block;width:120px;">广告接口地址:</span><input type="text" value="' + inputVal + '" id="inputfield_adPort" name="inputfield_adPort" style="width:362px;padding:3px;margin:5px 0;"></p>';
            var context = {
                'title': '广告接口',
                'data': template
            };
            context.width = "640px";
            this._super(data, editTemplate, context);
        },
        confirm: function () {
            var adportVal = $.trim(this.el.find("#inputfield_adPort").val());
            if (adportVal) {
                var adlink = 'http://adm.leju.sina.com.cn/get_ad_list/' + adportVal + '?callback=ads.processReqChange';
                subject._attributes.adport = adlink;
            } else {
                if (subject._attributes.adport) {
                    subject._attributes.adport = ''
                }
            }
            this.close();
        }
    });
    pannel.AutoDataSelectPannel = pannel.Pannel.extend({
        events: {
            "change #dataType": "dataTypeChange",
            "click #autoDataBtn": "send",
            "click input.autodataupdatebutton": "autodataupdate"
        },

        init: function (context, editPanel) {
            this.typeSelect = $("<select id=\"dataType\"><option value=''></option></select>");
            this.selectType = '';
            //this.channelSelect = $("<select id=\"styleChannel\"><option value=''></option></select>");
            var data = subject.autoapitem.data;
            this.editPanel = editPanel;

            //this.names = editPanel.names;
            //this.dataTitle = dataTitle;
            this.defaultData = editPanel.defaultData;

            var context = { 'title': "获取自动数据" };
            this.editTemplate = '<% _.each(data,function(item,i){ %><p><input type=\"checkbox\" id=\"checkfield_<%=i%>\" name=\"checkfield_<%=i%>\"><label id=\"label_<%=i%>\" for=\"checkfield_<%=i%>\"><%=item.name%></label><input id=\"inputfield_<%=i%>\" type=\"text\" value=\"<%=item.value%>\"/></p><% }); %>';
            this._super(data, this.editTemplate, context);
            this.editDataList.css({ "width": "800px" });
            this.render();
            this.selectContainer = $("<span class=\"w_select\"></span>");
            this.createSelect();
        },
        createSelect: function () {
            var self = this;
            $.each(this.data, function (i, n) {
                if (n.name) {
                    self.typeSelect.append("<option value='" + n.name + "'>" + n.name + "</option>");
                }
            });
            this.selectContainer.append(this.typeSelect);
            //this.selectContainer.append(this.channelSelect);
            // this.el.find(".w1_title").append(this.selectContainer);
            this.modifyTitle(function ($title) {      //@asg 2013.5.30
                $title.append(this.selectContainer);
            })

        },
        render: function () {
            this.editDataList.empty();
            $("#autoDataBtn").show();
            this.editDataList.html(this.context.data);
            if (this.editDataList.find('#SelectFieldList').html() == '') {
                this.editDataList.find('#SelectFieldList').html('请选择自动数据接口类型...<br/>');
                $("#autoDataBtn").hide();
            } else {
                if (this.selectType == "子专题") {
                    this.editDataList.find('#SelectFieldList input[type=text]').attr("readonly", "readonly");
                }
            }
        },
        dataTypeChange: function (e) {
            var select = $(e.target).val();
            this.selectType = select;
            this.createPannel();
            this.render();
        },
        createPannel: function () {
            var defaultData, self = this;
            $.each(this.data, function (i, item) {
                if (item.name == self.selectType) {
                    self.url = item.url;
                    defaultData = item.property;
                }
            })
            this.context.data = '<div id="SelectFieldList">' + _.template(this.editTemplate, {
                "data": defaultData
            }) + '</div><input id="autoDataBtn" type="button" value="提交"/>';
        },
        confirm: function (e) {
            var self = this,
            	list = [];
            this.editDataList.find(':checkbox:checked').each(function (i) {
                if ($(this).val() != "check") {
                    list.push(self.autodata[this.value]);
                }
            });
            this.trigger("update", [list]);
            this.close();
        },
        send: function (e) {

            var parameter = {},
	    		self = this,
	    		checkboxlist = this.editDataList.find(':checkbox:checked');
            if (checkboxlist.length == 0) {
                alert("请选择搜索条件..");
                return;
            }
            if (self.selectType == "子专题" && checkboxlist.length < 1) {
                alert("请选择1项子专题");
                return;
            }
            parameter['c_id'] = subject.cid;
            parameter['p_id'] = subject.pid;
            parameter['t_id'] = subject.tid;
            parameter['d_id'] = subject.did;
            parameter['template'] = self.selectType;
            this.ajaxCount = 0;
            // this.el.find("input.confirm").hide() //?button or text?
            this.modifyButtons(function ($buttons) {         //@asg 4.28 remove button
                $buttons.eq(0).hide();
            })

            $.each(checkboxlist, function (i, n) {
                var index = n.id.split('_')[1],
	    			name = self.editDataList.find("#label_" + index).text(),
	    		    value = self.editDataList.find("#inputfield_" + index).val();
                if (self.selectType == "子专题") {
                    parameter['value'] = value;
                } else {
                    parameter['field' + index] = name;
                    parameter['value' + index] = value;
                }
                self.ajaxCount++;
                $.ajax({
                    url: self.url,
                    dataType: "json",
                    cache: false,
                    data: parameter,
                    type: "GET",
                    success: function (response) {
                        self.addData(response);
                    }
                });
            });
            //	        $.ajax({
            //	            type: "get",
            //	            url: subject.searchUrl,
            //	            cache: false,
            //	            data: parameter,
            //	            dataType: "json",
            //	            beforeSend : function (response) {
            //	                self.editDataList.html('自动数据抓取中,请稍后...');
            //	            },
            //	            success: function (response) {
            //	                self.addData(response);
            //	            },
            //	            error: function (x, t, e) {
            //	                self.error = true;
            //	                self.errorInfo = "自动数据读取失败。错误码：" + x.status + ". " + e.type;
            //	                alert(self.errorInfo);
            //	            }
            //	        });

        },
        addData: function (data) {
            var self = this;
            this.autodata = this.autodata || [];
            this.autodata = this.autodata.concat(data.data);
            var str = '';
            var trstr = '';
            var $table;
            if ($('#autoDataTable').length === 1) {
                $table = $('#autoDataTable');
            } else {
                str += '<thead><th><input type="checkbox" value="check" id="checkall"></th>';
                if (self.defaultData) {
                    $.each(self.defaultData, function (j, k) {
                        str += '<th>' + k.title + '</th>';
                    });
                    str += '</thead>';
                } else {
                    str += '<th>标题</th><th>日期</th><th>作者</th></thead>';
                }
                $table = $('<table id="autoDataTable" style="width:100%;">' + str + '<tbody></tbody></table>');
            }
            for (var i = 0; i < data.data.length; i++) {
                if (self.defaultData) {
                    trstr = '<tr><td><input type="checkbox" name="autoDataCheck_' + i + '" value="' + i + '"/></td>';
                    $.each(self.defaultData, function (j, k) {
                        trstr += '<td><textarea style="height:30px;" readonly = "readonly">' + data.data[i][k.name] + '</textarea></td>';
                    });
                    trstr += '</tr>';
                } else {
                    trstr = '<tr><td><input type="checkbox" name="autoDataCheck_' + i + '" value="' + i + '"/></td><td>' + this.autodata[i].title + '</td><td>' + this.autodata[i].datetime + '</td><td>' + this.autodata[i].author + '</td></tr>';
                }
                $('tbody', $table).append($(trstr));
            }
            this.editDataList.html($table);
            this.editDataList.find("#checkall").click(function () {
                if ($(this).attr("checked")) {
                    self.editDataList.find(":checkbox").attr("checked", true);
                } else {
                    self.editDataList.find(":checkbox").attr("checked", false);
                }
            });
            self.ajaxCount--
            if (self.ajaxCount == 0) {
                //this.el.find("input.confirm").show();
                this.modifyButtons(function ($buttons) {         //@asg 4.28 remove button
                    $buttons.eq(0).show();
                })

            }
            //$.sortTable({ tableId: "autoDataTable" });
        },
        autodataupdate: function () {
            var chooseData = [], data = this.autodata;
            this.editDataList.find("input[type='checkbox']:checked").each(function (i) {
                if ($(this).val() != "check") {
                    chooseData.push(data[$(this).val()]);
                }
            });
            this.editPanel.updateData(chooseData);
            this.close();
        }
    })
    dog.pannel = pannel;
})()
