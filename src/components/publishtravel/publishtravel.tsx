import { View, Textarea, Button, ScrollView, Input } from '@tarojs/components'
import Taro from '@tarojs/taro'
import React, { useEffect, useState } from 'react'
import { AtImagePicker, AtCard, AtModal, AtModalAction, AtModalContent, AtModalHeader, AtInput , AtTag, AtButton } from 'taro-ui'
import baseUrl from '../baseUrl';
export default function PublishTravel({ setCurrent }) {
    const [textValue, setTextValue] = useState('');
    const [titleValue, setTitleValue] = useState('');
    const [isOpenModal, setIsOpenModal] = useState(false);
    const [videoFile, setVideoFile] = useState('');
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
    const handleTitleChange = (value) => {
        setTitleValue(value);
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
    const uploadFiles = (files, formData, header) => {
        return new Promise<void>((resolve, reject) => {
            // 上传文件
            files.forEach((file, index) => {
                wx.compressImage({
                    src: file.url,
                    quality: 80,
                    success: (res) => {
                        const compressedFilePath = res.tempFilePath;
                        wx.uploadFile({
                            url: `${baseUrl.baseUrl}my/task/add`,
                            filePath: compressedFilePath, // 文件的临时路径
                            name: `file`, // 后端需要的文件字段名
                            formData: formData, // 其他表单数据
                            header: header,
                            success(response) {
                                const responseData = JSON.parse(response.data);
                                console.log(responseData.message);
                                if (responseData.message === '新增游记成功') {
                                    resolve(); // 文件上传成功且消息为 "新增游记成功"，resolve Promise
                                }
                                else if (responseData.message === '已有该标题的游记,请前往我的游记进行编辑') {
                                    Taro.showToast({
                                        title: '已有该标题的游记,请前往我的游记进行编辑',
                                        icon: 'none',
                                        duration: 1000
                                    });
                                    setIsOpenModal(false);
                                }
                                else {
                                    reject(new Error('新增游记失败')); // 消息不是 "新增游记成功"，reject Promise
                                }
                            },
                            fail(error) {
                                console.error('Error:', error);
                                reject(error); // 文件上传失败后，reject Promise
                            }
                        });
                    },
                    fail: (error) => {
                        console.error('Error:', error);
                    }
                });
            });
        });
    };
    const handleConfirmUpload = async () => {
        console.log(files);
        console.log(textValue);
        console.log(titleValue);
        if (files.length === 0 || textValue === '' || titleValue === '') {
            // 弹出提示框
            Taro.showToast({
                title: '标题、内容和图片不能为空',
                icon: 'none',
                duration: 1000 // 可根据需要调整显示时间
            });
            return; // 中止函数执行
        }
        const storedToken = wx.getStorageSync('token'); // 使用 wx.getStorageSync 获取本地存储的 token
        // console.log(storedToken);
        const header = {
            'Authorization': storedToken,
            'Content-Type': 'multipart/form-data' // 设置请求头的 Content-Type
        };

        // 构造文件上传的 formData
        const formData = {
            username: wx.getStorageSync('username'),
            textValue: textValue,
            titleValue: titleValue,
            is_add: 'true',
        };

        try {
            // 上传文件，并等待文件上传完成
            await uploadFiles(files, formData, header);

            // 文件上传完成后，执行视频上传操作
            if (!videoFile) {
                console.log('未选择视频');
                Taro.showToast({
                    title: '上传成功',
                    icon: 'success',
                    duration: 1000 
                });
                setIsOpenModal(false);
                setCurrent(2);
            } else {
                const videopath = videoFile;
                console.log('video', videoFile);
                wx.uploadFile({
                    url: `${baseUrl.baseUrl}my/task/video`,
                    filePath: videopath, // 文件的临时路径
                    name: `file`, // 后端需要的文件字段名
                    formData: formData, // 其他表单数据
                    header: header,
                    success(response) {
                        console.log(response.data);
                    },
                    fail(error) {
                        console.error('Error:', error);
                    }
                });
            }
            Taro.showToast({
                title: '上传成功',
                icon: 'success',
                duration: 1000
            });
            setIsOpenModal(false); // 关闭 Modal
            setCurrent(2);
        } catch (error) {
            console.error('Error:', error);
            // 处理上传失败的情况
        }
    };
    
    const handleChooseVideo = async () => {
        Taro.showLoading({ title: '加载中...', mask: true }); // 显示加载状态
        try {
            const res = await Taro.chooseVideo({
                sourceType: ['album', 'camera'],
                compressed: true,
                maxDuration: 60,
                camera: 'back',
                success: (res) => {
                    setVideoFile(res.tempFilePath);
                    console.log('选择视频');
                },
                fail: (err) => {
                    console.error('选择视频失败', err);
                },
            });
        } catch (error) {
            console.error('选择视频失败', error);
        } finally {
            Taro.hideLoading(); // 隐藏加载状态
        }
    };
    const handleCancelVideo = () => {
        setVideoFile(''); 
    };
    

    return (
        <ScrollView scrollY style={{
            height: 'calc(100vh - 50px)',
            backgroundColor: '#f0f0f0',
        }}>
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
                <AtCard title='选择视频(可选项)'>
                    <View>
                        <AtButton onClick={handleChooseVideo}>选择视频</AtButton>
                        <View style={{ textAlign: 'center' }}>
                        {videoFile ? <AtButton onClick={handleCancelVideo}>取消选择</AtButton> : null}
                            <AtTag
                                customStyle={{ backgroundColor: videoFile ? '#13CE66' : '#1890ff', color: '#fff' }}
                                circle
                            >
                                {videoFile ? '已选择' : '未选择'}
                            </AtTag>
                        </View>
                    </View>
                </AtCard>
                <View style={{ padding: '20px', textAlign: 'center' }}>
                    <AtButton onClick={handleUpload}>上传</AtButton>
                </View>
                <AtModal isOpened={isOpenModal} closeOnClickOverlay={false}>
                    <AtModalHeader>确认上传</AtModalHeader>
                    <AtModalContent>
                        是否确认上传内容？
                    </AtModalContent>
                    <AtModalAction>
                        <AtButton onClick={handleCancelUpload}>取消</AtButton>
                        <AtButton onClick={handleConfirmUpload}>确认</AtButton>
                    </AtModalAction>
                </AtModal>
            </View>
        </ScrollView>
    );
}