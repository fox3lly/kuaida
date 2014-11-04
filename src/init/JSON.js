function postIframe(context, option, proxyUrl, url, callback) {
		var state = 0;
		var iframeId = "postIframe";
		var iframe;
		if(document.uniqueID != document.uniqueID) {
			iframe = document.createElement('<iframe name="' + iframeId + '">');
		} else {
			iframe = document.createElement('iframe');
			iframe.name = iframeId;
		}
		iframe.style.display = "none";
		document.body.appendChild(iframe);
		//iframe.id = iframeId;
		var clear = function() {
			try {
				iframe.contentWindow.document.write('');
				iframe.contentWindow.close();
				iframe.parentNode.removeChild(iframe);
				form.parentNode.removeChild(form);
				iframe = null;
				form = null;
			} catch(e) {
			}
		};
		var getData = function() {
			try {
				var da = iframe.contentWindow.name;
			} catch(e) {
			}
			clear();
			if(callback && typeof callback === 'function') {
				//alert(da);
				//json  callback.call(context, eval('(' + da + ')'));
				callback.call(context, da);
			}
		}
		var loadfn = function() {
			if(state === 1) {
				getData();
			} else {
				state = 1;
				iframe.contentWindow.location = proxyUrl || '/proxy/sso/robots.txt';
			}
		};
		if(iframe.attachEvent) {
			iframe.attachEvent("onload", loadfn);
		} else {
			iframe.onload = loadfn;
		}
		var form = document.createElement('form');
		form.action = url;
		form.method = "POST";
		form.target = iframeId;
		form.style.display = "none";
		for(var key in option) {
			var input = document.createElement('input');
			input.name = key;
			input.value = option[key];
			form.appendChild(input);
		}
		document.body.appendChild(form);
		form.submit();
	}

