import { View, Text, Image, Video, Input } from '@tarojs/components'
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
        console.log(params.video_urls[0])
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
                className='swiper'
                indicatorColor='#999'
                indicatorActiveColor='#333'
                circular
                indicatorDots
            >
                {
                    params.pic_urls.map((item, index) => {
                        return <SwiperItem key={index}><Image className='swiper-img' src={item} /></SwiperItem>
                    })
                }
            </Swiper>

            {params.video_urls !== null && <Video className='detail-video'
                src={params.video_urls[0]}
                controls={true}
                autoplay={false}
                initialTime={0}
                id='video'
                loop={false}
                muted={false}
            />}
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

            {/* Divider Line */}
            {/* <View className='divider'></View> */}

            {/* Comment Section */}
            {/* <View className='comment-section flex-row'>
                <Image src={params.avatar} mode='aspectFill' className='comment-avatar' />
                <Input className='comment-input' placeholder='留下一条友善的评论' />
            </View> */}
        </View>
    )
}

