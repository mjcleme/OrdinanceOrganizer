(function ($) {

  var verbs = {
    "GET"    : "get",
    "POST"   : "post",
    "PUT"    : "put",
    "DELETE" : "del"
  };

$.rest = function (url, options, jsonp) {
    this.url_       = url;
    this.options_   = options || {};
  };

  var $restProto = $.rest.prototype;
  
  $restProto.addOptions = function(options) {
    this.options_ = $.extend(true, this.options_, options);
  };

var _ajax = function (type, url, options) {
    if( typeof options !== 'object' ) {
      options = {};
    }
    options.type = type;

if( url.match(/^https?:\/\//) ) {
      options.url = url;
    } else {
      options.url = this.url_ + url;
    }

 options = $.extend(true, {}, this.options_, options);
    return $.ajax(options);
  };

$.each(verbs, function(httpMethod, restName){
    $restProto[restName] = function(url, options){
      return _ajax.call(this, httpMethod, url, options);
    };
  });

}(jQuery));
