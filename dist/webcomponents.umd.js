(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = global || self, factory(global.jayphaWebComponents = {}));
}(this, (function (exports) { 'use strict';

  //----------------------------------------------------------------------------
  // ES6 Module
  //----------------------------------------------------------------------------
  // Displays an enumerated label
  //----------------------------------------------------------------------------


  class JayphaEnum extends HTMLElement
  {
    //-------------------------------------------------------

    get value() { return this._value; }
    set value(v) { if (this._value !== v) { this._value = v; this.refresh(); } }

    //-------------------------------------------------------

    //static get observedAttributes() { return ['value', 'options']; }

    constructor()
    {
      super(); // always call super() first in the ctor.
    }

    //-------------------------------------------------------
    
    connectedCallback()
    {
      this._options = JSON.parse(this.getAttribute("options"));
      if (this.hasAttribute("value"))
        this._value = this.getAttribute("value");
      else
        this._value = null;

      this.refresh();
    }

    //-------------------------------------------------------

    /*
    attributeChangedCallback(name, oldValue, newValue)
    {
      console.log(name+":"+oldValue+","+newValue);
      if (name == "value")
        this._value = newValue;
      this.refresh();
    }
    */

    //-------------------------------------------------------

    refresh()
    {
      let v = this._value;

      if (Array.isArray(v))
      {
        let s = [];
        for (let i=0; i< v.length; ++i)
          s.push(this.label(v[i]));
        this.innerText = s.join(', ');
      }
      else
        this.innerText = this.label(v);
    }

    //-------------------------------------------------------
   
    label(v)
    {
      if (v === null)
        return "";
      else if (v in this._options)
        return this._options[v];
      else
        return v;
    }
  }

  customElements.define("jaypha-enum", JayphaEnum);

  //----------------------------------------------------------------------------
  // Copyright (C) 2019 Jaypha
  // License: BSL-1.0
  // Authors: Jason den Dulk
  //

  // Client side javascript
  //----------------------------------------------------------------------------
  // 
  //----------------------------------------------------------------------------


  //----------------------------------------------------------------------------
  // Manages a column in a list.
  //----------------------------------------------------------------------------

  class JayphaColumn extends HTMLElement
  {
    get name() { return this.getAttribute("name"); }

    //-----------------------------------------------

    get sortAs()
    {
      if (this.hasAttribute("sortas"))
        return this.getAttribute("sortas");
      else
        return "string";
    }

    //-----------------------------------------------

    get label()
    {
      let label = this.querySelector("label");
      if (label)
        return label.innerHTML;
      else
        return this.innerHTML;
    }

    get isSortable()
    {
      return this.hasAttribute("sortable");
    }

    //-----------------------------------------------

    constructor()
    {
      super(); // Required.
    }

    //-----------------------------------------------

    sortClass()
    {
      let sortColumn = this.list.sortby;
      if (sortColumn === null || sortColumn.column != this.name)
        return 'sortable';
      else if (sortColumn.dir == "up")
        return 'sorted-up';
      else
        return 'sorted-down';
    }

    //-----------------------------------------------

    getHead()
    {
      let th = document.createElement("th");
      th.innerHTML = this.label;
      if (this.isSortable)
      {
        th.className = this.sortClass();
        th.onclick = (e) => this.list.setSort(this.name);
      }
      return th;
    }

    //-----------------------------------------------

    getSortFn(reverse)
    {
      let col = this.name;
      let stripNull;
      switch(this.sortAs)
      {
        case "string":
          // sorting does not handle nulls well
          stripNull = (v) => v || "";
          if (reverse)
            return (a,b) => stripNull(b[col]).localeCompare(stripNull(a[col]));
          else
            return (a,b) => stripNull(a[col]).localeCompare(stripNull(b[col]));
        case "number":
          stripNull = (v) => v || 0;
          if (reverse)
            return (a,b) => stripNull(b[col]) - stripNull(a[col]);
          else
            return (a,b) => stripNull(a[col]) - stripNull(b[col])
        default: // sortAs describes a function
          let fn = new Function('a','b', this.sortAs);
          if (reverse)
            return ((a,b) => { return -fn(a.proxy(),b.proxy()) });
          else
            return fn;
      }
    }

    //-----------------------------------------------

    getCellContent(row)
    {
      let content = this.getDisplayValue(row);
      if (this.hasAttribute("link") && (content != null))
        content = "<a href="+this.getLink(row)+">"+content+"</a>";
      return content;
    }

    //-----------------------------------------------

    getDisplayValue(row)
    {
      if (this.hasAttribute("format"))
      {
        let value = this.getAttribute("format");
        return this.simpleSub(value,row);
      }
      else if (this.hasAttribute("code"))
      {
        this.fn = new Function('row',this.getAttribute("code"));
        return this.fn(row);
      }
      else
        return row[this.name];
    }

    //-----------------------------------------------

    getLink(row)
    {
      let link = this.getAttribute("link");
      return this.simpleSub(link,row);
    }

    //-----------------------------------------------

    connectedCallback()
    {
      this.origStyle = this.getAttribute("style");
      this.style.display = "none";
    }

    //-----------------------------------------------

    simpleSub(s, v)
    {
      //for (const i of v.keys())
      for (let i in v)
      {
        let r = new RegExp("\\${"+i+"}","g");
        s = s.replace(r, v[i]);
      }
      return s;
    }
  }

  customElements.define('jaypha-column', JayphaColumn);

  class JayphaColgroup extends HTMLElement
  {
    connectedCallback()
    {
      this.style.display = "none";
    }

  }

  customElements.define('jaypha-colgroup', JayphaColgroup);

  //----------------------------------------------------------------------------
  // Copyright (C) 2018 Jaypha.
  // License: BSL-1.0
  // Author: Jason den Dulk
  //

  //      

  /**
   * We want to represent each subs. type as minimally as possible,
   * so instead of using strings we just use characters, which lets us
   * represent 27 individual subs. using a single character each.
   */

  var UserText = 'a';
  var FullMonth = 'b';
  var PartialMonth = 'c';
  var FullYear = 'd';
  var PartialYear = 'e';
  var DayOfTheWeek = 'f';
  var Hour = 'g';
  var Minutes = 'h';
  var Seconds = 'i';
  var PostOrAnteMeridiem = 'j';
  var Day = 'k';
  var DayOfTheMonth = 'l';
  var NumberMonth = 'n';
  var Hour24 = 'm';

  var SubToTypeIdentifierMap = {
    'MMMM': FullMonth,
    'MM': PartialMonth,
    'Mo': NumberMonth,
    'YYYY': FullYear,
    'YY': PartialYear,
    'dddd': DayOfTheWeek,
    'DD': DayOfTheMonth,
    'Do': Day,
    'h': Hour,
    'H': Hour24,
    'mm': Minutes,
    'ss': Seconds,
    'a': PostOrAnteMeridiem
  };

  //      

  /**
   * These types help ensure we don't misspell them anywhere. They will be
   * removed during build.
   */

  var months = ["January", "Febuary", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  /**
   * Takes an integer and returns a string left padded with
   * a zero to the left. Used to display minutes and hours (1:01:00PM);
   */
  function paddWithZeros(int) {
    return int < 10 ? '0' + int : '' + int;
  }

  /**
   * Adds suffix to day, so 16 becomes 16th.
   */
  function suffix(int) {
    return int % 10 == 1 && int != 11 ? int + "st" : int % 10 == 2 && int != 12 ? int + "nd" : int % 10 == 3 && int != 13 ? int + "rd" : int + "th";
  }

  /**
   * The compiler takes in our array of tokens returned from the parser
   * and returns the formed template. It just iterates over the tokens and
   * appends some text to the returned string depending on the type of token.
   * @param {Array<Tokens>} tokens
   * @param {Date} date
   * @param {TinyTimeOptions} options
   * @returns {String}
   */
  function compiler(tokens, date, options) {
    var month = date.getMonth();
    var year = date.getFullYear();
    var hours = date.getHours();
    var seconds = date.getSeconds();
    var minutes = date.getMinutes();
    var day = date.getDate();
    var compiled = '';
    var index = 0;
    while (index < tokens.length) {
      var token = tokens[index];
      switch (token.t) {
        case UserText:
          // $FlowFixMe flow doesn't know that v is always populated on UserText
          compiled += token.v;
          break;
        case Day:
          compiled += suffix(day);
          break;
        case PartialMonth:
          compiled += months[month].slice(0, 3);
          break;
        case FullMonth:
          compiled += months[month];
          break;
        case NumberMonth:
          var mnth = month + 1;
          if (options.padMonth) {
            mnth = paddWithZeros(mnth);
          }
          compiled += mnth;
          break;
        case FullYear:
          compiled += year;
          break;
        case PartialYear:
          compiled += (year + '').slice(2);
          break;
        case DayOfTheWeek:
          compiled += days[date.getDay()];
          break;
        case DayOfTheMonth:
          compiled += options.padDays ? paddWithZeros(day) : day;
          break;
        case Hour:
          var hour = hours === 0 || hours === 12 ? 12 : hours % 12;
          if (options.padHours) {
            hour = paddWithZeros(hour);
          }
          compiled += hour;
          break;
        case Hour24:
          var hour24 = hours;
          if (options.padHours) {
            hour24 = paddWithZeros(hour24);
          }
          compiled += hour24;
          break;
        case Minutes:
          compiled += paddWithZeros(minutes);
          break;
        case Seconds:
          compiled += paddWithZeros(seconds);
          break;
        case PostOrAnteMeridiem:
          compiled += hours >= 12 ? 'PM' : 'AM';
          break;
      }
      index++;
    }
    return compiled;
  }

  //      
  /**
   * t is type and v is value. Minified property
   * names are being used because the current minification
   * step does not mangle property names, and we want to
   * reduce bundle size as much as possible.
   */

  /**
   * Rather than using a bunch of potentially confusing regular
   * expressions to match patterns in templates, we use a simple
   * parser, taking the aproach of a compiler. This is equivalent
   * to a lexer as it returns a stream of tokens. Since there is
   * no additional analysis required for semantics we just call
   * it a parser.
   * 
   * It will return an array of tokens, each corresponding to either
   * UserText (just text we want to render) or any number of the
   * subsitution types stored in SubToTypeIdentifierMap.
   * 
   */
  function parser(template) {
    var tokens = [];
    /**
     * We iterate through each character in the template string, and track
     * the index of the character we're processing with `position`. We start
     * at 0, the first character.
     */
    var position = 0;
    /**
     * `text` is used to accumulate what we call "UserText", or simply text that
     * is not a subsitution. For example, in the template:
     *  
     *  "The day is {day}."
     * 
     * There are two instances of `UserText`, "The day is " and ".", which is the text
     * befor eand after the subsitution. With this template our tokens would look something like:
     * 
     * [
     *  { type: UserText, value: "The day is "},
     *  { type : DaySub },
     *  { type: UserText, value: "." }
     * ]
     * 
     */
    var text = '';
    while (position < template.length) {
      var char = template[position++];
      /**
       * A bracket indicates we're starting a subsitution. Any characters after this,
       * and before the next '}' will be considered part of the subsitution name.
       */
      if (char === '{') {
        // Push any `UserText` we've accumulated and reset the `text` variable.
        if (text) {
          tokens.push({
            t: UserText,
            v: text
          });
        }
        text = '';
        var sub = '';
        char = template[position++];
        while (char !== '}') {
          sub += char;
          char = template[position++];
        }
        tokens.push({
          t: SubToTypeIdentifierMap[sub]
        });
      }
      // Anything not inside brackets is just plain text.
      else {
          text += char;
        }
    }
    /**
     * We might have some text after we're done iterating through the template if
     * the template ends with some `UserText`.
     */
    if (text) {
      tokens.push({
        t: UserText,
        v: text
      });
    }
    return tokens;
  }

  //      
  function tinytime(template) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    var templateAST = parser(template);
    return {
      render: function render(date) {
        return compiler(templateAST, date, options);
      }
    };
  }

  var tinytime_1 = tinytime;

  var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

  function createCommonjsModule(fn, module) {
  	return module = { exports: {} }, fn(module, module.exports), module.exports;
  }

  var dayjs_min = createCommonjsModule(function (module, exports) {
  !function(t,e){module.exports=e();}(commonjsGlobal,function(){var t="millisecond",e="second",n="minute",r="hour",i="day",s="week",u="month",o="quarter",a="year",h=/^(\d{4})-?(\d{1,2})-?(\d{0,2})[^0-9]*(\d{1,2})?:?(\d{1,2})?:?(\d{1,2})?.?(\d{1,3})?$/,f=/\[([^\]]+)]|Y{2,4}|M{1,4}|D{1,2}|d{1,4}|H{1,2}|h{1,2}|a|A|m{1,2}|s{1,2}|Z{1,2}|SSS/g,c=function(t,e,n){var r=String(t);return !r||r.length>=e?t:""+Array(e+1-r.length).join(n)+t},d={s:c,z:function(t){var e=-t.utcOffset(),n=Math.abs(e),r=Math.floor(n/60),i=n%60;return (e<=0?"+":"-")+c(r,2,"0")+":"+c(i,2,"0")},m:function(t,e){var n=12*(e.year()-t.year())+(e.month()-t.month()),r=t.clone().add(n,u),i=e-r<0,s=t.clone().add(n+(i?-1:1),u);return Number(-(n+(e-r)/(i?r-s:s-r))||0)},a:function(t){return t<0?Math.ceil(t)||0:Math.floor(t)},p:function(h){return {M:u,y:a,w:s,d:i,D:"date",h:r,m:n,s:e,ms:t,Q:o}[h]||String(h||"").toLowerCase().replace(/s$/,"")},u:function(t){return void 0===t}},$={name:"en",weekdays:"Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"),months:"January_February_March_April_May_June_July_August_September_October_November_December".split("_")},l="en",m={};m[l]=$;var y=function(t){return t instanceof v},M=function(t,e,n){var r;if(!t)return l;if("string"==typeof t)m[t]&&(r=t),e&&(m[t]=e,r=t);else{var i=t.name;m[i]=t,r=i;}return !n&&r&&(l=r),r||!n&&l},g=function(t,e){if(y(t))return t.clone();var n="object"==typeof e?e:{};return n.date=t,n.args=arguments,new v(n)},D=d;D.l=M,D.i=y,D.w=function(t,e){return g(t,{locale:e.$L,utc:e.$u,$offset:e.$offset})};var v=function(){function c(t){this.$L=this.$L||M(t.locale,null,!0),this.parse(t);}var d=c.prototype;return d.parse=function(t){this.$d=function(t){var e=t.date,n=t.utc;if(null===e)return new Date(NaN);if(D.u(e))return new Date;if(e instanceof Date)return new Date(e);if("string"==typeof e&&!/Z$/i.test(e)){var r=e.match(h);if(r)return n?new Date(Date.UTC(r[1],r[2]-1,r[3]||1,r[4]||0,r[5]||0,r[6]||0,r[7]||0)):new Date(r[1],r[2]-1,r[3]||1,r[4]||0,r[5]||0,r[6]||0,r[7]||0)}return new Date(e)}(t),this.init();},d.init=function(){var t=this.$d;this.$y=t.getFullYear(),this.$M=t.getMonth(),this.$D=t.getDate(),this.$W=t.getDay(),this.$H=t.getHours(),this.$m=t.getMinutes(),this.$s=t.getSeconds(),this.$ms=t.getMilliseconds();},d.$utils=function(){return D},d.isValid=function(){return !("Invalid Date"===this.$d.toString())},d.isSame=function(t,e){var n=g(t);return this.startOf(e)<=n&&n<=this.endOf(e)},d.isAfter=function(t,e){return g(t)<this.startOf(e)},d.isBefore=function(t,e){return this.endOf(e)<g(t)},d.$g=function(t,e,n){return D.u(t)?this[e]:this.set(n,t)},d.year=function(t){return this.$g(t,"$y",a)},d.month=function(t){return this.$g(t,"$M",u)},d.day=function(t){return this.$g(t,"$W",i)},d.date=function(t){return this.$g(t,"$D","date")},d.hour=function(t){return this.$g(t,"$H",r)},d.minute=function(t){return this.$g(t,"$m",n)},d.second=function(t){return this.$g(t,"$s",e)},d.millisecond=function(e){return this.$g(e,"$ms",t)},d.unix=function(){return Math.floor(this.valueOf()/1e3)},d.valueOf=function(){return this.$d.getTime()},d.startOf=function(t,o){var h=this,f=!!D.u(o)||o,c=D.p(t),d=function(t,e){var n=D.w(h.$u?Date.UTC(h.$y,e,t):new Date(h.$y,e,t),h);return f?n:n.endOf(i)},$=function(t,e){return D.w(h.toDate()[t].apply(h.toDate("s"),(f?[0,0,0,0]:[23,59,59,999]).slice(e)),h)},l=this.$W,m=this.$M,y=this.$D,M="set"+(this.$u?"UTC":"");switch(c){case a:return f?d(1,0):d(31,11);case u:return f?d(1,m):d(0,m+1);case s:var g=this.$locale().weekStart||0,v=(l<g?l+7:l)-g;return d(f?y-v:y+(6-v),m);case i:case"date":return $(M+"Hours",0);case r:return $(M+"Minutes",1);case n:return $(M+"Seconds",2);case e:return $(M+"Milliseconds",3);default:return this.clone()}},d.endOf=function(t){return this.startOf(t,!1)},d.$set=function(s,o){var h,f=D.p(s),c="set"+(this.$u?"UTC":""),d=(h={},h[i]=c+"Date",h.date=c+"Date",h[u]=c+"Month",h[a]=c+"FullYear",h[r]=c+"Hours",h[n]=c+"Minutes",h[e]=c+"Seconds",h[t]=c+"Milliseconds",h)[f],$=f===i?this.$D+(o-this.$W):o;if(f===u||f===a){var l=this.clone().set("date",1);l.$d[d]($),l.init(),this.$d=l.set("date",Math.min(this.$D,l.daysInMonth())).toDate();}else d&&this.$d[d]($);return this.init(),this},d.set=function(t,e){return this.clone().$set(t,e)},d.get=function(t){return this[D.p(t)]()},d.add=function(t,o){var h,f=this;t=Number(t);var c=D.p(o),d=function(e){var n=g(f);return D.w(n.date(n.date()+Math.round(e*t)),f)};if(c===u)return this.set(u,this.$M+t);if(c===a)return this.set(a,this.$y+t);if(c===i)return d(1);if(c===s)return d(7);var $=(h={},h[n]=6e4,h[r]=36e5,h[e]=1e3,h)[c]||1,l=this.$d.getTime()+t*$;return D.w(l,this)},d.subtract=function(t,e){return this.add(-1*t,e)},d.format=function(t){var e=this;if(!this.isValid())return "Invalid Date";var n=t||"YYYY-MM-DDTHH:mm:ssZ",r=D.z(this),i=this.$locale(),s=this.$H,u=this.$m,o=this.$M,a=i.weekdays,h=i.months,c=function(t,r,i,s){return t&&(t[r]||t(e,n))||i[r].substr(0,s)},d=function(t){return D.s(s%12||12,t,"0")},$=i.meridiem||function(t,e,n){var r=t<12?"AM":"PM";return n?r.toLowerCase():r},l={YY:String(this.$y).slice(-2),YYYY:this.$y,M:o+1,MM:D.s(o+1,2,"0"),MMM:c(i.monthsShort,o,h,3),MMMM:c(h,o),D:this.$D,DD:D.s(this.$D,2,"0"),d:String(this.$W),dd:c(i.weekdaysMin,this.$W,a,2),ddd:c(i.weekdaysShort,this.$W,a,3),dddd:a[this.$W],H:String(s),HH:D.s(s,2,"0"),h:d(1),hh:d(2),a:$(s,u,!0),A:$(s,u,!1),m:String(u),mm:D.s(u,2,"0"),s:String(this.$s),ss:D.s(this.$s,2,"0"),SSS:D.s(this.$ms,3,"0"),Z:r};return n.replace(f,function(t,e){return e||l[t]||r.replace(":","")})},d.utcOffset=function(){return 15*-Math.round(this.$d.getTimezoneOffset()/15)},d.diff=function(t,h,f){var c,d=D.p(h),$=g(t),l=6e4*($.utcOffset()-this.utcOffset()),m=this-$,y=D.m(this,$);return y=(c={},c[a]=y/12,c[u]=y,c[o]=y/3,c[s]=(m-l)/6048e5,c[i]=(m-l)/864e5,c[r]=m/36e5,c[n]=m/6e4,c[e]=m/1e3,c)[d]||m,f?y:D.a(y)},d.daysInMonth=function(){return this.endOf(u).$D},d.$locale=function(){return m[this.$L]},d.locale=function(t,e){if(!t)return this.$L;var n=this.clone(),r=M(t,e,!0);return r&&(n.$L=r),n},d.clone=function(){return D.w(this.$d,this)},d.toDate=function(){return new Date(this.valueOf())},d.toJSON=function(){return this.isValid()?this.toISOString():null},d.toISOString=function(){return this.$d.toISOString()},d.toString=function(){return this.$d.toUTCString()},c}();return g.prototype=v.prototype,g.extend=function(t,e){return t(e,v,g),g},g.locale=M,g.isDayjs=y,g.unix=function(t){return g(1e3*t)},g.en=m[l],g.Ls=m,g});
  });

  //----------------------------------------------------------------------------

  class JayphaDatecolumn extends JayphaColumn
  {
    connectedCallback()
    {
      this.format = tinytime_1(this.getAttribute("format"));
    }

    getDisplayValue(row)
    {
      let v = row[this.name];
      if (v == null || v == "")
        return null;
      else
      {
        let d = dayjs_min(v,true);
        // Convert to YYYY/MM/DD to work with iOS.
        //let d = new Date(v.replace(/-/g, '/'));
        if (!d.isValid())
          return "invalid";
        return this.format.render(d.toDate());
      }
    }
  }

  customElements.define('jaypha-datecolumn', JayphaDatecolumn);

  //----------------------------------------------------------------------------

  class JayphaEnumcolumn extends JayphaColumn
  {
    connectedCallback()
    {
      this._options = JSON.parse(this.getAttribute("options"));
    }

    getDisplayValue(row)
    {
      let v = row[this.name];
      if (v == null || v == "")
        return null;
      else if (v in this._options)
        return this._options[v];
      else
        return v;
    }
  }

  customElements.define('jaypha-enumcolumn', JayphaEnumcolumn);

  //----------------------------------------------------------------------------
  // Copyright (C) 2019 Jaypha
  // License: BSL-1.0
  // Authors: Jason den Dulk
  //

  //----------------------------------------------------------------------------

  //----------------------------------------------------------------------------
  //

  class JayphaList extends HTMLElement
  {

    get columnOrder() { return this.getAttribute("columnorder").trim().replace(/\s+/g, ' ').split(" "); }
    set columnOrder(v) {
      if (Array.isArray(v))
        v = v.join(" ");
      if (v != this.getAttribute("columnorder").trim())
      {
        this.setAttribute("columnorder", v);
        this.refresh();
      }
    }

    //-------------------------------------------------------

    get sortby() {
      if (this.hasAttribute("sortby"))
      {
        let s = this.getAttribute("sortby").trim().replace(/\s+/g, " ").split(" ");
        let x =  { column: s[0], dir: "up" };
        if (typeof(s[1]) !== "undefined")
        {
          let dir = s[1];
          if (!(dir == 'up' || dir == 'asc' || dir == 'true' || dir == 't' || dir == 1 || dir === true))
            x.dir = "down";
        }
        return x;
      }
      else
        return null;
    }

    set sortby(v)
    {
      if (!("dir" in v))
        this.setAttribute("sortby", v.column);
      else      
        this.setAttribute("sortby", v.column+" "+v.dir);
    }

    get dataColumnAsRowClass() {return this.getAttribute("datacolumnasrowclass"); }
    set dataColumnAsRowClass(v)
    {
      this.setAttribute("datacolumnasrowclass", v);
      this.refresh();
    }

    //-------------------------------------------------------

    get columnDefs()
    {
      let defs = {};
      let es = this.querySelectorAll("jaypha-colgroup>*");
      if (es.length)
      {
        es.forEach(
          (e) => {
            e.list = this;
            let i = e.getAttribute("name");
            defs[i] = e;
          }
        );
      }
      return defs;
    }

    //-------------------------------------------------------

    constructor()
    {
      super(); // always call super() first in the ctor.

      this.dataReady = new Promise((resolve,reject) => {
        this.addEventListener("dataReady", () => resolve(this.data));
      });

      this.filter = null;
    }
    
    //-------------------------------------------------------

    setData(newData)
    {
      this.data = newData;
      this.dispatchEvent(new Event("dataChanged"));
      this.refresh();
      return this.data;
    }

    //-------------------------------------------------------

    whenReady()
    {

      // Read the data from the source (the script element). Then construct a
      // bindable list from that data and store it.
      let dataElement = this.querySelector("script[type='application/json']");

      if (dataElement)
      {
        let newData = JSON.parse(dataElement.innerText);
        this.data = newData;
      }
      else
        this.data = [];

      //this.data.addEventListener("change", fn);

      // Data is ready. Fire the event.
      this.dispatchEvent(new Event("dataReady"));

      // Now create the actual display table.
      this.tableElement = this.querySelector("table");
      if (!this.tableElement)
      {
        this.tableElement = document.createElement("table");
        this.appendChild(this.tableElement);
      }
      this.refresh();
    };

    connectedCallback()
    {
      if (document.readyState === "loading")
        document.addEventListener("DOMContentLoaded", () => { this.whenReady(); });
      else
        this.whenReady();
    }

    //-------------------------------------------------------

    sortList()
    {
      console.log('sortTable');
    }

    //-------------------------------------------------------

    getSortClass(col)
    {
      let sortColumn = this.sortby;
      if (sortColumn === null || sortColumn.column != col)
        return 'sortable';
      else if (sortColumn.dir == "up")
        return 'sorted-up';
      else
        return 'sorted-down';
    }

    //-------------------------------------------------------

    setSort(idx)
    {
      let sortColumn = this.sortby;
      if (sortColumn === null || sortColumn.column != idx)
        this.sortby = { column: idx };
      else
      {
        if (sortColumn.dir == "down")
          this.sortby = { column: idx };
        else
          this.sortby = { column: idx, dir: "down" };
      }
      this.reSort();
    }

    reSort()
    {
      let sortColumn = this.sortby;
      if (sortColumn != null)
      {
        this.data.sort(
          this.columnDefs[sortColumn.column]
            .getSortFn(sortColumn.dir == "down")
        );
        this.refresh();
      }
    }

    refresh()
    {
      this.tableElement.innerHTML = "";
      this.tableElement.appendChild(this.createColgroup());
      this.tableElement.appendChild(this.createHead());
      this.tableElement.appendChild(this.createBody());
    }

    //-------------------------------------------------------

    createColgroup()
    {
      let columnDefs = this.columnDefs;
      let colgroup = document.createElement("colgroup");

      this.columnOrder.map((idx) =>
      {
        if (!(idx in columnDefs))
          console.log("Error: column order '"+idx+"' is not in column definitions");
        else {
          let col = document.createElement("col");
          col.setAttribute("style", columnDefs[idx].origStyle);
          col.className = columnDefs[idx].className;
          colgroup.appendChild(col);
        }
      });
      return colgroup;
    } 
      
    //-------------------------------------------------------

    createHead()
    {

      let columnDefs = this.columnDefs;
      let thead = document.createElement("thead");
      let tr = document.createElement("tr");
      this.columnOrder.map
      (
        function(idx) 
        {
          if (!(idx in columnDefs))
            console.log("Error: column order '"+idx+"' is not in column definitions");
          else
            tr.appendChild(columnDefs[idx].getHead());
        }
      );
      thead.appendChild(tr);
      return thead;
    }

    //-------------------------------------------------------

    createBody()
    {
      let tbody = document.createElement("tbody");
      let l = this.data.length;
      for (let i=0; i<l; ++i)
        if (!this.filter || this.filter(this.data[i]))
          tbody.appendChild(this.createRow(this.data[i]));
      return tbody;
    }

    //-------------------------------------------------------

    createRow(row)
    {
      let columnDefs = this.columnDefs;

      let tr = document.createElement("tr");
      let v = this.dataColumnAsRowClass;
      if (v)
      {
        let className = row[v];
        if (className) tr.className = className;
      }

      for (let i=0; i<this.columnOrder.length; ++i)
      {
        let td = document.createElement("td");

        let stuff = columnDefs[this.columnOrder[i]].getCellContent(row);

        if (stuff !== null)
        {
          if (typeof(stuff) == "object")
            td.appendChild(stuff);
          else
            td.innerHTML = stuff;
        }

        tr.appendChild(td);
      }
        
      return tr;
    }
  }

  customElements.define('jaypha-list', JayphaList);

  //----------------------------------------------------------------------------
  // Copyright (C) 2018 Jaypha.
  // License: BSL-1.0
  // Author: Jason den Dulk
  //

  //----------------------------------------------------------------------------
  // ES6 Module
  //----------------------------------------------------------------------------
  // Editable element
  //----------------------------------------------------------------------------

  //---------------------------------------------------------
  // Template

  let jaypha_editable_template = document.createElement("template");
  jaypha_editable_template.innerHTML = `<pre style='margin:0; overflow-y: auto; height: 100%; max-height: inherit; min-height: inherit; white-space: pre-wrap' contenteditable></pre>`;

  //---------------------------------------------------------
  // Class

  class JayphaEditable extends HTMLElement
  {
    get value() { return this.pre.innerText; }
    set value(v) { this.pre.innerText = v; }

    connectedCallback()
    {
      this.style.display='block';
      document.addEventListener("DOMContentLoaded", () =>
      {
        let c = this.innerHTML;
        this.innerHTML = "";
        this.appendChild(jaypha_editable_template.content.cloneNode(true));
        this.pre = this.querySelector("pre");
        this.pre.innerText = c;
      });
    }
  }

  customElements.define('jaypha-editable', JayphaEditable);

  //----------------------------------------------------------------------------
  // Copyright (C) 2018 Jaypha.
  // License: BSL-1.0
  // Author: Jason den Dulk
  //

  exports.JayphaColumn = JayphaColumn;
  exports.JayphaEditable = JayphaEditable;
  exports.JayphaEnum = JayphaEnum;
  exports.JayphaList = JayphaList;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
