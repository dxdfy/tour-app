import { View, Image } from '@tarojs/components'
import React, { useState } from 'react'
import './travelcard.scss'
import Taro from '@tarojs/taro';

export default function TravelCard(props) {
    const { pic_urls, title, avatar, name } = props
    const handleClick = () => {
        // Taro.navigateTo({ url: '/pages/detail/detail' });
        const queryParams = JSON.stringify(props);
        console.log(queryParams);
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