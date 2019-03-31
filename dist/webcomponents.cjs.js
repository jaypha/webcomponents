'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var bindable = require('@jaypha/bindable');
var tinytime = _interopDefault(require('tinytime'));

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

//  set list(l) { console.log(l); }
  //-----------------------------------------------

  constructor()
  {
    super(); // always call super() first in the ctor.
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
    switch(this.sortAs)
    {
      case "string":
        if (reverse)
          return (a,b) => b.getItem(col).localeCompare(a.getItem(col));
        else
          return (a,b) => a.getItem(col).localeCompare(b.getItem(col));
        break;
      case "number":
        if (reverse)
          return (a,b) => b.getItem(col) - a.getItem(col);
        else
          return (a,b) => a.getItem(col) - b.getItem(col);
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
    if (this.hasAttribute("link"))
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

//----------------------------------------------------------------------------

class JayphaDatecolumn extends JayphaColumn
{
  connectedCallback()
  {
    this.format = tinytime(this.getAttribute("format"));
  }

  getDisplayValue(row)
  {
    return this.format.render(new Date(row.getItem(this.name)));
  }
}

customElements.define('jaypha-datecolumn', JayphaDatecolumn);

//----------------------------------------------------------------------------
// Copyright (C) 2019 Jaypha
// License: BSL-1.0
// Authors: Jason den Dulk
//

//----------------------------------------------------------------------------

function bindableList(initVal)
{
  let a = new Proxy({
    _array: new bindable.BindableArray(),
  },
  {
    get: function(target, prop)
    {
      const val = target._array[prop];
      if (typeof val == "function") {
        if (["push", "unshift"].includes(prop))
          return function (el) {
            return target._array[prop](new bindable.BindableAssoc(el));
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

    // Create the table
    docReady.then(() =>
    {
      let fn = () => this.refresh();
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
    this.data.addEventListener("change", fn);
    this.dispatchEvent(new Event("dataChanged"));
    this.refresh();
  }

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
        else {
//          let th = document.createElement("th");
//          th.className = self.getSortClass(idx);
//          th.innerHTML = columnDefs[idx].label;
//          th.onclick = (e) => self.setSort(idx);
          tr.appendChild(columnDefs[idx].getHead());
        }
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

      if (typeof(stuff) == "object")
        td.appendChild(stuff);
      else
        td.innerHTML = stuff;

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
