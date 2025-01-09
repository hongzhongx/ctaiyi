/**
 * @file ctaiyi entry point for node.js.
 */

import 'core-js/modules/es7.symbol.async-iterator'
global['fetch'] = require('node-fetch') // tslint:disable-line:no-string-literal

export * from './index'
