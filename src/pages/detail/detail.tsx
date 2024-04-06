import { View, Text, Image } from '@tarojs/components'
import { useLoad } from '@tarojs/taro'
import React, { useState, useEffect } from 'react'
import { useRouter } from '@tarojs/taro';
import { Swiper, SwiperItem } from '@tarojs/components'
import './detail.scss'
import Taro from '@tarojs/taro';
export default function Detail() {
    const router = useRouter(); // 使用 useRouter 钩子获取路由参数
    const params = JSON.parse(router.params['params']); // 获取路由参数
    console.log(params);
    useEffect(() => {
        Taro.showShareMenu({
            withShareTicket: true
        })
    }, [])
    return (
        // {
        //     searchlist.map((item, index) => {
        //         if (index % 2 === 0) {
        //             return <TravelCard key={index} {...item} />
        //         }
        //         return null
        //     })
        // } <Image src={avatar} mode='aspectFill' className='content-item-avatar' />
        <View className='detail'>
            <Swiper
                className='test-h'
                indicatorColor='#999'
                indicatorActiveColor='#333'
                circular
                indicatorDots
            >
                {
                    params.pic_urls.map((item, index) => {
                        return <SwiperItem key={index}><Image src={item} style={{ width: '100%' }}/></SwiperItem>
                    })
                }
            </Swiper>
            <View className='detail-title'>
                <Text >{params.title}</Text>
            </View>

            <View className='detail-text' >
                <Text >{params.text}</Text>
            </View>

            <View className='flex-row'>
                <Image src={params.avatar} mode='aspectFill' className='content-item-avatar' />
                <View>{params.name}</View>
            </View>
        </View>
    )
}

