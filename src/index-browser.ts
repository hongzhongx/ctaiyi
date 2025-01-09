/**
 * @file ctaiyi entry point for browsers.
 */

import 'regenerator-runtime/runtime'

// Microsoft is keeping to their long-held tradition of shipping broken
// standards implementations, this forces Edge to use the polyfill insted.
// tslint:disable-next-line:no-string-literal
if (global['navigator'] && /Edge/.test(global['navigator'].userAgent)) {
  delete global['fetch'] // tslint:disable-line:no-string-literal
}

import 'core-js/es6/map'
import 'core-js/es6/number'
import 'core-js/es6/promise'
import 'core-js/es6/symbol'
import 'core-js/fn/array/from'
import 'core-js/modules/es7.symbol.async-iterator'
import 'whatwg-fetch'

export * from './index'
