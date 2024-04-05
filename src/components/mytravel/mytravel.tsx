import { View, Text, Button, ScrollView, Textarea, Video } from '@tarojs/components'
import Taro, { clearStorageSync } from '@tarojs/taro';
import React, { useState, useEffect } from 'react'
import { AtImagePicker, AtCard, AtModal, AtModalAction, AtModalContent, AtModalHeader, AtInput, AtAvatar, AtButton, AtTag } from 'taro-ui'
import baseUrl from '../baseUrl';
import './mytravel.scss'
export default function MyTravel({ setCurrent }) {
    const [travelData, setTravelData] = useState([]);
    const [textValue, setTextValue] = useState('');
    const [titleValue, setTitleValue] = useState('');
    const [isOpenModal, setIsOpenModal] = useState(false);
    const [oldFiles, setOldFiles] = useState([]);
    const [files, setFiles] = useState([]);
    const [query, setQuery] = useState({});
    const [currentId, setCurrentId] = useState(0);
    const [oldVideoFile, setOldVideoFile] = useState('');
    const [videoFile, setVideoFile] = useState('');
    const [isOpenDeleteModal, setIsOpenDeleteModal] = useState(false);
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
        console.log(selectedTravel);
        setFiles(filesData);
        setOldFiles(filesData);
        setTitleValue(selectedTravel.title);
        setTextValue(selectedTravel.text);
        if(selectedTravel.video_urls !== null && selectedTravel.video_urls.length !== 0   ){
            setVideoFile(selectedTravel.video_urls[0]);
            setOldVideoFile(selectedTravel.video_urls[0]);
        }else{
            setVideoFile('');
            setOldVideoFile('');
        }
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
        setOldVideoFile('');
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

        // 存储上传操作的 Promise
        const uploadPromises = [];

        if (removeFiles.length !== 0) {
            const files_url = removeFiles.map(file => file.url);
            const data = {
                id: currentId,
                files: files_url,
            };
            const removePromise = new Promise((resolve, reject) => {
                wx.request({
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
                            resolve();
                        }
                    },
                    fail: function (error) {
                        console.error('failed:', error);
                        reject(error);
                    }
                });
            });
            uploadPromises.push(removePromise);
        }

        const newFiles = files.filter(file => !oldFiles.some(oldFile => oldFile.url === file.url));
        console.log('添加的图片', newFiles);

        if (newFiles.length !== 0) {
            const header = {
                'Authorization': storedToken,
                'Content-Type': 'multipart/form-data' // 设置请求头的 Content-Type
            };

            const formData = {
                username: wx.getStorageSync('username'),
                textValue: textValue,
                titleValue: titleValue,
                is_add: 'false',
                id: currentId,
            };

            // 循环上传文件
            newFiles.forEach((file, index) => {
                const uploadFilePromise = new Promise((resolve, reject) => {
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
                                    resolve();
                                },
                                fail(error) {
                                    console.error('Error:', error);
                                    reject(error);
                                }
                            });
                        },
                        fail: (error) => {
                            console.error('Error:', error);
                            reject(error);
                        }
                    });
                });
                uploadPromises.push(uploadFilePromise);
            });
        }

        // 检查视频上传
        if (videoFile === oldVideoFile) {
            console.log('未选择视频');
        } else {
            if (!videoFile && oldVideoFile) {
                console.log('删除视频');
                const deleteVideoPromise = new Promise((resolve, reject) => {
                    const data = {
                        id: currentId,
                    };
                    wx.request({
                        url: `${baseUrl.baseUrl}my/task/deleteVideo`,
                        method: 'POST',
                        data: data,
                        header: {
                            'Authorization': storedToken,
                            'content-type': 'application/x-www-form-urlencoded',
                        },
                        success(res) {
                            if (res.data.message === '删除视频成功') {
                                console.log('删除视频成功');
                            }else{
                                console.log('删除视频失败');
                            }
                            setVideoFile('');
                            setOldVideoFile('');
                            resolve();
                        },
                        fail(error) {
                            console.error('视频删除失败:', error);
                            reject(error);
                        }
                    });
                });
                uploadPromises.push(deleteVideoPromise);
            }else{
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
                console.log('oldvideo', oldVideoFile);
                const uploadVideoPromise = new Promise((resolve, reject) => {
                    wx.uploadFile({
                        url: `${baseUrl.baseUrl}my/task/video`,
                        filePath: videopath, // 文件的临时路径
                        name: `file`, // 后端需要的文件字段名
                        formData: formData, // 其他表单数据
                        header: header,
                        success(response) {
                            console.log(response.data);
                            setVideoFile('');
                            setOldVideoFile('');
                            resolve();
                        },
                        fail(error) {
                            console.error('Error:', error);
                            reject(error);
                        }
                    });
                });
                uploadPromises.push(uploadVideoPromise);
            }
        }

        // 使用 Promise.all() 来检测所有上传操作是否成功
        Promise.all(uploadPromises)
            .then(() => {
                Taro.showToast({
                    title: '游记更新成功',
                    icon: 'success',
                    duration: 1000
                });
                setQuery({});
                setIsOpenModal(false); // 关闭 Modal
                console.log('所有上传成功！');
            })
            .catch((error) => {
                // 如果有任何一个上传操作失败，可以在这里处理失败逻辑
                console.error('上传失败:', error);
                // 可以选择适当的方式提示用户上传失败
            });
    };
    
    const handleDelete = (id) => {
        setCurrentId(id);
        setIsOpenDeleteModal(true);
    }
    const handleTextButtonClick = () => {
        setCurrent(1);
    };
    const handleCancelVideo = () => {
        setVideoFile(''); 
    };
    const handleCancelDelete = () => {
        setCurrentId(0);
        setIsOpenDeleteModal(false);
    }
    const handleConfirmDelete = async () => {
        const storedToken = wx.getStorageSync('token');
        const data = {
            id: currentId,
        };
        await wx.request({
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
                    Taro.showToast({
                        title: '删除成功',
                        icon: 'success',
                        duration: 1000 // 可根据需要调整显示时间
                    });
                    setQuery({});
                }
            },
            fail: function (error) {
                console.error('failed:', error);
                return;
            }
        });
        setCurrentId(0);
        setIsOpenDeleteModal(false);
    }
    return (
        <ScrollView scrollY style={{ height: 'calc(100vh - 50px)' }}>
            <View>
                {/* 遍历显示用户游记 */}
                <View style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50px' }}>
                    <Text style={{ fontSize: '15px' }}>我的</Text>
                    <View style={{ position: 'absolute', right: '20px' }}>
                        <Text style={{ fontSize: '16px', color: 'blue' }} onClick={handleTextButtonClick}>+新增</Text>
                    </View>
                </View>
                {travelData.map((travel, index) => (
                    <AtCard
                        title={travel.title}
                        renderIcon={<AtAvatar circle image={travel.pic_urls[0]} size='large'></AtAvatar>}
                        key={index} // 把 key 移到 AtCard 上
                    >
                        <View >

                            {/* <img src={travel.pic_urls[0]} style={{ width: '100%', height: '200px' }} /> */}
                            <View style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <View>
                                    {travel.status === '已拒绝' && (
                                        <AtTag type='primary' circle className='rejected-tag'>{travel.status}</AtTag>
                                    )}
                                    {travel.status === '待审核' && (
                                        <AtTag type='primary' circle className='pending-tag'>{travel.status}</AtTag>
                                    )}
                                    {travel.status === '已通过' && (
                                        <AtTag type='primary' circle className='approved-tag'>{travel.status}</AtTag>
                                    )}
                                    {travel.status === '已拒绝' && (
                                        <View style={{ color: 'red' }}>拒绝原因: {travel.rejection_reason}</View>
                                    )}
                                </View>
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
                                <AtCard title='选择视频' note='旧视频会被覆盖'>
                                    <View>
                                        <AtButton onClick={handleChooseVideo}>选择视频</AtButton>
                                        {videoFile ? <AtButton onClick={handleCancelVideo}>取消选择</AtButton> : null}
                                        <AtTag
                                            customStyle={{ backgroundColor: videoFile ? '#13CE66' : '#1890ff', color: '#fff' }}
                                            circle
                                        >
                                            {videoFile ? '已有视频' : '无视频'}
                                        </AtTag>
                                    </View>
                                </AtCard>
                                <View style={{ padding: '20px', textAlign: 'center' }}>
                                    <AtButton onClick={handleUpload}>上传</AtButton>
                                    <AtButton onClick={handleCancelModal}>取消</AtButton>
                                </View>
                            </View>
                        </ScrollView>
                    </AtModalContent>
                </AtModal>
                <AtModal isOpened={isOpenDeleteModal} closeOnClickOverlay={false}>
                    <AtModalHeader>确认删除</AtModalHeader>
                    <AtModalContent>
                        是否确认删除该游记？
                    </AtModalContent>
                    <AtModalAction>
                        <AtButton onClick={handleCancelDelete}>取消</AtButton>
                        <AtButton onClick={handleConfirmDelete}>确认</AtButton>
                    </AtModalAction>
                </AtModal>
            </View>
        </ScrollView>
    );
}