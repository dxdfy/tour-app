import { View, Text, ScrollView } from '@tarojs/components'
import React, { useState, useEffect } from 'react'
import TravelCard from './travelcard';
import './travellist.scss'
import Taro, { usePullDownRefresh, useReachBottom } from '@tarojs/taro';
import { AtSearchBar } from 'taro-ui'
import Paging from './paging';
import baseUrl from '../baseUrl';

// const list = [{
//     id: 1,
//     name: 'xianxian',
//     title: '哪一本书让你至今印象深刻',
//     text: '想知道你们最喜欢的书籍或者是对自己最有帮助的书籍',
//     status: '已通过',
//     is_delete: 0,
//     rejection_reason: '',
//     pic_urls: ["http://127.0.0.1:3007/public/upload/1711704209860-Up8PzSz0rkiOc6dcb61719972908f1bc823a27d91304.png", "http://127.0.0.1:3007/public/upload/1711704209871-xF0F8mTIhhQQcad6642e2f7ac44de4290bc13706789b.png"],
//     avatar: 'http://127.0.0.1:3007/public/upload/1711703879138-EnLxfaT9WMMl744c2ca944b4001d1a05ba4184354df1.jpeg'
// }]
export default function TravelList() {
    const [list, setList] = useState([{
        id: 1,
        name: 'xianxian',
        title: '哪一本书让你至今印象深刻',
        text: '想知道你们最喜欢的书籍或者是对自己最有帮助的书籍',
        status: '已通过',
        is_delete: 0,
        rejection_reason: '',
        pic_urls: ["http://127.0.0.1:3007/public/upload/1711704209860-Up8PzSz0rkiOc6dcb61719972908f1bc823a27d91304.png", "http://127.0.0.1:3007/public/upload/1711704209871-xF0F8mTIhhQQcad6642e2f7ac44de4290bc13706789b.png"],
        avatar: 'http://127.0.0.1:3007/public/upload/1711703879138-EnLxfaT9WMMl744c2ca944b4001d1a05ba4184354df1.jpeg'
    }])
    const [leftlist, setLeftList] = useState([])
    const [rightlist, setRightList] = useState([])
    const [searchlist, setSearchList] = useState([])
    const [loading, setLoading] = useState(false);
    const [paging, setPaging] = useState(new Paging({
        url: `${baseUrl.baseUrl}my/task/passcates`
    }))
    // const paging = new Paging({
    //     url: 'http://127.0.0.1:3007/my/task/passcates'
    // })
    const [searchvalue, setSearchValue] = useState('')
    async function fetchData() {
        // 在组件加载时发起请求
        const data = await paging.getMoreData();
        // console.log(5);
        // console.log(data);
        if (data) {
            setList(data);
            const queryheightlist = [];
            for (let i = 0; i < data.length; i++) {
                queryheightlist.push(data[i].pic_urls[0]);
            }
            // console.log(queryheightlist)
            const storedToken = wx.getStorageSync('token');
            // 构建请求的数据对象
            const requestData = {
                data: JSON.stringify(queryheightlist.map(url => url.replace('http://127.0.0.1:3007/', '')))
            };
            // console.log(storedToken)
            // console.log(requestData)
            // 设置请求头部
            const header = {
                'Authorization': storedToken,
                'content-type': 'application/x-www-form-urlencoded'
            };

            // 发送POST请求，并等待响应
            const res = await Taro.request({
                url: 'http://127.0.0.1:3007/my/task/gettaskheight',
                method: 'POST',
                data: requestData,
                header: header
            });
            const heightlist = res.data;
            // console.log(heightlist);
            const leftdata = [];
            const rightdata = [];
            let lefttotalheight = 0;
            let righttotalheight = 0;
            for (let i = 0; i < data.length; i++) {
                if (lefttotalheight > righttotalheight) {
                    rightdata.push(data[i]);
                    righttotalheight += heightlist[i];
                }
                else {
                    leftdata.push(data[i]);
                    lefttotalheight += heightlist[i];
                }
                // console.log(lefttotalheight)
                // console.log(righttotalheight)
            }
            // setSearchList(data)
            // console.log('data', data)
            // console.log('leftdata', leftdata)
            // console.log('rightdata', rightdata)
            setLeftList(leftdata)
            setRightList(rightdata)
        }
        // if (data) {
        //     setList(data);
        //     setSearchList(data);
        // }

    }

    useEffect(() => {

        fetchData();
    }, []); // 依赖为空数组表示只在组件加载时执行一次

    // onReachBottom: function () {
    //     fetchData();
    // }
    // const fetchData = () => {
    //     const storedToken = wx.getStorageSync('token');
    //     Taro.request({
    //         url: 'http://127.0.0.1:3007/my/task/passcates', // 替换为你的接口地址
    //         method: 'GET',
    //         header: {
    //             'Authorization': storedToken
    //         },
    //         success: (res) => {
    //             if (res.data.status === 0) {
    //                 // 请求成功，更新数据
    //                 setList(res.data.data)
    //             } else {
    //                 // 请求失败，处理错误
    //                 console.error('获取数据失败：', res.data.message)
    //             }
    //         },
    //         fail: (err) => {
    //             // 请求失败，处理错误
    //             console.error('请求失败：', err)
    //         }
    //     })
    // }
    useReachBottom(() => {
        // console.log('到达页面底部')
        if (paging.moreData === true) {
            fetchData();
        }
    })
    const changeSearchValue = (value) => {
        setSearchValue(value)
    }
    async function search() {
        // console.log('search')
        // console.log(searchvalue)
        const data = []
        for (let i = 0; i < list.length; i++) {
            if (list[i].name.includes(searchvalue) || list[i].title.includes(searchvalue)) {
                data.push(list[i])
            }
        }
        const queryheightlist = [];
        for (let i = 0; i < data.length; i++) {
            queryheightlist.push(data[i].pic_urls[0]);
        }
        // console.log(queryheightlist)
        const storedToken = wx.getStorageSync('token');
        // 构建请求的数据对象
        const requestData = {
            data: JSON.stringify(queryheightlist.map(url => url.replace('http://127.0.0.1:3007/', '')))
        };
        // console.log(storedToken)
        // console.log(requestData)
        // 设置请求头部
        const header = {
            'Authorization': storedToken,
            'content-type': 'application/x-www-form-urlencoded'
        };

        // 发送POST请求，并等待响应
        const res = await Taro.request({
            url: 'http://127.0.0.1:3007/my/task/gettaskheight',
            method: 'POST',
            data: requestData,
            header: header
        });
        const heightlist = res.data;
        // console.log(heightlist);
        const leftdata = [];
        const rightdata = [];
        let lefttotalheight = 0;
        let righttotalheight = 0;
        for (let i = 0; i < data.length; i++) {
            if (lefttotalheight > righttotalheight) {
                rightdata.push(data[i]);
                righttotalheight += heightlist[i];
            }
            else {
                leftdata.push(data[i]);
                lefttotalheight += heightlist[i];
            }
            // console.log(lefttotalheight)
            // console.log(righttotalheight)
        }
        // setSearchList(data)
        // console.log('data', data)
        // console.log('leftdata', leftdata)
        // console.log('rightdata', rightdata)
        setLeftList(leftdata)
        setRightList(rightdata)
        // console.log(newlist)
        // setSearchList(newlist)
    }
    return (
        <View className='page' >
            <AtSearchBar
                value={searchvalue}
                onChange={(value) => changeSearchValue(value)}
                onActionClick={search}
            />
            <View className='content'>
                <View className='content-left'>
                    {leftlist.map((item, index) => {
                        return <TravelCard key={item.id} {...item} />
                    })}
                </View>
                <View className='content-right'>
                    {rightlist.map((item, index) => {
                        return <TravelCard key={item.id} {...item} />
                    })}
                </View>
            </View>
            {!paging.moreData && <View className='bottom'>~到底啦~</View>}
        </View>
    );
}