import My from '@/components/my/my'
import MyTravel from '@/components/mytravel/mytravel'
import PublishTravel from '@/components/publishtravel/publishtravel'
import TravelList from '@/components/travellist/travellist'
import { View, Text } from '@tarojs/components'
import { useLoad } from '@tarojs/taro'
import React, { useState } from 'react'
import { AtTabBar } from 'taro-ui'
import './index.scss'



export default function Index() {
    const [current, setCurrent] = useState(0); // 使用 useState 定义当前选中的标签页索引
    
    const handleClick = (index) => {
        setCurrent(index); // 更新当前选中的标签页索引
    };
    let content;
    switch (current) {
        case 0:
            content = <TravelList />;
            break;
        case 1:
            content = <PublishTravel />;
            break;
        case 2:
            content = <MyTravel />;
            break;
        case 3:
            content = <My />;
            break;
        default:
            content = null;
    }
    useLoad(() => {
        console.log('Page loaded.')
    })

    return (
        <View className='index'>
            {content}
            <AtTabBar
                fixed
                tabList={[
                    { title: '游记列表', iconType: 'bullet-list'  },
                    { title: '游记发布', iconType: 'camera' },
                    { title: '我的游记', iconType: 'home' },
                    { title: '我的',iconType: 'user' },
                ]}
                onClick={handleClick}
                current={current}
            />
        </View>
    )
}
