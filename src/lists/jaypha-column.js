// Client side javascript
//----------------------------------------------------------------------------
// 
//----------------------------------------------------------------------------


//----------------------------------------------------------------------------
// Manages a column in a list.
//----------------------------------------------------------------------------

export class JayphaColumn extends HTMLElement
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

