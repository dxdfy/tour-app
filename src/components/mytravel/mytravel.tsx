import { View, Text, Button, ScrollView, Textarea } from '@tarojs/components'
import React, { useState, useEffect } from 'react'
import { AtImagePicker, AtCard, AtModal, AtModalAction, AtModalContent, AtModalHeader, AtInput } from 'taro-ui'

export default function MyTravel() {
    const [travelData, setTravelData] = useState([]);
    const [textValue, setTextValue] = useState('');
    const [titleValue, setTitleValue] = useState('');
    const [isOpenModal, setIsOpenModal] = useState(false);
    const [files, setFiles] = useState([]);
    useEffect(async() => {
        const storedToken = wx.getStorageSync('token'); 
        const data = {
            username: wx.getStorageSync('username'),
        };

        await wx.request({
            url:'http://192.168.1.107:3007/my/task/cates',
            method: 'POST',
            data: data,
            header: {
                'Authorization': storedToken,
                'content-type': 'application/x-www-form-urlencoded'
            },
            success: function (res) {
                if(res.data.message === '获取用户游记成功'){
                    setTravelData(res.data.data);
                    console.log(res.data.data);
                }
            },
            fail: function (error) {
                console.error('failed:', error);
            }
        });
        
    }, []); // 空数组作为第二个参数，表示只在组件挂载时调用一次

    const handleEdit = (id) => {
        // 根据id找到对应的游记数据
        const selectedTravel = travelData.find(travel => travel.id === id);
        const filesData = selectedTravel.pic_urls.map(url => ({ url, file: { url } }));
        console.log(filesData);
        setFiles(filesData);
        setTitleValue(selectedTravel.title);
        setTextValue(selectedTravel.text);
        setIsOpenModal(true); // 打开模态框
    };

    const handleCancelModal = () => {
        setIsOpenModal(false); // 关闭模态框
        setTitleValue('');
        setTextValue('');
    };
    const handleTitleChange =(value) => {
        setTitleValue(value);
    };

    const handleTextChange = (event) => {
        setTextValue(event.detail.value);
    };
    const onChange = (newFiles) => {
        setFiles(newFiles);
    };
    const handleUpload = () => {
        // 处理上传操作
    };

    return (
        <ScrollView scrollY style={{ height: '100vh' }}>
            <View>
                {/* 遍历显示用户游记 */}
                {travelData.map((travel, index) => (
                    <View key={index}>
                        <Text>{travel.title}</Text>
                        <Button onClick={() => handleEdit(travel.id)}>编辑</Button>
                    </View>
                ))}

                {/* 编辑模态框 */}
                <AtModal isOpened={isOpenModal} closeOnClickOverlay={false}>
                    <AtModalHeader>编辑游记</AtModalHeader>
                    <AtModalContent>
                        <ScrollView scrollY style={{ height: '60vh' }}>
                            <View>
                                <AtCard title='输入内容'>
                                    <AtInput
                                        name='title'
                                        title='标题'
                                        type='text'
                                        value={titleValue}
                                        onChange={handleTitleChange}
                                        placeholder='请输入标题...'
                                    />
                                    <Textarea
                                        value={textValue}
                                        onInput={handleTextChange}
                                        style={{ width: '100%', minHeight: '100px' }}
                                        placeholder='请输入内容...'
                                        maxlength={2000}
                                    />
                                </AtCard>
                                <AtCard title='选择图片'>
                                    <AtImagePicker
                                        multiple
                                        files={files}
                                        onChange={onChange}
                                    />
                                </AtCard>
                                <View style={{ padding: '20px', textAlign: 'center' }}>
                                    <Button onClick={handleUpload}>上传</Button>
                                    <Button onClick={handleCancelModal}>取消</Button>
                                </View>
                            </View>
                        </ScrollView>
                    </AtModalContent>
                </AtModal>
            </View>
        </ScrollView>
    );
}