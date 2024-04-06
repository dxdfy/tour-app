import { View, Text, Image, Video, Input } from '@tarojs/components'
import { useLoad } from '@tarojs/taro'
import React, { useState, useEffect } from 'react'
import { useRouter } from '@tarojs/taro';
import { Swiper, SwiperItem } from '@tarojs/components'
import { AtButton } from 'taro-ui'
import './detail.scss'
import Taro from '@tarojs/taro';
export default function Detail() {
    const router = useRouter(); // 使用 useRouter 钩子获取路由参数
    const params = JSON.parse(router.params['params']); // 获取路由参数
    const [commentvalue, setCommentValue] = useState('');
    const [comments, setComments] = useState([]);
    const handleCommentValueInputChange = (e) => {
        setCommentValue(e.target.value);
    };
    const addComment = async () => {
        const storedToken = wx.getStorageSync('token');
        const username = wx.getStorageSync('username')
        const avatar = wx.getStorageSync('avatar')
        const comment = { username: username, avatar: avatar, content: commentvalue }
        // 构建请求的数据对象
        const requestData = {
            id: params.id,
            comment: JSON.stringify(comment)
        }
        // console.log(storedToken)
        // console.log(requestData)
        // 设置请求头部
        const header = {
            'Authorization': storedToken,
            'content-type': 'application/x-www-form-urlencoded'
        };

        // 发送POST请求，并等待响应
        const res = await Taro.request({
            url: 'http://192.168.1.105:3007/my/task/addComment',
            method: 'POST',
            data: requestData,
            header: header,
            success: (res) => {
                if (res.data.status === 0) {
                    // 请求成功，更新数据
                    wx.showToast({
                        title: '评论成功',
                        icon: 'success',
                    });
                    setCommentValue('');
                    fetchcomments();
                } else {
                    // 请求失败，处理错误
                    console.error('获取数据失败：', res.data.message)
                }
            },
            fail: (err) => {
                // 请求失败，处理错误
                console.error('请求失败：', err)
            }
        });
    }
    console.log(params);
    const fetchcomments = () => {
        const storedToken = wx.getStorageSync('token');
        Taro.request({
            url: `http://192.168.1.105:3007/my/task/getcomments?id=${params.id}`, // 替换为你的接口地址
            method: 'GET',
            header: {
                'Authorization': storedToken
            },
            success: (res) => {
                if (res.data.status === 0) {
                    // 请求成功，更新数据
                    console.log(res.data.data)
                    setComments(res.data.data)
                } else {
                    // 请求失败，处理错误
                    console.error('获取数据失败：', res.data.message)
                }
            },
            fail: (err) => {
                // 请求失败，处理错误
                console.error('请求失败：', err)
            }
        })
    }
    useEffect(() => {
        console.log(params.video_urls[0])
        Taro.showShareMenu({
            withShareTicket: true
        })
        fetchcomments()
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
            <View className='divider'></View>

            {/* Comment Section */}
            <View className='comment-section flex-row'>
                <Image src={params.avatar} mode='aspectFill' className='comment-avatar' />
                <Input className='comment-input' placeholder='留下一条友善的评论' value={commentvalue}
                    onInput={handleCommentValueInputChange} />
                <AtButton className='comment-button' size='small' type='primary' circle={true} onClick={addComment}>发送</AtButton>
            </View>

            <View>
                {comments.map((comment, index) => (
                    <View>
                        <View key={index} className="comment-item">
                            <Image src={comment.avatar} className="comment-item-avatar" />
                            <View>
                                <View className="comment-item-username">
                                    <Text>{comment.username}</Text>
                                </View>
                                <View className="comment-item-content">
                                    <Text>{comment.content}</Text>
                                </View>
                            </View>
                        </View>
                        <View className='comment-item-divider'></View>
                    </View>
                ))}
            </View>
        </View>
    )
}

