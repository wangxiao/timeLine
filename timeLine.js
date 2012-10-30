/**
 *  timeLine 组件
 *  @author 尼奥 
 *  @email 1988wangxiao@gmail.com
 *  @github  http://wangxiao.github.com
*/

//import jquery.sizzle();
//import jquery.html();

//组件部分
//@param {String} element 容器id
//@param {String} options.url 数据源
//@param {Object} Options.data 直接传入数据
//@param {Number} options.maxWidth 图片展示最大宽
//@param {Number} options.maxHeight 图片展示最大高

function TimeLine(element,options){
	 
	this.element = jQuery('#'+element);
	this.options = options || {};
	this.url = options.url || {};
	this.data = options.data || {};

	//每张图片最大的宽和高
	this.maxWidth = options.maxWidth || 160;
	this.maxHeight = options.maxHeight || 160;

	//下张图片的地址
	this.nextURL = '';

	//标志此时是否在加载数据
	this.flag = false;

	this.c().main();
};

//数据相关
TimeLine.prototype.m = function(){
	var me = this;
	return {

		//将数据按照日期分割
		getDataByDate : function(data){
			var newData = {};
			var oldTime;
			var flag = 0;
			for(var i=0;i<data.length;i++){
				var time = me.tools.formatDate(data[i].time);
				if(flag){
					if(oldTime == time){
						newData[time].push(data[i]);
					}else{
						newData[time] = [];
						newData[time].push(data[i]);
						oldTime = time;
					}; 
				}else{
					flag = 1;
					oldTime = time;
					newData[time] = [];
					newData[time].push(data[i]);
				}
			};
			return newData;
		},

		//将图片控制在160x160px，data是一张图片的数据
		setImage : function(data){
			if(data.width > data.height){
				data.minWidth = me.maxWidth;
				data.minHeight = (data.height/data.width)*me.maxWidth;
			}else{
				data.minHeight = me.maxHeight;
				data.minWidth = (data.width/data.height)*me.maxHeight;
			}
			return data;
		},

		//处理后的照片数据
		getData : function(data){
			for(var key in data){
				me.m().setImage(data[key]);
			}
			return me.m().getDataByDate(data);
		}

	};
};

//视图相关
TimeLine.prototype.v = function(){
	var me = this; 
	
	//前端模板，整个界面
	me.tpl = [
		"<%for(var key in data){%>",
			"<!-- 一天的模板 -->",
			"<div>",
			"<h2><%=key%></h2>",
			"<%for(var i = 0;i<data[key].length;i++){%>",
				"<img src=<%=data[key][i].imageURL%> style=width:<%=data[key][i].minWidth%>px;height:<%=data[key][i].minHeight%>px;>",
				"<!-- 五张图片一换行 -->",
				"<%if((i+1)%5 == 0){%>",
					"<br>",
				"<%}%>",
			"<%}%>",
			"</div>",
			"<!-- 一天的结束 -->",
		"<%}%>"
	].join('');

	return {

		//设置模板
		setTpl : function(tpl){
			me.tpl = String(tpl);
		},

		//获取模板
		getTpl : function(){
			return me.tpl;
		}

	}
};

//控制器
TimeLine.prototype.c = function(){
	var me = this; 
	return {

		//主入口
		main : function(){

			//异步取数据
			function getData(url){
				url = url + '&jsoncallback=?';
				me.flag = true;
				jQuery.getJSON(url,function(data){
					me.nextURL = data.nextURL;
					me.c().show(data);
					me.flag = false;
				});
			};
			getData(me.url);
			me.tools.scrollBottom();
			//当滚到底部，获取数据
			$(document).on('scrollBottom',function(){
				if(!me.flag){
					getData(me.nextURL);
				}
			});
		},

		//传入原始的data形式，并显示图片
		show : function(data){

			var tpl = me.v().getTpl();
			var tplFun = baidu.template(tpl);
			var temp = {};
			temp.data = me.m().getData(data);
			var htmlTpl = tplFun(temp);
			me.element.append(htmlTpl);
		}


	};

};

//工具方法
TimeLine.prototype.tools = {

	//将时间戳输出为日期
	//source输入时间戳，pattern是返回格式，如“y-m-d”返回"2012-08-16"
	formatDate : function(source,pattern){
		var date = new Date(Number(source));

		//年
		var y = date.getFullYear();
		
		//月
		var m = date.getMonth()+1;
		m = m>9?m:'0'+m;

		//日
		var d = date.getDate();
		d = d>9?d:'0'+d;

		var pattern = pattern||'y-m-d';
		return pattern.replace(/y/,y)
				.replace(/m/,m)
				.replace(/d/,d);
	},

	//滚到屏幕下方触发，派发全局scrollBottom事件
	scrollBottom : function() {
		jQuery(window).scroll(function(){
			var scrollTop = jQuery(document).scrollTop();
			var winHeight = jQuery(window).height();
			var docHeight = jQuery(document).height();
			if(scrollTop >= docHeight - winHeight - 500){
				jQuery(document).trigger('scrollBottom');
			}
		});
	}

};
