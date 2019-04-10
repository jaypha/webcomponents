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
    return this.format.render(new Date(row.getItem(this.name)));
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
    return this._options[row.getItem(this.name)];
  }
}

customElements.define('jaypha-enumcolumn', JayphaEnumcolumn);

//----------------------------------------------------------------------------
// Copyright (C) 2019 Jaypha
// License: BSL-1.0
// Authors: Jason den Dulk
//

