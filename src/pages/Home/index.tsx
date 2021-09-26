/*
 * @Author: zhujian1995@outlook.com
 * @Date: 2021-07-27 16:27:05
 * @LastEditors: zhujian
 * @LastEditTime: 2021-09-26 15:08:11
 * @Description: 你 kin 你擦
 */
import React from 'react';
import cn from 'classnames';
import './style.scss';
import Progress from '@/components/Progress';

const Home = () => {
  return (
    <div className={cn('home', 'l-page')}>
      <Progress percent={0.65} style={{ margin: '20px auto' }} />
    </div>
  );
};

export default Home;
