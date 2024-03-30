import { View, Text, Button, ScrollView, Textarea } from '@tarojs/components'
import React, { useState, useEffect } from 'react'
import { AtImagePicker, AtCard, AtModal, AtModalAction, AtModalContent, AtModalHeader, AtInput ,AtAvatar, AtButton, AtTag} from 'taro-ui'

export default function MyTravel() {
    const [travelData, setTravelData] = useState([]);
    const [textValue, setTextValue] = useState('');
    const [titleValue, setTitleValue] = useState('');
    const [isOpenModal, setIsOpenModal] = useState(false);
    const [oldFiles, setOldFiles] = useState([]);
    const [files, setFiles] = useState([]);
    const [query, setQuery] = useState({});
    useEffect(() => {
        const storedToken = wx.getStorageSync('token');
        const data = {
            username: wx.getStorageSync('username'),
        };

        wx.request({
            url: 'http://127.0.0.1:3007/my/task/cates',
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
        setIsOpenModal(true); // 打开模态框
    };

    const handleCancelModal = () => {
        setIsOpenModal(false); // 关闭模态框
        setTitleValue('');
        setTextValue('');
        setFiles([]);
        setOldFiles([]);
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
    const removeAndUploadFiles = async () => {
        // 移除图片操作
        const newFiles = oldFiles.filter(oldfile => !files.some(File => File.url === oldfile.url));
        const files_url = newFiles.map(file => file.url);
        console.log('New files:', newFiles);
        const storedToken = wx.getStorageSync('token');
        const data = {
            username: wx.getStorageSync('username'),
            title: titleValue,
            files: files_url,
        };

        try {
            const removeResponse = await wx.request({
                url: 'http://127.0.0.1:3007/my/task/remove',
                method: 'POST',
                data: data,
                header: {
                    'Authorization': storedToken,
                    'content-type': 'application/x-www-form-urlencoded'
                }
            });
            if (removeResponse.data.message === '删除游记图片成功') {
                console.log('删除成功');
                setQuery({});
            }
        } catch (error) {
            console.error('删除游记图片请求失败:', error);
            return; // 如果删除请求失败，就不执行上传文件的操作
        }

        // 构造文件上传的 formData
        const formData = {
            username: wx.getStorageSync('username'),
            textValue: textValue,
            titleValue: titleValue,
        };

        // 上传文件操作
        const header = {
            'Authorization': storedToken,
            'Content-Type': 'multipart/form-data'
        };

        // 将上传文件的操作封装成 Promise
        const uploadFilePromises = files.map((file, index) => {
            return new Promise((resolve, reject) => {
                wx.uploadFile({
                    url: 'http://127.0.0.1:3007/my/task/add',
                    filePath: file.url,
                    name: `file`,
                    formData: formData,
                    header: header,
                    success(response) {
                        console.log(response.data);
                        setQuery({});
                        resolve(response);
                    },
                    fail(error) {
                        console.error('上传文件失败:', error);
                        reject(error);
                    }
                });
            });
        });

        // 等待所有上传文件的 Promise 执行完成
        await Promise.all(uploadFilePromises);
    };
    const handleUpload = async () => {
        // 处理上传操作
        const newFiles = oldFiles.filter(oldfile => !files.some(File => File.url === oldfile.url));
        const files_url = newFiles.map(file => file.url);
        console.log('New files:', newFiles);
        const storedToken = wx.getStorageSync('token');
        const data = {
            username: wx.getStorageSync('username'),
            title: titleValue,
            files: files_url,
        };

        await wx.request({
            url: 'http://127.0.0.1:3007/my/task/remove',
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
        };

        // 上传文件
        files.forEach((file, index) => {
            wx.uploadFile({
                url: 'http://127.0.0.1:3007/my/task/add',
                filePath: file.url, // 文件的临时路径
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
        });
    };
    const handleDelete = () => {

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