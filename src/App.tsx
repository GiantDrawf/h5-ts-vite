/*
 * @Author: zhujian1995@outlook.com
 * @Date: 2021-08-25 11:13:53
 * @LastEditors: zhujian
 * @LastEditTime: 2021-09-26 11:32:04
 * @Description: 你 kin 你
 */
import React from 'react';
import 'core-js/features/promise/finally';
import { HashRouter, Route, Switch } from 'react-router-dom';

import Home from './pages/Home';

const App = () => {
  return (
    <HashRouter>
      <Switch>
        <Route exact path="/" component={Home} />
      </Switch>
    </HashRouter>
  );
};

export default App;
