import { View, Image } from '@tarojs/components'
import React, { useState } from 'react'
import './travelcard.scss'
import Taro from '@tarojs/taro';
// const data = {
//     id: 1,
//     name: 'xianxian',
//     title: '哪一本书让你至今印象深刻',
//     text: '想知道你们最喜欢的书籍或者是对自己最有帮助的书籍',
//     status: '已通过',
//     is_delete: 0,
//     rejection_reason: '',
//     pic_urls: ["http://127.0.0.1:3007/public/upload/1711704209860-Up8PzSz0rkiOc6dcb61719972908f1bc823a27d91304.png", "http://127.0.0.1:3007/public/upload/1711704209871-xF0F8mTIhhQQcad6642e2f7ac44de4290bc13706789b.png"]
// }
export default function TravelCard(props) {
    const { pic_urls, title, avatar, name } = props
    const handleClick = () => {
        // Taro.navigateTo({ url: '/pages/detail/detail' });
        const queryParams = JSON.stringify(props);
        Taro.navigateTo({ url: `/pages/detail/detail?params=${queryParams}` });
    };
    return (
        <View className='content-item' onClick={handleClick}>
            <Image src={pic_urls[0]} className='content-item-img' mode='widthFix' />
            <View className='content-item-box'>
                <View className='content-item-title'>{title}</View>
                <View className='content-item-name'>
                    <View className='flex-row'>
                        <Image src={avatar} mode='aspectFill' className='content-item-avatar' />
                        <View>{name}</View>
                    </View>
                </View>
            </View>
        </View>
    );
}