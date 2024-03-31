import { View, Text, Button, ScrollView, Textarea, Video } from '@tarojs/components'
import Taro, { clearStorageSync } from '@tarojs/taro';
import React, { useState, useEffect } from 'react'
import { AtImagePicker, AtCard, AtModal, AtModalAction, AtModalContent, AtModalHeader, AtInput, AtAvatar, AtButton, AtTag } from 'taro-ui'
import baseUrl from '../baseUrl';

export default function MyTravel() {
    const [travelData, setTravelData] = useState([]);
    const [textValue, setTextValue] = useState('');
    const [titleValue, setTitleValue] = useState('');
    const [isOpenModal, setIsOpenModal] = useState(false);
    const [oldFiles, setOldFiles] = useState([]);
    const [files, setFiles] = useState([]);
    const [query, setQuery] = useState({});
    const [currentId, setCurrentId] = useState(0);
    const [videoFile, setVideoFile] = useState('');
    useEffect(() => {
        const storedToken = wx.getStorageSync('token');
        const data = {
            username: wx.getStorageSync('username'),
        };

        wx.request({
            url: `${baseUrl.baseUrl}my/task/cates`,
            method: 'POST',
            data: data,
            header: {
                'Authorization': storedToken,
                'content-type': 'application/x-www-form-urlencoded'
            },
            success: function (res) {
                if (res.data.message === '获取用户游记成功') {
                    setTravelData(res.data.data);
                    console.log(res.data.data);
                }
            },
            fail: function (error) {
                console.error('failed:', error);
            }
        });

    }, [query]); // 空数组作为第二个参数，表示只在组件挂载时调用一次

    const handleEdit = (id) => {
        // 根据id找到对应的游记数据
        const selectedTravel = travelData.find(travel => travel.id === id);
        const filesData = selectedTravel.pic_urls.map(url => ({ url, file: { url } }));
        console.log(filesData);
        setFiles(filesData);
        setOldFiles(filesData);
        setTitleValue(selectedTravel.title);
        setTextValue(selectedTravel.text);
        setCurrentId(id);
        setIsOpenModal(true); // 打开模态框
    };

    const handleCancelModal = () => {
        setIsOpenModal(false); // 关闭模态框
        setTitleValue('');
        setTextValue('');
        setFiles([]);
        setOldFiles([]);
        setVideoFile('');
    };
    const handleTitleChange = (value) => {
        setTitleValue(value);
    };

    const handleTextChange = (event) => {
        setTextValue(event.detail.value);
    };
    const onChange = (newFiles) => {
        setFiles(newFiles);
    };
    const handleChooseVideo = async () => {
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
    };


    const handleUpload = async () => {
        // 处理上传操作
        if (files.length === 0 || textValue === '' || titleValue === '') {
            // 弹出提示框
            Taro.showToast({
                title: '标题、内容和图片不能为空',
                icon: 'none',
                duration: 1000
            });
            return; // 中止函数执行
        }
        const storedToken = wx.getStorageSync('token');
        const removeFiles = oldFiles.filter(oldfile => !files.some(File => File.url === oldfile.url));
        console.log('remove files:', removeFiles);
        if (removeFiles.length !== 0) {
            const files_url = removeFiles.map(file => file.url);
            const data = {
                id: currentId,
                files: files_url,
            };
            await wx.request({
                url: `${baseUrl.baseUrl}my/task/remove`,
                method: 'POST',
                data: data,
                header: {
                    'Authorization': storedToken,
                    'content-type': 'application/x-www-form-urlencoded'
                },
                success: function (res) {
                    if (res.data.message === '删除游记图片成功') {
                        console.log('删除成功');
                        setQuery({});
                    }
                },
                fail: function (error) {
                    console.error('failed:', error);
                    return;
                }
            });

        }
        const newFiles = files.filter(file => !oldFiles.some(oldFile => oldFile.url === file.url));
        console.log('添加的图片', newFiles)
        if (newFiles.length !== 0) {
            const header = {
                'Authorization': storedToken,
                'Content-Type': 'multipart/form-data' // 设置请求头的 Content-Type
            };

            // 构造文件上传的 formData
            const formData = {
                username: wx.getStorageSync('username'),
                textValue: textValue,
                titleValue: titleValue,
                is_add: 'false',
                id: currentId,
            };

            // 上传文件
            newFiles.forEach((file, index) => {
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
                                console.log(response.data);
                                setQuery({});
                            },
                            fail(error) {
                                console.error('Error:', error);
                            }
                        });
                    },
                    fail: (error) => {
                        console.error('Error:', error);
                    }
                });
            });

        }
        if (newFiles.length === 0 && removeFiles.length === 0) {
            const data = {
                id: currentId,
                text: textValue,
                title: titleValue
            };
            wx.request({
                url: `${baseUrl.baseUrl}my/task/update_txt`,
                method: 'POST',
                data: data,
                header: {
                    'Authorization': storedToken,
                    'content-type': 'application/x-www-form-urlencoded'
                },
                success: function (res) {
                    if (res.data.message === '更新游记文本信息成功') {
                        console.log('更新文本信息成功');
                        setQuery({});
                    }
                },
                fail: function (error) {
                    console.error('failed:', error);
                    return;
                }
            });
        }
        if (!videoFile) {
            console.log('未选择视频');
        } else {
            const header = {
                'Authorization': storedToken,
                'Content-Type': 'multipart/form-data' // 设置请求头的 Content-Type
            };
            const formData = {
                username: wx.getStorageSync('username'),
                titleValue: titleValue,
            };
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
                    setVideoFile('');
                },
                fail(error) {
                    console.error('Error:', error);
                }
            });
        }

        setIsOpenModal(false); // 关闭 Modal
        // console.log(storedToken);

    };
    const handleDelete = (id) => {
        const storedToken = wx.getStorageSync('token');
        const data = {
            id: id,
        };
        wx.request({
            url: `${baseUrl.baseUrl}my/task/delete`,
            method: 'POST',
            data: data,
            header: {
                'Authorization': storedToken,
                'content-type': 'application/x-www-form-urlencoded'
            },
            success: function (res) {
                if (res.data.message === '删除成功') {
                    console.log('删除成功');
                    setQuery({});
                }
            },
            fail: function (error) {
                console.error('failed:', error);
                return;
            }
        });
    }

    return (
        <ScrollView scrollY style={{ height: 'calc(100vh - 100px)' }}>
            <View>
                {/* 遍历显示用户游记 */}
                {travelData.map((travel, index) => (
                    <AtCard
                        title={travel.title}
                        key={index} // 把 key 移到 AtCard 上
                    >
                        <View >
                            <AtAvatar circle image={travel.pic_urls[0]} size='large'></AtAvatar>
                            {/* <img src={travel.pic_urls[0]} style={{ width: '100%', height: '200px' }} /> */}
                            <View style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <AtTag type='primary' circle>{travel.status}</AtTag>
                                {/* <View>
                                    <Video
                                        src='http://192.168.137.1:3007/public/upload/1711778097508-KLsAvABtStvc025001d967bc36eac1a16c94cd538dbb.mp4' // 视频地址，需要替换成实际的视频地址
                                        controls // 显示视频控制按钮
                                    />
                                </View> */}
                                <View style={{ display: 'flex' }}>
                                    <AtButton type='primary' onClick={() => handleEdit(travel.id)}>编辑</AtButton>
                                    <AtButton type='primary' onClick={() => handleDelete(travel.id)}>删除</AtButton>
                                </View>
                            </View>
                        </View>
                    </AtCard>
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
                                <AtCard title='选择视频' note='会覆盖旧视频'>
                                    <View>
                                        <AtButton onClick={handleChooseVideo}>选择视频</AtButton>
                                    </View>
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