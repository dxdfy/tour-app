import { View, Textarea, Button, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import React, { useEffect, useState } from 'react'
import { AtImagePicker, AtCard, AtModal, AtModalAction, AtModalContent, AtModalHeader } from 'taro-ui'
export default function PublishTravel() {
    const [textValue, setTextValue] = useState('');
    const [isOpenModal, setIsOpenModal] = useState(false);
    // const [scrollViewHeight, setScrollViewHeight] = useState(0);
    const [files, setFiles] = useState([
    ]);
    // useEffect(() => {
    //     const {  windowHeight } = Taro.getSystemInfoSync();
    //     setScrollViewHeight( windowHeight);
    // }, []);
    const handleChange = (event) => {
        setTextValue(event.detail.value);
    };


    const onChange = (newFiles) => {
        setFiles(newFiles);
    };

    const onFail = (errMsg) => {
        console.log(errMsg);
    };

    const onImageClick = (index, file) => {
        console.log(index, file);
    };
    const handleUpload = () => {
        setIsOpenModal(true); // 打开 Modal
    };

    const handleCancelUpload = () => {
        setIsOpenModal(false); // 关闭 Modal
    };

    const handleConfirmUpload = () => {
        console.log(files);
        console.log(textValue);
        const storedToken = wx.getStorageSync('token'); // 使用 wx.getStorageSync 获取本地存储的 token
        console.log(storedToken);
        // 设置请求头中的 Authorization
        wx.request({
            url: 'http://127.0.0.1:3007/my/task/cates',
            method: 'GET',
            header: {
                'Authorization': storedToken
            },
            success(response) {
                console.log(response.data);
                // 根据 query.name 进行筛选
                let filteredData = response.data.data;
                console.log(filteredData);

            },
            fail(error) {
                console.error('Error:', error);
            }
        });
        setIsOpenModal(false); // 关闭 Modal
        // 在这里执行上传操作
    };
    return (
        <ScrollView scrollY style={{ height: '100vh' }}>
            <View>
                <AtCard title='输入内容'>
                    <Textarea
                        value={textValue}
                        onInput={handleChange}
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
                        onFail={onFail}
                        onImageClick={onImageClick}
                    />
                </AtCard>
                <View style={{ padding: '20px', textAlign: 'center' }}>
                    <Button onClick={handleUpload}>上传</Button>
                </View>
                <AtModal isOpened={isOpenModal} closeOnClickOverlay={false}>
                    <AtModalHeader>确认上传</AtModalHeader>
                    <AtModalContent>
                        是否确认上传内容？
                </AtModalContent>
                    <AtModalAction>
                        <Button onClick={handleCancelUpload}>取消</Button>
                        <Button onClick={handleConfirmUpload}>确认</Button>
                    </AtModalAction>
                </AtModal>
            </View>
        </ScrollView>
    );
}