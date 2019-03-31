//----------------------------------------------------------------------------
// ES6 Module
//----------------------------------------------------------------------------
// Displays an enumerated label
//----------------------------------------------------------------------------


export class JayphaEnum extends HTMLElement
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

