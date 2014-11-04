/**
 * last modify: @guanjia 2014.5.6
 * 
 */
(function () {
    var pannel = dog.pannel;
    pannel.EditDataPannel = pannel.Pannel.extend({
        events: {
            "click span.ico_up": "up",
            "click span.ico_down": "down",
            "click span.ico_del": "del",
            "click span.ico_add": "add",
            "click input.autodatabutton": "autodata"
        }, //@asg 10.24 comma caused coma in IE7
        init: function (data, defaultData, context) {
            var self = this;
            var template = "<div class='hqsj'><div class='hqsj_an'><input type='button' value='获取自动数据' id='autodatabutton' class='autodatabutton'/></div><div class='hqsj_ul'><ul><% _.each(data, function(obj){%>";
            this.defaultData = defaultData;
            var defaultLine = { obj: new Object() };
            this.tempLine = "<li class=\"content\">";
            
            for (var i = 0, _item; _item = this.defaultData[i]; i++) {
                defaultLine.obj[name] = _item.value;
                //@asg 10.17 subject default value: if boolean,checkbox; if not boolean, textbox;;;
                this.tempLine += "<div>";

                if (typeof (_item.value) == 'boolean') {
                    this.tempLine += _item.title + ":<input type=\"checkbox\" name=\"" + _item.name + "\" <%= obj." + _item.name + "?'checked=\"checked\"':'' %>/>";
                } else {
                //add by guanjia at 20140428
                //the type "intro" means description,template use textarea instead of input
                //the arguments did not change
                    if(_item.name == "intro"){
                        this.tempLine += _item.title + ":<textarea name=\"" + _item.name + "\"><%- obj." + _item.name + "%></textarea>";
                    }else{
                        this.tempLine += _item.title + ":<input type=\"text\" name=\"" + _item.name + "\" value=\"<%- obj." + _item.name + "%>\"/>";
                    }
                }
                // end by guanjia at 20140428
                this.tempLine += "</div>";
                if (_item.validator) {
                    (function (_item) {
                        $(document).delegate("input[name='" + _item.name + "']", "change.editPanel", function (evt) {
                            if (!_item.validator.test(this.value)) {
                                this.style.backgroundColor = "#faa";
                            } else {
                                this.style.backgroundColor = "#fff";
                            }
                        });
                    })(_item)
                }
            };


            this.tempLine += "<span class=\"ico_up ico\"></span><span class=\"ico_down ico\"></span><span class=\"ico_del ico\"></span></li>";
            template = template + this.tempLine + "<% }); %></ul></div><span class=\"ico_add\"></span></div>";
            this.htmlLine = _.template(this.tempLine, defaultLine);
            this._super(data.data, template, context);
            this.el.delegate("input[name='image']", "focus", function (evt) {
                self.editPic(this)
            });
        },
        editPic: function (input) {
            var self = this;
            if (self.editingPic) return;
            var dataPicPannel = new dog.pannel.dataPicPannel(input.value);
            dataPicPannel.bind("update", function (event, pic) {
                input.value = pic;
            });
            dataPicPannel.bind("close", function (event, pic) {
                self.editingPic = false;
            });

            self.editingPic = dataPicPannel;
        },
        updateData: function (data) {// maybe api auto-data-panel access this;
            this.list = this.editDataList.find('li');
            this.list.each(function (i) {
                if (i >= data.length) {
                    return false;
                }
                that.find("input").each(function (j) {
                    if (this.type == 'checkbox')//@asg 10.17
                        this.checked = data[i][$(this).attr("name")]
                    else
                        this.value = data[i][$(this).attr("name")]
                });
                // add by guanjia at 20140506
                that.find("textarea").each(function (j) {
                        this.value = data[j][$(this).attr("name")]
                });
                // end by guanjia at 20140506
            });
        },
        createPannel: function () {
            if (this.data) {
                this.context.data = _.template(this.editTemplate, {
                    "data": this.data
                });
            } else {
                this.context.data = '该模块没有要编辑的数据';
            }

        },
        autodata: function (e) {
            var self = this;
            var editAutoDataPannel = new dog.pannel.AutoDataSelectPannel({ "title": "获取自动数据" }, this, this.defaultData);
            editAutoDataPannel.bind("update", function (event, list) {
                var temp = _.template("<% _.each(data, function(obj){%>" + self.tempLine + "<% }); %>", { "data": list });
                $(temp).appendTo(self.el.find("ul"));
            });
        },
        up: function (e) {
            this.list = this.editDataList.find('li');
            var self = $(e.target.parentNode);
            var index = this.list.index(self);
            if (index) {
                self.detach();
                this.list.eq(index - 1).before(self);
            }

        },
        del: function (e) {
            this.list = this.editDataList.find('li');
            var index = this.list.index($(e.target.parentNode));
            this.data = this.parseData(index);
            this.refresh();
        },
        down: function (e) {
            this.list = this.editDataList.find('li');
            var self = $(e.target.parentNode);
            var index = this.list.index(self);
            if (index < this.list.size() - 1) {//@asg 10.22
                var next = this.list.eq(index + 1);
                self.detach();
                next.after(self);
            }

        },
        add: function (e) {
            var newli = $(this.htmlLine).appendTo(this.el.find("ul"));
        },
        confirm: function () {
            var data = this.parseData();
            this.trigger("update", [data]);
            this.close();
        },
        parseData: function (except) {//@asg 10.15
            var self = this;
            this.list = this.editDataList.find('li');
            var data = [];
            $.each(this.list, function (idx, li) {
                if (except == idx) return; //for delete function: except
                var datum = {};
                $(li).find("input").each(function (i, input) {
                    var name = input.getAttribute("name");
                    var value = input.value;
                    //@asg 10.17
                    if (input.type == 'checkbox') {
                        value = input.checked
                    }
                    datum[name] = value;
                });
                // add by guanjia at 20140506
                // add description textarea
                // each textarea and push value to data
                 $(li).find("textarea").each(function (i, textarea) {
                    var name = textarea.getAttribute("name");
                    var value = textarea.value;
                    datum[name] = value;
                });
                // end by guanjia at 20140506 
                data.push(datum);
            });
            return data;
        },
        close: function () {
            if (this.editingPic) this.editingPic.close();
            $(document).undelegate(".editPanel");
            this._super();
        }

    }).extend(dog.EventProvider);
    //@asg:
    pannel.dataPicPannel = pannel.Pannel.extend({
        events: {
            "click #dataPic_pannel": "openData"
        },
        init: function (picobj) {
            var data = {};
            var editTemplate = {};
            this.picobj;
            var template = ['<div id="picurl" class="x-field x-form-item clearfix"><label class="x-form-item-label">输入图片地址</label><div class="x-form-item-body"><input type="text" id="dataPic_picurl" style="width:350px" value="' + picobj + '"/></div></div>']

            var _size = picobj.match(/_s(\d+)x(\d+)_/i);
            if (!_size) {
                _size = [0, 0, 0];
            }
            var _isSizable = picobj.match(/_p\d+_/m);
            template.push('<div id="size"' + (_isSizable ? '' : ' style="display:none"') + ' class="x-field x-form-item clearfix"><label class="x-form-item-label">输入图片尺寸</label><div class="x-form-item-body"><input type="text" id="dataPic_width" style="width:50px" value="' + _size[1] + '"/>X<input type="text" id="dataPic_height" style="width:50px" value="' + _size[2] + '"/></div></div>')
            template.push('<div id="swfupload" class="x-field x-form-item clearfix"><label class="x-form-item-label">或上传新图片</label><div class="x-form-item-body">(jpg,png)：<input type="button" id="button"/><ol id="log"></ol></div></div>');
            template.push('<div id="select" class="x-field x-form-item clearfix"><label class="x-form-item-label">进入图库选择</label><div class="x-form-item-body"><input type="button" id="dataPic_pannel" value="打开图片库"/></div></div>');
            var context = { 'title': '图片', 'data': template.join('') };
            this._super(data, editTemplate, context);

            this.modifyButtons(function ($buttons) {         //@asg 4.28 remove button
                $buttons.eq(1).hide();
            })

            var self = this;
            self.el.find("#swfupload").swfupload({
                upload_url: subject.upload_url,
                post_params: { "pkey": subject.upload_key, "mkey": subject.upload_m_key },
                file_size_limit: "10240",
                file_types_description: "Image",
                file_types: "*.jpg;*.png;*.gif",
                flash_url: subject.prefix + "lib/swfupload/swfupload.swf",
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
                }
                var url = document.domain;
                $.ajax({
                    url: "http://" + url + subject.api.addfile
                    , type: "POST"
                    , data: { "fileinfo": JSON.stringify(_data)}//
                    , success: function (data) {
                        self.el.find('#dataPic_picurl').val(self.picobj.msg.furl).trigger('change');
                        $('#log').append('<li>上传成功 - ' + file.name + '</li>');
                    }
                })
            });
            self.el.delegate(".styleadd img", "click", function (evt) {
                var _img = $(this);
                self.el.find('#dataPic_picurl').val(_img.attr("src")).trigger('change');
                self.el.find(".styleadd img").css({ "border": "solid 3px #FFF" })
                _img.css({ "border": "solid 3px #ffff00" });
            }).delegate("#dataPic_picurl", "change", function () {
                var url = self.el.find('#dataPic_picurl').val();
                if (!url.match(/_p\d+_/m)) {
                    self.el.find('#size').hide()
                } else {
                    self.el.find('#size').show()
                }
            }).delegate("#size input", "change", function () {
                var url = self.el.find('#dataPic_picurl').val()
                , size = [self.el.find("#dataPic_width").val(), self.el.find("#dataPic_height").val()]
                , nsize = "_S" + (isNaN(parseInt(size[0])) ? 0 : size[0]) + "X" + (isNaN(parseInt(size[1])) ? 0 : size[1]) + '_'
                , nurl = url.replace(/_s(\d+)x(\d+)_/i, '_').replace(/(_p\d+)_/, "$1" + nsize)

                self.el.find('#dataPic_picurl').val(nurl)
            });
        },
        openData: function () {
            var _div = this.el.find('#select');
            _div.html('loading...')
            var currentimg = this.el.find('#dataPic_picurl').val();
            var _data = {
                c_id: subject.cid
                , p_id: subject.pid
                , t_id: subject.tid
                , d_id: subject.did
            }
            $.ajax({
                url:  subject.api.getsubjectfile
                , data: _data
                , success: function (ret) {
                    var list = JSON.parse(ret).msg;

                    var _temp = "<div id='NewStyleList' style='height:300px;overflow-y:scroll'><% _.each(data, function(obj){%><div class='styleadd '><img <%if(obj.url.match(current)){%>style='border:#FFF' <%}%>src='<%=obj.url%>'/></div><% }); %></div>"
                    _div.html(_.template(_temp, { "data": list, 'current': currentimg }))
                }
            })
        },
        confirm: function () {
            var furl = this.el.find('#dataPic_picurl').val();
            this.trigger('update', [[furl]]);
            this.close();
        },
        close: function () {
            this.trigger('close');
            this._super();
        }
    })
})();
