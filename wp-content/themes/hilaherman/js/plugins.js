// Avoid `console` errors in browsers that lack a console.
(function() {
    var method;
    var noop = function () {};
    var methods = [
        'assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error',
        'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log',
        'markTimeline', 'profile', 'profileEnd', 'table', 'time', 'timeEnd',
        'timeStamp', 'trace', 'warn'
    ];
    var length = methods.length;
    var console = (window.console = window.console || {});

    while (length--) {
        method = methods[length];

        // Only stub undefined methods.
        if (!console[method]) {
            console[method] = noop;
        }
    }
}());

// Place any jQuery/helper plugins in here.

// Add ECMA262-5 Array methods if not supported natively
//
if (!('indexOf' in Array.prototype)) {
    Array.prototype.indexOf= function(find, i /*opt*/) {
        if (i===undefined) i= 0;
        if (i<0) i+= this.length;
        if (i<0) i= 0;
        for (var n= this.length; i<n; i++)
            if (i in this && this[i]===find)
                return i;
        return -1;
    };
}
if (!('lastIndexOf' in Array.prototype)) {
    Array.prototype.lastIndexOf= function(find, i /*opt*/) {
        if (i===undefined) i= this.length-1;
        if (i<0) i+= this.length;
        if (i>this.length-1) i= this.length-1;
        for (i++; i-->0;) /* i++ because from-argument is sadly inclusive */
            if (i in this && this[i]===find)
                return i;
        return -1;
    };
}

(function($) {

"use strict";

/**
 * jQuery.imageloader
 * (C) 2012, Takashi Mizohata
 * http://beatak.github.com/jquery-imageloader/
 * MIT LICENSE
 */

var DEFAULT_OPTIONS = {
  selector: '',
  dataattr: 'src',
  background: false,
  each: null,
  eacherror: null,
  callback: null,
  timeout: 5000
};

var init = function (_i, self, opts) {
  var q = Queue.getInstance();
  var $this = $(self);
  var defaults = $.extend({}, DEFAULT_OPTIONS, opts || {});
  var ns = '_' + ('' + (new Date()).valueOf()).slice(-7);
  var $elms;
  var len = 0;

  if (defaults.selector === '' && $this.data(defaults.dataattr) ) {
    $elms = $this;
    len = 1;
  }
  else {
    $elms = $this.find([defaults.selector, '[data-', defaults.dataattr, ']'].join(''));
    len = $elms.length;
  }

  $this.data(
    ns,
    {
      each: defaults.each,
      eacherror: defaults.eacherror,
      callback: defaults.callback,
      isLoading: true,
      loadedImageCounter: 0,
      length: len
    }
  );

  if (len === 0) {
    finishImageLoad(self, ns);
  }
  else {
    $elms.each(
      function (i, elm) {
        q.add(buildImageLoadFunc(elm, self, ns, defaults.background, defaults.dataattr, defaults.timeout));
      }
    );
    // console.log(['we are gonna load ', len, ' image(s) on ', ns].join(''));
    $this.on('loadImage.' + ns, onLoadImage);
    q.run();
  }
  return self;
};

// ===================================================================

var onLoadImage = function (ev, elm, img, isError) {
  // console.log('onLoadImage: ', ev.namespace);
  var parent = ev.currentTarget;
  var defaults = $(parent).data(ev.namespace);
  if (!defaults.isLoading) {
    // console.log('onLoadImage: is not loading but still called?');
    return;
  }
  if (isError) {
    if (typeof defaults.eacherror === 'function') {
      defaults.eacherror(elm);
    }
    else {
      if (elm.parentNode !== null) {
        elm.parentNode.removeChild(elm);
      }
    }
  }
  else if (typeof defaults.each === 'function') {
    defaults.each(elm, img);
  }
  ++defaults.loadedImageCounter;
  if (defaults.loadedImageCounter >= defaults.length) {
    finishImageLoad(parent, ev.namespace);
  }
};

var finishImageLoad = function (parent, ns) {
  // console.log('finishImageLoad: ', ns);
  var $parent = $(parent);
  var data = $parent.data();
  var callback = data[ns].callback;
  $parent.off('loadImage.' + ns, onLoadImage);
  delete data[ns];
  if (typeof callback === 'function') {
    setTimeout(
      function () {
        callback(parent);
      },
      $.imageloader.queueInterval * 2
    );
  }
};

var buildImageLoadFunc = function (elm, parent, namespace, isBg, attr, milsec_timeout) {
  var $elm = $(elm);
  var src = $elm.data(attr);
  var hasFinished = false;

  var onFinishLoagImage = function (ev, img) {
    // delete attribute
    $elm.removeAttr( ['data-', attr].join('') );
    $(parent).triggerHandler('loadImage.' + namespace, [elm, img, (ev && ev.type === 'error')]);
  };

  return function () {
    var timer_handler;
    var $img = $('<img />'); // this statement is kinda silly, but IE needs this separated.
    $img
      .bind(
        'error',
        function (ev) {
          hasFinished = true;
          clearTimeout(timer_handler);
          $(this).unbind('error').unbind('load');
          onFinishLoagImage(ev);
        }
      )
      .bind(
        'load',
        function(ev) {
          hasFinished = true;
          clearTimeout(timer_handler);
          $(this).unbind('error').unbind('load');
          if (isBg) {
            $elm.css('background-image', ['url(', src, ')'].join(''));
          }
          else {
            $elm.attr('src', src);
          }
          onFinishLoagImage(ev, $img[0]);
        }
      )
      .attr('src', src);
    timer_handler = setTimeout(
      function () {
        if (hasFinished === false) {
          // console.log('timeout');
          $img.trigger('error');
        }
      },
      milsec_timeout
    );
  };
};

// ===================================================================

var _queue_instance_;
var Queue = {
  getInstance: function () {
    if (_queue_instance_ instanceof QueueImpl === false) {
      _queue_instance_ = new QueueImpl();
    }
    return _queue_instance_;
  }
};

var QueueImpl = function () {
  this.index = 0;
  this.queue = [];
  this.isRunning = false;
};

QueueImpl.prototype.add = function (func) {
  if (typeof func !== 'function') {
    throw new Error('you can only pass function.');
  }
  this.queue.push(func);
};

QueueImpl.prototype.run = function (firenow) {
  var run = $.proxy(this.run, this);
  firenow = firenow || false;
  if (this.isRunning && !firenow) {
    return;
  }
  this.isRunning = true;
  this.queue[this.index++]();
  if (this.index < this.queue.length) {
    setTimeout(
      function () {
        run(true);
      },
      $.imageloader.queueInterval
    );
  }
  else {
    this.isRunning = false;
  }
};

// ===================================================================

$.imageloader = {
  queueInterval: 17
};

$.fn.imageloader = function (opts) {
  return this.each(
    function (i, elm) {
      init(i, elm, opts);
    }
  );
};

})(jQuery);

