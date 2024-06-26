import { View, Text, ScrollView } from '@tarojs/components'
import React, { useState, useEffect } from 'react'
import TravelCard from './travelcard';
import './travellist.scss'
import Taro, { usePullDownRefresh, useReachBottom } from '@tarojs/taro';
import { AtSearchBar } from 'taro-ui'
import Paging from './paging';
import baseUrl from '../baseUrl';

export default function TravelList() {
    const [list, setList] = useState([{
        id: 1,
        name: 'xianxian',
        title: '哪一本书让你至今印象深刻',
        text: '想知道你们最喜欢的书籍或者是对自己最有帮助的书籍',
        status: '已通过',
        is_delete: 0,
        rejection_reason: '',
        pic_urls: ["http://192.168.1.105:3007/public/upload/1711704209860-Up8PzSz0rkiOc6dcb61719972908f1bc823a27d91304.png", "http://192.168.1.105:3007/public/upload/1711704209871-xF0F8mTIhhQQcad6642e2f7ac44de4290bc13706789b.png"],
        avatar: 'http://192.168.1.105:3007/public/upload/1711703879138-EnLxfaT9WMMl744c2ca944b4001d1a05ba4184354df1.jpeg'
    }])
    const [leftlist, setLeftList] = useState([])
    const [rightlist, setRightList] = useState([])
    const [searchlist, setSearchList] = useState([])
    const [loading, setLoading] = useState(false);
    const [paging, setPaging] = useState(new Paging({
        url: `${baseUrl.baseUrl}my/task/passcates`
    }))
    const [searchvalue, setSearchValue] = useState('')
    async function fetchData() {
        // 在组件加载时发起请求
        const data = await paging.getMoreData();
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
                data: JSON.stringify(queryheightlist.map(url => url.replace(/^http:\/\/.*:3007\//, '')))
            };
            // 设置请求头部
            const header = {
                'Authorization': storedToken,
                'content-type': 'application/x-www-form-urlencoded'
            };

            // 发送POST请求，并等待响应
            const res = await Taro.request({
                url: `${baseUrl.baseUrl}my/task/gettaskheight`,
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
    
            }

            setLeftList(leftdata)
            setRightList(rightdata)
        }
    }

    useEffect(() => {

        fetchData();
    }, []); // 依赖为空数组表示只在组件加载时执行一次
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
            data: JSON.stringify(queryheightlist.map(url => url.replace(/^http:\/\/.*:3007\//, '')))
        };
        // 设置请求头部
        const header = {
            'Authorization': storedToken,
            'content-type': 'application/x-www-form-urlencoded'
        };

        // 发送POST请求，并等待响应
        const res = await Taro.request({
            url: `${baseUrl.baseUrl}my/task/gettaskheight`,
            method: 'POST',
            data: requestData,
            header: header
        });
        const heightlist = res.data;
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
        setLeftList(leftdata)
        setRightList(rightdata)
    }
    function reachBottom() {
        console.log('到达底部1')
        if (paging.moreData === true) {
            fetchData();
            search();
        }
    }
    return (
        <View>
            <AtSearchBar className='search'
                value={searchvalue}
                onChange={(value) => changeSearchValue(value)}
                onActionClick={search}
            />
            <ScrollView scrollY style={{ height: 'calc(100vh - 125px)' }} onScrollToLower={reachBottom}   >
                {/* <ScrollView scrollY style={{ height: 'calc(100vh - 50px)' }} onScrollToLower={reachBottom}> */}
                <View className='travellist'>

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
            </ScrollView>
        </View>
    );
}