subject.JSON = {
	jsonstr : "",
	jsondoc : null,
	status : "loading",
	savepath : "",
	error : false,
	errorInfo : "",
	read : function(json) {
		//解析数据初始化系统属性，并改变状态
		subject.systeminfo = this.initSystem(json.system);
		this.jsondoc = json;
		this.status = "ok";
		subject.ready();
	},
    getData : function(url,cId,pId,tId,dId,hId) {
		//获取专题数据
		var self = this;
		this.savepath = subject.api.save + '?c_id='+subject.cid+'&p_id='+subject.pid+'&t_id='+subject.tid+'&d_id='+subject.did;
		this.previewpath = subject.api.preview + '?c_id='+subject.cid+'&p_id='+subject.pid+'&t_id='+subject.tid+'&d_id='+subject.did;var data = {
            c_id:cId,
            p_id:pId,
            t_id:tId,
            d_id:dId
        }        
        if(hId) {
            data.h_id = hId;
        }
		$.ajax({
			type : "get",
			url : url,
			cache:false,
			data: data,
			dataType : "json",
			success : function(response) {
				self.read(response);
			},
			error : function(x, t, e) {
				self.error = true;
				self.errorInfo = "专题数据读取失败。错误码：" + x.status+". "+e.type;
				alert(self.errorInfo);
			}
		});
	},
	initSystem: function (obj) {
        //初始化专题系统属性
        if ("undefined"==String(obj)) { return; };
        subject.onlyRead = obj._attributes.onlyread == "true" ? true : false;
        subject.isBrief = parseInt(obj._attributes.isBrief);
        if (isNaN(subject.isBrief)) {
            subject.isBrief = 0;
        };
        return obj;
    },
	run : function() {
		//try {//初始化页面属性，渲染页面
			var doc = this.jsondoc;

			//subject.styleId = doc._attributes.styleId;
			//subject.title = doc._attributes.title;
			//subject.keywords = doc._attributes.keywords;
			//subject.description = doc._attributes.description;
			//subject.CSS = doc._attributes.style;
			subject._attributes = doc._attributes;
			//判定adport
			var href = window.location.search;
			href = href.substring(1);
			if(dog.cookie.getItem(href)=='true'){
				$.getScript(subject._attributes.adport, function() {
				});				
			}
			subject.styletem.add(subject._attributes.styleId, 'init');
			//恢复风格
			subject.getStyleSheet("page");
			//恢复attributes
			
			/*TODO初始化的时候，直接将parts下的数据传给Parts类当作其中一个属性，当你修改实例属性的时候，对应的数据也会做更改*/
			//var data = {};
			//data.subject = doc;
			//data is loaded, render the page
			for(var type in doc){
				if(subject.types[type])
					dog[type](doc[type])
			}
			//subject._attributes.isshow = false;
			dog.cookie.setItem(href,'false', 60*1000*24*60, "/");
			//addTemplateStyle(doc._attributes.styleId)

		//} catch(e) {
			//this.error = true;
			//var errInfo = "";
			//for(var v in e) {
				//errInfo += v + ":" + e[v] + "\n";
			//};
			//this.errorInfo = "数据载入失败\n错误信息：\n" + errInfo;
			//alert(this.errorInfo);
		//};
	},
	insPart : function(obj) {

	},
	sysSave : function(type){ //保存返回
		if(subject.status != "ok"){return};
		var self = this,
			JSONstr = this.getJSONStr();
		if(this.error){
			alert("无法执行保存！\n" + this.errorInfo);
			return;
		};
		console.log(JSONstr);
		$.ajax({
			type : "post",
			url : this.savepath,
			cache:false,
			data:{
				content:JSONstr
			}	,
			dataType : "text",
			success : function(response) {
				if(response.indexOf("window.name") != -1 && response.indexOf("1") != -1){	
					if(type == "exit"){
						window.onbeforeunload = null;
						window.close();
					}else if(type == "refresh"){
						subject.isEditing = false;
						//alert('保存完成，点击确定开始开始刷新');
						window.location.reload();
					}else{
						alert('保存完成！');
						subject.isEditing = false;
					};
				}else{
					alert("保存失败！错误信息：" + response);
				}
			},
			error : function(x, t, e) {
				alert("保存失败！" + "错误码：" + x.status);
			}
		});
	},
	getJSONStr : function() {
		var temarr = [];
        temarr.push('{"type":"subject"');
        //temarr.push('"_attributes": {"styleId":'+subject.styleId+',"title": "'+subject.title+'","keywords": "'+subject.keywords+'","description": "'+subject.keywords+'","style":'+JSON.stringify(subject.CSS)+'}');
        temarr.push('"_attributes": ' + JSON.stringify(subject._attributes));

        var _temp = $("#Banner_box").getObject("Banner");
        if (_temp) temarr.push('"banner": ' + JSON.stringify(_temp.getData()) || "undefined");

        _temp = $("#NavCont").getObject("Nav");
        if (_temp) temarr.push('"nav": ' + JSON.stringify(_temp.getData()) || "undefined");

        temarr.push('"parts": [' + this.getPartsJSONStr() + ']');
        temarr.push('"system":' + (JSON.stringify(subject.systeminfo) || '"undefined"')+ '}');
        return temarr.join(",\n");
	},
	getSysJSONStr : function() {
		var temarr=[];
		temarr.push('"_attributes": {"onlyread":"'+subject.onlyRead+'","isBrief": '+subject.isBrief+'}');
		temarr.push('"field":'+JSON.stringify(subject.systeminfo));
		return temarr.join(",\n");
	},
	getPartsJSONStr: function () {
        var temarr = [];
        //$(".partBox").each(function(i){  
        $("#wrap").children("div").each(function (i, dom) { //@asg: splitter 2012.1.11
            var _self = $(this);
            if (_self.hasClass("partBox")){
				if(_self.hasClass("adtip")){
					var tid = _self.attr('adid')
					if(!tid){
						tid = '';
					}
					temarr.push(JSON.stringify({"tid": tid}));
				}else{
					temarr.push(JSON.stringify(_self.getObject("Part").getData()));
				}
                
			}else{
				temarr.push(JSON.stringify({"splitter": "true"}));
			}
        });
        return temarr.join(",\n");
	},
	sysPreview : function(){
		if(subject.status != "ok"){return};
		var self = this,
			JSONstr = this.getJSONStr();
		if(this.error){
			alert("无法执行保存！\n" + this.errorInfo);
			return;
		};
        subject.previewWin = window.open("/topic/default/loading","preWin");
        $.ajax({
            type : "post",
            url : this.savepath,
            cache:false,
            data:{
                content:JSONstr
            },
            dataType : "text",
            success : function(response) {
                if(response.indexOf("window.name") != -1 && response.indexOf("1") != -1){	
                    subject.isEditing = false; //恢复修改状态
                    window.open(self.previewpath,"preWin");
                    subject.previewWin.focus();
                }else{
                    alert("保存失败！错误信息：" + response);
                }
            },
            error : function(x, t, e) {
                alert("保存失败！" + "错误码：" + x.status);
            }
        });
	}
};
