import { View, ScrollView } from '@tarojs/components'
import React, { useState, useEffect } from 'react';
import Taro from '@tarojs/taro';
import { AtAvatar, AtCard } from 'taro-ui';
export default function Comments() {
    const [comments, setComments] = useState([]);
    useEffect(() => {
        const storedToken = wx.getStorageSync('token');
        const data = {
            username: wx.getStorageSync('username'),
        };
        wx.request({
            url: `http://192.168.1.103:3007/my/task/commentsToMe`,
            method: 'POST',
            data: data,
            header: {
                'Authorization': storedToken,
                'content-type': 'application/x-www-form-urlencoded'
            },
            success: function (res) {
                console.log(res.data);
                setComments(res.data);
                //    const allComments = res.data.reduce((acc, curr) => {
                //     return acc.concat(curr.comments);
                //    }, []);
                //    setComments(allComments);
                //    console.log('comments',comments);
            },
            fail: function (error) {
                console.error('failed:', error);
            }
        });
    }, []);
    // const getMyCommnts = () => {
    //     const data = {
    //         username: wx.getStorageSync('username'),
    //     };
    //     wx.request({
    //         url: `http://192.168.1.103:3007/my/task/myComments`,
    //         method: 'POST',
    //         data: data,
    //         header: {
    //             'Authorization': storedToken,
    //             'content-type': 'application/x-www-form-urlencoded'
    //         },
    //         success: function (res) {
    //             console.log(res.data);
    //             const allComments = res.data.reduce((acc, curr) => {
    //                 return acc.concat(curr.comments);
    //             }, []);
    //             setComments(allComments);
    //             console.log('comments', comments);
    //         },
    //         fail: function (error) {
    //             console.error('failed:', error);
    //         }
    //     });
    // }
    return (
        <ScrollView scrollY style={{ height: 'calc(100vh - 50px)' }}>
            <View>
                {comments.length === 0 ? (
                    <View style={{ textAlign: 'center', marginTop: '20px', color: '#999' }}>
                        暂无评论
                    </View>
                ) : (
                        comments.map((comment, index) => (
                            <AtCard
                                title={comment.username}
                                renderIcon={<AtAvatar circle image={comment.avatar} size='large'></AtAvatar>}
                                key={index} // 把 key 移到 AtCard 上
                                onClick={async () => {
                                    const storedToken = wx.getStorageSync('token');
                                    const data = {
                                        id: comment.id,
                                    };
                                    await wx.request({
                                        url: `http://192.168.1.103:3007/my/task/passTaskByTaskId`,
                                        method: 'POST',
                                        data: data,
                                        header: {
                                            'Authorization': storedToken,
                                            'content-type': 'application/x-www-form-urlencoded'
                                        },
                                        success: function (res) {
                                            console.log(res.data.data[0]);
                                            const queryParams = JSON.stringify(res.data.data[0]);
                                            console.log('avatar',comment.avatar);
                                            Taro.navigateTo({ url: `/pages/detail/detail?params=${queryParams}` });
                                        },
                                        fail: function (error) {
                                            console.error('failed:', error);
                                        }
                                    });
                                }}
                            >
                                {comment.content}
                            </AtCard>
                        ))
                    )}
            </View>
        </ScrollView>
    )
}