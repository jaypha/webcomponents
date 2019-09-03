(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = global || self, factory(global.jayphaWebComponents = {}));
}(this, function (exports) { 'use strict';

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
  // Binding without the bloat
  //----------------------------------------------------------------------------

  // Binding works by allowing event handler to be attached to the value in
  // question. When the value changes, the event is fired.


  //----------------------------------------------------------------------------
  // BindableValue is an object encapsulating a single value. You need to use
  // get and set as simply sddigning will replace the object. Attach listeners
  // using addEventListener. Every time set is called, the event fires.

  class BindableValue
  {
    get() { return this._value; }

    set(v) {
      if (v !== this._value)
      {
        let prev = this._value;
        this._value = v;
        for (let i=0; i<this._listeners.length; ++i)
          (this._listeners[i])(this, prev);
      }
    }

    addEventListener(fn) {
      this._listeners.push(fn);
    }

    trigger() {
      for (let i=0; i<this._listeners.length; ++i)
        (this._listeners[i])(this);
    }

    bindWidget(w) {
      this.addEventListener(((o) => w.value=o.get()) );
      w.addEventListener('change', (ev) => this.set(w.value));
    }

    constructor(initVal) {
      this._listeners = [];
      this._value = initVal;
    }
  }

  //----------------------------------------------------------------------------
  // BindableArray is similar to BindableObject, but for arrays. Adding,
  // removing and rearranging the elements will trigger the 'add', 'remove' and
  // 'rearrange' events respectively.



  class BindableArray extends Array
  {
    constructor() {
      super(...arguments);
      this._listeners = { add:[], remove:[], rearrange: [], change: [] };
    }

    addEventListener(type, fn) { this._listeners[type].push(fn); }
    fill() {
      let result = super.fill(...arguments);
      this.triggerEvent("change");
      return result;
    }
    reverse() {
      let result = super.reverse();
      this.triggerEvent("rearrange");
      this.triggerEvent("change");
      return result;
    }
    sort(fn) {
      let result = super.sort(fn);
      this.triggerEvent("rearrange");
      this.triggerEvent("change");
      return result;
    }
    pop() {
      let result = super.pop();
      this.triggerEvent("remove");
      this.triggerEvent("change");
      return result;
    }
    shift() {
      let result = super.shift();
      this.triggerEvent("shift");
      this.triggerEvent("change");
      return result;
    }
    push() {
      let result = super.push(...arguments);
      this.triggerEvent("add");
      this.triggerEvent("change");
      return result;
    }
    unshift() {
      let result = super.unshift(...arguments);
      this.triggerEvent("add");
      this.triggerEvent("change");
      return result;
    }
    splice() {
      let len = this.length;
      let result = super.splice(...arguments);
      if (result.length > 0)
        this.triggerEvent("remove");
      if (len - result.length < this.length)
        this.triggerEvent("add");
      this.triggerEvent("change");
      return result;
    }

    triggerEvent(type)
    {
      for (let i=0; i<this._listeners[type].length; ++i)
       (this._listeners[type][i])(this);
    }
  }

  //----------------------------------------------------------------------------
  // A BindableAssoc is an object where all the properties are
  // BindableValues. It does not fire an event when you add and remove a
  // property, but you can use addEventListener to add an event to a particular
  // property.


  class BindableAssoc
  {
    constructor(initVal)
    {
      this._props = {};
      if (typeof(initVal) != "undefined")
        for (let i in initVal)
          this._props[i] = new BindableValue(initVal[i]);
      this.proxy = new Proxy(
        this,
        {
          set: function(target,p,v) { return target.setItem(p,v); },
          get: function(target,p)  { return target.getItem(p);   }
        });
    }

    getItem(p) { if (typeof(this._props[p]) != "undefined") return this._props[p].get(); }
    setItem(p,v)
    {
      if (typeof(this._props[p]) == "undefined")
        this._props[p] = new BindableValue(val);
      else
        this._props[p].set(v);
      return true;
    }
    keys() { return Object.keys(this._props); }
    removeItem(p) { delete target._props[p]; }

    addEventListener(p, fn)
    {
      if (typeof(this._props[p]) == "undefined")
        this._props[p] = new BindableValue();
      this._props[p].addEventListener(fn);
    }

    bindWidget(p, wgt)
    {
      if (typeof(this._props[p]) == "undefined")
        this._props[p] = new BindableValue();
      this._props[p].bindWidget(wgt);
    }
  }

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
            return (a,b) => stripNull(b.getItem(col)).localeCompare(stripNull(a.getItem(col)));
          else
            return (a,b) => stripNull(a.getItem(col)).localeCompare(stripNull(b.getItem(col)));
          break;
        case "number":
          stripNull = (v) => v || 0;
          if (reverse)
            return (a,b) => stripNull(b.getItem(col)) - stripNull(a.getItem(col));
          else
            return (a,b) => stripNull(a.getItem(col)) - stripNull(b.getItem(col))
          break;
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
        return row.getItem(this.name);
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
      for (const i of v.keys())
      {
        let r = new RegExp("\\${"+i+"}","g");
        s = s.replace(r, v.getItem(i));
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

  //----------------------------------------------------------------------------

  class JayphaDatecolumn extends JayphaColumn
  {
    connectedCallback()
    {
      this.format = tinytime_1(this.getAttribute("format"));
    }

    getDisplayValue(row)
    {
      let v = row.getItem(this.name);
      if (v == null || v == "")
        return null;
      else
      {
        let d = new Date(v);
        if (isNaN(d.getTime()))
          return "invalid";
        return this.format.render(d);
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
      let v = row.getItem(this.name);
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

  function bindableList(initVal)
  {
    let a = new Proxy({
      _array: new BindableArray(),
    },
    {
      get: function(target, prop)
      {
        const val = target._array[prop];
        if (typeof val == "function") {
          if (["push", "unshift"].includes(prop))
            return function (el) {
              return target._array[prop](new BindableAssoc(el));
            }
          return val.bind(target._array);
        }
        return val;
      }
    });

    if (typeof(initVal) !== "undefined")
    {
      for (let i=0; i<initVal.length; ++i)
        a.push(initVal[i]);
    }
    return a;
  }

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

      let docReady = new Promise(function(resolve,reject) {
        document.addEventListener("DOMContentLoaded", () => resolve(true));
      });

      docReady.then(() =>
      {
        // This should be done when the children have been creted and attached.
        // There is no known way to capture this moment specifically.

        let fn = () => this.refresh();

        // Read the data from the source (the script element). Then construct a
        // bindable list from that data and store it.
        let dataElement = this.querySelector("script[type='application/json']");

        if (dataElement)
        {
          let newData = JSON.parse(dataElement.innerText);
          this.data = bindableList(newData);
        }
        else
          this.data = bindableList();

        this.data.addEventListener("change", fn);

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
      });
    }
    
    //-------------------------------------------------------

    setData(newData)
    {
      this.data = bindableList(newData);
      this.data.addEventListener("change", () => this.refresh());
      this.dispatchEvent(new Event("dataChanged"));
      this.refresh();
    }

    //-------------------------------------------------------

    connectedCallback()
    {
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

  //----------------------------------------------------------------------------

  //----------------------------------------------------------------------------
  // Copyright (C) 2019 Jaypha
  // License: BSL-1.0
  // Authors: Jason den Dulk
  //

  exports.JayphaColumn = JayphaColumn;
  exports.JayphaEditable = JayphaEditable;
  exports.JayphaEnum = JayphaEnum;
  exports.JayphaList = JayphaList;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
