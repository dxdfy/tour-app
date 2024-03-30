import { View, Text, ScrollView } from '@tarojs/components'
import React, { useState, useEffect } from 'react'
import TravelCard from './travelcard';
import './travellist.scss'
import Taro, { usePullDownRefresh, useReachBottom } from '@tarojs/taro';
import { AtSearchBar } from 'taro-ui'
import Paging from './paging';

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
    const [searchlist, setSearchList] = useState([])
    const [loading, setLoading] = useState(false);
    const [paging, setPaging] = useState(new Paging({
        url: 'http://127.0.0.1:3007/my/task/passcates'
    }))
    // const paging = new Paging({
    //     url: 'http://127.0.0.1:3007/my/task/passcates'
    // })
    const [searchvalue, setSearchValue] = useState('')
    async function fetchData() {
        // 在组件加载时发起请求
        const data = await paging.getMoreData();
        console.log(5);
        console.log(data);
        if (data) {
            setList(data);
            setSearchList(data);
        }

    }
    useEffect(() => {

        fetchData();

        // const query = Taro.createSelectorQuery();
        // query.select('.content-left').boundingClientRect(rect => {
        //     setLeftHeight(rect[0].height);
        // }).exec();

        // const query2 = Taro.createSelectorQuery();
        // query2.select('.content-right').boundingClientRect(rect => {
        //     setRightHeight(rect[0].height);
        // }).exec();
        // console.log()
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
        console.log('到达页面底部')
        if (paging.moreData === true) {
            fetchData();
        }
    })
    const changeSearchValue = (value) => {
        setSearchValue(value)
    }
    const search = () => {
        console.log('search')
        console.log(searchvalue)
        const newlist = []
        for (let i = 0; i < list.length; i++) {
            if (list[i].name.includes(searchvalue) || list[i].title.includes(searchvalue)) {
                newlist.push(list[i])
            }
        }
        setSearchList(newlist)
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
                    {searchlist.map((item, index) => {
                        if (index % 2 === 0) {
                            return <TravelCard key={index} {...item} />
                        }
                        return null
                    })}
                </View>
                <View className='content-right'>
                    {searchlist.map((item, index) => {
                        if (index % 2 === 1) {
                            return <TravelCard key={index} {...item} />
                        }
                        return null
                    })}
                </View>
            </View>
            {!paging.moreData && <View className='bottom'>~到底啦~</View>}
        </View>
    );
}