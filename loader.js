(function () {
    var addscript = function (url, callback) {
        var script = document.createElement('script');
        script.type = 'text/javascript';
        if (script.readyState) {
            script.onreadystatechange = function () {
                if (script.readyState == 'loaded' || script.readyState == 'complete') {
                    script.onreadystatechange = null;
                    callback && callback();
                    script.parentNode.removeChild(script);
                }
            }
        } else {
            script.onload = function () {
                callback && callback();
                script.parentNode.removeChild(script);
            }
        }
        script.src = url;
        document.getElementsByTagName('head')[0].appendChild(script);
    }
    var addCss = function (url) {
        var link = document.createElement('link');
        link.type = 'text/css';
        link.rel = "stylesheet";
        link.href = url;
        document.getElementsByTagName('head')[0].appendChild(link);
    }
    var loadCss = function (path) {
        var debug = window.location.hash.match(/\bdebug(=(.+))?/);
        if (debug) {
            var _function = function () {
                var url, prefix = debug[2] || "http://imgcdn.house.sina.com.cn/2.0/";
                while (url = path.shift()) {
                    addCss(prefix + url);
                }
            }
            _function();
        } else {
            var baseuri = "http://imgcdn.house.sina.com.cn/2.0/min/?b=2.0&f=";
            addCss(baseuri + path.join(','));
        }
    }
    var loadscript = function (path, callback) {
        var debug = window.location.hash.match(/\bdebug(=(.+))?/);
        if (debug) {
            var _function = function () {
                var url, prefix = debug[2] || "http://imgcdn.house.sina.com.cn/2.0/";
                if (url = path.shift()) {
                    addscript(prefix + url, _function);
                } else {
                    callback && callback();
                }
            }
            _function();
        } else {
            var baseuri = "http://imgcdn.house.sina.com.cn/2.0/min/?b=2.0&f=";
            addscript(baseuri + path.join(','), callback);
        }
    }
    var fileslist = [
        'kuaida/lib/class.js'
        , 'dojquery.js'
        , 'kuaida/lib/underscore.js'
        , 'kuaida/lib/json2.js'
        , 'kuaida/lib/toolDrag.js'
        , 'kuaida/src/dog/dog.js'
        , 'kuaida/lib/swfupload/swfupload.js'
        , 'kuaida/lib/swfupload/jquery.swfupload.js'
        , 'kuaida/lib/iColorPicker.js'
        , 'kuaida/lib/htmlformat.js'
        , 'kuaida/lib/utils.js'
        , 'kuaida/src/dog/toolbar.js'
        , 'kuaida/lib/pannel.js'
        , 'kuaida/lib/EditPanel.js'
        , 'kuaida/src/part/part.js'
        , 'kuaida/src/row/Block.js'
        , 'kuaida/src/row/Content.js'
        , 'kuaida/src/init/subject.js'
        , 'kuaida/src/init/template.js'
        , 'kuaida/src/init/JSON.js'
        , 'bbs/js/artDialog.js'

    ];
    //loadCss(['kuaida/css/demo.css', 'bbs/js/skins/default.css']);
    addscript('http://i2.sinaimg.cn/dy/deco/2010/0504/sinaObj.js');
    loadscript(fileslist, function () {
        subject.prefix = "http://n81.pub.house.sina.com.cn/js/dj/leju/topic/";
        subject.init();
    });
})();
