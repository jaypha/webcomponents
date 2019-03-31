// Client side javascript
//----------------------------------------------------------------------------
// 
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

  //-----------------------------------------------

  constructor()
  {
    super(); // always call super() first in the ctor.
  }

  //-----------------------------------------------

  getSortFn(reverse)
  {
    let col = this.name;
    switch(this.sortAs)
    {
      case "string":
        if (reverse)
          return (a,b) => b[col].localeCompare(a[col]);
        else
          return (a,b) => a[col].localeCompare(b[col]);
        break;
      case "number":
        if (reverse)
          return (a,b) => b[col] - a[col];
        else
          return (a,b) => a[col] - b[col];
        break;
      default: // sortAs describes a function
        let fn = new Function('a','b', this.sortAs);
        if (reverse)
          return ((a,b) => { return -fn(a,b) });
        else
          return fn;
    }
  }

  //-----------------------------------------------

  getCellContent(row)
  {
    if (this.hasAttribute("format"))
    {
      this.fn = new Function('row',this.getAttribute("format"));
      return this.fn(row);
    }
    else if (this.hasAttribute("link"))
    {
      let fn = new Function('row',"return "+this.getAttribute("link"));
      return "<a href="+fn(row)+">"+row[this.name]+"</a>";
    }
    else
      return row[this.name];
  }

  //-----------------------------------------------

  //-----------------------------------------------

  connectedCallback()
  {
    this.origStyle = this.getAttribute("style");
    this.style.display = "none";
  }
}

customElements.define('jaypha-column', JayphaColumn);

//----------------------------------------------------------------------------
// Copyright (C) 2018 Jaypha.
// License: BSL-1.0
// Author: Jason den Dulk
//

