subject.template = {//模板对象
    status: "loading",
    read: function (json) { //读取模板数据
          subject.styletem.init(json.styles);
          subject.parttem.init(json.parts);
          subject.rowtem.init(json.rows);
		  subject.blocktem.init(json.blocks);
		  subject.conttem.init(json.contents);
		  subject.autoapitem.init(json.autoapis);
		  subject.upload_url = json.upload_url;
		  subject.upload_key = json.upload_key;
		  subject.upload_m_key = json.upload_m_key;
		  if (json._attributes) subject.defaultAttributes = json._attributes;
		  this.status = "ok";
          subject.ready();
    },
    getData: function (url,cId,pId,tId,dId) {
        var self = this;
        $.ajax({
		type:"get",
		url:url,
		cache:false,
		data:{
			c_id:cId,
			p_id:pId,
			t_id:tId,
			d_id:dId
		},
		dataType:"json",
		success: function(response){
				self.read(response);
		},
			error: function(x,t,e){
				self.error = true;
				self.errorInfo = "专题模板读取失败。错误码："+x.status;
				alert(self.errorInfo);
		    }
	    });
	    
    }
};
subject.styletem = {//样式模板对象 用来操作添加样式窗口
    status: "loading",
    data: [],
    filePath: "css/demo.css",
    channels:[],
    selectChannel: "",
    colors:[],
    selectColor: "",
    wrap:null,
    init: function (list) {
        var tmpChannel, tmpColor,self =this;
        this.wrap=$("#addStyle");
        this.data = list;
		if(!this.wrap){return;}
        this.wrap.find("#styleChannel").append("<option value=''></option>"); 
        this.wrap.find("#styleColor").append("<option value=''></option>"); 
        $.each(list, function(i, n){
        	if(n.channel){
        		tmpChannel = n.channel.split(",");
        		$.each(tmpChannel, function(j, m){
        			if ($.inArray(m,self.channels) == -1) {
                        self.channels.push(m);
                        self.wrap.find("#styleChannel").append("<option value='"+m+"'>"+m+"</option>"); 
                    }
        		});
        	};
        	if (n.color) {
                tmpColor = n.color.split(",");
                $.each(tmpColor, function(j, m){
        			if ($.inArray(m,self.channels) == -1) {
                        self.colors.push(m);
                        self.wrap.find("#styleColor").append("<option value='"+m+"'>"+m+"</option>"); 
                    }
        		});
            }
		});
        this.bindEvent();
        this.render();
        this.status = "ok";
    },
	show2:function(){
	
		this.wrap.show();
    },
	selectStyle : function() {
		var self = this;
		var blockStyleSelectPannel = new dog.pannel.BlockStyleSelectPannel({
			"title" : "编辑数据"
		});
		blockStyleSelectPannel.bind('update', function() {
			self.data._attributes.bid = arguments[1]._attributes.id;
			self.findBlockStyle();
		})
	},
    bindEvent:function(){
    	var self=this;
    	this.wrap.find("#styleChannel").bind('change', function() {
  			return self.changeChannel(this.value);
		});
		this.wrap.find("#styleColor").bind('change', function() {
  			return self.changeColor(this.value);
		});
		this.wrap.delegate(".close", "click", function (e) {
            return self.close();
        })
    },
    render : function(){
    	var self = this,
		container = this.wrap.find("#styeList");
		container.empty();
		$.each(this.data, function(i, n){
        	if (n.channel.indexOf(self.selectChannel) != -1 && n.color.indexOf(self.selectColor) != -1) {
  				var holder = $("<div>",{"class": ""});
  				holder.append($("<img>",{"class": "",src:n.imgsrc,
				click: function(e){
    				return subject.styletem.add(n.id,"add");
  				}}));
  				holder.append('<p>频道:'+n.channel+'</p><p>颜色:'+n.color+'</p>');
  				container.append(holder);
            }
        });
		if(container.html()==''){
			container.html("没有相关样式列表。。");
		};	
	},
	changeChannel:function(select){
        this.selectChannel = select;
        this.render();
    },
    changeColor:function(select){
        this.selectColor = select;
        this.render();
    },
    add:function(num,addType){
    	var self=this;
    	
    	$.each(this.data, function(i, n){
        	if (n.id==num) {
  				self.filePath = n.filepath;
				self.styleNum = n.id;
				if(addType == 'add' && subject.banner){
					subject.banner.styleBanner = n.banner;
					subject.banner.render();
				}
				return false;//退出循环
            }
        });
        var href = subject._attributes.customStyle || this.filePath;
        $("#sysStyle").attr("href",href);
        
        subject._attributes.styleId = num;
        if(addType!="init"){
        	subject.isEditing=true;
    	}
    	$(document).trigger("stylechange.subject", [num, addType]);
        this.close();
    },
    show:function(){
    	
    	this.wrap.show();
    },
    close:function(){
    	this.wrap.hide();
    }
};