/**
 * Copyright (c) 2007-2013 Ariel Flesler - aflesler<a>gmail<d>com | http://flesler.blogspot.com
 * Dual licensed under MIT and GPL.
 * @author Ariel Flesler
 * @version 1.4.6
 */
;(function($){var h=$.scrollTo=function(a,b,c){$(window).scrollTo(a,b,c)};h.defaults={axis:'xy',duration:parseFloat($.fn.jquery)>=1.3?0:1,limit:true};h.window=function(a){return $(window)._scrollable()};$.fn._scrollable=function(){return this.map(function(){var a=this,isWin=!a.nodeName||$.inArray(a.nodeName.toLowerCase(),['iframe','#document','html','body'])!=-1;if(!isWin)return a;var b=(a.contentWindow||a).document||a.ownerDocument||a;return/webkit/i.test(navigator.userAgent)||b.compatMode=='BackCompat'?b.body:b.documentElement})};$.fn.scrollTo=function(e,f,g){if(typeof f=='object'){g=f;f=0}if(typeof g=='function')g={onAfter:g};if(e=='max')e=9e9;g=$.extend({},h.defaults,g);f=f||g.duration;g.queue=g.queue&&g.axis.length>1;if(g.queue)f/=2;g.offset=both(g.offset);g.over=both(g.over);return this._scrollable().each(function(){if(e==null)return;var d=this,$elem=$(d),targ=e,toff,attr={},win=$elem.is('html,body');switch(typeof targ){case'number':case'string':if(/^([+-]=?)?\d+(\.\d+)?(px|%)?$/.test(targ)){targ=both(targ);break}targ=$(targ,this);if(!targ.length)return;case'object':if(targ.is||targ.style)toff=(targ=$(targ)).offset()}$.each(g.axis.split(''),function(i,a){var b=a=='x'?'Left':'Top',pos=b.toLowerCase(),key='scroll'+b,old=d[key],max=h.max(d,a);if(toff){attr[key]=toff[pos]+(win?0:old-$elem.offset()[pos]);if(g.margin){attr[key]-=parseInt(targ.css('margin'+b))||0;attr[key]-=parseInt(targ.css('border'+b+'Width'))||0}attr[key]+=g.offset[pos]||0;if(g.over[pos])attr[key]+=targ[a=='x'?'width':'height']()*g.over[pos]}else{var c=targ[pos];attr[key]=c.slice&&c.slice(-1)=='%'?parseFloat(c)/100*max:c}if(g.limit&&/^\d+$/.test(attr[key]))attr[key]=attr[key]<=0?0:Math.min(attr[key],max);if(!i&&g.queue){if(old!=attr[key])animate(g.onAfterFirst);delete attr[key]}});animate(g.onAfter);function animate(a){$elem.animate(attr,f,g.easing,a&&function(){a.call(this,targ,g)})}}).end()};h.max=function(a,b){var c=b=='x'?'Width':'Height',scroll='scroll'+c;if(!$(a).is('html,body'))return a[scroll]-$(a)[c.toLowerCase()]();var d='client'+c,html=a.ownerDocument.documentElement,body=a.ownerDocument.body;return Math.max(html[scroll],body[scroll])-Math.min(html[d],body[d])};function both(a){return typeof a=='object'?a:{top:a,left:a}}})(jQuery);
