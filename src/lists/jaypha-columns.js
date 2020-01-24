//----------------------------------------------------------------------------
// ES6 Module
//----------------------------------------------------------------------------
// Some common column format types
//----------------------------------------------------------------------------

import { JayphaColumn } from "./jaypha-column.js";

//----------------------------------------------------------------------------

import tinytime from "tinytime";

class JayphaDatecolumn extends JayphaColumn
{
  connectedCallback()
  {
    this.format = tinytime(this.getAttribute("format"));
  }

  getDisplayValue(row)
  {
    let v = row[this.name];
    if (v == null || v == "")
      return null;
    else
    {
      // Convert to YYYY/MM/DD to work with iOS.
      let d = new Date(v.replace(/-/g, '/'));
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

