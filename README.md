# Webcomponents

A set of vanilla web components that I have developed for various projects.

No framework required.

Available in ES6, UMD and CJS.

## Installation

`npm install --save @jaypha/webcomponents`

Use `--save-dev` if you intend to incorporate this module into our own bundles.

## Dependencies

* @jaypha/bindable
* tinytime (for jaypha-datecolumn)
* [Web components polyfill](https://www.webcomponents.org/polyfills/)

## The Components

### japha-list

A list component that constructs a list from a set of data. The list can be
* sortable
* column definitions including formating.
* columns can have their order rearranged.
* Makes used of data bindings so you can manipulate the data structure and have the display change accordingly.

### jaypha-editable

Creates an editable area.

### jaypha-enum

Enumerable display that allows you to set it's value, and it displays a label
based on that value.

### jaypha-spinput (in development)

A replacement for the built in `<input type='number'>` that overcomes some of its
shortcommings.


## TODO

* Documentation
* Spinput.
* Transpile UMD to make available for older browsers.

## License

Copyright (C) 2019 Jaypha.  
Distributed under the [Boost Software License, Version 1.0](http://www.boost.org/LICENSE_1_0.txt).

