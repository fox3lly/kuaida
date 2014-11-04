(function() {
	i = 0;
	var $bd = $('body');
	dog.Toolbar = dog.View.extend({
		events : {
			"click input:eq(0)" : "changeStyle",
			"click input:eq(1)" : "insertPart",
			"click input:eq(2)" : "pageAttribute",
			"click input:eq(3)" : "publishPreview",
			"click input:eq(4)" : "save",
			"click input:eq(5)" : "saveExit",
			"click input:eq(6)" : "sysPreview",
			"click input:eq(7)" : "history",
			"click input:eq(8)" : "sysHelp",
			"click input:eq(9)" : "setMode"
            
		},
		init : function() {
			this.el = $('<div class="toolbar flap" id="TopTool">');
			this.$title = $('<h2 class="handle">工具条</h2>').appendTo(this.el);
			this.$menu = $('<div class="TopToolCont"><div class="menu"><input type="button" value="更换风格"/><input type="button" value="插入横切"/><input type="button" value="页面属性"/><input type="button" value="预览发布"/><input type="button" value="保　　存"/><input type="button" value="保存退出"/><input type="button" value="预览专题"/><input type="button" value="历史还原"/><input type="button" value="系统帮助"/><input type="button" class="modeFull"/></div></div>').appendTo(this.el);
			$bd.append(this.el);
			this._super();
			new ToolDrag("TopTool"); 
		},
		changeStyle : function() {
			return subject.sysStyle();
		},
		insertPart : function() {
			var insertPannel = new dog.pannel.InsertPartPannel();
			insertPannel.bind('insert',function(event,data){
				var a = new dog.Part({
					"_attributes" : {
						'style' : [{
							"name" : "下间距",
							"selector" : "#[^repId]",
							"property" : "margin-bottom",
							"value" : data[1]
						}],
						"ishide" : "false",
						'pid' : data[0]
					}
				});
			})
			
		},
		pageAttribute : function() {
			return subject.sysAttr();
		},
		publishPreview : function() {
			return subject.JSON.sysPreview();
		},
		save : function() {
			return subject.JSON.sysSave();
		},
		saveExit : function() {
			return subject.JSON.sysSave('exit');
		},
		sysPreview : function() {
			var Preview = window.open('/topic/default/reference?c_id=1', 'Preview');
			Preview.focus();
		},
		sysHelp : function() {
			var helpWin = window.open('/help/', 'helpWin');
			helpWin.focus();
		},
		setMode: function(e) {
			var target = e.target || e.srcElement;
		    if(target.nodeType == 3) {
		        target = node.parentNode;
		    }
			subject.setMode();
			if(subject.workMode == 'full'){
				target.className = 'modeFull';
			}else{
				target.className = 'modeData';
			};
		},
        history: function() {
			var recoverHistoryPannel = new dog.pannel.recoverHistoryPannel();
		}
	});
})()