subject.parttem = {//横切模板对象 
	data : [],
	status : "loading",
	init : function(list){
		this.data = list;
		this.status = "ok";
	},
	position : -1,
	show : function(id){
		//显示遮盖 显示属性窗口 添加模板数据
		if(subject.status != "ok"){return};
		this.position = id;
	
		this.render();
	},
	render : function(row){
		var i,tempHTML = "";
		if(!row){row = 0};
		//选择横切分类后重新渲染属性窗口中的横切列表
	},
	add:function(){
		
	},
	close : function(){
	    //关闭属性窗口
	}
};
subject.rowtem = {//列模板对象 
	data : [],
	status : "loading",
	init : function(list){
		this.data = list;
		this.status = "ok";
	},
	position : -1,
	show : function(id){

	},
	render : function(row){

	},
	add:function(){
		
	},
	close : function(){

	}
};

subject.blocktem = {//block模板对象 维护block模板数据 操作添加block窗口
	data : [],
	status : "loading",
	onlypartId : -1,
	rowNum : -1,
	onlyblockId : -1,
	init : function(list){
		this.data = list;
		this.status = "ok";
		//this.render();
	},
	render : function(){
	    var self = this;
		$.each(this.data, function(i, n){
			$("<div>",{"class": "",
					    html:self.conFillCode(n),
						click: function(e){
    						return subject.blocktem.add(i);
  						}
  			}).appendTo("#newBlkList");
		});
	},
	show : function(onlypartId,rowNum,onlyblockId,type){
		//显示添加block窗口 根据唯一的partid  和列号 确认添加的位置
		if(subject.status != "ok"){return};
		this.onlypartId = onlypartId;
		this.rowNum = rowNum;
		$("#addBlock").show();

	},	
	add:function(num){
		
   	    this.close();
	   //根据partid和列号 添加栏目快
	   //
	},
	conFillCode : function(obj){
		var str = obj.html;
		str = str.replace("[^w_title]","标题栏");
		str = str.replace("[^w_more]",'<a href="#">更多&gt;&gt;</a>');
		str = str.replace("[^blk_cont]",'<div style="height:200px;"></div>');
		return str;
	},
	close : function(){
		$("#addBlock").hide();
	}
};
subject.conttem = {//content模板对象 维护content模板数据 and 操作添加content窗口?
	data : [],
	status : "loading",
	init : function(list){
		this.data = list;
		this.status = "ok";
		//this.render();
	},
	render : function(){
	    /*var self = this;
		$.each(this.data, function(i, n){
			$("<div>",{"class": "",
				html:self.conFillCode(n),
				click: function(e){
    				return subject.blocktem.add(i);
  				}
  			}).appendTo("#newBlkList");
		});*/
	},
	show : function(onlypartId,rowNum,onlyblockId,type){

		if(subject.status != "ok"){return};
		this.onlypartId = onlypartId;
		this.rowNum = rowNum;
		$("#addBlock").show();

	},	
	add:function(num){
		
   	    this.close();
	   
	},
	conFillCode : function(obj){
		/*
		var str = obj.html;
		str = str.replace("[^w_title]","标题栏");
		str = str.replace("[^w_more]",'<a href="#">更多&gt;&gt;</a>');
		str = str.replace("[^blk_cont]",'<div style="height:200px;"></div>');
		return str;*/
	},
	close : function(){
		$("#addBlock").hide();
	}
};
subject.autoapitem = {
	data : [],
	init : function(list){
		this.data = list;
		this.status = "ok";
	}
}